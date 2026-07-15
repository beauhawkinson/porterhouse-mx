import { useEffect, useState } from "react";

import Link from "@/components/ui/link";
import { app } from "@/lib/config/app.config";
import { FeaturedShowcase } from "./FeaturedShowcase";
import { ProductRequest } from "./ProductRequest";
import { RaceNumber } from "./RaceNumber";

import type { FeaturedProducts } from "./shared";

// Full-bleed hero that slowly crossfades through the action shots. Fade only
// (no slide); the first image is the LCP so it loads eagerly, the rest lazily.
// `position` tunes the crop per shot — action-1 is portrait, so anchor top to
// keep the rider's head + sweatshirt in frame while it fills the full width.
const HERO_IMAGES = [
  {
    src: "/images/action-2.jpeg",
    alt: "Rider rounding the turn in Moto Is Life gear",
    position: "object-center",
  },
  {
    src: "/images/action-1.jpeg",
    alt: "Rider on the track in Moto Is Life gear",
    position: "object-top",
  },
  { src: "/images/action-3.jpg", alt: "Rider in Moto Is Life gear", position: "object-center" },
];
const HERO_INTERVAL_MS = 6000;

export function HomePulse({ products }: { products: FeaturedProducts }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % HERO_IMAGES.length), HERO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end overflow-hidden">
        {HERO_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={i === 0 ? img.alt : ""}
            aria-hidden={i !== active}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover ${img.position} transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Scrim so the bottom-left copy stays legible over any shot */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />

        {/* Client race number — outlined accent, bottom-right, opposite the wordmark */}
        <RaceNumber className="pointer-events-none absolute right-6 bottom-10 z-10 w-28 opacity-80 sm:right-10 sm:bottom-14 sm:w-44" />

        <div className="relative z-10 mx-auto w-full max-w-6xl animate-home-rise px-6 pb-16 sm:pb-20">
          <h1 className="mb-6 leading-[0.8]">
            <span className="block font-moto_is_life text-[64px] text-foreground leading-none sm:text-[110px] lg:text-[132px]">
              {app.brand.name}
            </span>
          </h1>
          <Link to="/shop" size="lg" className="active:scale-[0.99]">
            SHOP NOW
          </Link>
        </div>
      </section>

      <FeaturedShowcase products={products} />

      <ProductRequest />
    </div>
  );
}
