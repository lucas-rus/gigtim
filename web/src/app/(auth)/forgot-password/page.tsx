'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const result = await resetPassword(email)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/25">
            G
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">GigTim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketplace de zilieri pentru România
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Resetare Parolă</CardTitle>
            <CardDescription>
              Introdu adresa de email și îți vom trimite un link pentru a alege o parolă nouă.
            </CardDescription>
          </CardHeader>
          
          {success ? (
            <div className="p-6 pt-0 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-3xl text-emerald-500">✉️</span>
              </div>
              <h3 className="text-lg font-semibold">Verifică-ți email-ul</h3>
              <p className="text-sm text-muted-foreground">
                Am trimis un link pentru resetarea parolei către <strong>{email}</strong>.
              </p>
              <Button render={<Link href="/login" />} className="w-full mt-4">
                Înapoi la Autentificare
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-2">
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110"
                  disabled={loading}
                >
                  {loading ? 'Se trimite...' : 'Trimite link de resetare'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Ți-ai amintit parola?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Conectează-te
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
