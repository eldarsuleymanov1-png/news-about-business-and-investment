import { getPayloadClient } from '@/lib/payload'
import { readForStaff } from '@/lib/server/privateFiles'

/**
 * Скачивание закрытых файлов (вложения заявок) — только для вошедших сотрудников.
 * R2: редирект на подписанную ссылку на 5 минут; локально — отдаём файл.
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Unauthorized', { status: 401 })

  const key = (await params).key.map(decodeURIComponent).join('/')
  const name = key
    .split('/')
    .pop()!
    .replace(/^[0-9a-f-]{36}-/, '')
  const file = await readForStaff(key, name)
  if (!file) return new Response('Not found', { status: 404 })
  if ('redirect' in file) return Response.redirect(file.redirect, 302)
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  })
}
