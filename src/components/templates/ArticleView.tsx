import Link from 'next/link'
import { prefixFromLocale, type Locale } from '@/i18n/config'
import { extractHeadings, readingMinutes, toBullets } from '@/lib/content'
import { formatDate, getDictionary } from '@/lib/dictionary'
import { materialHref, sectionHref, rubricHref } from '@/lib/urls'
import type { Author, Material, Media, Section, Rubric } from '@/payload-types'
import { DISCLAIMER_FORMATS } from '@/collections/Materials/options'
import { SponsorLabel, audienceLabel, formatLabel } from '../Badges'
import { Breadcrumbs } from '../Breadcrumbs'
import { Cover } from '../Cover'
import { RichText } from '../RichText'
import { ShareButtons } from '../ShareButtons'
import { Subscribe } from '../Subscribe'

type Props = {
  material: Material
  locale: Locale
  url: string
  disclaimer: string
  related: Material[]
}

export function AuthorLine({ material: m, locale }: { material: Material; locale: Locale }) {
  const dict = getDictionary(locale)
  const authors = (m.authors ?? []).filter((a): a is Author => typeof a === 'object')
  const first = authors[0]
  const photo = first && typeof first.photo === 'object' ? (first.photo as Media) : null
  const minutes = readingMinutes(m.content as never, `${m.lead ?? ''} ${m.tldr ?? ''}`)
  const p = prefixFromLocale(locale)
  return (
    <div className="author-line">
      {photo?.sizes?.thumb?.url || photo?.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- маленький аватар, оптимизация не нужна
        <img
          src={photo.sizes?.thumb?.url || photo.url!}
          alt=""
          className="avatar"
          width={48}
          height={48}
        />
      ) : (
        <span className="avatar avatar--empty" aria-hidden="true" />
      )}
      <div className="author-line__text">
        <span className="author-line__names">
          {authors.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ', '}
              <Link href={`/${p}/authors/${a.slug}`}>{a.name}</Link>
            </span>
          ))}
        </span>
        <span className="author-line__meta">
          {dict.published} {formatDate(m.publishedAt, locale)}
          {m.contentUpdatedAt &&
            ` · ${dict.updated} ${formatDate(m.contentUpdatedAt, locale, { year: false })}`}
          {` · ${dict.minRead(minutes)}`}
        </span>
      </div>
    </div>
  )
}

export function ArticleView({ material: m, locale, url, disclaimer, related }: Props) {
  const dict = getDictionary(locale)
  const section = m.section as Section
  const rubric = m.rubric as Rubric
  const cover = typeof m.cover === 'object' ? (m.cover as Media) : null
  const headings = extractHeadings(m.content as never)
  const showToc =
    Boolean(m.showToc ?? true) && headings.length >= 3 && ['analysis', 'guide'].includes(m.format)
  const tldr = toBullets(m.tldr)
  const p = prefixFromLocale(locale)

  return (
    <div className="article-layout">
      <article className="article">
        <Breadcrumbs
          label={dict.home}
          items={[
            { label: dict.home, href: `/${p}` },
            { label: section.title, href: sectionHref(section.slug!, locale) },
            { label: rubric.title, href: rubricHref(section.slug!, rubric.slug!, locale) },
          ]}
        />
        <div className="tags">
          <span className="tag tag--accent">{formatLabel(m.format, locale)}</span>
          {(m.audience ?? []).map((a) => (
            <span key={a} className="tag">
              {audienceLabel(a, locale)}
            </span>
          ))}
          <SponsorLabel material={m} locale={locale} />
        </div>
        <h1 className="article__title">{m.title}</h1>
        {m.lead && <p className="article__lead">{m.lead}</p>}

        <div className="article__byline">
          <AuthorLine material={m} locale={locale} />
          <ShareButtons
            url={url}
            title={m.title}
            labels={{
              telegram: dict.shareTelegram,
              linkedin: dict.shareLinkedIn,
              facebook: dict.shareFacebook,
              copy: dict.copyLink,
              copied: dict.copied,
            }}
          />
        </div>

        {cover && (
          <figure className="figure figure--cover">
            <Cover media={cover} size="wide" priority sizes="(max-width: 900px) 100vw, 760px" />
            {(cover.caption || cover.credit) && (
              <figcaption>
                {cover.caption}
                {cover.credit && (
                  <span className="figure__credit">
                    {' '}
                    {dict.photo}: {cover.credit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {m.format === 'interview' && m.interviewee?.name && (
          <aside className="interviewee">
            <span className="eyebrow">{dict.interviewee}</span>
            <strong>{m.interviewee.name}</strong>
            {m.interviewee.position && <span className="muted">{m.interviewee.position}</span>}
          </aside>
        )}

        {tldr.length > 0 && (
          <section className="tldr" aria-labelledby="tldr-title">
            <h2 id="tldr-title" className="eyebrow eyebrow--accent">
              {dict.tldr}
            </h2>
            <ul>
              {tldr.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        {m.format === 'guide' && m.verifiedAt && (
          <p className="verified-badge">
            {dict.verifiedAt} {formatDate(m.verifiedAt, locale)}
          </p>
        )}

        {m.format === 'case' &&
          (m.caseStudy?.invested || m.caseStudy?.term || m.caseStudy?.result) && (
            <dl className="case-facts">
              {(['invested', 'term', 'result'] as const).map((k) =>
                m.caseStudy?.[k] ? (
                  <div key={k}>
                    <dt>{dict.caseStudy[k]}</dt>
                    <dd>{m.caseStudy[k]}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          )}

        <RichText
          data={m.content}
          className={`prose ${m.format === 'interview' ? 'prose--interview' : ''}`}
          creditLabel={`${dict.photo}:`}
        />

        {m.format === 'digest' && !!m.digestItems?.length && (
          <ol className="digest">
            {m.digestItems.map((item) => {
              const linked = typeof item.material === 'object' ? (item.material as Material) : null
              const href = linked ? materialHref(linked, locale) : item.externalUrl
              const title = linked?.title || item.headline || item.externalUrl
              return (
                <li key={item.id}>
                  {href ? <Link href={href}>{title}</Link> : title}
                  <p>{item.comment}</p>
                </li>
              )
            })}
          </ol>
        )}

        {m.investorTakeaway && (
          <aside className="takeaway">
            <h2>{dict.investorTakeaway}</h2>
            <p>{m.investorTakeaway}</p>
          </aside>
        )}

        {(m.sources?.length || m.primarySourceUrl) && (
          <section className="sources" aria-labelledby="sources-title">
            <h2 id="sources-title">{dict.sources}</h2>
            <ol>
              {m.primarySourceUrl && !m.sources?.some((s) => s.url === m.primarySourceUrl) && (
                <li>
                  <a href={m.primarySourceUrl} rel="noopener noreferrer nofollow" target="_blank">
                    {new URL(m.primarySourceUrl).hostname}
                  </a>
                </li>
              )}
              {m.sources?.map((s) => (
                <li key={s.id}>
                  {s.url ? (
                    <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {DISCLAIMER_FORMATS.includes(m.format as never) && (
          <p className="disclaimer">{disclaimer}</p>
        )}
      </article>

      <aside className="article-sidebar">
        {showToc && (
          <nav className="toc" aria-labelledby="toc-title">
            <h2 id="toc-title" className="eyebrow">
              {dict.toc}
            </h2>
            {headings.map((h) => (
              <a key={h.id} href={`#${h.id}`}>
                {h.text}
              </a>
            ))}
          </nav>
        )}
        <Subscribe locale={locale} variant="sidebar" />
        {related.length > 0 && (
          <section className="read-also" aria-labelledby="read-also-title">
            <h2 id="read-also-title" className="eyebrow">
              {dict.readAlso}
            </h2>
            {related.map((r) => {
              const href = materialHref(r, locale)
              return href ? (
                <Link key={r.id} href={href} className="link-item">
                  {r.title}
                </Link>
              ) : null
            })}
          </section>
        )}
      </aside>
    </div>
  )
}
