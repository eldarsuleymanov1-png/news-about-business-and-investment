import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { seedStructure } from '@/seed'
import type { Material, User } from '@/payload-types'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const users: Record<string, User> = {}
let authorProfileId: number
let sectionIds: Record<string, number> = {}
let rubricIds: Record<string, number> = {}

const roles = ['admin', 'chief-editor', 'editor', 'author', 'ad-manager'] as const

async function makeMaterial(as: User, data: Partial<Material> = {}) {
  return payload.create({
    collection: 'materials',
    user: as,
    overrideAccess: false,
    data: {
      title: 'Тестовий матеріал',
      format: 'news',
      status: 'draft',
      authors: [authorProfileId],
      section: sectionIds.news,
      rubric: rubricIds['news/ukraine'],
      ...data,
    } as Material,
  })
}

const update = (as: User, id: number, data: Partial<Material>) =>
  payload.update({ collection: 'materials', id, user: as, overrideAccess: false, data })

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  // Чистая база для каждого прогона
  for (const c of [
    'audit-log',
    'materials',
    'authors',
    'rubrics',
    'sections',
    'regions',
    'users',
  ] as const) {
    await payload.delete({ collection: c, where: { id: { exists: true } }, overrideAccess: true })
  }
  await seedStructure(payload)

  for (const role of roles) {
    users[role] = await payload.create({
      collection: 'users',
      data: { email: `${role}@test.local`, password: 'test-password-123', role },
    })
    // Первый пользователь становится админом — восстанавливаем нужную роль
    if (users[role].role !== role) {
      users[role] = await payload.update({
        collection: 'users',
        id: users[role].id,
        data: { role },
      })
    }
  }
  authorProfileId = (await payload.create({ collection: 'authors', data: { name: 'Тест Автор' } }))
    .id

  const sections = await payload.find({ collection: 'sections', limit: 10 })
  sectionIds = Object.fromEntries(sections.docs.map((s) => [s.slug, s.id]))
  const rubrics = await payload.find({ collection: 'rubrics', limit: 100, depth: 1 })
  rubricIds = Object.fromEntries(
    rubrics.docs.map((r) => [
      `${typeof r.section === 'object' ? r.section.slug : ''}/${r.slug}`,
      r.id,
    ]),
  )
})

describe('Реклама', () => {
  it('рекламний менеджер завжди створює матеріал із позначкою', async () => {
    const m = await makeMaterial(users['ad-manager'], {
      sponsorship: { isSponsored: false, label: 'partner', sponsorName: 'ТОВ Партнер' },
    })
    expect(m.sponsorship?.isSponsored).toBe(true)
  })

  it('рекламний матеріал без замовника не зберігається', async () => {
    await expect(
      makeMaterial(users.editor, {
        sponsorship: { isSponsored: true, label: 'advertising', sponsorName: '' },
      }),
    ).rejects.toThrow(/sponsorship.sponsorName/)
  })

  it('рекламний менеджер не публікує', async () => {
    const m = await makeMaterial(users['ad-manager'], {
      sponsorship: { isSponsored: true, label: 'advertising', sponsorName: 'ТОВ Партнер' },
    })
    await expect(update(users['ad-manager'], m.id, { status: 'published' })).rejects.toThrow(
      /status/,
    )
  })

  it('редактор не може зняти позначку, головний редактор — може', async () => {
    const m = await makeMaterial(users.editor, {
      sponsorship: { isSponsored: true, label: 'advertising', sponsorName: 'ТОВ Партнер' },
    })
    await expect(
      update(users.editor, m.id, { sponsorship: { isSponsored: false } }),
    ).rejects.toThrow(/sponsorship.isSponsored/)
    const ok = await update(users['chief-editor'], m.id, { sponsorship: { isSponsored: false } })
    expect(ok.sponsorship?.isSponsored).toBe(false)
  })
})

describe('Права на публікацію', () => {
  it('автор не публікує і не редагує чужі матеріали', async () => {
    const own = await makeMaterial(users.author)
    await expect(update(users.author, own.id, { status: 'published' })).rejects.toThrow(/status/)
    const moved = await update(users.author, own.id, { status: 'editing' })
    expect(moved.status).toBe('editing')

    const foreign = await makeMaterial(users.editor)
    await expect(update(users.author, foreign.id, { title: 'Чуже' })).rejects.toMatchObject({
      status: 403,
    })
  })

  it('редактор публікує новину', async () => {
    const m = await makeMaterial(users.editor)
    const p = await update(users.editor, m.id, { status: 'published' })
    expect(p.status).toBe('published')
    expect(p.publishedAt).toBeTruthy()
  })

  it('розбір публікується лише після перевірки фактів', async () => {
    const m = await makeMaterial(users.editor, { format: 'analysis' })
    await expect(update(users.editor, m.id, { status: 'published' })).rejects.toThrow(/status/)
    await update(users.editor, m.id, { status: 'fact-check' })
    const p = await update(users.editor, m.id, { status: 'published' })
    expect(p.status).toBe('published')
  })

  it('запланований матеріал потребує дати в майбутньому і не видний до неї', async () => {
    const m = await makeMaterial(users.editor)
    await expect(
      update(users.editor, m.id, {
        status: 'scheduled',
        publishedAt: new Date(Date.now() - 1000).toISOString(),
      }),
    ).rejects.toThrow(/publishedAt/)
    await update(users.editor, m.id, {
      status: 'scheduled',
      publishedAt: new Date(Date.now() + 3600_000).toISOString(),
    })
    const anon = await payload.find({
      collection: 'materials',
      where: { id: { equals: m.id } },
      overrideAccess: false,
    })
    expect(anon.docs).toHaveLength(0)
  })

  it('military tech не публікується без чек-листа', async () => {
    const m = await makeMaterial(users.editor, {
      section: sectionIds.ukraine,
      rubric: rubricIds['ukraine/military-tech'],
    })
    await expect(update(users.editor, m.id, { status: 'published' })).rejects.toThrow(
      /militaryChecklist/,
    )
    const p = await update(users.editor, m.id, {
      status: 'published',
      militaryChecklist: { noLocations: true, noSpecs: true, noNonPublicData: true },
    })
    expect(p.status).toBe('published')
  })

  it('рубрика має належати розділу', async () => {
    await expect(
      makeMaterial(users.editor, { section: sectionIds.abroad, rubric: rubricIds['news/ukraine'] }),
    ).rejects.toThrow(/rubric/)
  })
})

describe('Перевірки', () => {
  const checkData = (): Partial<Material> => ({
    format: 'check',
    section: sectionIds.checks,
    rubric: rubricIds['checks/project-checks'],
  })

  it('редактор не публікує перевірку; головний — лише після перевірки фактів; історія вердикту пишеться', async () => {
    const m = await makeMaterial(users.editor, checkData())
    await update(users.editor, m.id, { status: 'fact-check' })
    await expect(update(users.editor, m.id, { status: 'published' })).rejects.toThrow(/status/)

    const p = await update(users['chief-editor'], m.id, {
      status: 'published',
      check: { verdict: 'questions' },
    })
    expect(p.status).toBe('published')
    expect(p.check?.verdictHistory).toHaveLength(1)
    expect(p.check?.verdictHistory?.[0].verdict).toBe('questions')

    // Редактор не може змінити опубліковану перевірку
    await expect(update(users.editor, m.id, { title: 'Інше' })).rejects.toThrow(/status/)

    const changed = await update(users['chief-editor'], m.id, {
      check: { verdict: 'high-risk', verdictChangeNote: 'Нові дані з реєстру' },
    })
    expect(changed.check?.verdictHistory).toHaveLength(2)
    expect(changed.check?.verdictHistory?.[1].note).toBe('Нові дані з реєстру')
  })
})

describe('Адреси та журнал', () => {
  it('зміна slug опублікованого матеріалу зберігає старий шлях для 301', async () => {
    const m = await makeMaterial(users.editor, { title: 'Стара назва' })
    await update(users.editor, m.id, { status: 'published' })
    const changed = await update(users.editor, m.id, { slug: 'nova-nazva' })
    expect(changed.previousPaths?.map((p) => p.path)).toContain('/ua/news/ukraine/stara-nazva')
  })

  it('публікація потрапляє в журнал дій', async () => {
    const m = await makeMaterial(users.editor, { title: 'Для журналу' })
    await update(users.editor, m.id, { status: 'published' })
    const log = await payload.find({
      collection: 'audit-log',
      where: { and: [{ docId: { equals: String(m.id) } }, { action: { equals: 'publish' } }] },
    })
    expect(log.docs).toHaveLength(1)
    expect(log.docs[0].user).toBeTruthy()
  })
})
