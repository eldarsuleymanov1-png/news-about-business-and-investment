import type { CollectionConfig } from 'payload'
import { adminOnly, anyone } from '@/access/roles'
import { slugField } from '@/fields/slug'

/**
 * Четыре раздела сайта: /ukraine/, /abroad/, /checks/, /news/.
 * Slug раздела — часть URL, поэтому менять его может только администратор.
 */
export const Sections: CollectionConfig = {
  slug: 'sections',
  labels: {
    singular: { uk: 'Розділ', en: 'Section' },
    plural: { uk: 'Розділи', en: 'Sections' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    group: { uk: 'Структура', en: 'Structure' },
  },
  defaultSort: 'order',
  access: { read: anyone, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: 'Назва', en: 'Title' },
    },
    slugField({ unique: true }),
    {
      name: 'navTitle',
      type: 'text',
      localized: true,
      label: { uk: 'Коротка назва (компактна шапка)', en: 'Short title (compact header)' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { uk: 'Опис', en: 'Description' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { uk: 'Порядок', en: 'Order' },
      admin: { position: 'sidebar' },
    },
  ],
}
