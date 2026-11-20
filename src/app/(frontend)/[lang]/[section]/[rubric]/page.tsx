import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { getRubrics, getSectionBySlug, listMaterials } from '@/lib/payload'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'

export const revalidate = 60

type Params = { params: Promise<{ lang: string; section: string; rubric: string }> }

async function load(lang: string, sectionSlug: string, rubricSlug: string) {
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(sectionSlug, locale)
  if (!section) return null
  const rubric = (await getRubrics(section.id, locale)).find((r) => r.slug === rubricSlug)
  if (!rubric) return null
  return { locale, section, rubric }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, section, rubric } = await params
  const data = await load(lang, section, rubric)
  if (!data) return {}
  const path = `${section}/${rubric}`
  return {
    title: data.rubric.title,
    alternates: {
      canonical: `/${lang}/${path}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}/${path}`])),
    },
  }
}

export default async function RubricPage({ params }: Params) {
  const { lang, section, rubric } = await params
  const data = await load(lang, section, rubric)
  if (!data) notFound()
  const { locale } = data
  const dict = getDictionary(locale)
  const materials = await listMaterials(locale, { rubric: { equals: data.rubric.id } }, 24)
  return (
    <PageShell locale={locale} activeSection={section}>
      <header className="stack">
        <p className="kicker">{data.section.title}</p>
        <h1 className="page-title">{data.rubric.title}</h1>
      </header>
      {materials.docs.length ? (
        <div className="grid">
          {materials.docs.map((m) => (
            <MaterialCard key={m.id} material={m} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="muted">{dict.noMaterials}</p>
      )}
    </PageShell>
  )
}
