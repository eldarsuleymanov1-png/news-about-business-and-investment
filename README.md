# EL Investments — онлайн-медіа про інвестиції та бізнес

Next.js (App Router) + Payload CMS 3 + PostgreSQL. Адмінка та сайт — один застосунок.
Повне ТЗ — [`docs/TZ.md`](docs/TZ.md), контекст для розробки — [`CLAUDE.md`](CLAUDE.md), макети — `design/`.

## Швидкий старт (локально)

Потрібно: Node.js 22+, pnpm 10, Docker.

```bash
cp .env.example .env            # заповніть PAYLOAD_SECRET: openssl rand -hex 32
docker compose up -d            # PostgreSQL + Meilisearch
pnpm install
pnpm seed                       # розділи, рубрики, службові сторінки
pnpm seed:demo                  # (необовʼязково) демо-матеріали для перегляду верстки
pnpm dev
```

- Сайт: http://localhost:3000 → перенаправляє на `/ua`
- Адмінка: http://localhost:3000/admin — перший зареєстрований користувач стає адміністратором.

У режимі розробки схема БД синхронізується автоматично (`push`). Для продакшену — лише міграції.

## Команди

| Команда | Що робить |
| --- | --- |
| `pnpm dev` | Сервер розробки |
| `pnpm build` / `pnpm start` | Продакшен-збірка та запуск |
| `pnpm seed` | Ідемпотентно створює розділи, рубрики й чернетки службових сторінок |
| `pnpm seed:demo` | Демо-матеріали, автори й перевірки на порожній базі (лише локально) |
| `pnpm migrate:create <name>` | Нова міграція після зміни колекцій |
| `pnpm migrate` | Застосувати міграції |
| `pnpm generate:types` | Оновити `src/payload-types.ts` |
| `pnpm generate:importmap` | Оновити import map адмінки (після додавання кастомних компонентів) |
| `pnpm test:int` | Інтеграційні тести редакційних правил (окрема БД `<назва>_test`) |
| `pnpm test:e2e` | Браузерні тести публічної частини |
| `pnpm lint`, `pnpm typecheck` | Перевірки коду |

Для інтеграційних тестів потрібна порожня база `investnews_test` (або змінна `TEST_DATABASE_URL`):

```bash
docker compose exec postgres createdb -U investnews investnews_test
```

## Зміна схеми даних

1. Змініть колекцію в `src/collections/…`.
2. `pnpm generate:types`
3. `pnpm migrate:create short-description` — закомітьте файл із `src/migrations/`.
4. У продакшені міграції застосовуються автоматично під час старту (`prodMigrations`).

> Не запускайте `pnpm start` (production) на базі, яку синхронізував `pnpm dev`: Payload зупиниться
> на інтерактивному питанні про міграції. Для продакшену база створюється лише міграціями.

## Деплой (Vercel — основний варіант)

1. Імпортуйте репозиторій у Vercel (обліковий запис — на власника). Framework: Next.js, команда збірки за замовчуванням.
2. PostgreSQL — керована база (Neon або Supabase, регіон ЄС). Рядок підключення — у `DATABASE_URL`.
3. Файли — Cloudflare R2: створіть бакет, ключ доступу та публічний домен (custom domain) → змінні `S3_*` і `S3_PUBLIC_URL`.
   Адмінка завантажує файли напряму в R2 (`clientUploads`), тож ліміт Vercel 4,5 МБ на запит не заважає.
4. Решта змінних — з `.env.example` (`PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `BEEHIIV_*`…).
5. Міграції застосовуються автоматично під час першого запиту до нового деплою (`prodMigrations`).
6. Домен підключіть через Cloudflare (DNS, WAF). Для `elinvestments.*` → CNAME на Vercel.

Сторінки кешуються (ISR): головна, матеріали, «Редакція», «Виправлення». Після збереження в адмінці кеш
потрібних сторінок скидається одразу (`src/hooks/revalidate.ts`). Стрічки розділів із фільтрами, сторінки
авторів і пошук рендеряться на кожен запит.

### Альтернатива: Docker / VPS

```bash
docker compose --profile app up --build
```

`Dockerfile` збирає standalone-образ Next.js; для збірки база не потрібна.

### Перевірка продакшен-режиму локально

Продакшен-режим не можна запускати на базі, яку синхронізував `pnpm dev`. Створіть окрему базу лише міграціями:

```bash
createdb investnews_prod
DATABASE_URL=postgres://…/investnews_prod pnpm migrate
DATABASE_URL=postgres://…/investnews_prod PAYLOAD_DB_PUSH=false pnpm seed:demo
DATABASE_URL=postgres://…/investnews_prod pnpm build && pnpm start
```

## Структура

```
src/
  access/roles.ts              ролі та функції доступу
  collections/                 колекції Payload
    Materials/                 матеріал: поля, довідники (options.ts), редакційні правила (hooks.ts)
  globals/                     «Головна сторінка», «Налаштування сайту»
  blocks/                      блоки редактора: «Важливо», вставка, графік, цитата
  hooks/auditLog.ts            журнал дій
  i18n/config.ts               мовні версії: URL-префікс ua ↔ код uk
  seed/                        розділи й рубрики з ТЗ, демо-наповнення
  components/templates/        шаблони сторінок: головна, матеріал, перевірка
  actions/                     серверні дії (підписка Beehiiv)
  migrations/                  міграції БД
  app/(frontend)/[lang]/…      публічний сайт
  app/(payload)/…              адмінка та API (генерується Payload)
  components/, lib/            компоненти й дані сайту
tests/int/                     правила редакції (реклама, права, перевірки, 301, журнал)
tests/e2e/                     публічна частина
```

## Редакційні правила в коді

Перевіряються на сервері (`src/collections/Materials/hooks.ts`) — їх не обійти ні з адмінки, ні через API:

- рекламний матеріал завжди має позначку та замовника; рекламний менеджер не може її зняти;
- автор і рекламний менеджер не публікують — лише надсилають на редагування;
- «Перевірки» публікує й змінює після публікації лише головний редактор;
- «Перевірки» та розбори — лише після статусу «На перевірці фактів»;
- рубрики military tech — обовʼязковий чек-лист перед публікацією;
- історія вердикту та старі адреси (301) ведуться автоматично;
- кожна дія потрапляє в журнал дій.
