import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, ShieldAlert, Star, LogOut, CheckCircle2, Bookmark } from 'lucide-react-native';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  STAGEHAND: 'Stagehand',
};

const roleLabels: Record<string, string> = {
  WORKER: 'Lucrător (Student)',
  EMPLOYER: 'Angajator (Companie)',
  ADMIN: 'Administrator',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfileAndReviews();
  }, []);

  async function fetchProfileAndReviews() {
    setLoading(true);
    try {
      // 1. Get current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 2. Get user table row
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (userError || !userRow) throw userError;

      // 3. Get profile details based on role
      let profileDetails = null;
      if (userRow.role === 'WORKER') {
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', userRow.id)
          .single();
        profileDetails = workerProfile;
      } else {
        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', userRow.id)
          .single();
        profileDetails = employerProfile;
      }

      setProfile({
        ...userRow,
        email: authUser.email,
        details: profileDetails,
      });

      // 4. Fetch user reviews
      const { data: reviewsData } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('user_id', userRow.id)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Eroare', 'Nu am putut încărca profilul.');
    } finally {
      setLoading(false);
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
              Alert.alert('Eroare', e.message);
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e5c158" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Eroare la încărcarea profilului.</Text>
      </View>
    );
  }

  const name = profile.role === 'WORKER' 
    ? profile.details?.full_name || 'Utilizator' 
    : profile.details?.company_name || 'Companie';
  
  const rating = profile.role === 'WORKER' 
    ? profile.details?.reliability_score || 5.0 
    : profile.details?.employer_rating || 0;

  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* Profile Info Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <Text style={styles.profileName}>{name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabels[profile.role]}</Text>
        </View>
      </View>

      {/* Stats Cards / Bento Widgets Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statWidget}>
          <Text style={styles.widgetLabel}>Reputație</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color="#e5c158" fill="#e5c158" style={{ marginRight: 4 }} />
            <Text style={styles.widgetValue}>{Number(rating).toFixed(1)}/5</Text>
          </View>
        </View>
        
        {profile.role === 'WORKER' ? (
          <View style={styles.statWidget}>
            <Text style={styles.widgetLabel}>Ture finalizate</Text>
            <Text style={styles.widgetValue}>{profile.details?.total_shifts_completed || 0}</Text>
          </View>
        ) : (
          <View style={styles.statWidget}>
            <Text style={styles.widgetLabel}>Recenzii primite</Text>
            <Text style={styles.widgetValue}>{reviews.length}</Text>
          </View>
        )}
      </View>

      {/* Personal Info Details Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardHeading}>Informații cont</Text>

        <View style={styles.infoRow}>
          <Mail size={16} color="#64748b" style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
        </View>

        {profile.details?.phone_number && (
          <View style={styles.infoRow}>
            <Phone size={16} color="#64748b" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>TELEFON</Text>
              <Text style={styles.infoValue}>{profile.details.phone_number}</Text>
            </View>
          </View>
        )}

        {/* Legal compliance fields for Workers */}
        {profile.role === 'WORKER' && (
          <>
            <View style={styles.infoRow}>
              <ShieldAlert size={16} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>CNP (CONFORMITATE ITM)</Text>
                <View style={styles.verifiedRow}>
                  <Text style={styles.infoValue}>{profile.details?.cnp || 'Neînregistrat'}</Text>
                  {profile.details?.cnp && <CheckCircle2 size={13} color="#10b981" style={{ marginLeft: 6 }} />}
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <ShieldAlert size={16} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>SERIE / NR. CARTE IDENTITATE</Text>
                <Text style={styles.infoValue}>{profile.details?.id_card_series || 'Neînregistrat'}</Text>
              </View>
            </View>

            {/* Skills Pills */}
            {profile.details?.skills && profile.details.skills.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={styles.skillsLabel}>COMPETENȚE SELECTATE</Text>
                <View style={styles.skillsContainer}>
                  {profile.details.skills.map((skill: string) => (
                    <View key={skill} style={styles.skillPill}>
                      <Text style={styles.skillPillText}>{skillLabels[skill] || skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Legal compliance fields for Employers */}
        {profile.role === 'EMPLOYER' && (
          <>
            <View style={styles.infoRow}>
              <ShieldAlert size={16} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>CUI (COD FISCAL RO)</Text>
                <Text style={styles.infoValue}>{profile.details?.cui || 'Nespecificat'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <ShieldAlert size={16} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>ADRESĂ SEDIU</Text>
                <Text style={styles.infoValue}>{profile.details?.address || 'Nespecificată'}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Reviews & Feedback */}
      <View style={styles.infoCard}>
        <Text style={styles.cardHeading}>Recenzii și feedback ({reviews.length})</Text>

        {reviews.length === 0 ? (
          <View style={styles.emptyReviews}>
            <Bookmark size={24} color="#475569" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyReviewsText}>Încă nu ai nicio recenzie înregistrată.</Text>
          </View>
        ) : (
          reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewStars}>
                  <Star size={12} color="#e5c158" fill="#e5c158" />
                  <Text style={styles.reviewRating}>{review.rating}/5</Text>
                </View>
                <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString('ro-RO')}</Text>
              </View>
              <Text style={styles.reviewComment}>"{review.comment || 'Fără comentarii'}"</Text>
              <Text style={styles.reviewerName}>— {review.reviewer_name || 'Anonim'}</Text>
            </View>
          ))
        )}
      </View>

      {/* Logout Action Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#ef4444" />
        ) : (
          <View style={styles.logoutContent}>
            <LogOut size={16} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>DECONECTARE CONT</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#002b7f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(229, 193, 88, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 193, 88, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: '#e5c158',
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statWidget: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  widgetValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 20,
  },
  cardHeading: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 14,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    color: '#cbd5e1',
    fontSize: 13.5,
    fontWeight: '500',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
  },
  skillsLabel: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    backgroundColor: 'rgba(0, 43, 127, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 43, 127, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  skillPillText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyReviews: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyReviewsText: {
    color: '#64748b',
    fontSize: 12.5,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRating: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewDate: {
    color: '#64748b',
    fontSize: 10.5,
  },
  reviewComment: {
    color: '#cbd5e1',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewerName: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
