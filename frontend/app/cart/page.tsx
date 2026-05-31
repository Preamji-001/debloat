'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cartStore'
import { getMe } from '@/lib/api'
import CartItemComponent from '@/components/cart/CartItem'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const loadCart = useCartStore(s => s.loadCart)
  const updateItem = useCartStore(s => s.updateItem)
  const removeItem = useCartStore(s => s.removeItem)

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    loadCart()
  }, [loadCart, router])

  const subtotal = items.reduce((sum, i) => sum + i.meal.price_paise * i.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-mono text-xl text-[#F0EFE8] mb-8">{'// cart'}</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center border border-[#2A2A2A]">
          <p className="font-mono text-[#666666] text-sm mb-4">{'// cart is empty'}</p>
          <Link href="/menu">
            <Button variant="ghost" size="sm">browse menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="bg-[#161616] border border-[#2A2A2A] p-6">
            {items.map(item => (
              <CartItemComponent key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </div>

          <div className="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col gap-4 h-fit">
            <h2 className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// order summary'}</h2>
            <div className="flex justify-between font-mono text-sm border-t border-[#2A2A2A] pt-3">
              <span className="text-[#666666]">subtotal</span>
              <span className="text-[#F0EFE8]">₹{Math.round(subtotal / 100)}</span>
            </div>
            <Link href="/checkout">
              <Button variant="primary" className="w-full">proceed to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
