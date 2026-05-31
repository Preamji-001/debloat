'use client'

import { useState } from 'react'
import type { Address } from '@/lib/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Props {
  addresses: Address[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (data: Omit<Address, 'id' | 'is_default'>) => void
}

export default function AddressForm({ addresses, selectedId, onSelect, onAdd }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ label: '', line1: '', city: '', pincode: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = () => {
    onAdd(form)
    setShowNew(false)
    setForm({ label: '', line1: '', city: '', pincode: '' })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// delivery address'}</h3>

      {addresses.map(addr => (
        <button
          key={addr.id}
          onClick={() => onSelect(addr.id)}
          className={`text-left p-3 border transition-colors duration-150 ${
            selectedId === addr.id ? 'border-[#F0EFE8] bg-[#1E1E1E]' : 'border-[#2A2A2A] hover:border-[#F0EFE8]'
          }`}
        >
          <div className="font-mono text-sm text-[#F0EFE8] flex items-center gap-2">
            {addr.label ?? 'Address'}
            {addr.is_default && <span className="text-[10px] text-[#666666] border border-[#2A2A2A] px-1">default</span>}
          </div>
          <div className="font-mono text-xs text-[#666666] mt-1">{addr.line1}, {addr.city} — {addr.pincode}</div>
        </button>
      ))}

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="font-mono text-xs text-[#666666] border border-dashed border-[#2A2A2A] px-3 py-2 hover:border-[#F0EFE8] hover:text-[#F0EFE8] transition-colors duration-150"
        >
          + add new address
        </button>
      )}

      {showNew && (
        <div className="border border-[#2A2A2A] p-4 flex flex-col gap-3">
          <Input label="Label" name="label" value={form.label} onChange={set('label')} placeholder="Home / Work" />
          <Input label="Line1" name="line1" value={form.line1} onChange={set('line1')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" name="city" value={form.city} onChange={set('city')} />
            <Input label="Pincode" name="pincode" value={form.pincode} onChange={set('pincode')} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>save</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
