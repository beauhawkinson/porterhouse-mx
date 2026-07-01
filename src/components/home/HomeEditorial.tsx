import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ABOUT_JEREMY } from "./shared";

import type { FeaturedVariant } from "./featured-variants";
import type { FeaturedProducts } from "./shared";

const FEATURES = [
  { label: "Rider-owned", detail: "Built by a racer, for racers." },
  { label: "Heavyweight cotton", detail: "Made to survive the pits." },
  { label: "Ships from the US", detail: "USPS Ground Advantage." },
];

export function HomeEditorial({
  products,
  featured,
  preview,
}: {
  products: FeaturedProducts;
  featured: FeaturedVariant;
  preview: boolean;
}) {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto grid min-h-[86vh] max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        {/* Left: stacked headline with accent rule */}
        <div className="animate-home-rise">
          <p className="mb-6 font-moto_is_life text-4xl text-primary leading-none sm:text-5xl">
            {app.brand.name}
          </p>
          <div className="flex items-stretch gap-5">
            <span aria-hidden className="w-1.5 shrink-0 bg-primary" />
            <h1 className="font-heading text-7xl text-foreground uppercase leading-[0.82] tracking-tight sm:text-8xl">
              Moto
              <br />
              Is
              <br />
              Life
            </h1>
          </div>
        </div>

        {/* Right: editorial blurb + CTA */}
        <div className="animate-home-rise md:pl-6">
          <p className="mb-8 text-lg text-secondary-foreground leading-relaxed sm:text-xl">
            Premium motocross apparel for the ones who never stopped chasing the next gate drop.
            Heavyweight, hard-wearing, and built for the track — not the trend cycle.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/shop" size="lg" className="group active:scale-[0.99]">
              SHOP THE COLLECTION
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-border border-y bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-px px-6 py-2 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className={`flex items-baseline gap-3 py-6 ${i > 0 ? "sm:border-border sm:border-l sm:pl-8" : ""}`}
            >
              <span className="font-heading text-2xl text-primary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-heading text-foreground text-sm uppercase tracking-widest">
                  {f.label}
                </span>
                <span className="text-faded-foreground text-sm">{f.detail}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pt-32 pb-32 text-center">
        <h2 className="mb-8 font-moto_is_life text-5xl text-foreground leading-none sm:text-7xl">
          About Jeremy
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">{ABOUT_JEREMY}</p>
      </section>

      <FeaturedShowcase products={products} variant={featured} preview={preview} />
    </>
  );
}
