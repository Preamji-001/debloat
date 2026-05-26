import { render, screen } from '@testing-library/react'
import CartDrawer from '../CartDrawer'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

jest.mock('@/lib/cartStore', () => ({
  useCartStore: (sel: (s: object) => unknown) => sel({
    items: [
      { id: 'ci1', meal_id: 'm1', quantity: 2, meal: { id: 'm1', name: 'Bowl A', price_paise: 15000, description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, image_url: null, is_available: true } },
    ],
    loadCart: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  }),
}))

test('shows subtotal', () => {
  render(<CartDrawer open={true} onClose={jest.fn()} />)
  expect(screen.getAllByText('₹300').length).toBeGreaterThan(0)
})

test('shows checkout CTA', () => {
  render(<CartDrawer open={true} onClose={jest.fn()} />)
  expect(screen.getByRole('link', { name: /checkout/i })).toBeInTheDocument()
})
