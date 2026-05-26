'use client'

import { useState } from 'react'
import MacroSlider from './MacroSlider'
import Button from '@/components/ui/Button'
import type { MacroFilters as MF } from '@/lib/types'

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'High Protein', value: 'high_protein' },
  { label: 'Gut Reset', value: 'gut_reset' },
  { label: 'Low Carb', value: 'low_carb' },
  { label: 'Veg', value: 'veg' },
  { label: 'Non-Veg', value: 'non_veg' },
]

interface Props {
  filters: MF
  onChange: (f: MF) => void
  onApply: () => void
  resultCount: number
}

export default function MacroFilters({ filters, onChange, onApply, resultCount }: Props) {
  const [draft, setDraft] = useState<MF>(filters)

  const handleApply = () => {
    onChange(draft)
    onApply()
  }

  const handleDismiss = (key: keyof MF) => {
    const updated = { ...filters, [key]: null }
    onChange(updated)
    setDraft(updated)
  }

  const activeTags = (Object.entries(filters) as [keyof MF, MF[keyof MF]][]).filter(([, v]) => v !== null)

  return (
    <div className="bg-[#161616] border border-[#2A2A2A] p-4 flex flex-col gap-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={String(cat.value)}
            onClick={() => {
              const updated = { ...draft, category: cat.value }
              setDraft(updated)
              onChange(updated)
            }}
            className={`font-mono text-xs px-3 py-1 border transition-colors duration-150 ${
              draft.category === cat.value
                ? 'bg-[#F0EFE8] text-[#0D0D0D] border-[#F0EFE8]'
                : 'bg-transparent text-[#666666] border-[#2A2A2A] hover:border-[#F0EFE8] hover:text-[#F0EFE8]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <MacroSlider label="kcal max" min={200} max={1000} value={draft.kcal_max} onChange={v => setDraft(d => ({ ...d, kcal_max: v }))} unit=" kcal" />
      <MacroSlider label="protein min" min={0} max={100} value={draft.protein_min} onChange={v => setDraft(d => ({ ...d, protein_min: v }))} unit="g" />
      <MacroSlider label="carbs max" min={0} max={150} value={draft.carbs_max} onChange={v => setDraft(d => ({ ...d, carbs_max: v }))} unit="g" />
      <MacroSlider label="fat max" min={0} max={80} value={draft.fat_max} onChange={v => setDraft(d => ({ ...d, fat_max: v }))} unit="g" />

      {/* Active filter tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTags.map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 font-mono text-xs border border-[#2A2A2A] px-2 py-0.5 text-[#666666]">
              {key}: {String(val)}
              <button
                onClick={() => handleDismiss(key)}
                aria-label={`remove ${key}`}
                className="text-[#666666] hover:text-[#F0EFE8] ml-1"
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#666666]">{resultCount} meals found</span>
        <Button variant="primary" size="sm" onClick={handleApply}>apply</Button>
      </div>
    </div>
  )
}
