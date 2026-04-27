'use client'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

const demoLogs = [
  { id: '1', admin: 'Admin GigTim', action: 'USER_SUSPENDED', target: 'user:ion.dumitrescu@email.com', reason: 'Comportament inadecvat', time: 'Acum 2 ore' },
  { id: '2', admin: 'Admin GigTim', action: 'VERIFICATION_APPROVED', target: 'verification:inq_abc123', reason: 'ID confirmat manual', time: 'Acum 5 ore' },
  { id: '3', admin: 'Admin GigTim', action: 'SHIFT_CANCELLED', target: 'shift:abc-123-def', reason: 'Raport de la lucrător', time: 'Ieri, 18:30' },
  { id: '4', admin: 'Admin GigTim', action: 'FORUM_POST_DELETED', target: 'post:xyz-789', reason: 'Spam / Conținut inadecvat', time: 'Ieri, 14:15' },
  { id: '5', admin: 'Admin GigTim', action: 'ROLE_CHANGED', target: 'user:maria.ionescu@email.com', reason: 'Promovat la EMPLOYER', time: 'Acum 2 zile' },
]

const actionColors: Record<string, string> = {
  USER_SUSPENDED: 'bg-red-500/15 text-red-400 border-red-500/20',
  VERIFICATION_APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  SHIFT_CANCELLED: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  FORUM_POST_DELETED: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  ROLE_CHANGED: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

const actionLabels: Record<string, string> = {
  USER_SUSPENDED: 'Utilizator suspendat',
  VERIFICATION_APPROVED: 'Verificare aprobată',
  SHIFT_CANCELLED: 'Tură anulată',
  FORUM_POST_DELETED: 'Postare ștearsă',
  ROLE_CHANGED: 'Rol schimbat',
}

export default function AdminAuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jurnal de audit</h1>
        <p className="text-sm text-muted-foreground">
          Istoricul complet al acțiunilor administrative pe platformă
        </p>
      </div>

      <div className="space-y-3">
        {demoLogs.map((log) => (
          <Card key={log.id} className="border-border/50">
            <CardContent className="flex items-start gap-4 p-4">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="text-xs font-bold bg-red-500/10 text-red-400">A</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{log.admin}</span>
                  <Badge className={`border ${actionColors[log.action] || ''}`} variant="outline">
                    {actionLabels[log.action] || log.action}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-mono text-xs bg-accent/50 px-1.5 py-0.5 rounded">{log.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">💬 {log.reason}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{log.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
