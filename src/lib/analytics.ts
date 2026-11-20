'use client'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Событие в GA4. Если аналитика не загружена (нет согласия) — ничего не делает. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function')
    window.gtag('event', event, params)
}
