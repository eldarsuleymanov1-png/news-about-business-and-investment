import { rssResponse } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; section: string }> },
) {
  const { lang, section } = await params
  return rssResponse(lang, section)
}
