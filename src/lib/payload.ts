import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'
import type { Locale } from '@/i18n/config'
import type { Material, Rubric, Section } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

/**
 * Все публичные запросы идут с overrideAccess: false и без пользователя —
 * значит, читатель получает ровно то, что разрешает access.read коллекции
 * (только опубликованное и наступившие запланированные).
 * fallbackLocale: false — английская страница не подменяется украинским текстом.
 */
const publicOpts = { overrideAccess: false as const, fallbackLocale: false as const }

// ---------------------------------------------------------------- структура

export const getSections = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sections',
    locale,
    sort: 'order',
    limit: 10,
    ...publicOpts,
  })
  return docs
})

export const getSectionBySlug = cache(async (slug: string, locale: Locale) => {
  const sections = await getSections(locale)
  return sections.find((s) => s.slug === slug) ?? null
})

export const getRubrics = cache(async (sectionId: number, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rubrics',
    where: { section: { equals: sectionId } },
    locale,
    sort: 'order',
    limit: 50,
    ...publicOpts,
  })
  return docs
})

export const getSiteSettings = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, ...publicOpts })
})

export const getHomepage = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'homepage', locale, depth: 2, ...publicOpts })
})

// ---------------------------------------------------------------- материалы

export type ListOptions = { limit?: number; page?: number; depth?: number }

export async function listMaterials(locale: Locale, where: Where = {}, opts: ListOptions = {}) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'materials',
    // Материал без перевода на этот язык в ленте не показываем
    where: { and: [where, { title: { exists: true } }] },
    locale,
    sort: '-publishedAt',
    limit: opts.limit ?? 12,
    page: opts.page ?? 1,
    depth: opts.depth ?? 1,
    ...publicOpts,
  })
}

export async function getMaterial(locale: Locale, section: Section, rubric: Rubric, slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'materials',
    where: {
      and: [
        { slug: { equals: slug } },
        { section: { equals: section.id } },
        { rubric: { equals: rubric.id } },
      ],
    },
    locale,
    limit: 1,
    depth: 2,
    ...publicOpts,
  })
  return (docs[0] as Material | undefined) ?? null
}

export async function getMaterialById(id: number, locale: Locale) {
  const payload = await getPayloadClient()
  return payload
    .findByID({ collection: 'materials', id, locale, depth: 1, ...publicOpts })
    .catch(() => null)
}

/** Ищет материал по старому адресу — для 301-редиректа. */
export async function findByPreviousPath(path: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'materials',
    where: { 'previousPaths.path': { equals: path } },
    limit: 1,
    depth: 0,
    ...publicOpts,
  })
  return docs[0] ?? null
}

/** Все языковые версии материала: для hreflang и переключателя языка. */
export async function getMaterialTranslations(id: number) {
  const payload = await getPayloadClient()
  const doc = await payload.findByID({
    collection: 'materials',
    id,
    locale: 'all',
    depth: 1,
    select: { title: true, slug: true, section: true, rubric: true },
    ...publicOpts,
  })
  return doc as unknown as {
    title?: Partial<Record<Locale, string>>
    slug?: Partial<Record<Locale, string>>
    section: Section | number
    rubric: Rubric | number
  }
}

/**
 * Временный поиск по заголовку и ліду средствами PostgreSQL.
 * Заменяется на Meilisearch (украинская морфология) на этапе интеграций — интерфейс тот же.
 */
export async function searchMaterials(
  locale: Locale,
  query: string,
  filters: { section?: number; from?: string; to?: string },
  page = 1,
) {
  const and: Where[] = []
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 6)
  for (const w of words) and.push({ or: [{ title: { like: w } }, { lead: { like: w } }] })
  if (filters.section) and.push({ section: { equals: filters.section } })
  if (filters.from) and.push({ publishedAt: { greater_than_equal: filters.from } })
  if (filters.to) and.push({ publishedAt: { less_than_equal: `${filters.to}T23:59:59.999Z` } })
  return listMaterials(locale, { and }, { limit: 20, page })
}

// ---------------------------------------------------------------- редакция и служебное

export const getAuthorBySlug = cache(async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'authors',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    ...publicOpts,
  })
  return docs[0] ?? null
})

export async function listAuthors(locale: Locale) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'authors',
    locale,
    sort: 'name',
    limit: 100,
    ...publicOpts,
  })
  return docs
}

export const getPageBySlug = cache(async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    ...publicOpts,
  })
  return docs[0] ?? null
})

export const getFooterPages = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { footerGroup: { exists: true } },
    locale,
    sort: 'footerOrder',
    limit: 30,
    select: { title: true, slug: true, footerGroup: true },
    ...publicOpts,
  })
  return docs
})

export async function listCorrections(locale: Locale, page = 1) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'corrections',
    locale,
    sort: '-date',
    limit: 50,
    page,
    depth: 2,
    ...publicOpts,
  })
}
