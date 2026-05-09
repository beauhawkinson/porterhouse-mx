import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { app } from "@/lib/config/app.config";
import { getFeaturedProducts } from "@/lib/server/products";

export const Route = createFileRoute("/")({
  loader: () => getFeaturedProducts(),
  component: HomePage,
});

function HomePage() {
  const products = Route.useLoaderData();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-[#FAFAF7]">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 leading-[0.85] tracking-tight">
            <span className="block whitespace-nowrap font-moto_is_life text-[89px] text-foreground sm:text-[144px]">
              {app.brand.name}
            </span>
          </h1>
          <br />

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/shop">
              <Button size="lg" className="group w-full sm:w-auto">
                SHOP NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-end gap-4">
          <h2 className="font-heading text-4xl text-[#111] leading-none">FEATURED GEAR</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="secondary" size="lg">
              VIEW ALL PRODUCTS →
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
