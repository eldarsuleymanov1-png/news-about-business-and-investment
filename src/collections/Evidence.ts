import type { CollectionConfig } from 'payload'
import { chiefOnlyField, editorialOnly, isStaff, nobody } from '@/access/roles'

/**
 * Документы-доказательства к проверкам: скриншоты, выписки, переписка.
 * Хранятся закрыто; на сайт попадают только те, что главный редактор отметил как публичные.
 * Удаление запрещено: по ТЗ (9) доказательства хранятся не менее 3 лет.
 */
export const Evidence: CollectionConfig = {
  slug: 'evidence',
  labels: {
    singular: { uk: 'Доказ', en: 'Evidence' },
    plural: { uk: 'Докази (перевірки)', en: 'Evidence (checks)' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'company', 'collectedAt', 'isPublic'],
    group: { uk: 'Перевірки', en: 'Checks' },
  },
  access: {
    read: ({ req }) => (isStaff(req.user) ? true : { isPublic: { equals: true } }),
    create: editorialOnly,
    update: editorialOnly,
    delete: nobody,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: { uk: 'Назва', en: 'Title' } },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      label: { uk: 'Компанія', en: 'Company' },
    },
    {
      name: 'collectedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: { uk: 'Дата фіксації', en: 'Collected at' },
    },
    { name: 'sourceUrl', type: 'text', label: { uk: 'Звідки (URL)', en: 'Source URL' } },
    { name: 'notes', type: 'textarea', label: { uk: 'Нотатки', en: 'Notes' } },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      label: { uk: 'Показувати на сайті', en: 'Show on site' },
      access: { update: chiefOnlyField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'retainUntil',
      type: 'date',
      label: { uk: 'Зберігати до', en: 'Retain until' },
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (value) return value
            const base = siblingData?.collectedAt ? new Date(siblingData.collectedAt) : new Date()
            base.setFullYear(base.getFullYear() + 3)
            return base.toISOString()
          },
        ],
      },
    },
  ],
  upload: {
    // Файлы отдаются только через API с проверкой доступа
    mimeTypes: ['image/*', 'application/pdf', 'text/plain', 'message/rfc822'],
  },
}
