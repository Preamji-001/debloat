'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getAdminOrders, updateOrderStatus } from '@/lib/api'
import type { Order } from '@/lib/types'

const STATUSES: Order['status'][] = ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="bg-[#161616] border border-[#2A2A2A] p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-sm text-[#F0EFE8]">#{order.id}</p>
          <p className="font-mono text-xs text-[#666666]">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
        </div>
        <p className="font-mono text-sm text-[#F0EFE8]">₹{Math.round(order.total_paise / 100)}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-[#666666]">status:</span>
        <select
          value={order.status}
          onChange={e => onStatusChange(order.id, e.target.value)}
          className="font-mono text-xs bg-[#0D0D0D] text-[#F0EFE8] border border-[#2A2A2A] px-2 py-1 outline-none"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="font-mono text-xs text-[#666666]">
        {order.items.map(i => `${i.meal_name} ×${i.quantity}`).join(', ')}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getMe()
      .then(r => { if (r.data.role !== 'admin') router.push('/menu') })
      .catch(() => router.push('/login'))
    getAdminOrders().then(r => setOrders(r.data))
  }, [router])

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? res.data : o))
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="font-mono text-xl text-[#F0EFE8]">// admin / orders</h1>

        {orders.map(order => (
          <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
        ))}
        {orders.length === 0 && (
          <p className="font-mono text-xs text-[#666666]">{'// no orders'}</p>
        )}
      </div>
    </main>
  )
}
