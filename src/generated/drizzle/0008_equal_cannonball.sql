ALTER TABLE "order" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "refunded_at" timestamp with time zone;