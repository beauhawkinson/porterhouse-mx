import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { getOrderBySessionId } from "@/lib/server/checkout";
import { Button } from "@/components/ui/Button";
import { Splatter2, Splatter5 } from "@/components/splatter";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

const searchSchema = z.object({
  session_id: z.string(),
});

export const Route = createFileRoute("/orders/success")({
  validateSearch: searchSchema,
  loader: ({ location: { search } }) => {
    const params = new URLSearchParams(search as string);
    const sessionId = params.get("session_id");
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
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-heading text-3xl text-[#333]">ORDER NOT FOUND</h1>
        <Link to="/shop" className="mt-6 inline-block text-[#6B4423] underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {/* Success header */}
      <div className="relative text-center mb-12">
        <Splatter2
          className="absolute -top-8 -right-8 w-32 opacity-20 rotate-12 pointer-events-none"
          color="#6B4423"
        />
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3E2A1E] rounded-full mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-heading text-4xl text-[#111] mb-2">ORDER CONFIRMED!</h1>
        <p className="text-[#666]">
          You'll get a confirmation email from Stripe shortly.
        </p>
      </div>

      {/* Order details */}
      <div className="bg-white border border-[#e5e0d8] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-heading text-lg text-[#111]">ORDER DETAILS</h2>
          <Splatter5 className="w-6 opacity-50" color="#8B5A2B" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wider mb-1">Order ID</p>
            <p className="font-mono text-xs text-[#333] break-all">{order.id}</p>
          </div>
          {order.customerEmail && (
            <div>
              <p className="text-[#999] text-xs uppercase tracking-wider mb-1">Email</p>
              <p className="text-[#333]">{order.customerEmail}</p>
            </div>
          )}
          {order.amountTotalCents && (
            <div>
              <p className="text-[#999] text-xs uppercase tracking-wider mb-1">Total Paid</p>
              <p className="font-semibold text-[#3E2A1E]">
                {(order.amountTotalCents / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: order.currency?.toUpperCase() ?? "USD",
                })}
              </p>
            </div>
          )}
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wider mb-1">Status</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-[#e5e0d8] pt-4">
          <p className="font-heading text-sm tracking-wider text-[#333] mb-3">ITEMS</p>
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
          <div className="border-t border-[#e5e0d8] pt-4 mt-4">
            <p className="font-heading text-sm tracking-wider text-[#333] mb-2">SHIPS TO</p>
            <address className="not-italic text-sm text-[#555] leading-relaxed">
              {order.shippingName}<br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postal}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        )}
      </div>

      <p className="text-sm text-[#666] mb-8 text-center">
        The owner will receive your order and ship it within 3–5 business days.
        You'll get a Stripe receipt via email. Reach out at{" "}
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
