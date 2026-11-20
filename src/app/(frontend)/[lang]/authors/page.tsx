import type { Metadata } from 'next'
import Link from 'next/link'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { listAuthors } from '@/lib/payload'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageShell } from '@/components/PageShell'
import type { Media } from '@/payload-types'

export const revalidate = 300

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = getDictionary(requireLocale(lang))
  return {
    title: dict.team,
    alternates: {
      canonical: `/${lang}/authors`,
      languages: Object.fromEntries(locales.map((l) => [l.hreflang, `/${l.urlPrefix}/authors`])),
    },
  }
}

export default async function AuthorsPage({ params }: Props) {
  const { lang } = await params
  const locale = requireLocale(lang)
  const dict = getDictionary(locale)
  const authors = await listAuthors(locale)
  const p = prefixFromLocale(locale)
  return (
    <PageShell
      locale={locale}
      alternates={Object.fromEntries(locales.map((l) => [l.code, `/${l.urlPrefix}/authors`]))}
    >
      <header className="page-head">
        <Breadcrumbs
          label={dict.home}
          items={[{ label: dict.home, href: `/${p}` }, { label: dict.team }]}
        />
        <h1 className="page-title">{dict.team}</h1>
      </header>
      <ul className="people">
        {authors
          .filter((a) => a.name)
          .map((a) => {
            const photo = typeof a.photo === 'object' ? (a.photo as Media) : null
            return (
              <li key={a.id} className="person">
                {photo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- аватар
                  <img
                    src={photo.sizes?.thumb?.url || photo.url}
                    alt=""
                    className="avatar avatar--lg"
                    width={72}
                    height={72}
                  />
                ) : (
                  <span className="avatar avatar--lg avatar--empty" aria-hidden="true" />
                )}
                <div>
                  <Link href={`/${p}/authors/${a.slug}`} className="person__name">
                    {a.name}
                  </Link>
                  {a.position && <p className="muted">{a.position}</p>}
                </div>
              </li>
            )
          })}
      </ul>
    </PageShell>
  )
}
