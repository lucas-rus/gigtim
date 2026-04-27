'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ApplicationStatus, WorkerSkill } from '@/lib/types/database'

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/20',
  NO_SHOW: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: 'În așteptare',
  ACCEPTED: 'Acceptat',
  REJECTED: 'Respins',
  NO_SHOW: 'Nu s-a prezentat',
}

// Demo data
const demoApplications = [
  {
    id: '1',
    shift_role: 'WAITER' as WorkerSkill,
    shift_date: '28 Apr 2026, 08:00–16:00',
    shift_pay: 35,
    worker: {
      name: 'Andrei Popescu',
      reliability: 4.8,
      shifts_completed: 23,
      skills: ['WAITER', 'BARISTA'] as WorkerSkill[],
      phone: '+40 742 123 456',
      city: 'Cluj-Napoca',
      cnp: '1990415123456',
      id_card_series: 'CJ 123456',
      verified: true,
    },
    status: 'PENDING' as ApplicationStatus,
  },
  {
    id: '2',
    shift_role: 'WAITER' as WorkerSkill,
    shift_date: '28 Apr 2026, 08:00–16:00',
    shift_pay: 35,
    worker: {
      name: 'Maria Ionescu',
      reliability: 4.2,
      shifts_completed: 8,
      skills: ['WAITER'] as WorkerSkill[],
      phone: '+40 755 987 654',
      city: 'Timișoara',
      cnp: '2950722345678',
      id_card_series: 'TM 654321',
      verified: true,
    },
    status: 'PENDING' as ApplicationStatus,
  },
  {
    id: '3',
    shift_role: 'BARISTA' as WorkerSkill,
    shift_date: '29 Apr 2026, 06:00–14:00',
    shift_pay: 40,
    worker: {
      name: 'Ion Dumitrescu',
      reliability: 5.0,
      shifts_completed: 45,
      skills: ['BARISTA', 'WAITER', 'DISHWASHER'] as WorkerSkill[],
      phone: '+40 733 111 222',
      city: 'București',
      cnp: '1880303456789',
      id_card_series: 'B 789012',
      verified: false,
    },
    status: 'ACCEPTED' as ApplicationStatus,
  },
]

const skillLabels: Record<WorkerSkill, string> = {
  BARISTA: '☕ Barista',
  WAITER: '🍽️ Ospătar',
  DISHWASHER: '🍳 Spălător',
  STAGEHAND: '🎭 Stagehand',
}

function generateITMCSV(worker: typeof demoApplications[0]['worker']) {
  const header = 'Nume complet,CNP,Serie CI'
  const row = `"${worker.name}","${worker.cnp}","${worker.id_card_series}"`
  const csv = `${header}\n${row}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ITM_${worker.name.replace(/\s/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState(demoApplications)

  function updateStatus(id: string, status: ApplicationStatus) {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  const pending = apps.filter((a) => a.status === 'PENDING')
  const processed = apps.filter((a) => a.status !== 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aplicări</h1>
        <p className="text-sm text-muted-foreground">
          Vizualizează aplicările primite și gestionează lucrătorii — {pending.length} în așteptare
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-amber-400">⏳ În așteptare</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((app) => (
              <Card key={app.id} className="border-amber-500/20 bg-amber-500/[0.03]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border-2 border-amber-500/30">
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 font-bold">
                          {app.worker.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {app.worker.name}
                          {app.worker.verified && (
                            <span className="text-emerald-400 text-xs" title="ID verificat">✓</span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {app.worker.city} · {app.worker.shifts_completed} ture completate
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-400">
                        ★ {app.worker.reliability.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        fiabilitate
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {app.worker.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {skillLabels[s]}
                      </Badge>
                    ))}
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Tură:</span>{' '}
                    {app.shift_date} · {app.shift_pay} RON/oră
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
                      onClick={() => updateStatus(app.id, 'ACCEPTED')}
                    >
                      ✓ Acceptă
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => updateStatus(app.id, 'REJECTED')}
                    >
                      ✕ Respinge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Procesate</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {processed.map((app) => (
              <Card key={app.id} className="border-border/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-bold">
                        {app.worker.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{app.worker.name}</p>
                      <p className="text-xs text-muted-foreground">{app.shift_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border ${statusColors[app.status]}`} variant="outline">
                      {statusLabels[app.status]}
                    </Badge>
                    {app.status === 'ACCEPTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => generateITMCSV(app.worker)}
                      >
                        📥 ITM Data
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
