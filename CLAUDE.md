# CLAUDE.md

This file provides guidance when working with code in this repository.

## Commands

```bash
# Development (runs both server + client concurrently)
npm run dev

# Run backend only (nodemon)
npm run server

# Run frontend only
npm run client

# Seed database with sample data
npm run data:import

# Wipe all database data
npm run data:destroy

# Production build
cd frontend && npm run build
```

No test framework is configured.

## Architecture

MERN e-commerce app (ProShop). The project is **deprecated** — the author has a v2 using Redux Toolkit.

### Backend (`backend/`)

Express + MongoDB (Mongoose). Uses ES modules (`"type": "module"` in root `package.json`), so all local imports require `.js` extensions.

- **Entry:** `backend/server.js` — loads env, connects DB, mounts middleware/routes
- **Models:** `backend/models/` — `userModel` (with bcrypt password hashing + JWT `matchPassword` method), `productModel`, `orderModel`
- **Routes → Controllers:** RESTful pattern. Routes in `backend/routes/`, logic in `backend/controllers/`. Endpoints:
  - `/api/products` — CRUD + reviews
  - `/api/users` — auth (register/login/profile update)
  - `/api/orders` — create, pay (PayPal), deliver, list
  - `/api/upload` — multer file uploads to `/uploads/`
  - `/api/config/paypal` — returns client ID
- **Middleware:** `backend/middleware/authMiddleware.js` — JWT `protect` + `admin` guards. `errorMiddleware.js` — global error handler.
- **Config:** `backend/config/db.js` — Mongoose connection using `MONGO_URI` env var

### Frontend (`frontend/`)

Create React App (react-scripts 3.4.3) + Redux + React Router v5.

- **State:** Redux store (`frontend/src/store.js`) with `redux-thunk`. Reducers in `frontend/src/reducers/` for products, users, orders, cart. Cart and user auth state persisted to localStorage.
- **Actions:** `frontend/src/actions/` — async action creators calling the backend API via axios
- **Screens:** `frontend/src/screens/` — page-level components (Home, Product, Cart, Login, Register, Shipping, Payment, PlaceOrder, Order, Profile, Admin screens)
- **Components:** `frontend/src/components/` — reusable UI (Header, Footer, Rating, etc.)
- **Proxy:** `frontend/package.json` proxies API calls to `http://127.0.0.1:5001`

### Environment (`.env`)

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/proshop
JWT_SECRET=...
PAYPAL_CLIENT_ID=...
```

Port 5001 instead of 5000 — macOS AirPlay Receiver occupies 5000.

### Key Patterns

- All backend imports use `.js` extension (required by ES modules)
- JWT auth: token stored in localStorage, sent via `Authorization: Bearer` header
- Admin routes protected by `protect` + `admin` middleware chain
- Product images: uploaded via multer to `uploads/`, served as static files
- Frontend uses `NODE_OPTIONS=--openssl-legacy-provider` for Node.js v17+ compatibility with old webpack

## Commit Conventions

Every commit message must be prefixed with `COURSE:`:

```
COURSE: Fix cart calculation for discounted items
COURSE: Add product review validation
```

Example of a good commit:

```
COURSE: Fix dev environment setup for modern Node.js

  - Add NODE_OPTIONS=--openssl-legacy-provider for webpack compatibility with Node v24
  - Change dev server port from 5000 to 5001 to avoid macOS AirPlay conflict
  - Add .idea to .gitignore
  - Add Docker script for local MongoDB
  - Update package-lock files
```

## Local Gotchas

- After adding a new Mongoose model or changing a schema, run `npm run data:import` to re-seed the database
- MongoDB must be running locally before starting the server (`docker run -d -p 27017:27017 --name mongo mongo:7` or local `mongod`)
- Port 5000 is occupied by macOS AirPlay Receiver — use 5001 instead
- Node.js v17+ requires `NODE_OPTIONS=--openssl-legacy-provider` (already in `package.json` client script)
- `.env` is required but not committed — copy from teammate or create manually
- `frontend/package.json` proxy must match `PORT` in `.env`

## MR Review Checklist

### 1. Security
- No hardcoded secrets (JWT_SECRET, DB credentials, API keys)
- User input validation (NoSQL injection, XSS)
- Proper auth/authorization (JWT, middleware chain, role checks)
- Dependencies with known vulnerabilities (`npm audit`)

### 2. Structure & Architecture
- Separation of concerns (routes → controllers → models)
- No business logic in routes or thin-controller pass-throughs
- Proper middleware usage and ordering
- ES modules consistency — all imports with `.js` extension

### 3. Error Handling
- Global error handler catches unhandled errors
- Async functions use `express-async-handler` or try/catch
- Correct HTTP status codes (400, 401, 403, 404, 422, 500)
- Stack traces do not leak in production responses

### 4. Database
- No N+1 queries (check `.populate()` usage)
- Indexes on frequently queried fields
- Schema-level validation (Mongoose `required`, `match`, `enum`, etc.)
- Transactions where needed (multi-document operations)

### 5. Performance
- Pagination for list endpoints
- Caching where appropriate
- No blocking synchronous operations in request handlers
- Connection pool configured properly

### 6. Code Quality
- Clear variable/function naming
- DRY — no duplicated logic
- Single responsibility per function/component
- Consistent style (ESLint, formatting)

### 7. DevOps / Infrastructure
- `.env` not in git
- `node_modules` in `.gitignore`
- `package.json` scripts for common operations
- Proper `.dockerignore` / `Dockerfile` if applicable