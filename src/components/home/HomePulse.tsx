import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ProductRequest } from "./ProductRequest";

import type { FeaturedProducts } from "./shared";

const hoodie = (file: string) => `/images/products/moto-is-life-hoodie/${file}`;

export function HomePulse({ products }: { products: FeaturedProducts }) {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-muted via-background to-background">
        {/* Ghosted oversized wordmark behind the brand for depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[140%] -translate-x-1/2 -translate-y-1/2 select-none text-center font-heading text-[24vw] text-primary/[0.06] uppercase leading-none tracking-tighter"
        >
          Moto
        </span>

        <div className="relative z-10 mx-auto max-w-4xl animate-home-rise px-6 text-center">
          <h1 className="mb-6 leading-[0.8] tracking-tight">
            <span className="block whitespace-nowrap font-moto_is_life text-[92px] text-foreground sm:text-[150px]">
              {app.brand.name}
            </span>
          </h1>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/shop" size="lg" className="group w-full active:scale-[0.99] sm:w-auto">
              SHOP NOW
            </Link>
          </div>
        </div>
      </section>

      {/* Rider cards — peek up from below the fold as a scroll cue */}
      <section className="relative z-20 -mt-20 mb-32 flex flex-col items-center justify-center gap-6 overflow-x-clip px-6 sm:-mt-28 sm:flex-row sm:items-start sm:gap-20">
        <div className="aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl sm:w-80 sm:-rotate-[5deg]">
          <img
            src={hoodie("action-1.jpeg")}
            alt="Rider on the track in Moto Is Life gear"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl sm:mt-12 sm:w-[30rem] sm:rotate-[5deg]">
          <img
            src={hoodie("action-2.jpeg")}
            alt="Rider rounding the turn in Moto Is Life gear"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <FeaturedShowcase products={products} />

      <ProductRequest />
    </div>
  );
}
