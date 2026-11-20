import { locales, prefixFromLocale, type Locale } from '@/i18n/config'
import type { Author, Material, Media, Rubric, Section } from '@/payload-types'
import { verdictOptions } from '@/collections/Materials/options'
import { materialHref, siteUrl } from './urls'

/** Схемы Schema.org (JSON-LD) для поисковиков и Google News (ТЗ, 7). */

const abs = (path?: string | null) =>
  path ? (path.startsWith('http') ? path : `${siteUrl()}${path}`) : undefined
const inLanguage = (locale: Locale) => locales.find((l) => l.code === locale)!.hreflang

export function organization(siteName: string, sameAs: string[] = []) {
  return {
    '@type': 'NewsMediaOrganization',
    '@id': `${siteUrl()}/#organization`,
    name: siteName,
    url: siteUrl(),
    logo: { '@type': 'ImageObject', url: `${siteUrl()}/logo.png` },
    sameAs: sameAs.filter(Boolean),
    publishingPrinciples: `${siteUrl()}/ua/editorial-policy`,
    correctionsPolicy: `${siteUrl()}/ua/corrections`,
    verificationFactCheckingPolicy: `${siteUrl()}/ua/methodology`,
  }
}

export function website(siteName: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    name: siteName,
    url: `${siteUrl()}/${prefixFromLocale(locale)}`,
    inLanguage: inLanguage(locale),
    publisher: { '@id': `${siteUrl()}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl()}/${prefixFromLocale(locale)}/search?q={query}`,
      'query-input': 'required name=query',
    },
  }
}

export function breadcrumbs(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  }
}

/** Рейтинг ClaimReview: 1 — худший («Ознаки шахрайства»), 4 — лучший («Ризиків не знайдено»). */
const VERDICT_RATING: Record<string, number> = {
  'fraud-signs': 1,
  'high-risk': 2,
  questions: 3,
  'no-risks': 4,
}

export function articleSchema(m: Material, locale: Locale, siteName: string, sameAs: string[]) {
  const url = abs(materialHref(m, locale))
  const authors = (m.authors ?? []).filter((a): a is Author => typeof a === 'object')
  const cover = (
    typeof m.seo?.image === 'object' ? m.seo.image : typeof m.cover === 'object' ? m.cover : null
  ) as Media | null
  const images = cover
    ? [cover.sizes?.og?.url, cover.sizes?.wide?.url, cover.url].map(abs).filter(Boolean)
    : undefined
  const section = m.section as Section
  const rubric = m.rubric as Rubric

  const article = {
    '@context': 'https://schema.org',
    '@type':
      m.format === 'analysis' || m.format === 'guide' ? 'AnalysisNewsArticle' : 'NewsArticle',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: m.title.slice(0, 110),
    description: m.seo?.description || m.lead || undefined,
    image: images,
    datePublished: m.publishedAt ?? undefined,
    dateModified: m.contentUpdatedAt ?? m.publishedAt ?? undefined,
    inLanguage: inLanguage(locale),
    articleSection: [section?.title, rubric?.title].filter(Boolean),
    isAccessibleForFree: true,
    author: authors.map((a) => ({
      '@type': 'Person',
      name: a.name,
      url: `${siteUrl()}/${prefixFromLocale(locale)}/authors/${a.slug}`,
    })),
    publisher: organization(siteName, sameAs),
    ...(m.sponsorship?.isSponsored
      ? { sponsor: { '@type': 'Organization', name: m.sponsorship.sponsorName || undefined } }
      : {}),
  }

  if (m.format !== 'check' || !m.check?.verdict) return [article]

  const verdict = m.check.verdict
  const subject = m.check.subject
  const claimReview = {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url,
    datePublished: m.publishedAt ?? undefined,
    author: organization(siteName, sameAs),
    claimReviewed: m.lead || m.title,
    itemReviewed: {
      '@type': 'Claim',
      appearance: subject?.website
        ? [{ '@type': 'CreativeWork', url: subject.website }]
        : undefined,
      author: subject?.name
        ? { '@type': 'Organization', name: subject.name, url: subject.website || undefined }
        : undefined,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: VERDICT_RATING[verdict],
      bestRating: 4,
      worstRating: 1,
      alternateName: verdictOptions.find((v) => v.value === verdict)?.label[locale],
    },
    inLanguage: inLanguage(locale),
  }
  return [article, claimReview]
}

/** Встраивает JSON-LD; `<` экранируется, чтобы текст из CMS не закрыл тег script. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}
