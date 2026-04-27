'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
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

const ROMANIAN_COUNTIES = [
  'Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila',
  'Brașov','București','Buzău','Călărași','Caraș-Severin','Cluj','Constanța',
  'Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara',
  'Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt',
  'Prahova','Satu Mare','Sălaj','Sibiu','Suceava','Teleorman','Timiș','Tulcea',
  'Vaslui','Vâlcea','Vrancea',
]

export default function SettingsPage() {
  const [verificationStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setări</h1>
        <p className="text-sm text-muted-foreground">Gestionează profilul și preferințele contului</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile form — spans 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Informații personale</CardTitle>
              <CardDescription>Completează profilul tău pentru a putea aplica la ture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nume complet</Label>
                  <Input id="full_name" placeholder="Ion Popescu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+40 7XX XXX XXX" type="tel" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="county">Județ</Label>
                  <Select>
                    <SelectTrigger id="county">
                      <SelectValue placeholder="Selectează județul" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROMANIAN_COUNTIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Oraș</Label>
                  <Input id="city" placeholder="ex: Timișoara" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Scrie câteva cuvinte despre tine și experiența ta..." rows={3} />
              </div>
              <Button>Salvează modificările</Button>
            </CardContent>
          </Card>

          {/* ITM Data */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Date ITM (Legea 52/2011)</CardTitle>
              <CardDescription>
                Aceste date sunt necesare legal. Angajatorul le va folosi pentru Registrul Zilierilor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cnp">CNP</Label>
                  <Input id="cnp" placeholder="1XXXXXXXXX123" maxLength={13} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_card_series">Serie CI</Label>
                  <Input id="id_card_series" placeholder="TM 123456" />
                </div>
              </div>
              <Button>Actualizează datele ITM</Button>
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Schimbă parola</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_password">Parolă nouă</Label>
                  <Input id="new_password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmă parola</Label>
                  <Input id="confirm_password" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button variant="outline">Schimbă parola</Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — ID Verification */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Verificare identitate</CardTitle>
              <CardDescription>Verificarea prin Persona crește încrederea angajatorilor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStatus === 'none' && (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <span className="text-2xl">🛡️</span>
                    <div className="text-sm">
                      <p className="font-medium text-amber-400">Neverificat</p>
                      <p className="text-xs text-muted-foreground">
                        Verifică-ți identitatea pentru mai multe ture
                      </p>
                    </div>
                  </div>
                  <Button className="w-full">
                    Începe verificarea
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Procesul durează ~2 minute. Vei avea nevoie de cartea de identitate.
                  </p>
                </>
              )}
              {verificationStatus === 'pending' && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                  <span className="text-2xl animate-pulse">⏳</span>
                  <div className="text-sm">
                    <p className="font-medium text-blue-400">Se verifică...</p>
                    <p className="text-xs text-muted-foreground">De obicei durează sub 5 minute</p>
                  </div>
                </div>
              )}
              {verificationStatus === 'verified' && (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-2xl">✅</span>
                  <div className="text-sm">
                    <p className="font-medium text-emerald-400">Verificat</p>
                    <p className="text-xs text-muted-foreground">Identitatea ta a fost confirmată</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Competențe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND'].map((skill) => (
                  <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-primary/10">
                    {skill === 'BARISTA' && '☕ Barista'}
                    {skill === 'WAITER' && '🍽️ Ospătar'}
                    {skill === 'DISHWASHER' && '🍳 Spălător'}
                    {skill === 'STAGEHAND' && '🎭 Stagehand'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
