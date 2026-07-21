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
  PENDING: 'bg-accent/15 text-accent-foreground border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  APPROVED: 'bg-secondary/10 text-secondary border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  REJECTED: 'bg-destructive/10 text-destructive border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  EXPIRED: 'bg-muted text-muted-foreground border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
  NEEDS_REVIEW: 'bg-accent/15 text-accent-foreground border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded',
}

const statColors: Record<string, string> = {
  PENDING: 'text-amber-700 font-heading',
  APPROVED: 'text-emerald-700 font-heading',
  REJECTED: 'text-red-700 font-heading',
  NEEDS_REVIEW: 'text-purple-700 font-heading',
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
        <h1 className="text-2xl font-bold tracking-tight font-heading text-primary">Verificări ID</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Gestionează verificările de identitate — {verifications.length} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'] as const).map((key) => (
          <Card key={key} className="border border-border bg-card shadow-sm rounded">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">{getLabel(verificationStatusLabels, key)}</p>
              <p className={`text-2xl font-bold mt-1 ${statColors[key] || 'text-primary'}`}>{statCounts[key] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border border-border bg-card shadow-sm rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f8fafc] border-b border-border">
            <TableRow>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Lucrător</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Oraș</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Status</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Verificat la</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Creat la</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-sans">
                  Nicio verificare înregistrată.
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((v: any) => (
                <TableRow key={v.id} className="group hover:bg-[#f8f9ff] transition-colors border-b border-border/50 last:border-b-0">
                  <TableCell className="font-semibold text-foreground font-sans">
                    {v.worker_profiles?.full_name || 'Necunoscut'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-sans">
                    {v.worker_profiles?.city || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[v.status as VerificationStatus] || ''} variant="outline">
                      {getLabel(verificationStatusLabels, v.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {v.verified_at ? new Date(v.verified_at).toLocaleDateString('ro-RO') : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
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
