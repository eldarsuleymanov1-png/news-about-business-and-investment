'use server'

import { getPayloadClient } from '@/lib/payload'
import { CONSENT_POLICY_VERSION } from '@/lib/consent'

/** Запись в журнал согласий. Ошибки не мешают читателю — только логируются. */
export async function logConsent(input: {
  id: string
  analytics: boolean
  action: 'accept-all' | 'necessary-only' | 'custom'
  locale: string
}) {
  if (!/^[a-f0-9-]{36}$/.test(input.id)) return
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'consent-log',
      overrideAccess: true,
      data: {
        consentId: input.id,
        analytics: Boolean(input.analytics),
        action: input.action,
        policyVersion: CONSENT_POLICY_VERSION,
        locale: input.locale === 'en' ? 'en' : 'uk',
      },
    })
  } catch (e) {
    console.error('[consent] log failed', e)
  }
}
