ALTER TABLE "order" ADD COLUMN "fulfillment_status" text DEFAULT 'unfulfilled' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "tracking_number" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "tracking_carrier" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "fulfilled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "internal_notes" text;