import { locales, type Locale } from '@/i18n/config'
import { getPayloadClient } from './payload'
import { materialHref } from './urls'
import type { Material } from '@/payload-types'

/**
 * Данные для sitemap/RSS. Только то, что видит читатель (overrideAccess: false),
 * с адресами на всех языках, где есть перевод.
 */
export type FeedItem = {
  id: number
  urls: Partial<Record<Locale, string>>
  titles: Partial<Record<Locale, string>>
  publishedAt: string
  updatedAt: string
}

const PAGE = 500

export async function allPublishedMaterials(sinceIso?: string): Promise<FeedItem[]> {
  const payload = await getPayloadClient()
  const out: FeedItem[] = []
  for (let page = 1; page < 200; page++) {
    const res = await payload.find({
      collection: 'materials',
      locale: 'all',
      depth: 1,
      limit: PAGE,
      page,
      sort: '-publishedAt',
      overrideAccess: false,
      where: {
        and: [
          { 'seo.noindex': { not_equals: true } },
          ...(sinceIso ? [{ publishedAt: { greater_than: sinceIso } }] : []),
        ],
      },
      select: {
        title: true,
        slug: true,
        section: true,
        rubric: true,
        publishedAt: true,
        contentUpdatedAt: true,
        updatedAt: true,
      },
    })
    for (const d of res.docs as unknown as (Omit<Material, 'title' | 'slug'> & {
      title?: Partial<Record<Locale, string>>
      slug?: Partial<Record<Locale, string>>
    })[]) {
      const urls: FeedItem['urls'] = {}
      for (const l of locales) {
        const slug = d.slug?.[l.code]
        if (!slug || !d.title?.[l.code]) continue
        const href = materialHref(
          { slug, section: d.section, rubric: d.rubric } as Material,
          l.code,
        )
        if (href) urls[l.code] = href
      }
      if (!Object.keys(urls).length) continue
      out.push({
        id: d.id,
        urls,
        titles: d.title ?? {},
        publishedAt: d.publishedAt ?? d.updatedAt,
        updatedAt: d.contentUpdatedAt ?? d.updatedAt,
      })
    }
    if (!res.hasNextPage) break
  }
  return out
}

export const xmlEscape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
