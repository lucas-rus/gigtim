'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { register, resendConfirmation } from '@/lib/supabase/auth-actions'
import { User, Building } from 'lucide-react'

export default function RegisterPage() {
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-5%] h-[600px] w-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-[460px] space-y-8 relative z-10">
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
              Creează-ți contul în câteva secunde
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/65 dark:bg-card/45 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-primary/20">
          <div className="p-8 sm:p-10">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {step === 1 && 'Tipul contului'}
                {step === 2 && 'Date autentificare'}
                {step === 3 && 'Profil utilizator'}
                {step === 4 && 'Verifică email-ul'}
              </h2>
              <p className="text-sm text-muted-foreground font-light italic">
                {step === 1 && 'Alege cum vrei să folosești platforma'}
                {step === 2 && 'Introdu adresa de email și o parolă sigură'}
                {step === 3 && 'Completează detaliile pentru a-ți finaliza profilul'}
                {step === 4 && 'Contul a fost creat cu succes!'}
              </p>
            </div>

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); if (step < 4) handleNextStep(); }} className="space-y-6">
              {/* Progress Bar */}
              {step < 4 && (
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded transition-colors duration-300 ${
                        step >= i ? 'bg-primary' : 'bg-border/60'
                      }`}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive font-sans">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-sans">
                  {successMsg}
                </div>
              )}

              {/* STEP 1: ROLE */}
              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Tip cont</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('WORKER')}
                      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-6 text-sm font-medium transition-all duration-300 ${
                        role === 'WORKER'
                          ? 'border-primary/50 bg-primary/10 text-foreground scale-[1.02] shadow-lg shadow-primary/5'
                          : 'border-border bg-card/50 hover:bg-accent hover:text-foreground text-muted-foreground'
                      }`}
                    >
                      <User className="h-10 w-10 text-primary" />
                      <span className="font-bold font-heading">Zilier / Lucrător</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('EMPLOYER')}
                      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-6 text-sm font-medium transition-all duration-300 ${
                        role === 'EMPLOYER'
                          ? 'border-primary/50 bg-primary/10 text-foreground scale-[1.02] shadow-lg shadow-primary/5'
                          : 'border-border bg-card/50 hover:bg-accent hover:text-foreground text-muted-foreground'
                      }`}
                    >
                      <Building className="h-10 w-10 text-primary" />
                      <span className="font-bold font-heading">Angajator</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CREDENTIALS */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="exemplu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Parolă</label>
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
                    <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Confirmă Parola</label>
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
                </>
              )}

              {/* STEP 3: PROFILE */}
              {step === 3 && (
                <>
                  {role === 'WORKER' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Nume complet (conform CI)</label>
                        <input
                          id="fullName"
                          placeholder="Ex: Ion Popescu"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label htmlFor="cnp" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">CNP</label>
                          <input
                            id="cnp"
                            placeholder="13 cifre"
                            required
                            minLength={13}
                            maxLength={13}
                            value={cnp}
                            onChange={(e) => setCnp(e.target.value)}
                            className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="idSeries" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Serie și CI</label>
                          <input
                            id="idSeries"
                            placeholder="Ex: TM 123456"
                            required
                            value={idSeries}
                            onChange={(e) => setIdSeries(e.target.value)}
                            className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Nume Companie / SRL</label>
                        <input
                          id="companyName"
                          placeholder="Ex: GigTim SRL"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cui" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">CUI</label>
                        <input
                          id="cui"
                          placeholder="Ex: RO12345678"
                          required
                          value={cui}
                          onChange={(e) => setCui(e.target.value)}
                          className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="address" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Adresă Sediu</label>
                        <input
                          id="address"
                          placeholder="Strada, Număr, Detalii..."
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Număr de telefon</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="07XX XXX XXX"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="county" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Județ</label>
                      <input
                        id="county"
                        placeholder="Ex: Timiș"
                        required
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="city" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Localitate</label>
                      <input
                        id="city"
                        placeholder="Ex: Timișoara"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-12 w-full px-4 rounded-xl bg-background dark:bg-background/40 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="text-center space-y-6 py-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="material-symbols-outlined text-3xl">mail</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-foreground">Te-ai înregistrat cu succes!</h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    Ți-am trimis un link de confirmare la adresa <strong className="text-primary font-semibold">{email}</strong>. 
                    Te rugăm să îți verifici căsuța de email și să dai click pe link pentru a-ți activa contul.
                  </p>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      className="h-12 w-full rounded-xl border border-border bg-card hover:bg-accent text-foreground text-sm font-medium transition-all"
                      onClick={handleResend}
                      disabled={cooldown > 0 || loading}
                    >
                      {cooldown > 0 ? `Așteaptă ${cooldown}s pentru a retrimite` : 'Retrimite email-ul'}
                    </button>
                  </div>
                </div>
              )}

              {step < 4 && (
                <div className="flex w-full gap-3 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-1/3 h-12 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors"
                    >
                      Înapoi
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98] ${step > 1 ? 'w-2/3' : 'w-full'}`}
                    disabled={loading}
                  >
                    {step === 3 
                      ? (loading ? 'Se creează...' : 'Finalizează contul') 
                      : 'Continuă'}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="pt-4">
                  <Link href="/login" className="flex h-12 items-center justify-center w-full rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all">
                    Mergi la Conectare
                  </Link>
                </div>
              )}
            </form>

            {/* Card Footer */}
            <div className="mt-8 pt-8 border-t border-border/60 text-center">
              <p className="text-sm text-muted-foreground font-light">
                Ai deja cont?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-all"
                >
                  Conectează-te
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

