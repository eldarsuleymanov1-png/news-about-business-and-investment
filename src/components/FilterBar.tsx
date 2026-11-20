import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/lib/dictionary'
import type { ListingFilters } from '@/lib/filters'
import { audienceOptions, formatOptions } from '@/collections/Materials/options'

/** Фильтры ленты: обычная GET-форма, работает без JavaScript. */
export function FilterBar({
  locale,
  dict,
  filters,
  basePath,
}: {
  locale: Locale
  dict: Dictionary
  filters: ListingFilters
  basePath: string
}) {
  const active = Boolean(filters.format || filters.audience)
  return (
    <form method="get" action={basePath} className="filter-bar" aria-label={dict.filters}>
      <label className="field">
        <span>{dict.format}</span>
        <select name="format" defaultValue={filters.format ?? ''} className="input">
          <option value="">{dict.all}</option>
          {formatOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{dict.audience}</span>
        <select name="audience" defaultValue={filters.audience ?? ''} className="input">
          <option value="">{dict.all}</option>
          {audienceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn--dark btn--form">
        {dict.apply}
      </button>
      {active && (
        <Link href={basePath} className="btn btn--outline btn--form">
          {dict.reset}
        </Link>
      )}
    </form>
  )
}
