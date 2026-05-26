import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MenuPage from '../page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
jest.mock('@/lib/cartStore', () => ({
  useCartStore: (selector: (s: { loadCart: () => void; items: [] }) => unknown) =>
    selector({ loadCart: jest.fn(), items: [] }),
}))

const mockMeals = [
  { id: '1', name: 'Bowl A', category: 'high_protein', kcal: 400, protein_g: 40, carbs_g: 20, fat_g: 8, price_paise: 15000, image_url: null, is_available: true, description: null },
]

beforeEach(() => {
  (api.getMeals as jest.Mock).mockResolvedValue({ data: mockMeals })
})

afterEach(() => jest.clearAllMocks())

test('calls getMeals and renders meal grid', async () => {
  render(<MenuPage />)
  await waitFor(() => expect(screen.getByText('Bowl A')).toBeInTheDocument())
})

test('clicking category pill updates filter and re-fetches', async () => {
  render(<MenuPage />)
  await waitFor(() => screen.getByText('Bowl A'))
  fireEvent.click(screen.getByRole('button', { name: /^high protein$/i }))
  await waitFor(() =>
    expect(api.getMeals).toHaveBeenCalledWith(expect.objectContaining({ category: 'high_protein' }))
  )
})
