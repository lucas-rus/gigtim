'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/supabase/auth-actions'
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
            <CardTitle className="text-xl">Setează o nouă parolă</CardTitle>
            <CardDescription>
              Introdu parola nouă mai jos pentru a-ți securiza contul.
            </CardDescription>
          </CardHeader>
          
          {success ? (
            <div className="p-6 pt-0 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-3xl text-emerald-500">✅</span>
              </div>
              <h3 className="text-lg font-semibold">Parola a fost actualizată!</h3>
              <p className="text-sm text-muted-foreground">
                Te vom redirecționa către pagina de conectare în câteva secunde...
              </p>
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
                  <Label htmlFor="password">Noua parolă</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minim 6 caractere"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmă noua parolă</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Rescrie parola"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110"
                  disabled={loading}
                >
                  {loading ? 'Se actualizează...' : 'Actualizează parola'}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
