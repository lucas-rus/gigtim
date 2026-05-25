'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/supabase/auth-actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
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

            <form action={handleSubmit} className="space-y-6">
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
                  placeholder="exemplu@email.com"
                  required
                  autoComplete="email"
                  className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground" htmlFor="password">
                    Parolă
                  </label>
                  <Link className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors" href="/forgot-password">
                    Ai uitat parola?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="relative z-10">{loading ? 'Se conectează...' : 'Conectare'}</span>
                </button>
              </div>
            </form>

            {/* Card Footer */}
            <div className="mt-8 pt-8 border-t border-border/60 text-center">
              <p className="text-sm text-muted-foreground font-light">
                Nu ai cont?{' '}
                <Link className="ml-1 font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-all" href="/register">
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Legal/Help links */}
        <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
          <a className="hover:text-foreground transition-colors" href="#">Termeni</a>
          <a className="hover:text-foreground transition-colors" href="#">Confidențialitate</a>
          <a className="hover:text-foreground transition-colors" href="#">Suport</a>
        </div>
      </div>
    </div>
  )
}
