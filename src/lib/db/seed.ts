/** biome-ignore-all lint/suspicious/noConsole: Allow for seeding */

import { eq } from "drizzle-orm";

import { stripeClient } from "@/lib/config/stripe.config";
import { db } from "@/lib/db/db";
import { SIZE_VALUES, product, productImage, productVariant } from "@/lib/db/schema";

const INITIAL_VARIANT_STOCK = 10;
const INITIAL_STICKER_STOCK = 100;

type ProductImage = {
  url: string;
  alt: string;
};

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  details?: string;
  priceCents: number;
  category: "tshirt" | "sweatshirt" | "sticker";
  images: [ProductImage, ...ProductImage[]];
};

const ALL_PRODUCTS: ProductSeed[] = [
  // ── Sweatshirts ──────────────────────────────────────────
  {
    slug: "moto-is-life-hoodie",
    name: "Moto Is Life Hoodie",
    description:
      "Black heavyweight pullover hoodie with the PorterhouseMX script across the chest and an oversized 'Moto Is Life' graphic blown out across the back — visible from the gate drop to the checkered flag. Kangaroo pocket, drawstring hood, comfort-fit cut.",

    details: `Heavyweight cotton blend fleece
Oversized back graphic print
Relaxed comfort-fit silhouette
Front kangaroo pocket
Ribbed cuffs and waistband
Ships from the US — USPS Ground Advantage`,

    priceCents: 5499,
    category: "sweatshirt",

    images: [
      {
        url: "/images/products/moto-is-life-hoodie/back.jpeg",
        alt: "Moto Is Life back graphic",
      },
      {
        url: "/images/products/moto-is-life-hoodie/front.jpeg",
        alt: "PorterhouseMX chest script",
      },
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

    details: `Heavyweight 100% cotton construction
Vintage cream garment dye
Screen-printed checkered flag artwork
Pre-shrunk for a consistent fit
Ribbed collar, cuffs, and hem
Ships from the US — USPS Ground Advantage`,

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

    details: `Die-cut premium vinyl
Weatherproof and UV-coated
Scratch-resistant laminate finish
Safe for helmets, bikes, and toolboxes
Built for indoor and outdoor use
Ships from the US — USPS Ground Advantage`,

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

    details: `Heavy-duty outdoor vinyl
Pressure-wash and mud resistant
Matte weatherproof finish
Die-cut contour shape
Perfect for bikes, coolers, and helmets
Ships from the US — USPS Ground Advantage`,

    priceCents: 499,
    category: "sticker",

    images: [
      {
        url: "/images/products/mud-demon-sticker/main.jpeg",
        alt: "Mud Demon sticker",
      },
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

    details: `Premium laminated vinyl
UV-coated and fade resistant
Dishwasher-safe finish
Easy peel-and-stick backing
Great for bottles, laptops, and gear bins
Ships from the US — USPS Ground Advantage`,

    priceCents: 399,
    category: "sticker",

    images: [
      {
        url: "/images/products/holeshot-sticker/main.jpeg",
        alt: "Holeshot sticker",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  for (const p of ALL_PRODUCTS) {
    console.log(`→ ${p.name}`);

    const isSticker = p.category === "sticker";

    // ---------------------------------------------------
    // Check existing DB product
    // ---------------------------------------------------

    const existingProduct = await db.query.product.findFirst({
      where: eq(product.slug, p.slug),
      with: {
        variants: true,
      },
    });

    // ---------------------------------------------------
    // Create or reuse Stripe product
    // ---------------------------------------------------

    let stripeProductId = existingProduct?.stripeProductId ?? null;

    if (!stripeProductId) {
      const stripeProduct = await stripeClient.products.create({
        name: p.name,
        description: p.description,
        metadata: {
          slug: p.slug,
          category: p.category,
        },
      });
      stripeProductId = stripeProduct.id;

      console.log(`  ✓ Created Stripe product: ${stripeProductId}`);
    } else {
      console.log(`  ✓ Reusing Stripe product: ${stripeProductId}`);
    }

    // ---------------------------------------------------
    // Stickers get ONE Stripe price
    // ---------------------------------------------------

    let stickerStripePriceId: string | null = existingProduct?.stripePriceId ?? null;

    if (isSticker && !stickerStripePriceId) {
      const stripePrice = await stripeClient.prices.create({
        product: stripeProductId,
        unit_amount: p.priceCents,
        currency: "usd",
        metadata: {
          slug: p.slug,
        },
      });
      stickerStripePriceId = stripePrice.id;
      console.log(`  ✓ Created sticker price: ${stripePrice.id}`);
    }

    // ---------------------------------------------------
    // Upsert product
    // ---------------------------------------------------

    const productValues = {
      slug: p.slug,
      name: p.name,
      description: p.description,
      details: p.details ?? null,
      priceCents: p.priceCents,
      category: p.category,
      imageUrl: p.images[0].url,
      status: "active" as const,
      stripeProductId,
      stripePriceId: isSticker ? stickerStripePriceId : null,
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

    if (!row) {
      throw new Error(`Failed to insert product: ${p.slug}`);
    }

    // ---------------------------------------------------
    // Apparel variants
    // ---------------------------------------------------

    if (!isSticker) {
      for (const size of SIZE_VALUES) {
        const existingVariant = existingProduct?.variants.find((v) => v.size === size);

        let stripePriceId = existingVariant?.stripePriceId ?? null;

        if (!stripePriceId) {
          const stripePrice = await stripeClient.prices.create({
            product: stripeProductId,
            unit_amount: p.priceCents,
            currency: "usd",
            metadata: {
              slug: p.slug,
              size,
            },
          });
          stripePriceId = stripePrice.id;
          console.log(`  ✓ Created ${size} price: ${stripePriceId}`);
        }

        await db
          .insert(productVariant)
          .values({
            productId: row.id,
            size,
            stock: INITIAL_VARIANT_STOCK,
            stripePriceId,
          })
          .onConflictDoUpdate({
            target: [productVariant.productId, productVariant.size],
            set: {
              stock: INITIAL_VARIANT_STOCK,
              stripePriceId,
            },
          });
      }
    } else {
      // Cleanup variants if category changed to sticker
      await db.delete(productVariant).where(eq(productVariant.productId, row.id));
    }

    // ---------------------------------------------------
    // Images
    // ---------------------------------------------------

    await db.delete(productImage).where(eq(productImage.productId, row.id));

    await db.insert(productImage).values(
      p.images.map((img, idx) => ({
        productId: row.id,
        url: img.url,
        alt: img.alt,
        sortOrder: idx,
      })),
    );

    console.log(`  ✓ DB product: ${row.id}\n`);
  }

  console.log("✅ Seed complete!");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
