import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_locales" ALTER COLUMN "site_name" SET DEFAULT 'Invest Venture';
  ALTER TABLE "site_settings" ADD COLUMN "short_name" varchar DEFAULT 'IV' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_locales" ALTER COLUMN "site_name" SET DEFAULT 'EL Investments';
  ALTER TABLE "site_settings" DROP COLUMN "short_name";`)
}
