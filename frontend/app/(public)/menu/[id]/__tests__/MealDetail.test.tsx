import { render, screen } from '@testing-library/react'
import MealDetailPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@/lib/cartStore', () => ({
  useCartStore: (selector: (s: { loadCart: () => void }) => unknown) =>
    selector({ loadCart: jest.fn() }),
}))

const meal = {
  id: 'abc', name: 'Salmon Plate', description: 'Omega-3 rich',
  category: 'low_carb' as const, kcal: 380, protein_g: 35, carbs_g: 10, fat_g: 18,
  price_paise: 24900, image_url: null, is_available: true,
}

beforeEach(() => {
  (api.getMeal as jest.Mock).mockResolvedValue({ data: meal })
})

test('renders meal name, description and price', async () => {
  const Page = await MealDetailPage({ params: { id: 'abc' } })
  render(Page)
  expect(screen.getByText('Salmon Plate')).toBeInTheDocument()
  expect(screen.getByText('Omega-3 rich')).toBeInTheDocument()
  expect(screen.getByText('₹249')).toBeInTheDocument()
})
