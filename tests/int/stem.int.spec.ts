import { describe, expect, it } from 'vitest'
import { stemWord } from '@/lib/stem'

describe('stemWord', () => {
  it.each([
    ['склади', 'склад'],
    ['складів', 'склад'],
    ['складах', 'склад'],
    ['інвестиції', 'інвестиц'],
    ['інвестицій', 'інвестиц'],
    ['нерухомість', 'нерухоміст'],
    ['брокерів', 'брокер'],
  ])('%s → %s', (w, stem) => expect(stemWord(w)).toBe(stem))

  it('короткі й латинські слова не чіпає', () => {
    expect(stemWord('ОВДП')).toBe('овдп')
    expect(stemWord('Brave1')).toBe('brave1')
    expect(stemWord('НБУ')).toBe('нбу')
  })
})
