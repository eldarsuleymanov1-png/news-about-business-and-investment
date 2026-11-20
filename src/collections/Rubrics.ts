import type { CollectionConfig } from 'payload'
import { chiefOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'

/**
 * Рубрики (подтемы разделов). Редакция добавляет, переименовывает и скрывает их без программиста.
 */
export const Rubrics: CollectionConfig = {
  slug: 'rubrics',
  labels: {
    singular: { uk: 'Рубрика', en: 'Rubric' },
    plural: { uk: 'Рубрики', en: 'Rubrics' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'slug', 'hidden'],
    group: { uk: 'Структура', en: 'Structure' },
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (req.user ? true : { hidden: { not_equals: true } }),
    create: chiefOnly,
    update: chiefOnly,
    delete: chiefOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { uk: 'Назва', en: 'Title' },
    },
    slugField(),
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
      label: { uk: 'Розділ', en: 'Section' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { uk: 'Опис', en: 'Description' },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: { uk: 'Приховати на сайті', en: 'Hide on site' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'requiresMilitaryChecklist',
      type: 'checkbox',
      defaultValue: false,
      label: {
        uk: 'Чек-лист military tech перед публікацією',
        en: 'Military tech checklist before publishing',
      },
      admin: {
        position: 'sidebar',
        description: {
          uk: 'Перед публікацією редактор підтверджує: немає локацій виробництва, ТТХ і непублічних даних.',
          en: 'Editor must confirm: no production locations, specs or non-public data.',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { uk: 'Порядок', en: 'Order' },
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [
      // slug рубрики уникален в пределах раздела
      async ({ data, req, originalDoc }) => {
        if (!data?.slug) return data
        const section = data.section ?? originalDoc?.section
        const sectionId = typeof section === 'object' ? section?.id : section
        const { docs } = await req.payload.find({
          collection: 'rubrics',
          where: {
            and: [
              { slug: { equals: data.slug } },
              { section: { equals: sectionId } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          req,
        })
        if (docs.length) throw new Error(`Рубрика з адресою «${data.slug}» вже є в цьому розділі`)
        return data
      },
    ],
  },
}
