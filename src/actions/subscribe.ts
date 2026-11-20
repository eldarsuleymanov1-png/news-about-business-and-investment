'use server'

import { headers } from 'next/headers'
import { subscribeToBeehiiv } from '@/lib/beehiiv'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/i18n/config'

export type SubscribeState = {
  status: 'idle' | 'ok' | 'error'
  message?: string
  /** Введённые значения — чтобы React не стёр их при ошибке (форма сбрасывается после action) */
  values?: { email: string; consent: boolean; interests: string[] }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ALLOWED_INTERESTS = new Set(['ukraine', 'abroad', 'checks', 'news'])

export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  const locale: Locale = form.get('locale') === 'en' ? 'en' : 'uk'
  const dict = getDictionary(locale)

  // Ловушка для ботов: поле скрыто от людей
  if (String(form.get('company') ?? '').trim()) return { status: 'ok', message: dict.subscribeOk }

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  const interests = form
    .getAll('interests')
    .map(String)
    .filter((i) => ALLOWED_INTERESTS.has(i))
  const values = { email, consent: form.get('consent') === 'on', interests }
  if (!EMAIL_RE.test(email) || email.length > 254)
    return { status: 'error', message: dict.subscribeErrEmail, values }
  if (form.get('consent') !== 'on')
    return { status: 'error', message: dict.subscribeErrConsent, values }

  const referer = (await headers()).get('referer') ?? undefined

  const result = await subscribeToBeehiiv({ email, interests, locale, referringSite: referer })
  if (!result.ok) {
    console.error('[subscribe] Beehiiv:', result.reason)
    return { status: 'error', message: dict.subscribeErr, values }
  }
  return { status: 'ok', message: dict.subscribeOk }
}
