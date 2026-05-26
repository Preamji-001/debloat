'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/cartStore'
import { ShoppingBag } from 'lucide-react'

const links = [
  { href: '/menu', label: '// menu' },
  { href: '/plans', label: '// plans' },
  { href: '/account', label: '// account' },
]

export default function Nav() {
  const pathname = usePathname()
  const items = useCartStore(s => s.items)

  return (
    <nav className="border-b border-[#2A2A2A] bg-[#161616] px-6 py-4 flex items-center justify-between">
      <Link href="/" className="font-logo text-sm text-[#F0EFE8] tracking-wider flex items-center gap-1">
        DEBLOAT
        <span className="animate-pulse">_</span>
      </Link>

      <div className="flex items-center gap-6">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`font-mono text-xs transition-colors duration-150 ${
              pathname.startsWith(l.href) ? 'text-[#F0EFE8]' : 'text-[#666666] hover:text-[#F0EFE8]'
            }`}
          >
            {l.label}
          </Link>
        ))}

        <Link href="/cart" className="relative text-[#F0EFE8] hover:text-[#666666] transition-colors duration-150">
          <ShoppingBag size={18} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#F0EFE8] text-[#0D0D0D] text-[10px] font-mono w-4 h-4 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
