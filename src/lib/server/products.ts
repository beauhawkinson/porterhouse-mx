import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { product, productVariant } from "@/lib/db/schema";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await db.query.product.findMany({
    with: { variants: true },
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });
  return products;
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const p = await db.query.product.findFirst({
      where: eq(product.slug, slug),
      with: { variants: true },
    });
    return p ?? null;
  });

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await db.query.product.findMany({
    with: { variants: true },
    limit: 6,
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });
  return products;
});
