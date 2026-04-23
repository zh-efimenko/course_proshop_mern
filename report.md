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
