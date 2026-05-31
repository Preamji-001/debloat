import { render, screen } from '@testing-library/react'
import CartPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@/lib/api', () => ({ getMe: jest.fn().mockResolvedValue({ data: {} }) }))
jest.mock('@/lib/cartStore', () => ({
  useCartStore: (sel: (s: object) => unknown) => sel({
    items: [],
    loadCart: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}))

test('shows empty cart message when no items', () => {
  render(<CartPage />)
  expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
})

test('shows browse menu link when empty', () => {
  render(<CartPage />)
  expect(screen.getByRole('link', { name: /browse menu/i })).toBeInTheDocument()
})
