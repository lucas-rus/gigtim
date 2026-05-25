import { getAdminAuditLog } from '@/lib/supabase/data-actions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const logs = await getAdminAuditLog()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading text-primary">Jurnal Audit</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Toate acțiunile administrative — {logs.length} înregistrări
        </p>
      </div>

      <Card className="border border-border bg-card shadow-sm rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f8fafc] border-b border-border">
            <TableRow>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Acțiune</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Tabel</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Detalii (ID)</TableHead>
              <TableHead className="font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-sans">
                  Nicio acțiune înregistrată încă.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id} className="group hover:bg-[#f8f9ff] transition-colors border-b border-border/50 last:border-b-0">
                  <TableCell className="font-semibold text-on-background font-sans">{log.action}</TableCell>
                  <TableCell>
                    <Badge className="bg-slate-50 text-slate-700 border-none font-mono text-2xs uppercase tracking-wider px-2 py-0.5 rounded" variant="secondary">
                      {log.target_table || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-2xs text-muted-foreground font-mono max-w-xs truncate">
                    {log.target_id || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(log.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
