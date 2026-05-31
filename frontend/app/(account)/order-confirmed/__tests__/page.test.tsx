import { render, screen } from '@testing-library/react'
import OrderConfirmedPage from '../page'

const mockOrder = {
  id: 'order1',
  status: 'confirmed' as const,
  total_paise: 30000,
  created_at: '2026-05-27T10:00:00Z',
  delivery_slot: { id: 's1', date: '2026-05-28', label: '8am - 10am', capacity: 10, booked_count: 3, is_active: true },
  items: [
    { id: 'oi1', meal_name: 'Chicken Bowl', quantity: 2, price_paise: 15000 },
  ],
}

jest.mock('@/lib/api', () => ({
  getOrder: jest.fn().mockResolvedValue({
    data: {
      id: 'order1',
      status: 'confirmed',
      total_paise: 30000,
      created_at: '2026-05-27T10:00:00Z',
      delivery_slot: { id: 's1', date: '2026-05-28', label: '8am - 10am', capacity: 10, booked_count: 3, is_active: true },
      items: [{ id: 'oi1', meal_name: 'Chicken Bowl', quantity: 2, price_paise: 15000 }],
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'order1' }),
  useRouter: () => ({ push: jest.fn() }),
}))

test('renders order confirmed heading', async () => {
  render(<OrderConfirmedPage />)
  expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument()
})

test('renders order id', async () => {
  render(<OrderConfirmedPage />)
  expect(await screen.findByText(/order1/i)).toBeInTheDocument()
})

test('renders total', async () => {
  render(<OrderConfirmedPage />)
  const totals = await screen.findAllByText('₹300')
  expect(totals.length).toBeGreaterThan(0)
})
