import { notFound } from 'next/navigation'
import { localeFromPrefix, type Locale } from '@/i18n/config'

/** Строки интерфейса сайта. Тексты материалов и служебных страниц живут в CMS. */
const dict = {
  uk: {
    subscribe: 'Підписатися',
    search: 'Пошук',
    sections: 'Розділи',
    home: 'Головна',
    showFor: 'Показати для:',
    audienceAll: 'Усім',
    latestNews: 'Останні новини',
    topNews: 'Головні новини',
    allNews: 'Усі новини →',
    checks: 'Перевірки',
    checksIntro:
      'Перевіряємо компанії та проєкти за відкритою методологією: реєстри, власники, ліцензії, обіцяна дохідність.',
    submitProject: 'Надіслати проєкт на перевірку',
    checkedOn: 'Перевірено',
    criteriaCount: (n: number) => `${n} ${plural(n, 'критерій', 'критерії', 'критеріїв')}`,
    minRead: (n: number) => `${n} хв`,
    minReadLong: (n: number) => `${n} хв читання`,
    published: 'Опубліковано',
    updated: 'Оновлено',
    yesterday: 'Вчора',
    photo: 'Фото',
    tldr: 'Коротко',
    toc: 'Зміст',
    sources: 'Джерела',
    readAlso: 'Читайте також',
    related: 'Повʼязані матеріали',
    investorTakeaway: 'Що це означає для інвестора',
    verifiedAt: 'Перевірено на',
    caseStudy: { invested: 'Вкладено', term: 'Термін', result: 'Результат' },
    interviewee: 'Співрозмовник',
    shareTelegram: 'Поділитися в Telegram',
    shareLinkedIn: 'Поділитися в LinkedIn',
    shareFacebook: 'Поділитися у Facebook',
    copyLink: 'Скопіювати посилання',
    copied: 'Посилання скопійовано',
    // Перевірки
    check: 'Перевірка',
    verdict: 'Вердикт',
    legalEntity: 'Юрособа',
    edrpou: 'Код ЄДРПОУ',
    country: 'Країна реєстрації',
    website: 'Сайт',
    howWeCheck: 'Як ми перевіряємо проєкти →',
    criteria: 'Критерії перевірки',
    companyResponse: 'Відповідь компанії',
    requestSent: 'Запит надіслано:',
    status: 'Статус:',
    replyStatus: {
      pending: 'чекаємо відповіді',
      responded: 'компанія відповіла',
      'no-response': 'не відповіли',
    },
    replyNote:
      'Якщо компанія відповість, ми опублікуємо її позицію тут і за потреби переглянемо вердикт. Компанія може оскаржити висновки, написавши редакції.',
    verdictHistory: 'Історія вердикту',
    publishedWithVerdict: (v: string) => `Опубліковано, вердикт «${v}»`,
    verdictChanged: (v: string) => `Вердикт змінено на «${v}»`,
    evidence: 'Документи та докази',
    doubtTitle: 'Сумніваєтесь у проєкті?',
    doubtText:
      'Надішліть нам назву і посилання. Ми перевіримо за тією ж методологією і повідомимо вас про результат.',
    checkDisclaimer:
      'Перевірка відображає дані, доступні на дату публікації, і не є інвестиційною порадою. Факти підтверджено документами; оцінки позначено як оцінки редакції.',
    // Реклама
    advertising: 'Реклама',
    partner: 'Партнерський матеріал',
    sponsor: 'Замовник',
    // Підписка
    digestTitle: 'Дайджест тижня',
    digestText:
      'Щопʼятниці: головні новини, нові перевірки і що це означає для ваших грошей. Без реклами сумнівних проєктів.',
    digestShort: 'Головне за тиждень щопʼятниці на пошту.',
    email: 'Електронна пошта',
    interests: 'Що вам цікаво (необовʼязково)',
    consent: 'Погоджуюсь на обробку персональних даних згідно з',
    privacyPolicy: 'політикою конфіденційності',
    subscribeOk: 'Майже готово! Перевірте пошту й підтвердьте підписку.',
    subscribeErrEmail: 'Вкажіть коректну електронну пошту.',
    subscribeErrConsent: 'Потрібна згода на обробку даних.',
    subscribeErr: 'Не вдалося оформити підписку. Спробуйте пізніше.',
    // Списки
    filters: 'Фільтри',
    format: 'Формат',
    audience: 'Аудиторія',
    rubric: 'Рубрика',
    all: 'Усі',
    apply: 'Показати',
    reset: 'Скинути',
    prev: '← Новіші',
    next: 'Старіші →',
    pageOf: (p: number, t: number) => `Сторінка ${p} з ${t}`,
    noMaterials: 'Тут поки немає матеріалів.',
    // Пошук
    searchTitle: 'Пошук',
    searchPlaceholder: 'Що шукаємо?',
    searchSection: 'Розділ',
    dateFrom: 'Від',
    dateTo: 'До',
    found: (n: number) => `Знайдено: ${n}`,
    nothingFound: 'Нічого не знайдено. Спробуйте інші слова.',
    // Автори, виправлення
    team: 'Редакція',
    authorMaterials: 'Матеріали автора',
    expertise: 'Експертиза',
    corrections: 'Виправлення',
    correctionsIntro: 'Публічний журнал виправлень: дата, матеріал і що саме виправлено.',
    noCorrections: 'Виправлень поки немає.',
    // Підвал
    footerAbout: 'Про видання',
    footerPartners: 'Партнерам',
    footerDisclaimer:
      'Матеріали сайту не є інвестиційною порадою. Рішення про інвестиції ви приймаєте самостійно.',
    errorReport: {
      button: 'Повідомити про помилку',
      hint: 'Або виділіть текст і натисніть Ctrl+Enter.',
      title: 'Повідомити про помилку',
      selected: 'Фрагмент з помилкою',
      comment: 'Що не так',
      commentHint: 'Якщо знаєте, як правильно, — напишіть і, бажано, дайте джерело.',
      email: 'Електронна пошта (необовʼязково, щоб ми могли уточнити)',
      send: 'Надіслати',
      cancel: 'Скасувати',
      thanks: 'Дякуємо! Редакція перевірить і, якщо треба, виправить. Виправлення публікуємо в журналі.',
      errText: 'Виділіть фрагмент або опишіть помилку.',
      errCaptcha: 'Підтвердіть, що ви не робот, і спробуйте ще раз.',
      errServer: 'Не вдалося надіслати. Спробуйте пізніше.',
    },
    checkRequest: {
      title: 'Перевірте проєкт',
      intro:
        'Сумніваєтесь у компанії чи інвестиційному проєкті? Надішліть назву й посилання — ми перевіримо за відкритою методологією і повідомимо вас про результат. Ми не розкриваємо, хто надіслав запит.',
      projectName: 'Назва проєкту або компанії',
      url: 'Посилання на сайт або сторінку',
      urlHint: 'Сайт, сторінка в соцмережах або Telegram-канал проєкту.',
      description: 'Що вас насторожило',
      descriptionHint: 'Що обіцяють, скільки просять вкласти, як ви дізналися про проєкт.',
      files: 'Файли (необовʼязково)',
      filesHint:
        'До 5 файлів, кожен до 10 МБ: договори, скриншоти, листування. PDF, зображення, Word, Excel.',
      email: 'Ваша електронна пошта',
      emailHint: 'Лише щоб повідомити результат. Не публікуємо й не передаємо.',
      consent: 'Погоджуюсь на обробку персональних даних згідно з',
      privacyPolicy: 'політикою конфіденційності',
      submit: 'Надіслати на перевірку',
      sending: 'Надсилаємо…',
      uploading: 'Завантажуємо файли: {done} з {total}',
      success: 'Дякуємо! Заявку отримано. Ми напишемо вам, коли перевірка буде готова.',
      successFilesFailed:
        'Заявку отримано, але не всі файли завантажилися. Якщо вони важливі, надішліть їх у відповідь на наш лист.',
      fileTooBig: 'Кожен файл — до 10 МБ.',
      tooManyFiles: 'Не більше 5 файлів.',
      howWeCheck: 'Як ми перевіряємо проєкти',
    },
    notFound: 'Сторінку не знайдено',
    notFoundText: 'Можливо, матеріал перенесли або видалили.',
    toHome: 'На головну',
  },
  en: {
    subscribe: 'Subscribe',
    search: 'Search',
    sections: 'Sections',
    home: 'Home',
    showFor: 'Show for:',
    audienceAll: 'Everyone',
    latestNews: 'Latest news',
    topNews: 'Top news',
    allNews: 'All news →',
    checks: 'Checks',
    checksIntro:
      'We check companies and projects using an open methodology: registries, owners, licences, promised returns.',
    submitProject: 'Send a project for checking',
    checkedOn: 'Checked',
    criteriaCount: (n: number) => `${n} criteria`,
    minRead: (n: number) => `${n} min`,
    minReadLong: (n: number) => `${n} min read`,
    published: 'Published',
    updated: 'Updated',
    yesterday: 'Yesterday',
    photo: 'Photo',
    tldr: 'In short',
    toc: 'Contents',
    sources: 'Sources',
    readAlso: 'Read also',
    related: 'Related',
    investorTakeaway: 'What it means for investors',
    verifiedAt: 'Verified as of',
    caseStudy: { invested: 'Invested', term: 'Term', result: 'Result' },
    interviewee: 'Interviewee',
    shareTelegram: 'Share on Telegram',
    shareLinkedIn: 'Share on LinkedIn',
    shareFacebook: 'Share on Facebook',
    copyLink: 'Copy link',
    copied: 'Link copied',
    check: 'Check',
    verdict: 'Verdict',
    legalEntity: 'Legal entity',
    edrpou: 'EDRPOU code',
    country: 'Country of registration',
    website: 'Website',
    howWeCheck: 'How we check projects →',
    criteria: 'Criteria',
    companyResponse: 'Company response',
    requestSent: 'Request sent:',
    status: 'Status:',
    replyStatus: {
      pending: 'awaiting reply',
      responded: 'company responded',
      'no-response': 'no response',
    },
    replyNote:
      'If the company responds, we will publish its position here and review the verdict if needed. The company may dispute the findings by writing to the newsroom.',
    verdictHistory: 'Verdict history',
    publishedWithVerdict: (v: string) => `Published, verdict “${v}”`,
    verdictChanged: (v: string) => `Verdict changed to “${v}”`,
    evidence: 'Documents and evidence',
    doubtTitle: 'Doubts about a project?',
    doubtText:
      'Send us the name and a link. We will check it with the same methodology and let you know the result.',
    checkDisclaimer:
      'This check reflects data available on the publication date and is not investment advice. Facts are backed by documents; opinions are marked as editorial assessments.',
    advertising: 'Advertising',
    partner: 'Partner content',
    sponsor: 'Sponsor',
    digestTitle: 'Weekly digest',
    digestText:
      'Every Friday: top news, new checks and what it means for your money. No ads for dubious projects.',
    digestShort: 'The week’s key stories every Friday.',
    email: 'Email',
    interests: 'Your interests (optional)',
    consent: 'I agree to the processing of personal data under the',
    privacyPolicy: 'privacy policy',
    subscribeOk: 'Almost done! Check your inbox and confirm your subscription.',
    subscribeErrEmail: 'Please enter a valid email.',
    subscribeErrConsent: 'Consent to data processing is required.',
    subscribeErr: 'Subscription failed. Please try again later.',
    filters: 'Filters',
    format: 'Format',
    audience: 'Audience',
    rubric: 'Rubric',
    all: 'All',
    apply: 'Show',
    reset: 'Reset',
    prev: '← Newer',
    next: 'Older →',
    pageOf: (p: number, t: number) => `Page ${p} of ${t}`,
    noMaterials: 'No materials yet.',
    searchTitle: 'Search',
    searchPlaceholder: 'What are you looking for?',
    searchSection: 'Section',
    dateFrom: 'From',
    dateTo: 'To',
    found: (n: number) => `Found: ${n}`,
    nothingFound: 'Nothing found. Try other words.',
    team: 'Newsroom',
    authorMaterials: 'Materials by the author',
    expertise: 'Expertise',
    corrections: 'Corrections',
    correctionsIntro: 'Public corrections log: date, material and what was corrected.',
    noCorrections: 'No corrections yet.',
    footerAbout: 'About',
    footerPartners: 'Partners',
    footerDisclaimer:
      'Content on this site is not investment advice. You make investment decisions yourself.',
    errorReport: {
      button: 'Report an error',
      hint: 'Or select text and press Ctrl+Enter.',
      title: 'Report an error',
      selected: 'Text with the error',
      comment: 'What is wrong',
      commentHint: 'If you know the correct version, write it and ideally give a source.',
      email: 'Email (optional, so we can follow up)',
      send: 'Send',
      cancel: 'Cancel',
      thanks: 'Thank you! The newsroom will check and correct it if needed. Corrections are published in the log.',
      errText: 'Select the text or describe the error.',
      errCaptcha: 'Please confirm you are not a robot and try again.',
      errServer: 'Could not send. Please try again later.',
    },
    checkRequest: {
      title: 'Check a project',
      intro:
        'Doubts about a company or an investment project? Send us the name and a link — we will check it using an open methodology and let you know the result. We never disclose who sent a request.',
      projectName: 'Project or company name',
      url: 'Link to the website or page',
      urlHint: 'Website, social media page or Telegram channel of the project.',
      description: 'What worried you',
      descriptionHint:
        'What they promise, how much they ask to invest, how you heard about the project.',
      files: 'Files (optional)',
      filesHint:
        'Up to 5 files, 10 MB each: contracts, screenshots, messages. PDF, images, Word, Excel.',
      email: 'Your email',
      emailHint: 'Only to tell you the result. Never published or shared.',
      consent: 'I agree to the processing of personal data under the',
      privacyPolicy: 'privacy policy',
      submit: 'Send for checking',
      sending: 'Sending…',
      uploading: 'Uploading files: {done} of {total}',
      success:
        'Thank you! We have received your request and will email you when the check is ready.',
      successFilesFailed:
        'We received your request, but not all files were uploaded. If they matter, reply to our email with them.',
      fileTooBig: 'Each file must be up to 10 MB.',
      tooManyFiles: 'No more than 5 files.',
      howWeCheck: 'How we check projects',
    },
    notFound: 'Page not found',
    notFoundText: 'The material may have been moved or removed.',
    toHome: 'Go to homepage',
  },
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export type Dictionary = (typeof dict)['uk']
export const getDictionary = (locale: Locale): Dictionary => dict[locale] as Dictionary

/** Язык из сегмента URL; для неизвестного префикса — 404. */
export function requireLocale(lang: string): Locale {
  const locale = localeFromPrefix(lang)
  if (!locale) notFound()
  return locale
}

const intlLocale = (locale: Locale) => (locale === 'uk' ? 'uk-UA' : 'en-GB')
const TZ = 'Europe/Kyiv'

export function formatDate(
  iso: string | null | undefined,
  locale: Locale,
  opts: { time?: boolean; year?: boolean } = {},
) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    ...(opts.year === false ? {} : { year: 'numeric' }),
    ...(opts.time ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: TZ,
  }).format(new Date(iso))
}

/** «11:20» для сегодняшних, «Вчора» для вчерашних, иначе «18 листопада». */
export function formatFeedTime(iso: string | null | undefined, locale: Locale) {
  if (!iso) return ''
  const d = new Date(iso)
  const day = (x: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(x)
  const now = new Date()
  if (day(d) === day(now)) {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: TZ,
    }).format(d)
  }
  if (day(d) === day(new Date(now.getTime() - 86_400_000))) return getDictionary(locale).yesterday
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    timeZone: TZ,
  }).format(d)
}

export function formatLongDate(date: Date, locale: Locale) {
  const s = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(date)
  return s.charAt(0).toUpperCase() + s.slice(1)
}
