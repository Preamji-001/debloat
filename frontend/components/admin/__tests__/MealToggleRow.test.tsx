import { render, screen, fireEvent } from '@testing-library/react'
import MealToggleRow from '../MealToggleRow'
import type { Meal } from '@/lib/types'

const meal: Meal = {
  id: 'm1', name: 'Chicken Bowl', description: null, category: 'high_protein',
  kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 10, price_paise: 15000,
  image_url: null, is_available: true,
}

test('renders meal name', () => {
  render(<MealToggleRow meal={meal} onToggle={jest.fn()} />)
  expect(screen.getByText('Chicken Bowl')).toBeInTheDocument()
})

test('calls onToggle with new availability when toggled', () => {
  const onToggle = jest.fn()
  render(<MealToggleRow meal={meal} onToggle={onToggle} />)
  const toggle = screen.getByRole('checkbox')
  fireEvent.click(toggle)
  expect(onToggle).toHaveBeenCalledWith('m1', false)
})
