import Image from 'next/image'
import type { Media } from '@/payload-types'
import { mediaSrc } from '@/lib/urls'

type Props = {
  media: Media | number | null | undefined
  size?: 'thumb' | 'card' | 'wide'
  ratio?: '16/9' | '3/2'
  priority?: boolean
  sizes?: string
  className?: string
  placeholderLabel?: string
}

/** Обложка из медиатеки или нейтральная заглушка как в макетах. */
export function Cover({
  media,
  size = 'card',
  ratio = '16/9',
  priority,
  sizes,
  className,
  placeholderLabel,
}: Props) {
  const m = typeof media === 'object' ? media : null
  const variant = m?.sizes?.[size]
  const src = mediaSrc(variant?.url || m?.url)
  const style = { aspectRatio: ratio }
  if (!m || !src) {
    return (
      <div
        className={`cover cover--empty ${className ?? ''}`}
        style={style}
        aria-hidden={!placeholderLabel}
      />
    )
  }
  return (
    <div className={`cover ${className ?? ''}`} style={style}>
      <Image
        src={src}
        alt={m.alt || ''}
        fill
        priority={priority}
        sizes={sizes ?? '(max-width: 768px) 100vw, 760px'}
        style={{ objectFit: 'cover', objectPosition: `${m.focalX ?? 50}% ${m.focalY ?? 50}%` }}
      />
    </div>
  )
}
