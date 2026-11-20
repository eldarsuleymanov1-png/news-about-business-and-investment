/**
 * Подписка через Beehiiv API v2 (выбор владельца).
 * Double opt-in принудительно включён: подписчик подтверждает адрес письмом.
 * Документация: https://developers.beehiiv.com/api-reference/subscriptions/create
 */
export type SubscribeInput = {
  email: string
  interests: string[]
  locale: string
  referringSite?: string
}

export type SubscribeResult = { ok: true } | { ok: false; reason: 'not-configured' | 'api-error' }

export async function subscribeToBeehiiv(input: SubscribeInput): Promise<SubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID
  if (!apiKey || !publicationId) return { ok: false, reason: 'not-configured' }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        reactivate_existing: false,
        send_welcome_email: true,
        double_opt_override: 'on',
        utm_source: 'website',
        utm_medium: 'subscribe-form',
        referring_site: input.referringSite,
        // Поля нужно один раз создать в настройках публикации Beehiiv (Custom fields)
        custom_fields: [
          { name: 'interests', value: input.interests.join(',') },
          { name: 'language', value: input.locale },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    },
  ).catch(() => null)

  if (!res || !res.ok) return { ok: false, reason: 'api-error' }
  return { ok: true }
}
