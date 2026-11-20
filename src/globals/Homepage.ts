import type { GlobalConfig } from 'payload'
import { revalidateAll } from '@/hooks/revalidate'
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
  hooks: { afterChange: [revalidateAll] },
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
      admin: {
        description: {
          uk: 'Перетягуйте, щоб змінити порядок. Порожній список = порядок за замовчуванням, як у макеті.',
          en: 'Drag to reorder. Empty = default order from the design.',
        },
      },
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
                  value: 'hero',
                  label: { uk: 'Головний матеріал + стрічка новин', en: 'Lead story + news feed' },
                },
                {
                  value: 'section-grid',
                  label: { uk: 'Розділ: три картки', en: 'Section: three cards' },
                },
                {
                  value: 'section-list',
                  label: { uk: 'Розділ: список + головні новини', en: 'Section: list + top news' },
                },
                {
                  value: 'checks',
                  label: { uk: 'Останні перевірки (темний блок)', en: 'Latest checks (dark band)' },
                },
                {
                  value: 'subscribe',
                  label: { uk: 'Підписка на дайджест', en: 'Digest subscription' },
                },
              ],
            },
            {
              name: 'section',
              type: 'relationship',
              relationTo: 'sections',
              label: { uk: 'Розділ', en: 'Section' },
              admin: {
                condition: (_, s) => s?.kind === 'section-grid' || s?.kind === 'section-list',
              },
            },
            { name: 'hidden', type: 'checkbox', label: { uk: 'Приховати', en: 'Hide' } },
          ],
        },
      ],
    },
  ],
}
