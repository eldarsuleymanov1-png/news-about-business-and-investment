import { HeadObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Закрытые файлы от читателей (вложения к заявкам «Перевірте проєкт»).
 *
 * - С R2 (S3_BUCKET задан): браузер загружает файл прямо в бакет по подписанной POST-форме —
 *   так обходится лимит Vercel 4,5 МБ на запрос. Размер и тип ограничены условиями подписи.
 * - Без R2 (разработка, VPS): файл отправляется на наш маршрут и пишется в PRIVATE_FILES_DIR.
 *
 * Читатель не получает ссылку на скачивание: скачивать может только сотрудник через
 * /api/private-files/<key> (проверка входа в админку).
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_FILES = 5
export const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

const PREFIX = 'private/request-files'
const localDir = () => path.resolve(process.env.PRIVATE_FILES_DIR || '.private-files')

export const usesS3 = () => Boolean(process.env.S3_BUCKET)

let client: S3Client | null = null
const s3 = () =>
  (client ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'auto',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  }))

/** Безопасное имя файла: только буквы, цифры, точка, дефис; кириллица сохраняется. */
export function safeFileName(name: string): string {
  const base = path.basename(name).normalize('NFC')
  const cleaned = base
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/_+/g, '_')
    .slice(-120)
  return cleaned.replace(/^[._]+/, '') || 'file'
}

export function newKey(requestId: number | string, fileName: string) {
  return `${PREFIX}/${requestId}/${randomUUID()}-${safeFileName(fileName)}`
}

const isValidKey = (key: string) =>
  key.startsWith(`${PREFIX}/`) && !key.includes('..') && /^[\p{L}\p{N}/._-]+$/u.test(key)

export type UploadTarget =
  { mode: 's3'; url: string; fields: Record<string, string> } | { mode: 'local'; url: string }

/** Куда браузеру отправить файл. Для локального режима uploadToken проверяет наш маршрут. */
export async function createUploadTarget(
  key: string,
  contentType: string,
  uploadToken: string,
): Promise<UploadTarget> {
  if (!usesS3())
    return { mode: 'local', url: `/api/public/upload?token=${encodeURIComponent(uploadToken)}` }
  const { url, fields } = await createPresignedPost(s3(), {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Conditions: [
      ['content-length-range', 1, MAX_FILE_BYTES],
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType },
    Expires: 15 * 60,
  })
  return { mode: 's3', url, fields }
}

/** Локальный режим: запись файла, пришедшего на /api/public/upload. */
export async function saveLocalFile(key: string, data: Buffer) {
  if (!isValidKey(key)) throw new Error('bad key')
  const target = path.join(localDir(), key)
  if (!target.startsWith(localDir() + path.sep)) throw new Error('bad key')
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, data)
}

/** Размер загруженного файла или null, если файла нет. */
export async function statFile(key: string): Promise<number | null> {
  if (!isValidKey(key)) return null
  if (usesS3()) {
    try {
      const head = await s3().send(
        new HeadObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      )
      return head.ContentLength ?? null
    } catch {
      return null
    }
  }
  try {
    return (await fs.stat(path.join(localDir(), key))).size
  } catch {
    return null
  }
}

/** Для сотрудника: R2 — короткая подписанная ссылка; локально — содержимое файла. */
export async function readForStaff(
  key: string,
  downloadName: string,
): Promise<{ redirect: string } | { data: Buffer } | null> {
  if (!isValidKey(key)) return null
  if (usesS3()) {
    const url = await getSignedUrl(
      s3(),
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      }),
      { expiresIn: 300 },
    )
    return { redirect: url }
  }
  try {
    return { data: await fs.readFile(path.join(localDir(), key)) }
  } catch {
    return null
  }
}
