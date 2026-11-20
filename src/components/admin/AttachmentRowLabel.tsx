'use client'

import { useRowLabel } from '@payloadcms/ui'

type Row = { name?: string; key?: string; size?: number; uploaded?: boolean }

/** Подпись строки вложения в админке: имя, размер и ссылка на скачивание (только для сотрудников). */
export function AttachmentRowLabel() {
  const { data } = useRowLabel<Row>()
  if (!data?.key) return <span>{data?.name ?? '—'}</span>
  const size = data.size ? ` · ${(data.size / 1024 / 1024).toFixed(1)} МБ` : ''
  if (!data.uploaded) return <span>{`${data.name}${size} · не завантажено`}</span>
  return (
    <a
      href={`/api/private-files/${data.key.split('/').map(encodeURIComponent).join('/')}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {`${data.name}${size} ↓`}
    </a>
  )
}
