import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionary'

type Props = {
  page: number
  totalPages: number
  dict: Dictionary
  /** Строит адрес страницы с сохранением фильтров */
  hrefFor: (page: number) => string
}

export function Pagination({ page, totalPages, dict, hrefFor }: Props) {
  if (totalPages <= 1) return null
  return (
    <nav className="pagination" aria-label={dict.pageOf(page, totalPages)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className="btn btn--outline">
          {dict.prev}
        </Link>
      ) : (
        <span />
      )}
      <span className="muted">{dict.pageOf(page, totalPages)}</span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className="btn btn--outline">
          {dict.next}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
