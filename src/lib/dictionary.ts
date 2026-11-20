import { notFound } from 'next/navigation'
import { localeFromPrefix, type Locale } from '@/i18n/config'

/** Строки интерфейса сайта. Тексты материалов живут в CMS. */
const dict = {
  uk: {
    tagline: 'Інвестиції та бізнес. Перевіряємо, перш ніж радити.',
    subscribe: 'Підписатися',
    search: 'Пошук',
    sections: 'Розділи',
    latestNews: 'Останні новини',
    latestChecks: 'Останні перевірки',
    allNews: 'Усі новини →',
    published: 'Опубліковано',
    updated: 'Оновлено',
    sources: 'Джерела',
    related: 'Повʼязані матеріали',
    verdict: 'Вердикт',
    verdictHistory: 'Історія вердикту',
    advertising: 'Реклама',
    partner: 'Партнерський матеріал',
    sponsor: 'Замовник',
    investorTakeaway: 'Що це означає для інвестора',
    tldr: 'Коротко',
    verifiedAt: 'Перевірено на',
    noMaterials: 'Тут поки немає матеріалів.',
    notFound: 'Сторінку не знайдено',
    footerNote: 'Сайт не надає інвестиційних рекомендацій.',
  },
  en: {
    tagline: 'Investing and business. We check before we advise.',
    subscribe: 'Subscribe',
    search: 'Search',
    sections: 'Sections',
    latestNews: 'Latest news',
    latestChecks: 'Latest checks',
    allNews: 'All news →',
    published: 'Published',
    updated: 'Updated',
    sources: 'Sources',
    related: 'Related',
    verdict: 'Verdict',
    verdictHistory: 'Verdict history',
    advertising: 'Advertising',
    partner: 'Partner content',
    sponsor: 'Sponsor',
    investorTakeaway: 'What it means for investors',
    tldr: 'TL;DR',
    verifiedAt: 'Verified as of',
    noMaterials: 'No materials yet.',
    notFound: 'Page not found',
    footerNote: 'This site does not provide investment advice.',
  },
} satisfies Record<Locale, Record<string, string>>

export type Dictionary = (typeof dict)['uk']
export const getDictionary = (locale: Locale): Dictionary => dict[locale]

export function formatDate(iso: string | null | undefined, locale: Locale, withTime = false) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Kyiv',
  }).format(new Date(iso))
}

/** Язык из сегмента URL; для неизвестного префикса — 404. */
export function requireLocale(lang: string): Locale {
  const locale = localeFromPrefix(lang)
  if (!locale) notFound()
  return locale
}
