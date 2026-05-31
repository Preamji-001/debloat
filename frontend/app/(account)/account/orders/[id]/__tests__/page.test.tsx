import { render, screen } from '@testing-library/react'
import OrderDetailPage from '../page'

jest.mock('@/lib/api', () => ({
  getOrder: jest.fn().mockResolvedValue({
    data: {
      id: 'order1',
      status: 'out_for_delivery',
      total_paise: 30000,
      created_at: '2026-05-27T10:00:00Z',
      delivery_slot: { id: 's1', date: '2026-05-28', label: '8am - 10am', capacity: 10, booked_count: 3, is_active: true },
      items: [{ id: 'oi1', meal_name: 'Chicken Bowl', quantity: 2, price_paise: 15000 }],
    },
  }),
}))

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders order detail heading', async () => {
  render(<OrderDetailPage params={{ id: 'order1' }} />)
  expect(await screen.findByText(/order1/i)).toBeInTheDocument()
})

test('renders status timeline', async () => {
  render(<OrderDetailPage params={{ id: 'order1' }} />)
  expect(await screen.findByText(/out_for_delivery/i)).toBeInTheDocument()
})
