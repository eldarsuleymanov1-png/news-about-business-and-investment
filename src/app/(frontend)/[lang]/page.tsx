import type { Metadata } from 'next'
import { locales } from '@/i18n/config'
import { requireLocale } from '@/lib/dictionary'
import { getSiteSettings } from '@/lib/payload'
import { HomeView } from '@/components/templates/HomeView'

export const revalidate = 60

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const locale = requireLocale(lang)
  const settings = await getSiteSettings(locale)
  return {
    title: { absolute: [settings.siteName, settings.tagline].filter(Boolean).join(' — ') },
    description: settings.tagline ?? undefined,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}`])),
    },
  }
}

export default async function Home({ params }: Props) {
  const { lang } = await params
  return <HomeView locale={requireLocale(lang)} />
}
