'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getAddresses, addAddress, createOrder } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import type { Address, DeliverySlot } from '@/lib/types'
import AddressForm from '@/components/checkout/AddressForm'
import SlotPicker from '@/components/checkout/SlotPicker'
import OrderSummary from '@/components/checkout/OrderSummary'
import Button from '@/components/ui/Button'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearItems } = useCartStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe().catch(() => router.push('/login'))
    getAddresses().then(r => {
      setAddresses(r.data)
      const def = r.data.find((a: Address) => a.is_default)
      if (def) setSelectedAddressId(def.id)
    })
  }, [router])

  const handleAddAddress = async (data: Omit<Address, 'id' | 'is_default'>) => {
    const res = await addAddress(data)
    setAddresses(prev => [...prev, res.data])
    setSelectedAddressId(res.data.id)
  }

  const handleSlotSelect = (id: string) => {
    setSelectedSlotId(id)
  }

  const loadRazorpay = (): Promise<void> =>
    new Promise(resolve => {
      if (window.Razorpay) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      document.body.appendChild(script)
    })

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !selectedSlotId) {
      setError('Please select an address and delivery slot.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await createOrder(selectedAddressId, selectedSlotId)
      const { id: orderId, razorpay_order_id, amount } = res.data

      await loadRazorpay()

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        order_id: razorpay_order_id,
        handler: async () => {
          await clearItems()
          router.push(`/order-confirmed?id=${orderId}`)
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <AddressForm
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
            onAdd={handleAddAddress}
          />
          <SlotPicker selectedSlotId={selectedSlotId} onSelect={handleSlotSelect} />
        </div>

        <div className="flex flex-col gap-4">
          <OrderSummary items={items} slot={selectedSlot} />

          {error && (
            <p className="font-mono text-xs text-red-400">{error}</p>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'processing...' : 'place order'}
          </Button>
        </div>
      </div>
    </main>
  )
}
