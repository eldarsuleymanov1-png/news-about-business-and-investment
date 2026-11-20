import { rssResponse } from '@/lib/rss'

export const revalidate = 600

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return rssResponse(lang)
}
