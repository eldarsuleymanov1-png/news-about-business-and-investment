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
 */
const publicOpts = { overrideAccess: false as const, fallbackLocale: false as const }

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
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    ...publicOpts,
  })
  return docs[0] ?? null
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

export async function listMaterials(locale: Locale, where: Where = {}, limit = 12, page = 1) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'materials',
    // Материал без перевода на этот язык в ленте не показываем
    where: { and: [where, { title: { exists: true } }] },
    locale,
    sort: '-publishedAt',
    limit,
    page,
    depth: 1,
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

/** Ищет материал по старому адресу — для 301-редиректа. */
export async function findByPreviousPath(path: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'materials',
    where: { 'previousPaths.path': { equals: path } },
    limit: 1,
    depth: 1,
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
