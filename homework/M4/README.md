# Модуль 4 — Отчёт

## Что сделано

1. **DESIGN.md** в корне репо — единый источник правды о визуальном языке (commit `8dce477`).
2. **Feature Dashboard** — admin-страница `/admin/featuredashboard` для управления feature flags (commit `0fa6568`).
3. **Полный редизайн всех 16 страниц** под токены DESIGN.md (commit `13b256d`).

---

## Редизайненные страницы

| # | Page | Route | File | Сделал? |
|---|------|-------|------|---------|
| 1 | Home / Search results | `/`, `/search/:keyword`, `/page/:n` | `HomeScreen.js` | [x] |
| 2 | Product details | `/product/:id` | `ProductScreen.js` | [x] |
| 3 | Cart | `/cart/:id?` | `CartScreen.js` | [x] |
| 4 | Login | `/login` | `LoginScreen.js` | [x] |
| 5 | Register | `/register` | `RegisterScreen.js` | [x] |
| 6 | Profile | `/profile` | `ProfileScreen.js` | [x] |
| 7 | Shipping | `/shipping` | `ShippingScreen.js` | [x] |
| 8 | Payment | `/payment` | `PaymentScreen.js` | [x] |
| 9 | Place Order | `/placeorder` | `PlaceOrderScreen.js` | [x] |
| 10 | Order details | `/order/:id` | `OrderScreen.js` | [x] |
| 11 | Admin: Users list | `/admin/userlist` | `UserListScreen.js` | [x] |
| 12 | Admin: User edit | `/admin/user/:id/edit` | `UserEditScreen.js` | [x] |
| 13 | Admin: Products list | `/admin/productlist` | `ProductListScreen.js` | [x] |
| 14 | Admin: Product edit | `/admin/product/:id/edit` | `ProductEditScreen.js` | [x] |
| 15 | Admin: Orders list | `/admin/orderlist` | `OrderListScreen.js` | [x] |
| 16 | **Admin: Feature Dashboard** | `/admin/featuredashboard` | `FeatureFlagsScreen.js` | [x] |

Дополнительно отрефакторены общие компоненты: `Header`, `Footer`, `SearchBox`, `Rating`, `Product`, `Paginate`, `Loader`, `Message`, `FormContainer`, `ProductCarousel`, `CheckoutSteps`, `CheckoutStepperV2`, `MultiStepCheckoutScreen`, `ReviewModerationScreen`.

---

## Инструменты

- **Claude Code** (Opus 4.7, 1M context) — основной агент для генерации DESIGN.md, редизайна экранов, чистки legacy CSS.
- **Claude Design** (продукт Anthropic) — использовался как основной режим генерации UI: агент читает `DESIGN.md` + `tokens.css` + `components.css` и пишет JSX/CSS напрямую под токены, без визуального редактора. Каждый экран генерировался итеративно: запрос на редизайн → агент перечитывает DESIGN.md → правка кода → проверка против anti-slop guards.
- **Pencil Dev** — была попытка использовать визуальный редактор `.pen` для прототипирования экранов перед кодогенерацией. Отказались из-за глюков самого приложения (падения, рассинхрон canvas, проблемы с экспортом). В итоге весь дизайн ушёл в Claude Design флоу через Claude Code + DESIGN.md.
- **DESIGN.md** загружен в `CLAUDE.md` через секцию `## Design System — read before any frontend work`, что заставляет агент перечитывать систему перед каждой UI-правкой.
- **Anti-AI-slop guards** из `homework/M4/anti-slop-supplement.md` встроены в DESIGN.md §Anti-Slop.
- **TweakCN / shadcn** — НЕ использовались. Стилизация через собственные CSS-токены, без сторонних UI-китов.

---

## Component decisions

### Готовое (взяли как есть)
- **react-bootstrap** — оставлен как сетка/контейнер (`Container`, `Row`, `Col`, `Form.Control`, `Table`) ради минимизации диффа структуры. Визуально перекрыт через `components.css` — bootstrap-классы перестилизованы семантическими токенами.
- **react-router-dom v5** — без изменений.
- **redux + redux-thunk** — без изменений.

### Кастом (написано с нуля под DESIGN.md)
- **`frontend/src/styles/tokens.css`** — semantic CSS variables (color, typography, spacing ×8, radius scale, состояния). Один источник для светлой/тёмной темы через `[data-theme="dark"]` на `<html>`.
- **`frontend/src/styles/components.css`** — паттерны под DESIGN.md: `.ps-card`, `.ps-btn`, `.ps-input`, `.ps-badge`, `.ps-table`, состояния hover/focus/active/loading/empty/error, skeleton, header, modal.
- **`Icon.js`** — собственный SVG-иконпак (без emoji, без font-awesome для критичных мест).
- **`ConfirmModal.js`** — accessible confirm-диалог поверх Bootstrap Modal, под DESIGN.md паттерн.
- **`FeatureFlagsScreen`** — переписан с табличного вида в карточный dashboard: segmented control (Disabled/Testing/Enabled), slider 0–100% с клавиатурой, поиск, фильтр, loading skeleton, empty/error states, ARIA (aria-pressed, aria-valuenow, aria-label).
- **`CheckoutStepperV2`** — собственный stepper по DESIGN.md, без Bootstrap Progress.

### Удалено
- Box-shadows на карточках — depth через 3 уровня фона.
- `body.dark-theme` хак — заменён на `[data-theme="dark"]` атрибут.
- Inline стили и legacy `index.css` overrides — переехало в токены.

---

## Backend изменения

`PATCH /api/featureflags/:key` (commit `0fa6568`) — atomic write в `backend/features.json`, авто-обновление `last_modified`, валидация `status` enum и `traffic_percentage` 0–100. Защищено `protect + admin`.
