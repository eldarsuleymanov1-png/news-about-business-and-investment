import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "check_requests_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"size" numeric,
  	"mime_type" varchar,
  	"uploaded" boolean DEFAULT false
  );
  
  ALTER TABLE "check_requests_attachments" ADD CONSTRAINT "check_requests_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."check_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "check_requests_attachments_order_idx" ON "check_requests_attachments" USING btree ("_order");
  CREATE INDEX "check_requests_attachments_parent_id_idx" ON "check_requests_attachments" USING btree ("_parent_id");
  ALTER TABLE "request_files" DROP COLUMN "prefix";
  ALTER TABLE "request_files" DROP COLUMN "_objectkey";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "check_requests_attachments" CASCADE;
  ALTER TABLE "request_files" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "request_files" ADD COLUMN "_objectkey" varchar;`)
}
