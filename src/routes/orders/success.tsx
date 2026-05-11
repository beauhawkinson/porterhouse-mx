import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart/store";
import { getOrderBySessionId } from "@/lib/server/checkout";

const searchSchema = z.object({
  session_id: z.string(),
});

export const Route = createFileRoute("/orders/success")({
  validateSearch: searchSchema,
  loader: ({ location: { search } }) => {
    const result = searchSchema.safeParse(search);
    const sessionId = result.success ? result.data.session_id : undefined;
    if (!sessionId) return null;
    return getOrderBySessionId({ data: sessionId });
  },
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
        <h1 className="font-heading text-3xl text-[#333]">ORDER NOT FOUND</h1>
        <Link to="/shop" className="mt-6 inline-block text-[#6B4423] underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Success header */}
      <div className="relative mb-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#3E2A1E]">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>Success</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 font-heading text-4xl text-[#111]">ORDER CONFIRMED!</h1>
        <p className="text-[#666]">You'll get a confirmation email from Stripe shortly.</p>
      </div>

      {/* Order details */}
      <div className="mb-6 border border-[#e5e0d8] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-heading text-[#111] text-lg">ORDER DETAILS</h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-[#999] text-xs tracking-wider">Order ID</p>
            <p className="break-all font-mono text-[#333] text-xs">{order.id}</p>
          </div>
          {order.customerEmail && (
            <div>
              <p className="mb-1 text-[#999] text-xs tracking-wider">Email</p>
              <p className="text-[#333]">{order.customerEmail}</p>
            </div>
          )}
          {/* {order.amountTotalCents && (
            <div>
              <p className="mb-1 text-[#999] text-xs tracking-wider">Total Paid</p>
              <p className="font-semibold text-[#3E2A1E]">
                {(order.amountTotalCents / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: order.currency?.to() ?? "USD",
                })}
              </p>
            </div>
          )} */}
          <div>
            <p className="mb-1 text-[#999] text-xs tracking-wider">Status</p>
            <span className="inline-block bg-green-100 px-2 py-0.5 font-medium text-green-800 text-xs tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-[#e5e0d8] border-t pt-4">
          <p className="mb-3 font-heading text-[#333] text-sm tracking-wider">ITEMS</p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-[#333]">
                  {item.nameSnapshot} — Size {item.sizeSnapshot} × {item.quantity}
                </span>
                <span className="font-medium text-[#111]">
                  {((item.priceCentsSnapshot * item.quantity) / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="mt-4 border-[#e5e0d8] border-t pt-4">
            <p className="mb-2 font-heading text-[#333] text-sm tracking-wider">SHIPS TO</p>
            <address className="text-[#555] text-sm not-italic leading-relaxed">
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
      <p className="mb-8 text-center text-[#666] text-sm">
        The owner will receive your order and ship it within 3–5 business days. You'll get a Stripe
        receipt via email. Reach out at{" "}
        <a href="mailto:shop@jpmotorcross.com" className="underline hover:text-[#6B4423]">
          shop@jpmotorcross.com
        </a>{" "}
        with any questions.
      </p>

      <div className="text-center">
        <Link to="/shop">
          <Button size="lg">KEEP SHOPPING</Button>
        </Link>
      </div>
    </div>
  );
}
