import type { Category } from "@/lib/db/schema";

/**
 * Display labels for product categories (singular form).
 * Use Tailwind's `` class when you want all-caps presentation —
 * keeps the underlying text accessible while letting CSS handle styling.
 *
 * The `Record<Category, string>` annotation enforces exhaustiveness: add a
 * value to `categoryEnum` and TypeScript will refuse to compile until it's
 * labeled here.
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  tshirt: "T-Shirt",
  sweatshirt: "Sweatshirt",
  sticker: "Sticker",
};

/**
 * Plural form, useful for filter labels and section headers.
 */
export const CATEGORY_LABELS_PLURAL: Record<Category, string> = {
  tshirt: "T-Shirts",
  sweatshirt: "Sweatshirts",
  sticker: "Stickers",
};
