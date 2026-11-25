import Link from 'next/link'
import { prefixFromLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { getFooterPages, getSiteSettings } from '@/lib/payload'
import { CookieSettingsButton } from './CookieConsent'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const [pages, settings] = await Promise.all([getFooterPages(locale), getSiteSettings(locale)])
  const p = `/${prefixFromLocale(locale)}`
  const link = (slug: string, title: string) => (
    <Link key={slug} href={`${p}/${slug}`}>
      {title}
    </Link>
  )
  const about = pages.filter((x) => x.footerGroup === 'about')
  const partners = pages.filter((x) => x.footerGroup === 'partners')
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__name">
            <span className="logo__mark" aria-hidden="true">
              {settings.shortName || 'IV'}
            </span>
            {settings.siteName || 'Invest Venture'}
          </span>
          <span>{dict.footerDisclaimer}</span>
          {settings.publisher?.mediaRegistration && (
            <span>{settings.publisher.mediaRegistration}</span>
          )}
          <span>
            © {year} {settings.siteName || 'Invest Venture'}
          </span>
        </div>
        <nav aria-label={dict.footerAbout} className="footer__col">
          {about.slice(0, 1).map((x) => link(x.slug!, x.title))}
          <Link href={`${p}/authors`}>{dict.team}</Link>
          {about.slice(1).map((x) => link(x.slug!, x.title))}
          <Link href={`${p}/corrections`}>{dict.corrections}</Link>
        </nav>
        <nav aria-label={dict.footerPartners} className="footer__col">
          {partners.map((x) => link(x.slug!, x.title))}
          {settings.social?.telegram && <a href={settings.social.telegram}>Telegram</a>}
          <CookieSettingsButton label={dict.cookies.settings} />
        </nav>
      </div>
    </footer>
  )
}
