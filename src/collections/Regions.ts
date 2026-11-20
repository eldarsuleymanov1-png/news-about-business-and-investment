import type { CollectionConfig } from 'payload'
import { anyone, chiefOnly, editorialOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'

/** Страны и регионы (для Украины — области). */
export const Regions: CollectionConfig = {
  slug: 'regions',
  labels: {
    singular: { uk: 'Країна / регіон', en: 'Country / region' },
    plural: { uk: 'Країни та регіони', en: 'Countries & regions' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'parent', 'slug'],
    group: { uk: 'Структура', en: 'Structure' },
  },
  access: { read: anyone, create: editorialOnly, update: editorialOnly, delete: chiefOnly },
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
      required: true,
      defaultValue: 'country',
      label: { uk: 'Тип', en: 'Kind' },
      options: [
        { value: 'country', label: { uk: 'Країна', en: 'Country' } },
        { value: 'region', label: { uk: 'Область / регіон', en: 'Region' } },
      ],
    },
    {
      name: 'isoCode',
      type: 'text',
      label: { uk: 'ISO-код країни', en: 'Country ISO code' },
      admin: { condition: (data) => data?.kind === 'country' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'regions',
      label: { uk: 'Країна', en: 'Country' },
      filterOptions: { kind: { equals: 'country' } },
      admin: { condition: (data) => data?.kind === 'region' },
    },
  ],
}
