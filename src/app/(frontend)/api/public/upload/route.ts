import { MAX_FILE_BYTES, saveLocalFile, usesS3 } from '@/lib/server/privateFiles'
import { verifyToken } from '@/lib/server/token'

/**
 * Приём файла заявки в локальном режиме (без R2). С R2 браузер грузит файлы прямо в бакет,
 * и этот маршрут отключён. Разрешение — подписанный токен на конкретный ключ, размер и тип.
 */
export async function POST(request: Request) {
  if (usesS3()) return new Response('Not found', { status: 404 })
  const token = new URL(request.url).searchParams.get('token') ?? ''
  const grant = verifyToken<{ key: string; size: number; type: string }>(token)
  if (!grant) return new Response('Forbidden', { status: 403 })

  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_FILE_BYTES || (declared && declared !== grant.size)) {
    return new Response('Payload too large', { status: 413 })
  }
  if ((request.headers.get('content-type') ?? '').split(';')[0] !== grant.type) {
    return new Response('Unsupported type', { status: 415 })
  }

  // Читаем поток с жёстким лимитом, не доверяя content-length
  const reader = request.body?.getReader()
  if (!reader) return new Response('Empty', { status: 400 })
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_FILE_BYTES || total > grant.size) {
      await reader.cancel()
      return new Response('Payload too large', { status: 413 })
    }
    chunks.push(value)
  }
  if (total === 0) return new Response('Empty', { status: 400 })
  await saveLocalFile(grant.key, Buffer.concat(chunks))
  return new Response(null, { status: 204 })
}
