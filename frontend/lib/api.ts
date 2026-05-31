import type { Meal, MealPlan, DeliverySlot, CartItem, Address, Order, User, MacroFilters } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, { credentials: 'include', ...options })

  if (res.status === 401) {
    await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
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

export const getMeals = (filters: MacroFilters) =>
  apiFetch<{ data: Meal[] }>(`/meals${buildQuery({ ...filters })}`)

export const getMeal = (id: string) =>
  apiFetch<{ data: Meal }>(`/meals/${id}`)

export const getMealPlans = () =>
  apiFetch<{ data: MealPlan[] }>('/meal-plans')

export const getMealPlan = (id: string) =>
  apiFetch<{ data: MealPlan }>(`/meal-plans/${id}`)

export const getDeliverySlots = (date: string) =>
  apiFetch<{ data: DeliverySlot[] }>(`/delivery-slots${buildQuery({ date })}`)

export const getCart = () =>
  apiFetch<{ data: CartItem[] }>('/cart')

export const addToCart = (meal_id: string, quantity: number) =>
  apiFetch<{ data: CartItem }>('/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meal_id, quantity }),
  })

export const updateCartItem = (id: string, quantity: number) =>
  apiFetch<{ data: CartItem }>(`/cart/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })

export const deleteCartItem = (id: string) =>
  apiFetch<void>(`/cart/items/${id}`, { method: 'DELETE' })

export const clearCart = () =>
  apiFetch<void>('/cart', { method: 'DELETE' })

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

export const getMe = () =>
  apiFetch<{ data: User }>('/me')

export const updateMe = (name: string, phone: string) =>
  apiFetch<{ data: User }>('/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  })

export const getAddresses = () =>
  apiFetch<{ data: Address[] }>('/me/addresses')

export const addAddress = (data: Omit<Address, 'id'>) =>
  apiFetch<{ data: Address }>('/me/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateAddress = (id: string, data: Partial<Omit<Address, 'id'>>) =>
  apiFetch<{ data: Address }>(`/me/addresses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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

export const getAdminOrders = (date?: string, status?: string) =>
  apiFetch<{ data: Order[] }>(`/admin/orders${buildQuery({ date, status })}`)

export const setMealAvailability = (id: string, is_available: boolean) =>
  apiFetch<{ data: Meal }>(`/admin/meals/${id}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available }),
  })

export const updateOrderStatus = (id: string, status: string) =>
  apiFetch<{ data: Order }>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
