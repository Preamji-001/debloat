'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getMeals, setMealAvailability } from '@/lib/api'
import type { Meal } from '@/lib/types'
import MealToggleRow from '@/components/admin/MealToggleRow'

export default function AdminMealsPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    getMe()
      .then(r => { if (r.data.role !== 'admin') router.push('/menu') })
      .catch(() => router.push('/login'))
    getMeals({}).then(r => setMeals(r.data))
  }, [router])

  const handleToggle = async (id: string, available: boolean) => {
    const res = await setMealAvailability(id, available)
    setMeals(prev => prev.map(m => m.id === id ? res.data : m))
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="font-mono text-xl text-[#F0EFE8]">// admin / meals</h1>

        <div className="bg-[#161616] border border-[#2A2A2A]">
          {meals.map(meal => (
            <MealToggleRow key={meal.id} meal={meal} onToggle={handleToggle} />
          ))}
          {meals.length === 0 && (
            <p className="font-mono text-xs text-[#666666] p-4">{'// no meals'}</p>
          )}
        </div>
      </div>
    </main>
  )
}
