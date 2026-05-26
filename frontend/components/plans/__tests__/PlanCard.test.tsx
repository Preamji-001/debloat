import { render, screen } from '@testing-library/react'
import PlanCard from '../PlanCard'
import type { MealPlan } from '@/lib/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const plan: MealPlan = {
  id: 'p1', name: 'Weekly Box', description: '5 meals',
  meal_count: 5, price_paise: 89900, discount_pct: 10, is_active: true,
}

test('renders plan name, meal count, price and discount', () => {
  render(<PlanCard plan={plan} />)
  expect(screen.getByText('Weekly Box')).toBeInTheDocument()
  expect(screen.getAllByText(/5 meals/i).length).toBeGreaterThan(0)
  expect(screen.getByText('₹899')).toBeInTheDocument()
  expect(screen.getByText(/10% off/i)).toBeInTheDocument()
})

test('renders CTA link to plan detail', () => {
  render(<PlanCard plan={plan} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '/plans/p1')
})
