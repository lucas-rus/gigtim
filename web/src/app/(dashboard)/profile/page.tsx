import { redirect } from 'next/navigation'
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
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Eroare</h1>
        <p className="text-muted-foreground">Nu am putut încărca profilul.</p>
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
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <AvatarUpload 
          userId={user.auth_id} 
          currentAvatarUrl={user.avatar_url} 
          fallbackText={fallbackText} 
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profilul tău</h1>
          <p className="text-sm text-muted-foreground">
            Gestionează informațiile contului tău și poza de profil
          </p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Informații de bază</CardTitle>
              <CardDescription>Detaliile contului tău GigTim</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {getLabel(roleLabels, user.role)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email — always shown */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{email || 'Necunoscut'}</p>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rol</p>
              <p className="font-medium">{getLabel(roleLabels, user.role)}</p>
            </div>

            {/* Rating */}
            {profileType === 'worker' && profile && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Scor Fiabilitate</p>
                {workerRating > 0 ? (
                  <div className="flex items-center gap-2">
                    <Rating rating={Number(workerRating)} />
                    <span className="text-xs text-muted-foreground">({reviews.length} recenzii)</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">0 (Fără recenzii)</p>
                )}
              </div>
            )}
            {profileType === 'employer' && profile && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Scor Angajator</p>
                {employerRating > 0 ? (
                  <div className="flex items-center gap-2">
                    <Rating rating={Number(employerRating)} />
                    <span className="text-xs text-muted-foreground">({reviews.length} recenzii)</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">0 (Fără recenzii)</p>
                )}
              </div>
            )}

            {/* Profile-specific fields */}
            {profile && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {profileType === 'worker' ? 'Nume complet' : 'Nume companie'}
                  </p>
                  <p className="font-medium">
                    {profileType === 'worker' ? (profile as any).full_name : (profile as any).company_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                  <p className="font-medium">{(profile as any).phone_number || 'Nespecificat'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Județ / Oraș</p>
                  <p className="font-medium">
                    {((profile as any).county && (profile as any).city) 
                      ? `${(profile as any).county}, ${(profile as any).city}` 
                      : 'Nespecificat'}
                  </p>
                </div>
                {profileType === 'employer' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">CUI</p>
                    <p className="font-medium">{(profile as any).cui || 'Nespecificat'}</p>
                  </div>
                )}
                {profileType === 'worker' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">CNP</p>
                      <p className="font-medium">{(profile as any).cnp || 'Nespecificat'}</p>
                    </div>
                    {(profile as any).skills && (profile as any).skills.length > 0 && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Competențe</p>
                        <div className="flex flex-wrap gap-2">
                          {(profile as any).skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary">
                              {getLabel(skillLabels, skill)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(profile as any).bio && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Bio</p>
                        <p className="text-sm">{(profile as any).bio}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* No profile yet — prompt to fill it out */}
            {!profile && (
              <div className="sm:col-span-2 py-4 text-center text-muted-foreground">
                <p>Nu ai completat încă profilul. Apasă pe &quot;Editează Profilul&quot; pentru a adăuga informații.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <ProfileEditForm profileType={profileType} profile={profile} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recenzii și Feedback</CardTitle>
          <CardDescription>Ce spun ceilalți utilizatori despre colaborarea cu tine</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="py-8 text-center bg-accent/10 rounded-xl border border-dashed border-border/50">
              <p className="text-sm text-muted-foreground">Încă nu ai primit nicio recenzie. Finalizează ture pentru a aduna feedback!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-4 rounded-lg bg-accent/20 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rating rating={r.rating} />
                      <span className="text-xs font-semibold">{r.rating}/5</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                  <p className="text-sm italic text-foreground/90">"{r.comment || 'Niciun comentariu'}"</p>
                  <p className="text-[10px] text-muted-foreground text-right">— {r.reviewer_name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
