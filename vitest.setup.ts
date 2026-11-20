// Загружаем .env, затем направляем тесты в отдельную базу
import 'dotenv/config'

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
} else if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL)
  url.pathname = `${url.pathname}_test`
  process.env.DATABASE_URL = url.toString()
}
