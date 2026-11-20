import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { verdictOptions } from '@/collections/Materials/options'
import type { Material } from '@/payload-types'

type Verdict = NonNullable<NonNullable<Material['check']>['verdict']>

export function VerdictBadge({ verdict, locale }: { verdict: Verdict; locale: Locale }) {
  const label = verdictOptions.find((v) => v.value === verdict)?.label[locale] ?? verdict
  return <span className={`verdict verdict--${verdict}`}>{label}</span>
}

/** Метка рекламы: выводится всегда, если материал помечен как рекламный (ТЗ, 5). */
export function SponsorLabel({ material, locale }: { material: Material; locale: Locale }) {
  const s = material.sponsorship
  if (!s?.isSponsored) return null
  const dict = getDictionary(locale)
  return (
    <span className="sponsor-label">
      {s.label === 'partner' ? dict.partner : dict.advertising}
      {s.sponsorName ? ` · ${dict.sponsor}: ${s.sponsorName}` : ''}
    </span>
  )
}
