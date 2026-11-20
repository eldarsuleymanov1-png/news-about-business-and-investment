/** Разделы и рубрики из ТЗ (раздел 3). */
export const structure = [
  {
    slug: 'ukraine',
    title: { uk: 'Інвестиції в Україну', en: 'Investing in Ukraine' },
    nav: { uk: 'Інвестиції в Україну', en: 'Ukraine' },
    rubrics: [
      { slug: 'real-estate', uk: 'Нерухомість', en: 'Real estate' },
      { slug: 'industry', uk: 'Промисловість і переробка', en: 'Industry & processing' },
      { slug: 'energy', uk: 'Енергетика', en: 'Energy' },
      { slug: 'tech', uk: 'Технології та стартапи', en: 'Tech & startups' },
      { slug: 'military-tech', uk: 'Military tech', en: 'Military tech', military: true },
      { slug: 'agro', uk: 'Агро', en: 'Agriculture' },
      { slug: 'recovery', uk: 'Відновлення та держпрограми', en: 'Recovery & state programmes' },
      { slug: 'financial-instruments', uk: 'Фінансові інструменти', en: 'Financial instruments' },
    ],
  },
  {
    slug: 'abroad',
    title: { uk: 'Інвестиції за кордоном', en: 'Investing abroad' },
    nav: { uk: 'За кордоном', en: 'Abroad' },
    rubrics: [
      { slug: 'real-estate', uk: 'Нерухомість за кордоном', en: 'Real estate abroad' },
      { slug: 'stock-markets', uk: 'Фондові ринки', en: 'Stock markets' },
      { slug: 'business', uk: 'Бізнес за кордоном', en: 'Business abroad' },
      { slug: 'residency', uk: 'Резидентство через інвестиції', en: 'Residency by investment' },
      { slug: 'taxes', uk: 'Податки та валютний контроль', en: 'Taxes & currency control' },
    ],
  },
  {
    slug: 'checks',
    title: { uk: 'Перевірки та викриття', en: 'Checks & investigations' },
    nav: { uk: 'Перевірки', en: 'Checks' },
    rubrics: [
      { slug: 'project-checks', uk: 'Перевірка проєктів', en: 'Project checks' },
      { slug: 'regulator-warnings', uk: 'Попередження регулятора', en: 'Regulator warnings' },
      { slug: 'fraud-schemes', uk: 'Схеми шахрайства', en: 'Fraud schemes' },
      { slug: 'reader-requests', uk: 'Перевірка на запит читачів', en: 'Reader requests' },
    ],
  },
  {
    slug: 'news',
    title: { uk: 'Головні новини', en: 'Top news' },
    nav: { uk: 'Новини', en: 'News' },
    rubrics: [
      { slug: 'ukraine', uk: 'Україна: економіка, НБУ, закони', en: 'Ukraine: economy, NBU, laws' },
      { slug: 'world', uk: 'Світ: ринки, ставки, угоди', en: 'World: markets, rates, deals' },
      { slug: 'startups', uk: 'Стартапи та відкриття', en: 'Startups & openings' },
      { slug: 'digest', uk: 'Дайджест тижня', en: 'Weekly digest' },
    ],
  },
]

/** Службові сторінки (ТЗ, 3). Створюються неопублікованими: тексти політик готує юрист. */
export const servicePages = [
  { slug: 'about', uk: 'Про нас', en: 'About us', group: 'about', order: 1 },
  {
    slug: 'editorial-policy',
    uk: 'Редакційна політика',
    en: 'Editorial policy',
    group: 'about',
    order: 3,
  },
  {
    slug: 'methodology',
    uk: 'Як ми перевіряємо проєкти',
    en: 'How we check projects',
    group: 'about',
    order: 4,
  },
  {
    slug: 'advertising',
    uk: 'Реклама і партнерство',
    en: 'Advertising & partnerships',
    group: 'partners',
    order: 1,
  },
  { slug: 'contacts', uk: 'Контакти', en: 'Contacts', group: 'partners', order: 2 },
  {
    slug: 'privacy',
    uk: 'Політика конфіденційності',
    en: 'Privacy policy',
    group: 'partners',
    order: 3,
  },
  { slug: 'terms', uk: 'Умови використання', en: 'Terms of use', group: 'partners', order: 4 },
  {
    slug: 'disclaimer',
    uk: 'Відмова від відповідальності',
    en: 'Disclaimer',
    group: 'partners',
    order: 5,
  },
] as const
