'use client'

import { useState } from 'react'
import { FacebookIcon, LinkIcon, LinkedInIcon, TelegramIcon } from './Icons'

type Props = {
  url: string
  title: string
  labels: { telegram: string; linkedin: string; facebook: string; copy: string; copied: string }
}

/** Кнопки «поделиться» — обычные ссылки, без сторонних скриптов и трекеров. */
export function ShareButtons({ url, title, labels }: Props) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* буфер обмена недоступен — ничего не делаем */
    }
  }
  return (
    <div className="share">
      <a
        className="icon-btn"
        href={`https://t.me/share/url?url=${u}&text=${t}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.telegram}
      >
        <TelegramIcon />
      </a>
      <a
        className="icon-btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.linkedin}
      >
        <LinkedInIcon />
      </a>
      <a
        className="icon-btn"
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.facebook}
      >
        <FacebookIcon />
      </a>
      <button type="button" className="icon-btn" onClick={copy} aria-label={labels.copy}>
        <LinkIcon />
      </button>
      <span className="share__status" role="status">
        {copied ? labels.copied : ''}
      </span>
    </div>
  )
}
