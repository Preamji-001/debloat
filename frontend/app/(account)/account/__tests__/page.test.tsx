import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountPage from '../page'

jest.mock('@/lib/api', () => ({
  getMe: jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test User', email: 'a@b.com', phone: '9999999999', role: 'customer' } }),
  getAddresses: jest.fn().mockResolvedValue({
    data: [{ id: 'addr1', label: 'Home', line1: '123 Main St', city: 'Mumbai', pincode: '400001', is_default: true }],
  }),
  addAddress: jest.fn().mockResolvedValue({ data: { id: 'addr2', label: 'Work', line1: '1 Work St', city: 'Delhi', pincode: '110001', is_default: false } }),
  logout: jest.fn().mockResolvedValue({}),
}))

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders user name', async () => {
  render(<AccountPage />)
  expect(await screen.findByText('Test User')).toBeInTheDocument()
})

test('renders saved address', async () => {
  render(<AccountPage />)
  expect(await screen.findByText('Home')).toBeInTheDocument()
})
