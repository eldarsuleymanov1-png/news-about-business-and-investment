import { ValidationError, type CollectionBeforeChangeHook, type PayloadRequest } from 'payload'
import { ROLES, hasRole, isChief, isEditorial } from '@/access/roles'
import { FACT_CHECK_REQUIRED, PUBLIC_STATUSES, type MaterialStatus } from './options'
import { buildMaterialPath } from '@/utils/paths'
import type { Locale } from '@/i18n/config'

type Data = Record<string, any>

const fail = (path: string, message: string, req: PayloadRequest): never => {
  throw new ValidationError({ collection: 'materials', errors: [{ path, message }] }, req.t)
}

const isPublic = (s?: string | null) => Boolean(s && PUBLIC_STATUSES.includes(s as MaterialStatus))
const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: unknown }).id : v)

/**
 * Редакционные правила, которые нельзя обойти ни через админку, ни через API:
 *  - рекламный материал всегда с меткой и именем заказчика; рекламный менеджер метку не снимает;
 *  - автор и рекламный менеджер не публикуют;
 *  - «Перевірки» публикует и правит после публикации только главный редактор;
 *  - «Перевірки» и разборы публикуются только после этапа проверки фактов;
 *  - для рубрик military tech перед публикацией обязателен чек-лист;
 *  - история вердиктов и старые адреса (для 301) пополняются автоматически.
 */
export const enforceEditorialRules: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const user = req.user
  const prev: Data = operation === 'update' ? (originalDoc ?? {}) : {}
  const next: Data = { ...prev, ...data }
  const prevStatus: string | null = operation === 'update' ? prev.status : null
  const nextStatus: string = next.status
  const format: string = next.format

  // --- Кто создал материал ---
  // Поле только для чтения: на создании — текущий пользователь, дальше не меняется
  if (operation === 'create') data.createdBy = user?.id ?? data.createdBy
  else data.createdBy = idOf(prev.createdBy) ?? null

  // История вердиктов и старые адреса ведутся только этим хуком
  if (operation === 'update') {
    if (data.check) data.check.verdictHistory = prev.check?.verdictHistory ?? []
    data.previousPaths = prev.previousPaths ?? []
  } else {
    if (data.check) data.check.verdictHistory = []
    data.previousPaths = []
  }
  next.check = { ...(prev.check ?? {}), ...(data.check ?? {}) }
  next.previousPaths = data.previousPaths

  // --- Маркировка рекламы ---
  if (hasRole(user, ROLES.adManager)) {
    data.sponsorship = { ...(next.sponsorship ?? {}), isSponsored: true }
    next.sponsorship = data.sponsorship
  }
  if (prev.sponsorship?.isSponsored && !next.sponsorship?.isSponsored && !isChief(user)) {
    fail('sponsorship.isSponsored', 'Зняти позначку «Реклама» може лише головний редактор', req)
  }
  if (next.sponsorship?.isSponsored) {
    if (!next.sponsorship.label) fail('sponsorship.label', 'Оберіть тип позначки', req)
    if (!String(next.sponsorship.sponsorName ?? '').trim()) {
      fail('sponsorship.sponsorName', 'Для рекламного матеріалу обовʼязкова назва замовника', req)
    }
  }

  // --- Права на смену статуса ---
  const statusChanged = operation === 'create' || prevStatus !== nextStatus
  if (statusChanged && user) {
    if (
      hasRole(user, ROLES.author, ROLES.adManager) &&
      !['draft', 'editing'].includes(nextStatus)
    ) {
      fail('status', 'Ви можете лише зберегти чернетку або надіслати матеріал на редагування', req)
    }
  }

  // Опубликованную проверку меняет только главный редактор
  if (format === 'check' && isPublic(prevStatus) && user && !isChief(user)) {
    fail('status', 'Опубліковану перевірку може змінювати лише головний редактор', req)
  }

  // --- Публикация ---
  const goingPublic = isPublic(nextStatus) && !isPublic(prevStatus)
  if (goingPublic) {
    if (user && !isEditorial(user)) fail('status', 'Недостатньо прав для публікації', req)
    if (format === 'check' && user && !isChief(user)) {
      fail('status', 'Перевірки публікує лише головний редактор', req)
    }
    if (FACT_CHECK_REQUIRED.includes(format as never) && prevStatus !== 'fact-check') {
      fail('status', 'Цей формат публікується лише після етапу «На перевірці фактів»', req)
    }
    if (format === 'check' && !next.check?.verdict) fail('check.verdict', 'Вкажіть вердикт', req)

    const rubricId = idOf(next.rubric)
    if (rubricId) {
      const rubric = await req.payload.findByID({
        collection: 'rubrics',
        id: rubricId as number,
        depth: 0,
        req,
      })
      if (rubric?.requiresMilitaryChecklist) {
        const c = next.militaryChecklist ?? {}
        if (!c.noLocations || !c.noSpecs || !c.noNonPublicData) {
          fail('militaryChecklist', 'Пройдіть чек-лист military tech перед публікацією', req)
        }
      }
    }
  }

  if (nextStatus === 'scheduled') {
    if (!next.publishedAt || new Date(next.publishedAt) <= new Date()) {
      fail('publishedAt', 'Для запланованої публікації вкажіть дату в майбутньому', req)
    }
  }
  if (nextStatus === 'published' && !next.publishedAt) {
    data.publishedAt = new Date().toISOString()
    next.publishedAt = data.publishedAt
  }

  // --- Раздел и рубрика должны совпадать ---
  if (next.rubric && next.section) {
    const rubric = await req.payload.findByID({
      collection: 'rubrics',
      id: idOf(next.rubric) as number,
      depth: 0,
      req,
    })
    if (rubric && idOf(rubric.section) !== idOf(next.section)) {
      fail('rubric', 'Рубрика не належить обраному розділу', req)
    }
  }

  // --- История вердиктов (видна читателю) ---
  if (format === 'check' && isPublic(nextStatus) && next.check?.verdict) {
    const history: Data[] = [...(next.check.verdictHistory ?? [])]
    const last = history[history.length - 1]
    if (!last || last.verdict !== next.check.verdict) {
      history.push({
        date: new Date().toISOString(),
        verdict: next.check.verdict,
        note: next.check.verdictChangeNote || undefined,
      })
      data.check = { ...(next.check ?? {}), verdictHistory: history, verdictChangeNote: '' }
    }
  }

  // --- Старые адреса для 301-редиректа ---
  if (operation === 'update' && isPublic(prevStatus) && prev.slug) {
    const locale = (req.locale ?? 'uk') as Locale
    const [oldPath, newPath] = await Promise.all([
      buildMaterialPath(req.payload, prev, locale, req),
      buildMaterialPath(req.payload, next, locale, req),
    ])
    if (oldPath && newPath && oldPath !== newPath) {
      const list: Data[] = [...(next.previousPaths ?? [])]
      if (!list.some((p) => p.path === oldPath)) list.push({ path: oldPath })
      data.previousPaths = list
    }
  }

  return data
}
