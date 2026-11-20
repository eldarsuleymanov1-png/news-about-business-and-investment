import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/lib/dictionary'
import { ErrorReporter } from './ErrorReporter'

/** Серверная обёртка: передаёт строки интерфейса в клиентский ErrorReporter. */
export function ErrorReport({ materialId, locale }: { materialId: number; locale: Locale }) {
  const { errorReport } = getDictionary(locale)
  return <ErrorReporter materialId={materialId} locale={locale} strings={errorReport} />
}
