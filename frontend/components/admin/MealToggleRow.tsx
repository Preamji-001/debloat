import type { Meal } from '@/lib/types'
import Toggle from '@/components/ui/Toggle'

interface Props {
  meal: Meal
  onToggle: (id: string, available: boolean) => void
}

export default function MealToggleRow({ meal, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-sm text-[#F0EFE8]">{meal.name}</span>
        <span className="font-mono text-xs text-[#666666]">₹{Math.round(meal.price_paise / 100)}</span>
      </div>
      <Toggle
        checked={meal.is_available}
        onChange={val => onToggle(meal.id, val)}
        label={meal.is_available ? 'available' : 'unavailable'}
      />
    </div>
  )
}
