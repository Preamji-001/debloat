import { render, screen, fireEvent } from '@testing-library/react'
import MacroFilters from '../MacroFilters'
import type { MacroFilters as MF } from '@/lib/types'

const defaultFilters: MF = {
  kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null,
}

test('Apply button calls onChange and onApply', () => {
  const onChange = jest.fn()
  const onApply = jest.fn()
  render(<MacroFilters filters={defaultFilters} onChange={onChange} onApply={onApply} resultCount={5} />)
  fireEvent.click(screen.getByRole('button', { name: /apply/i }))
  expect(onChange).toHaveBeenCalled()
  expect(onApply).toHaveBeenCalled()
})

test('shows result count', () => {
  render(<MacroFilters filters={defaultFilters} onChange={jest.fn()} onApply={jest.fn()} resultCount={7} />)
  expect(screen.getByText(/7 meals found/i)).toBeInTheDocument()
})

test('dismissing a filter tag calls onChange with that filter nulled', () => {
  const onChange = jest.fn()
  const filtersWithKcal: MF = { ...defaultFilters, kcal_max: 500 }
  render(<MacroFilters filters={filtersWithKcal} onChange={onChange} onApply={jest.fn()} resultCount={3} />)
  fireEvent.click(screen.getByLabelText(/remove kcal_max/i))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ kcal_max: null }))
})

test('category pill click updates category filter', () => {
  const onChange = jest.fn()
  render(<MacroFilters filters={defaultFilters} onChange={onChange} onApply={jest.fn()} resultCount={0} />)
  fireEvent.click(screen.getByRole('button', { name: /^high protein$/i }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'high_protein' }))
})
