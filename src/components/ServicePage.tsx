import type { Locale } from '@/i18n/config'
import { formatDate, getDictionary } from '@/lib/dictionary'
import type { Page } from '@/payload-types'
import { Breadcrumbs } from './Breadcrumbs'
import { PageShell } from './PageShell'
import { RichText } from './RichText'
import { prefixFromLocale } from '@/i18n/config'

export function ServicePage({
  page,
  locale,
  alternates,
}: {
  page: Page
  locale: Locale
  alternates: Partial<Record<Locale, string>>
}) {
  const dict = getDictionary(locale)
  return (
    <PageShell locale={locale} alternates={alternates}>
      <article className="article article--page">
        <Breadcrumbs
          label={dict.home}
          items={[
            { label: dict.home, href: `/${prefixFromLocale(locale)}` },
            { label: page.title },
          ]}
        />
        <h1 className="page-title">{page.title}</h1>
        {page.lead && <p className="lead">{page.lead}</p>}
        {page.reviewedAt && (
          <p className="muted">
            {dict.updated}: {formatDate(page.reviewedAt, locale)}
          </p>
        )}
        <RichText data={page.content} />
      </article>
    </PageShell>
  )
}
