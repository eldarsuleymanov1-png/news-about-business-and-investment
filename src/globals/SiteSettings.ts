import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/roles'

/** Общие настройки сайта и выходные данные издания (ТЗ, 9). */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { uk: 'Налаштування сайту', en: 'Site settings' },
  admin: { group: { uk: 'Налаштування', en: 'Settings' } },
  access: { read: () => true, update: adminOnly },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'InvestNews',
      localized: true,
      label: { uk: 'Назва видання', en: 'Publication name' },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      label: { uk: 'Підзаголовок', en: 'Tagline' },
    },
    {
      name: 'disclaimerShort',
      type: 'textarea',
      localized: true,
      required: true,
      defaultValue:
        'Матеріал має інформаційний характер і не є інвестиційною рекомендацією. Рішення про інвестиції ви ухвалюєте самостійно.',
      label: { uk: 'Короткий дисклеймер (в кінці розборів і перевірок)', en: 'Short disclaimer' },
    },
    {
      name: 'publisher',
      type: 'group',
      label: { uk: 'Вихідні дані', en: 'Imprint' },
      fields: [
        { name: 'owner', type: 'text', label: { uk: 'Власник', en: 'Owner' } },
        {
          name: 'chiefEditor',
          type: 'text',
          label: { uk: 'Головний редактор', en: 'Editor-in-chief' },
        },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'address', type: 'textarea', label: { uk: 'Адреса', en: 'Address' } },
        {
          name: 'mediaRegistration',
          type: 'text',
          label: { uk: 'Ідентифікатор в Реєстрі субʼєктів у сфері медіа', en: 'Media register ID' },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: { uk: 'Соцмережі', en: 'Social' },
      fields: [
        { name: 'telegram', type: 'text', label: 'Telegram' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
        { name: 'facebook', type: 'text', label: 'Facebook' },
        { name: 'x', type: 'text', label: 'X' },
      ],
    },
  ],
}
