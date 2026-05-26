import { render, screen, fireEvent } from '@testing-library/react'
import MealCard from '../MealCard'
import type { Meal } from '@/lib/types'

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))

const meal: Meal = {
  id: '1', name: 'Chicken Bowl', description: 'Lean protein bowl',
  category: 'high_protein', kcal: 450, protein_g: 45, carbs_g: 30, fat_g: 10,
  price_paise: 19900, image_url: null, is_available: true,
}

test('renders meal name and price', () => {
  render(<MealCard meal={meal} />)
  expect(screen.getByText('Chicken Bowl')).toBeInTheDocument()
  expect(screen.getByText('₹199')).toBeInTheDocument()
})

test('renders macro pills', () => {
  render(<MealCard meal={meal} />)
  expect(screen.getByText('45g P')).toBeInTheDocument()
  expect(screen.getByText('30g C')).toBeInTheDocument()
  expect(screen.getByText('10g F')).toBeInTheDocument()
  expect(screen.getByText('450 kcal')).toBeInTheDocument()
})

test('fires onAddToCart when button clicked', () => {
  const handler = jest.fn()
  render(<MealCard meal={meal} onAddToCart={handler} />)
  fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
  expect(handler).toHaveBeenCalledWith(meal.id)
})

test('shows unavailable overlay when is_available is false', () => {
  render(<MealCard meal={{ ...meal, is_available: false }} />)
  expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
})
