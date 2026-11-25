import type { CollectionConfig, Field, FieldAccess, Where } from 'payload'
import { ROLES, chiefOnly, hasRole, isChief, isEditorial, isStaff } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { materialEditor } from '@/fields/richText'
import { withAuditLog } from '@/hooks/auditLog'
import { enforceEditorialRules } from './hooks'
import { revalidateMaterial } from '@/hooks/revalidate'
import { postMaterialToTelegram } from '@/lib/server/telegram'
import {
  PUBLIC_STATUSES,
  audienceOptions,
  criterionOptions,
  criterionStatusOptions,
  formatOptions,
  statusOptions,
  verdictOptions,
} from './options'

const staffRead: FieldAccess = ({ req }) => isStaff(req.user)
const chiefUpdate: FieldAccess = ({ req }) => isChief(req.user)
const isFormat =
  (...formats: string[]) =>
  (data: Record<string, unknown>) =>
    formats.includes(String(data?.format))

const L = (uk: string, en: string) => ({ uk, en })

// ---------------------------------------------------------------------------
// Поля, специфичные для форматов (ТЗ, раздел 4)
// ---------------------------------------------------------------------------

const newsFields: Field[] = [
  {
    name: 'investorTakeaway',
    type: 'textarea',
    localized: true,
    label: L('Що це означає для інвестора', 'What it means for investors'),
    admin: { condition: isFormat('news') },
  },
  {
    name: 'primarySourceUrl',
    type: 'text',
    label: L('Першоджерело (URL)', 'Primary source URL'),
    admin: { condition: isFormat('news') },
  },
]

const analysisFields: Field[] = [
  {
    name: 'tldr',
    type: 'textarea',
    localized: true,
    label: L('Коротко (TL;DR)', 'TL;DR'),
    admin: {
      condition: isFormat('analysis'),
      description: L('Короткий висновок на початку розбору', 'Short conclusion at the top'),
    },
  },
  {
    name: 'showToc',
    type: 'checkbox',
    defaultValue: true,
    label: L('Показувати зміст', 'Show table of contents'),
    admin: { condition: isFormat('analysis', 'guide') },
  },
]

const guideFields: Field[] = [
  {
    name: 'verifiedAt',
    type: 'date',
    label: L('Перевірено на дату', 'Verified as of'),
    admin: { condition: isFormat('guide') },
  },
]

const caseFields: Field[] = [
  {
    name: 'caseStudy',
    type: 'group',
    label: L('Вкладено / термін / результат', 'Invested / term / result'),
    admin: { condition: isFormat('case') },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'invested', type: 'text', localized: true, label: L('Вкладено', 'Invested') },
          { name: 'term', type: 'text', localized: true, label: L('Термін', 'Term') },
          { name: 'result', type: 'text', localized: true, label: L('Результат', 'Result') },
        ],
      },
    ],
  },
]

const interviewFields: Field[] = [
  {
    name: 'interviewee',
    type: 'group',
    label: L('Співрозмовник', 'Interviewee'),
    admin: { condition: isFormat('interview') },
    fields: [
      { name: 'name', type: 'text', localized: true, label: L("Ім'я", 'Name') },
      { name: 'position', type: 'text', localized: true, label: L('Посада', 'Position') },
      { name: 'photo', type: 'upload', relationTo: 'media', label: L('Фото', 'Photo') },
    ],
  },
]

const digestFields: Field[] = [
  {
    name: 'digestItems',
    type: 'array',
    label: L('Пункти дайджесту', 'Digest items'),
    minRows: 0,
    maxRows: 10,
    admin: { condition: isFormat('digest') },
    fields: [
      {
        name: 'material',
        type: 'relationship',
        relationTo: 'materials',
        label: L('Матеріал', 'Material'),
      },
      { name: 'externalUrl', type: 'text', label: L('Або зовнішнє посилання', 'Or external link') },
      {
        name: 'headline',
        type: 'text',
        localized: true,
        label: L('Заголовок (якщо зовнішнє)', 'Headline (if external)'),
      },
      {
        name: 'comment',
        type: 'textarea',
        localized: true,
        required: true,
        label: L('Короткий коментар', 'Short comment'),
      },
    ],
  },
]

const checkFields: Field[] = [
  {
    name: 'check',
    type: 'group',
    label: L('Перевірка', 'Check'),
    admin: { condition: isFormat('check') },
    fields: [
      {
        name: 'verdict',
        type: 'select',
        options: verdictOptions,
        label: L('Вердикт', 'Verdict'),
        access: { create: chiefUpdate, update: chiefUpdate },
        admin: { description: L('Встановлює головний редактор', 'Set by the editor-in-chief') },
      },
      {
        name: 'verdictChangeNote',
        type: 'text',
        localized: true,
        label: L('Причина зміни вердикту', 'Reason for verdict change'),
        access: { update: chiefUpdate },
        admin: {
          description: L(
            'Потрапить в історію вердиктів, яку бачить читач',
            'Goes into the public verdict history',
          ),
        },
      },
      {
        name: 'subject',
        type: 'group',
        label: L('Обʼєкт перевірки', 'Subject'),
        fields: [
          {
            name: 'company',
            type: 'relationship',
            relationTo: 'companies',
            label: L('Компанія в базі', 'Company in database'),
          },
          {
            type: 'row',
            fields: [
              { name: 'name', type: 'text', label: L('Назва', 'Name') },
              { name: 'website', type: 'text', label: L('Сайт', 'Website') },
            ],
          },
          {
            type: 'row',
            fields: [
              { name: 'legalEntity', type: 'text', label: L('Юрособа', 'Legal entity') },
              { name: 'edrpou', type: 'text', label: L('Код ЄДРПОУ', 'EDRPOU') },
              { name: 'country', type: 'text', label: L('Країна реєстрації', 'Country') },
            ],
          },
        ],
      },
      {
        name: 'criteria',
        type: 'array',
        label: L('Чек-лист критеріїв', 'Criteria checklist'),
        defaultValue: criterionOptions.map((c) => ({ criterion: c.value, status: 'question' })),
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'criterion',
                type: 'select',
                required: true,
                options: criterionOptions,
                label: L('Критерій', 'Criterion'),
              },
              {
                name: 'status',
                type: 'select',
                required: true,
                options: criterionStatusOptions,
                label: L('Статус', 'Status'),
              },
            ],
          },
          {
            name: 'comment',
            type: 'textarea',
            localized: true,
            label: L('Що знайшли', 'Findings'),
          },
        ],
      },
      {
        name: 'rightOfReply',
        type: 'group',
        label: L('Запит на коментар', 'Request for comment'),
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'requestSentAt', type: 'date', label: L('Дата надсилання', 'Sent at') },
              {
                name: 'outcome',
                type: 'select',
                defaultValue: 'pending',
                label: L('Результат', 'Outcome'),
                options: [
                  { value: 'pending', label: L('Чекаємо відповіді', 'Awaiting reply') },
                  { value: 'responded', label: L('Компанія відповіла', 'Company responded') },
                  { value: 'no-response', label: L('Не відповіли', 'No response') },
                ],
              },
            ],
          },
          {
            name: 'response',
            type: 'textarea',
            localized: true,
            label: L('Відповідь компанії', 'Company response'),
          },
        ],
      },
      {
        name: 'verdictHistory',
        type: 'array',
        label: L('Історія вердикту', 'Verdict history'),
        admin: {
          readOnly: true,
          description: L(
            'Заповнюється автоматично при публікації та зміні вердикту',
            'Filled automatically',
          ),
        },
        fields: [
          { name: 'date', type: 'date', required: true },
          { name: 'verdict', type: 'select', options: verdictOptions, required: true },
          { name: 'note', type: 'text', localized: true },
        ],
      },
      {
        name: 'evidence',
        type: 'relationship',
        relationTo: 'evidence',
        hasMany: true,
        label: L('Докази', 'Evidence'),
        admin: {
          description: L(
            'На сайті показуються лише докази з позначкою «Показувати на сайті»',
            'Only evidence marked public is shown on the site',
          ),
        },
      },
    ],
  },
]

// ---------------------------------------------------------------------------

export const Materials: CollectionConfig = withAuditLog({
  slug: 'materials',
  labels: {
    singular: L('Матеріал', 'Material'),
    plural: L('Матеріали', 'Materials'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'format', 'section', 'status', 'publishedAt'],
    listSearchableFields: ['title', 'lead'],
    group: L('Контент', 'Content'),
    // Кнопка «Надіслати в Telegram» рядом с «Зберегти» — только когда бот настроен (TELEGRAM_BOT_TOKEN).
    // Решение владельца 25.11.2026: пока без Telegram.
    components: process.env.TELEGRAM_BOT_TOKEN
      ? { edit: { beforeDocumentControls: ['@/components/admin/TelegramButton#TelegramButton'] } }
      : undefined,
  },
  defaultSort: '-publishedAt',
  versions: { maxPerDoc: 100 },
  access: {
    // Читатель видит только опубликованное (и запланированное, когда наступила дата)
    read: ({ req }) => {
      if (isStaff(req.user)) return true
      const where: Where = {
        and: [
          { status: { in: PUBLIC_STATUSES } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      }
      return where
    },
    create: ({ req }) => isStaff(req.user),
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (isEditorial(user)) return true
      if (hasRole(user, ROLES.author)) {
        const where: Where = {
          and: [{ createdBy: { equals: user.id } }, { status: { in: ['draft', 'editing'] } }],
        }
        return where
      }
      if (hasRole(user, ROLES.adManager)) return { 'sponsorship.isSponsored': { equals: true } }
      return false
    },
    // Удаление только для главного редактора; обычный путь — статус «В архіві»
    delete: chiefOnly,
    readVersions: ({ req }) => isStaff(req.user),
  },
  endpoints: [
    {
      // POST /api/materials/:id/telegram — кнопка «Надіслати в Telegram»
      path: '/:id/telegram',
      method: 'post',
      handler: async (req) => {
        const id = Number(req.routeParams?.id)
        if (!Number.isInteger(id)) return Response.json({ error: 'Bad id' }, { status: 400 })
        const force = new URL(req.url ?? 'http://x').searchParams.get('force') === '1'
        const result = await postMaterialToTelegram(req.payload, id, req, { force })
        return result.ok
          ? Response.json(result)
          : Response.json({ error: result.error }, { status: result.status })
      },
    },
  ],
  hooks: {
    beforeChange: [enforceEditorialRules],
    afterChange: [revalidateMaterial],
  },
  fields: [
    // ---------------- Сайдбар ----------------
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: statusOptions,
      label: L('Статус', 'Status'),
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      label: L('Дата публікації', 'Published at'),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: L(
          'Для статусу «Заплановано» — час автоматичної публікації',
          'For “Scheduled”: auto-publish time',
        ),
      },
    },
    {
      name: 'contentUpdatedAt',
      type: 'date',
      label: L('Дата оновлення', 'Updated at'),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: L(
          'Показується читачу. Ставте при суттєвому оновленні',
          'Shown to readers on significant updates',
        ),
      },
    },
    slugField({ localized: true }),
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'news',
      options: formatOptions,
      label: L('Формат', 'Format'),
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sponsorship',
      type: 'group',
      label: L('Реклама', 'Advertising'),
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'isSponsored',
          type: 'checkbox',
          defaultValue: false,
          label: L('Рекламний / партнерський матеріал', 'Sponsored / partner content'),
        },
        {
          name: 'label',
          type: 'select',
          defaultValue: 'advertising',
          label: L('Позначка', 'Label'),
          options: [
            { value: 'advertising', label: L('Реклама', 'Advertising') },
            { value: 'partner', label: L('Партнерський матеріал', 'Partner content') },
          ],
          admin: { condition: (_, s) => Boolean(s?.isSponsored) },
        },
        {
          name: 'sponsorName',
          type: 'text',
          label: L('Замовник', 'Sponsor'),
          admin: { condition: (_, s) => Boolean(s?.isSponsored) },
        },
      ],
    },
    {
      name: 'militaryChecklist',
      type: 'group',
      label: L('Чек-лист military tech', 'Military tech checklist'),
      access: { read: staffRead },
      admin: {
        position: 'sidebar',
        description: L(
          'Обовʼязковий для рубрик military tech. Без нього матеріал не опублікується.',
          'Required for military tech rubrics.',
        ),
      },
      fields: [
        {
          name: 'noLocations',
          type: 'checkbox',
          label: L('Немає локацій виробництва', 'No production locations'),
        },
        {
          name: 'noSpecs',
          type: 'checkbox',
          label: L('Немає технічних характеристик', 'No technical specifications'),
        },
        {
          name: 'noNonPublicData',
          type: 'checkbox',
          label: L('Немає даних, які компанія не розкрила публічно', 'No non-public data'),
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: L('Створив', 'Created by'),
      access: { read: staffRead },
      admin: { position: 'sidebar', readOnly: true },
    },

    // ---------------- Основная часть ----------------
    {
      type: 'tabs',
      tabs: [
        {
          label: L('Текст', 'Content'),
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: L('Заголовок', 'Title'),
            },
            {
              name: 'lead',
              type: 'textarea',
              localized: true,
              maxLength: 300,
              label: L('Лід', 'Lead'),
              admin: { description: L('До 300 знаків', 'Up to 300 characters') },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cover',
                  type: 'upload',
                  relationTo: 'media',
                  label: L('Обкладинка', 'Cover'),
                },
                {
                  name: 'authors',
                  type: 'relationship',
                  relationTo: 'authors',
                  hasMany: true,
                  required: true,
                  label: L('Автори', 'Authors'),
                },
              ],
            },
            ...analysisFields,
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: materialEditor,
              label: L('Текст', 'Body'),
            },
            ...newsFields,
          ],
        },
        {
          label: L('Формат', 'Format fields'),
          description: L(
            'Поля залежать від обраного формату',
            'Fields depend on the selected format',
          ),
          fields: [
            ...checkFields,
            ...guideFields,
            ...caseFields,
            ...interviewFields,
            ...digestFields,
          ],
        },
        {
          label: L('Рубрикація', 'Taxonomy'),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'section',
                  type: 'relationship',
                  relationTo: 'sections',
                  required: true,
                  label: L('Розділ', 'Section'),
                },
                {
                  name: 'rubric',
                  type: 'relationship',
                  relationTo: 'rubrics',
                  required: true,
                  label: L('Рубрика', 'Rubric'),
                  filterOptions: ({ siblingData }) => {
                    const section = (siblingData as { section?: unknown })?.section
                    return section ? { section: { equals: section } } : true
                  },
                },
              ],
            },
            {
              name: 'audience',
              type: 'select',
              hasMany: true,
              options: audienceOptions,
              label: L('Аудиторія', 'Audience'),
            },
            {
              name: 'regions',
              type: 'relationship',
              relationTo: 'regions',
              hasMany: true,
              label: L('Країна / регіон', 'Country / region'),
            },
            {
              name: 'companies',
              type: 'relationship',
              relationTo: 'companies',
              hasMany: true,
              label: L('Компанії / проєкти', 'Companies / projects'),
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: L('Теги', 'Tags'),
            },
            {
              name: 'related',
              type: 'relationship',
              relationTo: 'materials',
              hasMany: true,
              label: L('Повʼязані матеріали', 'Related materials'),
            },
          ],
        },
        {
          label: L('Джерела', 'Sources'),
          fields: [
            {
              name: 'sources',
              type: 'array',
              label: L('Джерела', 'Sources'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: L('Назва', 'Title'),
                    },
                    { name: 'url', type: 'text', label: 'URL' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  label: 'Title',
                  admin: {
                    description: L(
                      'Якщо порожньо — заголовок матеріалу',
                      'Defaults to the headline',
                    ),
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  label: 'Description',
                  admin: { description: L('Якщо порожньо — лід', 'Defaults to the lead') },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: L('Картинка для соцмереж', 'Social image'),
                },
                { name: 'noindex', type: 'checkbox', defaultValue: false, label: 'noindex' },
              ],
            },
            {
              name: 'previousPaths',
              type: 'array',
              label: L('Старі адреси (301)', 'Previous paths (301)'),
              admin: {
                readOnly: true,
                description: L('Заповнюється автоматично при зміні адреси', 'Filled automatically'),
              },
              fields: [{ name: 'path', type: 'text', required: true }],
            },
          ],
        },
        {
          label: L('Поширення', 'Distribution'),
          fields: [
            {
              name: 'distribution',
              type: 'group',
              label: false,
              access: { read: staffRead },
              fields: [
                {
                  name: 'telegramPostedAt',
                  type: 'date',
                  label: L('Надіслано в Telegram', 'Posted to Telegram'),
                  admin: { readOnly: true },
                },
                {
                  name: 'telegramMessageUrl',
                  type: 'text',
                  label: L('Пост у Telegram', 'Telegram post'),
                  admin: { readOnly: true },
                },
                {
                  name: 'includeInDigest',
                  type: 'checkbox',
                  defaultValue: false,
                  label: L('Включити в наступний дайджест', 'Include in next digest'),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
