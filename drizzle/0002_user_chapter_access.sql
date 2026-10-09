CREATE TABLE "user_chapter_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_chapter_access" ADD CONSTRAINT "user_chapter_access_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_chapter_access" ADD CONSTRAINT "user_chapter_access_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_chapter_access_unique" ON "user_chapter_access" USING btree ("user_id","chapter_id");
