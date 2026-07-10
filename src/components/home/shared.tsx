import type { getFeaturedProducts } from "@/lib/server/products";

export type FeaturedProducts = Awaited<ReturnType<typeof getFeaturedProducts>>;
