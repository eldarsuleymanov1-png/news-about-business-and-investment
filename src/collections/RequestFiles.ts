import type { CollectionConfig } from 'payload'
import { chiefOnly, staffOnly } from '@/access/roles'

export const REQUEST_FILE_MAX_BYTES = 10 * 1024 * 1024

/**
 * Файлы, приложенные читателями к заявке «Перевірте проєкт». Закрыты от публики.
 * Создаются только серверным обработчиком формы (local API).
 */
export const RequestFiles: CollectionConfig = {
  slug: 'request-files',
  labels: {
    singular: { uk: 'Файл заявки', en: 'Request file' },
    plural: { uk: 'Файли заявок', en: 'Request files' },
  },
  admin: { group: { uk: 'Перевірки', en: 'Checks' }, hidden: ({ user }) => !user },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: chiefOnly },
  fields: [],
  upload: {
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },
  hooks: {
    beforeValidate: [
      ({ req, data }) => {
        if (req.file && req.file.size > REQUEST_FILE_MAX_BYTES) {
          throw new Error('Файл більший за 10 МБ')
        }
        return data
      },
    ],
  },
}
