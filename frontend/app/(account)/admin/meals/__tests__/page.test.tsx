import { render, screen } from '@testing-library/react'
import AdminMealsPage from '../page'

jest.mock('@/lib/api', () => ({
  getMe: jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Admin', email: 'admin@b.com', phone: '9999999999', role: 'admin' } }),
  getMeals: jest.fn().mockResolvedValue({
    data: [
      { id: 'm1', name: 'Chicken Bowl', description: null, category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 10, price_paise: 15000, image_url: null, is_available: true },
    ],
  }),
  setMealAvailability: jest.fn().mockResolvedValue({ data: {} }),
}))

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders admin meals heading', async () => {
  render(<AdminMealsPage />)
  expect(await screen.findByText(/meals/i)).toBeInTheDocument()
})

test('renders meal name', async () => {
  render(<AdminMealsPage />)
  expect(await screen.findByText('Chicken Bowl')).toBeInTheDocument()
})
