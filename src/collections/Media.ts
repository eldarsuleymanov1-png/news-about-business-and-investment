import type { CollectionConfig } from 'payload'
import { anyone, chiefOnly, staffOnly } from '@/access/roles'

/**
 * Медиатека. Фото автоматически сжимаются в WebP, источник/автор фото обязателен (ТЗ, 6 и 9).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { uk: 'Медіафайл', en: 'Media' },
    plural: { uk: 'Медіатека', en: 'Media library' },
  },
  admin: { group: { uk: 'Контент', en: 'Content' } },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: chiefOnly },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: 'Опис зображення (alt)', en: 'Alt text' },
    },
    {
      name: 'credit',
      type: 'text',
      required: true,
      label: { uk: 'Джерело / автор фото', en: 'Source / photographer' },
    },
    {
      name: 'license',
      type: 'select',
      label: { uk: 'Ліцензія', en: 'License' },
      defaultValue: 'own',
      options: [
        { value: 'own', label: { uk: 'Власне фото', en: 'Own photo' } },
        { value: 'stock', label: { uk: 'Фотосток за ліцензією', en: 'Licensed stock' } },
        { value: 'press', label: { uk: 'Пресматеріали', en: 'Press materials' } },
        { value: 'cc', label: { uk: 'Creative Commons', en: 'Creative Commons' } },
      ],
    },
    { name: 'caption', type: 'text', localized: true, label: { uk: 'Підпис', en: 'Caption' } },
  ],
  upload: {
    mimeTypes: ['image/*'],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      {
        name: 'thumb',
        width: 400,
        height: 225,
        formatOptions: { format: 'webp', options: { quality: 78 } },
      },
      {
        name: 'card',
        width: 800,
        height: 450,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      { name: 'wide', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
  },
}
