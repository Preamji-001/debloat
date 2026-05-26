import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

test('renders primary variant with children', () => {
  render(<Button variant="primary">Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})

test('applies danger styles', () => {
  render(<Button variant="danger">Delete</Button>)
  const btn = screen.getByRole('button')
  expect(btn.className).toMatch(/red/)
})

test('fires onClick', () => {
  const handler = jest.fn()
  render(<Button variant="primary" onClick={handler}>Go</Button>)
  fireEvent.click(screen.getByRole('button'))
  expect(handler).toHaveBeenCalledTimes(1)
})

test('sm size applies smaller padding', () => {
  render(<Button variant="ghost" size="sm">Small</Button>)
  const btn = screen.getByRole('button')
  expect(btn.className).toMatch(/px-3/)
})
