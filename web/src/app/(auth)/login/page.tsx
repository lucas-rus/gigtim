'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
      const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || data?.error) {
        setError(data?.error || 'Email sau parolă incorectă.')
        setLoading(false)
        return
      }

      // Hard navigation: the Set-Cookie header from /api/auth/login is already
      // committed to the browser's cookie jar before this navigation begins,
      // so /shifts will be requested with the session cookie attached.
      window.location.assign('/shifts')
    } catch (err: any) {
      setError('Eroare de rețea: ' + (err?.message || 'necunoscută'))
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-5%] h-[600px] w-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-[440px] space-y-8 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl font-extrabold shadow-2xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
            G
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight font-heading text-foreground">
              GigTim
            </h1>
            <p className="text-muted-foreground font-light tracking-wide">
              Marketplace de zilieri pentru România
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/65 dark:bg-card/45 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-primary/20">
          <div className="p-8 sm:p-10">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">Autentificare</h2>
              <p className="text-sm text-muted-foreground font-light italic">Intră în contul tău pentru a continua</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive font-sans">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nume@example.ro"
                  className="w-full rounded-2xl border border-border/80 bg-background/50 dark:bg-background/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground" htmlFor="password">
                    Parolă
                  </label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border/80 bg-background/50 dark:bg-background/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary-strong py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:brightness-108 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Se conectează...' : 'Conectează-te'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              Nu ai un cont?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Creează cont nou
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
