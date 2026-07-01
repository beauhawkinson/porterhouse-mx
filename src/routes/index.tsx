import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { DEFAULT_FEATURED_VARIANT, FEATURED_VARIANTS } from "@/components/home/featured-variants";
import { HomeEditorial } from "@/components/home/HomeEditorial";
import { HomeOriginal } from "@/components/home/HomeOriginal";
import { HomePoster } from "@/components/home/HomePoster";
import { HomePulse } from "@/components/home/HomePulse";
import { PREVIEW_PRODUCTS } from "@/components/home/preview-products";
import { DEFAULT_HOME_VARIANT, HOME_VARIANTS } from "@/components/home/variants";
import { getFeaturedProducts } from "@/lib/server/products";

const searchSchema = z.object({
  // Design-preview selectors. Invalid values fall back to their defaults.
  v: z.enum(HOME_VARIANTS).catch(DEFAULT_HOME_VARIANT).optional(),
  f: z.enum(FEATURED_VARIANTS).catch(DEFAULT_FEATURED_VARIANT).optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loader: () => getFeaturedProducts(),
  component: HomePage,
});

function HomePage() {
  const loaded = Route.useLoaderData();
  // ⚠️ TEMPORARY: fall back to the seed catalog when the DB has no products so
  // the featured layouts can be previewed on prod. Auto-clears once real
  // products exist. Remove with `preview-products.ts`.
  const isPreview = loaded.length === 0;
  const products = isPreview ? PREVIEW_PRODUCTS : loaded;
  const { v = DEFAULT_HOME_VARIANT, f = DEFAULT_FEATURED_VARIANT } = Route.useSearch();

  switch (v) {
    case "pulse":
      return <HomePulse products={products} featured={f} preview={isPreview} />;
    case "editorial":
      return <HomeEditorial products={products} featured={f} preview={isPreview} />;
    case "poster":
      return <HomePoster products={products} featured={f} preview={isPreview} />;
    default:
      return <HomeOriginal products={products} featured={f} preview={isPreview} />;
  }
}
