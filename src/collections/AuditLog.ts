import type { CollectionConfig } from 'payload'
import { chiefOnly, nobody } from '@/access/roles'

/**
 * Журнал действий: кто, что и когда создал, изменил, опубликовал или удалил (ТЗ, 6).
 * Записи создаются только хуком `auditLogHooks`, править и удалять их нельзя никому.
 */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: {
    singular: { uk: 'Запис журналу', en: 'Audit entry' },
    plural: { uk: 'Журнал дій', en: 'Audit log' },
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'user', 'action', 'collectionSlug', 'summary'],
    group: { uk: 'Налаштування', en: 'Settings' },
  },
  defaultSort: '-createdAt',
  access: { read: chiefOnly, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['create', 'update', 'publish', 'unpublish', 'status-change', 'delete'],
    },
    { name: 'collectionSlug', type: 'text', required: true },
    { name: 'docId', type: 'text', required: true },
    { name: 'summary', type: 'text' },
    { name: 'statusFrom', type: 'text' },
    { name: 'statusTo', type: 'text' },
  ],
}
