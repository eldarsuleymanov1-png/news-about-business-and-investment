import { expect, test } from '@playwright/test'

test.describe('Публічна частина', () => {
  test('корінь веде на українську версію', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL(/\/ua$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
  })

  test('англійська версія має lang=en', async ({ page }) => {
    await page.goto('http://localhost:3000/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('невідома мовна версія — 404', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/ru')
    expect(res?.status()).toBe(404)
  })

  test('розділ відкривається і показує рубрики', async ({ page }) => {
    await page.goto('http://localhost:3000/ua/ukraine')
    await expect(page.locator('h1')).toHaveText('Інвестиції в Україну')
    await expect(page.getByRole('link', { name: 'Military tech' })).toBeVisible()
  })
})
