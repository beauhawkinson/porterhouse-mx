import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ProductCard } from "@/components/products/ProductCard";
import { FilterPill } from "@/components/ui/filter-pill";
import { categoryEnum } from "@/lib/db/schema";
import { CATEGORY_LABELS_PLURAL } from "@/lib/products/category";
import { hasStock } from "@/lib/products/stock";
import { getProducts } from "@/lib/server/products";

const searchSchema = z.object({
  category: z.enum(categoryEnum.enumValues).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loader: () => getProducts(),
  component: ShopPage,
});

function ShopPage() {
  const products = Route.useLoaderData();
  const { category } = Route.useSearch();

  const filtered = category ? products.filter((p) => p.category === category) : products;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="relative mb-8">
        <h1 className="mb-2 font-heading text-3xl text-[#111] sm:text-5xl">The Shop</h1>
        <p className="text-[#666] text-base">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {category && ` in ${CATEGORY_LABELS_PLURAL[category]}`}
        </p>
      </div>

      {/* Category filter */}
      <nav aria-label="Filter by category" className="mb-12 flex flex-wrap gap-2">
        <FilterPill to="/shop" search={{}} active={!category} label="All" />
        {categoryEnum.enumValues.map((c) => (
          <FilterPill
            key={c}
            to="/shop"
            search={{ category: c }}
            active={category === c}
            label={CATEGORY_LABELS_PLURAL[c]}
          />
        ))}
      </nav>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-[#999]">
          <p className="font-heading text-2xl">No Products Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              priceCents={p.priceCents}
              imageUrl={p.imageUrl}
              category={p.category}
              hasStock={hasStock(p)}
              images={p.images}
            />
          ))}
        </div>
      )}
    </div>
  );
}
