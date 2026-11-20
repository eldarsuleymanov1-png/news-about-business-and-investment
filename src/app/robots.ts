import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/urls'

export default function robots(): MetadataRoute.Robots {
  // На превью-деплоях Vercel индексация запрещена полностью
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/ua/search', '/en/search', '/ua/for/', '/en/for/'],
    },
    sitemap: [`${siteUrl()}/sitemap.xml`, `${siteUrl()}/news-sitemap.xml`],
  }
}
