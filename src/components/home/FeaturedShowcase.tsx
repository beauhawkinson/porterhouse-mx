import { useRouteContext } from "@tanstack/react-router";

import { ProductCard } from "@/components/products/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import AppLink from "@/components/ui/link";
import Link from "@/components/ui/link";
import { CATEGORY_LABELS } from "@/lib/products/category";
import { hasStock } from "@/lib/products/stock";

import type { Category } from "@/lib/db/schema";
import type { FeaturedProducts } from "./shared";

type Product = FeaturedProducts[number];

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const heroImage = (p: Product) => ({
  url: p.images[0]?.url ?? p.imageUrl,
  alt: p.images[0]?.alt ?? p.name,
});

const label = (category: string) => CATEGORY_LABELS[category as Category] ?? category;

export function FeaturedShowcase({ products }: { products: FeaturedProducts }) {
  if (products.length === 0) return <EmptyFeatured />;

  return <Spotlight products={products} />;
}

// ── Empty state — keeps the front page from collapsing before any products ───

function EmptyFeatured() {
  const { isAdmin } = useRouteContext({ from: "__root__" });

  return (
    <section className="mx-auto mb-40 flex min-h-[55vh] max-w-6xl flex-col items-center justify-center px-4 pt-24 text-center sm:px-6 sm:pt-32">
      <div className="flex items-center gap-4">
        <span aria-hidden className="h-10 w-1.5 shrink-0 bg-primary" />
        <h2 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Featured</h2>
      </div>
      <p className="mt-6 font-heading text-muted-foreground text-sm uppercase tracking-[0.3em]">
        New drops coming soon
      </p>

      {isAdmin && (
        <AppLink to="/admin/products/new" size="md" className="mt-8">
          Create product
        </AppLink>
      )}
    </section>
  );
}

// ── Gate number plate — starting-gate motif shared across the featured tiles ──

function GatePlate({ n, size = "sm" }: { n: number; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "h-11 w-11 text-lg" : "h-8 w-8 text-sm";
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-3 left-3 z-10 flex items-center justify-center border border-foreground/70 bg-background/85 font-heading text-foreground leading-none backdrop-blur-sm ${dims}`}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Spotlight({ products }: { products: FeaturedProducts }) {
  const [hero, ...rest] = products;
  if (!hero) return null;
  const img = heroImage(hero);
  const soldOut = !hasStock(hero);

  return (
    <section className="mx-auto mb-40 max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-10 w-1.5 shrink-0 bg-primary" />
          <h2 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Featured</h2>
        </div>
        <AppLink to="/shop" variant="outline" size="sm" className="shrink-0">
          Shop all →
        </AppLink>
      </div>

      {/* Hero product */}
      <Link
        to="/products/$slug"
        variant="outline"
        params={{ slug: hero.slug }}
        className="group grid items-center gap-8 md:grid-cols-2 md:gap-12"
      >
        <div className="relative -ml-2 aspect-[4/3] overflow-hidden">
          <img
            src={img.url}
            alt={img.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <GatePlate n={1} size="lg" />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <span className="border border-foreground/80 px-4 py-1.5 font-medium text-[11px] text-foreground tracking-[0.2em]">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col md:pr-6">
          <p className="mb-3 font-heading text-primary text-xs uppercase tracking-[0.3em]">
            {label(hero.category)}
          </p>
          <h3 className="font-heading text-4xl text-foreground uppercase leading-[0.9] tracking-tight transition-colors group-hover:text-primary sm:text-6xl">
            {hero.name}
          </h3>
          <p className="mt-5 font-semibold text-2xl text-foreground tabular-nums">
            {fmt(hero.priceCents)}
          </p>
          <span className={`${buttonVariants({ variant: "primary", size: "md" })} mt-8 self-start`}>
            View product →
          </span>
        </div>
      </Link>

      {/* Remaining products — lined up on the gate */}
      {rest.length > 0 && (
        <div className="mt-24 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-28 sm:grid-cols-3">
          {rest.map((p, i) => (
            <div key={p.id} className="relative">
              <GatePlate n={i + 2} />
              <ProductCard
                slug={p.slug}
                name={p.name}
                priceCents={p.priceCents}
                imageUrl={p.imageUrl}
                category={p.category}
                hasStock={hasStock(p)}
                images={p.images}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
