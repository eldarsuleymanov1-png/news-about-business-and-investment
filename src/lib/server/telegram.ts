import type { Payload, PayloadRequest } from 'payload'
import { isEditorial } from '@/access/roles'
import { materialHref, siteUrl } from '@/lib/urls'
import type { Material, Media } from '@/payload-types'

/**
 * Автопостинг в Telegram-канал (ТЗ, 8): заголовок, лид, обложка, ссылка с UTM.
 * Переменные: TELEGRAM_BOT_TOKEN (бот — администратор канала), TELEGRAM_CHANNEL_ID (@username или -100…).
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function buildTelegramPost(m: Material, url: string) {
  const label = m.sponsorship?.isSponsored
    ? `${m.sponsorship.label === 'partner' ? 'Партнерський матеріал' : 'Реклама'}${m.sponsorship.sponsorName ? ` · ${m.sponsorship.sponsorName}` : ''}\n\n`
    : ''
  const link = `${url}?utm_source=telegram&utm_medium=social&utm_campaign=channel`
  const parts = [
    `${esc(label)}<b>${esc(m.title)}</b>`,
    m.lead ? esc(m.lead) : '',
    `<a href="${esc(link)}">Читати →</a>`,
  ]
  let text = parts.filter(Boolean).join('\n\n')
  // Подпись к фото в Telegram — до 1024 символов; лид обрезаем при необходимости
  if (text.length > 1024 && m.lead) {
    const room = 1024 - (text.length - esc(m.lead).length) - 1
    text = [parts[0], `${esc(m.lead).slice(0, Math.max(0, room))}…`, parts[2]].join('\n\n')
  }
  return { text, link }
}

export type TelegramResult =
  | { ok: true; messageUrl: string | null; postedAt: string }
  | { ok: false; status: number; error: string }

export async function postMaterialToTelegram(
  payload: Payload,
  id: number,
  req: PayloadRequest,
  opts: { force?: boolean } = {},
): Promise<TelegramResult> {
  if (!isEditorial(req.user)) return { ok: false, status: 403, error: 'Недостатньо прав' }
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHANNEL_ID
  if (!token || !chat)
    return {
      ok: false,
      status: 501,
      error: 'Telegram не налаштовано: TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID',
    }

  const m = await payload.findByID({ collection: 'materials', id, locale: 'uk', depth: 1, req })
  const isLive =
    ['published', 'scheduled'].includes(m.status) &&
    m.publishedAt &&
    new Date(m.publishedAt) <= new Date()
  if (!isLive) return { ok: false, status: 409, error: 'Матеріал ще не опублікований' }
  if (m.distribution?.telegramPostedAt && !opts.force) {
    return { ok: false, status: 409, error: 'Вже надіслано. Повторити?' }
  }
  const href = materialHref(m, 'uk')
  if (!href) return { ok: false, status: 409, error: 'Немає адреси матеріалу' }

  const { text } = buildTelegramPost(m, `${siteUrl()}${href}`)
  const cover = typeof m.cover === 'object' ? (m.cover as Media) : null
  const photo = cover?.sizes?.og?.url || cover?.url
  const photoUrl = photo ? (photo.startsWith('http') ? photo : `${siteUrl()}${photo}`) : null

  const api = `https://api.telegram.org/bot${token}`
  const body = photoUrl
    ? {
        method: 'sendPhoto',
        data: { chat_id: chat, photo: photoUrl, caption: text, parse_mode: 'HTML' },
      }
    : {
        method: 'sendMessage',
        data: {
          chat_id: chat,
          text,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: false },
        },
      }

  let res: Response
  try {
    res = await fetch(`${api}/${body.method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.data),
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return { ok: false, status: 502, error: 'Telegram недоступний' }
  }
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    description?: string
    result?: { message_id: number; chat?: { username?: string } }
  }
  if (!data.ok || !data.result) {
    // Токен бота не попадает в ответ — только описание ошибки Telegram
    return { ok: false, status: 502, error: `Telegram: ${data.description ?? res.status}` }
  }
  const username = data.result.chat?.username ?? (chat.startsWith('@') ? chat.slice(1) : null)
  const messageUrl = username ? `https://t.me/${username}/${data.result.message_id}` : null
  const postedAt = new Date().toISOString()
  await payload.update({
    collection: 'materials',
    id,
    req,
    // Служебное обновление: только поля распространения, редакционные правила не применяются
    context: { distributionOnly: true },
    data: {
      distribution: {
        ...(m.distribution ?? {}),
        telegramPostedAt: postedAt,
        telegramMessageUrl: messageUrl,
      },
    },
  })
  return { ok: true, messageUrl, postedAt }
}
