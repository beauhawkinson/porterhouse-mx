import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/products/category";

import type { Category } from "@/lib/db/schema";

type ProductImage = { url: string; alt: string | null };

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category: string;
  hasStock: boolean;
  images: ProductImage[];
};

export function ProductCard({
  slug,
  name,
  priceCents,
  imageUrl,
  category,
  hasStock,
  images,
}: Props) {
  const price = (priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const gallery: ProductImage[] = images.length > 0 ? images : [{ url: imageUrl, alt: name }];

  const [selected, setSelected] = useState<ProductImage>(gallery[0]!);

  const categoryLabel = CATEGORY_LABELS[category as Category] ?? category;

  return (
    <article aria-label={`${name}, ${price}`} className="group/card flex flex-col bg-background">
      {/* Image — primary visual */}
      <Link
        to="/products/$slug"
        params={{ slug }}
        aria-label={`View details for ${name}`}
        className="relative block overflow-hidden bg-background focus-visible:border focus-visible:border-primary focus-visible:outline-none"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={selected.url}
            alt={selected.alt ?? name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          {/* Sold out overlay */}
          {!hasStock && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]"
              aria-hidden="true"
            >
              <span className="border border-foreground/80 px-4 py-1.5 font-medium text-[11px] text-foreground tracking-[0.2em]">
                Sold out
              </span>
            </div>
          )}

          {!hasStock && <span className="sr-only">Out of stock</span>}
        </div>
      </Link>

      {/* Thumbnails — compact strip directly under image */}
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2">
          {gallery.slice(0, 5).map((image, idx) => {
            const isSelected = selected.url === image.url;
            return (
              <Button
                key={image.url}
                variant="outline"
                size="none"
                onClick={() => setSelected(image)}
                aria-label={image.alt ?? `View image ${idx + 1} of ${name}`}
                aria-pressed={isSelected}
                className={`relative aspect-square w-14 overflow-hidden ${
                  isSelected ? "" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-13 w-13 object-cover"
                />
              </Button>
            );
          })}
        </div>
      )}

      {/* Info block — clean hierarchy: eyebrow → name → price */}
      <Link
        to="/products/$slug"
        params={{ slug }}
        className="mt-4 block border border-transparent focus-visible:border focus-visible:border-primary focus-visible:outline-none"
      >
        <p className="font-medium text-[10px] text-muted-foreground tracking-[0.18em]">
          {categoryLabel}
        </p>
        <h3 className="mt-1.5 font-heading text-base text-foreground leading-snug group-hover/card:text-primary sm:text-lg">
          {name}
        </h3>
        <p className="mt-1.5 font-semibold text-foreground text-sm tabular-nums sm:text-base">
          {price}
        </p>
      </Link>
    </article>
  );
}
