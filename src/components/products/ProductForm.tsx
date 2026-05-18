import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/products/category";

import type { Category, ProductStatus } from "@/lib/db/schema";

// ─── Schema ──────────────────────────────────────────────────────────────

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  details: z.string().optional(),
  priceCents: z.number().int().min(1, "Price must be at least 1 cent"),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.enum(["tshirt", "sweatshirt", "sticker"]),
  status: z.enum(["draft", "active", "archived"]),
  // Only meaningful for stickers; ignored by the server for apparel.
  stock: z.number().int().min(0).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// ─── Component ───────────────────────────────────────────────────────────

type Props = {
  /** When provided, the form is in "edit" mode and pre-fills from this product. */
  initialValues?: Partial<ProductFormValues> & { priceCents?: number };
  /**
   * Called with validated form values on submit.
   * Throw or reject to signal a save error.
   */
  onSubmit: (values: ProductFormValues) => Promise<void>;
  /** Label for the submit button. */
  submitLabel?: string;
  /**
   * Whether the price-change warning should display. Only relevant in edit mode
   * where the parent knows the original priceCents. Pass the original priceCents
   * to enable; omit for create.
   */
  originalPriceCents?: number;
};

export function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Save changes",
  originalPriceCents,
}: Props) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    details: initialValues?.details ?? "",
    priceDollars: initialValues?.priceCents ? (initialValues.priceCents / 100).toFixed(2) : "",
    imageUrl: initialValues?.imageUrl ?? "",
    category: (initialValues?.category ?? "tshirt") as Category,
    status: (initialValues?.status ?? "draft") as ProductStatus,
    stock: initialValues?.stock ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const isSticker = form.category === "sticker";
  const priceCents = Math.round(parseFloat(form.priceDollars) * 100);
  const priceChanged =
    originalPriceCents !== undefined &&
    !Number.isNaN(priceCents) &&
    originalPriceCents !== priceCents;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveMsg("");

    const parsed = productFormSchema.safeParse({
      name: form.name,
      description: form.description,
      details: form.details || undefined,
      priceCents,
      imageUrl: form.imageUrl,
      category: form.category,
      status: form.status,
      stock: isSticker ? form.stock : undefined,
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
      await onSubmit(parsed.data);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      setSaveMsg("Error saving. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" error={errors.name}>
        <Input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full border border-border bg-background px-3 py-2 text-foreground text-sm placeholder:text-faded-foreground focus:border-primary focus:outline-none focus:ring focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        />
      </Field>

      <Field
        label="Details"
        error={errors.details}
        hint="Bullet points or notes shown on the product page. Optional."
      >
        <textarea
          value={form.details}
          onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))}
          rows={5}
          placeholder="Heavyweight cotton blend fleece&#10;Front kangaroo pocket&#10;..."
          className="w-full border border-border bg-background px-3 py-2 text-foreground text-sm placeholder:text-faded-foreground focus:border-primary focus:outline-none focus:ring focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        />
      </Field>

      <Field label="Price (USD)" error={errors.priceCents}>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={form.priceDollars}
          onChange={(e) => setForm((p) => ({ ...p, priceDollars: e.target.value }))}
        />
        {priceChanged && (
          <p className="mt-1 text-amber-700 text-xs">
            Price changed — will create a new Stripe Price and archive the old one.
          </p>
        )}
      </Field>

      <Field label="Image URL" error={errors.imageUrl}>
        <Input
          type="text"
          value={form.imageUrl}
          onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
        />
      </Field>

      <Field label="Category" error={errors.category}>
        <Select
          value={form.category}
          onValueChange={(value) => setForm((p) => ({ ...p, category: value as Category }))}
        >
          <SelectTrigger asChild>
            <Button variant="outline" size="sm">
              <SelectValue />
              <ChevronDown className="size-4" />
            </Button>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tshirt">{CATEGORY_LABELS.tshirt}</SelectItem>
            <SelectItem value="sweatshirt">{CATEGORY_LABELS.sweatshirt}</SelectItem>
            <SelectItem value="sticker">{CATEGORY_LABELS.sticker}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Status"
        error={errors.status}
        hint="Draft hides the product from the shop. Active makes it live."
      >
        <Select
          value={form.status}
          onValueChange={(value) => setForm((p) => ({ ...p, status: value as ProductStatus }))}
        >
          <SelectTrigger asChild>
            <Button variant="outline" size="sm">
              <SelectValue />
              <ChevronDown className="size-4" />
            </Button>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {isSticker && (
        <Field
          label="Stock"
          error={errors.stock}
          hint="Stickers don't have sizes — stock is tracked on the product."
        >
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                stock: Math.max(0, parseInt(e.target.value, 10) || 0),
              }))
            }
            className="w-32"
          />
        </Field>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
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
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-faded-foreground text-xs tracking-wider">{label}</p>
      {children}
      {hint && !error && <p className="mt-1 text-faded-foreground text-xs">{hint}</p>}
      {error && <p className="mt-1 text-red-600 text-xs">{error}</p>}
    </div>
  );
}
