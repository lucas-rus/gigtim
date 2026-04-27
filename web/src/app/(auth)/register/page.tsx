'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register, resendConfirmation } from '@/lib/supabase/auth-actions'
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

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Resend Cooldown State
  const [cooldown, setCooldown] = useState(0)

  // Form State
  const [role, setRole] = useState<'WORKER' | 'EMPLOYER'>('WORKER')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Profile State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [county, setCounty] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [address, setAddress] = useState('')
  const [cnp, setCnp] = useState('')
  const [idSeries, setIdSeries] = useState('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleNextStep = () => {
    setError(null)
    setSuccessMsg(null)
    if (step === 2) {
      if (password !== confirmPassword) {
        setError('Parolele nu coincid.')
        return
      }
      if (password.length < 6) {
        setError('Parola trebuie să aibă minim 6 caractere.')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const handlePrevStep = () => {
    setError(null)
    setStep((s) => s - 1)
  }

  async function handleResend() {
    if (cooldown > 0) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    
    const result = await resendConfirmation(email)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccessMsg('Email-ul a fost retrimis cu succes!')
      setCooldown(60) // 60 seconds cooldown
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('role', role)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('phone', phone)
    formData.append('city', city)
    formData.append('county', county)

    if (role === 'WORKER') {
      formData.append('fullName', fullName)
      formData.append('cnp', cnp)
      formData.append('idSeries', idSeries)
    } else {
      formData.append('companyName', companyName)
      formData.append('cui', cui)
      formData.append('address', address)
    }

    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setStep(4) // Move to success step
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
            <CardTitle className="text-xl">
              {step === 1 && 'Tipul contului'}
              {step === 2 && 'Date autentificare'}
              {step === 3 && 'Profil utilizator'}
              {step === 4 && 'Verifică email-ul'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Alege cum vrei să folosești platforma'}
              {step === 2 && 'Introdu adresa de email și o parolă sigură'}
              {step === 3 && 'Completează detaliile pentru a-ți finaliza profilul'}
              {step === 4 && 'Contul a fost creat cu succes!'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); if (step < 4) handleNextStep(); }}>
            <CardContent className="space-y-4 pb-2">
              {/* Progress Bar */}
              {step < 4 && (
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        step >= i ? 'bg-primary' : 'bg-primary/20'
                      }`}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                  {successMsg}
                </div>
              )}

              {/* STEP 1: ROLE */}
              {step === 1 && (
                <div className="space-y-4">
                  <Label>Tip cont</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('WORKER')}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        role === 'WORKER'
                          ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/40 hover:bg-accent/50 text-muted-foreground'
                      }`}
                    >
                      👷 Angajat
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('EMPLOYER')}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        role === 'EMPLOYER'
                          ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/40 hover:bg-accent/50 text-muted-foreground'
                      }`}
                    >
                      🏢 Angajator
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CREDENTIALS */}
              {step === 2 && (
                <>
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
                  <div className="space-y-2">
                    <Label htmlFor="password">Parolă</Label>
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
                    <Label htmlFor="confirmPassword">Confirmă Parola</Label>
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
                </>
              )}

              {/* STEP 3: PROFILE */}
              {step === 3 && (
                <>
                  {role === 'WORKER' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nume complet (conform CI)</Label>
                        <Input
                          id="fullName"
                          placeholder="Ex: Ion Popescu"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cnp">CNP</Label>
                          <Input
                            id="cnp"
                            placeholder="13 cifre"
                            required
                            minLength={13}
                            maxLength={13}
                            value={cnp}
                            onChange={(e) => setCnp(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idSeries">Serie și Număr CI</Label>
                          <Input
                            id="idSeries"
                            placeholder="Ex: TM 123456"
                            required
                            value={idSeries}
                            onChange={(e) => setIdSeries(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nume Companie / SRL</Label>
                        <Input
                          id="companyName"
                          placeholder="Ex: GigTim SRL"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cui">CUI</Label>
                        <Input
                          id="cui"
                          placeholder="Ex: RO12345678"
                          required
                          value={cui}
                          onChange={(e) => setCui(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresă Sediu</Label>
                        <Input
                          id="address"
                          placeholder="Strada, Număr, Detalii..."
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Număr de telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="07XX XXX XXX"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="county">Județ</Label>
                      <Input
                        id="county"
                        placeholder="Ex: Timiș"
                        required
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Localitate</Label>
                      <Input
                        id="city"
                        placeholder="Ex: Timișoara"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <span className="text-3xl text-emerald-500">✉️</span>
                  </div>
                  <h3 className="text-lg font-semibold">Te-ai înregistrat cu succes!</h3>
                  <p className="text-sm text-muted-foreground">
                    Ți-am trimis un link de confirmare la adresa <strong>{email}</strong>. 
                    Te rugăm să îți verifici căsuța de email și să dai click pe link pentru a-ți activa contul.
                  </p>
                  
                  <div className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleResend}
                      disabled={cooldown > 0 || loading}
                    >
                      {cooldown > 0 ? `Așteaptă ${cooldown}s pentru a retrimite` : 'Retrimite email-ul de confirmare'}
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              {step < 4 && (
                <div className="flex w-full gap-3">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-1/3"
                    >
                      Înapoi
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110 ${step > 1 ? 'w-2/3' : 'w-full'}`}
                    disabled={loading}
                  >
                    {step === 3 
                      ? (loading ? 'Se creează...' : 'Finalizează contul') 
                      : 'Continuă →'}
                  </Button>
                </div>
              )}
              
              {step === 4 && (
                <Button render={<Link href="/login" />} className="w-full">
                  Mergi la Conectare
                </Button>
              )}
              
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
