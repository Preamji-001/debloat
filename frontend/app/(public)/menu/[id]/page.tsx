import { getMeal, getMeals } from '@/lib/api'
import AddToCartButton from '@/components/meals/AddToCartButton'

export async function generateStaticParams() {
  try {
    const res = await getMeals({ kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null })
    return res.data.map(m => ({ id: m.id }))
  } catch {
    return []
  }
}

export default async function MealDetailPage({ params }: { params: { id: string } }) {
  const res = await getMeal(params.id)
  const meal = res.data
  const fmt = (p: number) => `₹${Math.round(p / 100)}`

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="border border-[#2A2A2A] bg-[#161616] p-8">
        <p className="font-mono text-xs text-[#666666] mb-2 uppercase tracking-wider">
          {meal.category.replace(/_/g, ' ')}
        </p>
        <h1 className="font-mono text-xl text-[#F0EFE8] mb-4">{meal.name}</h1>
        {meal.description && (
          <p className="font-body text-[#666666] mb-6">{meal.description}</p>
        )}

        <div className="grid grid-cols-4 gap-4 border border-[#2A2A2A] p-4 mb-6">
          {[
            { label: 'Protein', value: `${meal.protein_g}g` },
            { label: 'Carbs', value: `${meal.carbs_g}g` },
            { label: 'Fat', value: `${meal.fat_g}g` },
            { label: 'Calories', value: `${meal.kcal}` },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="font-mono text-lg text-[#F0EFE8]">{m.value}</div>
              <div className="font-mono text-xs text-[#666666]">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl text-[#F0EFE8]">{fmt(meal.price_paise)}</span>
          {meal.is_available
            ? <AddToCartButton mealId={meal.id} />
            : <span className="font-mono text-xs text-[#666666] border border-[#2A2A2A] px-4 py-2">UNAVAILABLE</span>
          }
        </div>
      </div>
    </div>
  )
}
