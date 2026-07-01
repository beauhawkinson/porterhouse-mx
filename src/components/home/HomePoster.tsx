import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ABOUT_JEREMY, Marquee } from "./shared";

import type { FeaturedVariant } from "./featured-variants";
import type { FeaturedProducts } from "./shared";

export function HomePoster({
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
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden border-border border-b bg-muted/50">
        {/* Subtle diagonal track texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,0.025) 22px 24px)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-5xl animate-home-rise flex-col items-center px-6 text-center">
          <span className="mb-3 inline-block bg-primary px-4 py-1 font-heading text-primary-foreground text-xs uppercase tracking-[0.35em]">
            Est. on the gate
          </span>

          {/* Giant wordmark with the script brand overlapping it */}
          <div className="relative flex items-center justify-center">
            <span
              aria-hidden
              className="select-none font-heading text-[19vw] text-foreground/[0.07] uppercase leading-none tracking-tighter sm:text-[15vw]"
            >
              Porterhouse
            </span>
            <span className="absolute whitespace-nowrap font-moto_is_life text-[74px] text-foreground sm:text-[128px]">
              {app.brand.name}
            </span>
          </div>

          <p className="mt-6 mb-10 max-w-lg text-lg text-secondary-foreground leading-relaxed">
            Motocross gear built for the dirt, the noise, and the send. Ride hard — look harder.
          </p>

          <Link to="/shop" size="lg" className="group active:scale-[0.99]">
            SHOP THE DROP
          </Link>
        </div>
      </section>

      <Marquee items={["New drop", "Moto is life", "Limited runs", "Ride or die", "Gate drop"]} />

      <div className="mt-24">
        <FeaturedShowcase products={products} variant={featured} preview={preview} />
      </div>

      <section className="mx-auto max-w-3xl border-border border-t px-6 pt-28 pb-32 text-center">
        <h2 className="mb-8 font-moto_is_life text-5xl text-foreground leading-none sm:text-7xl">
          About Jeremy
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">{ABOUT_JEREMY}</p>
      </section>
    </>
  );
}
