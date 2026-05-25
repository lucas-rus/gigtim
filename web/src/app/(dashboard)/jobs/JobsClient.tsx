'use client'

import { useState, useTransition } from 'react'
import { Search, Briefcase, MapPin, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { skillLabels, getLabel } from '@/lib/labels'
import { applyToShift, getOrCreateDirectChat } from '@/lib/supabase/data-actions'
import type { UserRole } from '@/lib/types/database'
import { useRouter } from 'next/navigation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

interface JobsClientProps {
  shifts: any[]
  userRole: UserRole
  _userId: string | null
  initialAppliedShiftIds?: string[]
}

const englishSkillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Waiter',
  DISHWASHER: 'Dishwasher',
  STAGEHAND: 'Stagehand',
}

export function JobsClient({ shifts, userRole, _userId, initialAppliedShiftIds = [] }: JobsClientProps) {
  const router = useRouter()
  const [searchCity, setSearchCity] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('DATE_ASC')
  const [isPending, startTransition] = useTransition()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set(initialAppliedShiftIds))
  const [message, setMessage] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  function handleStartChat(employerId: string) {
    if (!employerId) return
    startTransition(async () => {
      const res = await getOrCreateDirectChat(employerId)
      if (res.roomId) {
        router.push(`/chat?room=${res.roomId}`)
      } else if (res.error) {
        setMessage(res.error)
      }
    })
  }

  // Extract unique posted cities
  const postedCities = Array.from(
    new Set(
      shifts
        .map((j) => j.employer_profiles?.city)
        .filter((city): city is string => typeof city === 'string' && city.trim() !== '')
    )
  ).sort()

  const filteredJobs = shifts
    .filter((j) => {
      const city = j.employer_profiles?.city || ''
      const matchesCity = searchCity === 'ALL' || !searchCity ? true : city.toLowerCase() === searchCity.toLowerCase()
      const matchesRole = roleFilter === 'ALL' || j.role_needed === roleFilter
      return matchesCity && matchesRole
    })
    .sort((a, b) => {
      if (sortBy === 'PAY_DESC') return b.hourly_pay_ron - a.hourly_pay_ron
      if (sortBy === 'PAY_ASC') return a.hourly_pay_ron - b.hourly_pay_ron
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

  function handleApply(shiftId: string) {
    setMessage(null)
    startTransition(async () => {
      const result = await applyToShift(shiftId)
      if (result.error) {
        setMessage(result.error)
      } else {
        setAppliedIds(prev => new Set([...prev, shiftId]))
        setMessage('Aplicare trimisă cu succes! ✓')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-heading text-primary dark:text-primary">
            Joburi Disponibile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans mt-0.5 sm:mt-1">
            Găsește și aplică la ture deschise în zona ta
          </p>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`text-sm px-4 py-2.5 rounded-xl border font-sans transition-all duration-300 ${message.includes('succes') ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Mobile Toggle Filters Button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="w-full md:hidden h-11 rounded-xl text-sm font-medium border-border/80 hover:bg-accent flex items-center justify-center gap-2"
      >
        <Search className="h-4 w-4" />
        {showFilters ? 'Hide Filters' : 'Filter & Sort'}
      </Button>

      {/* Filter Card */}
      <div className={`bg-card/75 dark:bg-card/40 border border-border/60 rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80 font-sans">
              Location
            </Label>
            <Select value={searchCity} onValueChange={(val) => setSearchCity(val ?? 'ALL')}>
              <SelectTrigger className="w-full bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm">
                <span>{searchCity === 'ALL' || !searchCity ? 'All Locations' : searchCity}</span>
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-popover border border-border/60 rounded-xl shadow-lg">
                <SelectItem value="ALL">All Locations</SelectItem>
                {postedCities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80 font-sans">
              Category (Role)
            </Label>
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? 'ALL')}>
              <SelectTrigger className="w-full bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm">
                <span>{roleFilter === 'ALL' ? 'All Roles' : (englishSkillLabels[roleFilter] || roleFilter)}</span>
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-popover border border-border/60 rounded-xl shadow-lg">
                <SelectItem value="ALL">All Roles</SelectItem>
                {Object.entries(englishSkillLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80 font-sans">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? 'DATE_ASC')}>
              <SelectTrigger className="w-full bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-10 font-sans text-sm">
                <span>
                  {sortBy === 'DATE_ASC'
                    ? 'Date (Nearest First)'
                    : sortBy === 'PAY_DESC'
                      ? 'Pay (High to Low)'
                      : 'Pay (Low to High)'}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-popover border border-border/60 rounded-xl shadow-lg">
                <SelectItem value="DATE_ASC">Date (Nearest First)</SelectItem>
                <SelectItem value="PAY_DESC">Pay (High to Low)</SelectItem>
                <SelectItem value="PAY_ASC">Pay (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground font-sans bg-card/30 rounded-2xl border border-dashed border-border/60">
            {shifts.length === 0
              ? 'Nu există ture deschise momentan. Revino mai târziu!'
              : 'Nu am găsit nicio tură care să corespundă filtrelor.'}
          </div>
        ) : (
          filteredJobs.map((job) => {
            const hours = (new Date(job.end_time).getTime() - new Date(job.start_time).getTime()) / (1000 * 60 * 60)
            const totalPay = Math.round(hours * job.hourly_pay_ron)
            const alreadyApplied = appliedIds.has(job.id)

            return (
              <div 
                key={job.id} 
                className="bg-card dark:bg-card/40 border border-border/60 rounded-2xl p-5 sm:p-6 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Icon + Title + Pay */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-11 h-11 bg-accent/50 dark:bg-muted/80 rounded-xl border border-border/60 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <Badge className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim border-none rounded-lg px-2.5 py-0.5 text-[10px] font-semibold tracking-wide capitalize inline-block" variant="outline">
                          {getLabel(skillLabels, job.role_needed)}
                        </Badge>
                        <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground leading-snug">
                          {job.employer_profiles?.company_name || 'Angajator'}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-primary dark:text-primary-fixed-dim font-heading">
                        {job.hourly_pay_ron} <span className="text-xs font-normal text-muted-foreground font-sans">RON/h</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-sans mt-0.5">Total: ~{totalPay} RON</div>
                    </div>
                  </div>

                  {/* Info Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-fixed-dim px-2.5 py-0.5 rounded-lg font-medium text-xs flex items-center gap-1.5 border border-primary/5">
                      <MapPin className="h-3.5 w-3.5" /> {job.employer_profiles?.city || 'Necunoscut'}
                    </span>
                    <span className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-fixed-dim px-2.5 py-0.5 rounded-lg font-medium text-xs flex items-center gap-1.5 border border-primary/5">
                      <Clock className="h-3.5 w-3.5" /> {Math.round(hours)} ore
                    </span>
                  </div>

                  {/* Time Details */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="flex flex-col bg-muted/30 dark:bg-muted/10 border border-border/40 rounded-xl px-3 py-2 text-[10px] font-sans">
                      <span className="text-muted-foreground font-medium uppercase tracking-wider text-[9px] mb-0.5">Start:</span>
                      <span className="font-semibold text-foreground">{formatDate(job.start_time)}</span>
                    </div>
                    <div className="flex flex-col bg-muted/30 dark:bg-muted/10 border border-border/40 rounded-xl px-3 py-2 text-[10px] font-sans">
                      <span className="text-muted-foreground font-medium uppercase tracking-wider text-[9px] mb-0.5">Final:</span>
                      <span className="font-semibold text-foreground">{formatDate(job.end_time)}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                {userRole === 'WORKER' ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="h-11 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold font-sans flex items-center justify-center gap-1.5 shrink-0"
                      onClick={() => handleStartChat(job.employer_id)}
                      disabled={isPending}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      className={`flex-1 h-11 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                        alreadyApplied 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-gradient-to-r from-primary via-indigo-600 to-primary hover:brightness-110 text-primary-foreground shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20'
                      }`}
                      disabled={isPending || alreadyApplied}
                      onClick={() => handleApply(job.id)}
                    >
                      {alreadyApplied ? '✓ Tura aplicată' : 'Aplică acum'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground w-full text-center font-sans uppercase tracking-widest py-2 bg-muted/20 rounded-xl border border-border/40">
                    Doar lucrătorii pot aplica
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
