'use client'

import { useActionState, useId } from 'react'
import { subscribe, type SubscribeState } from '@/actions/subscribe'
import type { Locale } from '@/i18n/config'

type Strings = {
  email: string
  subscribe: string
  consent: string
  privacyPolicy: string
  interests: string
}

type Props = {
  locale: Locale
  strings: Strings
  privacyHref: string
  variant: 'band' | 'sidebar'
  /** Разделы для выбора интересов (только в большой форме) */
  sections?: { slug: string; title: string }[]
}

/**
 * Подписка на дайджест: email + обязательное согласие + интересы. Отправка — серверным действием в Beehiiv
 * (double opt-in). Без JavaScript форма тоже работает.
 */
export function SubscribeForm({ locale, strings, privacyHref, variant, sections = [] }: Props) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, {
    status: 'idle',
  })
  const id = useId()

  if (state.status === 'ok') {
    return (
      <p className={`subscribe-form__done subscribe-form__done--${variant}`} role="status">
        {state.message}
      </p>
    )
  }

  return (
    <form action={action} className={`subscribe-form subscribe-form--${variant}`} noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* Ловушка для ботов */}
      <div className="visually-hidden" aria-hidden="true">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor={`${id}-email`} className="subscribe-form__label">
        {strings.email}
      </label>
      <div className="subscribe-form__row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          defaultValue={state.values?.email}
          className="input"
          aria-invalid={state.status === 'error' || undefined}
          aria-describedby={state.status === 'error' ? `${id}-err` : undefined}
        />
        <button type="submit" className="btn btn--accent btn--form" disabled={pending}>
          {strings.subscribe}
        </button>
      </div>
      {sections.length > 0 && (
        <fieldset className="subscribe-form__interests">
          <legend>{strings.interests}</legend>
          {sections.map((s) => (
            <label key={s.slug} className="checkbox">
              <input
                type="checkbox"
                name="interests"
                value={s.slug}
                defaultChecked={state.values?.interests.includes(s.slug)}
              />{' '}
              {s.title}
            </label>
          ))}
        </fieldset>
      )}
      <label className="checkbox subscribe-form__consent">
        <input type="checkbox" name="consent" required defaultChecked={state.values?.consent} />
        <span>
          {strings.consent} <a href={privacyHref}>{strings.privacyPolicy}</a>.
        </span>
      </label>
      {state.status === 'error' && (
        <p id={`${id}-err`} className="subscribe-form__error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  )
}
