import { create } from 'zustand'
import type { CartItem } from './types'
import { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } from './api'

interface CartStore {
  items: CartItem[]
  loadCart: () => Promise<void>
  addItem: (meal_id: string, quantity: number) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearItems: () => Promise<void>
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  loadCart: async () => {
    const res = await getCart()
    set({ items: res.data })
  },

  addItem: async (meal_id, quantity) => {
    const res = await addToCart(meal_id, quantity)
    set(s => ({
      items: s.items.some(i => i.id === res.data.id)
        ? s.items.map(i => i.id === res.data.id ? res.data : i)
        : [...s.items, res.data],
    }))
  },

  updateItem: async (id, quantity) => {
    const res = await updateCartItem(id, quantity)
    set(s => ({ items: s.items.map(i => i.id === id ? res.data : i) }))
  },

  removeItem: async (id) => {
    await deleteCartItem(id)
    set(s => ({ items: s.items.filter(i => i.id !== id) }))
  },

  clearItems: async () => {
    await clearCart()
    set({ items: [] })
  },
}))
