'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { skillLabels, applicationStatusLabels, getLabel } from '@/lib/labels'
import { updateApplicationStatus } from '@/lib/supabase/data-actions'
import type { ApplicationStatus, WorkerSkill, UserRole } from '@/lib/types/database'

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/20',
  NO_SHOW: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function generateITMCSV(worker: any) {
  const header = 'Nume complet,CNP,Serie CI'
  const row = `"${worker.full_name}","${worker.cnp}","${worker.id_card_series}"`
  const csv = `${header}\n${row}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ITM_${worker.full_name?.replace(/\s/g, '_') || 'export'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  userRole: UserRole
  initialApplications: any[]
}

export function ApplicationsClient({ userRole, initialApplications }: Props) {
  const [apps, setApps] = useState(initialApplications)
  const [isPending, startTransition] = useTransition()

  function handleStatusUpdate(appId: string, status: 'ACCEPTED' | 'REJECTED') {
    startTransition(async () => {
      const result = await updateApplicationStatus(appId, status)
      if (!result.error) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      }
    })
  }

  const pending = apps.filter((a) => a.status === 'PENDING')
  const processed = apps.filter((a) => a.status !== 'PENDING')

  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aplicări</h1>
          <p className="text-sm text-muted-foreground">
            {userRole === 'WORKER' ? 'Aplicările tale la ture' : 'Aplicările primite la turele tale'}
          </p>
        </div>
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Nicio aplicare încă</p>
          <p className="text-sm mt-1">
            {userRole === 'WORKER'
              ? 'Mergi la Locuri de muncă pentru a aplica la ture.'
              : 'Când lucrătorii aplică la turele tale, le vei vedea aici.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aplicări</h1>
        <p className="text-sm text-muted-foreground">
          {userRole === 'WORKER'
            ? `Aplicările tale — ${apps.length} total`
            : `Aplicările primite — ${pending.length} în așteptare`}
        </p>
      </div>

      {/* WORKER VIEW */}
      {userRole === 'WORKER' && (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app) => {
            const shift = app.job_shifts
            const employer = shift?.employer_profiles
            return (
              <Card key={app.id} className="border-border/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{getLabel(skillLabels, shift?.role_needed)}</p>
                    <p className="text-xs text-muted-foreground">
                      {employer?.company_name || 'Angajator'} · {employer?.city || ''}
                    </p>
                    {shift && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(shift.start_time)} → {formatDate(shift.end_time)} · {shift.hourly_pay_ron} RON/h
                      </p>
                    )}
                  </div>
                  <Badge className={`border ${statusColors[app.status as ApplicationStatus] || ''}`} variant="outline">
                    {getLabel(applicationStatusLabels, app.status)}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* EMPLOYER VIEW */}
      {userRole === 'EMPLOYER' && (
        <>
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-amber-400">⏳ În așteptare</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((app) => {
                  const worker = app.worker_profiles
                  const shift = app.job_shifts
                  if (!worker) return null
                  return (
                    <Card key={app.id} className="border-amber-500/20 bg-amber-500/[0.03]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11 border-2 border-amber-500/30">
                              <AvatarFallback className="bg-amber-500/10 text-amber-400 font-bold">
                                {worker.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{worker.full_name}</CardTitle>
                              <CardDescription className="text-xs">
                                {worker.city || 'Necunoscut'} · {worker.total_shifts_completed || 0} ture completate
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-400">★ {Number(worker.reliability_score || 5).toFixed(1)}</div>
                            <div className="text-[10px] text-muted-foreground">fiabilitate</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {worker.skills && worker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {worker.skills.map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs">{getLabel(skillLabels, s)}</Badge>
                            ))}
                          </div>
                        )}
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Tură:</span>{' '}
                          {shift ? `${getLabel(skillLabels, shift.role_needed)} · ${shift.hourly_pay_ron} RON/oră` : 'Necunoscută'}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
                            disabled={isPending}
                            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                          >
                            ✓ Acceptă
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            disabled={isPending}
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          >
                            ✕ Respinge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {processed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Procesate</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {processed.map((app) => {
                  const worker = app.worker_profiles
                  if (!worker) return null
                  return (
                    <Card key={app.id} className="border-border/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs font-bold">
                              {worker.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{worker.full_name}</p>
                            <p className="text-xs text-muted-foreground">{worker.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`border ${statusColors[app.status as ApplicationStatus] || ''}`} variant="outline">
                            {getLabel(applicationStatusLabels, app.status)}
                          </Badge>
                          {app.status === 'ACCEPTED' && (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => generateITMCSV(worker)}>
                              📥 ITM Data
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
