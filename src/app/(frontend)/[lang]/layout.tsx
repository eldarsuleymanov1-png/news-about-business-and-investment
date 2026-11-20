import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { locales, localeFromPrefix } from '@/i18n/config'
import { siteUrl } from '@/lib/urls'
import { getDictionary } from '@/lib/dictionary'
import { CookieConsent } from '@/components/CookieConsent'
import '../styles.css'

// Шрифты скачиваются при сборке и раздаются с нашего домена (без запросов к Google у читателя)
const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' })
const serif = Source_Serif_4({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'EL Investments', template: '%s — EL Investments' },
  applicationName: 'EL Investments',
}

/**
 * Пустой список: при сборке ничего не пререндерим (базе не нужно быть доступной),
 * страницы рендерятся при первом запросе и дальше берутся из кэша ISR (revalidate на страницах).
 * Без generateStaticParams Next считает сегмент [lang] полностью динамическим.
 */
export function generateStaticParams() {
  return []
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = localeFromPrefix(lang)
  if (!locale) notFound()
  const hreflang = locales.find((l) => l.code === locale)!.hreflang
  return (
    <html lang={hreflang} className={`${inter.variable} ${serif.variable}`}>
      <body>
        <link rel="alternate" type="application/rss+xml" title="RSS" href={`/${lang}/rss.xml`} />
        {children}
        <CookieConsent
          locale={locale}
          privacyHref={`/${lang}/privacy`}
          strings={(({ settings: _s, ...rest }) => rest)(getDictionary(locale).cookies)}
        />
      </body>
    </html>
  )
}
