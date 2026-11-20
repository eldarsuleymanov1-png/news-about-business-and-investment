/**
 * Языковые версии сайта.
 *
 * В URL используется префикс `/ua/` (так решил владелец), а в Payload и hreflang —
 * ISO-код `uk`. Здесь живёт единственное соответствие между ними.
 */
export const locales = [
  { urlPrefix: 'ua', code: 'uk', hreflang: 'uk', label: 'Українська' },
  { urlPrefix: 'en', code: 'en', hreflang: 'en', label: 'English' },
] as const

export type Locale = (typeof locales)[number]['code']
export type UrlPrefix = (typeof locales)[number]['urlPrefix']

export const defaultLocale: Locale = 'uk'
export const defaultUrlPrefix: UrlPrefix = 'ua'

export const urlPrefixes = locales.map((l) => l.urlPrefix) as UrlPrefix[]

export function localeFromPrefix(prefix: string): Locale | null {
  return locales.find((l) => l.urlPrefix === prefix)?.code ?? null
}

export function prefixFromLocale(locale: Locale): UrlPrefix {
  return locales.find((l) => l.code === locale)!.urlPrefix
}

/** Подпись поля в админке на двух языках интерфейса. */
export const t = (uk: string, en: string) => ({ uk, en })
