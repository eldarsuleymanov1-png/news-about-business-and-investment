import type { CollectionConfig } from 'payload'
import { anyone, editorialOnly, chiefOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'

/** Публичные профили авторов (страницы «Редакція»). */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: { uk: 'Автор', en: 'Author' },
    plural: { uk: 'Автори', en: 'Authors' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'slug'],
    group: { uk: 'Редакція', en: 'Newsroom' },
  },
  access: {
    read: anyone,
    create: editorialOnly,
    update: editorialOnly,
    delete: chiefOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: "Ім'я", en: 'Name' },
    },
    slugField({ from: 'name', unique: true }),
    { name: 'position', type: 'text', localized: true, label: { uk: 'Посада', en: 'Position' } },
    { name: 'photo', type: 'upload', relationTo: 'media', label: { uk: 'Фото', en: 'Photo' } },
    { name: 'bio', type: 'textarea', localized: true, label: { uk: 'Біографія', en: 'Bio' } },
    {
      name: 'expertise',
      type: 'text',
      hasMany: true,
      localized: true,
      label: { uk: 'Експертиза', en: 'Expertise' },
    },
    {
      name: 'socials',
      type: 'array',
      label: { uk: 'Соцмережі', en: 'Social links' },
      fields: [
        {
          name: 'network',
          type: 'select',
          required: true,
          options: ['linkedin', 'facebook', 'x', 'telegram', 'instagram', 'website'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
