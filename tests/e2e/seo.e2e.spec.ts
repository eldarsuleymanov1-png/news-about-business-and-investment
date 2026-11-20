import { expect, test } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('SEO', () => {
  test('robots.txt закриває адмінку й посилається на sitemap', async ({ request }) => {
    const body = await (await request.get(`${BASE}/robots.txt`)).text()
    expect(body).toContain('Disallow: /admin')
    expect(body).toContain('/sitemap.xml')
    expect(body).toContain('/news-sitemap.xml')
  })

  test('sitemap.xml містить головні обох мов з hreflang', async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`)
    expect(res.status()).toBe(200)
    const xml = await res.text()
    expect(xml).toContain(`${BASE}/ua</loc>`)
    expect(xml).toContain('hreflang="en"')
  })

  test('Google News sitemap валідний XML', async ({ request }) => {
    const res = await request.get(`${BASE}/news-sitemap.xml`)
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain(
      'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
    )
  })

  test('RSS розділу є, неіснуючого розділу — 404', async ({ request }) => {
    const ok = await request.get(`${BASE}/ua/checks/rss.xml`)
    expect(ok.status()).toBe(200)
    expect(ok.headers()['content-type']).toContain('application/rss+xml')
    expect((await request.get(`${BASE}/ua/nope/rss.xml`)).status()).toBe(404)
  })

  test('головна має Organization і WebSite у JSON-LD', async ({ page }) => {
    await page.goto(`${BASE}/ua`)
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = blocks.flatMap((b) =>
      [JSON.parse(b)].flat().map((x: { '@type': string }) => x['@type']),
    )
    expect(types).toEqual(expect.arrayContaining(['NewsMediaOrganization', 'WebSite']))
  })
})
