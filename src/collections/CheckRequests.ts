import type { CollectionConfig } from 'payload'
import { chiefOnly, editorialOnly, staffOnly } from '@/access/roles'

/**
 * Заявки читателей «Перевірте проєкт». Публичная форма (src/actions/checkRequest.ts) создаёт их
 * через local API после проверки Cloudflare Turnstile; через публичный API создать заявку нельзя.
 * Файлы заявителя — в закрытом хранилище (src/lib/server/privateFiles.ts), скачивание — только сотрудникам.
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
      name: 'attachments',
      type: 'array',
      label: { uk: 'Файли від заявника', en: 'Attachments' },
      maxRows: 5,
      admin: {
        readOnly: true,
        description: {
          uk: 'Файли зберігаються закрито. Відкривайте з обережністю — їх надіслав невідомий читач.',
          en: 'Stored privately. Open with care — sent by an unknown reader.',
        },
        components: { RowLabel: '@/components/admin/AttachmentRowLabel#AttachmentRowLabel' },
      },
      fields: [
        { name: 'name', type: 'text', required: true, label: { uk: 'Назва', en: 'Name' } },
        { name: 'key', type: 'text', required: true, admin: { hidden: true } },
        { name: 'size', type: 'number', label: { uk: 'Розмір, байт', en: 'Size, bytes' } },
        { name: 'mimeType', type: 'text', label: { uk: 'Тип', en: 'Type' } },
        {
          name: 'uploaded',
          type: 'checkbox',
          defaultValue: false,
          label: { uk: 'Завантажено', en: 'Uploaded' },
        },
      ],
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
