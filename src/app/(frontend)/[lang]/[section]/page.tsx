import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { getRubrics, getSectionBySlug, listMaterials } from '@/lib/payload'
import { rubricHref } from '@/lib/urls'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'

export const revalidate = 60

type Params = { params: Promise<{ lang: string; section: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, section: slug } = await params
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(slug, locale)
  if (!section) return {}
  return {
    title: section.title,
    description: section.description ?? undefined,
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}/${slug}`])),
    },
  }
}

export default async function SectionPage({ params }: Params) {
  const { lang, section: slug } = await params
  const locale = requireLocale(lang)
  const section = await getSectionBySlug(slug, locale)
  if (!section) notFound()
  const dict = getDictionary(locale)
  const [rubrics, materials] = await Promise.all([
    getRubrics(section.id, locale),
    listMaterials(locale, { section: { equals: section.id } }, 24),
  ])
  return (
    <PageShell locale={locale} activeSection={slug}>
      <header className="stack">
        <h1 className="page-title">{section.title}</h1>
        {section.description && <p className="lead">{section.description}</p>}
        <nav className="chips" aria-label={section.title ?? ''}>
          {rubrics.map((r) => (
            <Link key={r.id} href={rubricHref(slug, r.slug!, locale)} className="chip">
              {r.title}
            </Link>
          ))}
        </nav>
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
