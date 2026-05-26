'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Errors { email?: string; password?: string; form?: string }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const e: Errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      router.push('/menu')
    } catch (err: unknown) {
      setErrors({ form: (err as Error).message ?? 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[#161616] border border-[#2A2A2A] p-8">
        <h1 className="font-mono text-base text-[#F0EFE8] mb-8">{'// login'}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
          <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
          {errors.form && <p className="font-mono text-xs text-red-400">{errors.form}</p>}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '...' : 'login'}
          </Button>
          <p className="font-mono text-xs text-[#666666] text-center">
            no account?{' '}
            <Link href="/register" className="text-[#F0EFE8] hover:text-[#666666] transition-colors duration-150">register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
