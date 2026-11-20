import type { Where } from 'payload'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { filtersToQuery, filtersToWhere, type ListingFilters } from '@/lib/filters'
import { listMaterials } from '@/lib/payload'
import { FilterBar } from './FilterBar'
import { MaterialCard } from './MaterialCard'
import { Pagination } from './Pagination'

/** Лента раздела/рубрики: фильтры по формату и аудитории + пагинация. */
export async function Listing({
  locale,
  where,
  filters,
  basePath,
}: {
  locale: Locale
  where: Where
  filters: ListingFilters
  basePath: string
}) {
  const dict = getDictionary(locale)
  const result = await listMaterials(
    locale,
    { and: [where, ...filtersToWhere(filters)] },
    { limit: 12, page: filters.page },
  )
  return (
    <div className="listing">
      <FilterBar locale={locale} dict={dict} filters={filters} basePath={basePath} />
      {result.docs.length ? (
        <div className="listing__items">
          {result.docs.map((m) => (
            <MaterialCard key={m.id} material={m} locale={locale} variant="row" />
          ))}
        </div>
      ) : (
        <p className="muted">{dict.noMaterials}</p>
      )}
      <Pagination
        page={result.page ?? 1}
        totalPages={result.totalPages}
        dict={dict}
        hrefFor={(p) => `${basePath}${filtersToQuery(filters, p)}`}
      />
    </div>
  )
}
