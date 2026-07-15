import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { CartItemRow } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { useSession } from "@/lib/auth-client";
import { cartKey, useCartStore } from "@/lib/cart/store";
import { app } from "@/lib/config/app.config";
import { createCheckoutSession } from "@/lib/server/checkout";

export const Route = createFileRoute("/cart")({
  // No products means nothing can be in the cart — block direct navigation.
  beforeLoad: ({ context }) => {
    if (!context.hasProducts) throw redirect({ to: "/" });
  },
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
  const shipping =
    app.shippingCents === 0
      ? "Free"
      : (app.shippingCents / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stripeCustomerId = session?.user?.stripeCustomerId ?? undefined;

      const result = await createCheckoutSession({
        data: {
          lines: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
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
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-32 text-center">
        <h1 className="mb-4 font-heading text-4xl text-foreground">YOUR CART IS EMPTY</h1>
        <p className="mb-8 text-muted-foreground">Looks like you haven't added anything yet.</p>
        <Link to="/shop">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-10 font-heading text-4xl text-foreground">Your Cart</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={cartKey(item)} item={item} />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border p-6">
            <h2 className="mb-6 font-heading text-foreground text-xl">Order Summary</h2>

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-faded-foreground">
                  {shipping}
                  {app.shippingCents > 0 && " (USPS)"}
                </span>
              </div>
              <div className="flex justify-between text-faded-foreground text-xs">
                <span>Taxes calculated at checkout</span>
              </div>
            </div>

            <div className="mb-6 border-border border-t pt-4">
              <div className="flex justify-between font-semibold text-base">
                <span>Estimated Total</span>
                <span>{subtotal}</span>
              </div>
              <p className="mt-1 text-faded-foreground text-xs">
                {app.shippingCents > 0 ? `+ ${shipping} shipping + tax` : "+ tax"}
              </p>
            </div>

            {error && (
              <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
                {error}
              </p>
            )}

            <Button size="lg" className="w-full" onClick={handleCheckout} disabled={isLoading}>
              CHECKOUT
            </Button>

            {!session && (
              <p className="mt-3 text-center text-faded-foreground text-xs">
                <Link to="/sign-in" variant="inline" size="none">
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
