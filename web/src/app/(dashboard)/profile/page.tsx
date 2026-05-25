import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { getUserReviews } from '@/lib/supabase/data-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rating } from '@/components/ui/rating'
import { roleLabels, getLabel, skillLabels } from '@/lib/labels'

import { AvatarUpload } from '@/components/ui/avatar-upload'
import { ProfileEditForm } from './ProfileEditForm'

export default async function ProfilePage() {
  const data = await getCurrentProfile()

  if (!data) {
    return (
      <div className="p-6 bg-card/50 dark:bg-card/30 border border-destructive/20 rounded-2xl">
        <h1 className="text-2xl font-bold tracking-tight font-heading text-destructive">Eroare</h1>
        <p className="text-muted-foreground font-sans mt-1">Nu am putut încărca profilul.</p>
      </div>
    )
  }

  const { user, profile, profileType, email } = data
  const name = profileType === 'worker' ? (profile as any)?.full_name : (profile as any)?.company_name
  const fallbackText = name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : (email ? email[0].toUpperCase() : '?')
  const reviews = await getUserReviews(user.id)
  const workerRating = (profile as any)?.reliability_score || 0
  const employerRating = (profile as any)?.employer_rating || 0

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 via-primary/5 to-indigo-500/5 border border-border/80 dark:border-border/40 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative z-10">
          <AvatarUpload 
            userId={user.auth_id} 
            currentAvatarUrl={user.avatar_url} 
            fallbackText={fallbackText} 
          />
        </div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">Profilul tău</h1>
          <p className="text-sm text-muted-foreground font-sans">
            Gestionează informațiile contului tău, poza de profil și vizualizează reputația.
          </p>
        </div>
        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      </div>

      {/* Stats Cards / Bento Grid */}
      <div className={`grid gap-4 ${profileType === 'worker' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
          <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Rol cont</p>
          <p className="text-sm font-semibold font-sans text-foreground">{getLabel(roleLabels, user.role)}</p>
        </div>
        {profileType === 'worker' && profile && (
          <>
            <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Rating</p>
              <p className="text-base font-bold font-heading bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {reviews.length === 0 ? '0 recenzii' : (Number(workerRating) === 5 ? '5/5' : `${Number(workerRating).toFixed(1)}/5`)}
              </p>
            </div>
            <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Recenzii primite</p>
              <p className="text-base font-bold font-heading bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {reviews.length}
              </p>
            </div>
            <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Ture finalizate</p>
              <p className="text-base font-bold font-heading bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {(profile as any)?.total_shifts_completed || 0}
              </p>
            </div>
          </>
        )}
        {profileType === 'employer' && profile && (
          <>
            <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Rating</p>
              <p className="text-base font-bold font-heading bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {reviews.length === 0 ? '0 recenzii' : (Number(employerRating) === 5 ? '5/5' : `${Number(employerRating).toFixed(1)}/5`)}
              </p>
            </div>
            <div className="bg-card dark:bg-card border border-border/60 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm">
              <p className="text-xs font-medium text-muted-foreground/80 mb-1.5 font-sans">Recenzii primite</p>
              <p className="text-base font-bold font-heading bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {reviews.length}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Basic Info Card */}
      <Card className="border border-border/60 bg-card dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold font-heading text-foreground">Informații de bază</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-sans">Detaliile contului tău GigTim</CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30 rounded-full px-3 py-0.5 text-xs font-medium font-sans">
              {getLabel(roleLabels, user.role)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Email — always shown */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground/80 font-sans">Email</p>
              <p className="text-sm font-medium text-foreground font-sans">{email || 'Necunoscut'}</p>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground/80 font-sans">Rol</p>
              <p className="text-sm font-medium text-foreground font-sans">{getLabel(roleLabels, user.role)}</p>
            </div>

            {/* Rating */}
            {profileType === 'worker' && profile && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 font-sans">Rating</p>
                {reviews.length === 0 ? (
                  <p className="text-sm font-medium text-foreground font-sans">0 recenzii</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rating rating={Number(workerRating)} showText={false} />
                    <span className="text-sm font-medium text-foreground font-sans">
                      {Number(workerRating) === 5 ? '5/5' : `${Number(workerRating).toFixed(1)}/5`}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">({reviews.length} recenzii)</span>
                  </div>
                )}
              </div>
            )}
            {profileType === 'employer' && profile && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 font-sans">Rating Angajator</p>
                {reviews.length === 0 ? (
                  <p className="text-sm font-medium text-foreground font-sans">0 recenzii</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rating rating={Number(employerRating)} showText={false} />
                    <span className="text-sm font-medium text-foreground font-sans">
                      {Number(employerRating) === 5 ? '5/5' : `${Number(employerRating).toFixed(1)}/5`}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">({reviews.length} recenzii)</span>
                  </div>
                )}
              </div>
            )}

            {/* Profile-specific fields */}
            {profile && (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/80 font-sans">
                    {profileType === 'worker' ? 'Nume complet' : 'Nume companie'}
                  </p>
                  <p className="text-sm font-medium text-foreground font-sans">
                    {profileType === 'worker' ? (profile as any).full_name : (profile as any).company_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/80 font-sans">Telefon</p>
                  <p className="text-sm font-medium text-foreground font-sans">{(profile as any).phone_number || 'Nespecificat'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/80 font-sans">Județ / Oraș</p>
                  <p className="text-sm font-medium text-foreground font-sans">
                    {((profile as any).county && (profile as any).city) 
                      ? `${(profile as any).county}, ${(profile as any).city}` 
                      : 'Nespecificat'}
                  </p>
                </div>
                {profileType === 'employer' && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground/80 font-sans">CUI</p>
                    <p className="text-sm font-medium text-foreground font-sans">{(profile as any).cui || 'Nespecificat'}</p>
                  </div>
                )}
                {profileType === 'worker' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground/80 font-sans">CNP</p>
                      <p className="text-sm font-medium text-foreground font-sans">{(profile as any).cnp || 'Nespecificat'}</p>
                    </div>
                    {(profile as any).skills && (profile as any).skills.length > 0 && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground/80 font-sans">Competențe</p>
                        <div className="flex flex-wrap gap-2">
                          {(profile as any).skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30 rounded-full px-3 py-1 text-xs font-medium font-sans">
                              {getLabel(skillLabels, skill)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(profile as any).bio && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground/80 font-sans">Bio / Despre tine</p>
                        <p className="text-sm text-muted-foreground leading-relaxed font-sans bg-muted/20 dark:bg-muted/10 border border-border/50 p-4 rounded-xl">{(profile as any).bio}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* No profile yet — prompt to fill it out */}
            {!profile && (
              <div className="sm:col-span-2 py-4 text-center text-muted-foreground font-sans">
                <p>Nu ai completat încă profilul. Apasă pe &quot;Editează Profilul&quot; pentru a adăuga informații.</p>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-border/50">
            <ProfileEditForm profileType={profileType} profile={profile} />
          </div>
        </CardContent>
      </Card>

      {/* Reviews Card */}
      <Card className="border border-border/60 bg-card dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold font-heading text-foreground">Recenzii și Feedback</CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-sans">Ce spun ceilalți utilizatori despre colaborarea cu tine</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {reviews.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl bg-card dark:bg-card p-6">
              <p className="text-xs text-muted-foreground font-mono">Încă nu ai primit nicio recenzie. Finalizează ture pentru a aduna feedback!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl bg-muted/20 dark:bg-muted/10 border border-border/50 space-y-3 transition-colors hover:bg-muted/30 dark:hover:bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Rating rating={r.rating} showText={false} />
                      <span className="text-xs font-semibold font-sans text-primary">{r.rating}/5</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-sans">
                      {new Date(r.created_at).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                  <p className="text-sm italic font-sans text-muted-foreground">"{r.comment || 'Fără comentarii'}"</p>
                  <p className="text-xs text-muted-foreground text-right font-sans">— {r.reviewer_name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
