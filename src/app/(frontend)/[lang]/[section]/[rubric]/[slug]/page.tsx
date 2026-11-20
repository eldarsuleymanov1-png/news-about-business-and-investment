import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { locales, prefixFromLocale, type Locale } from '@/i18n/config'
import { formatDate, getDictionary, requireLocale } from '@/lib/dictionary'
import {
  findByPreviousPath,
  getMaterial,
  getMaterialTranslations,
  getPayloadClient,
  getRubrics,
  getSectionBySlug,
} from '@/lib/payload'
import { materialHref } from '@/lib/urls'
import {
  DISCLAIMER_FORMATS,
  criterionOptions,
  criterionStatusOptions,
  formatOptions,
} from '@/collections/Materials/options'
import { SponsorLabel, VerdictBadge } from '@/components/Badges'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'
import { RichText } from '@/components/RichText'
import type { Author, Material } from '@/payload-types'

export const revalidate = 60

type Params = { params: Promise<{ lang: string; section: string; rubric: string; slug: string }> }

async function load({
  lang,
  section: sectionSlug,
  rubric: rubricSlug,
  slug,
}: Awaited<Params['params']>) {
  const locale = requireLocale(lang)
  const path = `/${lang}/${sectionSlug}/${rubricSlug}/${slug}`
  const section = await getSectionBySlug(sectionSlug, locale)
  const rubric = section
    ? (await getRubrics(section.id, locale)).find((r) => r.slug === rubricSlug)
    : undefined
  const material = section && rubric ? await getMaterial(locale, section, rubric, slug) : null
  if (material) return { locale, material, path }

  // Старый адрес → 301 на актуальный
  const moved = await findByPreviousPath(path)
  if (moved) {
    const payload = await getPayloadClient()
    const fresh = await payload.findByID({
      collection: 'materials',
      id: moved.id,
      locale,
      depth: 1,
      overrideAccess: false,
      fallbackLocale: false,
    })
    const target = materialHref(fresh, locale)
    if (target && target !== path) permanentRedirect(target)
  }
  return null
}

/** Адреса материала на всех языках, где есть перевод. */
async function alternatesFor(material: Material) {
  const t = await getMaterialTranslations(material.id)
  const out: Partial<Record<Locale, string>> = {}
  for (const l of locales) {
    if (!t.title?.[l.code] || !t.slug?.[l.code]) continue
    const href = materialHref(
      { slug: t.slug[l.code]!, section: t.section, rubric: t.rubric } as Material,
      l.code,
    )
    if (href) out[l.code] = href
  }
  return out
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await load(await params)
  if (!data) return {}
  const { material: m, locale, path } = data
  const alternates = await alternatesFor(m)
  const image =
    typeof m.seo?.image === 'object' ? m.seo.image : typeof m.cover === 'object' ? m.cover : null
  return {
    title: m.seo?.title || m.title,
    description: m.seo?.description || m.lead || undefined,
    robots: m.seo?.noindex ? { index: false } : undefined,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        Object.entries(alternates).map(([code, href]) => [
          locales.find((l) => l.code === code)!.hreflang,
          href,
        ]),
      ),
    },
    openGraph: {
      type: 'article',
      title: m.seo?.title || m.title,
      description: m.seo?.description || m.lead || undefined,
      publishedTime: m.publishedAt ?? undefined,
      modifiedTime: m.contentUpdatedAt ?? undefined,
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
      images: image?.sizes?.og?.url
        ? [{ url: image.sizes.og.url, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function MaterialPage({ params }: Params) {
  const p = await params
  const data = await load(p)
  if (!data) notFound()
  const { material: m, locale } = data
  const dict = getDictionary(locale)
  const payload = await getPayloadClient()
  const [alternates, settings] = await Promise.all([
    alternatesFor(m),
    payload.findGlobal({ slug: 'site-settings', locale }),
  ])
  const authors = (m.authors ?? []).filter((a): a is Author => typeof a === 'object')
  const format = formatOptions.find((f) => f.value === m.format)?.label[locale]
  const showDisclaimer = DISCLAIMER_FORMATS.includes(m.format as never)

  return (
    <PageShell locale={locale} alternates={alternates} activeSection={p.section}>
      <article className="article">
        <header className="stack">
          <div className="card__kicker">
            {typeof m.rubric === 'object' && <span>{m.rubric.title}</span>}
            {format && <span className="card__format">· {format}</span>}
          </div>
          <SponsorLabel material={m} locale={locale} />
          <h1 className="article__title">{m.title}</h1>
          {m.lead && <p className="lead">{m.lead}</p>}
          <div className="article__meta">
            {authors.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ', '}
                <Link href={`/${prefixFromLocale(locale)}/authors/${a.slug}`}>{a.name}</Link>
              </span>
            ))}
            <span>
              {' '}
              · {dict.published} {formatDate(m.publishedAt, locale, true)}
            </span>
            {m.contentUpdatedAt && (
              <span>
                {' '}
                · {dict.updated} {formatDate(m.contentUpdatedAt, locale, true)}
              </span>
            )}
          </div>
        </header>

        {m.format === 'check' && m.check?.verdict && (
          <section className="verdict-card">
            <p className="kicker">{dict.verdict}</p>
            <VerdictBadge verdict={m.check.verdict} locale={locale} />
            {!!m.check.criteria?.length && (
              <ul className="criteria">
                {m.check.criteria.map((c) => (
                  <li key={c.id} className={`criteria__item criteria__item--${c.status}`}>
                    <strong>
                      {criterionOptions.find((o) => o.value === c.criterion)?.label[locale]}
                    </strong>
                    <span>
                      {criterionStatusOptions.find((o) => o.value === c.status)?.label[locale]}
                    </span>
                    {c.comment && <p>{c.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {m.tldr && (
          <aside className="callout callout--important">
            <strong>{dict.tldr}</strong>
            <p>{m.tldr}</p>
          </aside>
        )}
        {m.format === 'guide' && m.verifiedAt && (
          <p className="muted">
            {dict.verifiedAt} {formatDate(m.verifiedAt, locale)}
          </p>
        )}

        <RichText data={m.content as never} />

        {m.format === 'news' && m.investorTakeaway && (
          <aside className="callout callout--investor">
            <strong>{dict.investorTakeaway}</strong>
            <p>{m.investorTakeaway}</p>
          </aside>
        )}

        {m.format === 'check' && !!m.check?.verdictHistory?.length && (
          <section className="stack">
            <h2 className="section-title">{dict.verdictHistory}</h2>
            <ol className="history">
              {m.check.verdictHistory.map((h) => (
                <li key={h.id}>
                  {formatDate(h.date, locale)} —{' '}
                  <VerdictBadge verdict={h.verdict} locale={locale} />
                  {h.note && <span> {h.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {!!m.sources?.length && (
          <section className="stack">
            <h2 className="section-title">{dict.sources}</h2>
            <ol className="sources">
              {m.sources.map((s) => (
                <li key={s.id}>
                  {s.url ? (
                    <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {showDisclaimer && <p className="disclaimer">{settings.disclaimerShort}</p>}
      </article>

      {!!m.related?.length && (
        <section className="stack">
          <h2 className="section-title">{dict.related}</h2>
          <div className="grid">
            {m.related
              .filter((r): r is Material => typeof r === 'object')
              .map((r) => (
                <MaterialCard key={r.id} material={r} locale={locale} />
              ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
