/**
 * Демо-наполнение для локальной разработки и проверки вёрстки: `pnpm seed:demo`.
 * В продакшене не запускается. Тексты — условные примеры, не реальные факты.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { seedStructure } from './index'
import type { Material } from '@/payload-types'

if (process.env.NODE_ENV === 'production') {
  console.error('seed:demo не запускается в продакшене')
  process.exit(1)
}

// ------------------------------------------------------------- Lexical-хелперы

const text = (t: string, format = 0) => ({
  type: 'text',
  text: t,
  format,
  version: 1,
  detail: 0,
  mode: 'normal',
  style: '',
})
const para = (...parts: (string | ReturnType<typeof text>)[]) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: parts.map((p) => (typeof p === 'string' ? text(p) : p)),
})
const h = (tag: 'h2' | 'h3', t: string) => ({
  type: 'heading',
  tag,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [text(t)],
})
const cell = (t: string, header = false) => ({
  type: 'tablecell',
  version: 1,
  headerState: header ? 1 : 0,
  colSpan: 1,
  rowSpan: 1,
  backgroundColor: null,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [para(t)],
})
const table = (rows: string[][]) => ({
  type: 'table',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: rows.map((r, i) => ({
    type: 'tablerow',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: r.map((c) => cell(c, i === 0)),
  })),
})
let blockId = 0
const block = (blockType: string, fields: Record<string, unknown>) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: `demo${++blockId}`, blockName: '', blockType, ...fields },
})
type RichText = NonNullable<Material['content']>
const doc = (...children: unknown[]): RichText => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: children as RichText['root']['children'],
  },
})

const filler =
  'Цей абзац — приклад основного тексту. Редакція пояснює контекст: що змінилося на ринку, хто головні гравці і чому тема важлива саме зараз. Абзаци короткі, з посиланнями на першоджерела.'

// ------------------------------------------------------------- картинки-заглушки

async function placeholderImage(
  payload: Payload,
  name: string,
  from: string,
  to: string,
  alt: string,
) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`
  const data = await sharp(Buffer.from(svg)).png().toBuffer()
  return payload.create({
    collection: 'media',
    locale: 'uk',
    data: { alt, credit: 'Invest Venture (ілюстрація)', license: 'own' },
    file: { data, mimetype: 'image/png', name: `${name}.png`, size: data.length },
  })
}

// ------------------------------------------------------------- запуск

const payload = await getPayload({ config })
await seedStructure(payload)

const existing = await payload.count({ collection: 'materials' })
if (existing.totalDocs > 0) {
  payload.logger.info('Матеріали вже є — демо-наповнення пропущено')
  process.exit(0)
}

const sections = Object.fromEntries(
  (await payload.find({ collection: 'sections', limit: 10 })).docs.map((s) => [s.slug, s.id]),
)
const rubrics = Object.fromEntries(
  (await payload.find({ collection: 'rubrics', limit: 100, depth: 1 })).docs.map((r) => [
    `${typeof r.section === 'object' ? r.section.slug : ''}/${r.slug}`,
    r.id,
  ]),
)

await payload.updateGlobal({
  slug: 'site-settings',
  locale: 'uk',
  data: {
    siteName: 'Invest Venture',
    shortName: 'IV',
    publisher: { email: 'editor@example.com' },
  },
})

const imgs = await Promise.all([
  placeholderImage(payload, 'warehouse', '#C9D6CF', '#7E9C8C', 'Складський комплекс'),
  placeholderImage(payload, 'energy', '#E5DCC3', '#B59E5F', 'Сонячні панелі на даху'),
  placeholderImage(payload, 'city', '#CFD6E0', '#7D8DA6', 'Діловий район'),
  placeholderImage(payload, 'field', '#DDE5C8', '#94A86B', 'Поле'),
])

const [olena, ihor] = await Promise.all([
  payload.create({
    collection: 'authors',
    locale: 'uk',
    data: {
      name: 'Олена Коваль',
      position: 'Редакторка розділу «Інвестиції в Україну»',
      bio: 'Пише про нерухомість і ринок капіталу. Раніше — аналітикиня інвестиційної компанії.',
      expertise: ['Нерухомість', 'ОВДП', 'Фонди'],
      socials: [{ network: 'linkedin', url: 'https://www.linkedin.com/' }],
    },
  }),
  payload.create({
    collection: 'authors',
    locale: 'uk',
    data: {
      name: 'Ігор Мельник',
      position: 'Журналіст-розслідувач',
      bio: 'Перевіряє інвестиційні проєкти та фінансові схеми.',
    },
  }),
])

const company = await payload.create({
  collection: 'companies',
  data: {
    name: 'Онлайн-брокер «Приклад»',
    legalName: 'ТОВ «Приклад Інвест»',
    edrpou: '12345678',
    website: 'https://example.com',
  },
})

type Seed = Partial<Material> & {
  title: string
  section: number
  rubric: number
  daysAgo: number
  status?: Material['status']
}

const at = (daysAgo: number, hour = 10) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}

async function create(s: Seed) {
  const { daysAgo, status = 'published', ...data } = s
  const needsFactCheck = data.format === 'check' || data.format === 'analysis'
  const m = await payload.create({
    collection: 'materials',
    locale: 'uk',
    data: {
      authors: [olena.id],
      ...data,
      status: needsFactCheck ? 'fact-check' : status,
      publishedAt: at(daysAgo, 8 + (daysAgo % 9)),
    } as Material,
  })
  if (needsFactCheck) {
    return payload.update({ collection: 'materials', id: m.id, locale: 'uk', data: { status } })
  }
  return m
}

const analysis = await create({
  title: 'Склади на заході України: чому приватні інвестори повертаються в логістичну нерухомість',
  lead: 'Розбираємо, хто будує, на яких умовах заходять приватні інвестори і які ризики варто врахувати до підписання договору.',
  format: 'analysis',
  section: sections.ukraine,
  rubric: rubrics['ukraine/real-estate'],
  audience: ['in-ukraine', 'diaspora'],
  cover: imgs[0].id,
  daysAgo: 0,
  tldr: 'Попит на склади на заході країни зріс через релокацію бізнесу та логістику до кордону з ЄС.\nПриватний інвестор може зайти трьома способами: купити обʼєкт, взяти частку в проєкті або вкласти через фонд.\nГоловні ризики — права на землю, підключення до мереж і якість орендаря.',
  investorTakeaway:
    'Перед входом у проєкт перевірте права на землю й технічні умови на підключення, а договір оренди — на строк і штрафи за дострокове розірвання.',
  content: doc(
    h('h2', 'Що змінилося на ринку'),
    para(filler),
    para(filler),
    h('h2', 'Три способи увійти в проєкт'),
    para(
      'Кожен формат дає різний рівень контролю й ліквідності. Порівняння нижче — шаблон таблиці всередині матеріалу.',
    ),
    table([
      ['Формат', 'Поріг входу', 'Ліквідність', 'Контроль'],
      ['Купівля обʼєкта', 'Високий', 'Низька', 'Повний'],
      ['Частка в проєкті', 'Середній', 'Низька', 'Частковий'],
      ['Фонд нерухомості (ІСІ)', 'Будь-яка сума', 'Залежить від фонду', 'Немає'],
    ]),
    block('callout', {
      tone: 'important',
      title: 'Важливо',
      text: 'Договір оренди з якірним орендарем — головний актив складу. Без нього оцінка проєкту умовна.',
    }),
    h('h2', 'Ризики і як їх перевірити'),
    para(filler),
    block('chart', {
      title: 'Ставка оренди складів, $/м² на місяць',
      kind: 'bar',
      unit: '$',
      points: [
        { label: 'Київ', value: 6.5 },
        { label: 'Львів', value: 5.8 },
        { label: 'Ужгород', value: 5.2 },
      ],
      source: 'Умовні дані для прикладу',
    }),
    h('h2', 'Що це означає для інвестора'),
    para(filler),
  ),
  sources: [
    { title: 'Звіт про ринок складської нерухомості', url: 'https://example.com/report' },
    { title: 'Інтервʼю з девелопером, листопад 2026' },
  ],
})

const news = [
  ['Що означає рішення НБУ щодо облікової ставки для депозитів і ОВДП', 'news/ukraine', 0],
  ['Фонди нерухомості: тепер інвестувати можна з будь-якої суми', 'news/ukraine', 0],
  ['Оборонні стартапи: як працюють гранти Brave1', 'news/startups', 0],
  ['Ринки зранку: що рухає світові індекси цього тижня', 'news/world', 1],
  ['Рада розглядає зміни до регулювання ринку капіталу', 'news/ukraine', 1],
  ['ФРС і ЄЦБ: чого чекають ринки від рішень грудня', 'news/world', 2],
  ['Українська IT-компанія залучила раунд від європейського фонду', 'news/startups', 2],
] as const
for (const [title, rub, days] of news) {
  await create({
    title,
    lead: 'Коротко про головне: що сталося, чому це важливо і що змінюється для інвесторів.',
    format: 'news',
    section: sections.news,
    rubric: rubrics[rub],
    audience: ['in-ukraine'],
    daysAgo: days,
    content: doc(para(filler), para(filler)),
    investorTakeaway:
      'Два-три речення про те, що читачеві робити з цією інформацією і на що звернути увагу.',
    primarySourceUrl: 'https://bank.gov.ua/',
  })
}

await create({
  title: 'Власна генерація для підприємства: з чого почати і скільки це коштує',
  lead: 'Покроковий гайд для власників бізнесу: від аудиту споживання до підключення.',
  format: 'guide',
  section: sections.ukraine,
  rubric: rubrics['ukraine/energy'],
  cover: imgs[1].id,
  verifiedAt: at(1),
  audience: ['in-ukraine'],
  daysAgo: 1,
  content: doc(
    h('h2', 'Крок 1. Аудит споживання'),
    para(filler),
    h('h2', 'Крок 2. Вибір обладнання'),
    para(filler),
    h('h2', 'Крок 3. Підключення'),
    para(filler),
  ),
})
await create({
  title: 'Як іноземні фонди заходять в українські оборонні стартапи',
  lead: 'Які інструменти використовують фонди і що це означає для засновників.',
  format: 'analysis',
  section: sections.ukraine,
  rubric: rubrics['ukraine/military-tech'],
  militaryChecklist: { noLocations: true, noSpecs: true, noNonPublicData: true },
  audience: ['foreigners', 'diaspora'],
  daysAgo: 2,
  content: doc(para(filler), para(filler)),
})
await create({
  title: 'Переробка замість експорту сировини: історія одного заводу',
  lead: 'Скільки вклали, за який час окупилося і що пішло не за планом.',
  format: 'case',
  section: sections.ukraine,
  rubric: rubrics['ukraine/agro'],
  cover: imgs[3].id,
  caseStudy: { invested: '$2,4 млн', term: '3 роки', result: 'Окупність 18 %/рік' },
  daysAgo: 3,
  content: doc(para(filler), para(filler)),
})
for (const [title, rub, img] of [
  ['Польща чи Іспанія: де вигідніше купувати житло під оренду', 'abroad/real-estate', 2],
  [
    'Брокерський рахунок для українця: що обрати і як платити податки',
    'abroad/stock-markets',
    null,
  ],
  ['Контрольовані іноземні компанії: що треба задекларувати', 'abroad/taxes', null],
] as const) {
  await create({
    title,
    lead: 'Порівнюємо варіанти, витрати і податки для українців за кордоном.',
    format: 'guide',
    section: sections.abroad,
    rubric: rubrics[rub],
    cover: img === null ? undefined : imgs[img].id,
    audience: ['diaspora'],
    daysAgo: 2,
    content: doc(para(filler)),
  })
}

const criteria = (statuses: ('ok' | 'question' | 'violation')[]) =>
  (
    [
      'registration',
      'owners',
      'licenses',
      'regulator-lists',
      'promised-returns',
      'reporting',
      'court-cases',
    ] as const
  ).map((criterion, i) => ({
    criterion,
    status: statuses[i],
    comment: {
      registration: 'Юрособа є в ЄДР, адреса і керівник збігаються з даними на сайті.',
      owners: 'Бенефіціар — компанія з іншої юрисдикції, реальних власників не розкрито.',
      licenses: 'Проєкт пропонує послуги брокера, але ліцензії НКЦПФР немає.',
      'regulator-lists': 'Сайт проєкту є в списку попереджень НКЦПФР.',
      'promised-returns': 'Сайт гарантує фіксований дохід, що не притаманне ринковим інструментам.',
      reporting: 'Звітність за останній рік не опублікована.',
      'court-cases': 'Справ проти компанії в реєстрі судових рішень не знайдено.',
    }[criterion],
  }))

const checks: [
  string,
  NonNullable<Material['check']>['verdict'],
  ('ok' | 'question' | 'violation')[],
  number,
][] = [
  [
    'Онлайн-брокер «Приклад»: що ми знайшли',
    'fraud-signs',
    ['ok', 'question', 'violation', 'violation', 'violation', 'question', 'ok'],
    2,
  ],
  [
    'Будівельний фонд «Приклад»: перевірка',
    'questions',
    ['ok', 'question', 'ok', 'ok', 'question', 'question', 'ok'],
    6,
  ],
  [
    'Агрокооператив «Приклад»: перевірка',
    'no-risks',
    ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'],
    10,
  ],
]
for (const [title, verdict, statuses, days] of checks) {
  await create({
    title,
    lead: 'Короткий підсумок перевірки: що обіцяє проєкт, що показали реєстри та як компанія відповіла на наш запит.',
    format: 'check',
    section: sections.checks,
    rubric: rubrics['checks/project-checks'],
    authors: [ihor.id],
    daysAgo: days,
    check: {
      verdict,
      subject: {
        company: company.id,
        name: title.split(':')[0],
        legalEntity: 'ТОВ «Приклад Інвест»',
        edrpou: '12345678',
        country: 'Україна',
        website: 'https://example.com',
      },
      criteria: criteria(statuses),
      rightOfReply: { requestSentAt: at(days + 6), outcome: 'no-response' },
    },
    content: doc(
      h('h2', 'Що обіцяє проєкт'),
      para(filler),
      h('h2', 'Що показали реєстри'),
      para(filler),
    ),
    sources: [{ title: 'Єдиний державний реєстр', url: 'https://usr.minjust.gov.ua/' }],
    companies: [company.id],
  })
}

await payload.updateGlobal({ slug: 'homepage', data: { hero: analysis.id } })
payload.logger.info('Демо-наповнення готове')
process.exit(0)
