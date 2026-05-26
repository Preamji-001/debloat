'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Errors { name?: string; email?: string; phone?: string; password?: string; form?: string }

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be 10 digits'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.phone, form.password)
      router.push('/menu')
    } catch (err: unknown) {
      setErrors({ form: (err as Error).message ?? 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[#161616] border border-[#2A2A2A] p-8">
        <h1 className="font-mono text-base text-[#F0EFE8] mb-8">{'// register'}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Name" name="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={set('password')} error={errors.password} />
          {errors.form && <p className="font-mono text-xs text-red-400">{errors.form}</p>}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '...' : 'register'}
          </Button>
          <p className="font-mono text-xs text-[#666666] text-center">
            have an account?{' '}
            <Link href="/login" className="text-[#F0EFE8] hover:text-[#666666] transition-colors duration-150">login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
