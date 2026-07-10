import { createFileRoute } from "@tanstack/react-router";

import { HomePulse } from "@/components/home/HomePulse";
import { getFeaturedProducts } from "@/lib/server/products";

export const Route = createFileRoute("/")({
  loader: () => getFeaturedProducts(),
  component: HomePage,
});

function HomePage() {
  const products = Route.useLoaderData();

  return <HomePulse products={products} />;
}
