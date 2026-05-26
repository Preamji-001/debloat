'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCartStore } from '@/lib/cartStore'
import CartItemComponent from './CartItem'
import Button from '@/components/ui/Button'

interface Props { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore(s => s.items)
  const loadCart = useCartStore(s => s.loadCart)
  const updateItem = useCartStore(s => s.updateItem)
  const removeItem = useCartStore(s => s.removeItem)
  const clearItems = useCartStore(s => s.clearItems)

  useEffect(() => { if (open) loadCart() }, [open, loadCart])

  const subtotal = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <>
      {open && <div className="fixed inset-0 bg-[#0D0D0D]/60 z-40" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full w-80 bg-[#161616] border-l border-[#2A2A2A] z-50 flex flex-col transform transition-transform duration-150 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <span className="font-mono text-xs text-[#F0EFE8]">{'// cart'}</span>
          <button onClick={onClose} className="font-mono text-[#666666] hover:text-[#F0EFE8] transition-colors duration-150">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0
            ? <p className="font-mono text-xs text-[#666666] py-8 text-center">{'// cart is empty'}</p>
            : items.map(item => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))
          }
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-[#2A2A2A] flex flex-col gap-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-[#666666]">subtotal</span>
              <span className="text-[#F0EFE8]">₹{Math.round(subtotal / 100)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button variant="primary" className="w-full">checkout</Button>
            </Link>
            <button onClick={clearItems} className="font-mono text-xs text-[#666666] hover:text-[#F0EFE8] transition-colors duration-150 text-center">
              clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
