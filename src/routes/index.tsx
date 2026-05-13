import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { app } from "@/lib/config/app.config";
import { hasStock } from "@/lib/products/stock";
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
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="z-50 mb-6 leading-[0.85] tracking-tight">
            <span className="z-50 block whitespace-nowrap font-moto_is_life text-[89px] text-foreground sm:text-[144px]">
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

      <section className="mx-auto min-h-screen max-w-3xl px-6 py-24 text-center">
        <h2 className="mb-8 font-moto_is_life text-5xl text-foreground leading-none sm:text-7xl">
          About Jeremy
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">
          Jeremy Porter has been chasing the next jump since he was old enough to twist a throttle.
          What started as a kid tearing up backyard tracks turned into a relentless pursuit of every
          starting gate he could line up behind — local hare scrambles, regional motos, and every
          weekend in between. The bike, the dirt, the noise: it's the only place that's ever made
          sense. This is the ride so far.
        </p>
      </section>

      <section className="mx-auto mb-32 max-w-7xl px-4 py-12 sm:px-6">
        {products.length === 0 ? (
          <div className="py-24 text-center text-[#999]">
            <p className="font-heading text-2xl">No Products Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {products.map((p) => (
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
      </section>
    </>
  );
}
