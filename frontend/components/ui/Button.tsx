import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-off-white text-bg hover:bg-[#d8d7d0] font-medium',
  ghost: 'bg-transparent text-off-white border border-off-white hover:bg-surface2',
  danger: 'bg-transparent text-red-400 border border-red-400 hover:bg-red-400/10',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
}

export default function Button({ variant, size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        font-mono
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    />
  )
}
