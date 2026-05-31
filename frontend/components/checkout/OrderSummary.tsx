import type { CartItem, DeliverySlot } from '@/lib/types'

interface Props {
  items: CartItem[]
  slot: DeliverySlot | null
}

export default function OrderSummary({ items, slot }: Props) {
  const total = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <div className="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col gap-4">
      <h3 className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// order summary'}</h3>

      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between font-mono text-xs">
            <span className="text-[#666666]">{item.meal.name} × {item.quantity}</span>
            <span className="text-[#F0EFE8]">₹{Math.round(item.meal.price_paise * item.quantity / 100)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-mono text-sm border-t border-[#2A2A2A] pt-3">
        <span className="text-[#666666]">total</span>
        <span className="text-[#F0EFE8]">₹{Math.round(total / 100)}</span>
      </div>

      {slot && (
        <div className="font-mono text-xs text-[#666666] border-t border-[#2A2A2A] pt-3">
          delivery: {slot.label} on {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-IN')}
        </div>
      )}
    </div>
  )
}
