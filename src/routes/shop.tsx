import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

type Category = "all" | "tshirt" | "sweatshirt";

function ShopPage() {
  const products = Route.useLoaderData();
  const { category: searchCategory } = Route.useSearch();
  const [filter, setFilter] = useState<Category>(searchCategory ?? "all");

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="relative mb-12">
        <h1 className="mb-2 font-heading text-5xl text-[#111]">THE SHOP</h1>
        <p className="text-[#666] text-base">{products.length} products</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-8 flex items-center gap-2 border-[#e5e0d8] border-b pb-4">
        {(["all", "tshirt", "sweatshirt"] as const).map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setFilter(cat)}
            className={[
              "cursor-pointer px-4 py-2 font-heading text-sm tracking-widest transition-all",
              filter === cat ? "bg-[#3E2A1E] text-white" : "text-[#666] hover:text-[#3E2A1E]",
            ].join(" ")}
          >
            {cat === "all" ? "All" : cat === "tshirt" ? "T-Shirts" : "Sweatshirts"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[#999] text-sm">
          <span>{filtered.length} items</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-[#999]">
          <p className="font-heading text-2xl">NO PRODUCTS FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
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
