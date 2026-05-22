'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { updateWorkerProfile, updateEmployerProfile } from '@/lib/supabase/data-actions'

interface ProfileEditFormProps {
  profileType: 'worker' | 'employer' | 'admin'
  profile: any
}

export function ProfileEditForm({ profileType, profile }: ProfileEditFormProps) {
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
    setMessage(null)
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
      } else {
        setOpen(false)
        window.location.reload()
      }
    })
  }

  if (profileType === 'admin') return null

  return (
    <>
      {message && (
        <div className="text-sm px-4 py-2 rounded-lg bg-red-500/10 text-red-400 mb-3">{message}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
          <Button variant="outline">Editează Profilul</Button>
        } />
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editează Profilul</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {profileType === 'worker' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nume complet</Label>
                  <Input id="edit-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Telefon</Label>
                  <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-county">Județ</Label>
                    <Input id="edit-county" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Timiș" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-city">Oraș</Label>
                    <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Timișoara" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-cnp">CNP</Label>
                    <Input id="edit-cnp" value={cnp} onChange={(e) => setCnp(e.target.value)} placeholder="13 cifre" maxLength={13} minLength={13} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-id-series">Serie și Număr CI</Label>
                    <Input id="edit-id-series" value={idCardSeries} onChange={(e) => setIdCardSeries(e.target.value)} placeholder="Ex: TM 123456" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Scrie ceva despre tine..." />
                </div>
              </>
            )}
            {profileType === 'employer' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-company">Nume companie</Label>
                  <Input id="edit-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-cui">CUI</Label>
                  <Input id="edit-cui" value={cui} onChange={(e) => setCui(e.target.value)} placeholder="Ex: RO12345678" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Adresă</Label>
                  <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-county-emp">Județ</Label>
                    <Input id="edit-county-emp" value={county} onChange={(e) => setCounty(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-city-emp">Oraș</Label>
                    <Input id="edit-city-emp" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulare</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
