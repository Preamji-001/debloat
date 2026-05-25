# DeBloat — Full-Stack Design Spec

**Date:** 2026-05-25
**Status:** Approved

---

## 1. Overview

DeBloat is a meal prep e-commerce platform for the Indian market. Customers browse a catalog of gut-health-focused meals, apply macro-based filters, add individual meals or bundle packs to cart, select a delivery slot, and pay via Razorpay. Accounts are required; there is no guest checkout.

**Brand identity:** Minimalist dark theme. Black (`#0D0D0D`) background, off-white (`#F0EFE8`) text. Logo in Press Start 2P dot-matrix font with a blinking cursor. Monospace (`Share Tech Mono`) for all labels, prices, and tags. Inter for body copy. Terminal `//` comment syntax for section labels.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS | SSR for SEO on catalog pages, server components for performance |
| Backend | Go + Gin | Clean REST API, type-safe, strong performance, team familiarity |
| Database | PostgreSQL on Neon (serverless) | Managed, generous free tier, standard SQL |
| Queries | `sqlc` | Type-safe Go from raw SQL, no ORM magic |
| Migrations | `golang-migrate` | Simple file-based migrations |
| Auth | JWT (access + refresh) in httpOnly cookies | Secure, stateless |
| Payments | Razorpay | India-first, UPI + cards + netbanking |
| FE hosting | Vercel | Native Next.js support |
| BE hosting | Railway or Fly.io | Simple Go container deployment |

---

## 3. Repository Structure

```
debloat/
├── frontend/                   # Next.js 14 App Router
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Home
│   │   │   ├── menu/page.tsx         # Menu catalog + macro filters
│   │   │   ├── menu/[id]/page.tsx    # Meal detail
│   │   │   ├── plans/page.tsx        # Meal plans / bundles
│   │   │   └── plans/[id]/page.tsx   # Plan detail
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (account)/
│   │   │   ├── account/page.tsx      # Order history
│   │   │   ├── account/orders/[id]/page.tsx
│   │   │   └── account/profile/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order-confirmed/page.tsx
│   │   └── admin/
│   │       ├── page.tsx              # Meal availability toggles
│   │       └── orders/page.tsx       # Order list
│   ├── components/
│   │   ├── ui/                       # Primitives: Button, Input, Slot, Toggle
│   │   ├── layout/                   # Nav, Footer
│   │   ├── meals/                    # MealCard, MealGrid, MacroFilters, MacroSlider
│   │   ├── cart/                     # CartDrawer, CartItem
│   │   ├── checkout/                 # SlotPicker, AddressForm, OrderSummary
│   │   └── admin/                    # MealToggleRow, OrderRow
│   ├── lib/
│   │   ├── api.ts                    # Typed fetch wrapper
│   │   └── types.ts                  # Shared TS types (Meal, Order, DeliverySlot…)
│   └── tailwind.config.ts
│
└── backend/
    ├── cmd/server/main.go
    ├── internal/
    │   ├── auth/                     # JWT issue/validate/refresh
    │   ├── handler/                  # Gin route handlers
    │   │   ├── auth.go
    │   │   ├── meals.go
    │   │   ├── meal_plans.go
    │   │   ├── cart.go
    │   │   ├── orders.go
    │   │   ├── delivery_slots.go
    │   │   ├── account.go
    │   │   ├── admin.go
    │   │   └── webhook.go
    │   ├── middleware/               # AuthRequired, AdminRequired, CORS
    │   ├── db/
    │   │   ├── query/                # sqlc .sql files
    │   │   └── sqlc/                 # Generated Go DB code
    │   └── razorpay/                 # Order creation + signature verification
    ├── migrations/
    └── sqlc.yaml
```

---

## 4. Pages

| Page | Route | Auth | Notes |
|---|---|---|---|
| Home | `/` | Public | Hero, stats, featured meals |
| Menu | `/menu` | Public | Catalog + macro filters + category pills |
| Meal detail | `/menu/:id` | Public | Macros, description, add to cart |
| Meal plans | `/plans` | Public | 3-tier pricing cards |
| Plan detail | `/plans/:id` | Public | Plan description + buy now (adds to cart as N meal slots) |
| Login | `/login` | Public | Redirect to `/menu` after |
| Register | `/register` | Public | Name, email, phone, password |
| Cart | `/cart` | Auth | Items, quantities, slot summary |
| Checkout | `/checkout` | Auth | Address, slot picker, order summary, Razorpay |
| Order confirmed | `/order-confirmed` | Auth | Success state, order ID |
| Account / Orders | `/account` | Auth | Order history list |
| Order detail | `/account/orders/:id` | Auth | Status, items, delivery info |
| Profile | `/account/profile` | Auth | Name, phone, saved addresses |
| Admin — meals | `/admin` | Admin | Toggle meal availability |
| Admin — orders | `/admin/orders` | Admin | Today's orders, status badges |

---

## 5. Data Model

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',  -- 'customer' | 'admin'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Addresses
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT,                    -- "Home", "Office"
  line1       TEXT NOT NULL,
  city        TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meals
CREATE TABLE meals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL,          -- 'high_protein' | 'gut_reset' | 'low_carb' | 'veg' | 'non_veg'
  kcal         INT NOT NULL,
  protein_g    NUMERIC(5,1) NOT NULL,
  carbs_g      NUMERIC(5,1) NOT NULL,
  fat_g        NUMERIC(5,1) NOT NULL,
  price_paise  INT NOT NULL,
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meal Plans (Bundles)
CREATE TABLE meal_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,         -- "5-Meal Pack", "10-Meal Pack"
  description   TEXT,
  meal_count    INT NOT NULL,
  price_paise   INT NOT NULL,
  discount_pct  NUMERIC(4,1) NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true
);

-- NOTE: meal_plan_items is out of scope for MVP.
-- Plans define count + price + discount only. Customers select any meals
-- from the full catalog when building their cart; no pre-curation needed.

-- Delivery Slots
CREATE TABLE delivery_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  label        TEXT NOT NULL,          -- "Wed 7–10am"
  capacity     INT NOT NULL DEFAULT 50,
  booked_count INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

-- Cart Items (server-side, per user)
CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id    UUID NOT NULL REFERENCES meals(id),
  quantity   INT NOT NULL DEFAULT 1,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, meal_id)
);

-- Orders
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  address_id            UUID NOT NULL REFERENCES addresses(id),
  delivery_slot_id      UUID NOT NULL REFERENCES delivery_slots(id),
  status                TEXT NOT NULL DEFAULT 'pending_payment',
  total_paise           INT NOT NULL,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- status enum: pending_payment | confirmed | preparing | out_for_delivery | delivered | cancelled

-- Order Items (snapshot of meal at time of order)
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  meal_id      UUID REFERENCES meals(id),
  meal_name    TEXT NOT NULL,          -- snapshot: survives meal deletion
  quantity     INT NOT NULL,
  price_paise  INT NOT NULL
);
```

---

## 6. API Routes

All routes prefixed `/api/v1`. Auth uses JWT in httpOnly cookie (`access_token`). Refresh token in separate httpOnly cookie (`refresh_token`).

### Auth
```
POST /auth/register          Body: {name, email, phone, password}
POST /auth/login             Body: {email, password}
POST /auth/logout            Clears cookies
POST /auth/refresh           Uses refresh_token cookie → new access_token
```

### Meals
```
GET  /meals                  ?kcal_max=&protein_min=&carbs_max=&fat_max=&category=
GET  /meals/:id
```

### Meal Plans
```
GET  /meal-plans
GET  /meal-plans/:id
```

### Delivery Slots
```
GET  /delivery-slots         ?date=YYYY-MM-DD  (returns available slots for date range)
```

### Cart  *(auth required)*
```
GET    /cart
POST   /cart/items           Body: {meal_id, quantity}
PATCH  /cart/items/:id       Body: {quantity}
DELETE /cart/items/:id
DELETE /cart                 Clear cart
```

### Orders  *(auth required)*
```
POST /orders                 Body: {address_id, delivery_slot_id}
                             → Creates Razorpay order, returns {razorpay_order_id, amount, key}
POST /orders/:id/verify      Body: {razorpay_payment_id, razorpay_signature}
                             → Verifies signature, sets status=confirmed, clears cart
GET  /orders                 User's order history
GET  /orders/:id
```

### Account  *(auth required)*
```
GET   /me
PATCH /me                    Body: {name, phone}
GET   /me/addresses
POST  /me/addresses          Body: {label, line1, city, pincode, is_default}
PATCH /me/addresses/:id
```

### Admin  *(auth required, role=admin)*
```
GET   /admin/orders          ?date=YYYY-MM-DD&status=
PATCH /admin/meals/:id/availability   Body: {is_available: bool}
```

### Webhook
```
POST /webhooks/razorpay      Validates X-Razorpay-Signature header
                             Handles: payment.captured → confirm order
                                      payment.failed   → cancel order
```

---

## 7. Auth Flow

1. **Register/Login** → BE issues short-lived JWT access token (15 min) + long-lived refresh token (7 days), both in httpOnly cookies.
2. **Authenticated requests** → FE sends cookies automatically (same-origin or CORS with credentials).
3. **Expiry** → FE detects 401, calls `POST /auth/refresh`, retries original request.
4. **Logout** → Server clears both cookies.
5. **Admin check** → `role` claim in JWT; `AdminRequired` middleware rejects non-admins with 403.

---

## 8. Payment Flow

1. Customer clicks "Pay via Razorpay" → FE calls `POST /orders`.
2. BE creates Razorpay order via Razorpay API, stores `razorpay_order_id` on order row, returns `{razorpay_order_id, amount, key_id}`.
3. FE opens Razorpay checkout modal.
4. On success, Razorpay returns `{razorpay_payment_id, razorpay_signature}`.
5. FE calls `POST /orders/:id/verify` with those values.
6. BE verifies HMAC-SHA256 signature. If valid: sets `status=confirmed`, decrements delivery slot `booked_count`, clears user's cart.
7. FE redirects to `/order-confirmed`.
8. Webhook (`payment.captured`) as secondary confirmation for edge cases.

---

## 9. Macro Filter Design

**Frontend:** Four independent range sliders — Calories (max), Protein (min), Carbs (max), Fat (max). Explicit Apply button; no auto-filter on drag. Active filter tags shown below sliders with individual dismiss (`×`). Live result count shown in tag bar.

**Backend:** `GET /meals` accepts query params `kcal_max`, `protein_min`, `carbs_max`, `fat_max`. All optional; absent params apply no constraint. Filters are AND-combined. sqlc query uses conditional WHERE clauses.

---

## 10. Error Handling

- BE returns consistent JSON: `{"error": {"code": "SLOT_FULL", "message": "…"}}`
- FE displays inline errors on forms; toast notifications for cart/order actions
- Razorpay modal dismissed without payment → order stays `pending_payment`, cleaned up by a nightly cron after 24h
- Delivery slot capacity enforced with a DB-level check on `booked_count < capacity` at order creation

---

## 11. Design System

| Token | Value |
|---|---|
| `--bg` | `#0D0D0D` |
| `--surface` | `#161616` |
| `--surface2` | `#1E1E1E` |
| `--border` | `#2A2A2A` |
| `--off-white` | `#F0EFE8` |
| `--muted` | `#666666` |
| Font — Logo | Press Start 2P (dot matrix) |
| Font — Mono | Share Tech Mono |
| Font — Body | Inter |
| Spacing unit | 8px base grid |
| Border radius | 0px (sharp throughout) |
| Transitions | 150ms ease |

---

## 12. Out of Scope (MVP)

- Email / SMS notifications (post-MVP)
- Subscription / recurring orders
- Multi-city delivery routing
- Reviews and ratings
- Loyalty / referral system
- Full analytics dashboard (admin)
