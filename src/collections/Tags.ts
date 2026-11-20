import type { CollectionConfig } from 'payload'
import { anyone, chiefOnly, staffOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'

/** Свободные теги: компании, персоны, фонды, темы. */
export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: { uk: 'Тег', en: 'Tag' },
    plural: { uk: 'Теги', en: 'Tags' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'slug'],
    group: { uk: 'Структура', en: 'Structure' },
  },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: chiefOnly },
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
      name: 'kind',
      type: 'select',
      defaultValue: 'topic',
      label: { uk: 'Тип', en: 'Kind' },
      options: [
        { value: 'topic', label: { uk: 'Тема', en: 'Topic' } },
        { value: 'company', label: { uk: 'Компанія', en: 'Company' } },
        { value: 'person', label: { uk: 'Персона', en: 'Person' } },
        { value: 'fund', label: { uk: 'Фонд', en: 'Fund' } },
      ],
    },
  ],
}
