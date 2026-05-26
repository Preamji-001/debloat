'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/api'
import { useCartStore } from '@/lib/cartStore'
import Button from '@/components/ui/Button'

export default function AddToCartButton({ mealId }: { mealId: string }) {
  const [loading, setLoading] = useState(false)
  const loadCart = useCartStore(s => s.loadCart)

  const handle = async () => {
    setLoading(true)
    try {
      await addToCart(mealId, 1)
      await loadCart()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="primary" onClick={handle} disabled={loading}>
      {loading ? '...' : 'add to cart'}
    </Button>
  )
}
