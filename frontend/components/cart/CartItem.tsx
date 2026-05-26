import type { CartItem } from '@/lib/types'

interface Props {
  item: CartItem
  onUpdate: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function CartItemComponent({ item, onUpdate, onRemove }: Props) {
  const total = Math.round((item.meal.price_paise * item.quantity) / 100)

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="font-mono text-sm text-[#F0EFE8]">{item.meal.name}</span>
        <span className="font-mono text-xs text-[#666666]">₹{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(item.id, item.quantity - 1)}
          aria-label="decrease quantity"
          className="w-6 h-6 flex items-center justify-center border border-[#2A2A2A] text-[#F0EFE8] hover:border-[#F0EFE8] transition-colors duration-150 font-mono"
        >−</button>
        <span className="font-mono text-sm text-[#F0EFE8] w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdate(item.id, item.quantity + 1)}
          aria-label="increase quantity"
          className="w-6 h-6 flex items-center justify-center border border-[#2A2A2A] text-[#F0EFE8] hover:border-[#F0EFE8] transition-colors duration-150 font-mono"
        >+</button>
        <button
          onClick={() => onRemove(item.id)}
          aria-label="remove item"
          className="ml-2 font-mono text-xs text-[#666666] hover:text-red-400 transition-colors duration-150"
        >×</button>
      </div>
    </div>
  )
}
