import type { Metadata } from 'next'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import type { SearchParams } from '@/lib/filters'
import { getSections, searchMaterials } from '@/lib/payload'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'
import { Pagination } from '@/components/Pagination'

// Динамическая страница: поиск зависит от ?q= — не кэшируется (ISR только у главной, материалов и служебных страниц).
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<SearchParams> }

const one = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? '').trim()
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: getDictionary(requireLocale(lang)).searchTitle,
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { lang } = await params
  const locale = requireLocale(lang)
  const dict = getDictionary(locale)
  const sp = await searchParams
  const q = one(sp.q).slice(0, 120)
  const sectionSlug = one(sp.section)
  const from = isDate(one(sp.from)) ? one(sp.from) : ''
  const to = isDate(one(sp.to)) ? one(sp.to) : ''
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1)
  const sections = await getSections(locale)
  const section = sections.find((s) => s.slug === sectionSlug)
  const results = q
    ? await searchMaterials(locale, q, { section: section?.id, from, to }, page)
    : null
  const base = `/${prefixFromLocale(locale)}/search`
  const query = (n: number) => {
    const s = new URLSearchParams({ q })
    if (section) s.set('section', section.slug!)
    if (from) s.set('from', from)
    if (to) s.set('to', to)
    if (n > 1) s.set('page', String(n))
    return `${base}?${s}`
  }

  return (
    <PageShell
      locale={locale}
      alternates={Object.fromEntries(locales.map((l) => [l.code, `/${l.urlPrefix}/search`]))}
    >
      <header className="page-head">
        <h1 className="page-title">{dict.searchTitle}</h1>
      </header>
      <form method="get" action={base} role="search" className="search-form">
        <label className="field field--grow">
          <span className="visually-hidden">{dict.searchTitle}</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={dict.searchPlaceholder}
            className="input input--lg"
            autoFocus={!q}
          />
        </label>
        <label className="field">
          <span>{dict.searchSection}</span>
          <select name="section" defaultValue={section?.slug ?? ''} className="input">
            <option value="">{dict.all}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.slug!}>
                {s.navTitle || s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{dict.dateFrom}</span>
          <input type="date" name="from" defaultValue={from} className="input" />
        </label>
        <label className="field">
          <span>{dict.dateTo}</span>
          <input type="date" name="to" defaultValue={to} className="input" />
        </label>
        <button type="submit" className="btn btn--accent btn--form">
          {dict.search}
        </button>
      </form>
      {results && (
        <section aria-live="polite" className="listing">
          <p className="muted">{dict.found(results.totalDocs)}</p>
          {results.docs.length ? (
            <div className="listing__items">
              {results.docs.map((m) => (
                <MaterialCard key={m.id} material={m} locale={locale} variant="row" />
              ))}
            </div>
          ) : (
            <p>{dict.nothingFound}</p>
          )}
          <Pagination
            page={results.page ?? 1}
            totalPages={results.totalPages}
            dict={dict}
            hrefFor={query}
          />
        </section>
      )}
    </PageShell>
  )
}
