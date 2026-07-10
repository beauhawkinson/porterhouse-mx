import { ChevronDown } from "lucide-react";

import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ProductRequest } from "./ProductRequest";

import type { FeaturedProducts } from "./shared";

export function HomePulse({ products, preview }: { products: FeaturedProducts; preview: boolean }) {
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

        {/* Subtle scroll cue hinting there's more below the fold */}
        <ChevronDown
          aria-hidden
          className="absolute bottom-8 left-1/2 z-10 h-6 w-6 -translate-x-1/2 animate-scroll-cue text-secondary-foreground"
        />
      </section>

      <FeaturedShowcase products={products} preview={preview} />

      <ProductRequest />
    </div>
  );
}
