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
import { ConsentLog } from './collections/ConsentLog'
import { Corrections } from './collections/Corrections'
import { ErrorReports } from './collections/ErrorReports'
import { Evidence } from './collections/Evidence'
import { Materials } from './collections/Materials'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Regions } from './collections/Regions'
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
 * Файлы в Cloudflare R2 (S3-совместимое хранилище), если задан S3_BUCKET.
 * Без него файлы хранятся локально — удобно для разработки.
 *
 * Плагин подключён всегда (enabled — по переменной) и с alwaysInsertFields: схема БД и миграции
 * одинаковы локально и в продакшене. Компонент прямой загрузки добавлен в import map явно
 * (admin.dependencies ниже) — иначе локально сгенерированная карта не подойдёт продакшену.
 */
const s3Enabled = Boolean(process.env.S3_BUCKET)
const s3PublicUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, '')

const plugins: Plugin[] = [
  s3Storage({
    enabled: s3Enabled,
    alwaysInsertFields: true,
    collections: {
      // Публичные фото — напрямую с домена R2 (CDN), минуя сервер приложения
      media: s3PublicUrl
        ? {
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }) =>
              [s3PublicUrl, prefix, filename].filter(Boolean).join('/'),
          }
        : true,
      // Закрытые файлы отдаются только через Payload с проверкой прав
      evidence: { signedDownloads: true },
    },
    bucket: process.env.S3_BUCKET || 'not-configured',
    // Vercel ограничивает тело запроса 4,5 МБ — файлы из админки грузятся напрямую в R2
    clientUploads: true,
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
]

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — EL Investments CMS' },
    dependencies: {
      s3ClientUploadHandler: {
        type: 'component',
        path: '@payloadcms/storage-s3/client#S3ClientUploadHandler',
      },
      // Кнопка Telegram подключается только при TELEGRAM_BOT_TOKEN — в карте компонентов она есть всегда
      telegramButton: {
        type: 'component',
        path: '@/components/admin/TelegramButton#TelegramButton',
      },
    },
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
    withAuditLog(Pages),
    Sections,
    withAuditLog(Rubrics),
    Tags,
    Regions,
    withAuditLog(Companies),
    withAuditLog(CheckRequests),
    withAuditLog(Evidence),
    withAuditLog(Corrections),
    ErrorReports,
    withAuditLog(Users),
    AuditLog,
    ConsentLog,
  ],
  globals: [Homepage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // В разработке схема синхронизируется автоматически, в продакшене — только миграциями
    push: process.env.NODE_ENV !== 'production' && process.env.PAYLOAD_DB_PUSH !== 'false',
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
