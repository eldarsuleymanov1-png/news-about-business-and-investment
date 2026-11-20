import { slugify } from '@/utils/slugify'

type LexNode = {
  type?: string
  text?: string
  tag?: string
  children?: LexNode[]
  fields?: Record<string, unknown>
}
type LexRoot = { root?: LexNode } | null | undefined

/** Плоский текст узла Lexical (включая текстовые поля блоков). */
export function nodeText(node: LexNode | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  const own =
    node.type === 'block' && node.fields
      ? Object.values(node.fields)
          .filter((v): v is string => typeof v === 'string')
          .join(' ')
      : ''
  return [own, ...(node.children ?? []).map(nodeText)].join(' ')
}

export function readingMinutes(content: LexRoot, extra = ''): number {
  const text = `${nodeText(content?.root)} ${extra}`
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** id заголовка для якоря — одинаково в оглавлении и в тексте. */
export const headingId = (text: string) => slugify(text, 60) || 'section'

/** Заголовки H2 для оглавления. */
export function extractHeadings(content: LexRoot): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = []
  for (const n of content?.root?.children ?? []) {
    if (n.type === 'heading' && n.tag === 'h2') {
      const text = nodeText(n).trim()
      if (text) out.push({ id: headingId(text), text })
    }
  }
  return out
}

/** Текст TL;DR → пункты списка (каждая строка — пункт). */
export const toBullets = (text?: string | null) =>
  (text ?? '')
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
