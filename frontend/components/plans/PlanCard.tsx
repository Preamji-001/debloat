import Link from 'next/link'
import type { MealPlan } from '@/lib/types'

export default function PlanCard({ plan }: { plan: MealPlan }) {
  return (
    <div className="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col gap-4">
      {plan.discount_pct > 0 && (
        <span className="font-mono text-xs text-[#F0EFE8] border border-[#F0EFE8] px-2 py-0.5 self-start">
          {plan.discount_pct}% off
        </span>
      )}
      <h2 className="font-mono text-base text-[#F0EFE8]">{plan.name}</h2>
      <p className="font-mono text-sm text-[#666666]">{plan.meal_count} meals</p>
      {plan.description && <p className="font-body text-[#666666] text-sm">{plan.description}</p>}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
        <span className="font-mono text-xl text-[#F0EFE8]">₹{Math.round(plan.price_paise / 100)}</span>
        <Link
          href={`/plans/${plan.id}`}
          className="font-mono text-xs text-[#666666] border border-[#2A2A2A] px-3 py-1.5 hover:border-[#F0EFE8] hover:text-[#F0EFE8] transition-colors duration-150"
        >
          view plan
        </Link>
      </div>
    </div>
  )
}
