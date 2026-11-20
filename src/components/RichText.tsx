import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Image from 'next/image'
import { headingId, nodeText } from '@/lib/content'
import { mediaSrc } from '@/lib/urls'
import type { Media } from '@/payload-types'

/* eslint-disable @typescript-eslint/no-explicit-any -- узлы Lexical приходят нетипизированными */
type BlockNode = { node: { fields: Record<string, any> } }

const embedSrc = (url: string): string | null => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const tg = url.match(/^https:\/\/t\.me\/([\w]+\/\d+)/)
  if (tg) return `https://t.me/${tg[1]}?embed=1`
  return null
}

const makeConverters =
  (creditLabel: string): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    // Якоря у заголовков — для оглавления
    heading: ({ node, nodesToJSX }: any) => {
      const Tag = (['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2') as 'h2'
      return <Tag id={headingId(nodeText(node).trim())}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    // Фото в тексте: подпись и источник обязательны (ТЗ, 9)
    upload: ({ node }: any) => {
      const doc = node.value as Media | number
      if (typeof doc !== 'object' || !doc?.url) return null
      if (!doc.mimeType?.startsWith('image')) {
        return (
          <a href={doc.url} rel="noopener noreferrer">
            {doc.filename}
          </a>
        )
      }
      const src = mediaSrc(doc.sizes?.wide?.url || doc.url)!
      return (
        <figure className="figure">
          <Image
            src={src}
            alt={doc.alt || ''}
            width={doc.width ?? 1600}
            height={doc.height ?? 900}
            sizes="(max-width: 768px) 100vw, 760px"
          />
          <figcaption>
            {doc.caption}
            {doc.credit && (
              <span className="figure__credit">
                {' '}
                {creditLabel} {doc.credit}
              </span>
            )}
          </figcaption>
        </figure>
      )
    },
    blocks: {
      callout: ({ node }: BlockNode) => (
        <aside className={`callout callout--${node.fields.tone}`}>
          {node.fields.title && <h2 className="callout__title">{node.fields.title}</h2>}
          <p>{node.fields.text}</p>
        </aside>
      ),
      embed: ({ node }: BlockNode) => {
        const src = embedSrc(node.fields.url)
        return (
          <figure className="embed">
            {src ? (
              <iframe
                src={src}
                title={node.fields.caption || node.fields.url}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <a
                href={node.fields.url}
                rel="noopener noreferrer"
                target="_blank"
                className="embed__link"
              >
                {node.fields.url}
              </a>
            )}
            {node.fields.caption && <figcaption>{node.fields.caption}</figcaption>}
          </figure>
        )
      },
      chart: ({ node }: BlockNode) => {
        const points: { label: string; value: number }[] = node.fields.points ?? []
        const max = Math.max(...points.map((p) => Math.abs(p.value)), 1)
        return (
          <figure className="chart">
            <figcaption className="chart__title">{node.fields.title}</figcaption>
            <div className="chart__bars" role="table" aria-label={node.fields.title}>
              {points.map((p, i) => (
                <div key={i} className="chart__row" role="row">
                  <span role="rowheader" className="chart__label">
                    {p.label}
                  </span>
                  <span role="cell" className="chart__track">
                    <span
                      className="chart__bar"
                      style={{ width: `${(Math.abs(p.value) / max) * 100}%` }}
                    />
                  </span>
                  <span role="cell" className="chart__value">
                    {p.value.toLocaleString('uk-UA')} {node.fields.unit}
                  </span>
                </div>
              ))}
            </div>
            {node.fields.source && <small className="chart__source">{node.fields.source}</small>}
          </figure>
        )
      },
      pullquote: ({ node }: BlockNode) => (
        <blockquote className="pullquote">
          <p>{node.fields.text}</p>
          {node.fields.author && (
            <footer>
              {node.fields.author}
              {node.fields.role ? `, ${node.fields.role}` : ''}
            </footer>
          )}
        </blockquote>
      ),
    },
  })

export function RichText({
  data,
  className = 'prose',
  creditLabel = 'Фото:',
}: {
  data: unknown
  className?: string
  creditLabel?: string
}) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={makeConverters(creditLabel)}
      className={className}
    />
  )
}
