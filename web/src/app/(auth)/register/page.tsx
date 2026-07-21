'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { romargRegister, logout } from '@/lib/romarg-auth'
import { ROMANIAN_COUNTIES, searchLocations } from '@/lib/romanian-locations'
import { User, Building, MapPin, ChevronDown, Check, Search, X, Plus } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Form State
  const [role, setRole] = useState<'WORKER' | 'EMPLOYER'>('WORKER')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Profile State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [address, setAddress] = useState('')

  // Searchable Location Select State
  const [selectedCounty, setSelectedCounty] = useState('Timiș')
  const [countySearch, setCountySearch] = useState('')
  const [isCountyOpen, setIsCountyOpen] = useState(false)

  const [selectedCity, setSelectedCity] = useState('Timișoara')
  const [citySearch, setCitySearch] = useState('')
  const [isCityOpen, setIsCityOpen] = useState(false)

  const countyRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  // Clear any existing session on mount
  useEffect(() => {
    logout()
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countyRef.current && !countyRef.current.contains(event.target as Node)) {
        setIsCountyOpen(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered Counties list (diacritic-insensitive & prefix-first)
  const filteredCounties = useMemo(() => {
    return searchLocations(ROMANIAN_COUNTIES, (c) => `${c.name} ${c.code}`, countySearch)
  }, [countySearch])

  // Get current county object
  const currentCountyObj = useMemo(() => {
    return ROMANIAN_COUNTIES.find((c) => c.name === selectedCounty) || ROMANIAN_COUNTIES[0]
  }, [selectedCounty])

  // Filtered Cities list for chosen county (diacritic-insensitive & prefix-first)
  const filteredCities = useMemo(() => {
    return searchLocations(currentCountyObj.cities, (city) => city, citySearch)
  }, [currentCountyObj, citySearch])

  const handleNextStep = () => {
    setError(null)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('role', role)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('phone', phone)
    formData.append('county', selectedCounty)
    formData.append('city', selectedCity)

    if (role === 'WORKER') {
      formData.append('fullName', fullName)
    } else {
      formData.append('companyName', companyName)
      formData.append('cui', cui)
      formData.append('address', address)
    }

    const result = await romargRegister(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setStep(4) // Move to success step
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 text-foreground font-sans">
      {/* Ambient Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[0%] right-[-5%] h-[600px] w-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-[480px] space-y-6 relative z-10 my-8">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-extrabold shadow-xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
            G
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
              GigTim
            </h1>
            <p className="text-xs text-muted-foreground font-light tracking-wide">
              Creează-ți contul în câteva secunde
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative rounded-3xl border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8">
            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-bold font-heading text-foreground">
                {step === 1 && 'Tipul contului'}
                {step === 2 && 'Date autentificare'}
                {step === 3 && 'Profil utilizator'}
                {step === 4 && 'Cont creat cu succes!'}
              </h2>
              <p className="text-xs text-muted-foreground font-light italic">
                {step === 1 && 'Alege cum vrei să folosești platforma'}
                {step === 2 && 'Introdu adresa de email și o parolă sigură'}
                {step === 3 && 'Completează detaliile pentru a-ți finaliza profilul'}
                {step === 4 && 'Urmează ultimul pas pentru activare'}
              </p>
            </div>

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); if (step < 4) handleNextStep(); }} className="space-y-5">
              {/* Progress Bar */}
              {step < 4 && (
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        step >= i ? 'bg-primary' : 'bg-border/60'
                      }`}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive font-sans">
                  {error}
                </div>
              )}

              {/* STEP 1: ROLE */}
              {step === 1 && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tip cont</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('WORKER')}
                      className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border px-4 py-5 text-xs font-medium transition-all duration-300 ${
                        role === 'WORKER'
                          ? 'border-primary bg-primary/10 text-foreground scale-[1.02] shadow-md shadow-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-background/50 hover:bg-accent hover:text-foreground text-muted-foreground'
                      }`}
                    >
                      <User className="h-8 w-8 text-primary" />
                      <span className="font-bold font-heading">Zilier / Lucrător</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('EMPLOYER')}
                      className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border px-4 py-5 text-xs font-medium transition-all duration-300 ${
                        role === 'EMPLOYER'
                          ? 'border-primary bg-primary/10 text-foreground scale-[1.02] shadow-md shadow-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-background/50 hover:bg-accent hover:text-foreground text-muted-foreground'
                      }`}
                    >
                      <Building className="h-8 w-8 text-primary" />
                      <span className="font-bold font-heading">Angajator</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: EMAIL & PASSWORD */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nume@exemplu.ro"
                      className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Parolă</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="minim 6 caractere"
                      className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Confirmă Parola</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="repetă parola"
                      className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: PROFILE & MUTUALLY EXCLUSIVE SEARCHABLE LOCATION SELECTORS */}
              {step === 3 && (
                <div className="space-y-4">
                  {role === 'WORKER' ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Nume Complet</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Popescu Ion"
                        className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Nume Companie</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="SC Restaurant SRL"
                          className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">CUI</label>
                          <input
                            type="text"
                            required
                            value={cui}
                            onChange={(e) => setCui(e.target.value)}
                            placeholder="RO12345678"
                            className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Adresă Sediu</label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Str. Revoluției 10"
                            className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* SEARCHABLE JUDEȚ (COUNTY) SELECT */}
                  <div className="relative" ref={countyRef}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Județ</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCountyOpen((prev) => !prev)
                        setIsCityOpen(false) // MUTUALLY EXCLUSIVE
                      }}
                      className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                        isCountyOpen
                          ? 'border-primary ring-2 ring-primary/20 bg-background shadow-md'
                          : 'border-border bg-background/50 hover:bg-background/80'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 text-foreground font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        {selectedCounty}
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                          {currentCountyObj.code}
                        </span>
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCountyOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    {isCountyOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Sticky Search Header */}
                        <div className="sticky top-0 p-2 bg-card border-b border-border/60 backdrop-blur-md">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              autoFocus
                              value={countySearch}
                              onChange={(e) => setCountySearch(e.target.value)}
                              placeholder="Caută județ (ex: Timiș, Cluj, B)..."
                              className="w-full rounded-xl border border-border bg-background px-8 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            {countySearch && (
                              <button
                                type="button"
                                onClick={() => setCountySearch('')}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                          {filteredCounties.length > 0 ? (
                            filteredCounties.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCounty(c.name)
                                  setCountySearch('')
                                  setIsCountyOpen(false)
                                  if (c.cities.length > 0) setSelectedCity(c.cities[0])
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                                  selectedCounty === c.name
                                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                                    : 'hover:bg-accent hover:text-foreground text-foreground'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {c.name}
                                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                    {c.code}
                                  </span>
                                </span>
                                {selectedCounty === c.name && <Check className="h-3.5 w-3.5 text-primary" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                              Niciun județ găsit pentru "{countySearch}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEARCHABLE LOCALITATE (CITY) SELECT WITH CUSTOM ENTRY */}
                  <div className="relative" ref={cityRef}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Localitate / Oraș</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCityOpen((prev) => !prev)
                        setIsCountyOpen(false) // MUTUALLY EXCLUSIVE
                      }}
                      className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                        isCityOpen
                          ? 'border-primary ring-2 ring-primary/20 bg-background shadow-md'
                          : 'border-border bg-background/50 hover:bg-background/80'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 text-foreground font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        {selectedCity}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCityOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    {isCityOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Sticky Search Header */}
                        <div className="sticky top-0 p-2 bg-card border-b border-border/60 backdrop-blur-md">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              autoFocus
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder={`Caută localitate în ${selectedCounty}...`}
                              className="w-full rounded-xl border border-border bg-background px-8 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            {citySearch && (
                              <button
                                type="button"
                                onClick={() => setCitySearch('')}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Options List & Custom Locality Option */}
                        <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                          {filteredCities.map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setSelectedCity(city)
                                setCitySearch('')
                                setIsCityOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                                selectedCity === city
                                  ? 'bg-primary/10 text-primary font-bold shadow-sm'
                                  : 'hover:bg-accent hover:text-foreground text-foreground'
                              }`}
                            >
                              <span>{city}</span>
                              {selectedCity === city && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          ))}

                          {/* Custom Locality Entry Option */}
                          {citySearch && !filteredCities.includes(citySearch) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCity(citySearch.trim())
                                setCitySearch('')
                                setIsCityOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 text-left transition-all"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Utilizează "{citySearch.trim()}"</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS WITH EMAIL VERIFICATION INSTRUCTIONS */}
              {step === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                    ✉️
                  </div>
                  <h3 className="text-xl font-bold font-heading">Verifică-ți adresa de email</h3>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    Am trimis un link de confirmare la adresa <strong>{email}</strong>. Te rugăm să deschizi emailul și să apeși pe link pentru a-ți activa contul.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="inline-block w-full rounded-2xl border border-border bg-card/50 py-3 text-center text-sm font-bold text-foreground hover:bg-accent transition-all"
                    >
                      Mergi la Autentificare
                    </Link>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              {step < 4 && (
                <div className="flex items-center gap-3 pt-2">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 rounded-2xl border border-border bg-card/50 py-3 text-sm font-bold text-foreground hover:bg-accent transition-all"
                    >
                      Înapoi
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Se procesează...' : step === 3 ? 'Creează cont' : 'Continuă'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
