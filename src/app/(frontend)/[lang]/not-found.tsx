import Link from 'next/link'
import { PageShell } from '@/components/PageShell'

/**
 * 404. Статическая (без headers()), чтобы не делать весь сегмент [lang] динамическим и не ломать ISR.
 * not-found не получает params, поэтому текст на двух языках.
 */
export default function NotFound() {
  return (
    <PageShell locale="uk">
      <section className="not-found">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Сторінку не знайдено</h1>
        <p className="lead">Можливо, матеріал перенесли або видалили.</p>
        <p className="muted" lang="en">
          Page not found. The material may have been moved or removed.
        </p>
        <div className="chips">
          <Link href="/ua" className="btn btn--accent">
            На головну
          </Link>
          <Link href="/en" className="btn btn--outline" lang="en">
            English version
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
