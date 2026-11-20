import type { GlobalConfig } from 'payload'
import { chiefOnly } from '@/access/roles'

/**
 * Управление главной: главный материал дня, закреплённые материалы, порядок блоков (ТЗ, 5 и 6).
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { uk: 'Головна сторінка', en: 'Homepage' },
  admin: { group: { uk: 'Контент', en: 'Content' } },
  access: { read: () => true, update: chiefOnly },
  versions: { max: 50 },
  fields: [
    {
      name: 'hero',
      type: 'relationship',
      relationTo: 'materials',
      label: { uk: 'Головний матеріал дня', en: 'Lead story' },
      admin: {
        description: {
          uk: 'Якщо порожньо — останній опублікований розбір або перевірка',
          en: 'Falls back to the latest analysis or check',
        },
      },
    },
    {
      name: 'pinned',
      type: 'relationship',
      relationTo: 'materials',
      hasMany: true,
      maxRows: 4,
      label: { uk: 'Закріплені матеріали', en: 'Pinned materials' },
    },
    {
      name: 'blocks',
      type: 'array',
      label: { uk: 'Блоки головної (порядок)', en: 'Homepage blocks (order)' },
      defaultValue: [
        { kind: 'latest-news' },
        { kind: 'sections' },
        { kind: 'latest-checks' },
        { kind: 'subscribe' },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              type: 'select',
              required: true,
              label: { uk: 'Блок', en: 'Block' },
              options: [
                {
                  value: 'latest-news',
                  label: { uk: 'Стрічка останніх новин', en: 'Latest news feed' },
                },
                {
                  value: 'sections',
                  label: { uk: 'Блоки чотирьох розділів', en: 'Four sections' },
                },
                { value: 'section', label: { uk: 'Один розділ', en: 'Single section' } },
                { value: 'latest-checks', label: { uk: 'Останні перевірки', en: 'Latest checks' } },
                { value: 'subscribe', label: { uk: 'Форма підписки', en: 'Subscribe form' } },
              ],
            },
            {
              name: 'section',
              type: 'relationship',
              relationTo: 'sections',
              label: { uk: 'Розділ', en: 'Section' },
              admin: { condition: (_, s) => s?.kind === 'section' },
            },
            { name: 'hidden', type: 'checkbox', label: { uk: 'Приховати', en: 'Hide' } },
          ],
        },
      ],
    },
  ],
}
