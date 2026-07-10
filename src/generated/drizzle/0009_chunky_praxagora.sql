CREATE TYPE "public"."product_request_status" AS ENUM('open', 'reviewed', 'closed');--> statement-breakpoint
CREATE TABLE "product_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text,
	"message" text NOT NULL,
	"status" "product_request_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_request" ADD CONSTRAINT "product_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;