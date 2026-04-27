'use client'

import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { skillLabels, shiftStatusLabels, applicationStatusLabels, getLabel } from '@/lib/labels'
import { createShift } from '@/lib/supabase/data-actions'
import type { ShiftStatus, WorkerSkill, UserRole } from '@/lib/types/database'

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  FILLED: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

interface ShiftsClientProps {
  userRole: UserRole
  initialShifts: any[]
}

export function ShiftsClient({ userRole, initialShifts }: ShiftsClientProps) {
  const [filter, setFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [roleNeeded, setRoleNeeded] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  const filteredShifts = filter === 'ALL'
    ? initialShifts
    : initialShifts.filter((s) => (s.status || s.my_application_status) === filter)

  // Compute stats from real data
  const statuses = initialShifts.map(s => s.status).filter(Boolean)
  const stats = [
    { label: 'Deschise', value: statuses.filter(s => s === 'OPEN').length, color: 'text-emerald-400' },
    { label: 'Ocupate', value: statuses.filter(s => s === 'FILLED').length, color: 'text-blue-400' },
    { label: 'În desfășurare', value: statuses.filter(s => s === 'IN_PROGRESS').length, color: 'text-amber-400' },
    { label: 'Total ture', value: initialShifts.length, color: 'text-primary' },
  ]

  function handleCreateShift() {
    setMessage(null)
    const form = formRef.current
    if (!form) return

    const formData = new FormData()
    formData.set('role_needed', roleNeeded)
    formData.set('start_time', (form.querySelector('#start_time') as HTMLInputElement)?.value || '')
    formData.set('end_time', (form.querySelector('#end_time') as HTMLInputElement)?.value || '')
    formData.set('hourly_pay_ron', (form.querySelector('#hourly_pay') as HTMLInputElement)?.value || '')

    startTransition(async () => {
      const result = await createShift(formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setDialogOpen(false)
        setMessage('Tură creată cu succes! ✓')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ture</h1>
          <p className="text-sm text-muted-foreground">
            {userRole === 'EMPLOYER' ? 'Gestionează turele tale — creează, editează și monitorizează aplicările' : 'Turele la care ai aplicat'}
          </p>
        </div>
        {userRole === 'EMPLOYER' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <Button className="shadow-lg shadow-primary/20">＋ Creează tură nouă</Button>
            } />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Tură nouă</DialogTitle>
                <DialogDescription>Completează detaliile turei. Lucrătorii din zonă vor fi notificați automat.</DialogDescription>
              </DialogHeader>
              <form ref={formRef} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="role_needed">Rol necesar</Label>
                  <Select value={roleNeeded} onValueChange={(val) => setRoleNeeded(val ?? '')}>
                    <SelectTrigger id="role_needed"><SelectValue placeholder="Selectează rolul" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(skillLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
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
                  <Input id="hourly_pay" type="number" min="1" step="0.50" placeholder="35.00" />
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulare</Button>
                <Button onClick={handleCreateShift} disabled={isPending}>
                  {isPending ? 'Se creează...' : 'Publică tura'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {message && (
        <div className={`text-sm px-4 py-2 rounded-lg ${message.includes('succes') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
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
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="shrink-0">
            {s === 'ALL' ? 'Toate' : getLabel(shiftStatusLabels, s)}
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
              {userRole === 'EMPLOYER' && <TableHead>Aplicări</TableHead>}
              <TableHead>Status</TableHead>
              {userRole === 'WORKER' && <TableHead>Aplicarea mea</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {initialShifts.length === 0
                    ? (userRole === 'EMPLOYER' ? 'Nu ai creat nicio tură încă.' : 'Nu ai aplicat la nicio tură încă.')
                    : 'Nicio tură nu corespunde filtrului selectat.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id} className="group">
                  <TableCell className="font-medium">{getLabel(skillLabels, shift.role_needed)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(shift.start_time)} → {formatDate(shift.end_time)}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-400">{shift.hourly_pay_ron} RON</TableCell>
                  {userRole === 'EMPLOYER' && (
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {shift.applications?.[0]?.count || 0}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={`border ${statusColors[shift.status as ShiftStatus] || ''}`} variant="outline">
                      {getLabel(shiftStatusLabels, shift.status)}
                    </Badge>
                  </TableCell>
                  {userRole === 'WORKER' && shift.my_application_status && (
                    <TableCell>
                      <Badge variant="outline">{getLabel(applicationStatusLabels, shift.my_application_status)}</Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
