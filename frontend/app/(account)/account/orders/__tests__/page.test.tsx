import { render, screen } from '@testing-library/react'
import OrdersPage from '../page'

jest.mock('@/lib/api', () => ({
  getMe: jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test', email: 'a@b.com', phone: '9999999999', role: 'customer' } }),
  getOrders: jest.fn().mockResolvedValue({
    data: [
      {
        id: 'order1',
        status: 'confirmed',
        total_paise: 30000,
        created_at: '2026-05-27T10:00:00Z',
        delivery_slot: { id: 's1', date: '2026-05-28', label: '8am - 10am', capacity: 10, booked_count: 3, is_active: true },
        items: [{ id: 'oi1', meal_name: 'Chicken Bowl', quantity: 2, price_paise: 15000 }],
      },
    ],
  }),
}))

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

test('renders orders heading', async () => {
  render(<OrdersPage />)
  expect(await screen.findByText(/orders/i)).toBeInTheDocument()
})

test('renders order id', async () => {
  render(<OrdersPage />)
  expect(await screen.findByText(/order1/i)).toBeInTheDocument()
})
