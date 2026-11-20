/**
 * Согласие на cookies — общая часть для клиента и сервера.
 * Меняйте CONSENT_POLICY_VERSION при изменении политики: баннер покажется снова.
 */
export const CONSENT_COOKIE = 'el_consent'
export const CONSENT_POLICY_VERSION = '2026-11-20'

export type ConsentState = { id: string; analytics: boolean; v: string; ts: number }

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null
  try {
    const c = JSON.parse(decodeURIComponent(raw)) as ConsentState
    if (c.v !== CONSENT_POLICY_VERSION || typeof c.id !== 'string') return null
    return c
  } catch {
    return null
  }
}
