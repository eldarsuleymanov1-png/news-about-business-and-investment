import type { CollectionConfig } from 'payload'
import { chiefOnly, editorialOnly, staffOnly } from '@/access/roles'

/** Сообщения читателей об ошибках (выделить текст → Ctrl+Enter). Создаются серверным обработчиком. */
export const ErrorReports: CollectionConfig = {
  slug: 'error-reports',
  labels: {
    singular: { uk: 'Повідомлення про помилку', en: 'Error report' },
    plural: { uk: 'Повідомлення про помилки', en: 'Error reports' },
  },
  admin: {
    useAsTitle: 'selectedText',
    defaultColumns: ['selectedText', 'material', 'status', 'createdAt'],
    group: { uk: 'Редакція', en: 'Newsroom' },
  },
  defaultSort: '-createdAt',
  access: { read: staffOnly, create: editorialOnly, update: editorialOnly, delete: chiefOnly },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { value: 'new', label: { uk: 'Нове', en: 'New' } },
        { value: 'fixed', label: { uk: 'Виправлено', en: 'Fixed' } },
        { value: 'not-an-error', label: { uk: 'Не помилка', en: 'Not an error' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'material',
      type: 'relationship',
      relationTo: 'materials',
      label: { uk: 'Матеріал', en: 'Material' },
    },
    { name: 'pageUrl', type: 'text', label: { uk: 'Сторінка', en: 'Page URL' } },
    {
      name: 'selectedText',
      type: 'textarea',
      required: true,
      label: { uk: 'Виділений текст', en: 'Selected text' },
    },
    { name: 'comment', type: 'textarea', label: { uk: 'Коментар читача', en: 'Reader comment' } },
    {
      name: 'email',
      type: 'email',
      label: { uk: 'Email (необовʼязково)', en: 'Email (optional)' },
    },
  ],
}
