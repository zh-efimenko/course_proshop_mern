# Report

## Rules Diff

Last 3 additions to CLAUDE.md:

- **Commit Conventions** — every commit message must be prefixed with `COURSE:` (Чтобы визуально можно было легко проследить комиты сделанные в рамках курса, и быстро понять, что именно было измененно)
- **Local Gotchas** — 6 common pitfalls: re-seed after schema changes, MongoDB must be running, port 5001 instead of 5000, Node.js v17+ needs `--openssl-legacy-provider`, `.env` is required manually, frontend proxy must match PORT
  (Особенности, которые должен знать каждый разработчик перед запуском)
- **MR Review Checklist** — 7 categories: Security, Structure & Architecture, Error Handling, Database, Performance, Code Quality, DevOps  (Особенности, которые должен знать каждый разработчик для унификации требований и стиля. Усилить поддерживаемость репозитория)

## Environment

- **IDE:** IntelliJ IDEA
- **Agent:** Claude Code (CLI)
- **LLM:** glm-5.1 (Z.ai)

## Verification

Запустил локально через docker mongo + npm run dev

## 3 вопроса (EXTRA: Docker Compose + bugfixes)

- **Сколько заняло бы вручную:** ~5–7 часов — разобраться с webpack-dev-server/TTY поведением в Docker, настроить healthcheck + seeder, совместить proxy для двух режимов, найти null-user баг в middleware
- **Самая неочевидная находка:** `frontend-1 exited with code 0` сразу после `Starting the development server...` — не OOM, не ошибка компиляции, а `process.stdin.on('end', () => process.exit())` внутри webpack-dev-server 3.x. Docker Compose запускает контейнеры без TTY → stdin сразу закрывается → процесс чисто выходит. Фикс: `stdin_open: true` в compose.
- **Где AI ошибся и как поправили:** `setupProxy.js` написан с `{ createProxyMiddleware } = require('http-proxy-middleware')` — именованный экспорт из v1.x. Но react-scripts 3.4.3 тянет v0.19.1, где такого экспорта нет. Команда сломала `npm run dev`. Нашли через `cat node_modules/http-proxy-middleware/package.json`, переписали на `const proxy = require(...)` и два отдельных `app.use`.

# M3 — RAG: Векторный поиск + MCP-интеграция

**Ingest-пайплайн (загрузка эмбеддингов через Cohere в Qdrant):** [`mcp-rag/ingest.js`](mcp-rag/ingest.js)

## M3 Task 1 — Feature Flags: управление через MCP

### Запрос 1: reviews_moderation

**Запрос:** Проверь состояние фичи reviews_moderation в feature flags. Если она в статусе Disabled — переведи в Testing. Установи трафик на 25%. Подтверди финальное состояние.

**Исходное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Disabled` |
| **traffic_percentage** | `0%` |
| **last_modified** | `2026-02-10` |

**Действия:** статус `Disabled` → переведено в `Testing`, трафик выставлен на `25%`.

**Финальное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Testing` |
| **traffic_percentage** | `25%` |
| **last_modified** | `2026-05-03` |

---

### Запрос 2: search_autosuggest

**Запрос:** Проверь состояние фичи search_autosuggest в feature flags. Если она в статусе Disabled — переведи в Testing. Установи трафик на 75%. Подтверди финальное состояние.

**Исходное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Testing` |
| **traffic_percentage** | `25%` |
| **last_modified** | `2026-03-22` |

**Действия:** флаг уже был в `Testing` — перевод не потребовался. Трафик поднят с `25%` до `75%`.

**Финальное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Testing` |
| **traffic_percentage** | `75%` |
| **last_modified** | `2026-05-03` |

---

### Запрос 3: dark_mode

**Запрос:** Проверь состояние фичи dark_mode в feature flags. Переведи в Enabled. Подтверди финальное состояние.

**Исходное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Testing` |
| **traffic_percentage** | `20%` |
| **last_modified** | `2026-04-20` |

**Действия:** статус `Testing` → переведено в `Enabled`, трафик автоматически выставлен на `100%`.

**Финальное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Enabled` |
| **traffic_percentage** | `100%` |
| **last_modified** | `2026-05-03` |

---

## M3 Task 2 — RAG: Вопросы и ответы через MCP

### Вопрос 1: Принципы проектирования MCP-сервера

**Запрос:** раскажи мне Принципы проектирования MCP-сервера используй mcp

**Ответ:**

#### Принципы проектирования MCP-сервера (2026)

##### 1. Количество Tools: оптимальные пороги

| Диапазон | Поведение |
|---|---|
| **5–15 Tools** | Оптимально, модель точно выбирает нужный Tool |
| 20–50 | Границы размываются, точность падает |
| 50+ | «Смерть от тысячи инструкций» |

**Канонические правила Philipp Schmid:** один сервер — одна задача. Разделяйте по роли (`admin` / `user`). Атомарные Tools — `find_user_by_email`, `get_orders`, `get_order_status` вместо одного `track_latest_order(email)`.

##### 2. Описание Tool — это промпт, а не строка документации

Пишите для модели, не для разработчика. Включайте:
- Что Tool делает и когда его вызывать
- Что он **не** делает (предотвращает неверные вызовы)
- Примеры параметров и ожидаемый вывод

##### 3. Три примитива: Tools / Resources / Prompts

- **Tools** — изменяют состояние, вызывают side effects. Аннотируйте `destructiveHint: true` для необратимых операций, `idempotentHint: true` для идемпотентных.
- **Resources** — данные только для чтения (без подтверждений, можно кешировать).
- **Prompts** — параметризованные шаблоны для UI (`/`-команды в Cursor).

##### 4. Eager Loading — фундаментальная проблема

MCP загружает **полные схемы всех Tools** до первого сообщения пользователя:

| Конфигурация | Серверов | Токены | Остаток |
|---|---|---|---|
| Максимум | 15 | ~100K | Критически мало |
| Умеренная | 8 | ~50K | Ограничен |
| **Лёгкая (рекомендуется)** | **6** | **~30K** | **Здоровый** |
| Минимальная | 3 | ~15K | Оптимально |

**Решение — Tool Search (lazy loading):** на старте только `имя + краткое описание` (~20–50 токенов), полная схема загружается по требованию. Результат: −85% токенов, точность вызовов Opus 4 `49% → 74%`.

##### 5. Security: обязательные примитивы

- **OAuth 2.1 + PKCE**, не статические API-ключи
- **Никаких учётных данных в `mcp.json`** — OS keychain или шаблон gateway
- **Validation вывода Tool** до передачи в контекст LLM (prompt injection)
- **Деструктивные операции → human-in-the-loop шлюз в коде**, не в промпте

Пять классов уязвимостей: Prompt Injection, Tool Poisoning, Tool Shadowing, Sandbox Bypass, Confused Deputy.

##### 6. Антипаттерны

| Антипаттерн | Решение |
|---|---|
| Один сервер на всё | Один сервер — одна предметная область |
| Авто-обёртки OpenAPI в production | Использовать как скелет, вручную редактировать |
| «Сертификация» каталога = безопасность | Только сервер, который вы прочитали и протестировали |
| Учётные данные в `mcp.json` | OS keychain или env через shell |

##### 7. Когда MCP **не** подходит

MCP нужен если: постоянное соединение, OAuth-скоупинг, audit trail для нескольких пользователей, удалённый доступ с разных устройств.

Если всё это «нет» — используйте **Skill + CLI**. Личная автоматизация — это не MCP.

---

### Вопрос 2: Почему выбрана MongoDB (2 чанка)

**Запрос:** Почему выбрана монго, используй 3 чанка

**Ответ** (источник: `project-data/adrs/adr-001-mongodb-vs-postgres.md`):

#### Почему выбрана MongoDB

**Контекст:** команда из двух инженеров выбирала БД до первого коммита. Основные кандидаты — MongoDB и PostgreSQL.

**Причины выбора MongoDB:**

1. **Переменные атрибуты товаров** — электроника имеет мощность и коннективность, одежда — размер и материал, книги — ISBN. Документная модель казалась естественным решением для такой вариативности.
2. **Цель обучения** — команда осознанно хотела получить опыт работы с MongoDB, несмотря на то что PostgreSQL был хорошо знаком обоим.
3. **Один инженер уже имел опыт с Mongoose** — снижало порог входа.

**Честная ретроспектива (апрель 2026):**

> Для реальной нагрузки — фиксированная схема каталога, стандартные связи user/order — PostgreSQL был бы **равноценным, а возможно лучшим выбором**.

- PostgreSQL + JSONB справился бы с вариативностью атрибутов не хуже.
- ACID-гарантии PostgreSQL устранили бы проблемы с multi-document consistency, которые всплыли в production.
- SQLite рассматривался, но отклонён — не подходит для multi-connection production.

**Итог:** MongoDB не создал серьёзных проблем, интеграция с Mongoose стабильна, стоимость миграции сейчас превышает выгоду — решение оставлено как есть.

---

### Вопрос 3: Authentication (2 чанка)

**Запрос:** раскажи мне про Authentication, используй 2 чанка

**Ответ** (источники: `project-data/api/auth.md`, `project-data/features/auth.md`):

#### Authentication в ProShop

##### Механизм

Используется **JWT (JSON Web Tokens)** для управления сессиями. Токен передаётся в каждом запросе через заголовок `Authorization: Bearer <token>` и живёт **30 дней**.

##### Технический стек

**Генерация токена** — `backend/utils/generateToken.js`:
```js
jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
```

**Middleware `protect`** — `backend/middleware/authMiddleware.js`:
1. Извлекает токен из заголовка
2. Верифицирует через `jwt.verify`
3. Загружает пользователя: `User.findById(decoded.id).select('-password')` → `req.user`

**Middleware `admin`** — проверяет `req.user.isAdmin === true`, иначе HTTP 401.

**Хранение на фронтенде** — `userInfo` (включая токен) в `localStorage['userInfo']`, Redux store инициализируется из него при загрузке приложения.

##### Edge cases

| Ситуация | Поведение |
|---|---|
| Токен истёк (30 дней) | `TokenExpiredError` → HTTP 401 → фронтенд диспатчит `logout()` |
| Токен подделан | `JsonWebTokenError` → та же цепочка |
| `JWT_SECRET` отсутствует в `.env` | Сервер не запускается корректно |
| Параллельные запросы с инвалидным токеном | Каждый action независимо проверяет ошибку и вызывает logout |

---

## M3 Task 3 — Feature Flags + RAG: комбинированный запрос

### Запрос: photo_reviews

**Запрос:** Найди в документации proshop_mern что такое фича photo_reviews и какие у неё зависимости. Проверь текущее состояние этой фичи через feature flags. Если она в статусе Disabled и все её зависимости не в Disabled, переведи в Testing и установи трафик 25%. Процитируй из документации зачем эта фича нужна.

**Документация** (источник: `project-data/feature-flags-spec.md`):

> Customers can attach up to 3 photos when writing a review. Photos upload to the existing `/api/upload` endpoint (which already handles product image uploads). Stored as `images: [String]` in `reviewSchema`. Displayed as a thumbnail gallery in `ProductScreen`.

> **Dependencies:** `reviews_moderation` recommended — unmoderated photo content is a risk. If `reviews_moderation` is Disabled, photo_reviews should remain Disabled.

**Исходное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Disabled` |
| **traffic_percentage** | `0%` |
| **last_modified** | `2026-03-02` |

**Зависимости:**

| Зависимость | Статус |
|---|---|
| `reviews_moderation` | `Testing` ✓ |

**Действия:** статус `Disabled`, зависимость `reviews_moderation` не в `Disabled` — условие выполнено. Переведено в `Testing`, трафик выставлен на `25%`.

**Финальное состояние:**

| Поле | Значение |
|---|---|
| **status** | `Testing` |
| **traffic_percentage** | `25%` |
| **last_modified** | `2026-05-03` |
| **rollout_strategy** | `canary` |
| **targeted_segments** | `authenticated` |

---

## Reflection

Для реализации RAG-пайплайна выбрали стек: **Qdrant** как векторная база данных, **Cohere** как провайдер эмбеддингов, **MCP-сервер** на Node.js как интерфейс для Claude. Qdrant выбрали прежде всего за простоту развёртывания — один `docker run` и база готова к работе, никаких сложных зависимостей или настроек. Cohere выбрали, чтобы не возиться с локальными моделями: не нужно качать гигабайты весов, настраивать GPU или разбираться с совместимостью библиотек — просто API-ключ, и эмбеддинги работают из коробки. MCP-протокол оказался удобным мостом между инструментами и агентом: Claude сам решает, когда вызывать `search_project_docs`, без жёсткой логики в коде приложения. Основная сложность была в первом задании — реализация фич и их правильное подключение и настройка: нужно было разобраться, как всё правильно связать между собой, чтобы система работала корректно. Задания два и три — ingest-пайплайн и MCP-сервер — оказались значительно проще и интереснее: логика прозрачная, результат виден сразу. По итогу стек менять бы не стал — всё доступно, документировано и легко воспроизводится на любой машине без сложной локальной настройки.
