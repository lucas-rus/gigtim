'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { skillLabels, getLabel } from '@/lib/labels'
import { applyToShift } from '@/lib/supabase/data-actions'
import type { UserRole } from '@/lib/types/database'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

interface JobsClientProps {
  shifts: any[]
  userRole: UserRole
  userId: string | null
}

export function JobsClient({ shifts, userRole, userId }: JobsClientProps) {
  const [searchCity, setSearchCity] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('DATE_ASC')
  const [isPending, startTransition] = useTransition()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)

  const filteredJobs = shifts
    .filter((j) => {
      const city = j.employer_profiles?.city || ''
      const matchesCity = searchCity ? city.toLowerCase().includes(searchCity.toLowerCase()) : true
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locuri de muncă</h1>
        <p className="text-sm text-muted-foreground">
          Găsește și aplică la ture deschise în zona ta
        </p>
      </div>

      {message && (
        <div className={`text-sm px-4 py-2 rounded-lg ${message.includes('succes') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      <Card className="border-border/50">
        <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Caută locație</Label>
            <Input placeholder="Ex: București, Cluj..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Categorie (Rol)</Label>
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? 'ALL')}>
              <SelectTrigger>
                <span className="truncate">
                  {roleFilter === 'ALL' ? 'Toate rolurile' : getLabel(skillLabels, roleFilter)}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toate rolurile</SelectItem>
                {Object.entries(skillLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sortează după</Label>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? 'DATE_ASC')}>
              <SelectTrigger>
                <span className="truncate">
                  {sortBy === 'DATE_ASC' ? 'Data (cele mai apropiate)' : sortBy === 'PAY_DESC' ? 'Plată (descrescător)' : 'Plată (crescător)'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_ASC">Data (cele mai apropiate)</SelectItem>
                <SelectItem value="PAY_DESC">Plată (descrescător)</SelectItem>
                <SelectItem value="PAY_ASC">Plată (crescător)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
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
              <Card key={job.id} className="flex flex-col border-border/50 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 mb-2" variant="outline">
                        {getLabel(skillLabels, job.role_needed)}
                      </Badge>
                      <CardTitle className="text-lg">{job.employer_profiles?.company_name || 'Angajator'}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        📍 {job.employer_profiles?.city || 'Necunoscut'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400">{job.hourly_pay_ron} <span className="text-sm font-normal text-muted-foreground">RON/h</span></div>
                      <div className="text-xs text-muted-foreground">Total: ~{totalPay} RON</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-3 text-sm space-y-2">
                  <div className="flex justify-between items-center bg-accent/30 rounded p-2">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{formatDate(job.start_time)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-accent/30 rounded p-2">
                    <span className="text-muted-foreground">Final:</span>
                    <span className="font-medium">{formatDate(job.end_time)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {userRole === 'WORKER' ? (
                    <Button
                      className="w-full shadow-lg shadow-primary/20 transition-all hover:brightness-110"
                      disabled={isPending || alreadyApplied}
                      onClick={() => handleApply(job.id)}
                    >
                      {alreadyApplied ? '✓ Aplicat' : 'Aplică acum'}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground w-full text-center">
                      Doar lucrătorii pot aplica
                    </p>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
