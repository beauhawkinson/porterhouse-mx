import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ProductCard } from "@/components/products/ProductCard";
import { getProducts } from "@/lib/server/products";

const searchSchema = z.object({
  category: z.enum(["tshirt", "sweatshirt"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loader: () => getProducts(),
  component: ShopPage,
});

function ShopPage() {
  const products = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="relative mb-12">
        <h1 className="mb-2 font-heading text-5xl text-[#111]">The Shop</h1>
        <p className="text-[#666] text-base">{products.length} products</p>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center text-[#999]">
          <p className="font-heading text-2xl">No Products Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              priceCents={p.priceCents}
              imageUrl={p.imageUrl}
              category={p.category}
              hasStock={p.variants.some((v) => v.stock > 0)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
