import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import type Stripe from "stripe";

import { stripeClient } from "@/lib/config/stripe.config";
import { env } from "@/lib/config/t3.config";
import { db } from "@/lib/db/db";
import { order, orderItem, productVariant } from "@/lib/db/schema";

const cartLineSchema = z.object({
  variantId: z.string().uuid(),
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
    const variantIds = data.lines.map((l) => l.variantId);

    // Load variants with their parent products
    const variants = await db.query.productVariant.findMany({
      where: inArray(productVariant.id, variantIds),
      with: { product: true },
    });

    if (variants.length !== variantIds.length) {
      throw new Error("One or more products not found.");
    }

    // Validate stock
    for (const line of data.lines) {
      const variant = variants.find((v) => v.id === line.variantId);
      if (!variant) throw new Error(`Variant ${line.variantId} not found.`);
      if (variant.stock < line.quantity) {
        throw new Error(
          `Not enough stock for ${variant.product.name} (${variant.size}). Only ${variant.stock} left.`,
        );
      }
    }

    // Pre-create order in pending state
    const [newOrder] = await db
      .insert(order)
      .values({
        userId: data.userId ?? null,
        stripeCheckoutSessionId: `pending_${crypto.randomUUID()}`,
        status: "pending",
      })
      .returning();

    if (!newOrder) throw new Error("Failed to create order.");

    // Insert order items
    await db.insert(orderItem).values(
      data.lines.map((line) => {
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
      }),
    );

    // Build Stripe line items
    const lineItems = data.lines.map((line) => {
      const variant = variants.find((v) => v.id === line.variantId)!;
      const priceId = variant.stripePriceId ?? variant.product.stripePriceId;

      if (priceId) {
        return {
          price: priceId,
          quantity: line.quantity,
        };
      }

      // Fallback: price_data
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
    });

    const baseUrl = env.BETTER_AUTH_URL;

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 800, currency: "usd" },
            display_name: "USPS Ground Advantage",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      metadata: { orderInternalId: newOrder.id },
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    };

    if (data.stripeCustomerId) {
      sessionParams.customer = data.stripeCustomerId;
    } else if (data.customerEmail) {
      sessionParams.customer_email = data.customerEmail;
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    // Update the order with the real Stripe session ID
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
