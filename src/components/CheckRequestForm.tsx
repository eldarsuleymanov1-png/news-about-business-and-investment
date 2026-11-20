'use client'

import { useId, useRef, useState, useTransition } from 'react'
import {
  confirmCheckRequestFiles,
  submitCheckRequest,
  type CheckRequestErrors,
} from '@/actions/checkRequest'
import { Turnstile } from './Turnstile'
import { track } from '@/lib/analytics'

export type CheckRequestStrings = {
  projectName: string
  url: string
  urlHint: string
  description: string
  descriptionHint: string
  files: string
  filesHint: string
  email: string
  emailHint: string
  consent: string
  privacyPolicy: string
  submit: string
  sending: string
  /** Шаблон: «Завантажуємо файли: {done} з {total}» */
  uploading: string
  success: string
  successFilesFailed: string
  fileTooBig: string
  tooManyFiles: string
}

const MAX_BYTES = 10 * 1024 * 1024
const MAX_FILES = 5
const fill = (tpl: string, done: number, total: number) =>
  tpl.replace('{done}', String(done)).replace('{total}', String(total))

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.xls,.xlsx'

/** Загрузка одного файла: в R2 — подписанной POST-формой, локально — телом запроса. */
async function uploadFile(
  file: File,
  target: { mode: 's3' | 'local'; url: string; fields?: Record<string, string> },
) {
  if (target.mode === 's3') {
    const body = new FormData()
    for (const [k, v] of Object.entries(target.fields ?? {})) body.append(k, v)
    body.append('file', file)
    const res = await fetch(target.url, { method: 'POST', body })
    return res.ok
  }
  const res = await fetch(target.url, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  return res.ok
}

export function CheckRequestForm({
  locale,
  strings: t,
  privacyHref,
}: {
  locale: string
  strings: CheckRequestStrings
  privacyHref: string
}) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<CheckRequestErrors>({})
  const [progress, setProgress] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [captchaReset, setCaptchaReset] = useState(0)
  const [pending, startTransition] = useTransition()

  const onFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? [])
    const next: CheckRequestErrors = { ...errors, files: undefined }
    if (picked.length > MAX_FILES) next.files = t.tooManyFiles
    else if (picked.some((f) => f.size > MAX_BYTES)) next.files = t.fileTooBig
    setErrors(next)
    setFiles(next.files ? [] : picked)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.delete('attachments') // сами файлы не идут через server action (лимит Vercel)
    fd.set(
      'files',
      JSON.stringify(files.map((f) => ({ name: f.name, size: f.size, type: f.type }))),
    )
    startTransition(async () => {
      setProgress(t.sending)
      const result = await submitCheckRequest(fd)
      if (result.status === 'error') {
        setErrors(result.errors)
        setProgress(null)
        setCaptchaReset((n) => n + 1)
        return
      }
      track('generate_lead', { form: 'check_request', files: files.length })
      if (result.status === 'ok') {
        setDone(t.success)
        return
      }
      let uploaded = 0
      setProgress(fill(t.uploading, 0, result.uploads.length))
      for (const u of result.uploads) {
        const ok = await uploadFile(files[u.index], u.target).catch(() => false)
        if (ok) uploaded++
        setProgress(fill(t.uploading, uploaded, result.uploads.length))
      }
      const confirmed = await confirmCheckRequestFiles(result.confirmToken).catch(() => ({
        ok: false,
      }))
      setDone(confirmed.ok ? t.success : t.successFilesFailed)
    })
  }

  if (done) {
    return (
      <div className="form-done" role="status">
        <p>{done}</p>
      </div>
    )
  }

  const err = (k: keyof CheckRequestErrors) =>
    errors[k] ? (
      <span id={`${id}-${k}-err`} className="field__error" role="alert">
        {errors[k]}
      </span>
    ) : null
  const described = (k: keyof CheckRequestErrors, hint?: boolean) =>
    [hint ? `${id}-${k}-hint` : '', errors[k] ? `${id}-${k}-err` : ''].filter(Boolean).join(' ') ||
    undefined

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={(e) => {
        // Ошибка поля исчезает, как только его начинают править
        const name = (e.target as unknown as HTMLInputElement).name
        const key = (name === 'attachments' ? 'files' : name) as keyof CheckRequestErrors
        if (errors[key] && key !== 'files')
          setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
      }}
      className="form"
      noValidate
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="visually-hidden" aria-hidden="true">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="field">
        <span>{t.projectName} *</span>
        <input
          name="projectName"
          required
          maxLength={200}
          className="input"
          aria-invalid={!!errors.projectName}
          aria-describedby={described('projectName')}
        />
        {err('projectName')}
      </label>

      <label className="field">
        <span>{t.url}</span>
        <input
          name="url"
          type="url"
          inputMode="url"
          maxLength={500}
          placeholder="https://"
          className="input"
          aria-invalid={!!errors.url}
          aria-describedby={described('url', true)}
        />
        <span id={`${id}-url-hint`} className="field__hint">
          {t.urlHint}
        </span>
        {err('url')}
      </label>

      <label className="field">
        <span>{t.description} *</span>
        <textarea
          name="description"
          required
          rows={6}
          maxLength={5000}
          className="input input--area"
          aria-invalid={!!errors.description}
          aria-describedby={described('description', true)}
        />
        <span id={`${id}-description-hint`} className="field__hint">
          {t.descriptionHint}
        </span>
        {err('description')}
      </label>

      <label className="field">
        <span>{t.files}</span>
        <input
          name="attachments"
          type="file"
          multiple
          accept={ACCEPT}
          className="input input--file"
          onChange={(e) => onFiles(e.target.files)}
          aria-describedby={described('files', true)}
        />
        <span id={`${id}-files-hint`} className="field__hint">
          {t.filesHint}
        </span>
        {err('files')}
      </label>

      <label className="field">
        <span>{t.email} *</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input"
          aria-invalid={!!errors.email}
          aria-describedby={described('email', true)}
        />
        <span id={`${id}-email-hint`} className="field__hint">
          {t.emailHint}
        </span>
        {err('email')}
      </label>

      <label className="checkbox">
        <input type="checkbox" name="consent" required aria-describedby={described('consent')} />
        <span>
          {t.consent} <a href={privacyHref}>{t.privacyPolicy}</a>. *
        </span>
      </label>
      {err('consent')}

      <Turnstile locale={locale} resetKey={captchaReset} />
      {err('captcha')}
      {err('form')}

      <div className="form__actions">
        <button type="submit" className="btn btn--accent btn--form" disabled={pending}>
          {t.submit}
        </button>
        {progress && (
          <span className="muted" role="status">
            {progress}
          </span>
        )}
      </div>
    </form>
  )
}
