import Link from 'next/link'
import { locales, prefixFromLocale, type Locale } from '@/i18n/config'
import { formatLongDate, getDictionary } from '@/lib/dictionary'
import { getSections, getSiteSettings } from '@/lib/payload'
import { rubricHref, sectionHref } from '@/lib/urls'
import { SearchIcon, TelegramIcon } from './Icons'

type Props = {
  locale: Locale
  variant: 'full' | 'compact'
  /** Адреса этой же страницы на других языках; если перевода нет — ведём на главную языка */
  alternates?: Partial<Record<Locale, string>>
  activeSection?: string
}

function LangSwitch({
  locale,
  alternates,
}: {
  locale: Locale
  alternates: Partial<Record<Locale, string>>
}) {
  return (
    <nav aria-label="Мова / Language" className="lang-switch">
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
            lang={l.hreflang}
          >
            {l.urlPrefix.toUpperCase()}
          </Link>
        ),
      )}
    </nav>
  )
}

export async function SiteHeader({ locale, variant, alternates = {}, activeSection }: Props) {
  const dict = getDictionary(locale)
  const [sections, settings] = await Promise.all([getSections(locale), getSiteSettings(locale)])
  const home = `/${prefixFromLocale(locale)}`
  const siteName = settings.siteName || 'EL Investments'

  if (variant === 'compact') {
    return (
      <header className="masthead masthead--compact">
        <div className="container masthead--compact__inner">
          <Link href={home} className="logo logo--compact">
            {siteName}
          </Link>
          <nav aria-label={dict.sections} className="compact-nav">
            {sections.map((s) => (
              <Link
                key={s.id}
                href={sectionHref(s.slug!, locale)}
                aria-current={activeSection === s.slug ? 'true' : undefined}
              >
                {s.navTitle || s.title}
              </Link>
            ))}
          </nav>
          <div className="masthead__actions">
            <LangSwitch locale={locale} alternates={alternates} />
            <Link
              href={`${home}/search`}
              className="icon-btn icon-btn--sm"
              aria-label={dict.search}
            >
              <SearchIcon />
            </Link>
            <a href="#subscribe" className="btn btn--accent btn--sm">
              {dict.subscribe}
            </a>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span>{formatLongDate(new Date(), locale)}</span>
          <div className="topbar__right">
            {settings.social?.telegram && (
              <a
                href={settings.social.telegram}
                className="topbar__tg"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TelegramIcon size={16} /> Telegram
              </a>
            )}
            <LangSwitch locale={locale} alternates={alternates} />
          </div>
        </div>
      </div>
      <header className="masthead">
        <div className="container masthead__inner">
          <div className="masthead__row">
            <Link href={home} className="logo">
              <span className="logo__name">{siteName}</span>
              {settings.tagline && <span className="logo__tagline">{settings.tagline}</span>}
            </Link>
            <div className="masthead__actions">
              <Link href={`${home}/search`} className="icon-btn" aria-label={dict.search}>
                <SearchIcon />
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
                aria-current={activeSection === s.slug ? 'true' : undefined}
              >
                {s.title}
              </Link>
            ))}
            <Link href={rubricHref('news', 'digest', locale)} className="section-nav__secondary">
              {dict.digestTitle}
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
