import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

afterEach(() => jest.clearAllMocks())

test('shows validation errors on empty submit', async () => {
  render(<LoginPage />)
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })
})

test('shows email format error', async () => {
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'notanemail' } })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeInTheDocument())
})

test('calls api.login on valid submit', async () => {
  (api.login as jest.Mock).mockResolvedValueOnce({ data: {} })
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  await waitFor(() => expect(api.login).toHaveBeenCalledWith('a@b.com', 'pass123'))
})
