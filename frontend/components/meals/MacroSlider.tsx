interface MacroSliderProps {
  label: string
  min: number
  max: number
  value: number | null
  onChange: (v: number | null) => void
  unit?: string
}

export default function MacroSlider({ label, min, max, value, onChange, unit = '' }: MacroSliderProps) {
  const current = value ?? max

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs text-[#666666] uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs text-[#F0EFE8]">
          {value === null ? 'any' : `≤ ${current}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={current}
        onChange={e => onChange(Number(e.target.value) === max ? null : Number(e.target.value))}
        className="w-full h-1 bg-[#1E1E1E] appearance-none cursor-pointer"
        aria-label={label}
      />
    </div>
  )
}
