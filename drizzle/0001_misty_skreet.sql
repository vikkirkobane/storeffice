CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_id" text NOT NULL,
	"account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"expires_at" timestamp,
	"password" text,
	"scope" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"revoked" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "latitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "longitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "hourly_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "daily_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "weekly_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "monthly_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "office_spaces" ALTER COLUMN "rating" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "unit_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "total_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total_amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "rating" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "storage_rentals" ALTER COLUMN "monthly_rate" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_rentals" ALTER COLUMN "total_amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "latitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "longitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "length_ft" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "width_ft" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "height_ft" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "monthly_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "annual_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "storage_spaces" ALTER COLUMN "rating" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_user" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_provider_account" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_user" ON "cart_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_product" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_token" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_verifications_user" ON "verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verifications_token" ON "verifications" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_bookings_customer_status" ON "bookings" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "idx_bookings_space_status" ON "bookings" USING btree ("space_id","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_office_spaces_city_active" ON "office_spaces" USING btree ("city","is_active");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_status" ON "orders" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "idx_products_storage_active" ON "products" USING btree ("storage_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_products_category_active" ON "products" USING btree ("category","is_active");