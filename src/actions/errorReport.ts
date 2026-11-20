'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { verifyTurnstile } from '@/lib/server/turnstile'

/** «Повідомити про помилку» (ТЗ, 5): сообщение попадает в коллекцию error-reports со статусом «Нове». */
export type ErrorReportResult = { ok: true } | { ok: false; error: 'text' | 'captcha' | 'server' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function reportError(form: FormData): Promise<ErrorReportResult> {
  if (String(form.get('company') ?? '').trim()) return { ok: true } // ловушка для ботов
  const selectedText = String(form.get('selectedText') ?? '')
    .trim()
    .slice(0, 1000)
  const comment = String(form.get('comment') ?? '')
    .trim()
    .slice(0, 2000)
  const emailRaw = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 254)
  const materialId = Number(form.get('materialId'))
  const pageUrl = String(form.get('pageUrl') ?? '').slice(0, 500)
  if (selectedText.length < 2 && comment.length < 5) return { ok: false, error: 'text' }

  const h = await headers()
  const ip = h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  if (!(await verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), ip)))
    return { ok: false, error: 'captcha' }

  try {
    const payload = await getPayloadClient()
    // Материал должен существовать и быть опубликованным (проверка правами читателя)
    const material = Number.isInteger(materialId)
      ? await payload
          .findByID({ collection: 'materials', id: materialId, depth: 0, overrideAccess: false })
          .catch(() => null)
      : null
    await payload.create({
      collection: 'error-reports',
      overrideAccess: true,
      data: {
        status: 'new',
        material: material?.id,
        pageUrl: pageUrl.startsWith('/') || pageUrl.startsWith('http') ? pageUrl : undefined,
        selectedText: selectedText || '—',
        comment: comment || undefined,
        email: EMAIL_RE.test(emailRaw) ? emailRaw : undefined,
      },
    })
    return { ok: true }
  } catch (e) {
    console.error('[error-report] failed', e)
    return { ok: false, error: 'server' }
  }
}
