import type { Block } from 'payload'

/** Врезка «Важно» */
export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    singular: { uk: 'Врізка «Важливо»', en: 'Callout' },
    plural: { uk: 'Врізки', en: 'Callouts' },
  },
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'important',
      options: [
        { value: 'important', label: { uk: 'Важливо', en: 'Important' } },
        {
          value: 'investor',
          label: { uk: 'Що це означає для інвестора', en: 'What it means for investors' },
        },
        { value: 'warning', label: { uk: 'Попередження', en: 'Warning' } },
      ],
    },
    { name: 'title', type: 'text', label: { uk: 'Заголовок', en: 'Title' } },
    { name: 'text', type: 'textarea', required: true, label: { uk: 'Текст', en: 'Text' } },
  ],
}

/** Вставка YouTube / X / Telegram */
export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: { uk: 'Вставка', en: 'Embed' }, plural: { uk: 'Вставки', en: 'Embeds' } },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: { uk: 'Посилання на допис / відео', en: 'Post / video URL' },
      validate: (value: unknown) =>
        /^https:\/\/(www\.)?(youtube\.com|youtu\.be|x\.com|twitter\.com|t\.me)\//.test(
          String(value ?? ''),
        ) || 'Підтримуються YouTube, X і Telegram',
    },
    { name: 'caption', type: 'text', label: { uk: 'Підпис', en: 'Caption' } },
  ],
}

/** Простой график из таблицы значений */
export const ChartBlock: Block = {
  slug: 'chart',
  labels: { singular: { uk: 'Графік', en: 'Chart' }, plural: { uk: 'Графіки', en: 'Charts' } },
  fields: [
    { name: 'title', type: 'text', required: true, label: { uk: 'Заголовок', en: 'Title' } },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'bar',
      options: [
        { value: 'bar', label: { uk: 'Стовпчики', en: 'Bar' } },
        { value: 'line', label: { uk: 'Лінія', en: 'Line' } },
      ],
    },
    { name: 'unit', type: 'text', label: { uk: 'Одиниця виміру', en: 'Unit' } },
    {
      name: 'points',
      type: 'array',
      minRows: 2,
      label: { uk: 'Значення', en: 'Data points' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
      ],
    },
    { name: 'source', type: 'text', label: { uk: 'Джерело даних', en: 'Data source' } },
  ],
}

/** Цитата спикера с подписью */
export const QuoteBlock: Block = {
  slug: 'pullquote',
  labels: { singular: { uk: 'Цитата', en: 'Quote' }, plural: { uk: 'Цитати', en: 'Quotes' } },
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { name: 'author', type: 'text' },
    { name: 'role', type: 'text' },
  ],
}

export const contentBlocks = [CalloutBlock, EmbedBlock, ChartBlock, QuoteBlock]
