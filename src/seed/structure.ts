/** Разделы и рубрики из ТЗ (раздел 3). */
export const structure = [
  {
    slug: 'ukraine',
    title: { uk: 'Інвестиції в Україну', en: 'Investing in Ukraine' },
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
    rubrics: [
      { slug: 'ukraine', uk: 'Україна: економіка, НБУ, закони', en: 'Ukraine: economy, NBU, laws' },
      { slug: 'world', uk: 'Світ: ринки, ставки, угоди', en: 'World: markets, rates, deals' },
      { slug: 'startups', uk: 'Стартапи та відкриття', en: 'Startups & openings' },
      { slug: 'digest', uk: 'Дайджест тижня', en: 'Weekly digest' },
    ],
  },
]
