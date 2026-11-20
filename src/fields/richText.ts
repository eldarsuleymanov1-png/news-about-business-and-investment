import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { contentBlocks } from '@/blocks'

/**
 * Редактор текста материала: стандартные возможности Lexical (абзацы, списки, ссылки, цитаты,
 * изображения) + таблицы и блоки «Важно», вставка, график, цитата спикера.
 */
export const materialEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => f.key !== 'heading'),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    FixedToolbarFeature(),
    EXPERIMENTAL_TableFeature(),
    BlocksFeature({ blocks: contentBlocks }),
  ],
})
