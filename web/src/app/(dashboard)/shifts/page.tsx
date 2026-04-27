'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ShiftStatus, WorkerSkill } from '@/lib/types/database'

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  FILLED: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const statusLabels: Record<ShiftStatus, string> = {
  OPEN: 'Deschisă',
  FILLED: 'Ocupată',
  IN_PROGRESS: 'În desfășurare',
  COMPLETED: 'Finalizată',
  CANCELLED: 'Anulată',
}

const skillLabels: Record<WorkerSkill, string> = {
  BARISTA: '☕ Barista',
  WAITER: '🍽️ Ospătar',
  DISHWASHER: '🍳 Spălător vase',
  STAGEHAND: '🎭 Stagehand',
}

// Demo data — will be replaced with Supabase queries
const demoShifts = [
  {
    id: '1', role_needed: 'WAITER' as WorkerSkill, start_time: '2026-04-28T08:00:00Z',
    end_time: '2026-04-28T16:00:00Z', hourly_pay_ron: 35, status: 'OPEN' as ShiftStatus,
    created_at: '2026-04-27T10:00:00Z', applications_count: 3,
  },
  {
    id: '2', role_needed: 'BARISTA' as WorkerSkill, start_time: '2026-04-29T06:00:00Z',
    end_time: '2026-04-29T14:00:00Z', hourly_pay_ron: 40, status: 'FILLED' as ShiftStatus,
    created_at: '2026-04-26T09:00:00Z', applications_count: 7,
  },
  {
    id: '3', role_needed: 'DISHWASHER' as WorkerSkill, start_time: '2026-04-27T18:00:00Z',
    end_time: '2026-04-28T02:00:00Z', hourly_pay_ron: 30, status: 'IN_PROGRESS' as ShiftStatus,
    created_at: '2026-04-25T12:00:00Z', applications_count: 2,
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function ShiftsPage() {
  const [filter, setFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredShifts = filter === 'ALL'
    ? demoShifts
    : demoShifts.filter((s) => s.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ture</h1>
          <p className="text-sm text-muted-foreground">
            Gestionează turele tale — creează, editează și monitorizează aplicările
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <Button className="shadow-lg shadow-primary/20">
              ＋ Creează tură nouă
            </Button>
          } />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tură nouă</DialogTitle>
              <DialogDescription>
                Completează detaliile turei. Lucrătorii din zonă vor fi notificați automat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role_needed">Rol necesar</Label>
                <Select>
                  <SelectTrigger id="role_needed">
                    <SelectValue placeholder="Selectează rolul" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(skillLabels) as WorkerSkill[]).map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skillLabels[skill]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Început</Label>
                  <Input id="start_time" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Sfârșit</Label>
                  <Input id="end_time" type="datetime-local" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hourly_pay">Plată pe oră (RON)</Label>
                <Input
                  id="hourly_pay"
                  type="number"
                  min="1"
                  step="0.50"
                  placeholder="35.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notițe (opțional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Detalii suplimentare despre tură..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Anulare
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Publică tura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Deschise', value: 1, color: 'text-emerald-400' },
          { label: 'Ocupate', value: 1, color: 'text-blue-400' },
          { label: 'În desfășurare', value: 1, color: 'text-amber-400' },
          { label: 'Total aplicări', value: 12, color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className="shrink-0"
          >
            {s === 'ALL' ? 'Toate' : statusLabels[s as ShiftStatus]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Perioadă</TableHead>
              <TableHead>Plată/oră</TableHead>
              <TableHead>Aplicări</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map((shift) => (
              <TableRow key={shift.id} className="group">
                <TableCell className="font-medium">
                  {skillLabels[shift.role_needed]}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(shift.start_time)} → {formatDate(shift.end_time)}
                </TableCell>
                <TableCell className="font-semibold text-emerald-400">
                  {shift.hourly_pay_ron} RON
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {shift.applications_count}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`border ${statusColors[shift.status]}`} variant="outline">
                    {statusLabels[shift.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Detalii →
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
