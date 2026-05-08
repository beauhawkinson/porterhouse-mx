import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CartItemRow } from "@/components/cart/CartItem";
import { Splatter } from "@/components/splatter";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart/store";
import { createCheckoutSession } from "@/lib/server/checkout";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, totalCents } = useCartStore();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = (totalCents() / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const shipping = "$8.00";

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stripeCustomerId = session?.user?.stripeCustomerId ?? undefined;

      const result = await createCheckoutSession({
        data: {
          lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          userId: session?.user?.id,
          ...(stripeCustomerId ? { stripeCustomerId } : {}),
          customerEmail: session?.user?.email ?? undefined,
        },
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <Splatter className="mx-auto mb-6 w-24 opacity-20" color="#6B4423" />
        <h1 className="mb-4 font-heading text-4xl text-[#111]">YOUR CART IS EMPTY</h1>
        <p className="mb-8 text-[#666]">Looks like you haven't added anything yet.</p>
        <Link to="/shop">
          <Button size="lg">SHOP NOW</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-10 font-heading text-4xl text-[#111]">YOUR CART</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.variantId} item={item} />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-[#e5e0d8] bg-white p-6">
            <h2 className="mb-6 font-heading text-[#111] text-xl">ORDER SUMMARY</h2>

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666]">Subtotal</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shipping</span>
                <span className="text-[#888]">{shipping} (USPS)</span>
              </div>
              <div className="flex justify-between text-[#999] text-xs">
                <span>Taxes calculated at checkout</span>
              </div>
            </div>

            <div className="mb-6 border-[#e5e0d8] border-t pt-4">
              <div className="flex justify-between font-semibold text-base">
                <span>Estimated Total</span>
                <span>{subtotal}</span>
              </div>
              <p className="mt-1 text-[#999] text-xs">+ $8 shipping + tax</p>
            </div>

            {error && (
              <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
                {error}
              </p>
            )}

            <Button size="lg" className="w-full" onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? "REDIRECTING..." : "CHECKOUT →"}
            </Button>

            {!session && (
              <p className="mt-3 text-center text-[#999] text-xs">
                <Link to="/sign-in" className="underline hover:text-[#6B4423]">
                  Sign in
                </Link>{" "}
                to save your order history (optional).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
