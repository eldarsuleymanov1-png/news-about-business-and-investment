import Link from 'next/link'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="breadcrumbs">
      {items.map((c, i) => (
        <span key={i} className="breadcrumbs__item">
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href ? (
            <Link href={c.href}>{c.label}</Link>
          ) : (
            <span aria-current="page">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
