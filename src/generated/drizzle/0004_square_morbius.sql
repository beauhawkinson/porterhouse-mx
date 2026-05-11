ALTER TABLE "order_item" ALTER COLUMN "variant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "size_snapshot" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;