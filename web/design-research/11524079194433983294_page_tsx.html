import { getAdminVerifications } from '@/lib/supabase/data-actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { verificationStatusLabels, getLabel } from '@/lib/labels'
import type { VerificationStatus } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

const statusColors: Record<VerificationStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/20',
  EXPIRED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  NEEDS_REVIEW: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

export default async function VerificationsPage() {
  const verifications = await getAdminVerifications()

  // Stats
  const statCounts = verifications.reduce((acc: Record<string, number>, v: any) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verificări ID</h1>
        <p className="text-sm text-muted-foreground">
          Gestionează verificările de identitate — {verifications.length} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'] as const).map((key) => (
          <Card key={key} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{getLabel(verificationStatusLabels, key)}</p>
              <p className="text-2xl font-bold">{statCounts[key] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lucrător</TableHead>
              <TableHead>Oraș</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verificat la</TableHead>
              <TableHead>Creat la</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Nicio verificare înregistrată.
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.worker_profiles?.full_name || 'Necunoscut'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.worker_profiles?.city || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border ${statusColors[v.status as VerificationStatus] || ''}`} variant="outline">
                      {getLabel(verificationStatusLabels, v.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.verified_at ? new Date(v.verified_at).toLocaleDateString('ro-RO') : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
