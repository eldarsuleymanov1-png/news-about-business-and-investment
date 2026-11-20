/**
 * Проверка Cloudflare Turnstile (защита форм от спама, ТЗ 5).
 * Ключи: NEXT_PUBLIC_TURNSTILE_SITE_KEY (виджет) и TURNSTILE_SECRET_KEY (сервер).
 * Без ключей: в разработке проверка пропускается, в продакшене форма отклоняется (fail closed).
 */
export const turnstileConfigured = () => Boolean(process.env.TURNSTILE_SECRET_KEY)

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[turnstile] TURNSTILE_SECRET_KEY не задан — форма отклонена')
      return false
    }
    return true
  }
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (e) {
    console.error('[turnstile] verify failed', e)
    return false
  }
}
