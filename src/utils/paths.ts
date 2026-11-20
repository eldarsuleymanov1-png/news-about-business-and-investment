import type { Payload, PayloadRequest } from 'payload'
import { prefixFromLocale, type Locale } from '@/i18n/config'

type Rel = number | string | { id: number | string; slug?: string | null } | null | undefined

const slugOf = async (
  payload: Payload,
  collection: 'sections' | 'rubrics',
  rel: Rel,
  req?: PayloadRequest,
): Promise<string | null> => {
  if (!rel) return null
  if (typeof rel === 'object' && rel.slug) return rel.slug
  const id = typeof rel === 'object' ? rel.id : rel
  const doc = await payload.findByID({ collection, id, depth: 0, req }).catch(() => null)
  return doc?.slug ?? null
}

/**
 * Публичный адрес материала: /ua/ukraine/real-estate/nazva-materialu
 */
export async function buildMaterialPath(
  payload: Payload,
  doc: { slug?: string | null; section?: Rel; rubric?: Rel },
  locale: Locale,
  req?: PayloadRequest,
): Promise<string | null> {
  if (!doc.slug) return null
  const [section, rubric] = await Promise.all([
    slugOf(payload, 'sections', doc.section, req),
    slugOf(payload, 'rubrics', doc.rubric, req),
  ])
  if (!section || !rubric) return null
  return `/${prefixFromLocale(locale)}/${section}/${rubric}/${doc.slug}`
}
