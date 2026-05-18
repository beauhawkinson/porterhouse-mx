import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/db";
import { product, productImage } from "@/lib/db/schema";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await db.query.product.findMany({
    where: eq(product.status, "active"),
    with: {
      variants: true,
      images: { orderBy: asc(productImage.sortOrder) },
    },
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });
  return products;
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const p = await db.query.product.findFirst({
      where: and(eq(product.slug, slug), eq(product.status, "active")),
      with: {
        variants: true,
        images: { orderBy: asc(productImage.sortOrder) },
      },
    });
    return p ?? null;
  });

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await db.query.product.findMany({
    where: eq(product.status, "active"),
    with: {
      variants: true,
      images: { orderBy: asc(productImage.sortOrder) },
    },
    limit: 6,
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });
  return products;
});
