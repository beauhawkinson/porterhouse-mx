import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getProductBySlug } from "@/lib/server/products";
import { SizeSelector } from "@/components/products/SizeSelector";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart/store";
import { Splatter2, Splatter5 } from "@/components/splatter";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    return getProductBySlug({ data: params.slug }).then((p) => {
      if (!p) throw notFound();
      return p;
    });
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="text-center py-32">
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#999] mb-8">
        <Link to="/" className="hover:text-[#6B4423] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#6B4423] transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-[#333]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative">
          <Splatter2
            className="absolute -top-6 -right-6 w-32 opacity-20 rotate-12 pointer-events-none"
            color="#6B4423"
          />
          <div className="aspect-square bg-[#f5f0eb] overflow-hidden relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-xs tracking-[0.3em] text-[#8B5A2B] font-medium uppercase mb-2">
            {product.category === "tshirt" ? "T-Shirt" : "Sweatshirt"}
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl text-[#111] leading-none mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <p className="text-2xl font-semibold text-[#3E2A1E]">{price}</p>
            <Splatter5 className="w-8 opacity-50" color="#8B5A2B" />
          </div>

          <p className="text-[#555] text-base leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Size selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading text-sm tracking-wider text-[#333]">SELECT SIZE</p>
              {!selectedVariantId && (
                <p className="text-xs text-[#999]">Required</p>
              )}
            </div>
            <SizeSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          </div>

          {/* Stock note */}
          {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
            <p className="text-sm text-[#8B5A2B] mb-4">
              Only {selectedVariant.stock} left in stock!
            </p>
          )}

          {/* Add to cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={[
              "mt-2 transition-all",
              !selectedVariantId ? "opacity-60" : "",
            ].join(" ")}
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
          <div className="mt-10 pt-8 border-t border-[#e5e0d8]">
            <h3 className="font-heading text-sm tracking-wider text-[#333] mb-4">DETAILS</h3>
            <ul className="space-y-2 text-sm text-[#555]">
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
