import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Better-auth tables ──────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Store enums ─────────────────────────────────────────────────────────────

export const categoryEnum = pgEnum("category", ["tshirt", "sweatshirt", "sticker"]);

export const sizeEnum = pgEnum("size", ["S", "M", "L", "XL", "XXL"]);

export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "fulfilled", "refunded"]);

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "unfulfilled",
  "fulfilled",
  "shipped",
]);

export const CATEGORY_VALUES = categoryEnum.enumValues;
export const SIZE_VALUES = sizeEnum.enumValues;
export const ORDER_STATUS_VALUES = orderStatusEnum.enumValues;
export const PRODUCT_STATUS_VALUES = productStatusEnum.enumValues;
export const FULFILLMENT_STATUS_VALUES = fulfillmentStatusEnum.enumValues;

export type Category = (typeof CATEGORY_VALUES)[number];
export type Size = (typeof SIZE_VALUES)[number];
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];
export type FulfillmentStatus = (typeof FULFILLMENT_STATUS_VALUES)[number];

// ─── Products ────────────────────────────────────────────────────────────────

export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  details: text("details"),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  category: categoryEnum("category").notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  stripeProductId: text("stripe_product_id"),
  // ONLY used for variant-less products like stickers
  stripePriceId: text("stripe_price_id"),
  // ONLY used for variant-less products
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    size: sizeEnum("size").notNull(),
    stock: integer("stock").notNull().default(0),
    stripePriceId: text("stripe_price_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.productId, t.size)],
);

export const productImage = pgTable(
  "product_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.productId, t.sortOrder)],
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export type ShippingAddress = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: orderStatusEnum("status").notNull().default("pending"),
  amountTotalCents: integer("amount_total_cents"),
  currency: text("currency"),
  customerEmail: text("customer_email"),
  shippingName: text("shipping_name"),
  shippingAddress: jsonb("shipping_address").$type<ShippingAddress>(),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status").notNull().default("unfulfilled"),
  trackingNumber: text("tracking_number"),
  trackingCarrier: text("tracking_carrier"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id),
  // Nullable: variant-less products (stickers) won't have a variantId.
  variantId: uuid("variant_id").references(() => productVariant.id),
  nameSnapshot: text("name_snapshot").notNull(),
  // Nullable for variant-less products.
  sizeSnapshot: text("size_snapshot"),
  priceCentsSnapshot: integer("price_cents_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
});

// ─── Product requests ──────────────────────────────────────────────────────────
// Signed-in customers can suggest products they'd like to see.

export const productRequestStatusEnum = pgEnum("product_request_status", [
  "open",
  "reviewed",
  "closed",
]);

export const PRODUCT_REQUEST_STATUS_VALUES = productRequestStatusEnum.enumValues;
export type ProductRequestStatus = (typeof PRODUCT_REQUEST_STATUS_VALUES)[number];

export const productRequest = pgTable("product_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Email snapshot at submission time (the account email may change later).
  email: text("email"),
  message: text("message").notNull(),
  status: productRequestStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Gallery ────────────────────────────────────────────────────────────────
// Admin-managed image gallery. Files live in R2 under the `gallery/` prefix;
// each row holds the public URL of one uploaded image.

export const galleryImage = pgTable("gallery_image", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
