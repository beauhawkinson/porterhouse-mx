import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ABOUT_JEREMY, Marquee } from "./shared";

import type { FeaturedVariant } from "./featured-variants";
import type { FeaturedProducts } from "./shared";

export function HomePulse({
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
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-gradient-to-b from-muted via-background to-background">
        {/* Ghosted oversized wordmark behind the brand for depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[140%] -translate-x-1/2 -translate-y-1/2 select-none text-center font-heading text-[24vw] text-primary/[0.06] uppercase leading-none tracking-tighter"
        >
          Moto
        </span>

        <div className="relative z-10 mx-auto max-w-4xl animate-home-rise px-6 text-center">
          <p className="mb-4 font-heading text-primary text-sm uppercase tracking-[0.4em]">
            Rider-owned · Race-bred
          </p>
          <h1 className="mb-6 leading-[0.8] tracking-tight">
            <span className="block whitespace-nowrap font-moto_is_life text-[92px] text-foreground sm:text-[150px]">
              {app.brand.name}
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-md font-heading text-2xl text-secondary-foreground uppercase tracking-wide sm:text-3xl">
            Ride hard. Look harder.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/shop" size="lg" className="group w-full active:scale-[0.99] sm:w-auto">
              SHOP NOW
            </Link>
            <a
              href="#about"
              className="font-heading text-foreground text-sm uppercase tracking-[0.2em] underline decoration-2 decoration-primary underline-offset-8 transition-colors hover:text-primary"
            >
              Meet Jeremy →
            </a>
          </div>
        </div>
      </section>

      <Marquee items={["Moto is life", "Ride or die", "Gate drop", "Send it", "Roost season"]} />

      <section id="about" className="mx-auto max-w-3xl px-6 pt-32 pb-32 text-center">
        <h2 className="mb-8 font-moto_is_life text-5xl text-foreground leading-none sm:text-7xl">
          About Jeremy
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">{ABOUT_JEREMY}</p>
      </section>

      <FeaturedShowcase products={products} variant={featured} preview={preview} />
    </>
  );
}
