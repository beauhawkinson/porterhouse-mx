import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ArchiveProductButton } from "@/components/products/ArchiveProduct";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "@/components/ui/link";
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product form */}
        <section className="border border-border bg-background p-4">
          <h3 className="mb-4 font-heading text-foreground text-sm tracking-wider">
            Product details
          </h3>
          <ProductForm
            initialValues={{
              name: product.name,
              description: product.description,
              details: product.details ?? "",
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
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

        {/* Stock editor — only meaningful for apparel */}
        {!isSticker && (
          <section className="border border-border bg-background p-4">
            <h3 className="mb-4 font-heading text-foreground text-sm tracking-wider">
              Stock by size
            </h3>
            <VariantStockEditor variants={sortedVariants} />
          </section>
        )}
      </div>
      <section className="border border-border bg-background p-4">
        <h3 className="mb-3 font-heading text-foreground text-sm tracking-wider">Danger zone</h3>
        <ArchiveProductButton
          productId={product.id}
          productName={product.name}
          currentStatus={product.status}
        />
      </section>
    </div>
  );
}

// ─── Variant stock editor (extracted for clarity) ────────────────────

function VariantStockEditor({
  variants,
}: {
  variants: Array<{ id: string; size: string; stock: number }>;
}) {
  const [stockValues, setStockValues] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, v.stock])),
  );
  const [stockSaving, setStockSaving] = useState<Record<string, boolean>>({});

  async function handleStockSave(variantId: string) {
    setStockSaving((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateVariantStockFn({
        data: { variantId, stock: stockValues[variantId] ?? 0 },
      });
    } finally {
      setStockSaving((prev) => ({ ...prev, [variantId]: false }));
    }
  }

  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v.id} className="flex items-center gap-3">
          <span className="w-10 font-heading text-secondary-foreground text-sm tracking-wider">
            {v.size}
          </span>
          <Input
            type="number"
            min="0"
            value={stockValues[v.id] ?? 0}
            onChange={(e) =>
              setStockValues((prev) => ({
                ...prev,
                [v.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
              }))
            }
            className="w-20"
          />
          <Button
            variant="muted"
            size="none"
            disabled={stockSaving[v.id]}
            onClick={() => handleStockSave(v.id)}
          >
            {stockSaving[v.id] ? "Saving…" : "Save"}
          </Button>
        </div>
      ))}
    </div>
  );
}
