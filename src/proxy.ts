import { NextResponse, type NextRequest } from 'next/server'
import { defaultUrlPrefix } from '@/i18n/config'

/**
 * 1. Корень сайта ведёт на украинскую версию (по умолчанию по закону о языке).
 *    Язык браузера намеренно не учитываем: украинская версия — основная.
 * 2. Передаёт путь запроса в заголовке x-pathname — нужен странице 404, чтобы выбрать язык.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultUrlPrefix}`
    return NextResponse.redirect(url, 308)
  }
  const headers = new Headers(request.headers)
  headers.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  // Админка, API, статика и файлы — без прокси
  matcher: ['/((?!admin|api|_next|favicon.ico|robots.txt|sitemap|.*\\.[a-z0-9]+$).*)'],
}
