/**
 * Транслитерация украинского текста латиницей для URL.
 * Основа — официальная таблица транслитерации (постанова КМУ № 55 від 27.01.2010),
 * упрощённая для адресов: только [a-z0-9-].
 */
const MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',
  "'": '',
  '’': '',
  ʼ: '',
  // русские буквы на случай цитат и имён
  ё: 'io',
  ы: 'y',
  э: 'e',
  ъ: '',
}

// В начале слова є, ї, й, ю, я передаются иначе
const WORD_START: Record<string, string> = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' }

export function slugify(input: string, maxLength = 80): string {
  const lower = input.toLowerCase().replace(/зг/g, 'zgh')
  let out = ''
  let prevIsLetter = false
  for (const ch of lower) {
    const isLetter = /[\p{L}'’ʼ]/u.test(ch)
    if (!prevIsLetter && WORD_START[ch]) out += WORD_START[ch]
    else if (ch in MAP) out += MAP[ch]
    else out += ch
    prevIsLetter = isLetter
  }
  return out
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}
