import type { CollectionConfig } from 'payload'
import { anyone, chiefOnly, editorialOnly } from '@/access/roles'
import { slugField } from '@/fields/slug'

/**
 * Компания / проект. Основа будущего каталога проектов (ТЗ, раздел 10):
 * все материалы и проверки о компании ссылаются на эту запись.
 */
export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: {
    singular: { uk: 'Компанія / проєкт', en: 'Company / project' },
    plural: { uk: 'Компанії та проєкти', en: 'Companies & projects' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'edrpou', 'industry', 'country'],
    group: { uk: 'Структура', en: 'Structure' },
  },
  access: { read: anyone, create: editorialOnly, update: editorialOnly, delete: chiefOnly },
  fields: [
    { name: 'name', type: 'text', required: true, label: { uk: 'Назва', en: 'Name' } },
    slugField({ from: 'name', unique: true }),
    { name: 'legalName', type: 'text', label: { uk: 'Юридична особа', en: 'Legal entity' } },
    {
      name: 'edrpou',
      type: 'text',
      index: true,
      label: { uk: 'Код ЄДРПОУ', en: 'EDRPOU code' },
      validate: (value: unknown) =>
        !value || /^\d{8}$/.test(String(value)) || 'Код ЄДРПОУ — 8 цифр',
    },
    {
      name: 'registrationNumber',
      type: 'text',
      label: { uk: 'Реєстраційний номер (іноземна компанія)', en: 'Registration number (foreign)' },
    },
    { name: 'industry', type: 'text', label: { uk: 'Галузь', en: 'Industry' } },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'regions',
      filterOptions: { kind: { equals: 'country' } },
      label: { uk: 'Країна реєстрації', en: 'Country of registration' },
    },
    { name: 'website', type: 'text', label: { uk: 'Сайт', en: 'Website' } },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { uk: 'Короткий опис', en: 'Short description' },
    },
    {
      name: 'materials',
      type: 'join',
      collection: 'materials',
      on: 'companies',
      label: { uk: 'Матеріали про компанію', en: 'Materials about the company' },
    },
  ],
}
