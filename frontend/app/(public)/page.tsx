import Link from 'next/link'
import { getMeals } from '@/lib/api'
import type { Meal } from '@/lib/types'

async function getFeaturedMeals(): Promise<Meal[]> {
  try {
    const res = await getMeals({ kcal_max: null, protein_min: null, carbs_max: null, fat_max: null, category: null })
    return res.data.slice(0, 3)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredMeals = await getFeaturedMeals()

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 border-b border-[#2A2A2A]">
        <p className="font-mono text-[#666666] text-xs mb-4 tracking-widest">{'// meal prep. redefined.'}</p>
        <h1 className="font-logo text-3xl md:text-4xl text-[#F0EFE8] leading-tight mb-6">
          EAT CLEAN.<br />TRACK MACROS.<br />FEEL HUMAN.
        </h1>
        <p className="font-body text-[#666666] text-lg mb-8 max-w-xl">
          No seed oils. No nonsense. Just macro-balanced meals delivered to your door.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center bg-[#F0EFE8] text-[#0D0D0D] font-mono px-5 py-2.5 hover:bg-[#d8d7d0] transition-colors duration-150"
        >
          {'// browse menu'}
        </Link>
      </section>

      {/* Stats bar */}
      <section className="py-8 border-b border-[#2A2A2A] grid grid-cols-3 gap-4">
        {[
          { label: '// macros tracked', value: '4' },
          { label: '// meals available', value: '12+' },
          { label: '// happy guts', value: '∞' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="font-logo text-2xl text-[#F0EFE8] mb-1">{stat.value}</div>
            <div className="font-mono text-xs text-[#666666]">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured meals */}
      {featuredMeals.length > 0 && (
        <section className="py-16">
          <h2 className="font-mono text-[#666666] text-xs tracking-widest mb-8">{'// featured meals'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMeals.map(meal => (
              <div key={meal.id} className="bg-[#161616] border border-[#2A2A2A] p-4">
                <p className="font-mono text-xs text-[#666666] mb-1">{meal.category}</p>
                <h3 className="font-mono text-[#F0EFE8] mb-2">{meal.name}</h3>
                <p className="font-mono text-xs text-[#F0EFE8]">
                  ₹{(meal.price_paise / 100).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
