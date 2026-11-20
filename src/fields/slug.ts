import type { TextField } from 'payload'
import { slugify } from '@/utils/slugify'

type Options = {
  /** Поле, из которого генерируется slug, если редактор его не заполнил. */
  from?: string
  localized?: boolean
  unique?: boolean
}

/**
 * Поле slug: генерируется из заголовка транслитерацией, редактор может поправить вручную.
 */
export const slugField = ({
  from = 'title',
  localized = false,
  unique = false,
}: Options = {}): TextField => ({
  name: 'slug',
  type: 'text',
  label: { uk: 'Адреса (slug)', en: 'Slug' },
  index: true,
  unique,
  localized,
  admin: {
    position: 'sidebar',
    description: {
      uk: 'Латиниця, цифри та дефіс. Якщо залишити порожнім — створиться із заголовка.',
      en: 'Latin letters, digits and hyphens. Generated from the title if left empty.',
    },
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[from]
        if (typeof source === 'string' && source.trim()) return slugify(source)
        return value
      },
    ],
  },
  validate: (value: unknown) => {
    if (value == null || value === '') return true
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value)) || 'Тільки a-z, 0-9 і дефіс'
  },
})
