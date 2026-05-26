import { getMealPlan } from '@/lib/api'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const res = await getMealPlan(params.id)
  const plan = res.data

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-[#161616] border border-[#2A2A2A] p-8">
        {plan.discount_pct > 0 && (
          <span className="font-mono text-xs border border-[#F0EFE8] text-[#F0EFE8] px-2 py-0.5 mb-4 inline-block">
            {plan.discount_pct}% bundle discount
          </span>
        )}
        <h1 className="font-mono text-xl text-[#F0EFE8] mt-2 mb-2">{plan.name}</h1>
        <p className="font-mono text-[#666666] text-sm mb-6">{plan.meal_count} meal slots</p>
        {plan.description && <p className="font-body text-[#666666] mb-6">{plan.description}</p>}

        <div className="border border-[#2A2A2A] p-4 mb-6">
          <div className="font-mono text-2xl text-[#F0EFE8]">₹{Math.round(plan.price_paise / 100)}</div>
          <div className="font-mono text-xs text-[#666666] mt-1">for {plan.meal_count} meals</div>
        </div>

        <Link href={`/menu?plan_id=${plan.id}&slots=${plan.meal_count}`}>
          <Button variant="primary">pick your {plan.meal_count} meals</Button>
        </Link>
      </div>
    </div>
  )
}
