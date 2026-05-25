import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, CircleDollarSign, CheckCircle2, SlidersHorizontal, List, Map, Star } from 'lucide-react-native';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  STAGEHAND: 'Stagehand',
};

// Timisoara Coordinates
const INITIAL_REGION = {
  latitude: 45.75372,
  longitude: 21.22571,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

let MapView: any;
let Marker: any;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Marker = MapModule.Marker;
  } catch (e) {
    console.log('react-native-maps not available, using fallback');
  }
}

export default function ExploreScreen() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [applying, setApplying] = useState(false);
  const [appliedShiftIds, setAppliedShiftIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUserAndShifts();
  }, []);

  async function fetchUserAndShifts() {
    setLoading(true);
    try {
      // 1. Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setCurrentUser(authUser);
        // Get user table ID and profile
        const { data: userRow } = await supabase
          .from('users')
          .select('id, role')
          .eq('auth_id', authUser.id)
          .single();

        if (userRow) {
          setUserProfile(userRow);
          // If worker, fetch already applied shifts to disable double applications
          if (userRow.role === 'WORKER') {
            const { data: apps } = await supabase
              .from('applications')
              .select('shift_id')
              .eq('worker_id', userRow.id);
            if (apps) {
              setAppliedShiftIds(new Set(apps.map(a => a.shift_id)));
            }
          }
        }
      }

      // 2. Fetch open shifts with employer profiles
      const { data: shiftsData, error } = await supabase
        .from('job_shifts')
        .select(`
          *,
          employer:employer_profiles!inner(company_name, address, lat, lng, employer_rating)
        `)
        .eq('status', 'OPEN');

      if (error) {
        console.error(error);
      } else {
        // Filter out shifts that don't have valid coordinates
        const validShifts = (shiftsData || []).map(s => ({
          ...s,
          latitude: s.employer?.lat || INITIAL_REGION.latitude + (Math.random() - 0.5) * 0.02,
          longitude: s.employer?.lng || INITIAL_REGION.longitude + (Math.random() - 0.5) * 0.02,
        }));
        setShifts(validShifts);
        setFilteredShifts(validShifts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters
  useEffect(() => {
    if (activeFilter) {
      setFilteredShifts(shifts.filter(s => s.role_needed === activeFilter));
    } else {
      setFilteredShifts(shifts);
    }
    setSelectedShift(null);
  }, [activeFilter, shifts]);

  async function handleApply(shift: any) {
    if (!userProfile) {
      Alert.alert('Eroare', 'Trebuie să fii conectat.');
      return;
    }
    if (userProfile.role !== 'WORKER') {
      Alert.alert('Atenție', 'Doar utilizatorii cu cont de Lucrător pot aplica la ture.');
      return;
    }
    if (appliedShiftIds.has(shift.id)) {
      Alert.alert('Aplicație existentă', 'Ai aplicat deja la această tură.');
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        shift_id: shift.id,
        worker_id: userProfile.id,
        status: 'PENDING',
      });

      if (error) {
        Alert.alert('Eroare la aplicare', error.message);
      } else {
        setAppliedShiftIds(prev => {
          const next = new Set(prev);
          next.add(shift.id);
          return next;
        });
        Alert.alert('Succes', 'Aplicația ta a fost înregistrată! Angajatorul va fi notificat.');
        setSelectedShift(null);
      }
    } catch (e: any) {
      Alert.alert('Eroare', e.message || 'A apărut o eroare.');
    } finally {
      setApplying(false);
    }
  }

  function formatTime(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  }

  return (
    <View style={styles.container}>
      {/* Header Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, !activeFilter && styles.filterChipActive]}
            onPress={() => setActiveFilter(null)}
          >
            <Text style={[styles.filterChipText, !activeFilter && styles.filterChipTextActive]}>Toate</Text>
          </TouchableOpacity>
          {Object.keys(skillLabels).map(roleKey => (
            <TouchableOpacity 
              key={roleKey}
              style={[styles.filterChip, activeFilter === roleKey && styles.filterChipActive]}
              onPress={() => setActiveFilter(roleKey)}
            >
              <Text style={[styles.filterChipText, activeFilter === roleKey && styles.filterChipTextActive]}>
                {skillLabels[roleKey]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          {viewMode === 'map' ? (
            <List size={18} color="#e5c158" />
          ) : (
            <Map size={18} color="#e5c158" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e5c158" />
          <Text style={styles.loaderText}>Se încarcă turele deschise...</Text>
        </View>
      ) : viewMode === 'map' && Platform.OS !== 'web' && MapView ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            userInterfaceStyle="dark"
          >
            {filteredShifts.map((shift) => (
              <Marker
                key={shift.id}
                coordinate={{ latitude: shift.latitude, longitude: shift.longitude }}
                title={skillLabels[shift.role_needed]}
                description={shift.employer?.company_name}
                pinColor={appliedShiftIds.has(shift.id) ? '#10b981' : '#002b7f'}
                onPress={() => setSelectedShift(shift)}
              />
            ))}
          </MapView>
        </View>
      ) : (
        // List View / Web Fallback
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredShifts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nu am găsit nicio tură activă pentru filtrele selectate.</Text>
            </View>
          ) : (
            filteredShifts.map((shift) => (
              <TouchableOpacity 
                key={shift.id} 
                style={styles.shiftCard}
                onPress={() => setSelectedShift(shift)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{skillLabels[shift.role_needed] || shift.role_needed}</Text>
                  <View style={[styles.statusBadge, appliedShiftIds.has(shift.id) && styles.statusBadgeApplied]}>
                    <Text style={styles.statusBadgeText}>
                      {appliedShiftIds.has(shift.id) ? 'Aplicat' : 'Deschis'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.cardEmployer}>{shift.employer?.company_name}</Text>
                
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.metaText}>
                      {formatDate(shift.start_time)}, {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <CircleDollarSign size={14} color="#64748b" />
                    <Text style={styles.metaPay}>{shift.hourly_pay_ron} RON / oră</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Selected Shift Detail / Bottom Sheet */}
      {selectedShift && (
        <View style={styles.bottomSheetBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{skillLabels[selectedShift.role_needed]}</Text>
              <TouchableOpacity onPress={() => setSelectedShift(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContent}>
              <Text style={styles.sheetEmployer}>{selectedShift.employer?.company_name}</Text>
              {selectedShift.employer?.employer_rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Star size={14} color="#eab308" fill="#eab308" style={{ marginRight: 4 }} />
                  <Text style={[styles.sheetRating, { marginBottom: 0 }]}>
                    {Number(selectedShift.employer.employer_rating).toFixed(1)}/5 rating angajator
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Calendar size={16} color="#94a3b8" />
                <Text style={styles.detailText}>
                  {formatDate(selectedShift.start_time)}, {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={16} color="#94a3b8" />
                <Text style={styles.detailText}>{selectedShift.employer?.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <CircleDollarSign size={16} color="#e5c158" />
                <Text style={styles.detailPay}>{selectedShift.hourly_pay_ron} RON / oră</Text>
              </View>

              <TouchableOpacity 
                style={[
                  styles.applyButton, 
                  appliedShiftIds.has(selectedShift.id) && styles.applyButtonApplied,
                  applying && styles.applyButtonDisabled
                ]}
                onPress={() => handleApply(selectedShift)}
                disabled={applying || appliedShiftIds.has(selectedShift.id)}
              >
                {applying ? (
                  <ActivityIndicator color="#ffffff" />
                ) : appliedShiftIds.has(selectedShift.id) ? (
                  <View style={styles.applyButtonContent}>
                    <CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.applyButtonText}>DEJA APLICAT</Text>
                  </View>
                ) : (
                  <Text style={styles.applyButtonText}>APLICĂ RAPID</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0a0f1d',
  },
  filterScroll: {
    paddingRight: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#002b7f',
    borderColor: '#002b7f',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loaderText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  shiftCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#002b7f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeApplied: {
    backgroundColor: '#10b981',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardEmployer: {
    color: '#e5c158',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  metaPay: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSheetBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    maxHeight: '80%',
  },
  sheetContent: {
    marginTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetEmployer: {
    color: '#e5c158',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sheetRating: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  detailPay: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#002b7f',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonApplied: {
    backgroundColor: '#10b981',
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
