import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireLocale } from '@/lib/dictionary'
import { AUDIENCES } from '@/lib/filters'
import { HomeView } from '@/components/templates/HomeView'
import { audienceOptions } from '@/collections/Materials/options'

export const revalidate = 60

/**
 * Пустой список: при сборке ничего не пререндерим (базе не нужно быть доступной),
 * страницы рендерятся при первом запросе и кэшируются (ISR, revalidate выше).
 */
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ lang: string; audience: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, audience } = await params
  const locale = requireLocale(lang)
  const label = audienceOptions.find((o) => o.value === audience)?.label[locale]
  // Отфильтрованная главная не конкурирует с основной в поиске
  return {
    title: label,
    robots: { index: false, follow: true },
    alternates: { canonical: `/${lang}` },
  }
}

/** Главная, отфильтрованная по аудитории: /ua/for/diaspora */
export default async function HomeForAudience({ params }: Props) {
  const { lang, audience } = await params
  if (!AUDIENCES.includes(audience)) notFound()
  return <HomeView locale={requireLocale(lang)} audience={audience} />
}
