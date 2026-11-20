import type { Metadata } from 'next'
import Link from 'next/link'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CheckRequestForm } from '@/components/CheckRequestForm'
import { PageShell } from '@/components/PageShell'

export const revalidate = 3600

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = getDictionary(requireLocale(lang))
  return {
    title: dict.checkRequest.title,
    description: dict.checkRequest.intro,
    alternates: {
      canonical: `/${lang}/check-request`,
      languages: Object.fromEntries(
        locales.map((l) => [l.hreflang, `/${l.urlPrefix}/check-request`]),
      ),
    },
  }
}

/** Форма «Перевірте проєкт» (ТЗ, 5). */
export default async function CheckRequestPage({ params }: Props) {
  const { lang } = await params
  const locale = requireLocale(lang)
  const dict = getDictionary(locale)
  const t = dict.checkRequest
  const p = `/${prefixFromLocale(locale)}`
  return (
    <PageShell
      locale={locale}
      activeSection="checks"
      alternates={Object.fromEntries(locales.map((l) => [l.code, `/${l.urlPrefix}/check-request`]))}
    >
      <div className="form-page">
        <header className="page-head">
          <Breadcrumbs
            label={dict.home}
            items={[
              { label: dict.home, href: p },
              { label: dict.checks, href: `${p}/checks` },
              { label: t.title },
            ]}
          />
          <h1 className="page-title">{t.title}</h1>
          <p className="lead">{t.intro}</p>
          <Link href={`${p}/methodology`} className="more-link">
            {t.howWeCheck} →
          </Link>
        </header>
        <CheckRequestForm
          locale={locale}
          privacyHref={`${p}/privacy`}
          strings={{
            projectName: t.projectName,
            url: t.url,
            urlHint: t.urlHint,
            description: t.description,
            descriptionHint: t.descriptionHint,
            files: t.files,
            filesHint: t.filesHint,
            email: t.email,
            emailHint: t.emailHint,
            consent: t.consent,
            privacyPolicy: t.privacyPolicy,
            submit: t.submit,
            sending: t.sending,
            uploading: t.uploading,
            success: t.success,
            successFilesFailed: t.successFilesFailed,
            fileTooBig: t.fileTooBig,
            tooManyFiles: t.tooManyFiles,
          }}
        />
      </div>
    </PageShell>
  )
}
