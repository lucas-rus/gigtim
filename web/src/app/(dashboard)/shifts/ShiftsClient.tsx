'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Coffee,
  Utensils,
  ChefHat,
  Trees,
  Sparkles,
  PartyPopper,
  Megaphone,
  Hammer,
  HeartHandshake,
  Clock,
  Users,
  ChevronRight,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  skillLabels,
  shiftStatusLabels,
  applicationStatusLabels,
  skillLegalPillar,
  legalPillarBadges,
  getLabel,
} from '@/lib/labels'
import { createShift } from '@/lib/romarg-data'
import type { ShiftStatus, UserRole } from '@/lib/types/database'
import { cn } from '@/lib/utils'

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-secondary/15 text-secondary font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none',
  FILLED: 'bg-primary/15 text-primary-strong dark:text-primary font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none',
  IN_PROGRESS: 'bg-accent/20 text-accent-foreground font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none',
  COMPLETED: 'bg-muted text-muted-foreground font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none',
  CANCELLED: 'bg-destructive/15 text-destructive font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateDurationHours(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  const diffHours = (end - start) / (1000 * 60 * 60)
  return Math.max(1, Math.round(diffHours * 10) / 10)
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'BARISTA':
      return Coffee
    case 'WAITER':
      return Utensils
    case 'KITCHEN_HELP':
      return ChefHat
    case 'DISHWASHER':
      return Sparkles
    case 'STAGEHAND':
      return Hammer
    case 'EVENT_CREW':
      return PartyPopper
    case 'GARDENER':
      return Trees
    case 'CLEANER':
      return Sparkles
    case 'PET_SITTER':
      return HeartHandshake
    case 'PROMOTER':
      return Megaphone
    default:
      return Briefcase
  }
}

interface ShiftsClientProps {
  userRole: UserRole
  initialShifts: any[]
}

export function ShiftsClient({ userRole, initialShifts }: ShiftsClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('ALL')
  const [viewStyle, setViewStyle] = useState<'grid' | 'table'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [roleNeeded, setRoleNeeded] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  const filteredShifts =
    filter === 'ALL'
      ? initialShifts
      : initialShifts.filter((s) => s.status === filter)

  // Compute stats from real data
  const statuses = initialShifts.map((s) => s.status).filter(Boolean)
  const stats = [
    { label: 'Ture Deschise', value: statuses.filter((s) => s === 'OPEN').length, color: 'text-primary' },
    { label: 'Ocupate / Confirmate', value: statuses.filter((s) => s === 'FILLED').length, color: 'text-foreground' },
    { label: 'În desfășurare azi', value: statuses.filter((s) => s === 'IN_PROGRESS').length, color: 'text-accent' },
    { label: 'Total Ture', value: initialShifts.length, color: 'text-foreground' },
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
        toast.success('Tură publicată cu succes!')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-primary/15 text-primary-strong dark:text-primary font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none">
              Hub Operațional
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {userRole === 'EMPLOYER' ? 'Mod Angajator' : 'Mod Lucrător'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-foreground">
            {userRole === 'EMPLOYER' ? 'Management Ture & Zilieri' : 'Turele Mele & Program'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans mt-0.5 max-w-2xl">
            {userRole === 'EMPLOYER'
              ? 'Publică ture ocazionale sau casnice, monitorizează aplicările în timp real și gestionează pontajul.'
              : 'Urmărește statusul turelor la care ai aplicat, programul confirmat și câștigurile cumulate.'}
          </p>
        </div>

        {/* Action Button & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-xl border border-border/70 p-1 bg-card">
            <button
              onClick={() => setViewStyle('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors',
                viewStyle === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Vizualizare carduri"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Carduri
            </button>
            <button
              onClick={() => setViewStyle('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors',
                viewStyle === 'table'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Vizualizare tabel"
            >
              <TableIcon className="h-3.5 w-3.5" />
              Tabel
            </button>
          </div>

          {userRole === 'EMPLOYER' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger>
                <Button className="h-10 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-primary-strong hover:brightness-108 active:scale-95 text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 flex items-center gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Publică tură nouă
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md dark:bg-card border border-border/60 rounded-3xl shadow-2xl p-6 sm:p-8">
                <DialogHeader className="space-y-1.5 pb-4 border-b border-border/60">
                  <DialogTitle className="text-xl font-bold font-heading text-foreground">
                    Publică o tură nouă
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-sans">
                    Alege rolul (HoReCa, Casnic sau Evenimente) și tariful. Lucrătorii verificați vor putea aplica instant.
                  </DialogDescription>
                </DialogHeader>

                <form ref={formRef} className="grid gap-5 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="role_needed" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                      Rol & Categorie de activitate
                    </Label>
                    <Select value={roleNeeded} onValueChange={(val) => setRoleNeeded(val ?? '')}>
                      <SelectTrigger id="role_needed" className="w-full bg-background border border-border/80 rounded-xl h-11 font-sans text-sm">
                        <SelectValue placeholder="Selectează rolul...">
                          {(val) => (val ? getLabel(skillLabels, val) : 'Selectează rolul...')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border/60 rounded-xl shadow-xl max-h-72">
                        {Object.entries(skillLabels).map(([key, label]) => {
                          const pillar = skillLegalPillar[key]
                          const badge = pillar ? legalPillarBadges[pillar]?.badge : null
                          return (
                            <SelectItem key={key} value={key} className="py-2.5 cursor-pointer">
                              <div className="flex items-center justify-between w-full gap-4">
                                <span className="font-medium text-foreground">{label}</span>
                                {badge && (
                                  <span className="text-[9px] font-mono font-bold text-muted-foreground/80 px-2 py-0.5 rounded-full bg-muted">
                                    {badge}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="start_time" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                        Data & Ora Început
                      </Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        className="bg-background border border-border/80 rounded-xl h-11 font-sans text-sm"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="end_time" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                        Data & Ora Sfârșit
                      </Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        className="bg-background border border-border/80 rounded-xl h-11 font-sans text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="hourly_pay" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                      Plată pe oră (RON net)
                    </Label>
                    <div className="relative">
                      <Input
                        id="hourly_pay"
                        type="number"
                        min="15"
                        step="1.00"
                        placeholder="35.00"
                        className="bg-background border border-border/80 rounded-xl h-11 font-mono text-sm pl-4 pr-16"
                      />
                      <span className="absolute right-4 top-3 text-xs font-mono text-muted-foreground">
                        RON / h
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      Salariul minim de referință recomandat este de min. 25–30 RON/oră conform pieței din Timișoara.
                    </p>
                  </div>
                </form>

                <DialogFooter className="pt-4 gap-2 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="h-11 px-5 rounded-xl border-border/80 font-sans text-xs font-semibold uppercase tracking-wider"
                  >
                    Anulare
                  </Button>
                  <Button
                    onClick={handleCreateShift}
                    disabled={isPending}
                    className="h-11 px-6 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider bg-primary-strong hover:brightness-108 active:scale-95 text-primary-foreground shadow-md shadow-primary/20"
                  >
                    {isPending ? 'Se publică...' : 'Publică tura'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono">
              {stat.label}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1.5 font-heading ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Pipeline Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {['ALL', 'OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => {
          const isActive = filter === s
          const count = s === 'ALL' ? initialShifts.length : statuses.filter((st) => st === s).length
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'shrink-0 h-9 rounded-xl px-3.5 text-xs font-semibold font-sans transition-all duration-200 flex items-center gap-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <span>{s === 'ALL' ? 'Toate Turele' : getLabel(shiftStatusLabels, s)}</span>
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredShifts.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-foreground">
            {initialShifts.length === 0
              ? userRole === 'EMPLOYER'
                ? 'Nu ai creat nicio tură încă'
                : 'Nu ai aplicat la nicio tură încă'
              : 'Nicio tură nu corespunde filtrului selectat'}
          </h3>
          <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
            {userRole === 'EMPLOYER'
              ? 'Apasă butonul de mai sus pentru a publica prima ta tură ocazională sau casnică.'
              : 'Explorează piața de ture disponibile din Timișoara și aplică instant la oportunități potrivite.'}
          </p>
          {userRole === 'WORKER' && initialShifts.length === 0 && (
            <div className="pt-2">
              <Link href="/jobs">
                <Button className="h-10 rounded-xl px-5 text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground">
                  Explorează Ture Disponibile
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : viewStyle === 'grid' ? (
        /* Designer Shift Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShifts.map((shift) => {
            const Icon = getRoleIcon(shift.role_needed)
            const pillar = skillLegalPillar[shift.role_needed]
            const pillarBadge = pillar ? legalPillarBadges[pillar] : null
            const duration = calculateDurationHours(shift.start_time, shift.end_time)
            const hourly = Number(shift.hourly_pay_ron) || 0
            const totalPay = Math.round(duration * hourly)

            return (
              <div
                key={shift.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Card Header: Icon + Category + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base font-heading text-foreground line-clamp-1">
                          {getLabel(skillLabels, shift.role_needed)}
                        </h3>
                        {pillarBadge && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {pillarBadge.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[shift.status as ShiftStatus] || ''} variant="outline">
                      {getLabel(shiftStatusLabels, shift.status)}
                    </Badge>
                  </div>

                  {/* Employer / Venue info */}
                  {userRole === 'WORKER' && shift.company_name && (
                    <div className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{shift.company_name}</span>
                    </div>
                  )}

                  {/* Pay Highlight Banner */}
                  <div className="rounded-2xl bg-muted/40 p-3.5 flex items-center justify-between border border-border/40">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground block">
                        Tarif orar
                      </span>
                      <span className="text-lg font-bold font-mono text-foreground">
                        {hourly} <span className="text-xs font-sans font-normal text-muted-foreground">RON / h</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground block">
                        Total estimat ({duration}h)
                      </span>
                      <span className="text-lg font-bold font-mono text-primary">
                        {totalPay} RON
                      </span>
                    </div>
                  </div>

                  {/* Date & Time Info */}
                  <div className="space-y-1.5 text-xs text-muted-foreground font-sans">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90 font-medium">
                        {formatDate(shift.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {formatTime(shift.start_time)} – {formatTime(shift.end_time)} ({duration} ore)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                  {userRole === 'EMPLOYER' ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold font-mono text-foreground">
                          {shift.application_count || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">aplicări</span>
                      </div>
                      <Link href="/applications">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold text-primary hover:text-primary-strong hover:bg-primary/10 gap-1 px-3"
                        >
                          Vezi aplicări <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        {shift.my_application_status ? (
                          <Badge className="bg-secondary/15 text-secondary border-none font-mono text-[10px] font-bold uppercase tracking-wider">
                            Status: {getLabel(applicationStatusLabels, shift.my_application_status)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">Înregistrat</span>
                        )}
                      </div>
                      <Link href="/jobs">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold text-primary hover:text-primary-strong hover:bg-primary/10 gap-1 px-3"
                        >
                          Detalii <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Compact Table Mode */
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border/60">
              <TableRow>
                <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Rol</TableHead>
                {userRole === 'WORKER' && (
                  <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Angajator</TableHead>
                )}
                <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Interval Orar</TableHead>
                <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Tarif / Oră</TableHead>
                {userRole === 'EMPLOYER' && (
                  <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Aplicări</TableHead>
                )}
                <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Status</TableHead>
                {userRole === 'WORKER' && (
                  <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider py-4 px-6">Statusul Meu</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-muted/20 border-b border-border/50 last:border-b-0">
                  <TableCell className="font-semibold text-foreground px-6 py-4 font-sans">
                    {getLabel(skillLabels, shift.role_needed)}
                  </TableCell>
                  {userRole === 'WORKER' && (
                    <TableCell className="text-sm text-muted-foreground font-sans px-6 py-4">
                      {shift.company_name || '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground font-sans px-6 py-4">
                    {formatDate(shift.start_time)} → {formatTime(shift.end_time)}
                  </TableCell>
                  <TableCell className="font-bold text-foreground px-6 py-4 font-mono">
                    {Number(shift.hourly_pay_ron)} RON/h
                  </TableCell>
                  {userRole === 'EMPLOYER' && (
                    <TableCell className="px-6 py-4">
                      <Badge className="bg-primary/10 text-primary font-mono text-xs rounded-lg px-2.5 py-0.5 border-none">
                        {shift.application_count || 0} aplicări
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-4">
                    <Badge className={statusColors[shift.status as ShiftStatus] || ''} variant="outline">
                      {getLabel(shiftStatusLabels, shift.status)}
                    </Badge>
                  </TableCell>
                  {userRole === 'WORKER' && shift.my_application_status && (
                    <TableCell className="px-6 py-4">
                      <Badge className="bg-muted text-muted-foreground border-none rounded-lg px-2.5 py-0.5 font-mono text-xs">
                        {getLabel(applicationStatusLabels, shift.my_application_status)}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
