interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div
        className={`
          w-10 h-5 relative transition-colors duration-150
          ${checked ? 'bg-off-white' : 'bg-surface2 border border-border'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 bg-bg transition-transform duration-150
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </div>
      {label && <span className="text-sm font-mono text-off-white">{label}</span>}
    </label>
  )
}
