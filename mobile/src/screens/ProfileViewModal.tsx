import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, Pressable, Modal } from 'react-native';
import { supabase } from '@/lib/supabase';
import { X, Mail, Phone, MapPin, Star, ShieldCheck, Briefcase, User } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Badge, RatingStars, EmptyState } from '@/src/ui';

const roleLabels: Record<string, string> = {
  WORKER: 'Lucrător',
  EMPLOYER: 'Angajator',
  ADMIN: 'Administrator',
};

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  STAGEHAND: 'Stagehand',
};

export function ProfileViewModal({ userId, visible, onClose }: { userId: string | null; visible: boolean; onClose: () => void }) {
  const t = useZoriTheme();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !visible) return;
    fetchProfile();
  }, [userId, visible]);

  async function fetchProfile() {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: userRow } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!userRow) { setLoading(false); return; }

      let details: any = null;
      if (userRow.role === 'WORKER') {
        const { data: wp } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        details = wp;
      } else {
        const { data: ep } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        details = ep;
      }

      setProfile({ ...userRow, details });

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const name = profile?.role === 'WORKER'
    ? profile?.details?.full_name || 'Utilizator'
    : profile?.details?.company_name || 'Companie';

  const hasReviews = reviews.length > 0;
  const rating = hasReviews
    ? (profile?.role === 'WORKER' ? profile?.details?.reliability_score : profile?.details?.employer_rating)
    : null;

  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.background }}>
        {/* Close button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 16 }}>
          <Pressable
            onPress={onClose}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.muted, justifyContent: 'center', alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel="Închide"
          >
            <X size={20} color={t.foreground} />
          </Pressable>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={t.primary} />
          </View>
        ) : !profile ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm }}>Profilul nu a fost găsit.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: t.primary, justifyContent: 'center', alignItems: 'center',
                marginBottom: 12,
              }}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={{ width: 72, height: 72, borderRadius: 36 }} />
                ) : (
                  <Text style={{ color: t.primaryForeground, fontSize: 24, fontWeight: '800', fontFamily: font.heading }}>{initials}</Text>
                )}
              </View>
              <Text style={{ color: t.foreground, fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontFamily: font.heading }}>{name}</Text>
              <View style={{ marginTop: 8 }}>
                <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Card style={{ alignItems: 'center', paddingVertical: 16, minHeight: 96, justifyContent: 'center' }}>
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.heading, marginBottom: 6 }}>
                    REPUTAȚIE
                  </Text>
                  {hasReviews && rating != null ? (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <RatingStars value={rating} size={16} showValue />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>{reviews.length} recenzii</Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontFamily: font.heading }}>—</Text>
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>Fără recenzii</Text>
                    </View>
                  )}
                </Card>
              </View>
              <View style={{ flex: 1 }}>
                <Card style={{ alignItems: 'center', paddingVertical: 16, minHeight: 96, justifyContent: 'center' }}>
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.heading, marginBottom: 6 }}>
                    {profile.role === 'WORKER' ? 'TURE FINALIZATE' : 'RECENZII PRIMITE'}
                  </Text>
                  <Text style={{ color: t.foreground, fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontFamily: font.heading }}>
                    {profile.role === 'WORKER' ? (profile.details?.total_shifts_completed || 0) : reviews.length}
                  </Text>
                </Card>
              </View>
            </View>

            {/* Info card */}
            <Card>
              <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
                Informații
              </Text>
              <View style={{ gap: 14 }}>
                {profile.role === 'WORKER' && profile.details?.phone_number ? (
                  <InfoRow icon={Phone} label="TELEFON" value={profile.details.phone_number} t={t} />
                ) : null}
                {profile.role === 'WORKER' && profile.details?.city ? (
                  <InfoRow icon={MapPin} label="ORAȘ" value={profile.details.city} t={t} />
                ) : null}
                {profile.role === 'EMPLOYER' && profile.details?.cui ? (
                  <InfoRow icon={ShieldCheck} label="CUI" value={profile.details.cui} t={t} />
                ) : null}
                {profile.role === 'EMPLOYER' && profile.details?.address ? (
                  <InfoRow icon={MapPin} label="ADRESĂ" value={profile.details.address} t={t} />
                ) : null}
                {profile.role === 'EMPLOYER' && profile.details?.city ? (
                  <InfoRow icon={MapPin} label="ORAȘ" value={profile.details.city} t={t} />
                ) : null}

                {profile.role === 'WORKER' && profile.details?.skills && profile.details.skills.length > 0 && (
                  <View style={{ marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.border }}>
                    <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 10, fontFamily: font.heading }}>
                      COMPETENȚE
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {profile.details.skills.map((skill: string) => (
                        <View key={skill} style={{ backgroundColor: t.muted, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: t.border }}>
                          <Text style={{ color: t.foreground, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>{skillLabels[skill] || skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Card>

            {/* Reviews */}
            <Card>
              <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
                Recenzii ({reviews.length})
              </Text>
              {hasReviews ? (
                <View style={{ gap: 10 }}>
                  {reviews.map(review => (
                    <View key={review.id} style={{ backgroundColor: t.muted, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: t.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <RatingStars value={review.rating} size={12} showValue />
                        <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>{new Date(review.created_at).toLocaleDateString('ro-RO')}</Text>
                      </View>
                      <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontStyle: 'italic', lineHeight: 18, marginBottom: 4 }}>
                        "{review.comment || 'Fără comentarii'}"
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon={Star}
                  title="Fără recenzii"
                  description="Acest utilizator nu a primit încă recenzii."
                />
              )}
            </Card>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value, t }: { icon: any; label: string; value: string; t: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Icon size={16} color={t.mutedForeground} strokeWidth={2} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.mutedForeground, fontSize: 9.5, fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: 2, fontFamily: font.heading }}>{label}</Text>
        <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>{value}</Text>
      </View>
    </View>
  );
}
