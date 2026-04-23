# FINDINGS — proshop_mern

| # | Риск | Где | Что | Как фиксить | Статус |
|---|------|-----|-----|-------------|--------|
| 1 | 🔴 | backend/controllers/orderController.js::updateOrderToPaid | обращение к `req.body.payer.email_address` без проверки — при отсутствии поля `payer` сервер падает с 500 | optional chaining (`req.body.payer?.email_address`) или валидация тела запроса | ✅ fixed |
| 2 | 🟡 | backend/models/productModel.js | нет min/max в схемах — price/countInStock можно передать отрицательными, rating без диапазона | добавить `min: 0` для price/countInStock, `min: 1, max: 5` для rating в reviewSchema | ✅ fixed |
| 3 | 🟡 | frontend/src/screens/PlaceOrderScreen.js | налог 15%, порог доставки $100 захардкожены в React-компоненте — клиент подделывает суммы | перенести расчёт в backend `addOrderItems`, фронтенд только отображает | 🔴 not yet |
| 4 | 🟡 | backend/controllers/productController.js::getProducts | `pageSize = 10` — магическое число; `$regex` не экранируется — regex-инъекция вызывает full-scan | вынести pageSize в env, экранировать keyword через `escapeRegex` | 🔴 not yet |
| 5 | 🟢 | frontend/src/screens/PaymentScreen.js + components/Meta.js | закомментированный Stripe (мёртвый код), опечатка `"cheap electroincs"` | удалить закомментированный блок, исправить опечатку | 🔴 not yet |

## Outdated Dependencies (справочно)

| Пакет | Текущая | Последняя | Разрыв |
|---|---|---|---|
| mongoose | 5.10 | 8.x | 3 major |
| react | 16.13 | 19.x | 3 major |
| react-scripts | 3.4.3 | 5.x | 2 major |
| express | 4.17 | 5.x | 1 major |
| jsonwebtoken | 8.5 | 9.x | 1 major |
| redux | 4.0 | 5.x (Toolkit) | 1 major |

Обновление — отдельная задача. Для учебного проекта текущие версии работают.