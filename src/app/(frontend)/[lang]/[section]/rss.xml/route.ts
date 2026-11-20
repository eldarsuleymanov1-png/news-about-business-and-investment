import { rssResponse } from '@/lib/rss'

export const revalidate = 600

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; section: string }> },
) {
  const { lang, section } = await params
  return rssResponse(lang, section)
}
