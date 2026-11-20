import { locales } from '@/i18n/config'
import { allPublishedMaterials, xmlEscape } from '@/lib/feeds'
import { getPayloadClient } from '@/lib/payload'
import { siteUrl } from '@/lib/urls'

// Не пререндерится при сборке (сборке не нужна база); кэш — на CDN (заголовок ниже)
export const dynamic = 'force-dynamic'

/**
 * Google News sitemap: материалы за последние 48 часов (требование Google), до 1000 адресов.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export async function GET() {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  const [items, settings] = await Promise.all([
    allPublishedMaterials(since),
    getPayloadClient().then((p) => p.findGlobal({ slug: 'site-settings', overrideAccess: false })),
  ])
  const base = siteUrl()
  const urls = items
    .flatMap((m) =>
      locales
        .filter((l) => m.urls[l.code])
        .map(
          (l) => `  <url>
    <loc>${xmlEscape(base + m.urls[l.code]!)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(settings.siteName || 'EL Investments')}</news:name>
        <news:language>${l.hreflang}</news:language>
      </news:publication>
      <news:publication_date>${m.publishedAt}</news:publication_date>
      <news:title>${xmlEscape(m.titles[l.code] ?? '')}</news:title>
    </news:news>
  </url>`,
        ),
    )
    .slice(0, 1000)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>
`
  return new Response(xml, { headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    } })
}
