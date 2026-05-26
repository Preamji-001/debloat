# DeBloat Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Next.js 14 App Router frontend for DeBloat meal prep e-commerce.

**Architecture:** Next.js 14 App Router with server components for public catalog pages (SSR for SEO), client components for interactive features (cart, filters, checkout). JWT auth managed via httpOnly cookies set by the Go backend — no client-side token storage.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Jest + React Testing Library, Playwright

---

## Shared Types (used throughout all tasks)

```typescript
// frontend/lib/types.ts
export type Meal = {
  id: string; name: string; description: string | null
  category: 'high_protein' | 'gut_reset' | 'low_carb' | 'veg' | 'non_veg'
  kcal: number; protein_g: number; carbs_g: number; fat_g: number
  price_paise: number; image_url: string | null; is_available: boolean
}
export type MealPlan = {
  id: string; name: string; description: string | null
  meal_count: number; price_paise: number; discount_pct: number; is_active: boolean
}
export type DeliverySlot = {
  id: string; date: string; label: string
  capacity: number; booked_count: number; is_active: boolean
}
export type CartItem = { id: string; meal_id: string; meal: Meal; quantity: number }
export type Address = { id: string; label: string | null; line1: string; city: string; pincode: string; is_default: boolean }
export type Order = {
  id: string
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total_paise: number; created_at: string; delivery_slot: DeliverySlot; items: OrderItem[]
}
export type OrderItem = { id: string; meal_name: string; quantity: number; price_paise: number }
export type User = { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin' }
export type MacroFilters = { kcal_max: number | null; protein_min: number | null; carbs_max: number | null; fat_max: number | null; category: string | null }
export type ApiError = { error: { code: string; message: string } }
```

---

## Task 1: Project Setup

- [ ] Scaffold Next.js 14 app
- [ ] Configure Google Fonts
- [ ] Add Tailwind design tokens
- [ ] Install and configure Jest + RTL
- [ ] Commit

### 1.1 Scaffold

```bash
cd /Users/tazapay/personal/debloat
npx create-next-app@14 frontend \
  --typescript --tailwind --app --src-dir=no --import-alias='@/*'
# Expected: ✓ Next.js 14.x project created
cd frontend
```

### 1.2 Install deps

```bash
npm install zustand
npm install -D jest jest-environment-jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event \
  @types/jest ts-jest
# Expected: added N packages
```

### 1.3 `frontend/jest.config.ts`

```typescript
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
}

export default config
```

### 1.4 `frontend/jest.setup.ts`

```typescript
import '@testing-library/jest-dom'
```

### 1.5 `frontend/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Google Fonts via next/font/google for Share Tech Mono and Press Start 2P
// Load as CSS variables and apply in globals.css
export const metadata: Metadata = {
  title: 'DeBloat — Clean Meal Prep',
  description: 'Macro-tracked meal prep. No junk. Just gains.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0D0D0D] text-[#F0EFE8] min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### 1.6 `frontend/app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0D0D0D;
  --color-surface: #161616;
  --color-surface2: #1E1E1E;
  --color-border: #2A2A2A;
  --color-off-white: #F0EFE8;
  --color-muted: #666666;
  --font-logo: 'Press Start 2P', monospace;
  --font-mono: 'Share Tech Mono', monospace;
  --font-body: 'Inter', sans-serif;
}

* { border-radius: 0 !important; }

body {
  font-family: var(--font-body);
  transition: all 150ms ease;
}
```

### 1.7 `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#161616',
        surface2: '#1E1E1E',
        border: '#2A2A2A',
        'off-white': '#F0EFE8',
        muted: '#666666',
      },
      fontFamily: {
        logo: ['Press Start 2P', 'monospace'],
        mono: ['Share Tech Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      transitionDuration: { DEFAULT: '150ms' },
      borderRadius: { DEFAULT: '0px', none: '0px' },
    },
  },
  plugins: [],
}

export default config
```

### 1.8 Verify

```bash
npm run build
# Expected: ✓ Compiled successfully
npm test -- --passWithNoTests
# Expected: Test Suites: 0 passed
```

---

## Task 2: Shared Types + API Client

- [ ] Write `frontend/lib/types.ts`
- [ ] Write failing tests for api.ts
- [ ] Implement `frontend/lib/api.ts`
- [ ] Verify tests pass
- [ ] Commit

### 2.1 `frontend/lib/types.ts`

Copy the shared types block from the top of this document verbatim.

### 2.2 `frontend/lib/__tests__/api.test.ts`

```typescript
import { getMeals, login, getCart } from '@/lib/api'

const BASE = 'http://localhost:8080/api/v1'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => jest.resetAllMocks())

describe('apiFetch 401 retry', () => {
  it('retries once after 401 by calling /auth/refresh then re-requesting', async () => {
    const mockFetch = global.fetch as jest.Mock
    // First call → 401
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    // Refresh call → 200
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
    // Retry → 200 with data
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: [] }) })

    const result = await getCart()
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${BASE}/auth/refresh`, expect.objectContaining({ method: 'POST' }))
  })

  it('throws on second 401 after refresh', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }) })

    await expect(getCart()).rejects.toThrow('Unauthorized')
  })
})

describe('getMeals', () => {
  it('builds query string from MacroFilters', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: [] }) })

    await getMeals({ kcal_max: 500, protein_min: 30, carbs_max: null, fat_max: null, category: 'high_protein' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('kcal_max=500')
    expect(calledUrl).toContain('protein_min=30')
    expect(calledUrl).toContain('category=high_protein')
    expect(calledUrl).not.toContain('carbs_max')
    expect(calledUrl).not.toContain('fat_max')
  })
})
```

### 2.3 Run failing tests

```bash
npm test lib/__tests__/api.test.ts
# Expected: FAIL — Cannot find module '@/lib/api'
```

### 2.4 `frontend/lib/api.ts`

```typescript
import type { Meal, MealPlan, DeliverySlot, CartItem, Address, Order, User, MacroFilters } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, { credentials: 'include', ...options })

  if (res.status === 401) {
    // Attempt token refresh
    await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    // Retry original request
    const retry = await fetch(url, { credentials: 'include', ...options })
    if (!retry.ok) {
      const body = await retry.json()
      throw new Error(body?.error?.message ?? 'Unauthorized')
    }
    return retry.json() as Promise<T>
  }

  if (!res.ok) {
    const body = await res.json()
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined) q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

// Meals
export const getMeals = (filters: MacroFilters) =>
  apiFetch<{ data: Meal[] }>(`/meals${buildQuery({ ...filters })}`)

export const getMeal = (id: string) =>
  apiFetch<{ data: Meal }>(`/meals/${id}`)

// Plans
export const getMealPlans = () =>
  apiFetch<{ data: MealPlan[] }>('/meal-plans')

export const getMealPlan = (id: string) =>
  apiFetch<{ data: MealPlan }>(`/meal-plans/${id}`)

// Slots
export const getDeliverySlots = (date: string) =>
  apiFetch<{ data: DeliverySlot[] }>(`/delivery-slots${buildQuery({ date })}`)

// Cart
export const getCart = () =>
  apiFetch<{ data: CartItem[] }>('/cart')

export const addToCart = (meal_id: string, quantity: number) =>
  apiFetch<{ data: CartItem }>('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meal_id, quantity }),
  })

export const updateCartItem = (id: string, quantity: number) =>
  apiFetch<{ data: CartItem }>(`/cart/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })

export const deleteCartItem = (id: string) =>
  apiFetch<void>(`/cart/${id}`, { method: 'DELETE' })

export const clearCart = () =>
  apiFetch<void>('/cart', { method: 'DELETE' })

// Orders
export const createOrder = (address_id: string, delivery_slot_id: string) =>
  apiFetch<{ data: { id: string; razorpay_order_id: string; amount: number; key_id: string } }>('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address_id, delivery_slot_id }),
  })

export const verifyOrder = (id: string, payment_id: string, signature: string) =>
  apiFetch<{ data: Order }>(`/orders/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ razorpay_payment_id: payment_id, razorpay_signature: signature }),
  })

export const getOrders = () =>
  apiFetch<{ data: Order[] }>('/orders')

export const getOrder = (id: string) =>
  apiFetch<{ data: Order }>(`/orders/${id}`)

// Auth
export const getMe = () =>
  apiFetch<{ data: User }>('/auth/me')

export const updateMe = (name: string, phone: string) =>
  apiFetch<{ data: User }>('/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })

export const login = (email: string, password: string) =>
  apiFetch<{ data: User }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

export const register = (name: string, email: string, phone: string, password: string) =>
  apiFetch<{ data: User }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password }),
  })

export const logout = () =>
  apiFetch<void>('/auth/logout', { method: 'POST' })

// Addresses
export const getAddresses = () =>
  apiFetch<{ data: Address[] }>('/addresses')

export const addAddress = (data: Omit<Address, 'id' | 'is_default'>) =>
  apiFetch<{ data: Address }>('/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateAddress = (id: string, data: Partial<Omit<Address, 'id'>>) =>
  apiFetch<{ data: Address }>(`/addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

// Admin
export const getAdminOrders = (date?: string, status?: string) =>
  apiFetch<{ data: Order[] }>(`/admin/orders${buildQuery({ date, status })}`)

export const setMealAvailability = (id: string, is_available: boolean) =>
  apiFetch<{ data: Meal }>(`/admin/meals/${id}/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available }),
  })
```

### 2.5 Verify

```bash
npm test lib/__tests__/api.test.ts
# Expected: PASS — 3 tests passed
```

---

## Task 3: UI Primitives

- [ ] Write failing tests
- [ ] Implement Button, Input, Toggle
- [ ] Verify tests pass
- [ ] Commit

### 3.1 `frontend/components/ui/__tests__/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

test('renders primary variant with children', () => {
  render(<Button variant="primary">Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})

test('applies danger styles', () => {
  render(<Button variant="danger">Delete</Button>)
  const btn = screen.getByRole('button')
  expect(btn.className).toMatch(/red/)
})

test('fires onClick', () => {
  const handler = jest.fn()
  render(<Button variant="primary" onClick={handler}>Go</Button>)
  fireEvent.click(screen.getByRole('button'))
  expect(handler).toHaveBeenCalledTimes(1)
})

test('sm size applies smaller padding', () => {
  render(<Button variant="ghost" size="sm">Small</Button>)
  const btn = screen.getByRole('button')
  expect(btn.className).toMatch(/px-3/)
})
```

### 3.2 `frontend/components/ui/__tests__/Input.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import Input from '../Input'

test('renders with label', () => {
  render(<Input label="Email" name="email" />)
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})

test('shows error message', () => {
  render(<Input label="Email" name="email" error="Required" />)
  expect(screen.getByText('Required')).toBeInTheDocument()
})
```

### 3.3 `frontend/components/ui/__tests__/Toggle.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from '../Toggle'

test('calls onChange with toggled value', () => {
  const handler = jest.fn()
  render(<Toggle checked={false} onChange={handler} />)
  fireEvent.click(screen.getByRole('checkbox'))
  expect(handler).toHaveBeenCalledWith(true)
})
```

### 3.4 Run failing tests

```bash
npm test components/ui
# Expected: FAIL — Cannot find module
```

### 3.5 `frontend/components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-off-white text-bg hover:bg-[#d8d7d0] font-medium',
  ghost: 'bg-transparent text-off-white border border-off-white hover:bg-surface2',
  danger: 'bg-transparent text-red-400 border border-red-400 hover:bg-red-400/10',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
}

export default function Button({ variant, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        font-mono
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    />
  )
}
```

### 3.6 `frontend/components/ui/Input.tsx`

```typescript
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
}

export default function Input({ label, name, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-muted text-xs font-mono uppercase tracking-wider">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`
          bg-surface text-off-white border
          ${error ? 'border-red-400' : 'border-border'}
          focus:outline-none focus:border-off-white
          px-3 py-2 text-sm font-body
          transition-colors duration-150
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-red-400 text-xs font-mono">{error}</span>}
    </div>
  )
}
```

### 3.7 `frontend/components/ui/Toggle.tsx`

```typescript
interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div
        className={`
          w-10 h-5 relative transition-colors duration-150
          ${checked ? 'bg-off-white' : 'bg-surface2 border border-border'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 bg-bg transition-transform duration-150
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </div>
      {label && <span className="text-sm font-mono text-off-white">{label}</span>}
    </label>
  )
}
```

### 3.8 Verify

```bash
npm test components/ui
# Expected: PASS — 6 tests passed
```

---

## Task 4: Layout (Nav + Footer)

- [ ] Write failing tests for Nav
- [ ] Implement Nav, Footer
- [ ] Wire into app/layout.tsx
- [ ] Verify tests pass
- [ ] Commit

### 4.1 `frontend/components/layout/__tests__/Nav.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import Nav from '../Nav'

// Mock next/navigation
jest.mock('next/navigation', () => ({ usePathname: () '/', useRouter: () => ({ push: jest.fn() }) }))
// Mock cartStore
jest.mock('@/lib/cartStore', () => ({ useCartStore: () => ({ items: [{ id: '1' }, { id: '2' }] }) }))

test('renders logo text', () => {
  render(<Nav />)
  expect(screen.getByText('DEBLOAT')).toBeInTheDocument()
})

test('shows cart item count badge', () => {
  render(<Nav />)
  expect(screen.getByText('2')).toBeInTheDocument()
})
```

### 4.2 Run failing tests

```bash
npm test components/layout
# Expected: FAIL
```

### 4.3 `frontend/components/layout/Nav.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/cartStore'
import { ShoppingBag } from 'lucide-react'

const links = [
  { href: '/menu', label: '// menu' },
  { href: '/plans', label: '// plans' },
  { href: '/account', label: '// account' },
]

export default function Nav() {
  const pathname = usePathname()
  const items = useCartStore(s => s.items)

  return (
    <nav className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
      <Link href="/" className="font-logo text-sm text-off-white tracking-wider flex items-center gap-1">
        DEBLOAT
        <span className="animate-pulse">_</span>
      </Link>

      <div className="flex items-center gap-6">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`font-mono text-xs transition-colors duration-150 ${
              pathname.startsWith(l.href) ? 'text-off-white' : 'text-muted hover:text-off-white'
            }`}
          >
            {l.label}
          </Link>
        ))}

        <Link href="/cart" className="relative text-off-white hover:text-muted transition-colors duration-150">
          <ShoppingBag size={18} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-off-white text-bg text-[10px] font-mono w-4 h-4 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
```

### 4.4 `frontend/components/layout/Footer.tsx`

```typescript
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-6 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="font-logo text-xs text-muted">DEBLOAT</span>
        <span className="font-mono text-xs text-muted">// eat clean. live lean.</span>
      </div>
    </footer>
  )
}
```

### 4.5 Install lucide-react

```bash
npm install lucide-react
# Expected: added lucide-react
```

### 4.6 Verify

```bash
npm test components/layout
# Expected: PASS — 2 tests passed
```

---

## Task 5: Home Page

- [ ] Implement `frontend/app/(public)/page.tsx`
- [ ] No unit test (server component; covered by Playwright e2e)
- [ ] Commit

### 5.1 `frontend/app/(public)/page.tsx`

```typescript
import Link from 'next/link'
import { getMeals } from '@/lib/api'
import MealCard from '@/components/meals/MealCard'
import Button from '@/components/ui/Button'

export default async function HomePage() {
  let featuredMeals = []
  try {
    const res = await getMeals({ kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null })
    featuredMeals = res.data.slice(0, 3)
  } catch {
    // silently degrade — backend may not be running during build
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 border-b border-border">
        <p className="font-mono text-muted text-xs mb-4 tracking-widest">// meal prep. redefined.</p>
        <h1 className="font-logo text-3xl md:text-5xl text-off-white leading-tight mb-6">
          EAT CLEAN.<br />TRACK MACROS.<br />FEEL HUMAN.
        </h1>
        <p className="font-body text-muted text-lg mb-8 max-w-xl">
          No seed oils. No nonsense. Just macro-balanced meals delivered to your door.
        </p>
        <Link href="/menu">
          <Button variant="primary" size="md">// browse menu</Button>
        </Link>
      </section>

      {/* Stats bar */}
      <section className="py-8 border-b border-border grid grid-cols-3 gap-4">
        {[
          { label: '// macros tracked', value: '4' },
          { label: '// meals available', value: '12+' },
          { label: '// happy guts', value: '∞' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="font-logo text-2xl text-off-white mb-1">{stat.value}</div>
            <div className="font-mono text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured meals */}
      {featuredMeals.length > 0 && (
        <section className="py-16">
          <h2 className="font-mono text-muted text-xs tracking-widest mb-8">// featured meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMeals.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

---

## Task 6: MacroFilters Component

- [ ] Write failing tests
- [ ] Implement MacroSlider, MacroFilters
- [ ] Verify tests pass
- [ ] Commit

### 6.1 `frontend/components/meals/__tests__/MacroFilters.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MacroFilters from '../MacroFilters'
import type { MacroFilters as MF } from '@/lib/types'

const defaultFilters: MF = {
  kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null
}

test('Apply button calls onChange with current slider values', () => {
  const onChange = jest.fn()
  const onApply = jest.fn()
  render(<MacroFilters filters={defaultFilters} onChange={onChange} onApply={onApply} resultCount={5} />)
  fireEvent.click(screen.getByRole('button', { name: /apply/i }))
  expect(onChange).toHaveBeenCalled()
  expect(onApply).toHaveBeenCalled()
})

test('shows result count', () => {
  render(<MacroFilters filters={defaultFilters} onChange={jest.fn()} onApply={jest.fn()} resultCount={7} />)
  expect(screen.getByText(/7 meals/i)).toBeInTheDocument()
})

test('dismissing a filter tag calls onChange with that filter nulled', () => {
  const onChange = jest.fn()
  const filtersWithKcal: MF = { ...defaultFilters, kcal_max: 500 }
  render(<MacroFilters filters={filtersWithKcal} onChange={onChange} onApply={jest.fn()} resultCount={3} />)
  fireEvent.click(screen.getByLabelText(/remove kcal/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ kcal_max: null }))
})

test('category pill click updates category filter', () => {
  const onChange = jest.fn()
  render(<MacroFilters filters={defaultFilters} onChange={onChange} onApply={jest.fn()} resultCount={0} />)
  fireEvent.click(screen.getByRole('button', { name: /high protein/i }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'high_protein' }))
})
```

### 6.2 Run failing tests

```bash
npm test components/meals/__tests__/MacroFilters
# Expected: FAIL
```

### 6.3 `frontend/components/meals/MacroSlider.tsx`

```typescript
interface MacroSliderProps {
  label: string
  min: number
  max: number
  value: number | null
  onChange: (v: number | null) => void
  unit?: string
}

export default function MacroSlider({ label, min, max, value, onChange, unit = '' }: MacroSliderProps) {
  const current = value ?? max

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs text-muted uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs text-off-white">
          {value === null ? 'any' : `≤ ${current}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={current}
        onChange={e => onChange(Number(e.target.value) === max ? null : Number(e.target.value))}
        className="w-full accent-off-white h-1 bg-surface2 appearance-none"
        aria-label={label}
      />
    </div>
  )
}
```

### 6.4 `frontend/components/meals/MacroFilters.tsx`

```typescript
'use client'

import { useState } from 'react'
import MacroSlider from './MacroSlider'
import Button from '@/components/ui/Button'
import type { MacroFilters as MF } from '@/lib/types'

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'High Protein', value: 'high_protein' },
  { label: 'Gut Reset', value: 'gut_reset' },
  { label: 'Low Carb', value: 'low_carb' },
  { label: 'Veg', value: 'veg' },
  { label: 'Non-Veg', value: 'non_veg' },
]

interface Props {
  filters: MF
  onChange: (f: MF) => void
  onApply: () => void
  resultCount: number
}

export default function MacroFilters({ filters, onChange, onApply, resultCount }: Props) {
  const [draft, setDraft] = useState<MF>(filters)

  const handleApply = () => {
    onChange(draft)
    onApply()
  }

  const handleDismiss = (key: keyof MF) => {
    const updated = { ...filters, [key]: null }
    onChange(updated)
    setDraft(updated)
  }

  const activeTags = Object.entries(filters).filter(([, v]) => v !== null) as [keyof MF, string | number][]

  return (
    <div className="bg-surface border border-border p-4 flex flex-col gap-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={String(cat.value)}
            onClick={() => {
              const updated = { ...draft, category: cat.value }
              setDraft(updated)
              onChange(updated)
            }}
            className={`font-mono text-xs px-3 py-1 border transition-colors duration-150 ${
              draft.category === cat.value
                ? 'bg-off-white text-bg border-off-white'
                : 'bg-transparent text-muted border-border hover:border-off-white hover:text-off-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <MacroSlider label="kcal max" min={200} max={1000} value={draft.kcal_max} onChange={v => setDraft(d => ({ ...d, kcal_max: v }))} unit=" kcal" />
      <MacroSlider label="protein min" min={0} max={100} value={draft.protein_min} onChange={v => setDraft(d => ({ ...d, protein_min: v }))} unit="g" />
      <MacroSlider label="carbs max" min={0} max={150} value={draft.carbs_max} onChange={v => setDraft(d => ({ ...d, carbs_max: v }))} unit="g" />
      <MacroSlider label="fat max" min={0} max={80} value={draft.fat_max} onChange={v => setDraft(d => ({ ...d, fat_max: v }))} unit="g" />

      {/* Active filter tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTags.map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 font-mono text-xs border border-border px-2 py-0.5 text-muted">
              {key}: {String(val)}
              <button
                onClick={() => handleDismiss(key)}
                aria-label={`remove ${key}`}
                className="text-muted hover:text-off-white ml-1"
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">{resultCount} meals found</span>
        <Button variant="primary" size="sm" onClick={handleApply}>// apply</Button>
      </div>
    </div>
  )
}
```

### 6.5 Verify

```bash
npm test components/meals/__tests__/MacroFilters
# Expected: PASS — 4 tests passed
```

---

## Task 7: MealCard + MealGrid

- [ ] Write failing tests
- [ ] Implement MealCard, MealGrid
- [ ] Verify tests pass
- [ ] Commit

### 7.1 `frontend/components/meals/__tests__/MealCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MealCard from '../MealCard'
import type { Meal } from '@/lib/types'

const meal: Meal = {
  id: '1', name: 'Chicken Bowl', description: 'Lean protein bowl',
  category: 'high_protein', kcal: 450, protein_g: 45, carbs_g: 30, fat_g: 10,
  price_paise: 19900, image_url: null, is_available: true,
}

test('renders meal name and price', () => {
  render(<MealCard meal={meal} />)
  expect(screen.getByText('Chicken Bowl')).toBeInTheDocument()
  expect(screen.getByText('₹199')).toBeInTheDocument()
})

test('renders macro pills', () => {
  render(<MealCard meal={meal} />)
  expect(screen.getByText(/45g P/i)).toBeInTheDocument()
  expect(screen.getByText(/30g C/i)).toBeInTheDocument()
  expect(screen.getByText(/10g F/i)).toBeInTheDocument()
  expect(screen.getByText(/450 kcal/i)).toBeInTheDocument()
})

test('fires onAddToCart when button clicked', () => {
  const handler = jest.fn()
  render(<MealCard meal={meal} onAddToCart={handler} />)
  fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
  expect(handler).toHaveBeenCalledWith(meal.id)
})

test('shows unavailable overlay when is_available is false', () => {
  render(<MealCard meal={{ ...meal, is_available: false }} />)
  expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
})
```

### 7.2 Run failing tests

```bash
npm test components/meals/__tests__/MealCard
# Expected: FAIL
```

### 7.3 `frontend/components/meals/MealCard.tsx`

```typescript
import Link from 'next/link'
import type { Meal } from '@/lib/types'
import Button from '@/components/ui/Button'

interface Props {
  meal: Meal
  onAddToCart?: (id: string) => void
}

const fmt = (paise: number) => `₹${Math.round(paise / 100)}`

export default function MealCard({ meal, onAddToCart }: Props) {
  return (
    <div className="relative bg-surface border border-border flex flex-col">
      {/* Image placeholder */}
      <div className="h-40 bg-surface2 border-b border-border flex items-center justify-center">
        {meal.image_url
          ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
          : <span className="font-mono text-xs text-muted">// no image</span>
        }
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link href={`/menu/${meal.id}`}>
          <h3 className="font-mono text-sm text-off-white hover:text-muted transition-colors duration-150">
            {meal.name}
          </h3>
        </Link>

        {/* Macro pills */}
        <div className="flex flex-wrap gap-1">
          {[
            `${meal.protein_g}g P`,
            `${meal.carbs_g}g C`,
            `${meal.fat_g}g F`,
            `${meal.kcal} kcal`,
          ].map(tag => (
            <span key={tag} className="font-mono text-[10px] text-muted border border-border px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="font-mono text-sm text-off-white">{fmt(meal.price_paise)}</span>
          {meal.is_available && onAddToCart && (
            <Button variant="ghost" size="sm" onClick={() => onAddToCart(meal.id)}>
              // add to cart
            </Button>
          )}
        </div>
      </div>

      {/* Unavailable overlay */}
      {!meal.is_available && (
        <div className="absolute inset-0 bg-bg/70 flex items-center justify-center">
          <span className="font-mono text-xs text-muted border border-border px-3 py-1">UNAVAILABLE</span>
        </div>
      )}
    </div>
  )
}
```

### 7.4 `frontend/components/meals/MealGrid.tsx`

```typescript
import type { Meal } from '@/lib/types'
import MealCard from './MealCard'

interface Props {
  meals: Meal[]
  onAddToCart?: (id: string) => void
}

export default function MealGrid({ meals, onAddToCart }: Props) {
  if (meals.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="font-mono text-muted text-sm">// no meals match your filters</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {meals.map(meal => (
        <MealCard key={meal.id} meal={meal} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
```

### 7.5 Verify

```bash
npm test components/meals/__tests__/MealCard
# Expected: PASS — 4 tests passed
```

---

## Task 8: Menu Page

- [ ] Write failing tests
- [ ] Implement menu page
- [ ] Verify tests pass
- [ ] Commit

### 8.1 `frontend/app/(public)/menu/__tests__/MenuPage.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MenuPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), useSearchParams: () => new URLSearchParams() }))

const mockMeals = [
  { id: '1', name: 'Bowl A', category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, price_paise: 15000, image_url: null, is_available: true, description: null },
]

beforeEach(() => {
  (api.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals })
})

test('calls getMeals and renders meal grid', async () => {
  render(<MenuPage />)
  await waitFor(() => expect(screen.getByText('Bowl A')).toBeInTheDocument())
})

test('clicking category pill updates filter and re-fetches', async () => {
  render(<MenuPage />)
  await waitFor(() => screen.getByText('Bowl A'))
  fireEvent.click(screen.getByRole('button', { name: /high protein/i }))
  await waitFor(() => expect(api.getMeals).toHaveBeenCalledWith(expect.objectContaining({ category: 'high_protein' })))
})
```

### 8.2 Run failing tests

```bash
npm test app/\(public\)/menu/__tests__/MenuPage
# Expected: FAIL
```

### 8.3 `frontend/app/(public)/menu/page.tsx`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMeals, addToCart } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import MacroFilters from '@/components/meals/MacroFilters'
import MealGrid from '@/components/meals/MealGrid'
import type { Meal, MacroFilters as MF } from '@/lib/types'

const DEFAULT_FILTERS: MF = {
  kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null
}

export default function MenuPage() {
  const [filters, setFilters] = useState<MF>(DEFAULT_FILTERS)
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const loadCart = useCartStore(s => s.loadCart)

  const fetchMeals = useCallback(async (f: MF) => {
    setLoading(true)
    try {
      const res = await getMeals(f)
      setMeals(res.data)
    } catch {
      setMeals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMeals(filters) }, [])

  const handleAddToCart = async (meal_id: string) => {
    await addToCart(meal_id, 1)
    loadCart()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-8">// menu</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside>
          <MacroFilters
            filters={filters}
            onChange={f => { setFilters(f); fetchMeals(f) }}
            onApply={() => fetchMeals(filters)}
            resultCount={meals.length}
          />
        </aside>
        <div>
          {loading
            ? <div className="font-mono text-muted text-sm">// loading meals...</div>
            : <MealGrid meals={meals} onAddToCart={handleAddToCart} />
          }
        </div>
      </div>
    </div>
  )
}
```

### 8.4 Verify

```bash
npm test app/\(public\)/menu/__tests__/MenuPage
# Expected: PASS — 2 tests passed
```

---

## Task 9: Meal Detail Page

- [ ] Write failing test
- [ ] Implement page
- [ ] Verify
- [ ] Commit

### 9.1 `frontend/app/(public)/menu/[id]/__tests__/MealDetail.test.tsx`

```typescript
// Note: testing server component via rendering with mocked api
import { render, screen } from '@testing-library/react'
import MealDetailPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')

const meal = {
  id: 'abc', name: 'Salmon Plate', description: 'Omega-3 rich',
  category: 'low_carb' as const, kcal: 380, protein_g: 35, carbs_g: 10, fat_g: 18,
  price_paise: 24900, image_url: null, is_available: true,
}

beforeEach(() => {
  (api.getMeal as jest.Mock).mockResolvedValue({ data: meal })
})

test('renders meal name and description', async () => {
  const Page = await MealDetailPage({ params: { id: 'abc' } })
  render(Page)
  expect(screen.getByText('Salmon Plate')).toBeInTheDocument()
  expect(screen.getByText('Omega-3 rich')).toBeInTheDocument()
  expect(screen.getByText('₹249')).toBeInTheDocument()
})
```

### 9.2 `frontend/app/(public)/menu/[id]/page.tsx`

```typescript
import { getMeal, getMeals } from '@/lib/api'
import Button from '@/components/ui/Button'
import AddToCartButton from '@/components/meals/AddToCartButton'

export async function generateStaticParams() {
  try {
    const res = await getMeals({ kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null })
    return res.data.map(m => ({ id: m.id }))
  } catch {
    return []
  }
}

export default async function MealDetailPage({ params }: { params: { id: string } }) {
  const res = await getMeal(params.id)
  const meal = res.data
  const fmt = (p: number) => `₹${Math.round(p / 100)}`

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="border border-border bg-surface p-8">
        <p className="font-mono text-xs text-muted mb-2 uppercase tracking-wider">{meal.category.replace('_', ' ')}</p>
        <h1 className="font-logo text-xl text-off-white mb-4">{meal.name}</h1>
        {meal.description && <p className="font-body text-muted mb-6">{meal.description}</p>}

        {/* Full macro breakdown */}
        <div className="grid grid-cols-4 gap-4 border border-border p-4 mb-6">
          {[
            { label: 'Protein', value: `${meal.protein_g}g` },
            { label: 'Carbs', value: `${meal.carbs_g}g` },
            { label: 'Fat', value: `${meal.fat_g}g` },
            { label: 'Calories', value: `${meal.kcal}` },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="font-mono text-lg text-off-white">{m.value}</div>
              <div className="font-mono text-xs text-muted">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl text-off-white">{fmt(meal.price_paise)}</span>
          {meal.is_available
            ? <AddToCartButton mealId={meal.id} />
            : <span className="font-mono text-xs text-muted border border-border px-4 py-2">UNAVAILABLE</span>
          }
        </div>
      </div>
    </div>
  )
}
```

### 9.3 `frontend/components/meals/AddToCartButton.tsx`

```typescript
'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import Button from '@/components/ui/Button'

export default function AddToCartButton({ mealId }: { mealId: string }) {
  const [loading, setLoading] = useState(false)
  const loadCart = useCartStore(s => s.loadCart)

  const handle = async () => {
    setLoading(true)
    try {
      await addToCart(mealId, 1)
      await loadCart()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="primary" onClick={handle} disabled={loading}>
      {loading ? '...' : '// add to cart'}
    </Button>
  )
}
```

### 9.4 Verify

```bash
npm test app/\(public\)/menu/\[id\]/__tests__/MealDetail
# Expected: PASS — 1 test passed
```

---

## Task 10: Plans Page + Plan Detail

- [ ] Write failing tests
- [ ] Implement plans pages
- [ ] Verify
- [ ] Commit

### 10.1 `frontend/components/plans/__tests__/PlanCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import PlanCard from '../PlanCard'
import type { MealPlan } from '@/lib/types'

const plan: MealPlan = {
  id: 'p1', name: 'Weekly Box', description: '5 meals',
  meal_count: 5, price_paise: 89900, discount_pct: 10, is_active: true
}

test('renders plan name, meal count, price and discount', () => {
  render(<PlanCard plan={plan} />)
  expect(screen.getByText('Weekly Box')).toBeInTheDocument()
  expect(screen.getByText(/5 meals/i)).toBeInTheDocument()
  expect(screen.getByText('₹899')).toBeInTheDocument()
  expect(screen.getByText(/10% off/i)).toBeInTheDocument()
})

test('renders CTA link', () => {
  render(<PlanCard plan={plan} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/plans/p1')
})
```

### 10.2 `frontend/components/plans/PlanCard.tsx`

```typescript
import Link from 'next/link'
import type { MealPlan } from '@/lib/types'

export default function PlanCard({ plan }: { plan: MealPlan }) {
  return (
    <div className="bg-surface border border-border p-6 flex flex-col gap-4">
      {plan.discount_pct > 0 && (
        <span className="font-mono text-xs text-off-white border border-off-white px-2 py-0.5 self-start">
          {plan.discount_pct}% off
        </span>
      )}
      <h2 className="font-logo text-base text-off-white">{plan.name}</h2>
      <p className="font-mono text-sm text-muted">{plan.meal_count} meals</p>
      {plan.description && <p className="font-body text-muted text-sm">{plan.description}</p>}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <span className="font-mono text-xl text-off-white">₹{Math.round(plan.price_paise / 100)}</span>
        <Link href={`/plans/${plan.id}`} className="font-mono text-xs text-muted border border-border px-3 py-1.5 hover:border-off-white hover:text-off-white transition-colors duration-150">
          // view plan
        </Link>
      </div>
    </div>
  )
}
```

### 10.3 `frontend/app/(public)/plans/page.tsx`

```typescript
import { getMealPlans } from '@/lib/api'
import PlanCard from '@/components/plans/PlanCard'

export default async function PlansPage() {
  let plans = []
  try {
    const res = await getMealPlans()
    plans = res.data.filter(p => p.is_active)
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-2">// meal plans</h1>
      <p className="font-mono text-muted text-sm mb-8">// bundle and save. eat better, spend less.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  )
}
```

### 10.4 `frontend/app/(public)/plans/[id]/page.tsx`

```typescript
import { getMealPlan } from '@/lib/api'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const res = await getMealPlan(params.id)
  const plan = res.data

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-surface border border-border p-8">
        {plan.discount_pct > 0 && (
          <span className="font-mono text-xs border border-off-white text-off-white px-2 py-0.5 mb-4 inline-block">
            {plan.discount_pct}% bundle discount
          </span>
        )}
        <h1 className="font-logo text-xl text-off-white mt-2 mb-2">{plan.name}</h1>
        <p className="font-mono text-muted text-sm mb-6">{plan.meal_count} meal slots</p>
        {plan.description && <p className="font-body text-muted mb-6">{plan.description}</p>}

        <div className="border border-border p-4 mb-6">
          <div className="font-mono text-2xl text-off-white">₹{Math.round(plan.price_paise / 100)}</div>
          <div className="font-mono text-xs text-muted mt-1">for {plan.meal_count} meals</div>
        </div>

        {/* Navigate to menu with plan context so user picks their meals */}
        <Link href={`/menu?plan_id=${plan.id}&slots=${plan.meal_count}`}>
          <Button variant="primary">// pick your {plan.meal_count} meals</Button>
        </Link>
      </div>
    </div>
  )
}
```

### 10.5 Verify

```bash
npm test components/plans/__tests__/PlanCard
# Expected: PASS — 2 tests passed
```

---

## Task 11: Auth Pages

- [ ] Write failing tests
- [ ] Implement login, register pages
- [ ] Verify
- [ ] Commit

### 11.1 `frontend/app/(auth)/login/__tests__/LoginPage.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('shows validation errors on empty submit', async () => {
  render(<LoginPage />)
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })
})

test('shows email format error', async () => {
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'notanemail' } })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeInTheDocument())
})

test('calls api.login on valid submit', async () => {
  (api.login as jest.Mock).mockResolvedValueOnce({ data: {} })
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => expect(api.login).toHaveBeenCalledWith('a@b.com', 'pass123'))
})
```

### 11.2 Run failing tests

```bash
npm test app/\(auth\)/login/__tests__/LoginPage
# Expected: FAIL
```

### 11.3 `frontend/app/(auth)/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface Errors { email?: string; password?: string; form?: string }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const e: Errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      router.push('/menu')
    } catch (err: any) {
      setErrors({ form: err.message ?? 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-surface border border-border p-8">
        <h1 className="font-logo text-base text-off-white mb-8">// login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
          <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
          {errors.form && <p className="font-mono text-xs text-red-400">{errors.form}</p>}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '...' : '// login'}
          </Button>
          <p className="font-mono text-xs text-muted text-center">
            no account?{' '}
            <Link href="/register" className="text-off-white hover:text-muted transition-colors duration-150">register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### 11.4 `frontend/app/(auth)/register/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface Errors { name?: string; email?: string; phone?: string; password?: string; form?: string }

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be 10 digits'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.phone, form.password)
      router.push('/menu')
    } catch (err: any) {
      setErrors({ form: err.message ?? 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-surface border border-border p-8">
        <h1 className="font-logo text-base text-off-white mb-8">// register</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Name" name="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={set('password')} error={errors.password} />
          {errors.form && <p className="font-mono text-xs text-red-400">{errors.form}</p>}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '...' : '// create account'}
          </Button>
          <p className="font-mono text-xs text-muted text-center">
            have an account?{' '}
            <Link href="/login" className="text-off-white hover:text-muted transition-colors duration-150">login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### 11.5 Verify

```bash
npm test app/\(auth\)/login/__tests__/LoginPage
# Expected: PASS — 3 tests passed
```

---

## Task 12: Cart Store + CartItem + CartDrawer

- [ ] Write failing tests
- [ ] Implement cartStore, CartItem, CartDrawer
- [ ] Verify
- [ ] Commit

### 12.1 `frontend/lib/cartStore.ts`

```typescript
import { create } from 'zustand'
import { getCart, addToCart as apiAdd, updateCartItem as apiUpdate, deleteCartItem as apiDelete, clearCart as apiClear } from './api'
import type { CartItem } from './types'

interface CartState {
  items: CartItem[]
  loading: boolean
  loadCart: () => Promise<void>
  addItem: (meal_id: string, quantity: number) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>(set => ({
  items: [],
  loading: false,

  loadCart: async () => {
    set({ loading: true })
    try {
      const res = await getCart()
      set({ items: res.data })
    } catch {
      set({ items: [] })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (meal_id, quantity) => {
    await apiAdd(meal_id, quantity)
    const res = await getCart()
    set({ items: res.data })
  },

  updateItem: async (id, quantity) => {
    if (quantity <= 0) {
      await apiDelete(id)
    } else {
      await apiUpdate(id, quantity)
    }
    const res = await getCart()
    set({ items: res.data })
  },

  removeItem: async (id) => {
    await apiDelete(id)
    const res = await getCart()
    set({ items: res.data })
  },

  clearCart: async () => {
    await apiClear()
    set({ items: [] })
  },
}))
```

### 12.2 `frontend/components/cart/__tests__/CartItem.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import CartItemComponent from '../CartItem'
import type { CartItem } from '@/lib/types'

const item: CartItem = {
  id: 'ci1', meal_id: 'm1', quantity: 2,
  meal: { id: 'm1', name: 'Bowl A', description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, price_paise: 15000, image_url: null, is_available: true }
}

test('renders meal name, quantity and price', () => {
  render(<CartItemComponent item={item} onUpdate={jest.fn()} onRemove={jest.fn()} />)
  expect(screen.getByText('Bowl A')).toBeInTheDocument()
  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByText('₹300')).toBeInTheDocument()
})

test('+ button calls onUpdate with quantity + 1', () => {
  const onUpdate = jest.fn()
  render(<CartItemComponent item={item} onUpdate={onUpdate} onRemove={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /increase/i }))
  expect(onUpdate).toHaveBeenCalledWith('ci1', 3)
})

test('− button calls onUpdate with quantity - 1', () => {
  const onUpdate = jest.fn()
  render(<CartItemComponent item={item} onUpdate={onUpdate} onRemove={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /decrease/i }))
  expect(onUpdate).toHaveBeenCalledWith('ci1', 1)
})

test('remove button calls onRemove', () => {
  const onRemove = jest.fn()
  render(<CartItemComponent item={item} onUpdate={jest.fn()} onRemove={onRemove} />)
  fireEvent.click(screen.getByRole('button', { name: /remove/i }))
  expect(onRemove).toHaveBeenCalledWith('ci1')
})
```

### 12.3 Run failing tests

```bash
npm test components/cart/__tests__/CartItem
# Expected: FAIL
```

### 12.4 `frontend/components/cart/CartItem.tsx`

```typescript
import type { CartItem } from '@/lib/types'

interface Props {
  item: CartItem
  onUpdate: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function CartItemComponent({ item, onUpdate, onRemove }: Props) {
  const total = Math.round((item.meal.price_paise * item.quantity) / 100)

  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="font-mono text-sm text-off-white">{item.meal.name}</span>
        <span className="font-mono text-xs text-muted">₹{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(item.id, item.quantity - 1)}
          aria-label="decrease quantity"
          className="w-6 h-6 flex items-center justify-center border border-border text-off-white hover:border-off-white transition-colors duration-150 font-mono"
        >−</button>
        <span className="font-mono text-sm text-off-white w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdate(item.id, item.quantity + 1)}
          aria-label="increase quantity"
          className="w-6 h-6 flex items-center justify-center border border-border text-off-white hover:border-off-white transition-colors duration-150 font-mono"
        >+</button>
        <button
          onClick={() => onRemove(item.id)}
          aria-label="remove item"
          className="ml-2 font-mono text-xs text-muted hover:text-red-400 transition-colors duration-150"
        >×</button>
      </div>
    </div>
  )
}
```

### 12.5 `frontend/components/cart/__tests__/CartDrawer.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import CartDrawer from '../CartDrawer'

jest.mock('@/lib/cartStore', () => ({
  useCartStore: (sel: any) => sel({
    items: [
      { id: 'ci1', meal_id: 'm1', quantity: 2, meal: { id: 'm1', name: 'Bowl A', price_paise: 15000, description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, image_url: null, is_available: true } }
    ],
    loadCart: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  })
}))

test('shows subtotal', () => {
  render(<CartDrawer open={true} onClose={jest.fn()} />)
  // 2 × ₹150 = ₹300
  expect(screen.getByText(/₹300/)).toBeInTheDocument()
})

test('shows checkout CTA', () => {
  render(<CartDrawer open={true} onClose={jest.fn()} />)
  expect(screen.getByRole('link', { name: /checkout/i })).toBeInTheDocument()
})
```

### 12.6 `frontend/components/cart/CartDrawer.tsx`

```typescript
'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCartStore } from '@/lib/cartStore'
import CartItemComponent from './CartItem'
import Button from '@/components/ui/Button'

interface Props { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore(s => s.items)
  const loadCart = useCartStore(s => s.loadCart)
  const updateItem = useCartStore(s => s.updateItem)
  const removeItem = useCartStore(s => s.removeItem)
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => { if (open) loadCart() }, [open])

  const subtotal = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-bg/60 z-40" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-surface border-l border-border z-50 flex flex-col transform transition-transform duration-150 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-logo text-xs text-off-white">// cart</span>
          <button onClick={onClose} className="font-mono text-muted hover:text-off-white transition-colors duration-150">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0
            ? <p className="font-mono text-xs text-muted py-8 text-center">// cart is empty</p>
            : items.map(item => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))
          }
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col gap-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-muted">subtotal</span>
              <span className="text-off-white">₹{Math.round(subtotal / 100)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button variant="primary" className="w-full">// checkout</Button>
            </Link>
            <button onClick={clearCart} className="font-mono text-xs text-muted hover:text-off-white transition-colors duration-150 text-center">
              clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
```

### 12.7 Verify

```bash
npm test components/cart
# Expected: PASS — 6 tests passed
```

---

## Task 13: Cart Page

- [ ] Write failing tests
- [ ] Implement `frontend/app/cart/page.tsx`
- [ ] Verify
- [ ] Commit

### 13.1 `frontend/app/cart/__tests__/CartPage.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import CartPage from '../page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

describe('with items', () => {
  beforeEach(() => {
    jest.mock('@/lib/cartStore', () => ({
      useCartStore: (sel: any) => sel({
        items: [{ id: 'ci1', meal_id: 'm1', quantity: 1, meal: { id: 'm1', name: 'Bowl A', price_paise: 15000, description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, image_url: null, is_available: true } }],
        loadCart: jest.fn(), updateItem: jest.fn(), removeItem: jest.fn(), clearCart: jest.fn(),
      })
    }))
  })

  test('renders proceed to checkout CTA', async () => {
    render(<CartPage />)
    expect(screen.getByRole('link', { name: /checkout/i })).toBeInTheDocument()
  })
})

test('shows empty cart message when no items', () => {
  jest.resetModules()
  jest.mock('@/lib/cartStore', () => ({
    useCartStore: (sel: any) => sel({ items: [], loadCart: jest.fn(), updateItem: jest.fn(), removeItem: jest.fn(), clearCart: jest.fn() })
  }))
  render(<CartPage />)
  expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
})
```

### 13.2 `frontend/app/cart/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cartStore'
import { getMe } from '@/lib/api'
import CartItemComponent from '@/components/cart/CartItem'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const loadCart = useCartStore(s => s.loadCart)
  const updateItem = useCartStore(s => s.updateItem)
  const removeItem = useCartStore(s => s.removeItem)

  useEffect(() => {
    // Auth guard
    getMe().catch(() => router.push('/login'))
    loadCart()
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-8">// cart</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <p className="font-mono text-muted text-sm mb-4">// cart is empty</p>
          <Link href="/menu">
            <Button variant="ghost" size="sm">// browse menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Items */}
          <div className="bg-surface border border-border p-6">
            {items.map(item => (
              <CartItemComponent key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </div>

          {/* Order summary panel */}
          <div className="bg-surface border border-border p-6 flex flex-col gap-4 h-fit">
            <h2 className="font-mono text-xs text-muted uppercase tracking-wider">// order summary</h2>
            <div className="flex justify-between font-mono text-sm border-t border-border pt-3">
              <span className="text-muted">subtotal</span>
              <span className="text-off-white">₹{Math.round(subtotal / 100)}</span>
            </div>
            <Link href="/checkout">
              <Button variant="primary" className="w-full">// proceed to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 13.3 Verify

```bash
npm test app/cart/__tests__/CartPage
# Expected: PASS
```

---

## Task 14: SlotPicker + AddressForm + OrderSummary

- [ ] Write failing tests
- [ ] Implement components
- [ ] Verify
- [ ] Commit

### 14.1 `frontend/components/checkout/__tests__/SlotPicker.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import SlotPicker from '../SlotPicker'
import type { DeliverySlot } from '@/lib/types'

const slots: DeliverySlot[] = [
  { id: 's1', date: '2026-05-26', label: '8am - 10am', capacity: 10, booked_count: 5, is_active: true },
  { id: 's2', date: '2026-05-26', label: '6pm - 8pm', capacity: 5, booked_count: 5, is_active: true },
]

jest.mock('@/lib/api', () => ({ getDeliverySlots: jest.fn().mockResolvedValue({ data: slots }) }))

test('disables slot when booked_count >= capacity', async () => {
  render(<SlotPicker selectedSlotId={null} onSelect={jest.fn()} />)
  // Wait for slots to load
  const fullSlot = await screen.findByText(/6pm - 8pm/i)
  expect(fullSlot.closest('button')).toBeDisabled()
})

test('calls onSelect with slot id on click', async () => {
  const onSelect = jest.fn()
  render(<SlotPicker selectedSlotId={null} onSelect={onSelect} />)
  const slot = await screen.findByText(/8am - 10am/i)
  fireEvent.click(slot.closest('button')!)
  expect(onSelect).toHaveBeenCalledWith('s1')
})
```

### 14.2 `frontend/components/checkout/__tests__/AddressForm.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import AddressForm from '../AddressForm'
import type { Address } from '@/lib/types'

const addresses: Address[] = [
  { id: 'a1', label: 'Home', line1: '123 Main St', city: 'Mumbai', pincode: '400001', is_default: true }
]

test('renders existing addresses', () => {
  render(<AddressForm addresses={addresses} selectedId={null} onSelect={jest.fn()} onAdd={jest.fn()} />)
  expect(screen.getByText('Home')).toBeInTheDocument()
})

test('toggling "add new address" shows inline form', () => {
  render(<AddressForm addresses={addresses} selectedId={null} onSelect={jest.fn()} onAdd={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /add new/i }))
  expect(screen.getByLabelText(/line1/i)).toBeInTheDocument()
})
```

### 14.3 Run failing tests

```bash
npm test components/checkout
# Expected: FAIL
```

### 14.4 `frontend/components/checkout/SlotPicker.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getDeliverySlots } from '@/lib/api'
import type { DeliverySlot } from '@/lib/types'

interface Props {
  selectedSlotId: string | null
  onSelect: (id: string) => void
}

function next7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d.toISOString().split('T')[0]
  })
}

export default function SlotPicker({ selectedSlotId, onSelect }: Props) {
  const days = next7Days()
  const [selectedDate, setSelectedDate] = useState(days[0])
  const [slots, setSlots] = useState<DeliverySlot[]>([])

  useEffect(() => {
    getDeliverySlots(selectedDate)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
  }, [selectedDate])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-xs text-muted uppercase tracking-wider">// select delivery date</h3>

      {/* Date pills */}
      <div className="flex flex-wrap gap-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDate(day)}
            className={`font-mono text-xs px-3 py-1.5 border transition-colors duration-150 ${
              selectedDate === day
                ? 'bg-off-white text-bg border-off-white'
                : 'text-muted border-border hover:border-off-white hover:text-off-white'
            }`}
          >
            {new Date(day).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>

      {/* Slot list */}
      <div className="flex flex-col gap-2">
        {slots.map(slot => {
          const full = slot.booked_count >= slot.capacity
          return (
            <button
              key={slot.id}
              onClick={() => !full && onSelect(slot.id)}
              disabled={full}
              className={`text-left font-mono text-sm px-4 py-3 border transition-colors duration-150 ${
                selectedSlotId === slot.id
                  ? 'border-off-white text-off-white bg-surface2'
                  : full
                  ? 'border-border text-muted opacity-40 cursor-not-allowed'
                  : 'border-border text-muted hover:border-off-white hover:text-off-white'
              }`}
            >
              {slot.label}
              {full && <span className="ml-2 text-xs">(full)</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

### 14.5 `frontend/components/checkout/AddressForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { Address } from '@/lib/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Props {
  addresses: Address[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: Omit<Address, 'id' | 'is_default'>) => void
}

export default function AddressForm({ addresses, selectedId, onSelect, onAdd }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ label: '', line1: '', city: '', pincode: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = () => {
    onAdd(form)
    setShowNew(false)
    setForm({ label: '', line1: '', city: '', pincode: '' })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-xs text-muted uppercase tracking-wider">// delivery address</h3>

      {addresses.map(addr => (
        <button
          key={addr.id}
          onClick={() => onSelect(addr.id)}
          className={`text-left p-3 border transition-colors duration-150 ${
            selectedId === addr.id ? 'border-off-white bg-surface2' : 'border-border hover:border-off-white'
          }`}
        >
          <div className="font-mono text-sm text-off-white flex items-center gap-2">
            {addr.label ?? 'Address'}
            {addr.is_default && <span className="text-[10px] text-muted border border-border px-1">default</span>}
          </div>
          <div className="font-mono text-xs text-muted mt-1">{addr.line1}, {addr.city} — {addr.pincode}</div>
        </button>
      ))}

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="font-mono text-xs text-muted border border-dashed border-border px-3 py-2 hover:border-off-white hover:text-off-white transition-colors duration-150"
        >
          + add new address
        </button>
      )}

      {showNew && (
        <div className="border border-border p-4 flex flex-col gap-3">
          <Input label="Label" name="label" value={form.label} onChange={set('label')} placeholder="Home / Work" />
          <Input label="Line1" name="line1" value={form.line1} onChange={set('line1')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" name="city" value={form.city} onChange={set('city')} />
            <Input label="Pincode" name="pincode" value={form.pincode} onChange={set('pincode')} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>save</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 14.6 `frontend/components/checkout/OrderSummary.tsx`

```typescript
import type { CartItem, DeliverySlot } from '@/lib/types'

interface Props {
  items: CartItem[]
  slot: DeliverySlot | null
}

export default function OrderSummary({ items, slot }: Props) {
  const total = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <div className="bg-surface border border-border p-6 flex flex-col gap-4">
      <h3 className="font-mono text-xs text-muted uppercase tracking-wider">// order summary</h3>

      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between font-mono text-xs">
            <span className="text-muted">{item.meal.name} × {item.quantity}</span>
            <span className="text-off-white">₹{Math.round(item.meal.price_paise * item.quantity / 100)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-mono text-sm border-t border-border pt-3">
        <span className="text-muted">total</span>
        <span className="text-off-white">₹{Math.round(total / 100)}</span>
      </div>

      {slot && (
        <div className="font-mono text-xs text-muted border-t border-border pt-3">
          delivery: {slot.label} on {new Date(slot.date).toLocaleDateString('en-IN')}
        </div>
      )}
    </div>
  )
}
```

### 14.7 Verify

```bash
npm test components/checkout
# Expected: PASS — 4 tests passed
```

---

## Task 15: Checkout Page + Razorpay

- [ ] Write failing test
- [ ] Implement checkout page
- [ ] Verify
- [ ] Commit

### 15.1 `frontend/app/checkout/__tests__/CheckoutPage.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import CheckoutPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/lib/api', () => ({
  getMe: jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test', email: 'a@b.com', phone: '9999999999', role: 'customer' } }),
  getAddresses: jest.fn().mockResolvedValue({ data: [] }),
}))
jest.mock('@/lib/cartStore', () => ({
  useCartStore: (sel: any) => sel({ items: [], loadCart: jest.fn() })
}))

test('pay button is disabled when no address or slot selected', async () => {
  render(<CheckoutPage />)
  const btn = await screen.findByRole('button', { name: /pay/i })
  expect(btn).toBeDisabled()
})
```

### 15.2 `frontend/app/checkout/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getAddresses, addAddress, createOrder, verifyOrder } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import AddressForm from '@/components/checkout/AddressForm'
import SlotPicker from '@/components/checkout/SlotPicker'
import OrderSummary from '@/components/checkout/OrderSummary'
import Button from '@/components/ui/Button'
import type { Address, DeliverySlot } from '@/lib/types'

declare global {
  interface Window { Razorpay: any }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const loadCart = useCartStore(s => s.loadCart)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    loadCart()
    getAddresses().then(r => setAddresses(r.data)).catch(() => {})
  }, [])

  const handleAddAddress = async (data: Omit<Address, 'id' | 'is_default'>) => {
    const res = await addAddress(data)
    setAddresses(prev => [...prev, res.data])
    setSelectedAddressId(res.data.id)
  }

  const handlePay = async () => {
    if (!selectedAddressId || !selectedSlotId) return
    setLoading(true)
    setError(null)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay')

      const order = await createOrder(selectedAddressId, selectedSlotId)
      const { razorpay_order_id, amount, key_id, id: orderId } = order.data

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: key_id,
          amount,
          currency: 'INR',
          order_id: razorpay_order_id,
          name: 'DeBloat',
          theme: { color: '#F0EFE8' },
          handler: async (response: any) => {
            try {
              await verifyOrder(orderId, response.razorpay_payment_id, response.razorpay_signature)
              router.push(`/order-confirmed?orderId=${orderId}`)
              resolve()
            } catch (e: any) {
              reject(e)
            }
          },
          modal: {
            ondismiss: () => {
              setError('Payment cancelled')
              resolve()
            }
          }
        })
        rzp.open()
      })
    } catch (e: any) {
      setError(e.message ?? 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const canPay = !!selectedAddressId && !!selectedSlotId && items.length > 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-8">// checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-8">
          <div className="bg-surface border border-border p-6">
            <AddressForm
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onAdd={handleAddAddress}
            />
          </div>
          <div className="bg-surface border border-border p-6">
            <SlotPicker selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <OrderSummary items={items} slot={selectedSlot} />
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <Button variant="primary" onClick={handlePay} disabled={!canPay || loading}>
            {loading ? '// processing...' : '// pay via razorpay'}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 15.3 Verify

```bash
npm test app/checkout/__tests__/CheckoutPage
# Expected: PASS — 1 test passed
```

---

## Task 16: Order Confirmed Page

- [ ] Implement page (no unit test — straightforward display)
- [ ] Commit

### 16.1 `frontend/app/order-confirmed/page.tsx`

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function OrderConfirmedPage() {
  const params = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface border border-border p-8 text-center flex flex-col gap-6">
        <p className="font-mono text-xs text-muted tracking-widest">// order placed</p>
        <h1 className="font-logo text-xl text-off-white">ORDER<br />CONFIRMED</h1>

        {orderId && (
          <div className="border border-border p-3">
            <p className="font-mono text-xs text-muted">order id</p>
            <p className="font-mono text-sm text-off-white mt-1 break-all">{orderId}</p>
          </div>
        )}

        <span className="font-mono text-xs text-muted border border-border px-3 py-1 self-center">
          CONFIRMED
        </span>

        <div className="flex flex-col gap-3">
          <Link href="/account">
            <Button variant="primary" className="w-full">// view orders</Button>
          </Link>
          <Link href="/menu">
            <Button variant="ghost" className="w-full">// back to menu</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

## Task 17: Account Pages

- [ ] Write failing tests
- [ ] Implement order history, order detail, profile pages
- [ ] Verify
- [ ] Commit

### 17.1 `frontend/app/(account)/account/__tests__/AccountPage.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import AccountPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

const order = {
  id: 'ord1', status: 'delivered' as const, total_paise: 29900, created_at: '2026-05-20T10:00:00Z',
  delivery_slot: { id: 's1', date: '2026-05-21', label: '8am-10am', capacity: 10, booked_count: 5, is_active: true },
  items: []
}

beforeEach(() => {
  (api.getMe as jest.Mock).mockResolvedValue({ data: { id: 'u1', name: 'Test', email: 'a@b.com', phone: '9999999999', role: 'customer' } })
  ;(api.getOrders as jest.Mock).mockResolvedValue({ data: [order] })
})

test('renders order status badge as DELIVERED', async () => {
  render(<AccountPage />)
  expect(await screen.findByText('DELIVERED')).toBeInTheDocument()
})

test('delivered status badge has green color class', async () => {
  render(<AccountPage />)
  const badge = await screen.findByText('DELIVERED')
  expect(badge.className).toMatch(/green/)
})
```

### 17.2 `frontend/lib/statusColors.ts`

```typescript
import type { Order } from './types'

export const STATUS_COLORS: Record<Order['status'], string> = {
  pending_payment: 'text-yellow-400 border-yellow-400',
  confirmed: 'text-blue-400 border-blue-400',
  preparing: 'text-orange-400 border-orange-400',
  out_for_delivery: 'text-purple-400 border-purple-400',
  delivered: 'text-green-400 border-green-400',
  cancelled: 'text-red-400 border-red-400',
}
```

### 17.3 `frontend/app/(account)/account/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMe, getOrders } from '@/lib/api'
import { STATUS_COLORS } from '@/lib/statusColors'
import type { Order } from '@/lib/types'

export default function AccountPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    getOrders().then(r => setOrders(r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-logo text-xl text-off-white">// orders</h1>
        <Link href="/account/profile" className="font-mono text-xs text-muted hover:text-off-white transition-colors duration-150">
          // profile →
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 && (
          <p className="font-mono text-sm text-muted py-8 text-center">// no orders yet</p>
        )}
        {orders.map(order => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
            <div className="bg-surface border border-border p-4 hover:border-off-white/30 transition-colors duration-150 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-muted">{order.id.slice(0, 8)}…</span>
                <span className="font-mono text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-off-white">₹{Math.round(order.total_paise / 100)}</span>
                <span className={`font-mono text-[10px] border px-2 py-0.5 ${STATUS_COLORS[order.status]}`}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### 17.4 `frontend/app/(account)/account/orders/[id]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getOrder } from '@/lib/api'
import { STATUS_COLORS } from '@/lib/statusColors'
import type { Order } from '@/lib/types'

const STATUS_STEPS: Order['status'][] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    getOrder(params.id).then(r => setOrder(r.data)).catch(() => router.push('/account'))
  }, [])

  if (!order) return <div className="p-12 font-mono text-muted text-sm">// loading...</div>

  const stepIndex = STATUS_STEPS.indexOf(order.status as any)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-logo text-base text-off-white mb-2">// order detail</h1>
      <p className="font-mono text-xs text-muted mb-8">{order.id}</p>

      {/* Status timeline */}
      <div className="flex gap-2 mb-8">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className={`flex-1 h-1 ${i <= stepIndex ? 'bg-off-white' : 'bg-surface2'}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="bg-surface border border-border p-6">
          <h2 className="font-mono text-xs text-muted uppercase tracking-wider mb-4">// items</h2>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between font-mono text-sm py-2 border-b border-border last:border-0">
              <span className="text-muted">{item.meal_name} × {item.quantity}</span>
              <span className="text-off-white">₹{Math.round(item.price_paise * item.quantity / 100)}</span>
            </div>
          ))}
          <div className="flex justify-between font-mono text-sm pt-3">
            <span className="text-muted">total</span>
            <span className="text-off-white">₹{Math.round(order.total_paise / 100)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-surface border border-border p-6 flex flex-col gap-3">
          <h2 className="font-mono text-xs text-muted uppercase tracking-wider">// delivery</h2>
          <p className="font-mono text-sm text-off-white">{order.delivery_slot.label}</p>
          <p className="font-mono text-xs text-muted">
            {new Date(order.delivery_slot.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <span className={`font-mono text-xs border px-2 py-0.5 self-start ${STATUS_COLORS[order.status]}`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
```

### 17.5 `frontend/app/(account)/account/profile/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, updateMe, getAddresses } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { User, Address } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMe()
      .then(r => { setUser(r.data); setForm({ name: r.data.name, phone: r.data.phone }) })
      .catch(() => router.push('/login'))
    getAddresses().then(r => setAddresses(r.data)).catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMe(form.name, form.phone)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="font-logo text-xl text-off-white">// profile</h1>

      {user && (
        <div className="bg-surface border border-border p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Phone" name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Email" name="email" value={user.email} disabled />
            <div className="flex items-center gap-3">
              <Button variant="primary" type="submit">save</Button>
              {saved && <span className="font-mono text-xs text-green-400">// saved</span>}
            </div>
          </form>
        </div>
      )}

      {/* Addresses */}
      <div className="bg-surface border border-border p-6">
        <h2 className="font-mono text-xs text-muted uppercase tracking-wider mb-4">// saved addresses</h2>
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-start justify-between py-3 border-b border-border last:border-0">
            <div>
              <span className="font-mono text-sm text-off-white flex items-center gap-2">
                {addr.label ?? 'Address'}
                {addr.is_default && <span className="font-mono text-[10px] text-muted border border-border px-1">default</span>}
              </span>
              <p className="font-mono text-xs text-muted mt-1">{addr.line1}, {addr.city} — {addr.pincode}</p>
            </div>
          </div>
        ))}
        {addresses.length === 0 && <p className="font-mono text-xs text-muted">// no addresses saved</p>}
      </div>
    </div>
  )
}
```

### 17.6 Verify

```bash
npm test app/\(account\)/account/__tests__/AccountPage
# Expected: PASS — 2 tests passed
```

---

## Task 18: Admin Pages

- [ ] Write failing tests
- [ ] Implement MealToggleRow, OrderRow, admin pages
- [ ] Verify
- [ ] Commit

### 18.1 `frontend/components/admin/__tests__/MealToggleRow.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MealToggleRow from '../MealToggleRow'
import * as api from '@/lib/api'
import type { Meal } from '@/lib/types'

jest.mock('@/lib/api')

const meal: Meal = {
  id: 'm1', name: 'Bowl A', description: null, category: 'high_protein',
  kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, price_paise: 15000,
  image_url: null, is_available: true
}

test('renders meal name', () => {
  render(<MealToggleRow meal={meal} />)
  expect(screen.getByText('Bowl A')).toBeInTheDocument()
})

test('toggle calls setMealAvailability with flipped value', async () => {
  (api.setMealAvailability as jest.Mock).mockResolvedValueOnce({ data: { ...meal, is_available: false } })
  render(<MealToggleRow meal={meal} />)
  fireEvent.click(screen.getByRole('checkbox'))
  await waitFor(() => expect(api.setMealAvailability).toHaveBeenCalledWith('m1', false))
})
```

### 18.2 `frontend/components/admin/__tests__/AdminPage.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import AdminPage from '@/app/admin/page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('redirects non-admin users', async () => {
  const push = jest.fn()
  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push })
  ;(api.getMe as jest.Mock).mockResolvedValueOnce({ data: { id: 'u1', role: 'customer', name: 'Test', email: 'a@b.com', phone: '9999999999' } })
  ;(api.getMeals as jest.Mock).mockResolvedValue({ data: [] })
  render(<AdminPage />)
  await new Promise(r => setTimeout(r, 0))
  expect(push).toHaveBeenCalledWith('/')
})
```

### 18.3 Run failing tests

```bash
npm test components/admin
npm test app/admin
# Expected: FAIL
```

### 18.4 `frontend/components/admin/MealToggleRow.tsx`

```typescript
'use client'

import { useState } from 'react'
import { setMealAvailability } from '@/lib/api'
import Toggle from '@/components/ui/Toggle'
import type { Meal } from '@/lib/types'

export default function MealToggleRow({ meal }: { meal: Meal }) {
  const [available, setAvailable] = useState(meal.is_available)

  const handleChange = async (value: boolean) => {
    setAvailable(value)
    try {
      await setMealAvailability(meal.id, value)
    } catch {
      setAvailable(!value) // revert on error
    }
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div>
        <span className="font-mono text-sm text-off-white">{meal.name}</span>
        <span className="font-mono text-xs text-muted ml-3">{meal.category.replace('_', ' ')}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted">₹{Math.round(meal.price_paise / 100)}</span>
        <Toggle checked={available} onChange={handleChange} label={available ? 'available' : 'unavailable'} />
      </div>
    </div>
  )
}
```

### 18.5 `frontend/components/admin/OrderRow.tsx`

```typescript
import Link from 'next/link'
import { STATUS_COLORS } from '@/lib/statusColors'
import type { Order } from '@/lib/types'

export default function OrderRow({ order }: { order: Order }) {
  return (
    <Link href={`/account/orders/${order.id}`} className="block">
      <div className="flex items-center justify-between py-3 border-b border-border hover:bg-surface2/50 transition-colors duration-150 px-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-off-white">{order.id.slice(0, 12)}…</span>
          <span className="font-mono text-xs text-muted">
            {new Date(order.created_at).toLocaleDateString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-off-white">₹{Math.round(order.total_paise / 100)}</span>
          <span className={`font-mono text-[10px] border px-2 py-0.5 ${STATUS_COLORS[order.status]}`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  )
}
```

### 18.6 `frontend/app/admin/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getMeals } from '@/lib/api'
import MealToggleRow from '@/components/admin/MealToggleRow'
import type { Meal } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    getMe()
      .then(r => {
        if (r.data.role !== 'admin') router.push('/')
      })
      .catch(() => router.push('/login'))

    getMeals({ kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null })
      .then(r => setMeals(r.data))
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-8">// admin — meals</h1>
      <div className="bg-surface border border-border p-6">
        {meals.map(meal => <MealToggleRow key={meal.id} meal={meal} />)}
        {meals.length === 0 && <p className="font-mono text-xs text-muted">// no meals</p>}
      </div>
    </div>
  )
}
```

### 18.7 `frontend/app/admin/orders/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getAdminOrders } from '@/lib/api'
import OrderRow from '@/components/admin/OrderRow'
import type { Order } from '@/lib/types'

const STATUSES = ['', 'pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    getMe()
      .then(r => { if (r.data.role !== 'admin') router.push('/') })
      .catch(() => router.push('/login'))
  }, [])

  useEffect(() => {
    getAdminOrders(date || undefined, status || undefined)
      .then(r => setOrders(r.data))
      .catch(() => {})
  }, [date, status])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-logo text-xl text-off-white mb-8">// admin — orders</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-surface border border-border text-off-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-off-white transition-colors duration-150"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-surface border border-border text-muted font-mono text-xs px-3 py-2 focus:outline-none focus:border-off-white transition-colors duration-150"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'all statuses'}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border p-6">
        {orders.map(order => <OrderRow key={order.id} order={order} />)}
        {orders.length === 0 && <p className="font-mono text-xs text-muted">// no orders</p>}
      </div>
    </div>
  )
}
```

### 18.8 Verify

```bash
npm test components/admin
npm test app/admin
# Expected: PASS — 3 tests passed
```

---

## Final Verification

```bash
# Run all tests
npm test
# Expected: All test suites pass

# Build check
npm run build
# Expected: ✓ Compiled successfully — 0 errors

# Start dev server
npm run dev
# Expected: ▲ Next.js 14.x ready on http://localhost:3000
```

## File Tree Summary

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── (public)/
│   │   ├── page.tsx                          # Home
│   │   ├── menu/
│   │   │   ├── page.tsx                      # Menu (client, filters)
│   │   │   └── [id]/page.tsx                 # Meal detail (server, SSG)
│   │   └── plans/
│   │       ├── page.tsx                      # Plans list (server)
│   │       └── [id]/page.tsx                 # Plan detail (server)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (account)/account/
│   │   ├── page.tsx                          # Order history
│   │   ├── orders/[id]/page.tsx              # Order detail
│   │   └── profile/page.tsx                  # Profile + addresses
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order-confirmed/page.tsx
│   └── admin/
│       ├── page.tsx                          # Meal availability
│       └── orders/page.tsx                   # Order management
├── components/
│   ├── ui/          Button, Input, Toggle
│   ├── layout/      Nav, Footer
│   ├── meals/       MealCard, MealGrid, MacroSlider, MacroFilters, AddToCartButton
│   ├── cart/        CartItem, CartDrawer
│   ├── checkout/    SlotPicker, AddressForm, OrderSummary
│   ├── plans/       PlanCard
│   └── admin/       MealToggleRow, OrderRow
├── lib/
│   ├── types.ts
│   ├── api.ts
│   ├── cartStore.ts
│   └── statusColors.ts
├── jest.config.ts
├── jest.setup.ts
└── tailwind.config.ts
```
