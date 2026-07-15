import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import Link from "@/components/ui/link";
import { useCartStore } from "@/lib/cart/store";
import { app } from "@/lib/config/app.config";
import { getOrderBySessionId } from "@/lib/server/checkout";

const searchSchema = z.object({
  session_id: z.string(),
});

export const Route = createFileRoute("/orders/success")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ sessionId: search.session_id }),
  loader: ({ deps: { sessionId } }) => getOrderBySessionId({ data: sessionId }),
  component: SuccessPage,
});

function SuccessPage() {
  const order = Route.useLoaderData();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl text-secondary-foreground">ORDER NOT FOUND</h1>
        <Link to="/shop" variant="inline" size="none" className="mt-6 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  const currency = order.currency?.toUpperCase() ?? "USD";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Success header */}
      <div className="relative mb-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <svg
            className="h-8 w-8 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Success</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 font-heading text-4xl text-foreground">ORDER CONFIRMED!</h1>
        <p className="text-muted-foreground">
          You'll get a confirmation email from Stripe shortly.
        </p>
      </div>

      {/* Order details — selectable so customers can copy their order # / details */}
      <div className="mb-6 select-text border border-border bg-background p-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-heading text-foreground text-lg">ORDER DETAILS</h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-faded-foreground text-xs tracking-wider">Order ID</p>
            <p className="break-all font-mono text-secondary-foreground text-xs">{order.id}</p>
          </div>
          {order.customerEmail && (
            <div>
              <p className="mb-1 text-faded-foreground text-xs tracking-wider">Email</p>
              <p className="text-secondary-foreground">{order.customerEmail}</p>
            </div>
          )}
          {order.amountTotalCents !== null && (
            <div>
              <p className="mb-1 text-faded-foreground text-xs tracking-wider">Total Paid</p>
              <p className="font-semibold text-primary">
                {(order.amountTotalCents / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency,
                })}
              </p>
            </div>
          )}
          <div>
            <p className="mb-1 text-faded-foreground text-xs tracking-wider">Status</p>
            <span className="inline-block bg-green-100 px-2 py-0.5 font-medium text-green-800 text-xs tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-border border-t pt-4">
          <p className="mb-3 font-heading text-secondary-foreground text-sm tracking-wider">
            ITEMS
          </p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 text-secondary-foreground">
                  {item.nameSnapshot}
                  {item.sizeSnapshot && ` — Size ${item.sizeSnapshot}`}
                  {` × ${item.quantity}`}
                </span>
                <span className="shrink-0 font-medium text-foreground">
                  {((item.priceCentsSnapshot * item.quantity) / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="mt-4 border-border border-t pt-4">
            <p className="mb-2 font-heading text-secondary-foreground text-sm tracking-wider">
              SHIPS TO
            </p>
            <address className="text-secondary-foreground text-sm not-italic leading-relaxed">
              {order.shippingName}
              <br />
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.line2 && (
                <>
                  {order.shippingAddress.line2}
                  <br />
                </>
              )}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postal_code}
              <br />
              {order.shippingAddress.country}
            </address>
          </div>
        )}
      </div>

      {/* TODO. Change this */}
      <p className="mb-8 text-center text-muted-foreground text-sm">
        The owner will receive your order and ship it within 3–5 business days. You'll get a Stripe
        receipt via email. Reach out at{" "}
        <a href={`mailto:${app.email}`} className="underline hover:text-primary">
          {app.email}
        </a>{" "}
        with any questions.
      </p>

      <div className="text-center">
        <Link to="/shop" size="lg">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
