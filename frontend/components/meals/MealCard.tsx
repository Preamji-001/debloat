import Link from 'next/link'
import type { Meal } from '@/lib/types'
import Button from '@/components/ui/Button'

interface Props {
  meal: Meal
  onAddToCart?: (id: string) => void
}

const fmt = (paise: number) => `₹${Math.round(paise / 100)}`

export default function MealCard({ meal, onAddToCart }: Props) {
  return (
    <div className="relative bg-[#161616] border border-[#2A2A2A] flex flex-col">
      <div className="h-40 bg-[#1E1E1E] border-b border-[#2A2A2A] flex items-center justify-center overflow-hidden">
        {meal.image_url
          ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
          : <span className="font-mono text-xs text-[#666666]">{'// no image'}</span>
        }
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link href={`/menu/${meal.id}`}>
          <h3 className="font-mono text-sm text-[#F0EFE8] hover:text-[#666666] transition-colors duration-150">
            {meal.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {[
            `${meal.protein_g}g P`,
            `${meal.carbs_g}g C`,
            `${meal.fat_g}g F`,
            `${meal.kcal} kcal`,
          ].map(tag => (
            <span key={tag} className="font-mono text-[10px] text-[#666666] border border-[#2A2A2A] px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#2A2A2A]">
          <span className="font-mono text-sm text-[#F0EFE8]">{fmt(meal.price_paise)}</span>
          {meal.is_available && onAddToCart && (
            <Button variant="ghost" size="sm" onClick={() => onAddToCart(meal.id)}>
              add to cart
            </Button>
          )}
        </div>
      </div>

      {!meal.is_available && (
        <div className="absolute inset-0 bg-[#0D0D0D]/70 flex items-center justify-center">
          <span className="font-mono text-xs text-[#666666] border border-[#2A2A2A] px-3 py-1">UNAVAILABLE</span>
        </div>
      )}
    </div>
  )
}
