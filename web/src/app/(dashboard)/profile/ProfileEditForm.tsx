'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { updateWorkerProfile, updateEmployerProfile } from '@/lib/romarg-data'

interface ProfileEditFormProps {
  profileType: 'worker' | 'employer' | 'admin'
  profile: any
}

export function ProfileEditForm({ profileType, profile }: ProfileEditFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  // Worker fields
  const [fullName, setFullName] = useState((profile as any)?.full_name || '')
  const [phone, setPhone] = useState((profile as any)?.phone_number || '')
  const [city, setCity] = useState((profile as any)?.city || '')
  const [county, setCounty] = useState((profile as any)?.county || '')
  const [bio, setBio] = useState((profile as any)?.bio || '')
  const [cnp, setCnp] = useState((profile as any)?.cnp || '')
  const [idCardSeries, setIdCardSeries] = useState((profile as any)?.id_card_series || '')

  // Employer fields
  const [companyName, setCompanyName] = useState((profile as any)?.company_name || '')
  const [address, setAddress] = useState((profile as any)?.address || '')
  const [cui, setCui] = useState((profile as any)?.cui || '')

  function handleSave() {
    const formData = new FormData()

    if (profileType === 'worker') {
      formData.set('full_name', fullName)
      formData.set('phone_number', phone)
      formData.set('city', city)
      formData.set('county', county)
      formData.set('bio', bio)
      formData.set('cnp', cnp)
      formData.set('id_card_series', idCardSeries)
    } else {
      formData.set('company_name', companyName)
      formData.set('address', address)
      formData.set('city', city)
      formData.set('county', county)
      formData.set('cui', cui)
    }

    startTransition(async () => {
      const result = profileType === 'worker'
        ? await updateWorkerProfile(formData)
        : await updateEmployerProfile(formData)

      if (result.error) {
        setMessage(result.error)
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success('Profil actualizat!')
        router.refresh()
      }
    })
  }

  if (profileType === 'admin') return null

  return (
    <>
      {message && (
        <div className="text-sm px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive font-sans mb-3">{message}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button variant="outline" className="h-10 px-5 rounded-xl border border-border/80 bg-transparent hover:bg-accent text-foreground transition-all duration-200 text-xs font-semibold uppercase tracking-wider">Editează Profilul</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md dark:bg-card border border-border/60 rounded-2xl shadow-xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-semibold font-heading text-foreground">Editează Profilul</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            {profileType === 'worker' && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-name" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Nume complet</Label>
                  <Input id="edit-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-phone" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Telefon</Label>
                  <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-county" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Județ</Label>
                    <Input id="edit-county" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Timiș" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-city" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Oraș</Label>
                    <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Timișoara" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-cnp" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">CNP</Label>
                    <Input id="edit-cnp" value={cnp} onChange={(e) => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} minLength={13} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-id-series" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Serie și Număr CI</Label>
                    <Input id="edit-id-series" value={idCardSeries} onChange={(e) => setIdCardSeries(e.target.value)} placeholder="Ex: TM 123456" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-bio" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Bio</Label>
                  <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Scrie ceva despre tine..." className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl p-3 text-sm resize-none font-sans" />
                </div>
              </>
            )}
            {profileType === 'employer' && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-company" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Nume companie</Label>
                  <Input id="edit-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-cui" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">CUI</Label>
                  <Input id="edit-cui" value={cui} onChange={(e) => setCui(e.target.value)} placeholder="Ex: RO12345678" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-address" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Adresă</Label>
                  <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-county-emp" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Județ</Label>
                    <Input id="edit-county-emp" value={county} onChange={(e) => setCounty(e.target.value)} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-city-emp" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Oraș</Label>
                    <Input id="edit-city-emp" value={city} onChange={(e) => setCity(e.target.value)} className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 text-sm font-sans" />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/60 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-10 px-4 rounded-xl border border-border/80 bg-transparent hover:bg-muted text-foreground transition-colors text-xs font-semibold font-sans">Anulare</Button>
            <Button onClick={handleSave} disabled={isPending} className="h-10 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-primary hover:bg-primary/90 hover:brightness-110 text-primary-foreground transition-all duration-200">
              {isPending ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
