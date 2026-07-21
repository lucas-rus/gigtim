'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/supabase/auth-actions'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Parolele nu coincid.')
      return
    }
    
    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere.')
      return
    }

    setLoading(true)
    setError(null)
    
    const result = await updatePassword(password)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-5%] h-[600px] w-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-[440px] space-y-8 relative z-10">
        {/* Logo */}
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

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/65 dark:bg-card/45 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-primary/20">
          <div className="p-8 sm:p-10">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">Setează o nouă parolă</h2>
              <p className="text-sm text-muted-foreground font-light italic">
                Introdu parola nouă mai jos pentru a-ți securiza contul.
              </p>
            </div>
            
            {success ? (
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary dark:text-secondary border border-emerald-500/20">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground">Parola a fost actualizată!</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Te vom redirecționa către pagina de conectare în câteva secunde...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive font-sans">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Noua parolă</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Minim 6 caractere"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Confirmă noua parolă</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Rescrie parola"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="h-12 w-full rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all duration-300 active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? 'Se actualizează...' : 'Actualizează parola'}
                  </button>
                </div>
              </form>
            )}
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
