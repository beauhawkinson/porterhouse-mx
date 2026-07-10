import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db/db";
import { galleryImage } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/admin-guard";
import { uploadImageToR2 } from "@/lib/server/image-upload";
import { deleteR2Object } from "@/lib/server/r2-object";

// ⚠️ TEMPORARY test content: shown only when the gallery table is empty so the
// masonry grid isn't blank before any real uploads. Uses images already in
// /public. These have no DB row, so they're display-only (not deletable) and
// vanish as soon as a real image is uploaded.
const TEST_IMAGES = [
  "/images/products/moto-is-life-hoodie/action-1.jpeg",
  "/images/products/moto-is-life-hoodie/paddock.jpeg",
  "/images/products/checkered-flag-crewneck/front.jpeg",
  "/images/products/moto-is-life-hoodie/action-2.jpeg",
  "/images/products/porterhouse-script-sticker/on-helmet.jpeg",
  "/images/products/moto-is-life-hoodie/back.jpeg",
  "/images/products/checkered-flag-crewneck/detail.jpeg",
  "/images/products/moto-is-life-hoodie/front.jpeg",
];

export type GalleryImage = { id: string | null; url: string };

export const listGalleryImagesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryImage[]> => {
    await requireAdmin(getRequest());

    const rows = await db.query.galleryImage.findMany({
      orderBy: [asc(galleryImage.sortOrder), desc(galleryImage.createdAt)],
    });

    if (rows.length === 0) {
      return TEST_IMAGES.map((url) => ({ id: null, url }));
    }
    return rows.map((r) => ({ id: r.id, url: r.url }));
  },
);

/** Public list for the customer-facing gallery page — no auth, url + alt only. */
export const listPublicGalleryImagesFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await db.query.galleryImage.findMany({
    orderBy: [asc(galleryImage.sortOrder), desc(galleryImage.createdAt)],
  });
  if (rows.length === 0) {
    return TEST_IMAGES.map((url) => ({ url, alt: "" }));
  }
  return rows.map((r) => ({ url: r.url, alt: r.alt ?? "" }));
});

export const uploadGalleryImageFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected multipart form data");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const file = data.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Please provide a valid image file");
    }

    const { url } = await uploadImageToR2(file, "gallery");
    const [row] = await db.insert(galleryImage).values({ url }).returning();
    return { id: row?.id, url };
  });

export const deleteGalleryImageFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const [row] = await db.delete(galleryImage).where(eq(galleryImage.id, data.id)).returning();
    if (row) await deleteR2Object(row.url);
    return { ok: true };
  });
