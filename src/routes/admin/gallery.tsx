import { createFileRoute, useRouter } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { UPLOAD_ACCEPT, UPLOAD_MAX_SIZE } from "@/lib/products/upload-constants";
import {
  deleteGalleryImageFn,
  listGalleryImagesFn,
  uploadGalleryImageFn,
} from "@/lib/server/gallery";

export const Route = createFileRoute("/admin/gallery")({
  loader: () => listGalleryImagesFn(),
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  const images = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    if (files.length === 0) return;

    setError("");
    setBusy(true);
    try {
      for (const file of files) {
        if (file.size > UPLOAD_MAX_SIZE) {
          setError(`"${file.name}" is larger than 5MB and was skipped.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        await uploadGalleryImageFn({ data: fd });
      }
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError("");
    try {
      await deleteGalleryImageFn({ data: { id } });
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-foreground text-xl uppercase tracking-wider">Gallery</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Upload images to the gallery. JPEG, PNG, or WebP up to 5MB.
          </p>
        </div>

        <label
          className={`${buttonVariants({ variant: "primary", size: "sm" })} shrink-0 cursor-pointer ${
            busy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {busy ? "Uploading…" : "Add images"}
          <input
            type="file"
            accept={UPLOAD_ACCEPT}
            multiple
            onChange={handleFiles}
            disabled={busy}
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {images.length === 0 ? (
        <div className="border border-border px-6 py-16 text-center">
          <p className="font-heading text-foreground">NO IMAGES YET</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Add images and they'll appear in the gallery.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3">
          {images.map((img) => (
            <div
              key={img.url}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border"
            >
              <img src={img.url} alt="" loading="lazy" className="block w-full" />
              {img.id && (
                <button
                  type="button"
                  onClick={() => handleDelete(img.id as string)}
                  disabled={busy}
                  aria-label="Delete image"
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
