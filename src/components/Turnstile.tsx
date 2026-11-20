'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id: string) => void
    }
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Cloudflare Turnstile — «невидимая капча». Токен попадает в скрытое поле cf-turnstile-response формы.
 * Без NEXT_PUBLIC_TURNSTILE_SITE_KEY не рендерится (в разработке сервер проверку пропускает).
 * resetKey — изменить, чтобы получить новый токен (токен одноразовый).
 */
export function Turnstile({ locale, resetKey }: { locale: string; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    let cancelled = false
    const render = () => {
      if (cancelled || !ref.current || !window.turnstile || idRef.current) return
      idRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        language: locale === 'en' ? 'en' : 'uk',
        appearance: 'interaction-only',
      })
    }
    if (window.turnstile) render()
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
      if (!s) {
        s = document.createElement('script')
        s.src = SCRIPT
        s.async = true
        document.head.appendChild(s)
      }
      s.addEventListener('load', render)
    }
    return () => {
      cancelled = true
      if (idRef.current && window.turnstile) window.turnstile.remove(idRef.current)
      idRef.current = null
    }
  }, [siteKey, locale])

  useEffect(() => {
    if (resetKey && idRef.current && window.turnstile) window.turnstile.reset(idRef.current)
  }, [resetKey])

  if (!siteKey) return null
  return <div ref={ref} className="turnstile" />
}
