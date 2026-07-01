import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ABOUT_JEREMY } from "./shared";

import type { FeaturedVariant } from "./featured-variants";
import type { FeaturedProducts } from "./shared";

export function HomeOriginal({
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
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="z-50 mb-6 leading-[0.85] tracking-tight">
            <span className="z-50 block whitespace-nowrap font-moto_is_life text-[89px] text-foreground sm:text-[144px]">
              {app.brand.name}
            </span>
          </h1>
          <br />
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/shop" size="lg" className="group w-full active:scale-[0.99] sm:w-auto">
              SHOP NOW
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pt-40 pb-40 text-center">
        <h2 className="mb-8 font-moto_is_life text-5xl text-foreground leading-none sm:text-7xl">
          About Jeremy
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">{ABOUT_JEREMY}</p>
      </section>

      <FeaturedShowcase products={products} variant={featured} preview={preview} />
    </>
  );
}
