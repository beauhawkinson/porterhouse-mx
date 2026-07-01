/** biome-ignore-all lint/suspicious/noConsole: Allow */
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, ne, sql } from "drizzle-orm";

import { stripeClient } from "@/lib/config/stripe.config";
import { env } from "@/lib/config/t3.config";
import { db } from "@/lib/db/db";
import { order, orderItem, product, productVariant } from "@/lib/db/schema";

import type Stripe from "stripe";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing stripe-signature header", { status: 400 });
        }

        let event: Stripe.Event;
        try {
          event = stripeClient.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;

              // Only act on sessions that actually completed payment. Standard
              // card checkout is always "paid" here, but delayed-notification
              // methods can complete as "unpaid"/"no_payment_required".
              if (session.payment_status !== "paid") {
                console.log(
                  `checkout.session.completed: payment_status=${session.payment_status}, skipping`,
                );
                break;
              }

              const orderInternalId = session.metadata?.orderInternalId;

              if (!orderInternalId) {
                console.warn("checkout.session.completed: no orderInternalId in metadata");
                break;
              }

              const existing = await db.query.order.findFirst({
                where: eq(order.id, orderInternalId),
              });

              if (!existing) {
                console.warn(`Order ${orderInternalId} not found`);
                break;
              }

              // Idempotency: skip if already paid
              if (existing.status === "paid") break;

              const shippingDetails = session.collected_information?.shipping_details;

              await db.transaction(async (tx) => {
                await tx
                  .update(order)
                  .set({
                    status: "paid",
                    paidAt: new Date(),
                    stripePaymentIntentId:
                      typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : (session.payment_intent?.id ?? null),
                    customerEmail: session.customer_details?.email ?? null,
                    shippingName: shippingDetails?.name ?? null,
                    shippingAddress: shippingDetails?.address ?? null,
                    amountTotalCents: session.amount_total,
                    currency: session.currency,
                    updatedAt: new Date(),
                  })
                  .where(eq(order.id, orderInternalId));

                // Decrement stock for each order item.
                // - Variant-keyed items (apparel) decrement productVariant.stock
                // - Variant-less items (stickers) decrement product.stock
                // GREATEST prevents stock from going negative.
                const items = await tx.query.orderItem.findMany({
                  where: eq(orderItem.orderId, orderInternalId),
                });

                for (const item of items) {
                  if (item.variantId) {
                    await tx
                      .update(productVariant)
                      .set({
                        stock: sql`GREATEST(0, ${productVariant.stock} - ${item.quantity})`,
                      })
                      .where(eq(productVariant.id, item.variantId));
                  } else {
                    await tx
                      .update(product)
                      .set({
                        stock: sql`GREATEST(0, ${product.stock} - ${item.quantity})`,
                      })
                      .where(eq(product.id, item.productId));
                  }
                }
              });

              console.log(`Order ${orderInternalId} marked as paid.`);
              break;
            }

            case "charge.refunded": {
              const charge = event.data.object as Stripe.Charge;
              const paymentIntentId =
                typeof charge.payment_intent === "string"
                  ? charge.payment_intent
                  : charge.payment_intent?.id;

              if (paymentIntentId) {
                // Skip orders already refunded (e.g. via the in-app refund
                // action) so we don't clobber the original refundedAt time.
                await db
                  .update(order)
                  .set({ status: "refunded", refundedAt: new Date(), updatedAt: new Date() })
                  .where(
                    and(
                      eq(order.stripePaymentIntentId, paymentIntentId),
                      ne(order.status, "refunded"),
                    ),
                  );
                console.log(`Order with PI ${paymentIntentId} marked as refunded.`);
              }
              break;
            }

            default:
              console.log(`Unhandled event type: ${event.type}`);
          }
        } catch (err) {
          console.error("Webhook handler error:", err);
          return new Response("Internal error", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
