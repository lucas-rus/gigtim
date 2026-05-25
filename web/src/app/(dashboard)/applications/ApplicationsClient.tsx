'use client'

import { useState, useTransition } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { skillLabels, applicationStatusLabels, getLabel } from '@/lib/labels'
import { updateApplicationStatus, getUserReviews, getOrCreateDirectChat } from '@/lib/supabase/data-actions'
import type { ApplicationStatus, UserRole } from '@/lib/types/database'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { useRouter } from 'next/navigation'

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  REJECTED: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
  NO_SHOW: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full border-none capitalize',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function generateITMCSV(worker: any) {
  const header = 'Nume complet,CNP,Serie CI'
  const row = `"${worker.full_name}","${worker.cnp}","${worker.id_card_series}"`
  const csv = `${header}\n${row}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ITM_${worker.full_name?.replace(/\s/g, '_') || 'export'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  userRole: UserRole
  initialApplications: any[]
}

export function ApplicationsClient({ userRole, initialApplications }: Props) {
  const router = useRouter()
  const [apps, setApps] = useState(initialApplications)
  const [isPending, startTransition] = useTransition()
  const [selectedWorkerReviews, setSelectedWorkerReviews] = useState<any[] | null>(null)
  const [selectedWorkerName, setSelectedWorkerName] = useState<string>('')
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null)

  function handleViewWorkerProfile(worker: any) {
    setSelectedWorker(worker)
    setSelectedWorkerName(worker.full_name)
    setSelectedWorkerReviews(null)
    setReviewsDialogOpen(true)
    setLoadingReviews(true)
    startTransition(async () => {
      try {
        const data = await getUserReviews(worker.user_id)
        setSelectedWorkerReviews(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReviews(false)
      }
    })
  }

  function handleStartChat(workerUserId: string) {
    startTransition(async () => {
      const res = await getOrCreateDirectChat(workerUserId)
      if (res.roomId) {
        router.push(`/chat?room=${res.roomId}`)
      }
    })
  }

  function viewWorkerReviews(workerId: string, name: string) {
    setSelectedWorkerName(name)
    setSelectedWorkerReviews(null)
    setReviewsDialogOpen(true)
    setLoadingReviews(true)
    startTransition(async () => {
      try {
        const data = await getUserReviews(workerId)
        setSelectedWorkerReviews(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReviews(false)
      }
    })
  }

  function handleStatusUpdate(appId: string, status: 'ACCEPTED' | 'REJECTED') {
    startTransition(async () => {
      const result = await updateApplicationStatus(appId, status)
      if (!result.error) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      }
    })
  }

  const pending = apps.filter((a) => a.status === 'PENDING')
  const processed = apps.filter((a) => a.status !== 'PENDING')

  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-heading text-primary">Aplicări</h1>
          <p className="text-sm text-muted-foreground font-sans">
            {userRole === 'WORKER' ? 'Aplicările tale la ture' : 'Aplicările primite la turele tale'}
          </p>
        </div>
        <div className="py-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/30 p-6">
          <p className="text-base font-semibold font-heading text-foreground">Nicio aplicare încă</p>
          <p className="text-xs mt-1 font-sans text-muted-foreground text-muted-foreground/80">
            {userRole === 'WORKER'
              ? 'Mergi la Locuri de muncă pentru a aplica la ture.'
              : 'Când lucrătorii aplică la turele tale, le vei vedea aici.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-heading text-primary">Aplicări</h1>
        <p className="text-sm text-muted-foreground font-sans">
          {userRole === 'WORKER'
            ? `Aplicările tale — ${apps.length} total`
            : `Aplicările primite — ${pending.length} în așteptare`}
        </p>
      </div>

      {/* WORKER VIEW */}
      {userRole === 'WORKER' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {apps.map((app) => {
            const shift = app.job_shifts
            const employer = shift?.employer_profiles
            return (
              <Card key={app.id} className="border border-border/60 bg-card dark:bg-card/40 rounded-2xl hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="flex items-center justify-between p-5 gap-4">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm text-foreground font-sans">{getLabel(skillLabels, shift?.role_needed)}</p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {employer?.company_name || 'Angajator'} · {employer?.city || ''}
                    </p>
                    {shift && (
                      <p className="text-[10px] text-muted-foreground/80 font-sans bg-muted/30 border border-border/40 px-2 py-0.5 rounded-lg mt-2 inline-block">
                        {formatDate(shift.start_time)} → {formatDate(shift.end_time)} · {shift.hourly_pay_ron} RON/h
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[app.status as ApplicationStatus] || ''} variant="outline">
                    {getLabel(applicationStatusLabels, app.status)}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* EMPLOYER VIEW */}
      {userRole === 'EMPLOYER' && (
        <>
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold font-sans text-primary uppercase tracking-widest flex items-center gap-2 ml-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-300 inline-block animate-pulse"></span>
                În așteptare ({pending.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pending.map((app) => {
                  const worker = app.worker_profiles
                  const shift = app.job_shifts
                  if (!worker) return null
                  return (
                    <Card key={app.id} className="border border-amber-200 dark:border-amber-900/40 bg-card dark:bg-card/40 rounded-2xl hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all duration-300">
                      <CardHeader className="pb-3 px-5 pt-5">
                        <div className="flex items-start justify-between gap-2">
                          <button
                              type="button"
                              onClick={() => handleViewWorkerProfile(worker)}
                              className="flex gap-3 sm:gap-4 text-left hover:opacity-80 transition-opacity cursor-pointer group"
                            >
                              <Avatar className="h-10 w-10 border border-border rounded-xl group-hover:border-primary transition-colors">
                                {worker.users?.avatar_url && (
                                  <AvatarImage 
                                    src={worker.users.avatar_url} 
                                    alt={worker.full_name} 
                                    className="object-cover rounded-xl"
                                  />
                                )}
                                <AvatarFallback className="bg-muted dark:bg-accent text-foreground font-bold text-sm font-heading rounded-xl">
                                  {worker.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-sm font-semibold font-heading text-foreground group-hover:text-primary transition-colors">{worker.full_name}</CardTitle>
                                <CardDescription className="text-[10px] text-muted-foreground font-sans mt-0.5">
                                  {worker.city || 'Necunoscut'} · {worker.total_shifts_completed || 0} ture completate
                                </CardDescription>
                              </div>
                            </button>
                          <div className="text-right shrink-0">
                            {(Number(worker.reliability_score || 0) === 0 || worker.total_shifts_completed === 0) ? (
                              <button
                                type="button"
                                onClick={() => handleViewWorkerProfile(worker)}
                                className="text-xs font-semibold text-muted-foreground hover:text-primary hover:underline font-sans cursor-pointer block w-full text-right mt-1.5"
                              >
                                0 recenzii
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleViewWorkerProfile(worker)}
                                  className="text-sm font-bold text-primary dark:text-primary-fixed-dim hover:underline font-heading cursor-pointer block w-full text-right"
                                >
                                  ★ {Number(worker.reliability_score) === 5 ? '5/5' : `${Number(worker.reliability_score).toFixed(1)}/5`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewWorkerProfile(worker)}
                                  className="text-[10px] text-muted-foreground hover:underline font-sans cursor-pointer block w-full text-right"
                                >
                                  recenzii
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 px-5 pb-5">
                        {worker.skills && worker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {worker.skills.map((s: string) => (
                              <Badge key={s} variant="secondary" className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-fixed-dim border-none rounded-lg px-2 py-0.5 text-[10px] font-sans font-medium uppercase tracking-wider">{getLabel(skillLabels, s)}</Badge>
                            ))}
                          </div>
                        )}
                        <Separator className="bg-border/60" />
                        <div className="text-xs text-muted-foreground font-sans">
                          <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider font-sans text-muted-foreground/80">Tură:</span>{' '}
                          {shift ? `${getLabel(skillLabels, shift.role_needed)} · ${shift.hourly_pay_ron} RON/oră` : 'Necunoscută'}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-10 rounded-xl border border-primary text-primary hover:bg-primary/5 bg-transparent transition-colors text-xs font-semibold font-sans"
                            disabled={isPending}
                            onClick={() => handleStartChat(worker.user_id)}
                          >
                            Mesaj
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-10 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-white shadow-md shadow-emerald-500/10 transition-colors"
                            disabled={isPending}
                            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                          >
                            ✓ Acceptă
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-10 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-500/10 bg-transparent transition-colors text-xs font-semibold font-sans"
                            disabled={isPending}
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          >
                            ✕ Respinge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {processed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold font-sans text-muted-foreground/90 uppercase tracking-widest ml-1">Procesate ({processed.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {processed.map((app) => {
                  const worker = app.worker_profiles
                  if (!worker) return null
                  return (
                    <Card key={app.id} className="border border-border/60 bg-card dark:bg-card/40 rounded-2xl hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-5 gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border rounded-xl">
                            {worker.users?.avatar_url && (
                              <AvatarImage 
                                src={worker.users.avatar_url} 
                                alt={worker.full_name} 
                                className="object-cover rounded-xl"
                              />
                            )}
                            <AvatarFallback className="bg-muted dark:bg-accent text-foreground font-bold text-xs font-heading rounded-xl">
                              {worker.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground font-sans leading-none">{worker.full_name}</p>
                            <p className="text-xs text-muted-foreground font-sans mt-1.5">{worker.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-xl border border-primary/60 bg-transparent hover:bg-primary/5 text-primary text-xs font-sans font-semibold transition-all duration-200"
                            onClick={() => handleStartChat(worker.user_id)}
                            disabled={isPending}
                          >
                            Mesaj
                          </Button>
                          <Badge className={statusColors[app.status as ApplicationStatus] || ''} variant="outline">
                            {getLabel(applicationStatusLabels, app.status)}
                          </Badge>
                          {app.status === 'ACCEPTED' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-xl border border-primary bg-transparent hover:bg-primary/5 text-primary text-xs font-sans font-semibold transition-all duration-200 flex items-center gap-1" 
                              onClick={() => generateITMCSV(worker)}
                            >
                              <Download className="h-3.5 w-3.5" /> ITM CSV
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
      <Dialog open={reviewsDialogOpen} onOpenChange={setReviewsDialogOpen}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md dark:bg-card border border-border/60 rounded-2xl shadow-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20 dark:bg-muted/10">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary rounded-xl">
                {selectedWorker?.users?.avatar_url && (
                  <AvatarImage 
                    src={selectedWorker.users.avatar_url} 
                    alt={selectedWorkerName} 
                    className="object-cover rounded-xl"
                  />
                )}
                <AvatarFallback className="bg-muted dark:bg-accent text-foreground font-bold text-lg font-heading rounded-xl">
                  {selectedWorkerName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold font-heading text-foreground">{selectedWorkerName}</DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded text-primary">
                    Lucrător
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {selectedWorker?.city || 'Oraș nespecificat'}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="max-h-[65vh] overflow-y-auto scrollbar-thin p-6 space-y-6">
            {/* Worker Info Bento Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 dark:bg-muted/10 border border-border/50 rounded-xl p-3 text-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block mb-1">Rating</span>
                {(Number(selectedWorker?.reliability_score || 0) === 0 || selectedWorker?.total_shifts_completed === 0) ? (
                  <span className="text-sm font-semibold text-foreground">0 recenzii</span>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <Rating rating={Number(selectedWorker?.reliability_score || 0)} showText={false} size={14} />
                    <span className="text-sm font-bold text-foreground">
                      {Number(selectedWorker?.reliability_score) === 5 ? '5/5' : `${Number(selectedWorker?.reliability_score || 0).toFixed(1)}/5`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-muted/20 dark:bg-muted/10 border border-border/50 rounded-xl p-3 text-center">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block mb-1">Ture Completate</span>
                <span className="text-sm font-bold text-foreground">{selectedWorker?.total_shifts_completed || 0}</span>
              </div>
            </div>

            {/* Start Chat Button */}
            {selectedWorker && (
              <Button
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs font-semibold uppercase tracking-wider transition-colors shadow-md shadow-primary/10"
                onClick={() => {
                  setReviewsDialogOpen(false)
                  handleStartChat(selectedWorker.user_id)
                }}
                disabled={isPending}
              >
                Scrie mesaj zilierului
              </Button>
            )}

            {/* Phone Number */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Telefon</span>
              <span className="text-sm font-medium text-foreground">{selectedWorker?.phone_number || 'Nespecificat'}</span>
            </div>

            {/* Skills */}
            {selectedWorker?.skills && selectedWorker.skills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Competențe</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorker.skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-2.5 py-0.5 text-[10px] font-sans font-medium uppercase tracking-wider">
                      {getLabel(skillLabels, s)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {selectedWorker?.bio && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block">Bio / Despre</span>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 dark:bg-muted/5 border border-border/40 p-3 rounded-xl italic">
                  "{selectedWorker.bio}"
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest">Recenzii ({selectedWorkerReviews?.length || 0})</h3>
              
              {loadingReviews ? (
                <p className="text-center text-xs text-muted-foreground font-sans py-4">Se încarcă recenziile...</p>
              ) : !selectedWorkerReviews || selectedWorkerReviews.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground font-sans py-4">Nu există recenzii pentru acest lucrător.</p>
              ) : (
                <div className="space-y-3">
                  {selectedWorkerReviews.map((r: any) => (
                    <div key={r.id} className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Rating rating={r.rating} showText={false} size={12} />
                          <span className="text-[10px] font-semibold font-sans text-primary dark:text-primary-fixed-dim">{r.rating}/5</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-sans">
                          {new Date(r.created_at).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                      <p className="text-xs italic font-sans text-muted-foreground">"{r.comment || 'Fără comentarii'}"</p>
                      <p className="text-[10px] text-muted-foreground text-right font-sans">— {r.reviewer_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
