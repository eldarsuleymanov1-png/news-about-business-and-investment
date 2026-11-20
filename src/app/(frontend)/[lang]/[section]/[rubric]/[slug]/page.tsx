import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { locales, prefixFromLocale, type Locale } from '@/i18n/config'
import { requireLocale } from '@/lib/dictionary'
import {
  findByPreviousPath,
  getMaterial,
  getMaterialById,
  getMaterialTranslations,
  getRubrics,
  getSectionBySlug,
  getSiteSettings,
  listMaterials,
} from '@/lib/payload'
import { materialHref, rubricHref, sectionHref, siteUrl } from '@/lib/urls'
import { PageShell } from '@/components/PageShell'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, breadcrumbs } from '@/lib/seo'
import { ArticleView } from '@/components/templates/ArticleView'
import { CheckView } from '@/components/templates/CheckView'
import type { Material, Rubric, Section } from '@/payload-types'

export const revalidate = 60

/**
 * Пустой список: при сборке ничего не пререндерим (базе не нужно быть доступной),
 * страницы рендерятся при первом запросе и кэшируются (ISR, revalidate выше).
 */
export function generateStaticParams() {
  return []
}

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

  // Старый адрес → постоянный редирект на актуальный
  const moved = await findByPreviousPath(path)
  if (moved) {
    const fresh = await getMaterialById(moved.id, locale)
    const target = fresh ? materialHref(fresh, locale) : null
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
  const title = m.seo?.title || m.title
  const description = m.seo?.description || m.lead || undefined
  return {
    title,
    description,
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
      title,
      description,
      url: path,
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
  const { material: m, locale, path } = data
  const url = `${siteUrl()}${path}`
  const [alternates, settings] = await Promise.all([alternatesFor(m), getSiteSettings(locale)])

  const section = m.section as Section
  const rubric = m.rubric as Rubric
  const sameAs = Object.values(settings.social ?? {}).filter(
    (v): v is string => typeof v === 'string' && !!v,
  )
  const schema = (
    <JsonLd
      data={[
        ...articleSchema(m, locale, settings.siteName, sameAs),
        breadcrumbs([
          { name: settings.siteName, path: `/${prefixFromLocale(locale)}` },
          { name: section.title, path: sectionHref(section.slug!, locale) },
          { name: rubric.title, path: rubricHref(section.slug!, rubric.slug!, locale) },
          { name: m.title, path },
        ]),
      ]}
    />
  )

  if (m.format === 'check') {
    return (
      <PageShell locale={locale} alternates={alternates} activeSection={p.section}>
        {schema}
        <CheckView
          material={m}
          locale={locale}
          url={url}
          submitHref={`/${prefixFromLocale(locale)}/check-request`}
        />
      </PageShell>
    )
  }

  // «Читайте також»: выбранные редакцией, иначе свежие из той же рубрики
  let related = (m.related ?? []).filter((r): r is Material => typeof r === 'object')
  if (!related.length) {
    const rubricId = typeof m.rubric === 'object' ? m.rubric.id : m.rubric
    related = (
      await listMaterials(
        locale,
        { and: [{ rubric: { equals: rubricId } }, { id: { not_equals: m.id } }] },
        { limit: 3 },
      )
    ).docs
  }

  return (
    <PageShell locale={locale} alternates={alternates} activeSection={p.section}>
      {schema}
      <ArticleView
        material={m}
        locale={locale}
        url={url}
        disclaimer={settings.disclaimerShort}
        related={related.slice(0, 3)}
      />
    </PageShell>
  )
}
