'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/lib/supabase/auth-actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<string>('WORKER')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('role', role)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
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
            Creează-ți contul în câteva secunde
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Înregistrare</CardTitle>
            <CardDescription>
              Alege tipul contului și completează datele
            </CardDescription>
          </CardHeader>
          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Tip cont</Label>
                <Select value={role} onValueChange={(val) => setRole(val ?? 'WORKER')}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selectează tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKER">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">👷 Lucrător (Zilier)</span>
                        <span className="text-xs text-muted-foreground">Caut ture de muncă</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EMPLOYER">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">🏢 Angajator</span>
                        <span className="text-xs text-muted-foreground">Caut zilieri pentru afacere</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minim 6 caractere"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Se creează contul...' : 'Creează cont'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Ai deja cont?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Conectează-te
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
