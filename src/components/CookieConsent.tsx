'use client'

import Script from 'next/script'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { logConsent } from '@/actions/consent'
import {
  CONSENT_COOKIE,
  CONSENT_POLICY_VERSION,
  parseConsent,
  type ConsentState,
} from '@/lib/consent'

export type ConsentStrings = {
  title: string
  text: string
  privacy: string
  acceptAll: string
  necessaryOnly: string
  customize: string
  save: string
  necessary: string
  necessaryDesc: string
  analytics: string
  analyticsDesc: string
}

export const OPEN_CONSENT_EVENT = 'el:open-consent'

const CONSENT_CHANGED_EVENT = 'el:consent-changed'

/** Значение cookie как внешнее хранилище: сервер — null, клиент — текущая строка cookie. */
const rawCookie = () =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1) ?? ''
const subscribeCookie = (cb: () => void) => {
  window.addEventListener(CONSENT_CHANGED_EVENT, cb)
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, cb)
}

const writeCookie = (c: ConsentState) => {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${180 * 86400}; Path=/; SameSite=Lax${secure}`
}

/** Удаляет cookies GA при отзыве согласия. */
const clearAnalyticsCookies = () => {
  for (const c of document.cookie.split('; ')) {
    const name = c.split('=')[0]
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      const domains = [
        '',
        `; Domain=${location.hostname}`,
        `; Domain=.${location.hostname.replace(/^www\./, '')}`,
      ]
      for (const d of domains) document.cookie = `${name}=; Max-Age=0; Path=/${d}`
    }
  }
}

/**
 * Cookie-баннер (ТЗ, 8–9): GA4 загружается ТОЛЬКО после согласия на аналитику.
 * Без NEXT_PUBLIC_GA_MEASUREMENT_ID необязательных cookies нет — баннер не показывается.
 */
export function CookieConsent({
  locale,
  strings: t,
  privacyHref,
}: {
  locale: string
  strings: ConsentStrings
  privacyHref: string
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  // null на сервере и до гидратации — баннер не рендерится в HTML (не ломает ISR)
  const raw = useSyncExternalStore(subscribeCookie, rawCookie, () => null)
  const consent = raw === null ? null : parseConsent(raw)
  const [reopened, setReopened] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analyticsChecked, setAnalyticsChecked] = useState<boolean | null>(null)
  const visible = raw !== null && (!consent || reopened)

  useEffect(() => {
    const reopen = () => {
      setCustom(true)
      setReopened(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [])

  const decide = useCallback(
    (analytics: boolean, action: 'accept-all' | 'necessary-only' | 'custom') => {
      const c: ConsentState = {
        id: consent?.id ?? crypto.randomUUID(),
        analytics,
        v: CONSENT_POLICY_VERSION,
        ts: Date.now(),
      }
      writeCookie(c)
      if (!analytics) {
        clearAnalyticsCookies()
        if (consent?.analytics) window.location.reload() // выгрузить уже загруженный gtag
      }
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT))
      setReopened(false)
      setCustom(false)
      void logConsent({ id: c.id, analytics, action, locale })
    },
    [consent, locale],
  )

  if (!gaId) return null

  return (
    <>
      {consent?.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {visible && (
        <section
          className="consent"
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
        >
          <div className="consent__inner">
            <div className="consent__text">
              <h2 id="consent-title">{t.title}</h2>
              <p>
                {t.text} <a href={privacyHref}>{t.privacy}</a>.
              </p>
            </div>
            {custom && (
              <fieldset className="consent__options">
                <label className="checkbox">
                  <input type="checkbox" checked disabled />
                  <span>
                    <strong>{t.necessary}</strong> — {t.necessaryDesc}
                  </span>
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={analyticsChecked ?? consent?.analytics ?? false}
                    onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  />
                  <span>
                    <strong>{t.analytics}</strong> — {t.analyticsDesc}
                  </span>
                </label>
              </fieldset>
            )}
            <div className="consent__actions">
              {custom ? (
                <button
                  type="button"
                  className="btn btn--accent"
                  onClick={() => decide(analyticsChecked ?? consent?.analytics ?? false, 'custom')}
                >
                  {t.save}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn--accent"
                    onClick={() => decide(true, 'accept-all')}
                  >
                    {t.acceptAll}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => decide(false, 'necessary-only')}
                  >
                    {t.necessaryOnly}
                  </button>
                  <button type="button" className="btn btn--link" onClick={() => setCustom(true)}>
                    {t.customize}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

/** Кнопка в подвале: заново открыть настройки (право отозвать согласие так же легко, как дать). */
export function CookieSettingsButton({ label }: { label: string }) {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null
  return (
    <button
      type="button"
      className="footer__link-btn"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      {label}
    </button>
  )
}
