import type { Where } from 'payload'
import { audienceOptions, formatOptions } from '@/collections/Materials/options'

export type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export const AUDIENCES = audienceOptions.map((o) => o.value)
export const FORMATS = formatOptions.map((o) => o.value)

export type ListingFilters = { format?: string; audience?: string; page: number }

/** Разбирает ?format=&audience=&page= — неизвестные значения игнорируются. */
export function parseFilters(sp: SearchParams): ListingFilters {
  const format = one(sp.format)
  const audience = one(sp.audience)
  const page = Math.max(1, Math.min(500, parseInt(one(sp.page), 10) || 1))
  return {
    format: FORMATS.includes(format) ? format : undefined,
    audience: AUDIENCES.includes(audience) ? audience : undefined,
    page,
  }
}

export function filtersToWhere(f: ListingFilters): Where[] {
  const and: Where[] = []
  if (f.format) and.push({ format: { equals: f.format } })
  if (f.audience) and.push({ audience: { contains: f.audience } })
  return and
}

export function filtersToQuery(f: Partial<ListingFilters>, page?: number) {
  const q = new URLSearchParams()
  if (f.format) q.set('format', f.format)
  if (f.audience) q.set('audience', f.audience)
  if (page && page > 1) q.set('page', String(page))
  const s = q.toString()
  return s ? `?${s}` : ''
}
