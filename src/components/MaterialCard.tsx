import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { formatDate, formatFeedTime, getDictionary } from '@/lib/dictionary'
import { readingMinutes } from '@/lib/content'
import { materialHref } from '@/lib/urls'
import type { Author, Material } from '@/payload-types'
import { SponsorLabel, VerdictBadge, formatLabel } from './Badges'
import { Cover } from './Cover'

type Variant = 'grid' | 'row' | 'feed' | 'headline' | 'check' | 'link'

const rubricTitle = (m: Material) => (typeof m.rubric === 'object' ? m.rubric?.title : null)
const authorNames = (m: Material) =>
  (m.authors ?? [])
    .filter((a): a is Author => typeof a === 'object')
    .map((a) => a.name)
    .join(', ')

/** «Рубрика · Формат» — как в макетах. */
export function Kicker({ material, locale }: { material: Material; locale: Locale }) {
  const parts = [rubricTitle(material), formatLabel(material.format, locale)].filter(Boolean)
  return <div className="kicker">{parts.join(' · ')}</div>
}

function Meta({ material, locale }: { material: Material; locale: Locale }) {
  const dict = getDictionary(locale)
  const authors = authorNames(material)
  const minutes = readingMinutes(material.content as never, material.lead ?? '')
  return (
    <div className="card__meta">
      {[authors, formatDate(material.publishedAt, locale, { year: false }), dict.minRead(minutes)]
        .filter(Boolean)
        .join(' · ')}
    </div>
  )
}

export function MaterialCard({
  material: m,
  locale,
  variant = 'grid',
}: {
  material: Material
  locale: Locale
  variant?: Variant
}) {
  const href = materialHref(m, locale) ?? '#'
  const dict = getDictionary(locale)

  switch (variant) {
    case 'feed':
      return (
        <div className="feed-item">
          <span className="feed-item__time">{formatFeedTime(m.publishedAt, locale)}</span>
          <Link href={href}>{m.title}</Link>
        </div>
      )
    case 'headline':
      return (
        <div className="headline-item">
          <span className="headline-item__tag">{rubricTitle(m)}</span>
          <Link href={href}>{m.title}</Link>
        </div>
      )
    case 'link':
      return (
        <Link href={href} className="link-item">
          {m.title}
        </Link>
      )
    case 'check': {
      const criteria = m.check?.criteria?.length ?? 0
      return (
        <Link href={href} className="check-card">
          {m.check?.verdict && <VerdictBadge verdict={m.check.verdict} locale={locale} />}
          <span className="check-card__title">{m.check?.subject?.name || m.title}</span>
          <span className="check-card__meta">
            {dict.checkedOn} {formatDate(m.publishedAt, locale, { year: false })}
            {criteria ? ` · ${dict.criteriaCount(criteria)}` : ''}
          </span>
        </Link>
      )
    }
    case 'row':
      return (
        <article className="row-card">
          <Link href={href} tabIndex={-1} aria-hidden className="row-card__media">
            <Cover media={m.cover} size="thumb" ratio="3/2" sizes="200px" />
          </Link>
          <div className="row-card__body">
            <Kicker material={m} locale={locale} />
            <h3 className="card__title">
              <Link href={href}>{m.title}</Link>
            </h3>
            <SponsorLabel material={m} locale={locale} />
            <Meta material={m} locale={locale} />
          </div>
        </article>
      )
    default:
      return (
        <article className="card">
          <Link href={href} tabIndex={-1} aria-hidden>
            <Cover media={m.cover} ratio="3/2" sizes="(max-width: 768px) 100vw, 380px" />
          </Link>
          <Kicker material={m} locale={locale} />
          {m.format === 'check' && m.check?.verdict && (
            <VerdictBadge verdict={m.check.verdict} locale={locale} />
          )}
          <h3 className="card__title">
            <Link href={href}>{m.title}</Link>
          </h3>
          <SponsorLabel material={m} locale={locale} />
          <Meta material={m} locale={locale} />
        </article>
      )
  }
}
