import { prefixFromLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { getSections } from '@/lib/payload'
import { SubscribeForm } from './SubscribeForm'

/** Блоки подписки из макетов: светлая полоса на главной и тёмная карточка в сайдбаре материала. */
export async function Subscribe({
  locale,
  variant,
}: {
  locale: Locale
  variant: 'band' | 'sidebar'
}) {
  const dict = getDictionary(locale)
  const sections = variant === 'band' ? await getSections(locale) : []
  const form = (
    <SubscribeForm
      locale={locale}
      variant={variant}
      privacyHref={`/${prefixFromLocale(locale)}/privacy`}
      strings={{
        email: dict.email,
        subscribe: dict.subscribe,
        consent: dict.consent,
        privacyPolicy: dict.privacyPolicy,
        interests: dict.interests,
      }}
      sections={sections.map((s) => ({ slug: s.slug!, title: s.navTitle || s.title }))}
    />
  )
  if (variant === 'sidebar') {
    return (
      <section className="subscribe-side" id="subscribe" aria-labelledby="subscribe-side-title">
        <h2 id="subscribe-side-title">{dict.digestTitle}</h2>
        <p>{dict.digestShort}</p>
        {form}
      </section>
    )
  }
  return (
    <section className="subscribe-band" id="subscribe" aria-labelledby="subscribe-band-title">
      <div className="subscribe-band__text">
        <h2 id="subscribe-band-title">{dict.digestTitle}</h2>
        <p>{dict.digestText}</p>
      </div>
      {form}
    </section>
  )
}
