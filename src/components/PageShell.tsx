import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/config'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  children: ReactNode
  header?: 'full' | 'compact'
  alternates?: Partial<Record<Locale, string>>
  activeSection?: string
  mainClassName?: string
}

export function PageShell({
  locale,
  children,
  header = 'compact',
  alternates,
  activeSection,
  mainClassName,
}: Props) {
  return (
    <>
      <a href="#main" className="skip-link">
        {locale === 'uk' ? 'Перейти до змісту' : 'Skip to content'}
      </a>
      <SiteHeader
        locale={locale}
        variant={header}
        alternates={alternates}
        activeSection={activeSection}
      />
      <main id="main" className={`container page ${mainClassName ?? ''}`}>
        {children}
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
