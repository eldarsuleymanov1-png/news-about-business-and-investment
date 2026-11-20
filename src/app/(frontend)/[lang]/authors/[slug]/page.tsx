import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, prefixFromLocale } from '@/i18n/config'
import { getDictionary, requireLocale } from '@/lib/dictionary'
import { parseFilters, filtersToQuery, type SearchParams } from '@/lib/filters'
import { getAuthorBySlug, listMaterials } from '@/lib/payload'
import { siteUrl } from '@/lib/urls'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MaterialCard } from '@/components/MaterialCard'
import { PageShell } from '@/components/PageShell'
import { Pagination } from '@/components/Pagination'
import type { Media } from '@/payload-types'

// Динамическая страница: пагинация через ?page= — не кэшируется (ISR только у главной, материалов и служебных страниц).
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ lang: string; slug: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const author = await getAuthorBySlug(slug, requireLocale(lang))
  if (!author) return {}
  return {
    title: author.name,
    description: author.bio?.slice(0, 200) || author.position || undefined,
    alternates: {
      canonical: `/${lang}/authors/${slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l.hreflang, `/${l.urlPrefix}/authors/${slug}`]),
      ),
    },
    openGraph: { type: 'profile' },
  }
}

const NETWORK_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  x: 'X',
  telegram: 'Telegram',
  instagram: 'Instagram',
  website: 'Website',
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { lang, slug } = await params
  const locale = requireLocale(lang)
  const author = await getAuthorBySlug(slug, locale)
  if (!author || !author.name) notFound()
  const dict = getDictionary(locale)
  const { page } = parseFilters(await searchParams)
  const materials = await listMaterials(
    locale,
    { authors: { contains: author.id } },
    { limit: 12, page },
  )
  const photo = typeof author.photo === 'object' ? (author.photo as Media) : null
  const p = prefixFromLocale(locale)
  const base = `/${p}/authors/${slug}`

  // Schema.org Person — для доверия и поисковиков (ТЗ, 7)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.position || undefined,
    description: author.bio || undefined,
    image: photo?.url ? `${siteUrl()}${photo.url}` : undefined,
    url: `${siteUrl()}${base}`,
    sameAs: (author.socials ?? []).map((s) => s.url),
  }

  return (
    <PageShell
      locale={locale}
      alternates={Object.fromEntries(
        locales.map((l) => [l.code, `/${l.urlPrefix}/authors/${slug}`]),
      )}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        label={dict.home}
        items={[
          { label: dict.home, href: `/${p}` },
          { label: dict.team, href: `/${p}/authors` },
          { label: author.name },
        ]}
      />
      <header className="author-head">
        {photo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- аватар
          <img
            src={photo.sizes?.card?.url || photo.url}
            alt=""
            className="avatar avatar--xl"
            width={120}
            height={120}
          />
        ) : (
          <span className="avatar avatar--xl avatar--empty" aria-hidden="true" />
        )}
        <div className="author-head__text">
          <h1 className="page-title">{author.name}</h1>
          {author.position && <p className="lead">{author.position}</p>}
          {author.bio && <p className="author-head__bio">{author.bio}</p>}
          {!!author.expertise?.length && (
            <div className="tags" aria-label={dict.expertise}>
              {author.expertise.map((e) => (
                <span key={e} className="tag">
                  {e}
                </span>
              ))}
            </div>
          )}
          {!!author.socials?.length && (
            <div className="author-head__links">
              {author.socials.map((s) => (
                <a key={s.id} href={s.url} rel="me noopener noreferrer" target="_blank">
                  {NETWORK_LABEL[s.network] ?? s.network}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>
      <section className="block" aria-labelledby="author-materials">
        <div className="block-head">
          <h2 id="author-materials" className="block-head__title block-head__title--md">
            {dict.authorMaterials}
          </h2>
        </div>
        {materials.docs.length ? (
          <div className="listing__items">
            {materials.docs.map((m) => (
              <MaterialCard key={m.id} material={m} locale={locale} variant="row" />
            ))}
          </div>
        ) : (
          <p className="muted">{dict.noMaterials}</p>
        )}
        <Pagination
          page={materials.page ?? 1}
          totalPages={materials.totalPages}
          dict={dict}
          hrefFor={(n) => `${base}${filtersToQuery({}, n)}`}
        />
      </section>
    </PageShell>
  )
}
