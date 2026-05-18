CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'fulfilled', 'shipped');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "fulfillment_status" SET DEFAULT 'unfulfilled'::"public"."fulfillment_status";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "fulfillment_status" SET DATA TYPE "public"."fulfillment_status" USING "fulfillment_status"::"public"."fulfillment_status";--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "status" "product_status" DEFAULT 'draft' NOT NULL;