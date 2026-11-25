import { createLocalReq, getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { seedStructure } from '@/seed'
import { buildTelegramPost, postMaterialToTelegram } from '@/lib/server/telegram'
import type { Material, User } from '@/payload-types'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

let payload: Payload
let editor: User
let author: User
let check: Material

const tgOk = () =>
  new Response(
    JSON.stringify({ ok: true, result: { message_id: 42, chat: { username: 'investventure' } } }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

beforeAll(async () => {
  process.env.TELEGRAM_BOT_TOKEN = 'test-token'
  process.env.TELEGRAM_CHANNEL_ID = '@investventure'
  payload = await getPayload({ config: await config })
  await seedStructure(payload)
  const mk = async (role: User['role']) =>
    payload
      .create({
        collection: 'users',
        data: { email: `tg-${role}-${Date.now()}@test.local`, password: 'test-password-123', role },
      })
      .then((u) =>
        u.role === role ? u : payload.update({ collection: 'users', id: u.id, data: { role } }),
      )
  editor = await mk('editor')
  author = await mk('author')
  const chief = await mk('chief-editor')
  const section = (
    await payload.find({ collection: 'sections', where: { slug: { equals: 'checks' } } })
  ).docs[0]
  const rubric = (
    await payload.find({ collection: 'rubrics', where: { slug: { equals: 'project-checks' } } })
  ).docs[0]
  const a = await payload.create({
    collection: 'authors',
    data: { name: `TG автор ${Date.now()}` },
  })
  const draft = await payload.create({
    collection: 'materials',
    data: {
      title: 'Брокер «A&B» <обіцяє> 40%',
      lead: 'Лід перевірки',
      format: 'check',
      status: 'fact-check',
      authors: [a.id],
      section: section.id,
      rubric: rubric.id,
      sponsorship: { isSponsored: false },
    } as Material,
  })
  check = await payload.update({
    collection: 'materials',
    id: draft.id,
    user: chief,
    overrideAccess: false,
    data: { status: 'published', check: { verdict: 'fraud-signs' } },
  })
})

afterAll(() => vi.restoreAllMocks())

describe('Telegram', () => {
  it('текст: екранований HTML, UTM, мітка реклами', () => {
    const { text, link } = buildTelegramPost(
      {
        ...check,
        sponsorship: { isSponsored: true, label: 'advertising', sponsorName: 'ТОВ X' },
      } as Material,
      'https://example.com/ua/a',
    )
    expect(text).toContain('<b>Брокер «A&amp;B» &lt;обіцяє&gt; 40%</b>')
    expect(text.startsWith('Реклама · ТОВ X')).toBe(true)
    expect(link).toContain('utm_source=telegram')
  })

  it('автор не може надсилати', async () => {
    const req = await createLocalReq({ user: { ...author, collection: 'users' } }, payload)
    const r = await postMaterialToTelegram(payload, check.id, req)
    expect(r).toMatchObject({ ok: false, status: 403 })
  })

  it('редактор надсилає опубліковану перевірку; повтор — лише з force', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => tgOk())
    const req = await createLocalReq({ user: { ...editor, collection: 'users' } }, payload)
    const r = await postMaterialToTelegram(payload, check.id, req)
    expect(r).toMatchObject({ ok: true, messageUrl: 'https://t.me/investventure/42' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/bottest-token\/sendMessage$/)
    expect(JSON.parse(String(init?.body))).toMatchObject({
      chat_id: '@investventure',
      parse_mode: 'HTML',
    })

    const saved = await payload.findByID({ collection: 'materials', id: check.id })
    expect(saved.distribution?.telegramMessageUrl).toBe('https://t.me/investventure/42')
    expect(saved.status).toBe('published')

    expect(await postMaterialToTelegram(payload, check.id, req)).toMatchObject({
      ok: false,
      status: 409,
    })
    expect(await postMaterialToTelegram(payload, check.id, req, { force: true })).toMatchObject({
      ok: true,
    })
  })

  it('помилка Telegram не розкриває токен', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify({ ok: false, description: 'Bad Request: chat not found' })),
    )
    const req = await createLocalReq({ user: { ...editor, collection: 'users' } }, payload)
    const r = await postMaterialToTelegram(payload, check.id, req, { force: true })
    expect(r).toMatchObject({ ok: false, status: 502 })
    expect(JSON.stringify(r)).not.toContain('test-token')
  })
})
