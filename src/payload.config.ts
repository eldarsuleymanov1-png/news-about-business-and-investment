import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { uk } from '@payloadcms/translations/languages/uk'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AuditLog } from './collections/AuditLog'
import { Authors } from './collections/Authors'
import { CheckRequests } from './collections/CheckRequests'
import { Companies } from './collections/Companies'
import { Corrections } from './collections/Corrections'
import { ErrorReports } from './collections/ErrorReports'
import { Evidence } from './collections/Evidence'
import { Materials } from './collections/Materials'
import { Media } from './collections/Media'
import { Regions } from './collections/Regions'
import { RequestFiles } from './collections/RequestFiles'
import { Rubrics } from './collections/Rubrics'
import { Sections } from './collections/Sections'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Homepage } from './globals/Homepage'
import { SiteSettings } from './globals/SiteSettings'
import { withAuditLog } from './hooks/auditLog'
import { defaultLocale, locales } from './i18n/config'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * Файлы в Cloudflare R2 (S3-совместимое хранилище), если заданы переменные S3_*.
 * Без них файлы хранятся локально — удобно для разработки.
 */
const plugins: Plugin[] = []
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: {
        media: true,
        // Закрытые файлы отдаются только через Payload с проверкой прав
        evidence: { signedDownloads: true },
        'request-files': { signedDownloads: true },
      },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  )
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — InvestNews CMS' },
  },
  i18n: {
    supportedLanguages: { uk, en },
    fallbackLanguage: 'uk',
  },
  localization: {
    locales: locales.map((l) => ({ code: l.code, label: l.label })),
    defaultLocale,
    // fallback: true нужен, чтобы запросы без ?locale шли на украинскую версию.
    // Публичные запросы сайта (src/lib/payload.ts) передают fallbackLocale: false —
    // английская страница не подменяется украинским текстом.
    fallback: true,
  },
  collections: [
    Materials,
    withAuditLog(Authors),
    Media,
    Sections,
    withAuditLog(Rubrics),
    Tags,
    Regions,
    withAuditLog(Companies),
    withAuditLog(CheckRequests),
    withAuditLog(Evidence),
    RequestFiles,
    withAuditLog(Corrections),
    ErrorReports,
    withAuditLog(Users),
    AuditLog,
  ],
  globals: [Homepage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // В разработке схема синхронизируется автоматически, в продакшене — только миграциями
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
    // В продакшене миграции применяются при старте приложения
    prodMigrations: migrations,
  }),
  upload: { limits: { fileSize: 20 * 1024 * 1024 } },
  cors: [serverURL],
  csrf: [serverURL],
  sharp,
  plugins,
})
