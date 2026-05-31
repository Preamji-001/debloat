'use client'

import { useState, useEffect } from 'react'
import { getDeliverySlots } from '@/lib/api'
import type { DeliverySlot } from '@/lib/types'

interface Props {
  selectedSlotId: string | null
  onSelect: (id: string) => void
}

function next7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d.toISOString().split('T')[0]
  })
}

export default function SlotPicker({ selectedSlotId, onSelect }: Props) {
  const days = next7Days()
  const [selectedDate, setSelectedDate] = useState(days[0])
  const [slots, setSlots] = useState<DeliverySlot[]>([])

  useEffect(() => {
    getDeliverySlots(selectedDate)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
  }, [selectedDate])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-xs text-[#666666] uppercase tracking-wider">{'// select delivery date'}</h3>

      <div className="flex flex-wrap gap-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDate(day)}
            className={`font-mono text-xs px-3 py-1.5 border transition-colors duration-150 ${
              selectedDate === day
                ? 'bg-[#F0EFE8] text-[#0D0D0D] border-[#F0EFE8]'
                : 'text-[#666666] border-[#2A2A2A] hover:border-[#F0EFE8] hover:text-[#F0EFE8]'
            }`}
          >
            {new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {slots.map(slot => {
          const full = slot.booked_count >= slot.capacity
          return (
            <button
              key={slot.id}
              onClick={() => !full && onSelect(slot.id)}
              disabled={full}
              className={`text-left font-mono text-sm px-4 py-3 border transition-colors duration-150 ${
                selectedSlotId === slot.id
                  ? 'border-[#F0EFE8] text-[#F0EFE8] bg-[#1E1E1E]'
                  : full
                  ? 'border-[#2A2A2A] text-[#666666] opacity-40 cursor-not-allowed'
                  : 'border-[#2A2A2A] text-[#666666] hover:border-[#F0EFE8] hover:text-[#F0EFE8]'
              }`}
            >
              {slot.label}
              {full && <span className="ml-2 text-xs">(full)</span>}
            </button>
          )
        })}
        {slots.length === 0 && (
          <p className="font-mono text-xs text-[#666666]">{'// no slots available for this date'}</p>
        )}
      </div>
    </div>
  )
}
