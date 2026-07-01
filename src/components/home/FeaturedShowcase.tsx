import { Link } from "@tanstack/react-router";

import { ProductCard } from "@/components/products/ProductCard";
import AppLink from "@/components/ui/link";
import { CATEGORY_LABELS } from "@/lib/products/category";
import { hasStock } from "@/lib/products/stock";

import type { Category } from "@/lib/db/schema";
import type { FeaturedVariant } from "./featured-variants";
import type { FeaturedProducts } from "./shared";

type Product = FeaturedProducts[number];

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const heroImage = (p: Product) => ({
  url: p.images[0]?.url ?? p.imageUrl,
  alt: p.images[0]?.alt ?? p.name,
});

const label = (category: string) => CATEGORY_LABELS[category as Category] ?? category;

export function FeaturedShowcase({
  products,
  variant,
  preview = false,
}: {
  products: FeaturedProducts;
  variant: FeaturedVariant;
  /** Layout-only preview (fake products) — render fully non-interactive. */
  preview?: boolean;
}) {
  if (products.length === 0) return null;

  const content = (() => {
    switch (variant) {
      case "spotlight":
        return <Spotlight products={products} />;
      case "rail":
        return <Rail products={products} />;
      case "editorial":
        return <Editorial products={products} />;
      default:
        return <Grid products={products} />;
    }
  })();

  // Preview products aren't in the DB, so navigating to them would 404. Disable
  // all interaction so the section reads as a pure layout demo.
  return preview ? <div className="pointer-events-none select-none">{content}</div> : content;
}

// ── Section heading, shared ─────────────────────────────────────────────────

function SectionHeader({ centered = false }: { centered?: boolean }) {
  if (centered) {
    return (
      <div className="mb-12 text-center">
        <p className="mb-2 font-heading text-primary text-xs uppercase tracking-[0.3em]">
          Straight from the paddock
        </p>
        <h2 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Featured</h2>
      </div>
    );
  }
  return (
    <div className="mb-12 flex items-end justify-between border-border border-b pb-6">
      <h2 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Featured</h2>
      <AppLink to="/shop" variant="section" size="none">
        Shop all →
      </AppLink>
    </div>
  );
}

// ── Grid (the original two-up card grid) ────────────────────────────────────

function Grid({ products }: { products: FeaturedProducts }) {
  return (
    <section className="mx-auto mb-32 max-w-6xl px-4 sm:px-6">
      <SectionHeader />
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
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
    </section>
  );
}

// ── Spotlight (first product hero, rest in a smaller grid) ───────────────────

function Spotlight({ products }: { products: FeaturedProducts }) {
  const [hero, ...rest] = products;
  if (!hero) return null;
  const img = heroImage(hero);
  const soldOut = !hasStock(hero);

  return (
    <section className="mx-auto mb-32 max-w-6xl px-4 sm:px-6">
      <SectionHeader />

      {/* Hero product */}
      <Link
        to="/products/$slug"
        params={{ slug: hero.slug }}
        className="group grid items-center gap-8 border border-border bg-muted/30 p-4 sm:p-6 md:grid-cols-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={img.url}
            alt={img.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <span className="border border-foreground/80 px-4 py-1.5 font-medium text-[11px] text-foreground tracking-[0.2em]">
                Sold out
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col md:px-6">
          <p className="mb-2 font-heading text-primary text-xs uppercase tracking-[0.3em]">
            {label(hero.category)} · Featured
          </p>
          <h3 className="font-heading text-4xl text-foreground uppercase leading-[0.95] tracking-tight group-hover:text-primary sm:text-5xl">
            {hero.name}
          </h3>
          <p className="mt-4 font-semibold text-foreground text-xl tabular-nums">
            {fmt(hero.priceCents)}
          </p>
          <span className="mt-6 inline-block font-heading text-foreground text-sm uppercase tracking-[0.2em] underline decoration-2 decoration-primary underline-offset-8">
            View product →
          </span>
        </div>
      </Link>

      {/* Remaining products */}
      {rest.length > 0 && (
        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3">
          {rest.map((p) => (
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
  );
}

// ── Rail (horizontal snap-scroll) ───────────────────────────────────────────

function Rail({ products }: { products: FeaturedProducts }) {
  return (
    <section className="mb-32">
      <div className="mx-auto mb-8 flex max-w-6xl items-end justify-between px-4 sm:px-6">
        <div>
          <p className="mb-2 font-heading text-primary text-xs uppercase tracking-[0.3em]">
            Swipe the lineup
          </p>
          <h2 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Featured</h2>
        </div>
        <AppLink to="/shop" variant="section" size="none">
          Shop all →
        </AppLink>
      </div>

      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div key={p.id} className="w-[270px] shrink-0 snap-start sm:w-[320px]">
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
        {/* Trailing spacer so the last card isn't flush to the edge */}
        <div aria-hidden className="w-2 shrink-0 sm:w-6" />
      </div>
    </section>
  );
}

// ── Editorial (alternating full-width rows) ─────────────────────────────────

function Editorial({ products }: { products: FeaturedProducts }) {
  return (
    <section className="mx-auto mb-32 max-w-5xl px-4 sm:px-6">
      <SectionHeader centered />

      <div className="space-y-20">
        {products.map((p, i) => {
          const img = heroImage(p);
          const flipped = i % 2 === 1;
          const soldOut = !hasStock(p);
          return (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group grid items-center gap-8 md:grid-cols-2"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-muted ${flipped ? "md:order-2" : ""}`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
                    <span className="border border-foreground/80 px-4 py-1.5 font-medium text-[11px] text-foreground tracking-[0.2em]">
                      Sold out
                    </span>
                  </div>
                )}
              </div>
              <div className={flipped ? "md:order-1 md:pr-6" : "md:pl-6"}>
                <p className="mb-2 font-heading text-primary text-xs uppercase tracking-[0.3em]">
                  {String(i + 1).padStart(2, "0")} · {label(p.category)}
                </p>
                <h3 className="font-heading text-3xl text-foreground uppercase leading-none tracking-tight group-hover:text-primary sm:text-4xl">
                  {p.name}
                </h3>
                <p className="mt-3 font-semibold text-foreground text-lg tabular-nums">
                  {fmt(p.priceCents)}
                </p>
                <span className="mt-5 inline-block font-heading text-foreground text-xs uppercase tracking-[0.2em] underline decoration-2 decoration-primary underline-offset-8">
                  View product →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
