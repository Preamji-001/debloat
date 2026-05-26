import { getMealPlans } from '@/lib/api'
import PlanCard from '@/components/plans/PlanCard'

export default async function PlansPage() {
  let plans = []
  try {
    const res = await getMealPlans()
    plans = res.data.filter(p => p.is_active)
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-mono text-xl text-[#F0EFE8] mb-2">{'// meal plans'}</h1>
      <p className="font-mono text-[#666666] text-sm mb-8">{'// bundle and save. eat better, spend less.'}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  )
}
