# M5 Homework — n8n Agentic Workflows

> **Статус:** реализован WF1 (Manual trigger). WF2 (Scheduled monitor) — в разработке.

---

## Архитектура

WF1 принимает команды управления feature flags через webhook (n8n.cloud). Браузер не ходит в n8n напрямую — Express-backend проксирует запрос, скрывая секреты и обходя CORS. n8n AI Agent вызывает MCP-инструменты (`mcp-features`) через Cloudflare Tunnel, читает и пишет в `backend/features.json`. M4 Dashboard отображает актуальное состояние флагов; AutoPilot-панель на странице Feature Flags запускает WF1 одной кнопкой из UI.

```
Browser (AutoPilotControls.js)
  │  POST /api/autopilot/feature-control
  ▼
Express backend  ←── N8N_WEBHOOK_URL, N8N_API_KEY из .env
  │  POST https://eefimenko.app.n8n.cloud/webhook/feature-control
  │  Header: X-API-Key: <secret>
  ▼
n8n WF1: Webhook → Switch (валидация) → AI Agent (Claude Sonnet 4.6)
  │  MCP tools: get_feature_info / set_feature_state / adjust_traffic_rollout
  ▼
mcp-features (Docker, SSE) ←── Cloudflare Tunnel (публичный HTTPS)
  │  read / write
  ▼
backend/features.json
```

---

## Стек

| Компонент | Выбор | Обоснование |
|-----------|-------|-------------|
| n8n | cloud (`eefimenko.app.n8n.cloud`) | zero-infra, встроенная очередь, UI для отладки |
| Chat Model | **Claude Sonnet 4.6** | интеграция с M3 MCP через Anthropic, структурированный output |
| Storage WF1 | нет (stateless webhook) | WF1 — разовые команды, history не нужна |
| MCP tunnel | Cloudflare quick tunnel | n8n.cloud не может достучаться до localhost; quick tunnel = 0 конфигурации |
| Auth | X-API-Key (webhook) + Bearer Token (MCP) | секреты только на сервере, не в браузерном bundle |

---

## WF1 — Manual trigger

**Webhook URL:** `https://eefimenko.app.n8n.cloud/webhook/feature-control`  
**Auth:** `X-API-Key` (значение хранится в `.env` как `N8N_API_KEY`; ключ не публикуется)

### Что нового в Dashboard (M4)

- Страница **Feature Flags** (`/admin/featureflags`) — под гридом флагов появилась **AutoPilot панель** (компонент `AutoPilotControls.js`)
- Три кнопки: **Run check** (только чтение), **Testing mode** (→ `Testing`), **Rollback feature** (→ `Disabled`)
- После ответа n8n панель показывает `message` из ответа и обновляет состояние флага в UI без перезагрузки страницы

### Контракт

```http
POST /api/autopilot/feature-control
Content-Type: application/json

{ "feature_id": "search_v2", "action": "check" | "test" | "rollback" | "rollout", "target_state"?: "Testing" | "Disabled", "traffic_percentage"?: 0..100 }
```

```json
{ "success": true, "message": "...", "current_state": { "id": "...", "name": "...", "status": "Testing", "traffic_percentage": 50, "last_modified": "..." } }
```

### Файлы

| Файл | Роль |
|------|------|
| `backend/routes/autopilotRoutes.js` | Express-прокси → n8n, инжектит `X-API-Key` |
| `backend/server.js` | монтирует `/api/autopilot` |
| `frontend/src/components/AutoPilotControls.js` | AutoPilot панель с 3 кнопками |
| `frontend/src/screens/FeatureFlagsScreen.js` | селект флага + рендер AutoPilot |
| `homework/M5/wf1-manual-trigger.json` | экспорт n8n workflow (импортировать в n8n) |

---

## Защита от галлюцинаций

Защита стоит на **двух уровнях**:

1. **Switch-нода (n8n)** — детерминированная, без LLM. Отклоняет запрос с HTTP 400 если:
   - `feature_id` пустой
   - `action` пустой
   - `action` не из `["check","test","rollback","rollout"]`
   - `traffic_percentage` задан и выходит за `[0, 100]`

2. **Structured Output Parser (JSON Schema)** — принудительно валидирует ответ агента перед возвратом клиенту. Схема:
   ```json
   { "success": bool, "message": string, "current_state": object|null, "rejected_at": string|null }
   ```
   Поле `status` в `current_state` ограничено enum `["Enabled","Disabled","Testing"]`.

Агент также получает в системном промпте явный запрет: `traffic_percentage` вне `[0,100]` → возврат ошибки без вызова инструментов.

---

## MCP-сервис для n8n (Cloudflare Tunnel)

n8n.cloud не может достучаться до `localhost`. Решение — поднять `mcp-features` в Docker и опубликовать через cloudflared.

```bash
# Запустить mcp-features + tunnel
docker compose up -d mcp-features mcp-tunnel

# Найти публичный URL (новый при каждом перезапуске!)
docker compose logs mcp-tunnel | grep trycloudflare.com
```

В n8n → Credentials → MCP Client Tool:
- **SSE Endpoint:** `https://<random>.trycloudflare.com/mcp`
- **Authentication:** Bearer Token (`MCP_BEARER_TOKEN` из `.env`)

> URL эфемерный — меняется при каждом `docker compose restart mcp-tunnel`. После смены URL нужно обновить credentials в n8n вручную.

---

## Как запустить

### 1. Предварительные условия

```bash
# .env в корне репозитория — добавить строки:
N8N_WEBHOOK_URL=https://eefimenko.app.n8n.cloud/webhook
N8N_API_KEY=<твой X-API-Key>
MCP_BEARER_TOKEN=<твой Bearer Token для mcp-features>
```

### 2. Импорт workflow в n8n

1. Открыть n8n → **Workflows → Import from file**
2. Выбрать `homework/M5/wf1-manual-trigger.json`
3. Создать credentials: **Header Auth** (`X-API-Key`) + **Bearer Token** (для MCP Client)
4. В ноде **MCP Client** обновить SSE Endpoint на актуальный Cloudflare URL
5. Активировать workflow (переключатель в правом верхнем углу)

### 3. Запуск MCP-туннеля

```bash
docker compose up -d mcp-features mcp-tunnel
docker compose logs -f mcp-tunnel  # ждать строку trycloudflare.com
```

### 4. Запуск приложения

```bash
npm run dev
# Открыть http://localhost:3000/admin/featureflags
# Выбрать флаг → AutoPilot панель → нажать кнопку
```

---

## Симулятор WF1 (`simulate_wf1.py`)

Скрипт циклически шлёт запросы в webhook с ротацией команд и sine-волной `traffic_percentage`.

### Быстрый старт (через shell-враппер)

Враппер читает `N8N_WEBHOOK_URL` и `N8N_API_KEY` из `.env` автоматически.

```bash
cd homework/M5
chmod +x run_simulate_wf1.sh

# Smoke — 30s, каждые 5s (убедиться что webhook живой)
./run_simulate_wf1.sh smoke

# Demo — 120s, каждые 10s (для screencast)
./run_simulate_wf1.sh demo

# Stress — 10 параллельных запросов одновременно
./run_simulate_wf1.sh stress

# Hallucination test — каждый 3-й запрос traffic_percentage=-50 (должен быть отклонён)
./run_simulate_wf1.sh hallucination

# Другой флаг:
FEATURE_ID=dark_mode ./run_simulate_wf1.sh demo

# Другое количество бёрстов:
BURST=20 ./run_simulate_wf1.sh stress
```

### Прямой вызов Python (ручные параметры)

```bash
# Установить зависимость (если не установлена)
pip install requests

# Базовый запуск
python3 simulate_wf1.py \
  --webhook-url https://eefimenko.app.n8n.cloud/webhook/feature-control \
  --api-key $N8N_API_KEY \
  --duration 120 \
  --interval 10

# Тест галлюцинаций (каждый 3-й запрос невалидный)
python3 simulate_wf1.py \
  --webhook-url https://eefimenko.app.n8n.cloud/webhook/feature-control \
  --api-key $N8N_API_KEY \
  --include-invalid \
  --invalid-every 3 \
  --duration 60

# Burst — 15 параллельных запросов, потом выход
python3 simulate_wf1.py \
  --webhook-url https://eefimenko.app.n8n.cloud/webhook/feature-control \
  --api-key $N8N_API_KEY \
  --burst 15

# Другой флаг, другой интервал
python3 simulate_wf1.py \
  --webhook-url https://eefimenko.app.n8n.cloud/webhook/feature-control \
  --api-key $N8N_API_KEY \
  --feature-id dark_mode \
  --duration 300 \
  --interval 15
```

### Аргументы симулятора

| Аргумент | По умолчанию | Описание |
|----------|-------------|----------|
| `--webhook-url` | обязательный | Полный URL `/feature-control` endpoint |
| `--api-key` | `$N8N_API_KEY` | Значение заголовка `X-API-Key` |
| `--feature-id` | `search_v2` | `feature_id` в теле запроса |
| `--duration` | `120` | Время работы в секундах |
| `--interval` | `10` | Пауза между запросами в секундах |
| `--include-invalid` | выключен | Включить тест-запросы с `traffic_percentage=-50` |
| `--invalid-every` | `3` | Каждый N-й запрос делать невалидным |
| `--burst` | `0` | N параллельных запросов, потом выход (отменяет loop-режим) |

### Ожидаемый вывод (hallucination test)

```
[2026-05-16T22:34:10] action=check payload={'feature_id': 'search_v2', 'action': 'check'}
  → status=200 success=True message=Фича search_v2 в статусе Testing, traffic=50%
[2026-05-16T22:34:20] action=test payload={'feature_id': 'search_v2', 'action': 'test', 'target_state': 'Testing'}
  → status=200 success=True message=Флаг переведён в Testing
[2026-05-16T22:34:30] [INVALID test] payload={'feature_id': 'search_v2', 'action': 'rollout', 'traffic_percentage': -50}
  → status=400 success=False message=Validation error
```

Невалидный запрос отклоняется на Switch-ноде с `400` — агент не вызывается.

---

## Скриншоты

Скриншоты работы WF1 лежат в `homework/M5/screenshots_wf1/`.
