'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import {
  ALLOWED_TYPES,
  MAX_FILE_BYTES,
  MAX_FILES,
  createUploadTarget,
  newKey,
  safeFileName,
  statFile,
  type UploadTarget,
} from '@/lib/server/privateFiles'
import { signToken, verifyToken } from '@/lib/server/token'
import { verifyTurnstile } from '@/lib/server/turnstile'

/**
 * Форма «Перевірте проєкт» (ТЗ, 5). Два шага:
 *  1. submitCheckRequest — проверка Turnstile и полей, создание заявки, выдача адресов для загрузки файлов;
 *  2. браузер загружает файлы (в R2 напрямую или на наш маршрут), затем confirmCheckRequestFiles
 *     проверяет, что файлы на месте, и отмечает их в заявке.
 */

export type CheckRequestErrors = Partial<
  Record<
    'projectName' | 'url' | 'description' | 'email' | 'consent' | 'files' | 'captcha' | 'form',
    string
  >
>

export type CheckRequestResult =
  | { status: 'error'; errors: CheckRequestErrors }
  | { status: 'ok' }
  | {
      status: 'upload'
      uploads: { index: number; target: UploadTarget }[]
      confirmToken: string
    }

type FileMeta = { name: string; size: number; type: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const str = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? '')
    .trim()
    .slice(0, max)

const MSG = {
  uk: {
    projectName: 'Вкажіть назву проєкту.',
    url: 'Посилання має починатися з http:// або https://',
    description: 'Опишіть, що вас насторожило (щонайменше 20 символів).',
    email: 'Вкажіть коректну електронну пошту.',
    consent: 'Потрібна згода на обробку даних.',
    filesCount: `Не більше ${MAX_FILES} файлів.`,
    fileSize: 'Кожен файл — до 10 МБ.',
    fileType: 'Підтримуються PDF, зображення, документи Word і Excel, текст.',
    captcha: 'Підтвердіть, що ви не робот, і спробуйте ще раз.',
    form: 'Не вдалося надіслати заявку. Спробуйте пізніше.',
  },
  en: {
    projectName: 'Enter the project name.',
    url: 'The link must start with http:// or https://',
    description: 'Describe what worried you (at least 20 characters).',
    email: 'Enter a valid email.',
    consent: 'Consent to data processing is required.',
    filesCount: `No more than ${MAX_FILES} files.`,
    fileSize: 'Each file must be up to 10 MB.',
    fileType: 'Supported: PDF, images, Word and Excel documents, text.',
    captcha: 'Please confirm you are not a robot and try again.',
    form: 'Could not send the request. Please try again later.',
  },
}

export async function submitCheckRequest(form: FormData): Promise<CheckRequestResult> {
  const locale = form.get('locale') === 'en' ? 'en' : 'uk'
  const m = MSG[locale]

  // Ловушка для ботов — делаем вид, что всё хорошо
  if (str(form.get('company'), 100)) return { status: 'ok' }

  const projectName = str(form.get('projectName'), 200)
  const url = str(form.get('url'), 500)
  const description = str(form.get('description'), 5000)
  const email = str(form.get('email'), 254).toLowerCase()
  const errors: CheckRequestErrors = {}
  if (projectName.length < 2) errors.projectName = m.projectName
  if (url && !/^https?:\/\/\S+$/i.test(url)) errors.url = m.url
  if (description.length < 20) errors.description = m.description
  if (!EMAIL_RE.test(email)) errors.email = m.email
  if (form.get('consent') !== 'on') errors.consent = m.consent

  let files: FileMeta[] = []
  try {
    const parsed = JSON.parse(String(form.get('files') || '[]'))
    if (Array.isArray(parsed)) {
      files = parsed.map((f) => ({
        name: String(f?.name ?? ''),
        size: Number(f?.size),
        type: String(f?.type ?? ''),
      }))
    }
  } catch {
    files = []
  }
  if (files.length > MAX_FILES) errors.files = m.filesCount
  else if (files.some((f) => !(f.size > 0 && f.size <= MAX_FILE_BYTES))) errors.files = m.fileSize
  else if (files.some((f) => !ALLOWED_TYPES.includes(f.type))) errors.files = m.fileType

  if (Object.keys(errors).length) return { status: 'error', errors }

  const h = await headers()
  const ip = h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  if (!(await verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), ip))) {
    return { status: 'error', errors: { captcha: m.captcha } }
  }

  try {
    const payload = await getPayloadClient()
    const request = await payload.create({
      collection: 'check-requests',
      overrideAccess: true,
      data: {
        projectName,
        url: url || undefined,
        description,
        email,
        locale,
        status: 'new',
        attachments: [],
      },
    })
    if (!files.length) return { status: 'ok' }

    const attachments = files.map((f) => ({
      name: safeFileName(f.name),
      key: newKey(request.id, f.name),
      size: f.size,
      mimeType: f.type,
      uploaded: false,
    }))
    await payload.update({
      collection: 'check-requests',
      id: request.id,
      overrideAccess: true,
      data: { attachments },
    })
    const uploads = await Promise.all(
      attachments.map(async (a, index) => ({
        index,
        target: await createUploadTarget(
          a.key,
          a.mimeType,
          signToken({ key: a.key, size: a.size, type: a.mimeType }, 15 * 60),
        ),
      })),
    )
    return {
      status: 'upload',
      uploads,
      confirmToken: signToken({ requestId: request.id }, 30 * 60),
    }
  } catch (e) {
    console.error('[check-request] create failed', e)
    return { status: 'error', errors: { form: m.form } }
  }
}

/** Шаг 2: отмечаем загруженные файлы. Файлы, которых нет или которые больше лимита, остаются неотмеченными. */
export async function confirmCheckRequestFiles(confirmToken: string): Promise<{ ok: boolean }> {
  const data = verifyToken<{ requestId: number }>(confirmToken)
  if (!data) return { ok: false }
  const payload = await getPayloadClient()
  const request = await payload.findByID({
    collection: 'check-requests',
    id: data.requestId,
    overrideAccess: true,
  })
  const attachments = await Promise.all(
    (request.attachments ?? []).map(async (a) => {
      const size = await statFile(a.key)
      return {
        ...a,
        size: size ?? a.size,
        uploaded: size !== null && size > 0 && size <= MAX_FILE_BYTES,
      }
    }),
  )
  await payload.update({
    collection: 'check-requests',
    id: request.id,
    overrideAccess: true,
    data: { attachments },
  })
  return { ok: attachments.every((a) => a.uploaded) }
}
