import type { Payload } from 'payload'
import { servicePages, structure } from './structure'

/**
 * Идемпотентно создаёт разделы, рубрики и Украину в справочнике стран.
 * Повторный запуск ничего не дублирует.
 */
export async function seedStructure(payload: Payload) {
  for (const [i, s] of structure.entries()) {
    let section = (
      await payload.find({
        collection: 'sections',
        where: { slug: { equals: s.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (!section) {
      section = await payload.create({
        collection: 'sections',
        locale: 'uk',
        data: { title: s.title.uk, navTitle: s.nav.uk, slug: s.slug, order: i },
      })
      await payload.update({
        collection: 'sections',
        id: section.id,
        locale: 'en',
        data: { title: s.title.en, navTitle: s.nav.en },
      })
      payload.logger.info(`section ${s.slug}`)
    } else if (!section.navTitle) {
      await payload.update({
        collection: 'sections',
        id: section.id,
        locale: 'uk',
        data: { navTitle: s.nav.uk },
      })
      await payload.update({
        collection: 'sections',
        id: section.id,
        locale: 'en',
        data: { navTitle: s.nav.en },
      })
    }
    for (const [j, r] of s.rubrics.entries()) {
      const exists = await payload.find({
        collection: 'rubrics',
        where: { and: [{ slug: { equals: r.slug } }, { section: { equals: section.id } }] },
        limit: 1,
        depth: 0,
      })
      if (exists.docs.length) continue
      const rubric = await payload.create({
        collection: 'rubrics',
        locale: 'uk',
        data: {
          title: r.uk,
          slug: r.slug,
          section: section.id,
          order: j,
          requiresMilitaryChecklist: Boolean((r as { military?: boolean }).military),
        },
      })
      await payload.update({
        collection: 'rubrics',
        id: rubric.id,
        locale: 'en',
        data: { title: r.en },
      })
      payload.logger.info(`  rubric ${s.slug}/${r.slug}`)
    }
  }

  for (const p of servicePages) {
    const exists = await payload.find({
      collection: 'pages',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })
    if (exists.docs.length) continue
    const doc = await payload.create({
      collection: 'pages',
      locale: 'uk',
      data: {
        title: p.uk,
        slug: p.slug,
        footerGroup: p.group,
        footerOrder: p.order,
        published: false,
      },
    })
    await payload.update({ collection: 'pages', id: doc.id, locale: 'en', data: { title: p.en } })
  }

  const ua = await payload.find({
    collection: 'regions',
    where: { slug: { equals: 'ukraine' } },
    limit: 1,
  })
  if (!ua.docs.length) {
    const doc = await payload.create({
      collection: 'regions',
      locale: 'uk',
      data: { title: 'Україна', slug: 'ukraine', kind: 'country', isoCode: 'UA' },
    })
    await payload.update({
      collection: 'regions',
      id: doc.id,
      locale: 'en',
      data: { title: 'Ukraine' },
    })
  }
}
