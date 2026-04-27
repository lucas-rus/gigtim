'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { VerificationStatus } from '@/lib/types/database'

const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'În așteptare', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: '⏳' },
  APPROVED: { label: 'Aprobat', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: '✅' },
  REJECTED: { label: 'Respins', color: 'bg-red-500/15 text-red-400 border-red-500/20', icon: '❌' },
  EXPIRED: { label: 'Expirat', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20', icon: '⏰' },
  NEEDS_REVIEW: { label: 'Necesită revizuire', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', icon: '👁️' },
}

const demoVerifications = [
  { id: '1', worker: 'Andrei Popescu', city: 'Cluj-Napoca', status: 'APPROVED' as VerificationStatus, persona_id: 'inq_abc123', date: '27 Apr 2026' },
  { id: '2', worker: 'Maria Ionescu', city: 'Timișoara', status: 'APPROVED' as VerificationStatus, persona_id: 'inq_def456', date: '26 Apr 2026' },
  { id: '3', worker: 'Ion Dumitrescu', city: 'București', status: 'PENDING' as VerificationStatus, persona_id: 'inq_ghi789', date: '27 Apr 2026' },
  { id: '4', worker: 'Elena Vasilescu', city: 'Iași', status: 'NEEDS_REVIEW' as VerificationStatus, persona_id: 'inq_jkl012', date: '26 Apr 2026' },
  { id: '5', worker: 'Cosmin Radu', city: 'Brașov', status: 'REJECTED' as VerificationStatus, persona_id: 'inq_mno345', date: '25 Apr 2026' },
]

export default function AdminVerificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verificări ID</h1>
        <p className="text-sm text-muted-foreground">
          Monitorizare verificări identitate Persona — statusul în timp real
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {Object.entries(statusConfig).map(([key, val]) => {
          const count = demoVerifications.filter((v) => v.status === key).length
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl">{val.icon}</p>
                <p className="text-xl font-bold mt-1">{count}</p>
                <p className="text-xs text-muted-foreground">{val.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {demoVerifications.map((v) => {
          const config = statusConfig[v.status]
          return (
            <Card key={v.id} className="border-border/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs font-bold">
                      {v.worker.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{v.worker}</p>
                    <p className="text-xs text-muted-foreground">{v.city} · {v.date}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{v.persona_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`border ${config.color}`} variant="outline">
                    {config.icon} {config.label}
                  </Badge>
                  {(v.status === 'NEEDS_REVIEW' || v.status === 'PENDING') && (
                    <Button size="sm" variant="outline">Revizuiește</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
