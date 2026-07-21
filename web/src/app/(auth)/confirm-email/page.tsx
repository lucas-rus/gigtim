'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyEmailToken } from '@/lib/romarg-auth'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Token-ul de verificare este lipsă din link.')
      setLoading(false)
      return
    }

    async function executeVerification() {
      const result = await verifyEmailToken(token as string)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessEmail(result.email || null)
      }
      setLoading(false)
    }

    executeVerification()
  }, [token])

  return (
    <div className="w-full max-w-[460px] space-y-6 relative z-10 my-8">
      {/* Header Logo */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold shadow-xl shadow-primary/20">
          G
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
            GigTim
          </h1>
          <p className="text-xs text-muted-foreground font-light tracking-wide">
            Verificare adresa de email
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative rounded-3xl border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl shadow-2xl p-8 sm:p-10 text-center">
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-lg font-bold font-heading">Se verifică adresa ta de email...</h2>
            <p className="text-xs text-muted-foreground italic">
              Te rugăm să aștepți câteva secunde în timp ce procesăm token-ul de confirmare.
            </p>
          </div>
        ) : error ? (
          <div className="space-y-5 py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold font-heading text-destructive">Verificare eșuată</h2>
            <p className="text-xs text-muted-foreground italic">{error}</p>
            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                className="block w-full rounded-2xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Mergi la Autentificare
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Email confirmat cu succes!</h2>
            <p className="text-xs text-muted-foreground italic">
              Adresa ta de email ({successEmail || 'verificată'}) a fost confirmată. Contul tău GigTim este acum complet activat.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full rounded-2xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Intră în Cont
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 text-foreground font-sans">
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Se încarcă...</div>}>
        <ConfirmEmailContent />
      </Suspense>
    </div>
  )
}
