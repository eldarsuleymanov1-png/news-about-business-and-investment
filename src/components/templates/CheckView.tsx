import Link from 'next/link'
import { prefixFromLocale, type Locale } from '@/i18n/config'
import { formatDate, getDictionary } from '@/lib/dictionary'
import { sectionHref } from '@/lib/urls'
import { criterionOptions, criterionStatusOptions } from '@/collections/Materials/options'
import type { Author, Company, Evidence, Material, Section } from '@/payload-types'
import { CriterionBadge, SponsorLabel, verdictLabel } from '../Badges'
import { Breadcrumbs } from '../Breadcrumbs'
import { CheckIcon, WarningIcon } from '../Icons'
import { RichText } from '../RichText'
import { ShareButtons } from '../ShareButtons'

type Props = { material: Material; locale: Locale; url: string; submitHref: string }

/** Шаблон «Перевірки» по макету design/Check.dc.html */
export function CheckView({ material: m, locale, url, submitHref }: Props) {
  const dict = getDictionary(locale)
  const p = prefixFromLocale(locale)
  const section = m.section as Section
  const check = m.check ?? {}
  const verdict = check.verdict
  const company =
    typeof check.subject?.company === 'object' ? (check.subject.company as Company) : null
  const subject = {
    legalEntity: check.subject?.legalEntity || company?.legalName,
    edrpou: check.subject?.edrpou || company?.edrpou,
    country: check.subject?.country,
    website: check.subject?.website || company?.website,
  }
  const authors = (m.authors ?? []).filter((a): a is Author => typeof a === 'object')
  const evidence = (check.evidence ?? []).filter(
    (e): e is Evidence => typeof e === 'object' && Boolean(e?.isPublic),
  )
  const history = [...(check.verdictHistory ?? [])].reverse()
  const reply = check.rightOfReply

  return (
    <div className="check-page">
      <Breadcrumbs
        label={dict.home}
        items={[
          { label: dict.home, href: `/${p}` },
          { label: section.navTitle || section.title, href: sectionHref(section.slug!, locale) },
          { label: dict.check },
        ]}
      />

      <section className="check-hero">
        <div className="check-hero__text">
          <span className="eyebrow">{dict.check}</span>
          <SponsorLabel material={m} locale={locale} />
          <h1 className="article__title">{m.title}</h1>
          {m.lead && <p className="article__lead">{m.lead}</p>}
          <div className="card__meta">
            {authors.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ', '}
                <Link href={`/${p}/authors/${a.slug}`}>{a.name}</Link>
              </span>
            ))}
            {` · ${dict.checkedOn} ${formatDate(m.publishedAt, locale)}`}
            {m.contentUpdatedAt &&
              ` · ${dict.updated} ${formatDate(m.contentUpdatedAt, locale, { year: false })}`}
          </div>
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

        {verdict && (
          <div className={`verdict-card verdict-card--${verdict}`}>
            <span className="eyebrow">{dict.verdict}</span>
            <div className={`verdict-card__label verdict--${verdict}`}>
              {verdict === 'no-risks' ? <CheckIcon /> : <WarningIcon />}
              <span>{verdictLabel(verdict, locale)}</span>
            </div>
            <dl className="verdict-card__facts">
              {subject.legalEntity && (
                <div>
                  <dt>{dict.legalEntity}</dt>
                  <dd>{subject.legalEntity}</dd>
                </div>
              )}
              {subject.edrpou && (
                <div>
                  <dt>{dict.edrpou}</dt>
                  <dd>{subject.edrpou}</dd>
                </div>
              )}
              {subject.country && (
                <div>
                  <dt>{dict.country}</dt>
                  <dd>{subject.country}</dd>
                </div>
              )}
              {subject.website && (
                <div>
                  <dt>{dict.website}</dt>
                  <dd className="break">
                    {subject.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </dd>
                </div>
              )}
            </dl>
            <Link href={`/${p}/methodology`}>{dict.howWeCheck}</Link>
          </div>
        )}
      </section>

      {!!check.criteria?.length && (
        <section className="block" aria-labelledby="criteria-title">
          <div className="block-head">
            <h2 id="criteria-title" className="block-head__title">
              {dict.criteria}
            </h2>
            <ul className="legend" aria-hidden="true">
              <li className="legend__item legend__item--ok">{criterionLabel('ok', locale)}</li>
              <li className="legend__item legend__item--question">
                {criterionLabel('question', locale)}
              </li>
              <li className="legend__item legend__item--violation">
                {criterionLabel('violation', locale)}
              </li>
            </ul>
          </div>
          <ul className="criteria">
            {check.criteria.map((c) => (
              <li key={c.id} className="criteria__row">
                <CriterionBadge status={c.status} locale={locale} />
                <div className="criteria__text">
                  <strong>
                    {criterionOptions.find((o) => o.value === c.criterion)?.label[locale]}
                  </strong>
                  {c.comment && <span>{c.comment}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RichText data={m.content} className="prose prose--check" creditLabel={`${dict.photo}:`} />

      <section className="check-panels">
        <div className="panel">
          <h2>{dict.companyResponse}</h2>
          <div className="panel__facts">
            {reply?.requestSentAt && (
              <span>
                {dict.requestSent}{' '}
                <strong>{formatDate(reply.requestSentAt, locale, { year: false })}</strong>
              </span>
            )}
            <span>
              {dict.status} <strong>{dict.replyStatus[reply?.outcome ?? 'pending']}</strong>
            </span>
          </div>
          {reply?.response ? (
            <p className="panel__quote">{reply.response}</p>
          ) : (
            <p className="muted">{dict.replyNote}</p>
          )}
        </div>
        {history.length > 0 && (
          <div className="panel">
            <h2>{dict.verdictHistory}</h2>
            <ol className="history">
              {history.map((h, i) => (
                <li key={h.id}>
                  <span className="history__date">
                    {formatDate(h.date, locale, { year: false })}
                  </span>
                  <span>
                    {h.note ||
                      (i === history.length - 1
                        ? dict.publishedWithVerdict(verdictLabel(h.verdict, locale))
                        : dict.verdictChanged(verdictLabel(h.verdict, locale)))}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {evidence.length > 0 && (
        <section className="block" aria-labelledby="evidence-title">
          <h2 id="evidence-title" className="block-head__title block-head__title--md">
            {dict.evidence}
          </h2>
          <div className="evidence-grid">
            {evidence.map((e) => (
              <a
                key={e.id}
                href={e.url ?? '#'}
                className="evidence"
                target="_blank"
                rel="noopener noreferrer"
              >
                {e.mimeType?.startsWith('image') && e.url && (
                  // eslint-disable-next-line @next/next/no-img-element -- скриншоты-доказательства, показываем как есть
                  <img src={e.url} alt="" loading="lazy" />
                )}
                <span className="evidence__caption">
                  {e.title}, {formatDate(e.collectedAt, locale)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {!!m.sources?.length && (
        <section className="sources" aria-labelledby="sources-title">
          <h2 id="sources-title">{dict.sources}</h2>
          <ol>
            {m.sources.map((s) => (
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

      <section className="band-dark band-dark--cta" id="submit">
        <div className="band-dark__text">
          <h2>{dict.doubtTitle}</h2>
          <p>{dict.doubtText}</p>
        </div>
        <Link href={submitHref} className="btn btn--light">
          {dict.submitProject}
        </Link>
      </section>

      <p className="disclaimer disclaimer--plain">{dict.checkDisclaimer}</p>
    </div>
  )
}

function criterionLabel(s: 'ok' | 'question' | 'violation', locale: Locale) {
  return criterionStatusOptions.find((o) => o.value === s)?.label[locale]
}
