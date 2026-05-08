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

export const categoryEnum = pgEnum("category", ["tshirt", "sweatshirt"]);
export const sizeEnum = pgEnum("size", ["S", "M", "L", "XL", "XXL"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "fulfilled", "refunded"]);

// ─── Products ────────────────────────────────────────────────────────────────

export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  category: categoryEnum("category").notNull(),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
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
  },
  (t) => [unique().on(t.productId, t.size)],
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export type ShippingAddress = {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  country: string;
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
  fulfillmentStatus: text("fulfillment_status", {
    enum: ["unfulfilled", "fulfilled", "shipped"],
  })
    .notNull()
    .default("unfulfilled"),
  trackingNumber: text("tracking_number"),
  trackingCarrier: text("tracking_carrier"),
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
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariant.id),
  nameSnapshot: text("name_snapshot").notNull(),
  sizeSnapshot: text("size_snapshot").notNull(),
  priceCentsSnapshot: integer("price_cents_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
});
