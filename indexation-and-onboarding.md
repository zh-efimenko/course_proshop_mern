# Промт: Mermaid C4-диаграмма архитектуры ProShop MERN

## Роль

Ты — DevOps-архитектор, специализирующийся на визуализации архитектуры
программных систем. Твоя задача — проанализировать кодовую базу MERN-приложения
ProShop и создать Mermaid C4-диаграммы уровня Container и Component.

## Контекст проекта

ProShop — e-commerce приложение на стеке MERN (MongoDB, Express, React, Node.js).

**Backend (Express + MongoDB):**
- Точка входа: `backend/server.js` — загружает env, подключает БД, монтирует middleware и роуты
- Модели (`backend/models/`): `userModel` (bcrypt + JWT), `productModel`, `orderModel`
- Роуты → Контроллеры: REST-паттерн в `backend/routes/` и `backend/controllers/`
- Эндпоинты: `/api/products` (CRUD + отзывы), `/api/users` (auth), `/api/orders` (создание/оплата/доставка), `/api/upload` (multer), `/api/config/paypal`
- Middleware: `authMiddleware.js` (JWT protect + admin), `errorMiddleware.js`
- Конфиг: `backend/config/db.js` — Mongoose-подключение

**Frontend (React + Redux):**
- CRA (react-scripts 3.4.3) + Redux + redux-thunk + React Router v5
- Store: `frontend/src/store.js` — combineReducers, state из localStorage
- Actions: `frontend/src/actions/` — cartActions, productActions, userActions, orderActions
- Reducers: `frontend/src/reducers/` — cart, products, users, orders
- Screens: `frontend/src/screens/` — 16 страниц (Home, Product, Cart, Login, Register, Shipping, Payment, PlaceOrder, Order, Profile, Admin-экраны)
- Components: `frontend/src/components/` — Header, Footer, Rating, Loader, Message и др.
- Прокси в `frontend/package.json` → `http://127.0.0.1:5001`

**Инфраструктура:**
- MongoDB 7 (локально через Docker)
- PayPal JS SDK для оплаты
- Порт 5001 (5000 занят macOS AirPlay)
- Static files: `/uploads/` — изображения товаров
- ES modules (`"type": "module"` в корневом package.json)

## Инструкция

### Шаг 1. Прочитай ключевые файлы

Прочитай в строгом порядке:
1. `backend/server.js` — роуты, middleware, static files
2. `backend/routes/productRoutes.js`, `userRoutes.js`, `orderRoutes.js`, `uploadRoutes.js` — все эндпоинты и auth-требования
3. `backend/controllers/` — один любой файл, чтобы увидеть паттерн
4. `backend/models/userModel.js`, `productModel.js`, `orderModel.js` — схемы данных
5. `backend/middleware/authMiddleware.js` — JWT + admin guard
6. `frontend/src/store.js` — структура Redux store
7. `frontend/src/App.js` — роутинг

### Шаг 2. Создай файл `docs/architecture.md`

Содержимое файла — три Mermaid-диаграммы:

#### 2.1. C4Container — общая архитектура

- Два Person: Customer и Admin
- Внешняя система: PayPal (Payment Gateway)
- Контейнеры:
  - SPA (React + Redux) — браузерный UI
  - REST API (Express.js) — бэкенд
  - MongoDB — база данных
  - File Storage (/uploads) — изображения товаров
- Связи (Rel) с подписями на русском: тип протокола, назначение

#### 2.2. C4Component — Backend

- Контейнер: REST API (Express.js)
- Компоненты:
  - `authMiddleware` (JWT protect + admin guard)
  - `errorMiddleware` (глобальный обработчик ошибок)
  - `productController` (CRUD + отзывы)
  - `userController` (регистрация, логин, профиль)
  - `orderController` (создание, оплата, доставка)
  - `uploadController` (multer загрузка файлов)
  - `productModel`, `userModel`, `orderModel` (Mongoose-схемы)
- Связи между компонентами: контроллеры → модели, роуты → middleware → контроллеры

#### 2.3. C4Component — Frontend

- Контейнер: SPA (React + Redux)
- Компоненты:
  - Redux Store (combineReducers: products, cart, users, orders)
  - Action Creators (productActions, cartActions, userActions, orderActions)
  - Screens: публичные (Home, Product, Cart, Login, Register, Shipping, Payment, PlaceOrder, Order, Profile) и админские (ProductList, ProductEdit, OrderList, UserList, UserEdit)
  - Shared Components (Header, Footer, Rating, Loader, Message, CheckoutSteps, Paginate, SearchBox, ProductCarousel)
  - localStorage (cartItems, userInfo, shippingAddress)
- Связи: Screens → Actions → API, Screens → Redux Store, Store ↔ localStorage

### Шаг 3. Форматирование

- Все описания в диаграммах — на русском
- Технические термины (Express, MongoDB, Redux, JWT и т.д.) оставляй на английском
- Перед каждой диаграммой — краткий заголовок (## Уровень Container, ## Backend — Компоненты, ## Frontend — Компоненты)
- Используй `C4Container` и `C4Component` типы диаграмм

## Что НЕ делать

- НЕ добавляй ER-диаграммы, схемы API-роутов, графы Redux-состояния — только три C4-диаграммы
- НЕ выдумывай компоненты, которых нет в коде — читай файлы перед созданием диаграммы
- НЕ используй deprecated синтаксис Mermaid — только актуальный C4
- НЕ пиши поясняющий текст после диаграмм — только заголовки и Mermaid-блоки
- НЕ добавляй секции с установкой, запуском или инструкциями — это файл с диаграммами, не README

## Пример ожидаемой структуры файла

```markdown
# ProShop MERN — Архитектура

## Уровень Container

​```mermaid
C4Container
    title ProShop — Общая архитектура (Container)
    ...
​```

## Backend — Компоненты

​```mermaid
C4Component
    title ProShop — Backend (REST API)
    ...
​```

## Frontend — Компоненты

​```mermaid
C4Component
    title ProShop — Frontend (SPA)
    ...
​```
```

## Критерии качества

- Каждый контейнер/компонент имеет описание на русском (technology — на английском)
- Все связи подписаны (что передаётся, по какому протоколу)
- Диаграмма рендерится без ошибок в Mermaid Live Editor
- Нет orphan-элементов — каждый элемент соединён хотя бы одной связью