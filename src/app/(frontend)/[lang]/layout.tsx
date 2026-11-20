import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { locales, localeFromPrefix } from '@/i18n/config'
import { siteUrl } from '@/lib/urls'
import '../styles.css'

// Шрифты скачиваются при сборке и раздаются с нашего домена (без запросов к Google у читателя)
const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' })
const serif = Source_Serif_4({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: '[НАЗВА]', template: '%s — [НАЗВА]' },
}

// Страницы не пререндерятся при сборке (сборке не нужна база): рендер по первому запросу,
// дальше кэш ISR (revalidate на страницах) + CDN.
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
      <body>{children}</body>
    </html>
  )
}
