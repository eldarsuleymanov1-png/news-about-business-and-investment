import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import {
  audienceOptions,
  criterionStatusOptions,
  formatOptions,
  verdictOptions,
} from '@/collections/Materials/options'
import type { Material } from '@/payload-types'

export type Verdict = NonNullable<NonNullable<Material['check']>['verdict']>
type CriterionStatus = 'ok' | 'question' | 'violation'

export const verdictLabel = (v: Verdict, locale: Locale) =>
  verdictOptions.find((o) => o.value === v)?.label[locale] ?? v
export const formatLabel = (f: string | null | undefined, locale: Locale) =>
  formatOptions.find((o) => o.value === f)?.label[locale]
export const audienceLabel = (a: string, locale: Locale) =>
  audienceOptions.find((o) => o.value === a)?.label[locale]

export function VerdictBadge({
  verdict,
  locale,
  size = 'sm',
}: {
  verdict: Verdict
  locale: Locale
  size?: 'sm' | 'lg'
}) {
  return (
    <span className={`verdict verdict--${verdict} verdict--${size}`}>
      {verdictLabel(verdict, locale)}
    </span>
  )
}

export function CriterionBadge({ status, locale }: { status: CriterionStatus; locale: Locale }) {
  const label = criterionStatusOptions.find((o) => o.value === status)?.label[locale]
  return <span className={`criterion-badge criterion-badge--${status}`}>{label}</span>
}

/** Метка рекламы: выводится всегда, если материал помечен как рекламный (ТЗ, 5). */
export function SponsorLabel({
  material,
  locale,
}: {
  material: Pick<Material, 'sponsorship'>
  locale: Locale
}) {
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
