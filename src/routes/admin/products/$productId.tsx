import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ArchiveProductButton } from "@/components/products/ArchiveProduct";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminProductFn, updateProductFn, updateVariantStockFn } from "@/lib/server/admin";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"] as const;

export const Route = createFileRoute("/admin/products/$productId")({
  loader: ({ params }) => getAdminProductFn({ data: params.productId }),
  component: ProductEditPage,
});

function ProductEditPage() {
  const product = Route.useLoaderData();

  if (!product) {
    return (
      <div className="py-16 text-center text-faded-foreground">
        <p className="font-heading text-xl tracking-wider">Product not found</p>
      </div>
    );
  }

  const isSticker = product.category === "sticker";
  const { id: productId } = product;

  const sortedVariants = [...product.variants].sort(
    (a, b) =>
      SIZE_ORDER.indexOf(a.size as (typeof SIZE_ORDER)[number]) -
      SIZE_ORDER.indexOf(b.size as (typeof SIZE_ORDER)[number]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" variant="muted" size="none">
          ← Back
        </Link>
        <h2 className="font-heading text-foreground text-xl tracking-wider">{product.name}</h2>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          target="_blank"
          variant="inline"
          size="none"
          className="ml-auto"
        >
          Preview on storefront ↗
        </Link>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Product details</TabsTrigger>
          {/* Stock-by-size only applies to apparel; stickers track stock on the
              product itself (edited in the Product details tab). */}
          {!isSticker && <TabsTrigger value="stock">Stock by size</TabsTrigger>}
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <section className="border border-border bg-background p-4">
            <ProductForm
              initialValues={{
                name: product.name,
                description: product.description,
                details: product.details ?? "",
                priceCents: product.priceCents,
                images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
                category: product.category,
                status: product.status,
                stock: product.stock,
              }}
              originalPriceCents={product.priceCents}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                await updateProductFn({
                  data: { productId, ...values },
                });
              }}
            />
          </section>
        </TabsContent>

        {!isSticker && (
          <TabsContent value="stock">
            <section className="border border-border bg-background p-4">
              <h3 className="mb-4 font-heading text-foreground text-sm tracking-wider">
                Stock by size
              </h3>
              <VariantStockEditor variants={sortedVariants} />
            </section>
          </TabsContent>
        )}

        <TabsContent value="danger">
          <section className="border border-border bg-background p-4">
            <h3 className="mb-3 font-heading text-foreground text-sm tracking-wider">
              Danger zone
            </h3>
            <ArchiveProductButton
              productId={product.id}
              productName={product.name}
              currentStatus={product.status}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Variant stock editor (extracted for clarity) ────────────────────

function VariantStockEditor({
  variants,
}: {
  variants: Array<{ id: string; size: string; stock: number }>;
}) {
  // Values are held as raw text so the field can be fully cleared while typing
  // (storing a number would coerce an empty field straight back to 0).
  const [stockValues, setStockValues] = useState<Record<string, string>>(
    Object.fromEntries(variants.map((v) => [v.id, String(v.stock)])),
  );
  // Saved baseline (numeric) — used to detect unsaved changes and to reset
  // dirtiness after a save (the loader data isn't refetched in place).
  const [baseline, setBaseline] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, v.stock])),
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const toNum = (s: string | undefined) => {
    const n = Number.parseInt(s ?? "", 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  };
  const setValue = (id: string, next: string) =>
    setStockValues((prev) => ({ ...prev, [id]: next }));

  const dirty = variants.some((v) => toNum(stockValues[v.id]) !== (baseline[v.id] ?? 0));

  async function handleSaveAll() {
    setSaveMsg("");
    setSaving(true);
    try {
      const changed = variants.filter((v) => toNum(stockValues[v.id]) !== (baseline[v.id] ?? 0));
      await Promise.all(
        changed.map((v) =>
          updateVariantStockFn({ data: { variantId: v.id, stock: toNum(stockValues[v.id]) } }),
        ),
      );
      // Normalize the displayed text to the saved numbers and reset baseline.
      const saved = Object.fromEntries(variants.map((v) => [v.id, toNum(stockValues[v.id])]));
      setStockValues(Object.fromEntries(variants.map((v) => [v.id, String(saved[v.id])])));
      setBaseline(saved);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      console.error(err);
      setSaveMsg("Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {variants.map((v) => {
          const n = toNum(stockValues[v.id]);
          return (
            <div key={v.id} className="flex items-center gap-3">
              <span className="w-10 font-heading text-secondary-foreground text-sm tracking-wider">
                {v.size}
              </span>
              <div className="flex items-center border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none"
                  disabled={n <= 0}
                  aria-label={`Decrease ${v.size} stock`}
                  onClick={() => setValue(v.id, String(Math.max(0, n - 1)))}
                >
                  −
                </Button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={stockValues[v.id] ?? ""}
                  placeholder="0"
                  aria-label={`${v.size} stock`}
                  onChange={(e) => setValue(v.id, e.target.value.replace(/[^0-9]/g, ""))}
                  onBlur={(e) => {
                    if (e.target.value === "") setValue(v.id, "0");
                  }}
                  className="w-12 bg-transparent py-1.5 text-center text-secondary-foreground text-sm tabular-nums outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none"
                  aria-label={`Increase ${v.size} stock`}
                  onClick={() => setValue(v.id, String(n + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" size="sm" disabled={saving || !dirty} onClick={handleSaveAll}>
          {saving ? "Saving…" : "Save all"}
        </Button>
        {saveMsg && (
          <span
            className={`text-sm ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}
          >
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}
