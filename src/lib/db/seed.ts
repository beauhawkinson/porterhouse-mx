/** biome-ignore-all lint/suspicious/noConsole: Allow for seeding */
import { stripeClient } from "@/lib/config/stripe.config";
import { db } from "@/lib/db/db";
import { product, productVariant } from "@/lib/db/schema";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const INITIAL_STOCK = 25;

const TSHIRTS = [
  {
    slug: "mud-demon-tee",
    name: "Mud Demon Tee",
    description:
      "Embrace the grime. The Mud Demon Tee is a heavy-weight 100% cotton shirt built for riders who leave it all on the track. Bold graphics, pre-shrunk, and ready to get dirty.",
    priceCents: 2999,
    imageUrl: "/images/products/tshirt-1.svg",
    category: "tshirt" as const,
  },
  {
    slug: "holeshot-tee",
    name: "Holeshot Tee",
    description:
      "Named for the first corner advantage. The Holeshot Tee keeps you looking sharp whether you're staging on the line or loading up the truck after a win.",
    priceCents: 2999,
    imageUrl: "/images/products/tshirt-1.svg",
    category: "tshirt" as const,
  },
];

const SWEATSHIRTS = [
  {
    slug: "holeshot-hoodie",
    name: "Holeshot Hoodie",
    description:
      "Post-moto warmth, track-ready style. The Holeshot Hoodie is a heavy fleece pullover with a kangaroo pocket and embroidered Porterhouse MX logo on the chest.",
    priceCents: 6499,
    imageUrl: "/images/products/sweatshirt-1.svg",
    category: "sweatshirt" as const,
  },
  {
    slug: "mud-season-hoodie",
    name: "Mud Season Hoodie",
    description:
      "There's no off-season when you love the mud. The Mud Season Hoodie is your every-day, every-track warmth layer — 14oz fleece and a drawstring hood that actually stays put.",
    priceCents: 6999,
    imageUrl: "/images/products/sweatshirt-1.svg",
    category: "sweatshirt" as const,
  },
];

const ALL_PRODUCTS = [...TSHIRTS, ...SWEATSHIRTS];

async function seed() {
  console.log("🌱 Seeding database...\n");

  for (const p of ALL_PRODUCTS) {
    console.log(`→ ${p.name}`);

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

    // Insert product row
    const [row] = await db
      .insert(product)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        category: p.category,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      })
      .onConflictDoUpdate({
        target: product.slug,
        set: {
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          imageUrl: p.imageUrl,
          category: p.category,
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) throw new Error(`Failed to insert product: ${p.slug}`);

    // Insert variants
    await db
      .insert(productVariant)
      .values(
        SIZES.map((size) => ({
          productId: row.id,
          size,
          stock: INITIAL_STOCK,
        })),
      )
      .onConflictDoUpdate({
        target: [productVariant.productId, productVariant.size],
        set: { stock: INITIAL_STOCK },
      });

    console.log(`  ✓ Stripe product: ${stripeProduct.id}`);
    console.log(`  ✓ Stripe price:   ${stripePrice.id}`);
    console.log(`  ✓ DB product:     ${row.id}\n`);
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
