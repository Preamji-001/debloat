import { render, screen, fireEvent } from '@testing-library/react'
import AddressForm from '../AddressForm'
import type { Address } from '@/lib/types'

const addresses: Address[] = [
  { id: 'a1', label: 'Home', line1: '123 Main St', city: 'Mumbai', pincode: '400001', is_default: true },
]

test('renders existing addresses', () => {
  render(<AddressForm addresses={addresses} selectedId={null} onSelect={jest.fn()} onAdd={jest.fn()} />)
  expect(screen.getByText('Home')).toBeInTheDocument()
})

test('toggling add new address shows inline form', () => {
  render(<AddressForm addresses={addresses} selectedId={null} onSelect={jest.fn()} onAdd={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /add new/i }))
  expect(screen.getByLabelText(/line1/i)).toBeInTheDocument()
})
