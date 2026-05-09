import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { SizeSelector } from "@/components/products/SizeSelector";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart/store";
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
  const [added, setAdded] = useState(false);

  const price = (product.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const canAdd = !!selectedVariant && selectedVariant.stock > 0;

  const handleAddToCart = () => {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden bg-[#f5f0eb]">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="mb-2 font-medium text-[#8B5A2B] text-xs tracking-[0.3em]">
            {product.category === "tshirt" ? "T-Shirt" : "Sweatshirt"}
          </span>
          <h1 className="mb-4 font-heading text-4xl text-[#111] leading-none sm:text-5xl">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-3">
            <p className="font-semibold text-2xl text-[#3E2A1E]">{price}</p>
          </div>

          <p className="mb-8 text-[#555] text-base leading-relaxed">{product.description}</p>

          {/* Size selector */}
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

          {/* Stock note */}
          {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
            <p className="mb-4 text-[#8B5A2B] text-sm">
              Only {selectedVariant.stock} left in stock!
            </p>
          )}

          {/* Add to cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={["mt-2 transition-all", !selectedVariantId ? "opacity-60" : ""].join(" ")}
          >
            {added ? "ADDED TO CART ✓" : !selectedVariantId ? "SELECT A SIZE" : "ADD TO CART"}
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
              <li>• Heavy-weight 100% cotton construction</li>
              <li>• Screen-printed graphics built for the track</li>
              <li>• Pre-shrunk for a consistent fit</li>
              <li>• Ships from the US — USPS Ground Advantage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
