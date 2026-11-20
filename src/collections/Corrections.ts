import type { CollectionConfig } from 'payload'
import { anyone, chiefOnly } from '@/access/roles'

/** Публичный журнал исправлений: дата, материал, что исправлено. Ведёт главный редактор. */
export const Corrections: CollectionConfig = {
  slug: 'corrections',
  labels: {
    singular: { uk: 'Виправлення', en: 'Correction' },
    plural: { uk: 'Журнал виправлень', en: 'Corrections log' },
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['date', 'material', 'summary'],
    group: { uk: 'Редакція', en: 'Newsroom' },
  },
  defaultSort: '-date',
  access: { read: anyone, create: chiefOnly, update: chiefOnly, delete: chiefOnly },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: { uk: 'Дата', en: 'Date' },
    },
    {
      name: 'material',
      type: 'relationship',
      relationTo: 'materials',
      required: true,
      label: { uk: 'Матеріал', en: 'Material' },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: 'Що виправлено', en: 'What was corrected' },
    },
    {
      name: 'details',
      type: 'textarea',
      localized: true,
      label: { uk: 'Подробиці', en: 'Details' },
    },
    {
      name: 'errorReport',
      type: 'relationship',
      relationTo: 'error-reports',
      label: { uk: 'Повідомлення читача', en: 'Reader report' },
      admin: { position: 'sidebar' },
    },
  ],
}
