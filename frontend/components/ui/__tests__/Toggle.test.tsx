import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from '../Toggle'

test('calls onChange with toggled value', () => {
  const handler = jest.fn()
  render(<Toggle checked={false} onChange={handler} />)
  fireEvent.click(screen.getByRole('checkbox'))
  expect(handler).toHaveBeenCalledWith(true)
})
