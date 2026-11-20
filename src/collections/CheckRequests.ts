import type { CollectionConfig } from 'payload'
import { chiefOnly, editorialOnly, staffOnly } from '@/access/roles'

/**
 * Заявки читателей «Перевірте проєкт». Публичная форма создаёт их через серверный обработчик
 * (с проверкой Cloudflare Turnstile), напрямую через API создать заявку нельзя.
 */
export const CheckRequests: CollectionConfig = {
  slug: 'check-requests',
  labels: {
    singular: { uk: 'Заявка на перевірку', en: 'Check request' },
    plural: { uk: 'Заявки «Перевірте проєкт»', en: 'Check requests' },
  },
  admin: {
    useAsTitle: 'projectName',
    defaultColumns: ['projectName', 'status', 'assignee', 'createdAt'],
    group: { uk: 'Перевірки', en: 'Checks' },
  },
  defaultSort: '-createdAt',
  access: { read: staffOnly, create: editorialOnly, update: editorialOnly, delete: chiefOnly },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          label: { uk: 'Статус', en: 'Status' },
          options: [
            { value: 'new', label: { uk: 'Нова', en: 'New' } },
            { value: 'in-progress', label: { uk: 'В роботі', en: 'In progress' } },
            { value: 'published', label: { uk: 'Опубліковано', en: 'Published' } },
            { value: 'rejected', label: { uk: 'Відхилено', en: 'Rejected' } },
          ],
        },
        {
          name: 'assignee',
          type: 'relationship',
          relationTo: 'users',
          label: { uk: 'Виконавець', en: 'Assignee' },
        },
      ],
    },
    {
      name: 'projectName',
      type: 'text',
      required: true,
      label: { uk: 'Назва проєкту', en: 'Project name' },
    },
    { name: 'url', type: 'text', label: { uk: 'Посилання', en: 'Link' } },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: { uk: 'Опис', en: 'Description' },
    },
    {
      name: 'files',
      type: 'upload',
      relationTo: 'request-files',
      hasMany: true,
      maxRows: 5,
      label: { uk: 'Файли', en: 'Files' },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: { uk: 'Email заявника', en: 'Requester email' },
    },
    {
      name: 'locale',
      type: 'select',
      options: ['uk', 'en'],
      defaultValue: 'uk',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      label: { uk: 'Компанія в базі', en: 'Company in database' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'resultMaterial',
      type: 'relationship',
      relationTo: 'materials',
      label: { uk: 'Опублікована перевірка', en: 'Published check' },
      admin: { position: 'sidebar', condition: (data) => data?.status === 'published' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: { uk: 'Внутрішні нотатки', en: 'Internal notes' },
    },
  ],
}
