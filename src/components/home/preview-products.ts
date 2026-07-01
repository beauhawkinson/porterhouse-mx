// ⚠️ TEMPORARY — design-preview data only.
//
// These mirror the seed catalog so Jeremy can view the featured-section layouts
// on prod without seeding real (Stripe-linked) products. The home page falls
// back to these ONLY when the database has no products, so they vanish
// automatically once a real product is created. Not wired to Stripe; the
// product links lead to "Product not found" (expected — this is layout preview).
//
// To remove later: delete this file and the fallback in `src/routes/index.tsx`.

import type { FeaturedProducts } from "./shared";

type Seed = {
  slug: string;
  name: string;
  priceCents: number;
  category: "tshirt" | "sweatshirt" | "sticker";
  images: { url: string; alt: string }[];
};

const base = (slug: string, file: string) => `/images/products/${slug}/${file}`;

const SEED: Seed[] = [
  {
    slug: "moto-is-life-hoodie",
    name: "Moto Is Life Hoodie",
    priceCents: 5499,
    category: "sweatshirt",
    images: [
      { url: base("moto-is-life-hoodie", "back.jpeg"), alt: "Moto Is Life back graphic" },
      { url: base("moto-is-life-hoodie", "front.jpeg"), alt: "PorterhouseMX chest script" },
      {
        url: base("moto-is-life-hoodie", "action-1.jpeg"),
        alt: "Rider mid-jump wearing the hoodie",
      },
      { url: base("moto-is-life-hoodie", "action-2.jpeg"), alt: "Rider cornering at the track" },
      { url: base("moto-is-life-hoodie", "paddock.jpeg"), alt: "Rider on bike at indoor track" },
    ],
  },
  {
    slug: "checkered-flag-crewneck",
    name: "Checkered Flag Crewneck",
    priceCents: 4999,
    category: "tshirt",
    images: [
      { url: base("checkered-flag-crewneck", "front.jpeg"), alt: "Checkered flag crewneck front" },
      { url: base("checkered-flag-crewneck", "back.jpeg"), alt: "Checkered flag crewneck back" },
      {
        url: base("checkered-flag-crewneck", "detail.jpeg"),
        alt: "Close-up of the checkered flag print",
      },
    ],
  },
  {
    slug: "porterhouse-script-sticker",
    name: "Porterhouse Script Sticker",
    priceCents: 499,
    category: "sticker",
    images: [
      { url: base("porterhouse-script-sticker", "main.jpeg"), alt: "Porterhouse script sticker" },
      {
        url: base("porterhouse-script-sticker", "on-helmet.jpeg"),
        alt: "Sticker applied to a helmet",
      },
    ],
  },
  {
    slug: "mud-demon-sticker",
    name: "Mud Demon Sticker",
    priceCents: 499,
    category: "sticker",
    images: [
      { url: base("mud-demon-sticker", "main.jpeg"), alt: "Mud Demon sticker" },
      { url: base("mud-demon-sticker", "on-bike.jpeg"), alt: "Mud Demon sticker on a dirt bike" },
    ],
  },
  {
    slug: "holeshot-sticker",
    name: "Holeshot Sticker",
    priceCents: 399,
    category: "sticker",
    images: [{ url: base("holeshot-sticker", "main.jpeg"), alt: "Holeshot sticker" }],
  },
];

// Shape each into a loaded-product-like object. Only the fields the featured
// layouts read are meaningful; the rest are filler to satisfy the type.
export const PREVIEW_PRODUCTS = SEED.map((s, i) => ({
  id: `preview-${i}`,
  slug: s.slug,
  name: s.name,
  description: "",
  details: null,
  priceCents: s.priceCents,
  imageUrl: s.images[0].url,
  category: s.category,
  status: "active" as const,
  stripeProductId: null,
  stripePriceId: null,
  stock: s.category === "sticker" ? 100 : 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  variants: s.category === "sticker" ? [] : [{ stock: 10 }],
  images: s.images.map((img, idx) => ({
    id: `preview-${i}-${idx}`,
    productId: `preview-${i}`,
    url: img.url,
    alt: img.alt,
    sortOrder: idx,
  })),
})) as unknown as FeaturedProducts;
