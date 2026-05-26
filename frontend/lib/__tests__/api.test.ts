import { getMeals, getCart } from '@/lib/api'

const BASE = 'http://localhost:8080/api/v1'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => jest.resetAllMocks())

describe('apiFetch 401 retry', () => {
  it('retries once after 401 by calling /auth/refresh then re-requesting', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: [] }) })

    await getCart()
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${BASE}/auth/refresh`, expect.objectContaining({ method: 'POST' }))
  })

  it('throws on second 401 after refresh', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }) })

    await expect(getCart()).rejects.toThrow('Unauthorized')
  })
})

describe('getMeals', () => {
  it('builds query string from MacroFilters, omitting nulls', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: [] }) })

    await getMeals({ kcal_max: 500, protein_min: 30, carbs_max: null, fat_max: null, category: 'high_protein' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('kcal_max=500')
    expect(calledUrl).toContain('protein_min=30')
    expect(calledUrl).toContain('category=high_protein')
    expect(calledUrl).not.toContain('carbs_max')
    expect(calledUrl).not.toContain('fat_max')
  })
})
