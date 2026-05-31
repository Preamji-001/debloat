'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getAddresses, addAddress, logout } from '@/lib/api'
import type { User, Address } from '@/lib/types'
import AddressForm from '@/components/checkout/AddressForm'
import Button from '@/components/ui/Button'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])

  useEffect(() => {
    getMe()
      .then(r => setUser(r.data))
      .catch(() => router.push('/login'))
    getAddresses().then(r => setAddresses(r.data))
  }, [router])

  const handleAddAddress = async (data: Omit<Address, 'id' | 'is_default'>) => {
    const res = await addAddress(data)
    setAddresses(prev => [...prev, res.data])
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <p className="font-mono text-xs text-[#666666]">{'// loading...'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-12">
      <div className="max-w-xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// profile'}</p>
            <h1 className="font-mono text-xl text-[#F0EFE8] mt-1">{user.name}</h1>
            <p className="font-mono text-xs text-[#666666] mt-1">{user.email}</p>
            <p className="font-mono text-xs text-[#666666]">{user.phone}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>logout</Button>
        </div>

        <AddressForm
          addresses={addresses}
          selectedId={null}
          onSelect={() => {}}
          onAdd={handleAddAddress}
        />
      </div>
    </main>
  )
}
