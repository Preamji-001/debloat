'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMe, getOrders } from '@/lib/api'
import type { Order } from '@/lib/types'

const STATUS_LABEL: Record<Order['status'], string> = {
  pending_payment: 'pending payment',
  confirmed: 'confirmed',
  preparing: 'preparing',
  out_for_delivery: 'out for delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    getOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="font-mono text-xl text-[#F0EFE8]">// orders</h1>

        {loading && <p className="font-mono text-xs text-[#666666]">loading...</p>}

        {!loading && orders.length === 0 && (
          <p className="font-mono text-xs text-[#666666]">{'// no orders yet'}</p>
        )}

        {orders.map(order => (
          <Link key={order.id} href={`/account/orders/${order.id}`}>
            <div className="bg-[#161616] border border-[#2A2A2A] p-4 flex justify-between items-start hover:border-[#F0EFE8] transition-colors duration-150 cursor-pointer">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-sm text-[#F0EFE8]">#{order.id}</p>
                <p className="font-mono text-xs text-[#666666]">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="font-mono text-xs text-[#666666] border border-[#2A2A2A] px-2 py-0.5">
                  {STATUS_LABEL[order.status]}
                </p>
                <p className="font-mono text-sm text-[#F0EFE8]">₹{Math.round(order.total_paise / 100)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
