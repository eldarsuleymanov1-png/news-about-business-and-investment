/** Справочники материала. Значения (value) — стабильные ключи для БД и API, подписи — для людей. */

export const STATUSES = [
  'draft',
  'editing',
  'fact-check',
  'scheduled',
  'published',
  'archived',
] as const
export type MaterialStatus = (typeof STATUSES)[number]
/** Статусы, в которых материал виден читателю (запланированный — после наступления даты). */
export const PUBLIC_STATUSES: MaterialStatus[] = ['scheduled', 'published']

export const statusOptions = [
  { value: 'draft', label: { uk: 'Чернетка', en: 'Draft' } },
  { value: 'editing', label: { uk: 'На редагуванні', en: 'Editing' } },
  { value: 'fact-check', label: { uk: 'На перевірці фактів', en: 'Fact-check' } },
  { value: 'scheduled', label: { uk: 'Заплановано', en: 'Scheduled' } },
  { value: 'published', label: { uk: 'Опубліковано', en: 'Published' } },
  { value: 'archived', label: { uk: 'В архіві', en: 'Archived' } },
]

export const FORMATS = [
  'news',
  'analysis',
  'check',
  'guide',
  'case',
  'interview',
  'numbers',
  'digest',
] as const
export type MaterialFormat = (typeof FORMATS)[number]
/** Форматы, которые обязаны пройти этап проверки фактов (ТЗ, 6). */
export const FACT_CHECK_REQUIRED: MaterialFormat[] = ['check', 'analysis']
/** Форматы, в конце которых автоматически выводится дисклеймер (ТЗ, 9). */
export const DISCLAIMER_FORMATS: MaterialFormat[] = ['check', 'analysis']

export const formatOptions = [
  { value: 'news', label: { uk: 'Новина', en: 'News' } },
  { value: 'analysis', label: { uk: 'Розбір', en: 'Analysis' } },
  { value: 'check', label: { uk: 'Перевірка', en: 'Check' } },
  { value: 'guide', label: { uk: 'Гайд', en: 'Guide' } },
  { value: 'case', label: { uk: 'Кейс', en: 'Case' } },
  { value: 'interview', label: { uk: 'Інтервʼю', en: 'Interview' } },
  { value: 'numbers', label: { uk: 'Цифри', en: 'Numbers' } },
  { value: 'digest', label: { uk: 'Дайджест', en: 'Digest' } },
]

export const audienceOptions = [
  { value: 'in-ukraine', label: { uk: 'В Україні', en: 'In Ukraine' } },
  { value: 'diaspora', label: { uk: 'Діаспора', en: 'Diaspora' } },
  { value: 'foreigners', label: { uk: 'Іноземцям', en: 'Foreign investors' } },
]

export const VERDICTS = ['no-risks', 'questions', 'high-risk', 'fraud-signs'] as const
export type Verdict = (typeof VERDICTS)[number]

export const verdictOptions = [
  { value: 'no-risks', label: { uk: 'Ризиків не знайдено', en: 'No risks found' } },
  { value: 'questions', label: { uk: 'Є питання', en: 'Questions remain' } },
  { value: 'high-risk', label: { uk: 'Високий ризик', en: 'High risk' } },
  { value: 'fraud-signs', label: { uk: 'Ознаки шахрайства', en: 'Signs of fraud' } },
]

export const criterionOptions = [
  { value: 'registration', label: { uk: 'Реєстрація', en: 'Registration' } },
  { value: 'owners', label: { uk: 'Власники', en: 'Owners' } },
  { value: 'licenses', label: { uk: 'Ліцензії', en: 'Licenses' } },
  { value: 'regulator-lists', label: { uk: 'Списки регулятора', en: 'Regulator lists' } },
  { value: 'promised-returns', label: { uk: 'Обіцяна дохідність', en: 'Promised returns' } },
  { value: 'reporting', label: { uk: 'Звітність', en: 'Reporting' } },
  { value: 'court-cases', label: { uk: 'Судові справи', en: 'Court cases' } },
]

export const criterionStatusOptions = [
  { value: 'ok', label: { uk: 'Гаразд', en: 'OK' } },
  { value: 'question', label: { uk: 'Питання', en: 'Question' } },
  { value: 'violation', label: { uk: 'Порушення', en: 'Violation' } },
]
