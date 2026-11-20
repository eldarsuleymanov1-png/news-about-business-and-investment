import type { CollectionConfig } from 'payload'
import { adminOnly, chiefOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { materialEditor } from '@/fields/richText'

/**
 * Служебные страницы (ТЗ, 3 и 9): «Про нас», «Редакційна політика», «Як ми перевіряємо проєкти»,
 * «Реклама і партнерство», «Контакти», политики. Адрес: /ua/<slug>.
 * Тексты политик готовит юрист, редакция вставляет их сюда.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { uk: 'Службова сторінка', en: 'Page' },
    plural: { uk: 'Службові сторінки', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'footerGroup', 'published'],
    group: { uk: 'Контент', en: 'Content' },
  },
  versions: { maxPerDoc: 50 },
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
    create: chiefOnly,
    update: chiefOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: 'Заголовок', en: 'Title' },
    },
    {
      ...slugField({ unique: true }),
      admin: {
        position: 'sidebar',
        description: {
          uk: 'Не повинна збігатися з адресою розділу (ukraine, abroad, checks, news)',
          en: 'Must not clash with a section slug',
        },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      label: { uk: 'Опубліковано', en: 'Published' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'footerGroup',
      type: 'select',
      label: { uk: 'Показувати в підвалі', en: 'Footer column' },
      options: [
        { value: 'about', label: { uk: 'Про видання', en: 'About' } },
        { value: 'partners', label: { uk: 'Партнерам і правове', en: 'Partners & legal' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'footerOrder',
      type: 'number',
      defaultValue: 0,
      label: { uk: 'Порядок у підвалі', en: 'Footer order' },
      admin: { position: 'sidebar' },
    },
    { name: 'lead', type: 'textarea', localized: true, label: { uk: 'Вступ', en: 'Intro' } },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: materialEditor,
      label: { uk: 'Текст', en: 'Body' },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: { uk: 'Редакція від', en: 'Last reviewed' },
      admin: {
        description: { uk: 'Дата чинної редакції документа (для політик)', en: 'For policies' },
      },
    },
  ],
}
