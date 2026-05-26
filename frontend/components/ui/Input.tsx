import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
}

export default function Input({ label, name, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-muted text-xs font-mono uppercase tracking-wider">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`
          bg-surface text-off-white border
          ${error ? 'border-red-400' : 'border-border'}
          focus:outline-none focus:border-off-white
          px-3 py-2 text-sm font-body
          transition-colors duration-150
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-red-400 text-xs font-mono">{error}</span>}
    </div>
  )
}
