'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrder } from '@/lib/api'
import type { Order } from '@/lib/types'

const TIMELINE: Order['status'][] = ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    getOrder(params.id)
      .then(r => setOrder(r.data))
      .catch(() => router.push('/account/orders'))
  }, [params.id, router])

  if (!order) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <p className="font-mono text-xs text-[#666666]">{'// loading...'}</p>
      </main>
    )
  }

  const currentIdx = TIMELINE.indexOf(order.status)

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <p className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// order detail'}</p>
          <h1 className="font-mono text-xl text-[#F0EFE8] mt-1">#{order.id}</h1>
        </div>

        <div className="bg-[#161616] border border-[#2A2A2A] p-4">
          <p className="font-mono text-xs text-[#666666] mb-3">status: {order.status}</p>
          <div className="flex gap-0">
            {TIMELINE.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-2 h-2 border ${i <= currentIdx ? 'bg-[#F0EFE8] border-[#F0EFE8]' : 'bg-transparent border-[#2A2A2A]'}`} />
                {i < TIMELINE.length - 1 && (
                  <div className={`h-px w-full ${i < currentIdx ? 'bg-[#F0EFE8]' : 'bg-[#2A2A2A]'}`} />
                )}
                <p className="font-mono text-[9px] text-[#666666] text-center leading-tight">{step.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2A2A2A] p-4 flex flex-col gap-3">
          <p className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// items'}</p>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between font-mono text-xs">
              <span className="text-[#666666]">{item.meal_name} × {item.quantity}</span>
              <span className="text-[#F0EFE8]">₹{Math.round(item.price_paise * item.quantity / 100)}</span>
            </div>
          ))}
          <div className="flex justify-between font-mono text-sm border-t border-[#2A2A2A] pt-2">
            <span className="text-[#666666]">total</span>
            <span className="text-[#F0EFE8]">₹{Math.round(order.total_paise / 100)}</span>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2A2A2A] p-4 font-mono text-xs text-[#666666]">
          delivery: {order.delivery_slot.label} on{' '}
          {new Date(order.delivery_slot.date + 'T00:00:00').toLocaleDateString('en-IN')}
        </div>
      </div>
    </main>
  )
}
