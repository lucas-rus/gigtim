import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, CircleDollarSign, CheckCircle2, List, Map, X } from 'lucide-react-native';
import { EmployerHome } from '@/src/screens/EmployerHome';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Button, Badge, EmptyState, RatingStars, toast } from '@/src/ui';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista / Bar Support',
  WAITER: 'Ajutor Ospătar / Servire',
  DISHWASHER: 'Spălător vase / Oficiant',
  KITCHEN_HELP: 'Ajutor Bucătar (prep)',
  STAGEHAND: 'Logistică / Scenotehnică',
  EVENT_CREW: 'Asistent Evenimente / Hostess',
  GARDENER: 'Tuns Iarba / Grădinărit',
  CLEANER: 'Curățenie & Menaj',
  PET_SITTER: 'Îngrijire Animale (Pet Care)',
  PROMOTER: 'Promoter & Sampling',
};

const skillLegalPillar: Record<string, { badge: string; label: string }> = {
  BARISTA: { badge: '✓ Legea 52/2011', label: 'Zilier HoReCa' },
  WAITER: { badge: '✓ Legea 52/2011', label: 'Zilier HoReCa' },
  DISHWASHER: { badge: '✓ Legea 52/2011', label: 'Zilier HoReCa' },
  KITCHEN_HELP: { badge: '✓ Legea 52/2011', label: 'Zilier HoReCa' },
  STAGEHAND: { badge: '✓ Legea 52/2011', label: 'Evenimente & Scenă' },
  EVENT_CREW: { badge: '✓ Legea 52/2011', label: 'Evenimente & Târguri' },
  PROMOTER: { badge: '✓ Legea 52/2011', label: 'Promoter Teren' },
  GARDENER: { badge: '✓ Legea 111/2022', label: 'Prestator Casnic' },
  CLEANER: { badge: '✓ Legea 111/2022', label: 'Prestator Casnic' },
  PET_SITTER: { badge: '✓ Legea 111/2022', label: 'Prestator Casnic' },
};

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
    console.log('react-native-maps not available');
  }
}

export default function ExploreScreen() {
  const t = useZoriTheme();
  const [shifts, setShifts] = useState<any[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [applying, setApplying] = useState(false);
  const [appliedShiftIds, setAppliedShiftIds] = useState<Set<string>>(new Set());

  useEffect(() => { fetchUserAndShifts(); }, []);

  async function fetchUserAndShifts() {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id, role')
          .eq('auth_id', authUser.id)
          .maybeSingle();

        if (userRow) {
          if (userRow.role === 'WORKER') {
            const { data: workerProfile } = await supabase
              .from('worker_profiles')
              .select('cnp, id_card_series')
              .eq('user_id', userRow.id)
              .maybeSingle();
            setUserProfile({ ...userRow, workerProfile });
            const { data: apps } = await supabase
              .from('applications')
              .select('shift_id')
              .eq('worker_id', userRow.id);
            if (apps) setAppliedShiftIds(new Set(apps.map(a => a.shift_id)));
          } else {
            setUserProfile(userRow);
          }
        }
      }

      const { data: shiftsData, error } = await supabase
        .from('job_shifts')
        .select(`*, employer:employer_profiles!inner(company_name, address, lat, lng, employer_rating)`)
        .eq('status', 'OPEN');

      if (error) {
        console.error(error);
      } else {
        // Use shift-specific lat/lng if available, otherwise fall back to employer HQ
        const validShifts = (shiftsData || [])
          .filter(s => {
            const lat = s.lat ?? s.employer?.lat;
            const lng = s.lng ?? s.employer?.lng;
            return lat != null && lng != null;
          })
          .map(s => ({
            ...s,
            latitude: s.lat ?? s.employer!.lat,
            longitude: s.lng ?? s.employer!.lng,
          }));
        setShifts(validShifts);
        setFilteredShifts(validShifts);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Derive available categories from actual posted shifts — no presets
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    shifts.forEach(s => cats.add(s.role_needed));
    return Array.from(cats).sort();
  }, [shifts]);

  useEffect(() => {
    if (activeFilter) setFilteredShifts(shifts.filter(s => s.role_needed === activeFilter));
    else setFilteredShifts(shifts);
    setSelectedShift(null);
  }, [activeFilter, shifts]);

  // Reset filter if the category no longer has shifts
  useEffect(() => {
    if (activeFilter && !availableCategories.includes(activeFilter)) {
      setActiveFilter(null);
    }
  }, [availableCategories, activeFilter]);

  async function handleApply(shift: any) {
    if (!userProfile) { toast.error('Trebuie să fii conectat.'); return; }
    if (userProfile.role !== 'WORKER') { toast.error('Doar lucrătorii pot aplica la ture.'); return; }
    if (!userProfile.workerProfile?.cnp || !userProfile.workerProfile?.id_card_series) {
      toast.error('Verifică-ți identitatea în profil (CNP + Serie CI) pentru a aplica la ture.');
      return;
    }
    if (appliedShiftIds.has(shift.id)) { toast.error('Ai aplicat deja la această tură.'); return; }

    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        shift_id: shift.id, worker_id: userProfile.id, status: 'PENDING',
      });
      if (error) { toast.error(error.message); }
      else {
        setAppliedShiftIds(prev => { const n = new Set(prev); n.add(shift.id); return n; });
        toast.success('Aplicația a fost înregistrată! Angajatorul va fi notificat.');
        setSelectedShift(null);
      }
    } catch (e: any) { toast.error(e.message || 'A apărut o eroare.'); }
    finally { setApplying(false); }
  }

  function formatTime(iso: string) { return new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }); }
  function formatDate(iso: string) { return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }); }

  if (userProfile?.role === 'EMPLOYER' && userProfile?.id) {
    return <EmployerHome userDbId={userProfile.id} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={t.primary} />
          <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, marginTop: 12, fontFamily: font.sans }}>Se încarcă turele...</Text>
        </View>
      ) : viewMode === 'map' && Platform.OS !== 'web' && MapView ? (
        <>
          {/* Full-screen map */}
          <View style={{ flex: 1 }}>
            <MapView
              style={{ ...StyleSheet.absoluteFillObject }}
              initialRegion={INITIAL_REGION}
              customMapStyle={t.scheme === 'dark' ? darkMapStyle : lightMapStyle}
              onPress={() => setSelectedShift(null)}
            >
              {filteredShifts.map((shift) => (
                <Marker
                  key={shift.id}
                  coordinate={{ latitude: shift.latitude, longitude: shift.longitude }}
                  title={skillLabels[shift.role_needed] || shift.role_needed}
                  description={shift.employer?.company_name}
                  pinColor={appliedShiftIds.has(shift.id) ? t.secondary : t.primary}
                  onPress={() => setSelectedShift(shift)}
                />
              ))}
            </MapView>

            {/* Empty state overlay */}
            {filteredShifts.length === 0 && (
              <View style={styles.overlay}>
                <View style={[styles.overlayCard, { backgroundColor: t.card }]}>
                  <MapPin size={32} color={t.mutedForeground} strokeWidth={1.5} />
                  <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, marginTop: 8 }}>Nicio tură disponibilă</Text>
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, textAlign: 'center', fontFamily: font.sans, marginTop: 4 }}>Nu există ture postate momentan. Revino mai târziu.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Floating toggle button — top right, over the map */}
          <Pressable
            style={[styles.floatingToggle, { backgroundColor: t.card }]}
            onPress={() => setViewMode('list')}
            accessibilityRole="button"
            accessibilityLabel="Comută la listă"
          >
            <List size={20} color={t.foreground} strokeWidth={2} />
          </Pressable>
        </>
      ) : (
        /* List view — with dynamic filters derived from real data */
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Dynamic filter chips — only show categories that have open shifts */}
          {availableCategories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
              <FilterChip label="Toate" active={!activeFilter} onPress={() => setActiveFilter(null)} t={t} />
              {availableCategories.map(key => (
                <FilterChip key={key} label={skillLabels[key] || key} active={activeFilter === key} onPress={() => setActiveFilter(key)} t={t} />
              ))}
            </ScrollView>
          )}

          {filteredShifts.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Nicio tură disponibilă"
              description={shifts.length === 0
                ? "Nu există ture postate momentan. Revino mai târziu."
                : "Nu am găsit ture pentru filtrul selectat."}
            />
          ) : (
            filteredShifts.map(shift => (
              <Pressable key={shift.id} onPress={() => setSelectedShift(shift)} style={{ marginBottom: 12 }}>
                <Card style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, flex: 1 }}>
                      {skillLabels[shift.role_needed] || shift.role_needed}
                    </Text>
                    {appliedShiftIds.has(shift.id) ? (
                      <Badge variant="secondary">Aplicat</Badge>
                    ) : (
                      <Badge variant="primary">Deschis</Badge>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                      {shift.employer?.company_name}
                    </Text>
                    {skillLegalPillar[shift.role_needed] && (
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.mono }}>
                        {skillLegalPillar[shift.role_needed].badge}
                      </Text>
                    )}
                  </View>
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Calendar size={14} color={t.mutedForeground} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                        {formatDate(shift.start_time)}, {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <CircleDollarSign size={14} color={t.mutedForeground} />
                      <Text style={{ color: t.foreground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.mono }}>
                        {shift.hourly_pay_ron} RON/oră
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          )}

          {/* Switch to map button at the bottom of the list */}
          <Pressable
            style={[styles.switchToMapBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={() => setViewMode('map')}
            accessibilityRole="button"
            accessibilityLabel="Comută la hartă"
          >
            <Map size={18} color={t.primary} strokeWidth={2} />
            <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
              Vezi pe hartă
            </Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Shift detail bottom sheet */}
      {selectedShift && (
        <Pressable style={styles.sheetBackdrop} onPress={() => setSelectedShift(null)}>
          <Pressable style={[styles.bottomSheet, { backgroundColor: t.card, borderColor: t.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheetHandle, { backgroundColor: t.border }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: t.foreground, fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontFamily: font.heading, flex: 1 }}>
                {skillLabels[selectedShift.role_needed] || selectedShift.role_needed}
              </Text>
              <Pressable onPress={() => setSelectedShift(null)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.muted, justifyContent: 'center', alignItems: 'center' }}>
                <X size={16} color={t.mutedForeground} />
              </Pressable>
            </View>

            <Text style={{ color: t.primary, fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginBottom: 4, fontFamily: font.sans }}>
              {selectedShift.employer?.company_name}
            </Text>

            {skillLegalPillar[selectedShift.role_needed] && (
              <View style={{ alignSelf: 'flex-start', backgroundColor: t.primary + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ color: t.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, fontFamily: font.mono }}>
                  {skillLegalPillar[selectedShift.role_needed].badge} · {skillLegalPillar[selectedShift.role_needed].label}
                </Text>
              </View>
            )}

            {selectedShift.employer?.employer_rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <RatingStars value={selectedShift.employer.employer_rating} size={14} showValue />
              </View>
            )}

            <DetailRow icon={Calendar} text={`${formatDate(selectedShift.start_time)}, ${formatTime(selectedShift.start_time)} - ${formatTime(selectedShift.end_time)}`} t={t} />
            <DetailRow icon={MapPin} text={selectedShift.employer?.address} t={t} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <CircleDollarSign size={16} color={t.accent} />
              <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.mono }}>
                {selectedShift.hourly_pay_ron} RON/oră
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                ✓ Protecția Muncii (SSM) acoperită prin GigTim Digital
              </Text>
            </View>

            {appliedShiftIds.has(selectedShift.id) ? (
              <Button variant="secondary" fullWidth disabled leftIcon={CheckCircle2} style={{ marginTop: 12 }}>
                Deja aplicat
              </Button>
            ) : (
              <Button fullWidth loading={applying} onPress={() => handleApply(selectedShift)} style={{ marginTop: 12 }}>
                Aplică acum
              </Button>
            )}
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress, t }: { label: string; active: boolean; onPress: () => void; t: any }) {
  return (
    <Pressable
      style={{
        backgroundColor: active ? t.primaryStrong : t.muted,
        borderWidth: 1, borderColor: active ? t.primaryStrong : t.border,
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={{
        color: active ? t.primaryForeground : t.mutedForeground,
        fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.sans,
      }}>{label}</Text>
    </Pressable>
  );
}

function DetailRow({ icon: Icon, text, t }: { icon: any; text: string; t: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <Icon size={16} color={t.mutedForeground} />
      <Text style={{ color: t.foreground, fontSize: fontSize.sm, flex: 1, fontFamily: font.sans }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  switchToMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    marginTop: 16,
  },
  sheetBackdrop: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, padding: 24, maxHeight: '80%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1C1612' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A69C95' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#120C09' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#28211E' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#A69C95' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#120C09' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#FFFBF6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#221812' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#F7F1E9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DBD7D0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
];
