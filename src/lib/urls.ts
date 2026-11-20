import { prefixFromLocale, type Locale } from '@/i18n/config'
import type { Material } from '@/payload-types'

const slugOf = (v: unknown) =>
  v && typeof v === 'object' && 'slug' in v ? (v as { slug?: string }).slug : null

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

export function materialHref(m: Pick<Material, 'slug' | 'section' | 'rubric'>, locale: Locale) {
  const section = slugOf(m.section)
  const rubric = slugOf(m.rubric)
  if (!section || !rubric || !m.slug) return null
  return `/${prefixFromLocale(locale)}/${section}/${rubric}/${m.slug}`
}

export const sectionHref = (slug: string, locale: Locale) => `/${prefixFromLocale(locale)}/${slug}`
export const rubricHref = (section: string, rubric: string, locale: Locale) =>
  `/${prefixFromLocale(locale)}/${section}/${rubric}`
