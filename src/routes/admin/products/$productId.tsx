import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminProductFn, updateProductFn, updateVariantStockFn } from "@/lib/server/admin";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"] as const;

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceCents: z.number().int().min(1, "Price must be at least 1 cent"),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.enum(["tshirt", "sweatshirt"]),
});

export const Route = createFileRoute("/admin/products/$productId")({
  loader: ({ params }) => getAdminProductFn({ data: params.productId }),
  component: ProductEditPage,
});

function ProductEditPage() {
  const product = Route.useLoaderData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    priceDollars: product ? (product.priceCents / 100).toFixed(2) : "",
    imageUrl: product?.imageUrl ?? "",
    category: (product?.category ?? "tshirt") as "tshirt" | "sweatshirt",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [stockValues, setStockValues] = useState<Record<string, number>>(
    Object.fromEntries((product?.variants ?? []).map((v) => [v.id, v.stock])),
  );
  const [stockSaving, setStockSaving] = useState<Record<string, boolean>>({});

  if (!product) {
    return (
      <div className="py-16 text-center text-[#999]">
        <p className="font-heading text-xl">PRODUCT NOT FOUND</p>
      </div>
    );
  }

  const sortedVariants = [...product.variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size as (typeof SIZE_ORDER)[number]) - SIZE_ORDER.indexOf(b.size as (typeof SIZE_ORDER)[number]),
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveMsg("");

    const parsed = productFormSchema.safeParse({
      name: form.name,
      description: form.description,
      priceCents: Math.round(parseFloat(form.priceDollars) * 100),
      imageUrl: form.imageUrl,
      category: form.category,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await updateProductFn({
        data: { productId: product.id, ...parsed.data },
      });
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      setSaveMsg("Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/products" })}
          className="text-sm text-[#999] hover:text-[#333]"
        >
          ← Back
        </button>
        <h2 className="font-heading text-xl tracking-wider text-[#111]">{product.name}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product form */}
        <section className="border border-[#e5e0d8] bg-white p-4">
          <h3 className="mb-4 font-heading text-sm tracking-wider text-[#333]">PRODUCT DETAILS</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Name" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-[#e5e0d8] px-3 py-2 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none"
              />
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full border border-[#e5e0d8] px-3 py-2 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none"
              />
            </Field>

            <Field label="Price (USD)" error={errors.priceCents}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.priceDollars}
                onChange={(e) => setForm((p) => ({ ...p, priceDollars: e.target.value }))}
                className="w-full border border-[#e5e0d8] px-3 py-2 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none"
              />
              {product.priceCents !== Math.round(parseFloat(form.priceDollars) * 100) &&
                !isNaN(parseFloat(form.priceDollars)) && (
                  <p className="mt-1 text-xs text-amber-700">
                    Price changed — will create a new Stripe Price and archive the old one.
                  </p>
                )}
            </Field>

            <Field label="Image URL" error={errors.imageUrl}>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full border border-[#e5e0d8] px-3 py-2 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none"
              />
            </Field>

            <Field label="Category" error={errors.category}>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, category: value as "tshirt" | "sweatshirt" }))
                }
              >
                <SelectTrigger className="w-full border border-[#e5e0d8] px-3 py-2 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tshirt">T-Shirt</SelectItem>
                  <SelectItem value="sweatshirt">Sweatshirt</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save Product"}
              </Button>
              {saveMsg && (
                <span
                  className={`text-sm ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Stock editor */}
        <section className="border border-[#e5e0d8] bg-white p-4">
          <h3 className="mb-4 font-heading text-sm tracking-wider text-[#333]">STOCK BY SIZE</h3>
          <div className="space-y-3">
            {sortedVariants.map((v) => (
              <div key={v.id} className="flex items-center gap-3">
                <span className="w-10 font-heading text-sm tracking-wider text-[#555]">
                  {v.size}
                </span>
                <input
                  type="number"
                  min="0"
                  value={stockValues[v.id] ?? 0}
                  onChange={(e) =>
                    setStockValues((prev) => ({
                      ...prev,
                      [v.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="w-20 border border-[#e5e0d8] px-2 py-1.5 text-sm text-[#333] focus:border-[#8B5A2B] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={stockSaving[v.id]}
                  onClick={() => handleStockSave(v.id)}
                  className="text-xs text-[#6B4423] underline hover:text-[#3E2A1E] disabled:opacity-50"
                >
                  {stockSaving[v.id] ? "Saving…" : "Save"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[#999] uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
