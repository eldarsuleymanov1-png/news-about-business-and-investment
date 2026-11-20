import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { getSections } from '@/lib/payload'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  children: ReactNode
  alternates?: Partial<Record<Locale, string>>
  activeSection?: string
}

export async function PageShell({ locale, children, alternates, activeSection }: Props) {
  const dict = getDictionary(locale)
  const sections = await getSections(locale)
  return (
    <>
      <SiteHeader
        locale={locale}
        dict={dict}
        sections={sections}
        alternates={alternates}
        activeSection={activeSection}
      />
      <main className="container page">{children}</main>
      <SiteFooter dict={dict} />
    </>
  )
}
