import { render, screen } from '@testing-library/react'
import Nav from '../Nav'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/cartStore', () => ({
  useCartStore: (selector: (s: { items: { id: string }[] }) => unknown) =>
    selector({ items: [{ id: '1' }, { id: '2' }] }),
}))

test('renders logo text', () => {
  render(<Nav />)
  expect(screen.getByText('DEBLOAT')).toBeInTheDocument()
})

test('shows cart item count badge', () => {
  render(<Nav />)
  expect(screen.getByText('2')).toBeInTheDocument()
})
