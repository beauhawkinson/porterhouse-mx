import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { SizeSelector } from "@/components/products/SizeSelector";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { useCartStore } from "@/lib/cart/store";
import { CATEGORY_LABELS } from "@/lib/products/category";
import { isVariantLess } from "@/lib/products/stock";
import { getProductBySlug } from "@/lib/server/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    return getProductBySlug({ data: params.slug }).then((p) => {
      if (!p) throw notFound();
      return p;
    });
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <p className="font-heading text-3xl text-foreground tracking-wider">Product not found</p>
      <Link to="/shop" variant="inline" size="none" className="mt-6 inline-block">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductDetailPage() {
  const product = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const variantLess = isVariantLess(product.category);

  const price = (product.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const selectedImage = product.images[selectedImageIdx] ?? product.images[0];

  // Stock for the currently selected line.
  const lineStock = variantLess ? product.stock : (selectedVariant?.stock ?? 0);

  // How many of this exact line are already in the cart.
  const inCart =
    cartItems.find((i) =>
      variantLess
        ? i.productId === product.id && i.variantId === null
        : i.variantId === selectedVariant?.id,
    )?.quantity ?? 0;

  const remaining = Math.max(0, lineStock - inCart);

  // Only active products are purchasable. Draft/archived products can be opened
  // by admins in preview mode, but must not be added to the cart.
  const isPurchasable = product.status === "active";

  const canAdd =
    isPurchasable && (variantLess ? remaining > 0 : !!selectedVariant && remaining > 0);

  const handleAddToCart = () => {
    if (!canAdd) return;

    if (variantLess) {
      addItem({
        variantId: null,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: null,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
    } else if (selectedVariant) {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selectedVariant.size,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        stock: selectedVariant.stock,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buttonLabel = !isPurchasable
    ? "Not available in preview"
    : added
      ? "Added to cart ✓"
      : !variantLess && !selectedVariantId
        ? "Select a size"
        : lineStock === 0
          ? "Out of stock"
          : remaining === 0
            ? "Max in cart"
            : "Add to cart";

  const hasMultipleImages = product.images.length > 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Admin-only preview banner — non-active products are hidden from the
          public but reachable by admins to preview before going live. */}
      {product.status !== "active" && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
          <span>
            <strong>{product.status === "draft" ? "Draft preview" : "Archived product"}</strong> —
            not visible to customers. Only admins can see this page.
          </span>
          <Link
            to="/admin/products/$productId"
            params={{ productId: product.id }}
            variant="inline"
            size="none"
          >
            Edit product →
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-faded-foreground text-sm"
      >
        <Link to="/" variant="unstyled" size="none" className="rounded-sm hover:text-primary">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" variant="unstyled" size="none" className="rounded-sm hover:text-primary">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          {hasMultipleImages && (
            <div className="order-2 flex min-w-0 flex-wrap gap-3 sm:order-1 sm:w-20 sm:flex-col sm:flex-nowrap">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative aspect-square w-16 shrink-0 overflow-hidden bg-muted transition-opacity sm:w-20 ${
                    idx === selectedImageIdx ? "" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                  aria-pressed={idx === selectedImageIdx}
                >
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative order-1 aspect-square min-w-0 flex-1 overflow-hidden bg-muted sm:order-2">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.alt ?? product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-col">
          <span className="mb-2 font-medium text-primary text-xs tracking-[0.3em]">
            {CATEGORY_LABELS[product.category]}
          </span>

          <h1 className="mb-4 font-heading text-4xl text-foreground leading-none sm:text-5xl">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-3">
            <p className="font-semibold text-2xl text-foreground tabular-nums">{price}</p>
          </div>

          <p className="mb-8 select-text text-base text-secondary-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Size selector — hidden for variant-less products (stickers) */}
          {!variantLess && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-heading text-foreground text-sm tracking-wider">Select size</p>
                {!selectedVariantId && <p className="text-faded-foreground text-xs">Required</p>}
              </div>
              <SizeSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          {/* Stock note */}
          {remaining > 0 && remaining <= 5 && (
            <p className="mb-4 text-primary text-sm">
              Only {remaining} left
              {inCart > 0 ? ` (you have ${inCart} in cart)` : ""}
            </p>
          )}
          {lineStock > 0 && remaining === 0 && inCart > 0 && (
            <p className="mb-4 text-secondary-foreground text-sm">
              You have all {inCart} available in your cart.
            </p>
          )}

          {/* Add to cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={["mt-2", !variantLess && !selectedVariantId ? "opacity-60" : ""].join(" ")}
          >
            {buttonLabel}
          </Button>

          {/* Details */}
          {product.details && (
            <div className="mt-10 border-border border-t pt-8">
              <h3 className="mb-4 font-heading text-foreground text-sm tracking-wider">Details</h3>
              <ul className="select-text space-y-2 text-secondary-foreground text-sm">
                {product.details
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
