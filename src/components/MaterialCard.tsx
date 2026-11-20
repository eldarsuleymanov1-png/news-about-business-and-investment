import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/dictionary'
import { materialHref } from '@/lib/urls'
import { formatOptions } from '@/collections/Materials/options'
import type { Material } from '@/payload-types'
import { SponsorLabel, VerdictBadge } from './Badges'

export function MaterialCard({ material, locale }: { material: Material; locale: Locale }) {
  const href = materialHref(material, locale)
  const rubric = typeof material.rubric === 'object' ? material.rubric?.title : null
  const format = formatOptions.find((f) => f.value === material.format)?.label[locale]
  return (
    <article className="card">
      <div className="card__kicker">
        {rubric && <span>{rubric}</span>}
        {format && <span className="card__format">· {format}</span>}
      </div>
      {material.format === 'check' && material.check?.verdict && (
        <VerdictBadge verdict={material.check.verdict} locale={locale} />
      )}
      <h3 className="card__title">
        {href ? <Link href={href}>{material.title}</Link> : material.title}
      </h3>
      <SponsorLabel material={material} locale={locale} />
      <div className="card__meta">{formatDate(material.publishedAt, locale)}</div>
    </article>
  )
}
