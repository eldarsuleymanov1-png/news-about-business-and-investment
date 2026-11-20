/**
 * Пересоздаёт тестовую базу перед интеграционными тестами — иначе после изменения схемы
 * синхронизация Payload останавливается на интерактивном вопросе (rename/create).
 * Берёт DATABASE_URL (или TEST_DATABASE_URL) из .env; тестовая база = <имя>_test.
 */
import 'dotenv/config'
import pg from 'pg'

const source = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
if (!source) throw new Error('DATABASE_URL не задан')
const url = new URL(source)
const dbName = process.env.TEST_DATABASE_URL ? url.pathname.slice(1) : `${url.pathname.slice(1)}_test`
if (!dbName.endsWith('_test')) throw new Error(`Отказ: база ${dbName} не похожа на тестовую`)

url.pathname = '/postgres'
const client = new pg.Client({ connectionString: url.toString() })
await client.connect()
await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
await client.query(`CREATE DATABASE "${dbName}"`)
await client.end()
console.log(`test db ${dbName} recreated`)
