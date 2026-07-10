import { createFileRoute } from "@tanstack/react-router";

import { HomePulse } from "@/components/home/HomePulse";
import { PREVIEW_PRODUCTS } from "@/components/home/preview-products";
import { getFeaturedProducts } from "@/lib/server/products";

export const Route = createFileRoute("/")({
  loader: () => getFeaturedProducts(),
  component: HomePage,
});

function HomePage() {
  const loaded = Route.useLoaderData();
  // ⚠️ TEMPORARY: fall back to the seed catalog when the DB has no products so
  // the featured section can be previewed on prod. Auto-clears once real
  // products exist. Remove with `preview-products.ts`.
  const isPreview = loaded.length === 0;
  const products = isPreview ? PREVIEW_PRODUCTS : loaded;

  return <HomePulse products={products} preview={isPreview} />;
}
