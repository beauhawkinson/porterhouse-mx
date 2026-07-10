import { createFileRoute } from "@tanstack/react-router";

import { app } from "@/lib/config/app.config";
import { listPublicGalleryImagesFn } from "@/lib/server/gallery";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: `Gallery — ${app.brand.name}` }] }),
  loader: () => listPublicGalleryImagesFn(),
  component: GalleryPage,
});

function GalleryPage() {
  const images = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 flex items-center gap-4">
        <span aria-hidden className="h-10 w-1.5 shrink-0 bg-primary" />
        <h1 className="font-moto_is_life text-5xl leading-none sm:text-7xl">Gallery</h1>
      </div>

      {images.length === 0 ? (
        <div className="border border-border px-6 py-24 text-center">
          <p className="font-heading text-foreground uppercase tracking-widest">
            Gallery coming soon
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img) => (
            <div
              key={img.url}
              className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border"
            >
              <img src={img.url} alt={img.alt} loading="lazy" className="block w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
