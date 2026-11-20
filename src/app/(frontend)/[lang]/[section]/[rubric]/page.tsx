import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { parseFilters, type SearchParams } from '@/lib/filters'
import { getRubrics, getSectionBySlug } from '@/lib/payload'
import { rubricHref, sectionHref } from '@/lib/urls'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Listing } from '@/components/Listing'
import { PageShell } from '@/components/PageShell'

// Динамическая страница: фильтры и пагинация через ?format=&audience=&page= — не кэшируется (ISR только у главной, материалов и служебных страниц).
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ lang: string; section: string; rubric: string }>
  searchParams: Promise<SearchParams>
}

async function load(lang: string, sectionSlug: string, rubricSlug: string) {
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(sectionSlug, locale)
  if (!section) return null
  const rubric = (await getRubrics(section.id, locale)).find((r) => r.slug === rubricSlug)
  if (!rubric) return null
  return { locale, section, rubric }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, section, rubric } = await params
  const data = await load(lang, section, rubric)
  if (!data) return {}
  const path = `${section}/${rubric}`
  return {
    title: data.rubric.title,
    description: data.rubric.description ?? undefined,
    alternates: {
      canonical: `/${lang}/${path}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}/${path}`])),
    },
  }
}

export default async function RubricPage({ params, searchParams }: Props) {
  const { lang, section, rubric } = await params
  const data = await load(lang, section, rubric)
  if (!data) notFound()
  const { locale } = data
  const dict = getDictionary(locale)
  const filters = parseFilters(await searchParams)
  const alternates = Object.fromEntries(
    locales.map((l) => [l.code, `/${l.urlPrefix}/${section}/${rubric}`]),
  )
  return (
    <PageShell locale={locale} activeSection={section} alternates={alternates}>
      <header className="page-head">
        <Breadcrumbs
          label={dict.home}
          items={[
            { label: dict.home, href: `/${prefixFromLocale(locale)}` },
            { label: data.section.title, href: sectionHref(section, locale) },
            { label: data.rubric.title },
          ]}
        />
        <h1 className="page-title">{data.rubric.title}</h1>
        {data.rubric.description && <p className="lead">{data.rubric.description}</p>}
      </header>
      <Listing
        locale={locale}
        where={{ rubric: { equals: data.rubric.id } }}
        filters={filters}
        basePath={rubricHref(section, rubric, locale)}
      />
    </PageShell>
  )
}
