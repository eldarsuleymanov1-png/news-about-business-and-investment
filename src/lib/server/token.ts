import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Короткоживущие подписанные токены (HMAC на PAYLOAD_SECRET) — например, разрешение
 * загрузить конкретный файл к конкретной заявке. Не JWT: только то, что нужно.
 */
const secret = () => {
  const s = process.env.PAYLOAD_SECRET
  if (!s) throw new Error('PAYLOAD_SECRET не задан')
  return s
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url')

export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }))
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyToken<T extends Record<string, unknown>>(token: string): T | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest()
  const given = Buffer.from(sig, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString()) as T & { exp: number }
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null
    return data
  } catch {
    return null
  }
}
