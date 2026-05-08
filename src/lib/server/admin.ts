import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, count, desc, eq, ilike, sum } from "drizzle-orm";
import { z } from "zod";

import { stripeClient } from "@/lib/config/stripe.config";
import { db } from "@/lib/db/db";
import { order, orderItem, product, productVariant } from "@/lib/db/schema";
import { checkIsAdmin, requireAdmin } from "@/lib/server/admin-guard";

// ─── Auth check (used by navbar / root route) ────────────────────────────────

export const checkIsAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  return checkIsAdmin(getRequest());
});

// ─── Admin guard server fn (used in route beforeLoad) ─────────────────────────

export const requireAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin(getRequest());
});

// ─── Orders ──────────────────────────────────────────────────────────────────

const listOrdersInputSchema = z.object({
  paymentStatus: z.enum(["all", "pending", "paid", "refunded"]).optional().default("all"),
  fulfillmentStatus: z
    .enum(["all", "unfulfilled", "fulfilled", "shipped"])
    .optional()
    .default("all"),
  searchEmail: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const listOrdersFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listOrdersInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const conditions = [];

    if (data.paymentStatus !== "all") {
      conditions.push(eq(order.status, data.paymentStatus as "pending" | "paid" | "refunded"));
    }
    if (data.fulfillmentStatus !== "all") {
      conditions.push(
        eq(
          order.fulfillmentStatus,
          data.fulfillmentStatus as "unfulfilled" | "fulfilled" | "shipped",
        ),
      );
    }
    if (data.searchEmail) {
      conditions.push(ilike(order.customerEmail, `%${data.searchEmail}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (data.page - 1) * data.limit;
    const orderBy = data.sort === "asc" ? asc(order.createdAt) : desc(order.createdAt);

    const [orders, [totalRow]] = await Promise.all([
      db.query.order.findMany({
        where,
        with: { items: true },
        orderBy: [orderBy],
        limit: data.limit,
        offset,
      }),
      db.select({ total: count() }).from(order).where(where),
    ]);

    return { orders, total: totalRow?.total ?? 0, page: data.page, limit: data.limit };
  });

export const getOrderFn = createServerFn({ method: "GET" })
  .inputValidator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    await requireAdmin(getRequest());

    const found = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        items: {
          with: { product: true, variant: true },
        },
      },
    });

    return found ?? null;
  });

const updateFulfillmentSchema = z.object({
  orderId: z.string().uuid(),
  fulfillmentStatus: z.enum(["unfulfilled", "fulfilled", "shipped"]),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
});

export const updateFulfillmentFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateFulfillmentSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const now = new Date();

    type FulfillmentUpdate = {
      fulfillmentStatus: "unfulfilled" | "fulfilled" | "shipped";
      updatedAt: Date;
      fulfilledAt?: Date | null;
      shippedAt?: Date | null;
      trackingNumber?: string | null;
      trackingCarrier?: string | null;
    };

    const updates: FulfillmentUpdate = {
      fulfillmentStatus: data.fulfillmentStatus,
      updatedAt: now,
    };

    if (data.fulfillmentStatus === "fulfilled") {
      updates.fulfilledAt = now;
      updates.shippedAt = null;
      updates.trackingNumber = null;
      updates.trackingCarrier = null;
    } else if (data.fulfillmentStatus === "shipped") {
      updates.shippedAt = now;
      updates.trackingNumber = data.trackingNumber ?? null;
      updates.trackingCarrier = data.trackingCarrier ?? null;
    } else {
      updates.fulfilledAt = null;
      updates.shippedAt = null;
      updates.trackingNumber = null;
      updates.trackingCarrier = null;
    }

    const [updated] = await db
      .update(order)
      .set(updates)
      .where(eq(order.id, data.orderId))
      .returning();

    return updated ?? null;
  });

export const updateOrderNotesFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid(), notes: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    await db
      .update(order)
      .set({ internalNotes: data.notes, updatedAt: new Date() })
      .where(eq(order.id, data.orderId));
  });

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const getDashboardStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin(getRequest());

  const [fulfillmentCounts, revenueRow, recentOrders] = await Promise.all([
    db
      .select({ status: order.fulfillmentStatus, count: count() })
      .from(order)
      .where(eq(order.status, "paid"))
      .groupBy(order.fulfillmentStatus),
    db
      .select({ total: sum(order.amountTotalCents) })
      .from(order)
      .where(eq(order.status, "paid")),
    db.query.order.findMany({
      orderBy: [desc(order.createdAt)],
      limit: 5,
      with: { items: true },
    }),
  ]);

  const byStatus = { unfulfilled: 0, fulfilled: 0, shipped: 0 };
  for (const row of fulfillmentCounts) {
    if (row.status === "unfulfilled") byStatus.unfulfilled = row.count;
    else if (row.status === "fulfilled") byStatus.fulfilled = row.count;
    else if (row.status === "shipped") byStatus.shipped = row.count;
  }

  return {
    fulfillmentCounts: byStatus,
    totalRevenueCents: Number(revenueRow[0]?.total ?? 0),
    recentOrders,
  };
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const listAdminProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin(getRequest());

  const products = await db.query.product.findMany({
    with: { variants: true },
    orderBy: [asc(product.createdAt)],
  });

  return products.map((p) => ({
    ...p,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));
});

export const getAdminProductFn = createServerFn({ method: "GET" })
  .inputValidator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    await requireAdmin(getRequest());

    const p = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: { variants: true },
    });

    return p ?? null;
  });

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().min(1),
  imageUrl: z.string().min(1),
  category: z.enum(["tshirt", "sweatshirt"]),
});

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateProductSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const existing = await db.query.product.findFirst({
      where: eq(product.id, data.productId),
    });

    if (!existing) throw new Error("Product not found");

    const updates: Partial<typeof existing> = {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      imageUrl: data.imageUrl,
      category: data.category,
      updatedAt: new Date(),
    };

    // Sync name/description with Stripe Product
    if (
      existing.stripeProductId &&
      (data.name !== existing.name || data.description !== existing.description)
    ) {
      await stripeClient.products.update(existing.stripeProductId, {
        name: data.name,
        description: data.description,
      });
    }

    // If price changed: create new Stripe Price, archive old, update DB
    if (data.priceCents !== existing.priceCents && existing.stripeProductId) {
      const newPrice = await stripeClient.prices.create({
        product: existing.stripeProductId,
        unit_amount: data.priceCents,
        currency: "usd",
      });

      if (existing.stripePriceId) {
        await stripeClient.prices.update(existing.stripePriceId, { active: false });
      }

      updates.stripePriceId = newPrice.id;
    }

    const [updated] = await db
      .update(product)
      .set(updates)
      .where(eq(product.id, data.productId))
      .returning();

    return updated ?? null;
  });

const updateVariantStockSchema = z.object({
  variantId: z.string().uuid(),
  stock: z.number().int().min(0),
});

export const updateVariantStockFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateVariantStockSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const [updated] = await db
      .update(productVariant)
      .set({ stock: data.stock })
      .where(eq(productVariant.id, data.variantId))
      .returning();

    return updated ?? null;
  });
