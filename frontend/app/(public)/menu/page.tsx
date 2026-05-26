'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMeals, addToCart } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import MacroFilters from '@/components/meals/MacroFilters'
import MealGrid from '@/components/meals/MealGrid'
import type { Meal, MacroFilters as MF } from '@/lib/types'

const DEFAULT_FILTERS: MF = {
  kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null,
}

export default function MenuPage() {
  const [filters, setFilters] = useState<MF>(DEFAULT_FILTERS)
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const loadCart = useCartStore(s => s.loadCart)

  const fetchMeals = useCallback(async (f: MF) => {
    setLoading(true)
    try {
      const res = await getMeals(f)
      setMeals(res.data)
    } catch {
      setMeals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMeals(DEFAULT_FILTERS) }, [fetchMeals])

  const handleFilterChange = (f: MF) => {
    setFilters(f)
    fetchMeals(f)
  }

  const handleAddToCart = async (meal_id: string) => {
    try {
      await addToCart(meal_id, 1)
      await loadCart()
    } catch {
      // toast handled at higher level in later tasks
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-mono text-xl text-[#F0EFE8] mb-8">{'// menu'}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside>
          <MacroFilters
            filters={filters}
            onChange={handleFilterChange}
            onApply={() => fetchMeals(filters)}
            resultCount={meals.length}
          />
        </aside>
        <div>
          {loading
            ? <div className="font-mono text-[#666666] text-sm">{'// loading meals...'}</div>
            : <MealGrid meals={meals} onAddToCart={handleAddToCart} />
          }
        </div>
      </div>
    </div>
  )
}
