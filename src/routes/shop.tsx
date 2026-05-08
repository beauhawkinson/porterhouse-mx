import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { getProducts } from "@/lib/server/products";
import { ProductCard } from "@/components/products/ProductCard";
import { Splatter1, Splatter3 } from "@/components/splatter";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="relative mb-12">
        <Splatter1
          className="absolute -top-4 -right-4 w-40 opacity-15 rotate-12"
          color="#3E2A1E"
        />
        <h1 className="font-heading text-5xl text-[#111] mb-2">THE SHOP</h1>
        <p className="text-[#666] text-base">
          {products.length} products — ride-ready apparel for serious racers.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-[#e5e0d8] pb-4">
        {(["all", "tshirt", "sweatshirt"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={[
              "font-heading text-sm tracking-widest px-4 py-2 transition-all cursor-pointer",
              filter === cat
                ? "bg-[#3E2A1E] text-white"
                : "text-[#666] hover:text-[#3E2A1E]",
            ].join(" ")}
          >
            {cat === "all" ? "ALL" : cat === "tshirt" ? "T-SHIRTS" : "SWEATSHIRTS"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm text-[#999]">
          <Splatter3 className="w-4 opacity-60" color="#8B5A2B" />
          <span>{filtered.length} items</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-[#999]">
          <p className="font-heading text-2xl">NO PRODUCTS FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
