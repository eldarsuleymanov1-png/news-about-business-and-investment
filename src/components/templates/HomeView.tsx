import Link from 'next/link'
import type { Where } from 'payload'
import { prefixFromLocale, type Locale } from '@/i18n/config'
import { getDictionary, type Dictionary } from '@/lib/dictionary'
import { getHomepage, getRubrics, getSections, listMaterials } from '@/lib/payload'
import { materialHref, rubricHref, sectionHref } from '@/lib/urls'
import { audienceOptions } from '@/collections/Materials/options'
import { Kicker, MaterialCard } from '../MaterialCard'
import { Cover } from '../Cover'
import { PageShell } from '../PageShell'
import { SponsorLabel } from '../Badges'
import { Subscribe } from '../Subscribe'
import { readingMinutes } from '@/lib/content'
import type { Author, Material, Section } from '@/payload-types'

type BlockKind = 'hero' | 'section-grid' | 'section-list' | 'checks' | 'subscribe'
type Block = { kind: BlockKind; section?: Section | number | null; hidden?: boolean | null }

/** Порядок блоков по умолчанию — как в макете design/Main.dc.html */
const DEFAULT_BLOCKS: { kind: BlockKind; sectionSlug?: string }[] = [
  { kind: 'hero' },
  { kind: 'section-grid', sectionSlug: 'ukraine' },
  { kind: 'checks' },
  { kind: 'section-list', sectionSlug: 'abroad' },
  { kind: 'subscribe' },
]

/**
 * Главная по макету design/Main.dc.html. Блоки и их порядок — из global «Головна сторінка».
 * audience — фильтр «Показати для»: отдельный адрес /ua/for/<аудитория>, чтобы страница кэшировалась (ISR).
 */
export async function HomeView({ locale, audience }: { locale: Locale; audience?: string }) {
  const dict = getDictionary(locale)
  const aud: Where = audience ? { audience: { contains: audience } } : {}

  const [home, sections] = await Promise.all([getHomepage(locale), getSections(locale)])
  const bySlug = (slug?: string) => sections.find((s) => s.slug === slug)
  const configured = (home.blocks ?? []).filter((b) => !b.hidden) as Block[]
  const blocks: Block[] = configured.length
    ? configured
    : DEFAULT_BLOCKS.map((b) => ({ kind: b.kind, section: bySlug(b.sectionSlug) }))

  // Главный материал: выбранный редакцией или последний не-новостной
  const pinnedHero =
    typeof home.hero === 'object' && home.hero && !audience ? (home.hero as Material) : null
  const shown = new Set<number>()

  const rendered = await Promise.all(
    blocks.map(async (b, i) => {
      const section =
        typeof b.section === 'object' ? b.section : sections.find((s) => s.id === b.section)
      switch (b.kind) {
        case 'hero':
          return (
            <HeroBlock
              key={i}
              locale={locale}
              dict={dict}
              aud={aud}
              pinned={pinnedHero}
              shown={shown}
            />
          )
        case 'section-grid':
          return section ? (
            <SectionGrid key={i} locale={locale} section={section} aud={aud} shown={shown} />
          ) : null
        case 'section-list':
          return section ? (
            <SectionList
              key={i}
              locale={locale}
              dict={dict}
              section={section}
              aud={aud}
              shown={shown}
            />
          ) : null
        case 'checks':
          return <ChecksBand key={i} locale={locale} dict={dict} aud={aud} />
        case 'subscribe':
          return <Subscribe key={i} locale={locale} variant="band" />
      }
    }),
  )

  const base = `/${prefixFromLocale(locale)}`
  return (
    <PageShell locale={locale} header="full" mainClassName="page--home">
      <nav className="audience-filter" aria-label={dict.showFor}>
        <span className="muted">{dict.showFor}</span>
        <Link href={base} className="pill" aria-current={!audience ? 'true' : undefined}>
          {dict.audienceAll}
        </Link>
        {audienceOptions.map((o) => (
          <Link
            key={o.value}
            href={`${base}/for/${o.value}`}
            className="pill"
            aria-current={audience === o.value ? 'true' : undefined}
          >
            {o.label[locale]}
          </Link>
        ))}
      </nav>
      {rendered}
    </PageShell>
  )
}

// ------------------------------------------------------------------ блоки

type BlockProps = { locale: Locale; aud: Where; shown: Set<number> }

async function HeroBlock({
  locale,
  dict,
  aud,
  pinned,
  shown,
}: BlockProps & { dict: Dictionary; pinned: Material | null }) {
  const [featured, latest] = await Promise.all([
    pinned
      ? Promise.resolve(pinned)
      : listMaterials(
          locale,
          { and: [aud, { format: { not_in: ['news', 'digest'] } }] },
          { limit: 1, depth: 2 },
        ).then((r) => r.docs[0] ?? null),
    listMaterials(locale, { and: [aud, { format: { equals: 'news' } }] }, { limit: 7 }),
  ])
  if (featured) shown.add(featured.id)
  const href = featured ? materialHref(featured, locale) : null
  const authors = (featured?.authors ?? [])
    .filter((a): a is Author => typeof a === 'object')
    .map((a) => a.name)
    .join(', ')
  const newsSection = `/${prefixFromLocale(locale)}/news`

  return (
    <section className="hero">
      {featured && href ? (
        <article className="hero__main">
          <Link href={href} tabIndex={-1} aria-hidden>
            <Cover
              media={featured.cover}
              size="wide"
              priority
              sizes="(max-width: 900px) 100vw, 760px"
            />
          </Link>
          <Kicker material={featured} locale={locale} />
          <SponsorLabel material={featured} locale={locale} />
          <h1 className="hero__title">
            <Link href={href}>{featured.title}</Link>
          </h1>
          {featured.lead && <p className="lead">{featured.lead}</p>}
          <div className="card__meta">
            {[
              authors,
              dict.minReadLong(readingMinutes(featured.content as never, featured.lead ?? '')),
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </article>
      ) : (
        <div className="hero__main">
          <p className="muted">{dict.noMaterials}</p>
        </div>
      )}
      <aside className="hero__aside" aria-labelledby="latest-title">
        <h2 id="latest-title" className="eyebrow">
          {dict.latestNews}
        </h2>
        {latest.docs
          .filter((m) => m.id !== featured?.id)
          .slice(0, 6)
          .map((m) => (
            <MaterialCard key={m.id} material={m} locale={locale} variant="feed" />
          ))}
        <Link href={newsSection} className="more-link">
          {dict.allNews}
        </Link>
      </aside>
    </section>
  )
}

async function SectionHead({ locale, section }: { locale: Locale; section: Section }) {
  const rubrics = await getRubrics(section.id, locale)
  return (
    <div className="block-head">
      <h2 className="block-head__title">
        <Link href={sectionHref(section.slug!, locale)}>{section.title}</Link>
      </h2>
      <nav className="block-head__links" aria-label={section.title}>
        {rubrics.map((r) => (
          <Link key={r.id} href={rubricHref(section.slug!, r.slug!, locale)}>
            {r.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

async function SectionGrid({ locale, section, aud, shown }: BlockProps & { section: Section }) {
  const { docs } = await listMaterials(
    locale,
    { and: [aud, { section: { equals: section.id } }] },
    { limit: 6 },
  )
  const items = docs.filter((m) => !shown.has(m.id)).slice(0, 3)
  items.forEach((m) => shown.add(m.id))
  if (!items.length) return null
  return (
    <section className="block">
      <SectionHead locale={locale} section={section} />
      <div className="grid-3">
        {items.map((m) => (
          <MaterialCard key={m.id} material={m} locale={locale} />
        ))}
      </div>
    </section>
  )
}

async function SectionList({
  locale,
  dict,
  section,
  aud,
  shown,
}: BlockProps & { dict: Dictionary; section: Section }) {
  const sections = await getSections(locale)
  const news = sections.find((s) => s.slug === 'news')
  const [own, top] = await Promise.all([
    listMaterials(locale, { and: [aud, { section: { equals: section.id } }] }, { limit: 6 }),
    news
      ? listMaterials(locale, { and: [aud, { section: { equals: news.id } }] }, { limit: 8 })
      : Promise.resolve({ docs: [] as Material[] }),
  ])
  const items = own.docs.filter((m) => !shown.has(m.id)).slice(0, 3)
  items.forEach((m) => shown.add(m.id))
  const headlines = top.docs.filter((m) => !shown.has(m.id)).slice(0, 4)
  if (!items.length && !headlines.length) return null
  return (
    <section className="split">
      <div className="split__main">
        <SectionHead locale={locale} section={section} />
        {items.map((m) => (
          <MaterialCard key={m.id} material={m} locale={locale} variant="row" />
        ))}
      </div>
      {headlines.length > 0 && (
        <aside className="split__aside" aria-labelledby="top-news-title">
          <div className="block-head block-head--plain">
            <h2 id="top-news-title" className="block-head__title block-head__title--sm">
              {dict.topNews}
            </h2>
          </div>
          {headlines.map((m) => (
            <MaterialCard key={m.id} material={m} locale={locale} variant="headline" />
          ))}
        </aside>
      )}
    </section>
  )
}

async function ChecksBand({ locale, dict, aud }: Omit<BlockProps, 'shown'> & { dict: Dictionary }) {
  const { docs } = await listMaterials(
    locale,
    { and: [aud, { format: { equals: 'check' } }] },
    { limit: 3 },
  )
  const base = `/${prefixFromLocale(locale)}`
  return (
    <section className="band-dark" aria-labelledby="checks-title">
      <div className="band-dark__head">
        <div className="band-dark__text">
          <h2 id="checks-title">
            <Link href={`${base}/checks`}>{dict.checks}</Link>
          </h2>
          <p>{dict.checksIntro}</p>
        </div>
        <Link href={`${base}/checks#submit`} className="btn btn--light">
          {dict.submitProject}
        </Link>
      </div>
      {docs.length > 0 && (
        <div className="check-grid">
          {docs.map((m) => (
            <MaterialCard key={m.id} material={m} locale={locale} variant="check" />
          ))}
        </div>
      )}
    </section>
  )
}
