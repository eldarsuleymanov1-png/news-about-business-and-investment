import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'
import { locales, type Locale } from '@/i18n/config'
import { buildMaterialPath } from '@/utils/paths'
import { audienceOptions } from '@/collections/Materials/options'

/** Главные (обе версии и отфильтрованные по аудитории) и журнал исправлений. */
const listingPaths = () =>
  locales.flatMap((l) => [
    `/${l.urlPrefix}`,
    `/${l.urlPrefix}/corrections`,
    ...audienceOptions.map((a) => `/${l.urlPrefix}/for/${a.value}`),
  ])

/**
 * Сброс ISR-кэша после сохранения в админке — правка видна на сайте сразу, а не через revalidate.
 * В скриптах (seed, migrate) вне Next.js revalidatePath недоступен — тогда просто пропускаем.
 */
async function revalidate(paths: string[]) {
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of new Set([...paths, ...listingPaths()])) revalidatePath(p)
  } catch {
    /* не в контексте Next.js */
  }
}

export const revalidateMaterial: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const paths: string[] = []
  for (const l of locales) {
    for (const d of [doc, previousDoc]) {
      if (!d) continue
      const p = await buildMaterialPath(req.payload, d, l.code as Locale, req).catch(() => null)
      if (p) paths.push(p)
    }
  }
  await revalidate(paths)
  return doc
}

/** Глобальные настройки и главная влияют на все страницы. */
export const revalidateAll: GlobalAfterChangeHook = async ({ doc }) => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    /* не в контексте Next.js */
  }
  return doc
}
