'use client'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CheckoutPage from '../page'

const mockAddresses = [
  { id: 'addr1', label: 'Home', line1: '123 Main St', city: 'Mumbai', pincode: '400001', is_default: true },
]

jest.mock('@/lib/api', () => ({
  getMe: jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test', email: 'a@b.com', phone: '9999999999', role: 'customer' } }),
  getAddresses: jest.fn().mockResolvedValue({ data: [{ id: 'addr1', label: 'Home', line1: '123 Main St', city: 'Mumbai', pincode: '400001', is_default: true }] }),
  getDeliverySlots: jest.fn().mockResolvedValue({ data: [] }),
  addAddress: jest.fn().mockResolvedValue({ data: { id: 'addr2', label: 'Work', line1: '456 Work Ave', city: 'Delhi', pincode: '110001', is_default: false } }),
  createOrder: jest.fn().mockResolvedValue({ data: { id: 'order1', razorpay_order_id: 'rzp_order_1', amount: 30000, key_id: 'rzp_key' } }),
}))

jest.mock('@/lib/cartStore', () => ({
  useCartStore: jest.fn(() => ({
    items: [
      { id: 'ci1', meal_id: 'm1', quantity: 2, meal: { id: 'm1', name: 'Chicken Bowl', description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 10, price_paise: 15000, image_url: null, is_available: true } },
    ],
    clearItems: jest.fn(),
  })),
}))

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders order summary with cart items', async () => {
  render(<CheckoutPage />)
  expect(await screen.findByText('Chicken Bowl × 2')).toBeInTheDocument()
})

test('renders address list', async () => {
  render(<CheckoutPage />)
  expect(await screen.findByText('Home')).toBeInTheDocument()
})

test('place order button exists', async () => {
  render(<CheckoutPage />)
  expect(await screen.findByRole('button', { name: /place order/i })).toBeInTheDocument()
})
