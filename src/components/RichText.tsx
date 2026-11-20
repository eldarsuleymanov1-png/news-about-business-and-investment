import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type BlockFields = Record<string, any>

/** Рендер блоков редактора. Вёрстка — черновая, финальная будет по макетам. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }: { node: { fields: BlockFields } }) => (
      <aside className={`callout callout--${node.fields.tone}`}>
        {node.fields.title && <strong>{node.fields.title}</strong>}
        <p>{node.fields.text}</p>
      </aside>
    ),
    embed: ({ node }: { node: { fields: BlockFields } }) => (
      <figure className="embed">
        <a href={node.fields.url} rel="noopener noreferrer" target="_blank">
          {node.fields.url}
        </a>
        {node.fields.caption && <figcaption>{node.fields.caption}</figcaption>}
      </figure>
    ),
    chart: ({ node }: { node: { fields: BlockFields } }) => (
      <figure className="chart">
        <figcaption>{node.fields.title}</figcaption>
        <table>
          <tbody>
            {(node.fields.points ?? []).map((p: { label: string; value: number }, i: number) => (
              <tr key={i}>
                <th scope="row">{p.label}</th>
                <td>
                  {p.value} {node.fields.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {node.fields.source && <small>{node.fields.source}</small>}
      </figure>
    ),
    pullquote: ({ node }: { node: { fields: BlockFields } }) => (
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

export function RichText({ data }: { data: SerializedEditorState | null | undefined }) {
  if (!data) return null
  return <LexicalRichText data={data} converters={converters} className="prose" />
}
