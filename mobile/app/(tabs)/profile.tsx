import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, ShieldCheck, ShieldAlert, LogOut, CheckCircle2, Bookmark, Star, Building, MapPin, Camera } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Button, Badge, RatingStars, EmptyState, Input, toast } from '@/src/ui';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  STAGEHAND: 'Stagehand',
};

const roleLabels: Record<string, string> = {
  WORKER: 'Lucrător',
  EMPLOYER: 'Angajator',
  ADMIN: 'Administrator',
};

export default function ProfileScreen() {
  const t = useZoriTheme();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [cnp, setCnp] = useState('');
  const [idSeries, setIdSeries] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfileAndReviews();
  }, []);

  async function fetchProfileAndReviews() {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .maybeSingle();

      if (userError) {
        console.error('Profile load error:', userError);
        toast.error('Eroare la încărcarea profilului: ' + userError.message);
        setLoading(false);
        return;
      }
      if (!userRow) {
        toast.error('Profilul nu a fost găsit. Contul poate să nu fie confirmat încă.');
        setLoading(false);
        return;
      }

      let profileDetails = null;
      if (userRow.role === 'WORKER') {
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', userRow.id)
          .maybeSingle();
        profileDetails = workerProfile;
      } else {
        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', userRow.id)
          .maybeSingle();
        profileDetails = employerProfile;
      }

      setProfile({ ...userRow, email: authUser.email, details: profileDetails });
      setCnp(profileDetails?.cnp || '');
      setIdSeries(profileDetails?.id_card_series || '');

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userRow.id)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut încărca profilul.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveIdentity() {
    if (!/^\d{13}$/.test(cnp)) {
      toast.error('CNP-ul trebuie să aibă exact 13 cifre.');
      return;
    }
    if (!idSeries.trim()) {
      toast.error('Serie CI este obligatorie.');
      return;
    }

    setSavingIdentity(true);
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ cnp, id_card_series: idSeries.trim() })
        .eq('user_id', profile.id);

      if (error) { toast.error(error.message); return; }
      toast.success('Datele de identitate au fost salvate.');
      setEditingIdentity(false);
      fetchProfileAndReviews();
    } catch (e: any) {
      toast.error(e.message || 'Eroare la salvare.');
    } finally {
      setSavingIdentity(false);
    }
  }

  async function handleAvatarUpload() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permisiunea pentru galerie este necesară.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploadingAvatar(true);

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { toast.error('Trebuie să fii conectat.'); return; }

      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${authUser.id}/avatar.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        name: fileName,
      } as any);

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData as any, { upsert: true });

      if (uploadErr) { toast.error(uploadErr.message); return; }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateErr } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('auth_id', authUser.id);

      if (updateErr) { toast.error(updateErr.message); return; }

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Poza de profil a fost actualizată.');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la încărcarea pozei.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Deconectare',
      'Sigur vrei să te deconectezi?',
      [
        { text: 'Anulare', style: 'cancel' },
        {
          text: 'Deconectare',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await supabase.auth.signOut();
            } catch (e: any) {
              toast.error(e.message);
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: t.mutedForeground }}>Eroare la încărcarea profilului.</Text>
      </View>
    );
  }

  const name = profile.role === 'WORKER'
    ? profile.details?.full_name || 'Utilizator'
    : profile.details?.company_name || 'Companie';

  const hasReviews = reviews.length > 0;
  const rating = hasReviews
    ? (profile.role === 'WORKER'
      ? profile.details?.reliability_score
      : profile.details?.employer_rating)
    : null;

  const isIdentityVerified = !!(profile.details?.cnp && profile.details?.id_card_series);
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.background }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Pressable onPress={handleAvatarUpload} disabled={uploadingAvatar} hitSlop={8}>
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
            {uploadingAvatar && (
              <View style={{
                position: 'absolute', width: 72, height: 72, borderRadius: 36,
                backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
              }}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </View>
          <View style={{
            position: 'absolute', bottom: 8, right: -4,
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: t.primaryStrong, justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: t.background,
          }}>
            <Camera size={14} color={t.primaryForeground} strokeWidth={2} />
          </View>
        </Pressable>
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

      {/* Identity Verification (Workers only) */}
      {profile.role === 'WORKER' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {isIdentityVerified ? (
              <ShieldCheck size={18} color={t.secondary} strokeWidth={2} />
            ) : (
              <ShieldAlert size={18} color={t.accent} strokeWidth={2} />
            )}
            <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, flex: 1 }}>
              Verificare identitate
            </Text>
            {isIdentityVerified ? (
              <Badge variant="secondary">Verificat</Badge>
            ) : (
              <Badge variant="outline">Neverificat</Badge>
            )}
          </View>

          {!isIdentityVerified && !editingIdentity && (
            <>
              <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, lineHeight: 20, marginBottom: 12 }}>
                Pentru a aplica la ture, trebuie să adaugi datele de identitate conform Legea 52/2011 (Registrul Zilierilor ITM).
              </Text>
              <Button variant="secondary" fullWidth onPress={() => setEditingIdentity(true)}>
                Adaugă date identitate
              </Button>
            </>
          )}

          {isIdentityVerified && !editingIdentity && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.mono }}>CNP: </Text>
                <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.mono }}>{profile.details?.cnp}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.mono }}>Serie CI: </Text>
                <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.mono }}>{profile.details?.id_card_series}</Text>
              </View>
              <Button variant="outline" size="sm" fullWidth onPress={() => setEditingIdentity(true)} style={{ marginTop: 8 }}>
                Modifică
              </Button>
            </View>
          )}

          {editingIdentity && (
            <View style={{ gap: 12 }}>
              <Input
                label="CNP (13 cifre)"
                placeholder="1234567890123"
                keyboardType="number-pad"
                maxLength={13}
                value={cnp}
                onChangeText={setCnp}
              />
              <Input
                label="Serie și nr. CI"
                placeholder="Ex: TM 123456"
                autoCapitalize="characters"
                value={idSeries}
                onChangeText={setIdSeries}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button variant="outline" fullWidth onPress={() => { setEditingIdentity(false); setCnp(profile.details?.cnp || ''); setIdSeries(profile.details?.id_card_series || ''); }}>
                  Anulare
                </Button>
                <Button fullWidth loading={savingIdentity} onPress={handleSaveIdentity}>
                  Salvează
                </Button>
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
          Informații cont
        </Text>

        <View style={{ gap: 14 }}>
          <InfoRow icon={Mail} label="EMAIL" value={profile.email} t={t} />
          {profile.details?.phone_number && <InfoRow icon={Phone} label="TELEFON" value={profile.details.phone_number} t={t} />}

          {profile.role === 'EMPLOYER' && (
            <>
              {profile.details?.cui && <InfoRow icon={ShieldCheck} label="CUI" value={profile.details.cui} t={t} />}
              {profile.details?.address && <InfoRow icon={MapPin} label="ADRESĂ SEDIU" value={profile.details.address} t={t} />}
            </>
          )}

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
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, textAlign: 'right' }}>— {review.reviewer_name || 'Anonim'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Fără recenzii"
            description="Încă nu ai primit nicio recenzie. Finalizează ture pentru a aduna feedback!"
          />
        )}
      </Card>

      {/* Logout */}
      <Button variant="outline" fullWidth loading={loggingOut} leftIcon={LogOut} onPress={handleLogout}>
        Deconectare
      </Button>
    </ScrollView>
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
