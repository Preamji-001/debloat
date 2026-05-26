import { render, screen } from '@testing-library/react'
import Input from '../Input'

test('renders with label', () => {
  render(<Input label="Email" name="email" />)
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})

test('shows error message', () => {
  render(<Input label="Email" name="email" error="Required" />)
  expect(screen.getByText('Required')).toBeInTheDocument()
})
