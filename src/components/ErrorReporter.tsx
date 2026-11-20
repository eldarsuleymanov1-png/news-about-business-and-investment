'use client'

import { useCallback, useEffect, useId, useRef, useState, useTransition } from 'react'
import { reportError } from '@/actions/errorReport'
import { Turnstile } from './Turnstile'

export type ErrorReporterStrings = {
  button: string
  hint: string
  title: string
  selected: string
  comment: string
  commentHint: string
  email: string
  send: string
  cancel: string
  thanks: string
  errText: string
  errCaptcha: string
  errServer: string
}

/**
 * «Повідомити про помилку»: выделить текст в материале → Ctrl+Enter (⌘+Enter), или кнопка в конце.
 * Нативный <dialog> — фокус и Esc работают без доп. кода.
 */
export function ErrorReporter({
  materialId,
  locale,
  strings: t,
  scopeSelector = '.article, .check-page',
}: {
  materialId: number
  locale: string
  strings: ErrorReporterStrings
  scopeSelector?: string
}) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'sent' | ErrorReporterStrings[keyof ErrorReporterStrings]
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [captchaReset, setCaptchaReset] = useState(0)
  const [pending, startTransition] = useTransition()

  const open = useCallback(() => {
    const sel = window.getSelection()
    let text = ''
    if (sel && sel.rangeCount && !sel.isCollapsed) {
      const node = sel.getRangeAt(0).commonAncestorContainer
      const el = node instanceof Element ? node : node.parentElement
      if (el?.closest(scopeSelector)) text = sel.toString().trim().slice(0, 1000)
    }
    setSelected(text)
    setError(null)
    setStatus('idle')
    dialogRef.current?.showModal()
  }, [scopeSelector])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !dialogRef.current?.open) {
        const target = e.target as HTMLElement | null
        if (target?.closest('input, textarea, [contenteditable="true"]')) return
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('materialId', String(materialId))
    fd.set('pageUrl', window.location.pathname)
    startTransition(async () => {
      const res = await reportError(fd)
      if (res.ok) {
        setStatus('sent')
        return
      }
      setError(
        res.error === 'text' ? t.errText : res.error === 'captcha' ? t.errCaptcha : t.errServer,
      )
      setCaptchaReset((n) => n + 1)
    })
  }

  return (
    <>
      <div className="report-error">
        <button type="button" className="btn btn--outline" onClick={open}>
          {t.button}
        </button>
        <span className="muted">{t.hint}</span>
      </div>
      <dialog ref={dialogRef} className="dialog" aria-labelledby={`${id}-title`}>
        {status === 'sent' ? (
          <div className="dialog__body">
            <p role="status" className="form-done">
              {t.thanks}
            </p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => dialogRef.current?.close()}
            >
              OK
            </button>
          </div>
        ) : (
          <form className="dialog__body" onSubmit={onSubmit} noValidate>
            <h2 id={`${id}-title`} className="dialog__title">
              {t.title}
            </h2>
            <div className="visually-hidden" aria-hidden="true">
              <label>
                Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="field">
              <span>{t.selected}</span>
              <textarea
                name="selectedText"
                rows={3}
                maxLength={1000}
                className="input input--area input--quote"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{t.comment}</span>
              <textarea name="comment" rows={3} maxLength={2000} className="input input--area" />
              <span className="field__hint">{t.commentHint}</span>
            </label>
            <label className="field">
              <span>{t.email}</span>
              <input name="email" type="email" autoComplete="email" className="input" />
            </label>
            <Turnstile locale={locale} resetKey={captchaReset} />
            {error && (
              <p className="field__error" role="alert">
                {error}
              </p>
            )}
            <div className="form__actions">
              <button type="submit" className="btn btn--accent btn--form" disabled={pending}>
                {t.send}
              </button>
              <button
                type="button"
                className="btn btn--outline btn--form"
                onClick={() => dialogRef.current?.close()}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
