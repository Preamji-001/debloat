'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrder } from '@/lib/api'
import type { Order } from '@/lib/types'

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('id')

  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!orderId) { router.push('/menu'); return }
    getOrder(orderId).then(r => setOrder(r.data)).catch(() => router.push('/menu'))
  }, [orderId, router])

  if (!order) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <p className="font-mono text-xs text-[#666666]">{'// loading...'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// status: confirmed'}</p>
          <h1 className="font-mono text-2xl text-[#F0EFE8]">order confirmed</h1>
          <p className="font-mono text-xs text-[#666666]">#{order.id}</p>
        </div>

        <div className="bg-[#161616] border border-[#2A2A2A] p-6 flex flex-col gap-4">
          <h3 className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// items'}</h3>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between font-mono text-xs">
              <span className="text-[#666666]">{item.meal_name} × {item.quantity}</span>
              <span className="text-[#F0EFE8]">₹{Math.round(item.price_paise * item.quantity / 100)}</span>
            </div>
          ))}
          <div className="flex justify-between font-mono text-sm border-t border-[#2A2A2A] pt-3">
            <span className="text-[#666666]">total</span>
            <span className="text-[#F0EFE8]">₹{Math.round(order.total_paise / 100)}</span>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2A2A2A] p-4 font-mono text-xs text-[#666666]">
          delivery: {order.delivery_slot.label} on{' '}
          {new Date(order.delivery_slot.date + 'T00:00:00').toLocaleDateString('en-IN')}
        </div>

        <div className="flex gap-3">
          <Link
            href="/account/orders"
            className="font-mono text-xs text-[#666666] border border-[#2A2A2A] px-4 py-2 hover:border-[#F0EFE8] hover:text-[#F0EFE8] transition-colors duration-150"
          >
            view all orders
          </Link>
          <Link
            href="/menu"
            className="font-mono text-xs bg-[#F0EFE8] text-[#0D0D0D] px-4 py-2 hover:bg-[#D8D7D1] transition-colors duration-150"
          >
            order more
          </Link>
        </div>
      </div>
    </main>
  )
}
