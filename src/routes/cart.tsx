import { createFileRoute, Link } from "@tanstack/react-router";
import { useCartStore } from "@/lib/cart/store";
import { CartItemRow } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/Button";
import { createCheckoutSession } from "@/lib/server/checkout";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { Splatter1 } from "@/components/splatter";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, totalCents, clearCart } = useCartStore();
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
      const result = await createCheckoutSession({
        data: {
          lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          userId: session?.user?.id,
          stripeCustomerId: (session?.user as { stripeCustomerId?: string })?.stripeCustomerId,
          customerEmail: session?.user?.email,
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Splatter1
          className="w-24 mx-auto mb-6 opacity-20"
          color="#6B4423"
        />
        <h1 className="font-heading text-4xl text-[#111] mb-4">YOUR CART IS EMPTY</h1>
        <p className="text-[#666] mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop">
          <Button size="lg">SHOP NOW</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl text-[#111] mb-10">YOUR CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Line items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.variantId} item={item} />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e5e0d8] p-6 sticky top-24">
            <h2 className="font-heading text-xl text-[#111] mb-6">ORDER SUMMARY</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[#666]">Subtotal</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shipping</span>
                <span className="text-[#888]">{shipping} (USPS)</span>
              </div>
              <div className="flex justify-between text-xs text-[#999]">
                <span>Taxes calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-[#e5e0d8] pt-4 mb-6">
              <div className="flex justify-between font-semibold text-base">
                <span>Estimated Total</span>
                <span>{subtotal}</span>
              </div>
              <p className="text-xs text-[#999] mt-1">+ $8 shipping + tax</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4 border border-red-200 bg-red-50 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? "REDIRECTING..." : "CHECKOUT →"}
            </Button>

            {!session && (
              <p className="text-xs text-[#999] mt-3 text-center">
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
