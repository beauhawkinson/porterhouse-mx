/** biome-ignore-all lint/suspicious/noConsole: Allow for seeding */

import { eq } from "drizzle-orm";

import { stripeClient } from "@/lib/config/stripe.config";
import { db } from "@/lib/db/db";
import { product, productImage, productVariant } from "@/lib/db/schema";

// Apparel sizes (tees, hoodies). Stickers have no variants — stock lives on product.
const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const INITIAL_VARIANT_STOCK = 25;
const INITIAL_STICKER_STOCK = 100;

type ProductImage = { url: string; alt: string };
type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: "tshirt" | "sweatshirt" | "sticker";
  images: [ProductImage, ...ProductImage[]]; // ← at least one
};

const ALL_PRODUCTS: ProductSeed[] = [
  // ── Sweatshirts ──────────────────────────────────────────
  {
    slug: "moto-is-life-hoodie",
    name: "Moto Is Life Hoodie",
    description:
      "Black heavyweight pullover hoodie with the PorterhouseMX script across the chest and an oversized 'Moto Is Life' graphic blown out across the back — visible from the gate drop to the checkered flag. Kangaroo pocket, drawstring hood, comfort-fit cut.",
    priceCents: 5499,
    category: "sweatshirt",
    images: [
      { url: "/images/products/moto-is-life-hoodie/back.jpeg", alt: "Moto Is Life back graphic" },
      { url: "/images/products/moto-is-life-hoodie/front.jpeg", alt: "PorterhouseMX chest script" },
      {
        url: "/images/products/moto-is-life-hoodie/action-1.jpeg",
        alt: "Rider mid-jump wearing the hoodie",
      },
      {
        url: "/images/products/moto-is-life-hoodie/action-2.jpeg",
        alt: "Rider cornering at the track",
      },
      {
        url: "/images/products/moto-is-life-hoodie/paddock.jpeg",
        alt: "Rider on bike at indoor track",
      },
    ],
  },
  {
    slug: "checkered-flag-crewneck",
    name: "Checkered Flag Crewneck",
    description:
      "Heavyweight crewneck sweatshirt in vintage cream with a hand-drawn checkered flag motif wrapping the front. Ribbed cuffs and hem, brushed fleece interior, true-to-size fit. Built for cold mornings in the pits.",
    priceCents: 4999,
    category: "tshirt",
    images: [
      {
        url: "/images/products/checkered-flag-crewneck/front.jpeg",
        alt: "Checkered flag crewneck front",
      },
      {
        url: "/images/products/checkered-flag-crewneck/back.jpeg",
        alt: "Checkered flag crewneck back",
      },
      {
        url: "/images/products/checkered-flag-crewneck/detail.jpeg",
        alt: "Close-up of the checkered flag print",
      },
    ],
  },
  // ── Stickers (no variants — stock tracked on product) ────
  {
    slug: "porterhouse-script-sticker",
    name: "Porterhouse Script Sticker",
    description:
      "Die-cut vinyl sticker of the classic PorterhouseMX script logo. Weatherproof, scratch-resistant, and built to live on a helmet, fender, or toolbox.",
    priceCents: 499,
    category: "sticker",
    images: [
      {
        url: "/images/products/porterhouse-script-sticker/main.jpeg",
        alt: "Porterhouse script sticker",
      },
      {
        url: "/images/products/porterhouse-script-sticker/on-helmet.jpeg",
        alt: "Sticker applied to a helmet",
      },
    ],
  },
  {
    slug: "mud-demon-sticker",
    name: "Mud Demon Sticker",
    description:
      "Bold die-cut decal of the Mud Demon graphic. Heavy vinyl that holds up to pressure washing, mud, and roost. Slap it on your number plate or your buddy's truck — your call.",
    priceCents: 499,
    category: "sticker",
    images: [
      { url: "/images/products/mud-demon-sticker/main.jpeg", alt: "Mud Demon sticker" },
      {
        url: "/images/products/mud-demon-sticker/on-bike.jpeg",
        alt: "Mud Demon sticker on a dirt bike",
      },
    ],
  },
  {
    slug: "holeshot-sticker",
    name: "Holeshot Sticker",
    description:
      "Classic 'Holeshot' bar-style sticker. UV-coated, dishwasher-safe, and ready to mark your favorite gear. Stack 'em on your toolbox to track every gate-drop win.",
    priceCents: 399,
    category: "sticker",
    images: [{ url: "/images/products/holeshot-sticker/main.jpeg", alt: "Holeshot sticker" }],
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  for (const p of ALL_PRODUCTS) {
    console.log(`→ ${p.name}`);

    const isSticker = p.category === "sticker";

    // Create Stripe Product
    const stripeProduct = await stripeClient.products.create({
      name: p.name,
      description: p.description,
    });

    // Create Stripe Price
    const stripePrice = await stripeClient.prices.create({
      product: stripeProduct.id,
      unit_amount: p.priceCents,
      currency: "usd",
    });

    // Insert product row. Stickers carry their own stock; sized products
    // leave product.stock at 0 and track stock per-variant.
    const productValues = {
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      category: p.category,
      imageUrl: p.images[0].url,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      stock: isSticker ? INITIAL_STICKER_STOCK : 0,
    };

    const [row] = await db
      .insert(product)
      .values(productValues)
      .onConflictDoUpdate({
        target: product.slug,
        set: {
          ...productValues,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) throw new Error(`Failed to insert product: ${p.slug}`);

    // Variants: only for sized products. Stickers have none.
    if (!isSticker) {
      await db
        .insert(productVariant)
        .values(
          APPAREL_SIZES.map((size) => ({
            productId: row.id,
            size,
            stock: INITIAL_VARIANT_STOCK,
          })),
        )
        .onConflictDoUpdate({
          target: [productVariant.productId, productVariant.size],
          set: { stock: INITIAL_VARIANT_STOCK },
        });
    } else {
      // If this product was previously seeded with variants (e.g. you
      // changed category from tshirt → sticker), clean them up.
      await db.delete(productVariant).where(eq(productVariant.productId, row.id));
    }

    // Clear and re-insert images (so re-running the seed updates them cleanly)
    await db.delete(productImage).where(eq(productImage.productId, row.id));

    await db.insert(productImage).values(
      p.images.map((img, idx) => ({
        productId: row.id,
        url: img.url,
        alt: img.alt,
        sortOrder: idx,
      })),
    );

    // Keep product.imageUrl in sync with the primary image (sortOrder 0)
    await db.update(product).set({ imageUrl: p.images[0].url }).where(eq(product.id, row.id));

    console.log(`  ✓ Stripe product: ${stripeProduct.id}`);
    console.log(`  ✓ Stripe price:   ${stripePrice.id}`);
    console.log(`  ✓ DB product:     ${row.id}`);
    console.log(
      `  ✓ Stock:          ${
        isSticker
          ? `${INITIAL_STICKER_STOCK} (on product)`
          : `${APPAREL_SIZES.length} variants × ${INITIAL_VARIANT_STOCK}`
      }\n`,
    );
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
