'use client'

import { useMemo, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  Map as MapIcon, List, MapPin, Calendar, CircleDollarSign, CheckCircle2,
  MessageSquare, Star, X, Briefcase, Coffee, Utensils, ChefHat, Trees,
  Sparkles, PartyPopper, Megaphone, Hammer, HeartHandshake, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { skillLabels, getLabel, skillLegalPillar, legalPillarBadges } from '@/lib/labels'
import { applyToShift, getOrCreateDirectChat } from '@/lib/romarg-data'
import type { UserRole } from '@/lib/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { MapShiftPin } from '@/components/map/LeafletMap'

// Leaflet needs `window` — load client-side only
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })

interface JobsClientProps {
  shifts: any[]
  userRole: UserRole
  _userId: string | null
  initialAppliedShiftIds?: string[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
}

function calculateDurationHours(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  const diffHours = (end - start) / (1000 * 60 * 60)
  return Math.max(1, Math.round(diffHours * 10) / 10)
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'BARISTA': return Coffee
    case 'WAITER': return Utensils
    case 'KITCHEN_HELP': return ChefHat
    case 'DISHWASHER': return Sparkles
    case 'STAGEHAND': return Hammer
    case 'EVENT_CREW': return PartyPopper
    case 'GARDENER': return Trees
    case 'CLEANER': return Sparkles
    case 'PET_SITTER': return HeartHandshake
    case 'PROMOTER': return Megaphone
    default: return Briefcase
  }
}

export function JobsClient({ shifts, userRole, initialAppliedShiftIds = [] }: JobsClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<any | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set(initialAppliedShiftIds))
  const [isPending, startTransition] = useTransition()

  // Filter chips derived from actually-posted shifts (mobile parity)
  const availableCategories = useMemo(
    () => Array.from(new Set(shifts.map((s) => s.role_needed).filter(Boolean))),
    [shifts]
  )

  const filteredShifts = useMemo(
    () => (activeFilter ? shifts.filter((s) => s.role_needed === activeFilter) : shifts),
    [shifts, activeFilter]
  )

  // Map pins: only shifts with resolvable coordinates.
  // NOTE (mobile bug fixed here): mobile drops non-geo shifts from BOTH map and
  // list. Web keeps them in the list; they just don't get a pin.
  const pins: MapShiftPin[] = useMemo(
    () =>
      filteredShifts
        .map((s) => {
          const lat = typeof s.employer_lat === 'number' ? s.employer_lat : parseFloat(s.employer_lat)
          const lng = typeof s.employer_lng === 'number' ? s.employer_lng : parseFloat(s.employer_lng)
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            return {
              id: s.id,
              lat,
              lng,
              applied: appliedIds.has(s.id),
            }
          }
          return null
        })
        .filter((p): p is MapShiftPin => p !== null),
    [filteredShifts, appliedIds]
  )

  function handleFilterChange(cat: string | null) {
    setActiveFilter(cat)
    setSelectedShift(null)
  }

  function handleApply(shiftId: string) {
    startTransition(async () => {
      const result = await applyToShift(shiftId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setAppliedIds((prev) => new Set([...prev, shiftId]))
        toast.success('Aplicația a fost înregistrată! Angajatorul va fi notificat.')
        setSelectedShift(null)
        router.refresh()
      }
    })
  }

  function handleStartChat(employerId: string) {
    if (!employerId) return
    startTransition(async () => {
      const res = await getOrCreateDirectChat(employerId)
      if (res.roomId) {
        setSelectedShift(null)
        router.push(`/chat?room=${res.roomId}`)
      } else if (res.error) {
        toast.error(res.error)
      }
    })
  }

  const selectedApplied = selectedShift ? appliedIds.has(selectedShift.id) : false

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-foreground">
            Marketplace
          </h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Găsește și aplică la ture deschise în zona ta
          </p>
        </div>

        {/* View toggle — segmented control */}
        <div
          className="inline-flex items-center rounded-xl border border-border/60 bg-card p-1 shadow-sm self-start sm:self-auto"
          role="tablist"
          aria-label="Mod de vizualizare"
        >
          <button
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 min-h-[36px]',
              viewMode === 'map'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" /> Hartă
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 min-h-[36px]',
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" /> Listă
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filtre rol">
        <FilterChip
          label="Toate"
          active={activeFilter === null}
          onClick={() => handleFilterChange(null)}
        />
        {availableCategories.map((cat) => (
          <FilterChip
            key={cat}
            label={getLabel(skillLabels, cat)}
            active={activeFilter === cat}
            onClick={() => handleFilterChange(cat)}
          />
        ))}
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="relative h-[62vh] min-h-[420px] rounded-3xl border border-border/60 overflow-hidden shadow-lg bg-muted">
          <LeafletMap
            pins={pins}
            onPinClick={(id) => setSelectedShift(shifts.find((s) => s.id === id) ?? null)}
            onMapClick={() => setSelectedShift(null)}
          />

          {/* Empty-state overlay */}
          {filteredShifts.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm p-6">
              <div className="bg-card rounded-2xl border border-border/60 shadow-xl p-8 max-w-sm text-center space-y-3">
                <MapPin className="h-8 w-8 text-primary mx-auto" strokeWidth={1.5} />
                <h3 className="text-lg font-bold font-heading text-foreground">
                  {shifts.length === 0 ? 'Nicio tură disponibilă' : 'Nicio tură pentru acest filtru'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {shifts.length === 0
                    ? 'Momentan nu există ture deschise. Revino mai târziu — angajatorii postează zilnic.'
                    : 'Încearcă alt filtru sau revino mai târziu.'}
                </p>
                {activeFilter && (
                  <Button variant="outline" className="rounded-xl" onClick={() => handleFilterChange(null)}>
                    Resetează filtrul
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No-coords notice */}
          {filteredShifts.length > 0 && pins.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-card/95 backdrop-blur-md border border-border/60 rounded-xl px-4 py-2.5 shadow-lg text-xs text-muted-foreground">
              Turele nu au coordonate — vezi{' '}
              <button className="text-primary font-semibold hover:underline" onClick={() => setViewMode('list')}>
                lista
              </button>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShifts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-card/40 rounded-3xl border border-dashed border-border/60 space-y-3">
              <Briefcase className="h-8 w-8 text-primary mx-auto" strokeWidth={1.5} />
              <h3 className="text-lg font-bold font-heading text-foreground">
                {shifts.length === 0 ? 'Nicio tură disponibilă' : 'Nicio tură pentru acest filtru'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {shifts.length === 0
                  ? 'Momentan nu există ture deschise. Revino mai târziu!'
                  : 'Încearcă să schimbi filtrul selectat.'}
              </p>
            </div>
          ) : (
            filteredShifts.map((shift) => {
              const applied = appliedIds.has(shift.id)
              const Icon = getRoleIcon(shift.role_needed)
              const pillar = skillLegalPillar[shift.role_needed]
              const pillarBadge = pillar ? legalPillarBadges[pillar] : null
              const duration = calculateDurationHours(shift.start_time, shift.end_time)
              const hourly = Number(shift.hourly_pay_ron) || 0
              const totalPay = Math.round(duration * hourly)

              return (
                <button
                  key={shift.id}
                  onClick={() => setSelectedShift(shift)}
                  className="text-left bg-card border border-border/60 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-300 space-y-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold font-heading text-foreground truncate">
                            {getLabel(skillLabels, shift.role_needed)}
                          </h3>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase font-mono tracking-wider',
                              applied
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-primary/10 text-primary-strong'
                            )}
                          >
                            {applied ? 'Aplicat' : 'Deschis'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-foreground/85 truncate">
                          {shift.company_name || 'Angajator'}
                        </p>
                        {pillarBadge && (
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            {pillarBadge.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-foreground">
                        {hourly} <span className="text-xs font-sans font-normal text-muted-foreground">RON/h</span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-primary">
                        ~{totalPay} RON <span className="font-normal text-muted-foreground">({duration}h)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {formatDate(shift.start_time)} · {formatTime(shift.start_time)}–{formatTime(shift.end_time)}
                    </span>
                    {(shift.employer_city || shift.employer_county) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {[shift.employer_city, shift.employer_county].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* SHIFT DETAIL BOTTOM SHEET */}
      <Sheet open={!!selectedShift} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-3xl border-t border-border/60 bg-card px-6 pt-3 pb-8 max-h-[85vh] overflow-y-auto sm:max-w-xl sm:mx-auto sm:inset-x-0"
        >
          {selectedShift && (
            <div className="space-y-5">
              {/* Drag handle */}
              <div className="mx-auto h-1 w-10 rounded-full bg-border" aria-hidden="true" />

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <SheetTitle className="text-2xl font-bold font-heading text-foreground">
                    {getLabel(skillLabels, selectedShift.role_needed)}
                  </SheetTitle>
                  <SheetDescription className="text-sm font-semibold text-foreground/80">
                    {selectedShift.company_name || 'Angajator'}
                  </SheetDescription>
                </div>
                <button
                  onClick={() => setSelectedShift(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Închide detaliile turei"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Employer rating (only if present) */}
              {selectedShift.employer_rating != null && Number(selectedShift.employer_rating) > 0 && (
                <div className="flex items-center gap-1.5" aria-label={`Rating angajator: ${Number(selectedShift.employer_rating).toFixed(1)} din 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(Number(selectedShift.employer_rating))
                          ? 'fill-accent text-accent'
                          : 'text-border'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="text-xs text-muted-foreground font-mono ml-1">
                    {Number(selectedShift.employer_rating).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/30 dark:bg-muted/10 p-4">
                {/* Legal Pillar Badge */}
                {selectedShift.role_needed && skillLegalPillar[selectedShift.role_needed] && (
                  <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/40">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <div className="text-xs">
                      <span className="font-bold text-foreground">
                        {legalPillarBadges[skillLegalPillar[selectedShift.role_needed]].badge}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {legalPillarBadges[skillLegalPillar[selectedShift.role_needed]].description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-foreground">
                    {formatDate(selectedShift.start_time)} · {formatTime(selectedShift.start_time)} – {formatTime(selectedShift.end_time)}
                    {' '}({calculateDurationHours(selectedShift.start_time, selectedShift.end_time)}h)
                  </span>
                </div>
                {(selectedShift.employer_city || selectedShift.employer_county) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-foreground">
                      {[selectedShift.employer_city, selectedShift.employer_county].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm pt-1">
                  <div className="flex items-center gap-3">
                    <CircleDollarSign className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                    <span className="font-mono font-bold text-foreground">
                      {Number(selectedShift.hourly_pay_ron)} RON/oră
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-primary">
                      Total: ~{Math.round(calculateDurationHours(selectedShift.start_time, selectedShift.end_time) * (Number(selectedShift.hourly_pay_ron) || 0))} RON net
                    </span>
                  </div>
                </div>

                {/* SSM Badge */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-secondary shrink-0" />
                  <span>Protecția Muncii (SSM) acoperită prin Pașaportul Digital GigTim</span>
                </div>
              </div>

              {/* CTAs */}
              {userRole === 'WORKER' ? (
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-border/80 shrink-0"
                    onClick={() => handleStartChat(selectedShift.employer_id)}
                    disabled={isPending}
                    aria-label="Trimite mesaj angajatorului"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  {selectedApplied ? (
                    <Button
                      disabled
                      className="flex-1 h-12 rounded-2xl bg-secondary/15 text-secondary hover:bg-secondary/15 font-semibold"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" /> Deja aplicat
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-12 rounded-2xl bg-primary-strong text-primary-foreground font-semibold uppercase tracking-wider shadow-lg shadow-primary/20 hover:brightness-108 active:scale-[0.99] transition-all"
                      onClick={() => handleApply(selectedShift.id)}
                      disabled={isPending}
                    >
                      {isPending ? 'Se procesează…' : 'Aplică acum'}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center font-sans uppercase tracking-widest py-2.5 bg-muted/30 rounded-xl border border-border/40">
                  Doar lucrătorii pot aplica la ture
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 min-h-[36px] border',
        active
          ? 'bg-primary-strong text-primary-foreground border-transparent shadow-md shadow-primary/20'
          : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40'
      )}
    >
      {label}
    </button>
  )
}
