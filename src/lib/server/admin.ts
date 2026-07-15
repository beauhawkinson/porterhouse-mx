import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, count, desc, eq, ilike, like, sum } from "drizzle-orm";
import { z } from "zod";

import { productFormSchema } from "@/components/products/ProductForm";
import { stripeClient } from "@/lib/config/stripe.config";
import { db } from "@/lib/db/db";
import {
  SIZE_VALUES,
  categoryEnum,
  order,
  product,
  productImage,
  productVariant,
} from "@/lib/db/schema";
import { totalStock } from "@/lib/products/stock";
import { checkIsAdmin, requireAdmin } from "@/lib/server/admin-guard";
import { deleteR2Object } from "@/lib/server/r2-object";

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
      conditions.push(eq(order.status, data.paymentStatus));
    }
    if (data.fulfillmentStatus !== "all") {
      conditions.push(eq(order.fulfillmentStatus, data.fulfillmentStatus));
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
  orderId: z.uuid(),
  fulfillmentStatus: z.enum(["unfulfilled", "fulfilled", "shipped"]),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
});

export const updateFulfillmentFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateFulfillmentSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    // Enforce the one-way state machine (unfulfilled → fulfilled → shipped, with
    // revert as the only way back) on the server too, so it can't be bypassed.
    const existing = await db.query.order.findFirst({ where: eq(order.id, data.orderId) });
    if (!existing) throw new Error("Order not found.");

    const from = existing.fulfillmentStatus;
    const to = data.fulfillmentStatus;

    if (existing.status === "refunded" && to !== "unfulfilled") {
      throw new Error("A refunded order can't be marked fulfilled or shipped.");
    }

    const allowed =
      (to === "fulfilled" && from === "unfulfilled") || // advance
      (to === "shipped" && from !== "shipped") || // advance (can't re-ship)
      (to === "unfulfilled" && from !== "unfulfilled"); // revert
    if (!allowed) {
      throw new Error(`Can't change fulfillment from "${from}" to "${to}".`);
    }

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
  .inputValidator((data: unknown) => z.object({ orderId: z.uuid(), notes: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    await db
      .update(order)
      .set({ internalNotes: data.notes, updatedAt: new Date() })
      .where(eq(order.id, data.orderId));
  });

// Refund an order via the Stripe API and mark it refunded in one step, so the
// admin can process refunds in-app without the Stripe Dashboard. The
// charge.refunded webhook is a backup reconciliation path (it skips orders
// already refunded here).
export const refundOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ orderId: z.uuid() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const existing = await db.query.order.findFirst({ where: eq(order.id, data.orderId) });
    if (!existing) throw new Error("Order not found.");
    if (existing.status === "refunded") throw new Error("Order is already refunded.");
    if (existing.status !== "paid") throw new Error("Only paid orders can be refunded.");
    if (!existing.stripePaymentIntentId) {
      throw new Error("No Stripe payment on this order to refund.");
    }

    // Issue the refund with Stripe first — only mark the order refunded if it
    // actually succeeds, so the DB never lies about money movement. The
    // idempotency key makes a retried/double-clicked request safe (Stripe
    // returns the original refund instead of creating a second one).
    await stripeClient.refunds.create(
      { payment_intent: existing.stripePaymentIntentId },
      { idempotencyKey: `refund_${existing.id}` },
    );

    const now = new Date();
    const [updated] = await db
      .update(order)
      .set({ status: "refunded", refundedAt: now, updatedAt: now })
      .where(eq(order.id, data.orderId))
      .returning();

    // Inventory is intentionally not auto-restocked — the admin adjusts stock
    // manually (Stock by size) based on whether the item is actually coming
    // back (unshipped vs. shipped/damaged/kept).
    return updated ?? null;
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

  // totalStock handles both variant-keyed (sums variants) and variant-less
  // (uses product.stock) products. Stickers were reporting 0 before this.
  return products.map((p) => ({
    ...p,
    totalStock: totalStock(p),
  }));
});

export const getAdminProductFn = createServerFn({ method: "GET" })
  .inputValidator((productId: string) => productId)
  .handler(async ({ data: productId }) => {
    await requireAdmin(getRequest());

    const p = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: {
        variants: true,
        images: { orderBy: asc(productImage.sortOrder) },
      },
    });

    return p ?? null;
  });

// Replace your existing updateProductSchema and updateProductFn with this.

const updateProductSchema = z.object({
  productId: z.uuid(),
  // Every field other than productId is optional. The form sends them all in
  // edit mode, but other callers (like the archive button) only send status.
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  details: z.string().optional().nullable(),
  priceCents: z.number().int().min(1).optional(),
  // Full ordered gallery. When present it replaces the product's images; the
  // first entry becomes the primary (mirrored onto product.imageUrl).
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().optional() }))
    .min(1)
    .optional(),
  category: z.enum(categoryEnum.enumValues).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  stock: z.number().int().min(0).optional(),
});

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateProductSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const existing = await db.query.product.findFirst({
      where: eq(product.id, data.productId),
    });

    if (!existing) throw new Error("Product not found");

    // Build the update object from only the fields that were actually sent.
    type ProductUpdate = Partial<typeof product.$inferInsert>;
    const updates: ProductUpdate = { updatedAt: new Date() };

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.details !== undefined) updates.details = data.details;
    if (data.images !== undefined) updates.imageUrl = data.images[0].url;
    if (data.category !== undefined) updates.category = data.category;
    if (data.status !== undefined) updates.status = data.status;
    if (data.priceCents !== undefined) updates.priceCents = data.priceCents;

    // Stock only applies to stickers (variant-less products). For apparel,
    // stock lives on variants and is updated via updateVariantStockFn.
    if (data.stock !== undefined && existing.category === "sticker") {
      updates.stock = data.stock;
    }

    // ──────────────────────────────────────────────────────────────
    // Stripe sync — only when relevant fields actually changed
    // ──────────────────────────────────────────────────────────────

    // Name / description sync to Stripe Product
    const nameChanged = data.name !== undefined && data.name !== existing.name;
    const descriptionChanged =
      data.description !== undefined && data.description !== existing.description;

    if (existing.stripeProductId && (nameChanged || descriptionChanged)) {
      await stripeClient.products.update(existing.stripeProductId, {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
      });
    }

    // Price change → create new Stripe Price, archive old, update DB
    if (
      data.priceCents !== undefined &&
      data.priceCents !== existing.priceCents &&
      existing.stripeProductId
    ) {
      if (existing.category === "sticker") {
        // Stickers: single price on the product row.
        const newPrice = await stripeClient.prices.create({
          product: existing.stripeProductId,
          unit_amount: data.priceCents,
          currency: "usd",
          metadata: { slug: existing.slug },
        });

        if (existing.stripePriceId) {
          await stripeClient.prices.update(existing.stripePriceId, { active: false });
        }

        updates.stripePriceId = newPrice.id;
      } else {
        // Apparel: one price per variant. Create new prices, archive old ones,
        // update each variant row with its new stripePriceId.
        const variants = await db.query.productVariant.findMany({
          where: eq(productVariant.productId, existing.id),
        });

        for (const v of variants) {
          const newPrice = await stripeClient.prices.create({
            product: existing.stripeProductId,
            unit_amount: data.priceCents,
            currency: "usd",
            metadata: { slug: existing.slug, size: v.size },
          });

          if (v.stripePriceId) {
            await stripeClient.prices.update(v.stripePriceId, { active: false });
          }

          await db
            .update(productVariant)
            .set({ stripePriceId: newPrice.id })
            .where(eq(productVariant.id, v.id));
        }
      }
    }

    const [updated] = await db
      .update(product)
      .set(updates)
      .where(eq(product.id, data.productId))
      .returning();

    // ──────────────────────────────────────────────────────────────
    // Gallery replacement — the productImage rows are what the storefront
    // reads, so rewrite them to match the submitted gallery and clean up
    // any R2 objects for images that were removed.
    // ──────────────────────────────────────────────────────────────
    if (data.images !== undefined) {
      const newUrls = new Set(data.images.map((img) => img.url));

      const oldImages = await db
        .select({ url: productImage.url })
        .from(productImage)
        .where(eq(productImage.productId, existing.id));

      await db.delete(productImage).where(eq(productImage.productId, existing.id));
      await db.insert(productImage).values(
        data.images.map((img, idx) => ({
          productId: existing.id,
          url: img.url,
          alt: img.alt?.trim() || data.name || existing.name,
          sortOrder: idx,
        })),
      );

      // Best-effort delete of dropped files (no-op for non-R2 URLs).
      for (const old of oldImages) {
        if (!newUrls.has(old.url)) {
          await deleteR2Object(old.url);
        }
      }
    }

    return updated ?? null;
  });

// Restock a product variant (apparel sizes).
const updateVariantStockSchema = z.object({
  variantId: z.uuid(),
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

/**
 * Convert an arbitrary string into a URL-safe slug.
 *   "Mud Demon Sticker!" → "mud-demon-sticker"
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric (keeps spaces/hyphens)
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Generate a slug that doesn't collide with any existing product.slug.
 * Falls back to "name-2", "name-3", etc.
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  if (!base) throw new Error("Cannot generate a slug from this name");

  // Pull all slugs that start with the base — we'll filter in-memory rather
  // than hammer the DB in a loop.
  const existing = await db
    .select({ slug: product.slug })
    .from(product)
    .where(like(product.slug, `${base}%`));

  const taken = new Set(existing.map((r) => r.slug));

  if (!taken.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }

  // Pathological case — shouldn't happen
  throw new Error(`Could not generate unique slug for "${name}"`);
}

/**
 * Archive every Stripe object that was created during a failed createProductFn
 * run. Best-effort — logs failures but never throws (we're already in an error
 * path; throwing here just hides the original error).
 */
async function rollbackStripe(opts: { productId: string | null; priceIds: string[] }) {
  // Archive prices first (a product can't be archived while prices reference it,
  // but archiving is allowed in any order — we archive prices defensively).
  for (const priceId of opts.priceIds) {
    try {
      await stripeClient.prices.update(priceId, { active: false });
    } catch (err) {
      console.error(`[createProductFn rollback] failed to archive price ${priceId}`, err);
    }
  }

  if (opts.productId) {
    try {
      await stripeClient.products.update(opts.productId, { active: false });
    } catch (err) {
      console.error(`[createProductFn rollback] failed to archive product ${opts.productId}`, err);
    }
  }
}

// ─── createProductFn ─────────────────────────────────────────────────────

export const createProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => productFormSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const isSticker = data.category === "sticker";

    // Track what we've created so we can roll back on failure.
    let stripeProductId: string | null = null;
    const stripePriceIds: string[] = [];

    try {
      // ────────────────────────────────────────────────────────────────
      // 1. Generate unique slug
      // ────────────────────────────────────────────────────────────────
      const slug = await generateUniqueSlug(data.name);

      // ────────────────────────────────────────────────────────────────
      // 2. Create Stripe product
      // ────────────────────────────────────────────────────────────────
      const stripeProduct = await stripeClient.products.create({
        name: data.name,
        description: data.description,
        metadata: {
          slug,
          category: data.category,
        },
      });
      stripeProductId = stripeProduct.id;

      // ────────────────────────────────────────────────────────────────
      // 3. Create Stripe price(s)
      //    - Sticker: one price on the product
      //    - Apparel: one price per size (S/M/L/XL/XXL)
      // ────────────────────────────────────────────────────────────────
      let stickerStripePriceId: string | null = null;
      const variantPriceIds: Record<string, string> = {};

      if (isSticker) {
        const price = await stripeClient.prices.create({
          product: stripeProductId,
          unit_amount: data.priceCents,
          currency: "usd",
          metadata: { slug },
        });
        stickerStripePriceId = price.id;
        stripePriceIds.push(price.id);
      } else {
        for (const size of SIZE_VALUES) {
          const price = await stripeClient.prices.create({
            product: stripeProductId,
            unit_amount: data.priceCents,
            currency: "usd",
            metadata: { slug, size },
          });
          variantPriceIds[size] = price.id;
          stripePriceIds.push(price.id);
        }
      }

      // ────────────────────────────────────────────────────────────────
      // 4. Insert DB product
      // ────────────────────────────────────────────────────────────────
      const [row] = await db
        .insert(product)
        .values({
          slug,
          name: data.name,
          description: data.description,
          details: data.details ?? null,
          priceCents: data.priceCents,
          imageUrl: data.images[0].url,
          category: data.category,
          status: data.status,
          stripeProductId,
          stripePriceId: isSticker ? stickerStripePriceId : null,
          stock: isSticker ? (data.stock ?? 0) : 0,
        })
        .returning();

      if (!row) {
        throw new Error("Failed to insert product row");
      }

      // ────────────────────────────────────────────────────────────────
      // 5. Insert apparel variants (S/M/L/XL/XXL with stock 0)
      // ────────────────────────────────────────────────────────────────
      if (!isSticker) {
        await db.insert(productVariant).values(
          SIZE_VALUES.map((size) => ({
            productId: row.id,
            size,
            stock: 0,
            stripePriceId: variantPriceIds[size] ?? null,
          })),
        );
      }

      // ────────────────────────────────────────────────────────────────
      // 6. Insert product images (ordered gallery; first = primary)
      // ────────────────────────────────────────────────────────────────
      await db.insert(productImage).values(
        data.images.map((img, idx) => ({
          productId: row.id,
          url: img.url,
          alt: img.alt?.trim() || data.name,
          sortOrder: idx,
        })),
      );

      return { id: row.id, slug: row.slug };
    } catch (err) {
      // Roll back Stripe side. DB inserts are inside the same try block; if any
      // failed, partial rows may remain — log so the admin can investigate.
      console.error("[createProductFn] failed — rolling back Stripe", err);

      await rollbackStripe({
        productId: stripeProductId,
        priceIds: stripePriceIds,
      });

      throw err;
    }
  });
