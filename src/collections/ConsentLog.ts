import type { CollectionConfig } from 'payload'
import { adminOnly, nobody } from '@/access/roles'

/**
 * Журнал согласий на cookies (ТЗ, 9; GDPR ст. 7(1) — доказательство согласия).
 * Без персональных данных: случайный идентификатор браузера, выбор, версия политики, время.
 * Записи создаёт только серверное действие; менять и удалять их нельзя (кроме администратора).
 */
export const ConsentLog: CollectionConfig = {
  slug: 'consent-log',
  labels: {
    singular: { uk: 'Згода на cookies', en: 'Cookie consent' },
    plural: { uk: 'Журнал згод на cookies', en: 'Cookie consent log' },
  },
  admin: {
    useAsTitle: 'consentId',
    defaultColumns: ['createdAt', 'consentId', 'analytics', 'policyVersion'],
    group: { uk: 'Налаштування', en: 'Settings' },
  },
  defaultSort: '-createdAt',
  access: { read: adminOnly, create: nobody, update: nobody, delete: adminOnly },
  fields: [
    {
      name: 'consentId',
      type: 'text',
      required: true,
      index: true,
      label: { uk: 'Ідентифікатор браузера', en: 'Browser ID' },
    },
    {
      name: 'analytics',
      type: 'checkbox',
      defaultValue: false,
      label: { uk: 'Аналітика', en: 'Analytics' },
    },
    {
      name: 'policyVersion',
      type: 'text',
      required: true,
      label: { uk: 'Версія політики', en: 'Policy version' },
    },
    { name: 'locale', type: 'text' },
    {
      name: 'action',
      type: 'select',
      options: ['accept-all', 'necessary-only', 'custom'],
      required: true,
    },
  ],
}
