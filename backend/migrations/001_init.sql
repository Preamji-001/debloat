CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  phone        TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'customer',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL,
  kcal         INT NOT NULL,
  protein_g    INT NOT NULL,
  carbs_g      INT NOT NULL,
  fat_g        INT NOT NULL,
  price_paise  INT NOT NULL,
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  meal_count   INT NOT NULL,
  price_paise  INT NOT NULL,
  discount_pct INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS delivery_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  label        TEXT NOT NULL,
  capacity     INT NOT NULL,
  booked_count INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  line1      TEXT NOT NULL,
  city       TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS cart_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id  UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, meal_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id),
  address_id         UUID NOT NULL REFERENCES addresses(id),
  slot_id            UUID NOT NULL REFERENCES delivery_slots(id),
  status             TEXT NOT NULL DEFAULT 'pending_payment',
  total_paise        INT NOT NULL,
  razorpay_order_id  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  meal_id     UUID NOT NULL REFERENCES meals(id),
  meal_name   TEXT NOT NULL,
  quantity    INT NOT NULL,
  price_paise INT NOT NULL
);
