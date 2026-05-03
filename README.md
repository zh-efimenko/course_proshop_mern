# ProShop

Интернет-магазин на MERN-стеке (MongoDB, Express, React, Node.js) с Redux. Учебный проект из курса Брэда Траверси. Поддерживает каталог товаров, корзину, оформление заказа с оплатой через PayPal, отзывы, панель администратора. Оригинальный репозиторий объявлен deprecated, есть [v2 на Redux Toolkit](https://github.com/bradtraversy/proshop-v2).

## Tech Stack

**Backend:** Node.js (ES modules), Express 4.17, Mongoose 5.10, JWT (jsonwebtoken 8.5), bcryptjs, multer, morgan

**Frontend:** React 16.13, Redux 4 + redux-thunk 2.3, React Router 5, React Bootstrap 1.3, react-scripts 3.4.3, axios 0.20

**Dev tools:** nodemon, concurrently 5.3

**База данных:** MongoDB

## Структура проекта

```
├── backend/
│   ├── config/          # Подключение к MongoDB
│   ├── controllers/     # Бизнес-логика (products, users, orders)
│   ├── data/            # Сидовые данные (products.js, users.js)
│   ├── middleware/       # auth (JWT protect + admin), error handler
│   ├── models/          # Mongoose-схемы (User, Product, Order)
│   ├── routes/          # Express-роуты (/api/products, /users, /orders, /upload, /featureflags)
│   ├── utils/           # generateToken (JWT)
│   ├── features.json    # Feature flags (источник данных для /api/featureflags)
│   ├── seeder.js        # Импорт/удаление сидовых данных
│   └── server.js        # Точка входа
├── frontend/
│   └── src/
│       ├── actions/     # Redux async actions (API-вызовы через axios)
│       ├── components/  # Переиспользуемые UI-компоненты
│       ├── constants/   # Типы Redux-экшенов
│       ├── reducers/    # Redux-редьюсеры (product, user, order, cart, featureFlags)
│       ├── screens/     # Страницы (Home, Cart, Login, Order, Admin и т.д.)
│       ├── setupProxy.js  # Dev-proxy: /api и /uploads → backend (http-proxy-middleware v0.x)
│       ├── App.js         # Роутинг
│       ├── store.js       # Redux store (redux-thunk)
│       └── index.js       # Точка входа
├── uploads/             # Загруженные изображения товаров
├── docs/                # Документация
├── CLAUDE.md            # Правила для AI-ассистента
└── package.json         # Root: backend deps + concurrently-скрипты
```

## Установка и запуск

Проект поддерживает два способа запуска: через **Docker Compose** (рекомендуется) и **локально**.

---

### Способ 1 — Docker Compose (рекомендуется)

**Prerequisites:** только [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### 1. Создайте `.env` в корне проекта

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/proshop
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
```

> `MONGO_URI` в `.env` используется только для локального запуска. В Docker Compose он автоматически переопределяется на `mongodb://mongo:27017/proshop`.

#### 2. Запустите

```bash
docker-compose up --build
```

При первом запуске автоматически:
- Поднимается MongoDB (с healthcheck)
- Запускается сидер и заполняет базу тестовыми данными
- Стартует backend (порт 5001) и frontend (порт 3000)

Компиляция frontend при первом запуске занимает 1–2 минуты.

> **Почему `stdin_open: true` в compose для frontend?** `webpack-dev-server 3.x` вызывает `process.exit()` при закрытии stdin. Docker Compose запускает контейнеры без TTY — stdin сразу закрывается, процесс молча завершается с кодом 0. `stdin_open: true` держит stdin открытым.

#### Доступ

| Сервис | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001/api |
| MongoDB | localhost:27017 |

#### Полезные команды

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить данные MongoDB (полный сброс)
docker-compose down -v

# Пересобрать образы после изменений в Dockerfile
docker-compose up --build

# Посмотреть логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

### Способ 2 — Локальный запуск

**Prerequisites:**

| Инструмент | Версия | Примечание |
|---|---|---|
| Node.js | v16+ (до v24 включительно) | При v17+ нужен флаг `--openssl-legacy-provider` (уже в скриптах) |
| MongoDB | 4.x+ | Локально или Docker |
| npm | 6+ | |

**Запуск MongoDB через Docker:**

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

#### Env-переменные

Создайте файл `.env` в корне проекта:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/proshop
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
```

| Переменная | Где используется | Описание |
|---|---|---|
| `NODE_ENV` | `server.js`, `errorMiddleware.js` | Режим запуска (development/production) |
| `PORT` | `server.js` | Порт сервера. Используйте **5001**, порт 5000 занят AirPlay Receiver в macOS |
| `MONGO_URI` | `config/db.js` | Строка подключения к MongoDB (обязательно с `mongodb://` или `mongodb+srv://`) |
| `JWT_SECRET` | `utils/generateToken.js`, `authMiddleware.js` | Секрет для подписи JWT-токенов |
| `PAYPAL_CLIENT_ID` | `server.js` → `/api/config/paypal` | Client ID из PayPal Developer Dashboard (sandbox или live) |

#### Установка зависимостей

```bash
# Установить backend-зависимости (корень)
npm install

# Установить frontend-зависимости
cd frontend
npm install
```

#### Запуск

```bash
# Backend + Frontend одновременно
npm run dev

# Только backend (порт из .env, по умолчанию 5001)
npm run server

# Только frontend (порт 3000)
npm run client
```

#### Первичная загрузка данных

```bash
# Импортировать тестовые товары и пользователей
npm run data:import

# Удалить все данные из базы
npm run data:destroy
```

---

### Тестовые аккаунты

Доступны после запуска через Docker Compose (сид автоматический) или после `npm run data:import`:

| Email | Пароль | Роль |
|---|---|---|
| admin@example.com | 123456 | Admin |
| john@example.com | 123456 | Customer |
| jane@example.com | 123456 | Customer |

## Troubleshooting

### `Error: Invalid connection string`

`MONGO_URI` указан без префикса. Должно быть:
```
MONGO_URI=mongodb://localhost:27017/proshop
```
Не `localhost:27017/proshop`.

### `Error: error:0308010C:digital envelope routines::unsupported`

Node.js v17+ использует OpenSSL 3, несовместимый с webpack 4 из react-scripts 3.4.3. Флаг уже добавлен в `package.json`:

```json
"client": "NODE_OPTIONS=--openssl-legacy-provider npm start --prefix frontend"
```

Если запускаете frontend вручную: `NODE_OPTIONS=--openssl-legacy-provider npm start --prefix frontend`.

### Запросы к API возвращают 403

1. Убедитесь что `PORT` в `.env` равен **5001** — локальный proxy по умолчанию идёт на `http://127.0.0.1:5001`.
2. Проверьте, что сервер реально запустился (нет ошибок в консоли).

### Proxy — как устроена маршрутизация API-запросов

Запросы к `/api` и `/uploads` автоматически проксируются с frontend dev-сервера на backend. Настройка в `frontend/src/setupProxy.js`:

```js
const target = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001'
```

| Режим | `REACT_APP_API_URL` | Прокси идёт на |
|---|---|---|
| Локальный (`npm run dev`) | не задан | `http://127.0.0.1:5001` |
| Docker Compose | `http://backend:5001` (задан в compose) | Docker-сервис `backend` |

**Важно:** `react-scripts 3.4.3` тянет `http-proxy-middleware` **v0.19.x**. В этой версии нет `createProxyMiddleware` — используется API v0.x:

```js
// Правильно (v0.x)
const proxy = require('http-proxy-middleware')
app.use('/api', proxy({ target, changeOrigin: true }))

// Неправильно — сломает npm run dev (это API v1.x+)
const { createProxyMiddleware } = require('http-proxy-middleware')
```

### `Error: connect ECONNREFUSED 127.0.0.1:27017`

MongoDB не запущен. Проверьте:
```bash
# Если через Docker
docker ps | grep mongo

# Запустить, если не запущен
docker run -d -p 27017:27017 --name mongo mongo:7
```

### Port 5000 уже занят (macOS)

macOS Monterey+ использует порт 5000 для AirPlay Receiver. Решения:
- Использовать порт 5001 (рекомендуется, уже настроено)
- Или отключить: System Settings → General → AirDrop & Handoff → выключить AirPlay Receiver

### PayPal кнопка не отображается

- Для разработки используйте PayPal Sandbox: [developer.paypal.com](https://developer.paypal.com)
- Создайте sandbox-приложение, скопируйте Client ID в `.env`
- Для оплаты используйте sandbox-аккаунт покупателя (не реальный PayPal)
- Если PAYPAL_CLIENT_ID пустой, кнопка не отобразится, но остальной функционал работает

### Backend-импорты падают с "module not found"

Проект использует ES modules (`"type": "module"` в `package.json`). Все локальные импорты должны содержать расширение `.js`:

```js
// Правильно
import Product from '../models/productModel.js'

// Неправильно — ошибка
import Product from '../models/productModel'
```

## Feature Flags

Флаги хранятся в `backend/features.json` (25 штук). При старте приложения они загружаются в Redux (`state.featureFlags`) и доступны во всех компонентах.

**Просмотр:** войти под админом → меню Admin → Feature Flags.

**Обновление флага:** отредактировать `backend/features.json` напрямую или через MCP. Изменения вступают в силу после перезагрузки страницы — рестарт сервера не нужен.

Структура одного флага:

```json
{
  "flag_key": {
    "name": "Человекочитаемое название",
    "description": "Описание фичи",
    "status": "Enabled | Testing | Disabled",
    "traffic_percentage": 0,
    "rollout_strategy": "canary | ab_test | full_release",
    "targeted_segments": ["all"],
    "last_modified": "YYYY-MM-DD",
    "dependencies": ["other_flag_key"]
  }
}
```

> `dependencies` — опциональное поле. `backend/features.json` монтируется в Docker Compose автоматически через `./backend:/app/backend`.

## License

MIT — Copyright (c) 2020 Traversy Media