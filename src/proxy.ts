import { NextResponse, type NextRequest } from 'next/server'
import { defaultUrlPrefix } from '@/i18n/config'

/**
 * Корень сайта ведёт на украинскую версию (по умолчанию по закону о языке).
 * Язык браузера намеренно не учитываем: украинская версия — основная.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultUrlPrefix}`
  return NextResponse.redirect(url, 308)
}

export const config = { matcher: ['/'] }
