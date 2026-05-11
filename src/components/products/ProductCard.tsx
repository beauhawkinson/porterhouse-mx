import { Link } from "@tanstack/react-router";
import { useState } from "react";

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
    <article aria-label={`${name}, ${price}`} className="flex flex-col gap-4 sm:gap-6">
      {/* Header: category, name, price */}
      <Link
        to="/products/$slug"
        params={{ slug }}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <p className="font-medium text-faded-foreground text-xs uppercase tracking-[0.2em]">
          {categoryLabel}
        </p>
        <h3 className="mt-1 font-heading text-2xl leading-tight tracking-wide transition-colors group-hover:text-primary sm:text-3xl">
          {name}
        </h3>
        <p className="mt-3 font-semibold text-muted-foreground text-xl sm:text-xl">{price}</p>
      </Link>

      {/* Gallery: main image + thumbnails — fixed column template so cards
          stay the same width whether or not thumbnails are present. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_12rem] sm:gap-4">
        {/* Main image — links to product detail */}
        <Link
          to="/products/$slug"
          params={{ slug }}
          aria-label={`View details for ${name}`}
          className="group relative block overflow-hidden bg-[#f5f0eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={selected.url}
              alt={selected.alt ?? name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {!hasStock && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm"
                aria-hidden="true"
              >
                <span className="font-heading text-[#333] text-sm tracking-[0.25em] sm:text-base">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
          {!hasStock && <span className="sr-only">Out of stock</span>}
        </Link>

        {/* Thumbnails — column is always reserved (12rem) so single-image
            cards don't blow up. When there's only one image, this slot is
            simply empty. */}
        {gallery.length > 1 && (
          <div className="grid w-full max-w-[20rem] grid-cols-3 gap-2 self-start sm:max-w-none sm:gap-3">
            {gallery.map((image, idx) => {
              const isSelected = selected.url === image.url;
              return (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setSelected(image)}
                  aria-label={image.alt ?? `View image ${idx + 1} of ${name}`}
                  aria-pressed={isSelected}
                  className={`relative aspect-square overflow-hidden bg-[#f5f0eb] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isSelected ? "opacity-100" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
