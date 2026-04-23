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
