import { ArrowDown, ArrowUp, ChevronDown, Star, X } from "lucide-react";
import { useRef, useState } from "react";
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
import { UPLOAD_ACCEPT, UPLOAD_MAX_SIZE } from "@/lib/products/upload-constants";
import { uploadProductImageFn } from "@/lib/server/uploads";

import type { Category, ProductStatus } from "@/lib/db/schema";

// ─── Schema ──────────────────────────────────────────────────────────────

const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
});

export type ProductImageInput = z.infer<typeof productImageSchema>;

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  details: z.string().optional(),
  priceCents: z.number().int().min(1, "Price must be at least 1 cent"),
  // Ordered gallery. The first image is the primary one used on cards, the
  // cart, and Stripe Checkout (mirrored onto product.imageUrl by the server).
  images: z.array(productImageSchema).min(1, "At least one image is required"),
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
    images: (initialValues?.images ?? []) as ProductImageInput[],
    category: (initialValues?.category ?? "tshirt") as Category,
    status: (initialValues?.status ?? "draft") as ProductStatus,
    stock: initialValues?.stock ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const isSticker = form.category === "sticker";
  const priceCents = Math.round(parseFloat(form.priceDollars) * 100);
  const priceChanged =
    originalPriceCents !== undefined &&
    !Number.isNaN(priceCents) &&
    originalPriceCents !== priceCents;

  function setImages(next: ProductImageInput[]) {
    setForm((p) => ({ ...p, images: next }));
    if (next.length > 0) {
      setErrors((prev) => {
        const { images: _removed, ...rest } = prev;
        return rest;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveMsg("");

    const parsed = productFormSchema.safeParse({
      name: form.name,
      description: form.description,
      details: form.details || undefined,
      priceCents,
      images: form.images,
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
          placeholder="e.g. Moto Is Life Tee"
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          placeholder="Short description shown on the product page."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm outline-none placeholder:text-faded-foreground focus-visible:border-primary"
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
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm outline-none placeholder:text-faded-foreground focus-visible:border-primary"
        />
      </Field>

      <Field label="Price (USD)" error={errors.priceCents}>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={form.priceDollars}
          placeholder="0.00"
          onChange={(e) => setForm((p) => ({ ...p, priceDollars: e.target.value }))}
        />
        {priceChanged && (
          <p className="mt-1 text-amber-700 text-xs">
            Price changed — will create a new Stripe Price and archive the old one.
          </p>
        )}
      </Field>

      <Field
        label="Product images"
        error={errors.images}
        hint="Upload JPEG, PNG, or WebP (max 5MB each). The first image is the primary one shown on cards and checkout — reorder to change it."
      >
        <ImageManager images={form.images} onChange={setImages} onUploadingChange={setUploading} />
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
        <Button type="submit" size="sm" disabled={saving || uploading}>
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

// ─── Image manager ─────────────────────────────────────────────────────────

function ImageManager({
  images,
  onChange,
  onUploadingChange,
}: {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onUploadingChange(busy);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Reset so selecting the same file(s) again still fires onChange.
    e.target.value = "";
    if (files.length === 0) return;

    setUploadError("");
    setBusy(true);
    try {
      const uploaded: ProductImageInput[] = [];
      for (const file of files) {
        if (file.size > UPLOAD_MAX_SIZE) {
          setUploadError(`"${file.name}" is larger than 5MB and was skipped.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadProductImageFn({ data: fd });
        uploaded.push({ url, alt: "" });
      }
      if (uploaded.length > 0) onChange([...images, ...uploaded]);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item!);
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function setAlt(index: number, alt: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((img, idx) => (
            <li
              key={img.url}
              className="flex items-start gap-3 border border-border bg-secondary/40 p-2"
            >
              <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-secondary">
                <img
                  src={img.url}
                  alt={img.alt || "Product image"}
                  className="size-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-primary/90 py-0.5 text-[10px] text-primary-foreground">
                    <Star className="size-2.5 fill-current" />
                    Primary
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <Input
                  type="text"
                  value={img.alt ?? ""}
                  placeholder="Alt text (optional)"
                  onChange={(e) => setAlt(idx, e.target.value)}
                />
                <p className="truncate text-[11px] text-faded-foreground">{img.url}</p>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <div className="flex gap-1">
                  <IconButton label="Move up" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    <ArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={idx === images.length - 1}
                    onClick={() => move(idx, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </IconButton>
                </div>
                <div className="flex gap-1">
                  {idx !== 0 && (
                    <IconButton label="Make primary" onClick={() => makePrimary(idx)}>
                      <Star className="size-3.5" />
                    </IconButton>
                  )}
                  <IconButton label="Remove image" onClick={() => remove(idx)}>
                    <X className="size-3.5" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? "Uploading…" : images.length > 0 ? "Add more images" : "Upload images"}
      </Button>

      {uploadError && <p className="text-red-600 text-xs">{uploadError}</p>}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center border border-border bg-background text-secondary-foreground transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
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
