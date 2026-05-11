/**
 * Stock helpers — single source of truth for "does this product have stock?"
 *
 * Products fall into two camps:
 *   - Variant-keyed (tshirts, sweatshirts): stock lives on productVariant.stock
 *   - Variant-less (stickers): stock lives on product.stock; variants is empty
 */

type StockShape = {
  category: string;
  stock: number;
  variants: { stock: number }[];
};

export function isVariantLess(category: string): boolean {
  return category === "sticker";
}

export function hasStock(p: StockShape): boolean {
  return isVariantLess(p.category) ? p.stock > 0 : p.variants.some((v) => v.stock > 0);
}

export function totalStock(p: StockShape): number {
  return isVariantLess(p.category) ? p.stock : p.variants.reduce((sum, v) => sum + v.stock, 0);
}
