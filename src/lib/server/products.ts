import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/db";
import { product, productImage } from "@/lib/db/schema";
import { checkIsAdmin } from "@/lib/server/admin-guard";

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
      where: eq(product.slug, slug),
      with: {
        variants: true,
        images: { orderBy: asc(productImage.sortOrder) },
      },
    });

    if (!p) return null;

    // Non-active products (draft/archived) are only visible to admins so they
    // can preview how a product looks on the storefront before going live.
    if (p.status !== "active" && !(await checkIsAdmin(getRequest()))) {
      return null;
    }

    return p;
  });

// Lightweight existence check used to gate storefront nav (e.g. hide the Shop
// link when the catalog is empty). Only counts products customers can see.
export const hasActiveProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const row = await db.query.product.findFirst({
    where: eq(product.status, "active"),
    columns: { id: true },
  });
  return row !== undefined;
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
