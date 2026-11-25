import { expect, test } from '@playwright/test'

/**
 * Публічна частина. Розраховано на базу після `pnpm seed` (розділи й рубрики);
 * з `pnpm seed:demo` додатково перевіряються матеріали.
 */
const BASE = 'http://localhost:3000'

test.describe('Публічна частина', () => {
  test('корінь веде на українську версію', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page).toHaveURL(/\/ua$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
    await expect(page.locator('.logo__name')).toHaveText('Invest Venture')
  })

  test('англійська версія має lang=en', async ({ page }) => {
    await page.goto(`${BASE}/en`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('невідома мовна версія — 404', async ({ page }) => {
    const res = await page.goto(`${BASE}/ru`)
    expect(res?.status()).toBe(404)
  })

  test('розділ показує рубрики і фільтри', async ({ page }) => {
    await page.goto(`${BASE}/ua/ukraine`)
    await expect(page.locator('h1')).toHaveText('Інвестиції в Україну')
    await expect(page.locator('.chips').getByRole('link', { name: 'Military tech' })).toBeVisible()
    await page.locator('select[name=format]').selectOption('guide')
    await page.getByRole('button', { name: 'Показати' }).click()
    await expect(page).toHaveURL(/format=guide/)
  })

  test('неопублікована службова сторінка — 404', async ({ page }) => {
    const res = await page.goto(`${BASE}/ua/privacy`)
    expect(res?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Сторінку не знайдено')
  })

  test('форма підписки не приймає адресу без згоди', async ({ page }) => {
    await page.goto(`${BASE}/ua`)
    const form = page.locator('form.subscribe-form--band')
    await form.locator('input[type=email]').fill('reader@example.com')
    await form.getByRole('button', { name: 'Підписатися' }).click()
    await expect(form.getByRole('alert')).toHaveText('Потрібна згода на обробку даних.')
    // Введена адреса не губиться після помилки
    await expect(form.locator('input[type=email]')).toHaveValue('reader@example.com')
  })

  test('пошук відкривається', async ({ page }) => {
    await page.goto(`${BASE}/ua/search?q=інвест`)
    await expect(page.locator('h1')).toHaveText('Пошук')
    await expect(page.getByText(/Знайдено: \d+/)).toBeVisible()
  })

  test('сторінки на телефоні без горизонтальної прокрутки', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } })
    const page = await ctx.newPage()
    for (const path of ['/ua', '/ua/ukraine', '/ua/checks', '/ua/authors', '/ua/search']) {
      await page.goto(`${BASE}${path}`)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(overflow, path).toBe(false)
    }
    await ctx.close()
  })
})
