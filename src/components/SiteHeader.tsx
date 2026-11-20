import Link from 'next/link'
import { locales, prefixFromLocale, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/lib/dictionary'
import type { Section } from '@/payload-types'
import { sectionHref } from '@/lib/urls'

type Props = {
  locale: Locale
  dict: Dictionary
  sections: Section[]
  /** Адреса этой же страницы на других языках; если перевода нет — ведём на главную языка */
  alternates?: Partial<Record<Locale, string>>
  activeSection?: string
}

export function SiteHeader({ locale, dict, sections, alternates = {}, activeSection }: Props) {
  const home = `/${prefixFromLocale(locale)}`
  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span>{dict.tagline}</span>
          <nav aria-label="Language" className="lang-switch">
            {locales.map((l) =>
              l.code === locale ? (
                <strong key={l.code} aria-current="true">
                  {l.urlPrefix.toUpperCase()}
                </strong>
              ) : (
                <Link
                  key={l.code}
                  href={alternates[l.code] ?? `/${l.urlPrefix}`}
                  hrefLang={l.hreflang}
                >
                  {l.urlPrefix.toUpperCase()}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
      <header className="masthead">
        <div className="container masthead__inner">
          <div className="masthead__row">
            <Link href={home} className="logo">
              <span className="logo__name">[НАЗВА]</span>
            </Link>
            <div className="masthead__actions">
              <Link href={`${home}/search`} className="icon-btn" aria-label={dict.search}>
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </Link>
              <a href="#subscribe" className="btn btn--accent">
                {dict.subscribe}
              </a>
            </div>
          </div>
          <nav aria-label={dict.sections} className="section-nav">
            {sections.map((s) => (
              <Link
                key={s.id}
                href={sectionHref(s.slug!, locale)}
                aria-current={activeSection === s.slug ? 'page' : undefined}
              >
                {s.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
