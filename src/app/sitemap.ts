import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { allPublishedMaterials } from '@/lib/feeds'
import { getPayloadClient } from '@/lib/payload'
import { siteUrl } from '@/lib/urls'

// Не пререндерится при сборке (сборке не нужна база); кэш — на CDN
export const dynamic = 'force-dynamic'

/**
 * sitemap.xml: главные, разделы, рубрики, материалы (с hreflang-альтернативами), авторы, служебные страницы.
 * Лимит одного файла — 50 000 адресов; при росте разбить через generateSitemaps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayloadClient()
  const opts = { overrideAccess: false as const, limit: 1000, depth: 1 }
  const [sections, rubrics, authors, pages, materials] = await Promise.all([
    payload.find({ collection: 'sections', ...opts }),
    payload.find({ collection: 'rubrics', ...opts }),
    payload.find({ collection: 'authors', ...opts }),
    payload.find({ collection: 'pages', ...opts }),
    allPublishedMaterials(),
  ])

  /** Один и тот же путь на обоих языках — с взаимными hreflang. */
  const bilingual = (
    path: string,
    lastModified?: string,
    priority?: number,
  ): MetadataRoute.Sitemap =>
    locales.map((l) => ({
      url: `${base}/${l.urlPrefix}${path}`,
      lastModified,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((x) => [x.hreflang, `${base}/${x.urlPrefix}${path}`]),
        ),
      },
    }))

  const entries: MetadataRoute.Sitemap = [
    ...bilingual('', undefined, 1),
    ...sections.docs.flatMap((s) => bilingual(`/${s.slug}`, s.updatedAt, 0.8)),
    ...rubrics.docs.flatMap((r) =>
      typeof r.section === 'object'
        ? bilingual(`/${r.section.slug}/${r.slug}`, r.updatedAt, 0.6)
        : [],
    ),
    ...bilingual('/authors', undefined, 0.3),
    ...bilingual('/corrections', undefined, 0.3),
    ...authors.docs.flatMap((a) => bilingual(`/authors/${a.slug}`, a.updatedAt, 0.3)),
    ...pages.docs.flatMap((p) => bilingual(`/${p.slug}`, p.updatedAt, 0.2)),
  ]

  for (const m of materials) {
    const languages = Object.fromEntries(
      locales.filter((l) => m.urls[l.code]).map((l) => [l.hreflang, `${base}${m.urls[l.code]}`]),
    )
    for (const l of locales) {
      const path = m.urls[l.code]
      if (!path) continue
      entries.push({
        url: `${base}${path}`,
        lastModified: m.updatedAt,
        priority: 0.7,
        alternates: { languages },
      })
    }
  }
  return entries
}
