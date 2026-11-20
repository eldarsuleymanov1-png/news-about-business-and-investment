import type { Metadata } from 'next'
import { locales } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { listMaterials } from '@/lib/payload'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'

export const revalidate = 60

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  return {
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}`])),
    },
  }
}

/**
 * Временная главная: последние новости и проверки.
 * Полная вёрстка по макету design/Main.dc.html и управление блоками из global «Головна» — следующий этап.
 */
export default async function Home({ params }: Params) {
  const { lang } = await params
  const locale = requireLocale(lang)
  const dict = getDictionary(locale)
  const [latest, checks] = await Promise.all([
    listMaterials(locale, { format: { not_equals: 'check' } }, 12),
    listMaterials(locale, { format: { equals: 'check' } }, 3),
  ])
  return (
    <PageShell locale={locale}>
      <section className="stack">
        <h2 className="section-title">{dict.latestNews}</h2>
        {latest.docs.length ? (
          <div className="grid">
            {latest.docs.map((m) => (
              <MaterialCard key={m.id} material={m} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="muted">{dict.noMaterials}</p>
        )}
      </section>
      {checks.docs.length > 0 && (
        <section className="stack band-dark">
          <h2 className="section-title">{dict.latestChecks}</h2>
          <div className="grid">
            {checks.docs.map((m) => (
              <MaterialCard key={m.id} material={m} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
