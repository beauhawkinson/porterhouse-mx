import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { app } from "@/lib/config/app.config";
import { stripeClient } from "@/lib/config/stripe.config";
import { env } from "@/lib/config/t3.config";
import { db } from "@/lib/db/db";
import { order, orderItem, product, productVariant } from "@/lib/db/schema";

import type Stripe from "stripe";

// A cart line is either variant-keyed (apparel) or product-keyed (stickers).
// We require productId on every line so the server can resolve both cases
// without a second lookup, and variantId is optional.
const cartLineSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullable(),
  quantity: z.number().int().min(1),
});

const checkoutInputSchema = z.object({
  lines: z.array(cartLineSchema).min(1),
  userId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutInputSchema.parse(data))
  .handler(async ({ data }) => {
    // Partition lines by whether they reference a variant.
    const variantIds = data.lines.map((l) => l.variantId).filter((id): id is string => id !== null);
    const productIdsWithoutVariant = data.lines
      .filter((l) => l.variantId === null)
      .map((l) => l.productId);

    // Load variants (with their parent products) for variant-keyed lines.
    const variants =
      variantIds.length > 0
        ? await db.query.productVariant.findMany({
            where: inArray(productVariant.id, variantIds),
            with: { product: true },
          })
        : [];

    // Load standalone products for variant-less lines (stickers).
    const products =
      productIdsWithoutVariant.length > 0
        ? await db.query.product.findMany({
            where: inArray(product.id, productIdsWithoutVariant),
          })
        : [];

    // Verify everything resolved.
    if (variants.length !== variantIds.length) {
      throw new Error("One or more product variants not found.");
    }
    if (products.length !== productIdsWithoutVariant.length) {
      throw new Error("One or more products not found.");
    }

    // Guard: only active products can be purchased. Draft/archived products are
    // visible to admins in preview mode but must never be added to an order or
    // checked out — this is the authoritative check (the client is bypassable).
    for (const line of data.lines) {
      const status = line.variantId
        ? variants.find((v) => v.id === line.variantId)?.product.status
        : products.find((p) => p.id === line.productId)?.status;
      if (status !== "active") {
        throw new Error("This product is not available for purchase.");
      }
    }

    // Validate stock for every line.
    for (const line of data.lines) {
      if (line.variantId) {
        const variant = variants.find((v) => v.id === line.variantId);
        if (!variant) throw new Error(`Variant ${line.variantId} not found.`);
        if (variant.stock < line.quantity) {
          throw new Error(
            `Not enough stock for ${variant.product.name} (${variant.size}). Only ${variant.stock} left.`,
          );
        }
      } else {
        const p = products.find((x) => x.id === line.productId);
        if (!p) throw new Error(`Product ${line.productId} not found.`);
        if (p.stock < line.quantity) {
          throw new Error(`Not enough stock for ${p.name}. Only ${p.stock} left.`);
        }
      }
    }

    // Pre-create order in pending state
    const [newOrder] = await db
      .insert(order)
      .values({
        userId: data.userId ?? null,
        stripeCheckoutSessionId: `pending_${crypto.randomUUID()}`,
        status: "pending",
        currency: "usd",
        customerEmail: data.customerEmail ?? null,
      })
      .returning();

    if (!newOrder) throw new Error("Failed to create order.");

    // Insert order items — branched by line type.
    await db.insert(orderItem).values(
      data.lines.map((line) => {
        if (line.variantId) {
          const variant = variants.find((v) => v.id === line.variantId)!;
          return {
            orderId: newOrder.id,
            productId: variant.productId,
            variantId: variant.id,
            nameSnapshot: variant.product.name,
            sizeSnapshot: variant.size,
            priceCentsSnapshot: variant.product.priceCents,
            quantity: line.quantity,
          };
        }
        const p = products.find((x) => x.id === line.productId)!;
        return {
          orderId: newOrder.id,
          productId: p.id,
          variantId: null,
          nameSnapshot: p.name,
          sizeSnapshot: null,
          priceCentsSnapshot: p.priceCents,
          quantity: line.quantity,
        };
      }),
    );

    // Build Stripe line items.
    const lineItems = data.lines.map((line) => {
      if (line.variantId) {
        const variant = variants.find((v) => v.id === line.variantId)!;
        const priceId = variant.stripePriceId ?? variant.product.stripePriceId;

        if (priceId) {
          return { price: priceId, quantity: line.quantity };
        }

        return {
          price_data: {
            currency: "usd",
            unit_amount: variant.product.priceCents,
            product_data: {
              name: `${variant.product.name} — Size ${variant.size}`,
              images: variant.product.imageUrl.startsWith("http") ? [variant.product.imageUrl] : [],
            },
          },
          quantity: line.quantity,
        };
      }

      // Variant-less (sticker)
      const p = products.find((x) => x.id === line.productId)!;
      if (p.stripePriceId) {
        return { price: p.stripePriceId, quantity: line.quantity };
      }

      return {
        price_data: {
          currency: "usd",
          unit_amount: p.priceCents,
          product_data: {
            name: p.name,
            images: p.imageUrl.startsWith("http") ? [p.imageUrl] : [],
          },
        },
        quantity: line.quantity,
      };
    });

    const baseUrl = env.BETTER_AUTH_URL;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: app.shippingCents, currency: "usd" },
            display_name: "USPS Ground Advantage",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      metadata: { orderInternalId: newOrder.id },
      payment_intent_data: { metadata: { orderInternalId: newOrder.id } },
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    };

    if (data.stripeCustomerId) {
      sessionParams.customer = data.stripeCustomerId;
    } else if (data.customerEmail) {
      sessionParams.customer_email = data.customerEmail;
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    await db
      .update(order)
      .set({ stripeCheckoutSessionId: session.id })
      .where(eq(order.id, newOrder.id));

    const url = session.url;
    if (!url) throw new Error("Stripe session URL not returned.");
    return { url };
  });

export const getOrderBySessionId = createServerFn({ method: "GET" })
  .inputValidator((sessionId: string) => sessionId)
  .handler(async ({ data: sessionId }) => {
    const found = await db.query.order.findFirst({
      where: eq(order.stripeCheckoutSessionId, sessionId),
      with: {
        items: {
          with: { product: true, variant: true },
        },
      },
    });
    return found ?? null;
  });
