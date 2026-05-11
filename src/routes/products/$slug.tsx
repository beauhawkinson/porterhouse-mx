import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { SizeSelector } from "@/components/products/SizeSelector";
import { Button } from "@/components/ui/button";
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
      <p className="font-heading text-3xl text-[#333]">PRODUCT NOT FOUND</p>
      <Link to="/shop" className="mt-6 inline-block text-[#6B4423] underline">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductDetailPage() {
  const product = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
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

  const stockRemaining = variantLess ? product.stock : (selectedVariant?.stock ?? 0);
  const canAdd = variantLess ? product.stock > 0 : !!selectedVariant && selectedVariant.stock > 0;

  const handleAddToCart = () => {
    if (variantLess) {
      if (product.stock <= 0) return;
      addItem({
        variantId: null,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: null,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
      });
    } else {
      if (!selectedVariant) return;
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selectedVariant.size,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buttonLabel = added
    ? "ADDED TO CART ✓"
    : variantLess
      ? product.stock > 0
        ? "ADD TO CART"
        : "OUT OF STOCK"
      : !selectedVariantId
        ? "SELECT A SIZE"
        : "ADD TO CART";

  const hasMultipleImages = product.images.length > 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[#999] text-sm">
        <Link to="/" className="transition-colors hover:text-[#6B4423]">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="transition-colors hover:text-[#6B4423]">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[#333]">{product.name}</span>
      </nav>

      <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image gallery
            Layout: main image on top, thumbnails below on mobile (column-reverse
            would put thumbs above the image — we want them below for natural
            reading order). On sm+, thumbnails as a column to the left.
            min-w-0 + flex-shrink keep things from busting out of the parent. */}
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          {/* Thumbnails — column on desktop, wrapping row on mobile.
              flex-wrap is the key fix: thumbs reflow instead of overflowing. */}
          {hasMultipleImages && (
            <div className="order-2 flex min-w-0 flex-wrap gap-3 sm:order-1 sm:w-20 sm:flex-col sm:flex-nowrap">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative aspect-square w-16 shrink-0 overflow-hidden bg-[#f5f0eb] transition-all sm:w-20 ${
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

          {/* Selected image */}
          <div className="relative order-1 aspect-square min-w-0 flex-1 overflow-hidden bg-[#f5f0eb] sm:order-2">
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
          <span className="mb-2 font-medium text-primary text-xs uppercase tracking-[0.3em]">
            {CATEGORY_LABELS[product.category]}
          </span>

          <h1 className="mb-4 font-heading text-4xl text-[#111] leading-none sm:text-5xl">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-3">
            <p className="font-semibold text-2xl text-[#3E2A1E]">{price}</p>
          </div>

          <p className="mb-8 text-[#555] text-base leading-relaxed">{product.description}</p>

          {/* Size selector — hidden for variant-less products (stickers) */}
          {!variantLess && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-heading text-[#333] text-sm tracking-wider">SELECT SIZE</p>
                {!selectedVariantId && <p className="text-[#999] text-xs">Required</p>}
              </div>
              <SizeSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          {/* Stock note */}
          {stockRemaining > 0 && stockRemaining <= 5 && (
            <p className="mb-4 text-primary text-sm">Only {stockRemaining} left in stock!</p>
          )}

          {/* Add to cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={[
              "mt-2 transition-all",
              !variantLess && !selectedVariantId ? "opacity-60" : "",
            ].join(" ")}
          >
            {buttonLabel}
          </Button>

          {added && (
            <Link to="/cart">
              <Button variant="secondary" size="md" className="mt-3 w-full">
                VIEW CART →
              </Button>
            </Link>
          )}

          {/* Details */}
          <div className="mt-10 border-[#e5e0d8] border-t pt-8">
            <h3 className="mb-4 font-heading text-[#333] text-sm tracking-wider">DETAILS</h3>
            <ul className="space-y-2 text-[#555] text-sm">
              {variantLess ? (
                <>
                  <li>• Die-cut weatherproof vinyl</li>
                  <li>• UV-coated, scratch-resistant</li>
                  <li>• Built to live outdoors</li>
                  <li>• Ships from the US — USPS Ground Advantage</li>
                </>
              ) : (
                <>
                  <li>• Heavy-weight 100% cotton construction</li>
                  <li>• Screen-printed graphics built for the track</li>
                  <li>• Pre-shrunk for a consistent fit</li>
                  <li>• Ships from the US — USPS Ground Advantage</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
