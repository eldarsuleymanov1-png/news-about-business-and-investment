import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { parseFilters, type SearchParams } from '@/lib/filters'
import { getPageBySlug, getRubrics, getSectionBySlug, getSiteSettings } from '@/lib/payload'
import { rubricHref, sectionHref } from '@/lib/urls'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Listing } from '@/components/Listing'
import { PageShell } from '@/components/PageShell'
import { ServicePage } from '@/components/ServicePage'

// Динамическая страница: фильтры и пагинация через ?format=&audience=&page= — не кэшируется (ISR только у главной, материалов и служебных страниц).
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ lang: string; section: string }>
  searchParams: Promise<SearchParams>
}

const sameSlugAlternates = (slug: string) =>
  Object.fromEntries(locales.map((l) => [l.code, `/${l.urlPrefix}/${slug}`]))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, section: slug } = await params
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(slug, locale)
  const page = section ? null : await getPageBySlug(slug, locale)
  const doc = section ?? page
  if (!doc) return {}
  return {
    title: doc.title,
    description: (section ? section.description : page?.lead) ?? undefined,
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}/${slug}`])),
    },
  }
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { lang, section: slug } = await params
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(slug, locale)

  // Не раздел — возможно, служебная страница (/ua/about, /ua/privacy…)
  if (!section) {
    const page = await getPageBySlug(slug, locale)
    if (!page) notFound()
    return <ServicePage page={page} locale={locale} alternates={sameSlugAlternates(slug)} />
  }

  const dict = getDictionary(locale)
  const filters = parseFilters(await searchParams)
  const [rubrics, settings] = await Promise.all([
    getRubrics(section.id, locale),
    getSiteSettings(locale),
  ])
  const basePath = sectionHref(slug, locale)

  return (
    <PageShell locale={locale} activeSection={slug} alternates={sameSlugAlternates(slug)}>
      <header className="page-head">
        <Breadcrumbs
          label={dict.home}
          items={[
            { label: dict.home, href: `/${prefixFromLocale(locale)}` },
            { label: section.title },
          ]}
        />
        <h1 className="page-title">{section.title}</h1>
        {section.description && <p className="lead">{section.description}</p>}
        <nav className="chips" aria-label={dict.rubric}>
          {rubrics.map((r) => (
            <Link key={r.id} href={rubricHref(slug, r.slug!, locale)} className="pill">
              {r.title}
            </Link>
          ))}
        </nav>
      </header>
      <Listing
        locale={locale}
        where={{ section: { equals: section.id } }}
        filters={filters}
        basePath={basePath}
      />
      {slug === 'checks' && (
        <section id="submit" className="band-dark band-dark--cta">
          <div className="band-dark__text">
            <h2>{dict.doubtTitle}</h2>
            <p>{dict.doubtText}</p>
          </div>
          {/* Форма «Перевірте проєкт» з Turnstile — наступний етап; поки що лист у редакцію */}
          {settings.publisher?.email && (
            <a
              href={`mailto:${settings.publisher.email}?subject=${encodeURIComponent(dict.submitProject)}`}
              className="btn btn--light"
            >
              {dict.submitProject}
            </a>
          )}
        </section>
      )}
    </PageShell>
  )
}
