import type { Metadata } from 'next'
import Link from 'next/link'
import { locales, prefixFromLocale } from '@/i18n/config'
import { formatDate, getDictionary, requireLocale } from '@/lib/dictionary'
import { listCorrections } from '@/lib/payload'
import { materialHref } from '@/lib/urls'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageShell } from '@/components/PageShell'
import type { Material } from '@/payload-types'

export const revalidate = 300

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = getDictionary(requireLocale(lang))
  return {
    title: dict.corrections,
    description: dict.correctionsIntro,
    alternates: {
      canonical: `/${lang}/corrections`,
      languages: Object.fromEntries(
        locales.map((l) => [l.hreflang, `/${l.urlPrefix}/corrections`]),
      ),
    },
  }
}

/** Публичный журнал исправлений (ТЗ, 5). */
export default async function CorrectionsPage({ params }: Props) {
  const { lang } = await params
  const locale = requireLocale(lang)
  const dict = getDictionary(locale)
  const { docs } = await listCorrections(locale)
  const p = prefixFromLocale(locale)
  return (
    <PageShell
      locale={locale}
      alternates={Object.fromEntries(locales.map((l) => [l.code, `/${l.urlPrefix}/corrections`]))}
    >
      <header className="page-head">
        <Breadcrumbs
          label={dict.home}
          items={[{ label: dict.home, href: `/${p}` }, { label: dict.corrections }]}
        />
        <h1 className="page-title">{dict.corrections}</h1>
        <p className="lead">{dict.correctionsIntro}</p>
      </header>
      {docs.length ? (
        <ol className="corrections">
          {docs
            .filter((c) => c.summary)
            .map((c) => {
              const m = typeof c.material === 'object' ? (c.material as Material) : null
              const href = m ? materialHref(m, locale) : null
              return (
                <li key={c.id} className="corrections__item">
                  <time dateTime={c.date}>{formatDate(c.date, locale)}</time>
                  <div>
                    {m && (
                      <div className="corrections__material">
                        {href ? <Link href={href}>{m.title}</Link> : m.title}
                      </div>
                    )}
                    <p>{c.summary}</p>
                    {c.details && <p className="muted">{c.details}</p>}
                  </div>
                </li>
              )
            })}
        </ol>
      ) : (
        <p className="muted">{dict.noCorrections}</p>
      )}
    </PageShell>
  )
}
