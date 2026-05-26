import type { Meal } from '@/lib/types'
import MealCard from './MealCard'

interface Props {
  meals: Meal[]
  onAddToCart?: (id: string) => void
}

export default function MealGrid({ meals, onAddToCart }: Props) {
  if (meals.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="font-mono text-[#666666] text-sm">{'// no meals match your filters'}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {meals.map(meal => (
        <MealCard key={meal.id} meal={meal} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
