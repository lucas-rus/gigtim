'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent,
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
import { createShift } from '@/lib/romarg-data'
import type { ShiftStatus, UserRole } from '@/lib/types/database'

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  FILLED: 'bg-primary/10 text-primary-strong dark:bg-primary/20 dark:text-primary font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  IN_PROGRESS: 'bg-accent/15 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  COMPLETED: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  CANCELLED: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
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
  const router = useRouter()
  const [filter, setFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [roleNeeded, setRoleNeeded] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  // Filter by shift status only — the tabs represent shift statuses. The
  // worker's own application status is shown in a separate column and must
  // not be conflated with the shift status filter (previously broke filtering).
  const filteredShifts = filter === 'ALL'
    ? initialShifts
    : initialShifts.filter((s) => s.status === filter)

  // Compute stats from real data
  const statuses = initialShifts.map(s => s.status).filter(Boolean)
  const stats = [
    { label: 'Deschise', value: statuses.filter(s => s === 'OPEN').length, color: 'text-primary-strong' },
    { label: 'Ocupate', value: statuses.filter(s => s === 'FILLED').length, color: 'text-foreground' },
    { label: 'În desfășurare', value: statuses.filter(s => s === 'IN_PROGRESS').length, color: 'text-foreground' },
    { label: 'Total ture', value: initialShifts.length, color: 'text-primary-strong' },
  ]

  function handleCreateShift() {
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
        toast.error(result.error)
      } else {
        setDialogOpen(false)
        toast.success('Tură creată cu succes!')
        // Refresh server-component data so the new shift appears immediately
        // (revalidatePath alone doesn't re-render the mounted client component).
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading text-primary dark:text-primary">
            Ture
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans mt-0.5 sm:mt-1">
            {userRole === 'EMPLOYER' ? 'Gestionează turele tale — creează, editează și monitorizează aplicările' : 'Turele la care ai aplicat'}
          </p>
        </div>
        {userRole === 'EMPLOYER' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="h-10 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-primary-strong hover:brightness-108 active:scale-95 text-primary-foreground shadow-md shadow-primary/10 transition-all duration-300 flex items-center gap-1.5">
                <Plus className="h-4 w-4" aria-hidden="true" /> Creează tură nouă
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md dark:bg-card border border-border/60 rounded-2xl shadow-xl p-6">
              <DialogHeader className="space-y-1.5 pb-4 border-b border-border/60">
                <DialogTitle className="text-xl font-semibold font-heading text-foreground">Tură nouă</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground font-sans">Completează detaliile turei. Lucrătorii din zonă vor fi notificați automat.</DialogDescription>
              </DialogHeader>
              <form ref={formRef} className="grid gap-5 py-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="role_needed" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Rol necesar</Label>
                  <Select value={roleNeeded} onValueChange={(val) => setRoleNeeded(val ?? '')}>
                    <SelectTrigger id="role_needed" className="w-full bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm">
                      <SelectValue placeholder="Selectează rolul" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover dark:bg-popover border border-border/60 rounded-xl shadow-lg">
                      {Object.entries(skillLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="start_time" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Început</Label>
                    <Input id="start_time" type="datetime-local" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="end_time" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Sfârșit</Label>
                    <Input id="end_time" type="datetime-local" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="hourly_pay" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 font-sans">Plată pe oră (RON)</Label>
                  <Input id="hourly_pay" type="number" min="1" step="0.50" placeholder="35.00" className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm" />
                </div>
              </form>
              <DialogFooter className="pt-4 gap-2 border-t border-border/60">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10 px-5 rounded-xl border border-border/80 bg-transparent hover:bg-muted text-foreground transition-all duration-200 font-sans text-xs font-semibold uppercase tracking-wider">Anulare</Button>
                <Button onClick={handleCreateShift} disabled={isPending} className="h-10 px-5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider bg-primary-strong hover:brightness-108 active:scale-95 text-primary-foreground transition-all duration-200">
                  {isPending ? 'Se creează...' : 'Publică tura'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card dark:bg-card/40 border border-border/60 rounded-2xl p-5 hover:shadow-[0_8px_24px_rgba(60,35,20,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80 font-sans">
              {stat.label}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold mt-2 font-heading ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {['ALL', 'OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => {
          const isActive = filter === s
          return (
            <Button 
              key={s} 
              variant={isActive ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilter(s)} 
              className={`shrink-0 h-9 rounded-xl px-4 font-sans text-xs capitalize transition-colors ${
                isActive 
                  ? 'bg-primary hover:brightness-110 text-primary-foreground dark:bg-primary dark:text-primary-foreground' 
                  : 'border border-border/80 hover:bg-accent text-muted-foreground bg-transparent'
              }`}
            >
              {s === 'ALL' ? 'Toate' : getLabel(shiftStatusLabels, s)}
            </Button>
          )
        })}
      </div>

      {/* Table Card (Desktop) */}
      <div className="hidden md:block bg-card dark:bg-card/40 border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30 dark:bg-muted/10 border-b border-border/60">
            <TableRow>
              <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Rol</TableHead>
              {userRole === 'WORKER' && <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Angajator</TableHead>}
              <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Perioadă</TableHead>
              <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Plată/oră</TableHead>
              {userRole === 'EMPLOYER' && <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Aplicări</TableHead>}
              <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Status</TableHead>
              {userRole === 'WORKER' && <TableHead className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 py-3.5 px-5">Aplicarea mea</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground font-sans">
                  {initialShifts.length === 0
                    ? (userRole === 'EMPLOYER' ? 'Nu ai creat nicio tură încă.' : 'Nu ai aplicat la nicio tură încă.')
                    : 'Nicio tură nu corespunde filtrului selectat.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id} className="group hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors border-b border-border/50 last:border-b-0">
                  <TableCell className="font-semibold text-foreground px-5 py-3.5 font-sans">
                    {getLabel(skillLabels, shift.role_needed)}
                  </TableCell>
                  {userRole === 'WORKER' && (
                    <TableCell className="text-sm text-muted-foreground font-sans px-5 py-3.5">
                      {shift.company_name || '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground font-sans px-5 py-3.5">
                    {formatDate(shift.start_time)} → {formatDate(shift.end_time)}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground px-5 py-3.5 font-mono">
                    {Number(shift.hourly_pay_ron)} RON
                  </TableCell>
                  {userRole === 'EMPLOYER' && (
                    <TableCell className="px-5 py-3.5">
                      <Badge className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary border-none rounded-lg px-2.5 py-0.5 font-sans text-xs">
                        {shift.application_count || 0}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="px-5 py-3.5">
                    <Badge className={statusColors[shift.status as ShiftStatus] || ''} variant="outline">
                      {getLabel(shiftStatusLabels, shift.status)}
                    </Badge>
                  </TableCell>
                  {userRole === 'WORKER' && shift.my_application_status && (
                    <TableCell className="px-5 py-3.5">
                      <Badge className="bg-muted text-muted-foreground border-none rounded-lg px-2.5 py-0.5 font-sans text-xs" variant="outline">
                        {getLabel(applicationStatusLabels, shift.my_application_status)}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredShifts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-sans bg-card/30 rounded-2xl border border-dashed border-border/60 p-6">
            {initialShifts.length === 0
              ? (userRole === 'EMPLOYER' ? 'Nu ai creat nicio tură încă.' : 'Nu ai aplicat la nicio tură încă.')
              : 'Nicio tură nu corespunde filtrului selectat.'}
          </div>
        ) : (
          filteredShifts.map((shift) => (
            <div 
              key={shift.id} 
              className="bg-card dark:bg-card/40 border border-border/60 rounded-2xl p-5 shadow-sm space-y-4 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest font-medium">Rol</span>
                  <h3 className="font-semibold font-heading text-foreground text-base mt-0.5">
                    {getLabel(skillLabels, shift.role_needed)}
                  </h3>
                  {userRole === 'WORKER' && shift.company_name && (
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">{shift.company_name}</p>
                  )}
                </div>
                <Badge className={statusColors[shift.status as ShiftStatus] || ''} variant="outline">
                  {getLabel(shiftStatusLabels, shift.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {formatDate(shift.start_time)} → {formatDate(shift.end_time)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <div>
                  <span className="block text-[9px] text-muted-foreground font-sans uppercase tracking-wider">Tarif</span>
                  <span className="font-semibold text-foreground text-base font-mono">
                    {Number(shift.hourly_pay_ron)} RON / h
                  </span>
                </div>

                {userRole === 'EMPLOYER' && (
                  <div className="text-right">
                    <span className="block text-[9px] text-muted-foreground font-sans uppercase tracking-wider">Aplicări</span>
                    <Badge className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary border-none rounded-lg px-2 py-0.5 font-sans text-xs mt-0.5 inline-block">
                      {shift.application_count || 0} aplicări
                    </Badge>
                  </div>
                )}

                {userRole === 'WORKER' && shift.my_application_status && (
                  <div className="text-right">
                    <span className="block text-[9px] text-muted-foreground font-sans uppercase tracking-wider">Aplicarea mea</span>
                    <Badge className="bg-muted text-muted-foreground border-none rounded-lg px-2.5 py-0.5 font-sans text-xs mt-0.5 inline-block" variant="outline">
                      {getLabel(applicationStatusLabels, shift.my_application_status)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
