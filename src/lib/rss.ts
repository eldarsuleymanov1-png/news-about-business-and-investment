import { localeFromPrefix, locales, prefixFromLocale } from '@/i18n/config'
import { getSectionBySlug, getSiteSettings, listMaterials } from './payload'
import { xmlEscape } from './feeds'
import { materialHref, siteUrl } from './urls'
import type { Author, Media } from '@/payload-types'

/** RSS 2.0: вся языковая версия (/ua/rss.xml) или раздел (/ua/ukraine/rss.xml). Последние 50 материалов. */
export async function rssResponse(lang: string, sectionSlug?: string): Promise<Response> {
  const locale = localeFromPrefix(lang)
  if (!locale) return new Response('Not found', { status: 404 })
  const section = sectionSlug ? await getSectionBySlug(sectionSlug, locale) : null
  if (sectionSlug && !section) return new Response('Not found', { status: 404 })

  const [settings, { docs }] = await Promise.all([
    getSiteSettings(locale),
    listMaterials(locale, section ? { section: { equals: section.id } } : {}, {
      limit: 50,
      depth: 1,
    }),
  ])
  const base = siteUrl()
  const selfPath = `/${prefixFromLocale(locale)}${section ? `/${section.slug}` : ''}/rss.xml`
  const siteName = settings.siteName || 'Invest Venture'
  const title = section ? `${section.title} — ${siteName}` : siteName

  const items = docs
    .map((m) => {
      const href = materialHref(m, locale)
      if (!href) return ''
      const cover = typeof m.cover === 'object' ? (m.cover as Media) : null
      const img = cover?.sizes?.card?.url || cover?.url
      const authors = (m.authors ?? [])
        .filter((a): a is Author => typeof a === 'object')
        .map((a) => a.name)
      const category = typeof m.rubric === 'object' ? m.rubric.title : ''
      // Реклама маркируется и в ленте (ТЗ, 9)
      const label = m.sponsorship?.isSponsored
        ? `[${m.sponsorship.label === 'partner' ? (locale === 'uk' ? 'Партнерський матеріал' : 'Partner content') : locale === 'uk' ? 'Реклама' : 'Advertising'}] `
        : ''
      return `    <item>
      <title>${xmlEscape(label + m.title)}</title>
      <link>${base}${href}</link>
      <guid isPermaLink="false">iv-material-${m.id}</guid>
      <pubDate>${new Date(m.publishedAt ?? m.createdAt).toUTCString()}</pubDate>
      ${m.lead ? `<description>${xmlEscape(m.lead)}</description>` : ''}
      ${category ? `<category>${xmlEscape(category)}</category>` : ''}
      ${authors.map((a) => `<dc:creator>${xmlEscape(a)}</dc:creator>`).join('')}
      ${img ? `<enclosure url="${xmlEscape(img.startsWith('http') ? img : base + img)}" type="${cover?.mimeType ?? 'image/webp'}" length="0"/>` : ''}
    </item>`
    })
    .filter(Boolean)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${base}/${prefixFromLocale(locale)}${section ? `/${section.slug}` : ''}</link>
    <description>${xmlEscape(settings.tagline || siteName)}</description>
    <language>${locales.find((l) => l.code === locale)!.hreflang}</language>
    <atom:link href="${base}${selfPath}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}
