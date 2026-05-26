import { render, screen, fireEvent } from '@testing-library/react'
import CartItemComponent from '../CartItem'
import type { CartItem } from '@/lib/types'

const item: CartItem = {
  id: 'ci1', meal_id: 'm1', quantity: 2,
  meal: { id: 'm1', name: 'Bowl A', description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, price_paise: 15000, image_url: null, is_available: true },
}

test('renders meal name, quantity and price', () => {
  render(<CartItemComponent item={item} onUpdate={jest.fn()} onRemove={jest.fn()} />)
  expect(screen.getByText('Bowl A')).toBeInTheDocument()
  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByText('₹300')).toBeInTheDocument()
})

test('+ button calls onUpdate with quantity + 1', () => {
  const onUpdate = jest.fn()
  render(<CartItemComponent item={item} onUpdate={onUpdate} onRemove={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /increase/i }))
  expect(onUpdate).toHaveBeenCalledWith('ci1', 3)
})

test('− button calls onUpdate with quantity - 1', () => {
  const onUpdate = jest.fn()
  render(<CartItemComponent item={item} onUpdate={onUpdate} onRemove={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /decrease/i }))
  expect(onUpdate).toHaveBeenCalledWith('ci1', 1)
})

test('remove button calls onRemove', () => {
  const onRemove = jest.fn()
  render(<CartItemComponent item={item} onUpdate={jest.fn()} onRemove={onRemove} />)
  fireEvent.click(screen.getByRole('button', { name: /remove/i }))
  expect(onRemove).toHaveBeenCalledWith('ci1')
})
