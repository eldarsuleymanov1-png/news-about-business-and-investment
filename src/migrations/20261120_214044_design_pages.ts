import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_footer_group" AS ENUM('about', 'partners');
  CREATE TYPE "public"."enum__pages_v_version_footer_group" AS ENUM('about', 'partners');
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"published" boolean DEFAULT false,
  	"footer_group" "enum_pages_footer_group",
  	"footer_order" numeric DEFAULT 0,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_published" boolean DEFAULT false,
  	"version_footer_group" "enum__pages_v_version_footer_group",
  	"version_footer_order" numeric DEFAULT 0,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_lead" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "homepage_blocks" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_blocks_kind";
  CREATE TYPE "public"."enum_homepage_blocks_kind" AS ENUM('hero', 'section-grid', 'section-list', 'checks', 'subscribe');
  ALTER TABLE "homepage_blocks" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_homepage_blocks_kind" USING "kind"::"public"."enum_homepage_blocks_kind";
  ALTER TABLE "_homepage_v_version_blocks" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_v_version_blocks_kind";
  CREATE TYPE "public"."enum__homepage_v_version_blocks_kind" AS ENUM('hero', 'section-grid', 'section-list', 'checks', 'subscribe');
  ALTER TABLE "_homepage_v_version_blocks" ALTER COLUMN "kind" SET DATA TYPE "public"."enum__homepage_v_version_blocks_kind" USING "kind"::"public"."enum__homepage_v_version_blocks_kind";
  ALTER TABLE "site_settings_locales" ALTER COLUMN "site_name" SET DEFAULT 'EL Investments';
  ALTER TABLE "site_settings_locales" ALTER COLUMN "tagline" SET DEFAULT 'Інвестиції та бізнес. Перевіряємо, перш ніж радити.';
  ALTER TABLE "sections_locales" ADD COLUMN "nav_title" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "homepage_blocks" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_homepage_blocks_kind";
  CREATE TYPE "public"."enum_homepage_blocks_kind" AS ENUM('latest-news', 'sections', 'section', 'latest-checks', 'subscribe');
  ALTER TABLE "homepage_blocks" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_homepage_blocks_kind" USING "kind"::"public"."enum_homepage_blocks_kind";
  ALTER TABLE "_homepage_v_version_blocks" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum__homepage_v_version_blocks_kind";
  CREATE TYPE "public"."enum__homepage_v_version_blocks_kind" AS ENUM('latest-news', 'sections', 'section', 'latest-checks', 'subscribe');
  ALTER TABLE "_homepage_v_version_blocks" ALTER COLUMN "kind" SET DATA TYPE "public"."enum__homepage_v_version_blocks_kind" USING "kind"::"public"."enum__homepage_v_version_blocks_kind";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "site_settings_locales" ALTER COLUMN "site_name" SET DEFAULT 'InvestNews';
  ALTER TABLE "site_settings_locales" ALTER COLUMN "tagline" DROP DEFAULT;
  ALTER TABLE "sections_locales" DROP COLUMN "nav_title";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_footer_group";
  DROP TYPE "public"."enum__pages_v_version_footer_group";`)
}
