import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_consent_log_action" AS ENUM('accept-all', 'necessary-only', 'custom');
  CREATE TABLE "consent_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"consent_id" varchar NOT NULL,
  	"analytics" boolean DEFAULT false,
  	"policy_version" varchar NOT NULL,
  	"locale" varchar,
  	"action" "enum_consent_log_action" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "consent_log_id" integer;
  CREATE INDEX "consent_log_consent_id_idx" ON "consent_log" USING btree ("consent_id");
  CREATE INDEX "consent_log_updated_at_idx" ON "consent_log" USING btree ("updated_at");
  CREATE INDEX "consent_log_created_at_idx" ON "consent_log" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consent_log_fk" FOREIGN KEY ("consent_log_id") REFERENCES "public"."consent_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_consent_log_id_idx" ON "payload_locked_documents_rels" USING btree ("consent_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "consent_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "consent_log" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_consent_log_fk";
  
  DROP INDEX "payload_locked_documents_rels_consent_log_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "consent_log_id";
  DROP TYPE "public"."enum_consent_log_action";`)
}
