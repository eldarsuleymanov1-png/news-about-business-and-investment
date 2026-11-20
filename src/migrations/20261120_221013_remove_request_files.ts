import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "check_requests_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "request_files" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "check_requests_rels" CASCADE;
  DROP TABLE "request_files" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_request_files_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_request_files_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "request_files_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "check_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"request_files_id" integer
  );
  
  CREATE TABLE "request_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "request_files_id" integer;
  ALTER TABLE "check_requests_rels" ADD CONSTRAINT "check_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."check_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "check_requests_rels" ADD CONSTRAINT "check_requests_rels_request_files_fk" FOREIGN KEY ("request_files_id") REFERENCES "public"."request_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "check_requests_rels_order_idx" ON "check_requests_rels" USING btree ("order");
  CREATE INDEX "check_requests_rels_parent_idx" ON "check_requests_rels" USING btree ("parent_id");
  CREATE INDEX "check_requests_rels_path_idx" ON "check_requests_rels" USING btree ("path");
  CREATE INDEX "check_requests_rels_request_files_id_idx" ON "check_requests_rels" USING btree ("request_files_id");
  CREATE INDEX "request_files_updated_at_idx" ON "request_files" USING btree ("updated_at");
  CREATE INDEX "request_files_created_at_idx" ON "request_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "request_files_filename_idx" ON "request_files" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_request_files_fk" FOREIGN KEY ("request_files_id") REFERENCES "public"."request_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_request_files_id_idx" ON "payload_locked_documents_rels" USING btree ("request_files_id");`)
}
