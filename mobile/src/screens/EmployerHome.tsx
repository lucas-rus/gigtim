import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Modal, Text, Platform, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Plus, Briefcase, Calendar, CircleDollarSign, Users, CheckCircle2, X, Clock, MapPin, Trash2, MapPinned, Pencil } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Button, Card, Badge, Input, EmptyState, Skeleton, toast } from '@/src/ui';
import DateTimePicker from '@react-native-community/datetimepicker';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  KITCHEN_HELP: 'Ajutor Bucătar',
  STAGEHAND: 'Logistică / Scenă',
  EVENT_CREW: 'Hostess / Evenimente',
  GARDENER: 'Tuns Iarba / Grădină',
  CLEANER: 'Curățenie & Menaj',
  PET_SITTER: 'Pet Care',
  PROMOTER: 'Promoter Teren',
};

const shiftStatusLabels: Record<string, string> = {
  OPEN: 'Deschisă', FILLED: 'Ocupată', IN_PROGRESS: 'În desfășurare', COMPLETED: 'Finalizată', CANCELLED: 'Anulată',
};

const TIMISOARA = { latitude: 45.75372, longitude: 21.22571 };

const QUICK_LOCATIONS = [
  { name: 'Centru, Timișoara (Piața Libertății)', lat: 45.7566, lng: 21.2285 },
  { name: 'Piața Unirii, Timișoara', lat: 45.7572, lng: 21.2310 },
  { name: 'Iulius Town, Timișoara', lat: 45.7474, lng: 21.2274 },
  { name: 'Gara de Nord, Timișoara', lat: 45.7654, lng: 21.2201 },
  { name: 'Complexul Studențesc, Timișoara', lat: 45.7489, lng: 21.2410 },
];

function fmtDate(d: Date) { return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtTime(d: Date) { return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }); }
function fmtDisplay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}

interface SearchResult { display_name: string; lat: string; lon: string; }

export function EmployerHome({ userDbId }: { userDbId: string }) {
  const t = useZoriTheme();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [roleNeeded, setRoleNeeded] = useState('BARISTA');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 3600000));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000 * 8));
  const [hourlyPay, setHourlyPay] = useState('');
  const [shiftLat, setShiftLat] = useState<number | null>(null);
  const [shiftLng, setShiftLng] = useState<number | null>(null);
  const [shiftAddress, setShiftAddress] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState<any>(null);

  // Date/time picker state
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_shifts')
        .select('*, applications(count)')
        .eq('employer_id', userDbId)
        .order('created_at', { ascending: false });
      if (error) { toast.error(error.message); return; }
      setShifts(data || []);
    } catch (e: any) {
      toast.error(e.message || 'Eroare la încărcarea turelor');
    } finally {
      setLoading(false);
    }
  }, [userDbId]);

  useEffect(() => {
    fetchShifts();
    fetchEmployerProfile();
  }, [fetchShifts]);

  async function fetchEmployerProfile() {
    const { data } = await supabase
      .from('employer_profiles')
      .select('address, city, lat, lng')
      .eq('user_id', userDbId)
      .maybeSingle();
    if (data) {
      setEmployerProfile(data);
      if (data.lat && data.lng) {
        setShiftLat(data.lat);
        setShiftLng(data.lng);
        setShiftAddress(data.address + ', ' + data.city);
      }
    }
  }

  // Autocomplete search with debounce
  function onAddressSearchChange(text: string) {
    setAddressSearch(text);
    if (searchTimer) clearTimeout(searchTimer);
    if (text.trim().length < 3) { setSearchResults([]); return; }
    const timer = setTimeout(() => doSearch(text), 500);
    setSearchTimer(timer);
  }

  async function doSearch(query: string) {
    setSearching(true);
    try {
      const q = encodeURIComponent(query + ', Timișoara, România');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=5&addressdetails=1`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (e) {
      // silently fail
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(result: SearchResult) {
    setShiftLat(parseFloat(result.lat));
    setShiftLng(parseFloat(result.lon));
    // Use a short version of the display name
    const shortName = result.display_name.split(',').slice(0, 3).join(',');
    setShiftAddress(shortName);
    setAddressSearch(shortName);
    setSearchResults([]);
  }

  function quickSelect(loc: { name: string; lat: number; lng: number }) {
    setShiftLat(loc.lat);
    setShiftLng(loc.lng);
    setShiftAddress(loc.name);
    setAddressSearch(loc.name);
    setSearchResults([]);
    toast.success('Locație selectată: ' + loc.name);
  }

  function openPicker(target: 'start' | 'end', mode: 'date' | 'time') {
    setPickerTarget(target);
    setPickerMode(mode);
    setTempDate(target === 'start' ? new Date(startDate) : new Date(endDate));
  }

  function confirmPicker() {
    if (!pickerTarget || !pickerMode) return;
    const selectedDate = tempDate;
    if (pickerTarget === 'start') {
      const newDate = mergeDateTime(selectedDate, startDate, pickerMode);
      setStartDate(newDate);
      if (endDate <= newDate) { setEndDate(new Date(newDate.getTime() + 3600000)); }
    } else {
      const newDate = mergeDateTime(selectedDate, endDate, pickerMode);
      if (newDate <= startDate) { toast.error('Sfârșitul trebuie să fie după început.'); }
      else { setEndDate(newDate); }
    }
    if (Platform.OS === 'ios' && pickerMode === 'date') {
      setPickerMode('time');
      setTempDate(pickerTarget === 'start' ? new Date(startDate) : new Date(endDate));
    } else {
      setPickerMode(null);
      setPickerTarget(null);
    }
  }

  function cancelPicker() { setPickerMode(null); setPickerTarget(null); }

  function onPickerChange(event: any, selectedDate?: Date) {
    if (Platform.OS === 'android') { setPickerMode(null); setPickerTarget(null); }
    if (selectedDate) setTempDate(selectedDate);
  }

  function mergeDateTime(selected: Date, current: Date, mode: 'date' | 'time'): Date {
    const d = new Date(current);
    if (mode === 'date') { d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate()); }
    else { d.setHours(selected.getHours(), selected.getMinutes(), 0, 0); }
    return d;
  }

  async function handleCreate() {
    if (!title.trim()) { toast.error('Introdu un titlu.'); return; }
    if (!hourlyPay) { toast.error('Completează plata.'); return; }
    if (endDate <= startDate) { toast.error('Sfârșitul trebuie după început.'); return; }
    const pay = Number(hourlyPay);
    if (!Number.isFinite(pay) || pay <= 0) { toast.error('Plata > 0.'); return; }

    setCreating(true);
    try {
      const { error } = await supabase.from('job_shifts').insert({
        employer_id: userDbId,
        title: title.trim(),
        role_needed: roleNeeded,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        hourly_pay_ron: pay,
        lat: shiftLat,
        lng: shiftLng,
      });
      if (error) { toast.error(error.message); return; }
      toast.success('Tură creată!');
      setShowCreate(false);
      resetForm();
      fetchShifts();
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    } finally {
      setCreating(false);
    }
  }

  async function handleEdit() {
    if (!editingShiftId) return;
    if (!title.trim()) { toast.error('Introdu un titlu.'); return; }
    if (!hourlyPay) { toast.error('Completează plata.'); return; }
    if (endDate <= startDate) { toast.error('Sfârșitul trebuie după început.'); return; }
    const pay = Number(hourlyPay);
    if (!Number.isFinite(pay) || pay <= 0) { toast.error('Plata > 0.'); return; }

    setCreating(true);
    try {
      const { error } = await supabase.from('job_shifts').update({
        title: title.trim(),
        role_needed: roleNeeded,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        hourly_pay_ron: pay,
        lat: shiftLat,
        lng: shiftLng,
      }).eq('id', editingShiftId);
      if (error) { toast.error(error.message); return; }
      toast.success('Tură actualizată!');
      setShowCreate(false);
      setEditingShiftId(null);
      resetForm();
      fetchShifts();
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    } finally {
      setCreating(false);
    }
  }

  function openEdit(shift: any) {
    setEditingShiftId(shift.id);
    setTitle(shift.title || '');
    setRoleNeeded(shift.role_needed);
    setStartDate(new Date(shift.start_time));
    setEndDate(new Date(shift.end_time));
    setHourlyPay(String(shift.hourly_pay_ron));
    setShiftLat(shift.lat);
    setShiftLng(shift.lng);
    setShiftAddress(shift.employer?.address || '');
    setAddressSearch(shift.employer?.address || '');
    setShowCreate(true);
  }

  function resetForm() {
    setTitle('');
    setHourlyPay('');
    setRoleNeeded('BARISTA');
    setStartDate(new Date(Date.now() + 3600000));
    setEndDate(new Date(Date.now() + 3600000 * 8));
    setEditingShiftId(null);
    if (employerProfile?.lat && employerProfile?.lng) {
      setShiftLat(employerProfile.lat);
      setShiftLng(employerProfile.lng);
      setShiftAddress(employerProfile.address + ', ' + employerProfile.city);
    } else {
      setShiftLat(null);
      setShiftLng(null);
      setShiftAddress('');
    }
    setAddressSearch('');
  }

  async function handleDeleteShift(shiftId: string) {
    setDeleting(shiftId);
    try {
      const { error } = await supabase.from('job_shifts').delete().eq('id', shiftId);
      if (error) { toast.error(error.message); return; }
      toast.success('Tură ștearsă.');
      fetchShifts();
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    } finally {
      setDeleting(null);
    }
  }

  const openShifts = shifts.filter(s => s.status === 'OPEN').length;
  const filledShifts = shifts.filter(s => s.status === 'FILLED').length;
  const totalApps = shifts.reduce((sum, s) => sum + (s.applications?.[0]?.count || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text accessibilityRole="header" style={{ color: t.foreground, fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontFamily: font.heading, marginBottom: spacing.md }}>
          Turele mele
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>Deschise</Text>
            <Text style={{ color: t.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontFamily: font.heading }}>{openShifts}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>Ocupate</Text>
            <Text style={{ color: t.secondary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontFamily: font.heading }}>{filledShifts}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs }}>Aplicări</Text>
            <Text style={{ color: t.accent, fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontFamily: font.heading }}>{totalApps}</Text>
          </View>
        </View>

        <Button onPress={() => { resetForm(); setShowCreate(true); }} leftIcon={Plus} fullWidth style={{ marginVertical: spacing.md }}>
          Creează tură nouă
        </Button>

        {loading ? (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Skeleton height={120} />
            <Skeleton height={120} />
          </View>
        ) : shifts.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nu ai creat nicio tură"
            description="Creează prima tură pentru a găsi lucrători din Timișoara."
            action={{ label: 'Creează tură', onPress: () => { resetForm(); setShowCreate(true); } }}
          />
        ) : (
          <View style={{ gap: 12, marginTop: 16 }}>
            {shifts.map(shift => (
              <Card key={shift.id} padding="md">
                <View style={styles.shiftHeader}>
                  <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, flexShrink: 1 }}>
                    {shift.title || skillLabels[shift.role_needed] || shift.role_needed}
                  </Text>
                  <Badge variant={shift.status === 'OPEN' ? 'accent' : shift.status === 'FILLED' ? 'secondary' : 'outline'}>
                    {shiftStatusLabels[shift.status] || shift.status}
                  </Badge>
                </View>
                {shift.title && (
                  <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans, marginTop: 4 }}>
                    {skillLabels[shift.role_needed]}
                  </Text>
                )}
                <View style={[styles.metaRow, { marginTop: 8 }]}>
                  <Calendar color={t.mutedForeground} size={14} />
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>{fmtDisplay(shift.start_time)}</Text>
                </View>
                <View style={[styles.payRow, { borderTopColor: t.border, marginTop: 12 }]}>
                  <View style={styles.metaRow}>
                    <CircleDollarSign color={t.primary} size={16} />
                    <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.semibold, fontFamily: font.mono }}>{shift.hourly_pay_ron} RON/oră</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Users color={t.mutedForeground} size={16} />
                    <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>{shift.applications?.[0]?.count || 0} aplicări</Text>
                  </View>
                </View>
                {shift.status === 'OPEN' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: t.border, flex: 1 }]}
                      onPress={() => openEdit(shift)}
                      accessibilityRole="button"
                    >
                      <Pencil size={14} color={t.primary} />
                      <Text style={{ color: t.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>Editează</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { borderColor: t.destructive, flex: 1 }]}
                      onPress={() => handleDeleteShift(shift.id)}
                      disabled={deleting === shift.id}
                      accessibilityRole="button"
                    >
                      <Trash2 size={14} color={t.destructive} />
                      <Text style={{ color: t.destructive, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{deleting === shift.id ? '...' : 'Șterge'}</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Shift Modal */}
      <Modal visible={showCreate && !showMapPicker} animationType="slide" onRequestClose={() => { setShowCreate(false); setEditingShiftId(null); }}>
        <View style={{ flex: 1, backgroundColor: t.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <Text accessibilityRole="header" style={{ color: t.foreground, fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontFamily: font.heading }}>
              {editingShiftId ? 'Editează tură' : 'Tură nouă'}
            </Text>
            <Pressable onPress={() => { setShowCreate(false); setEditingShiftId(null); }} hitSlop={12}>
              <X color={t.foreground} size={24} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="always">
            <Input label="Titlu tură" placeholder="Ex: Barista pentru weekend" value={title} onChangeText={setTitle} />

            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.heading, marginTop: 16, marginBottom: 6 }}>Rol necesar</Text>
            <View style={styles.roleRow}>
              {Object.entries(skillLabels).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[styles.roleChip, { borderColor: roleNeeded === key ? t.primary : t.border, backgroundColor: roleNeeded === key ? t.primaryStrong : 'transparent' }]}
                  onPress={() => setRoleNeeded(key)}
                >
                  <Text style={{ color: roleNeeded === key ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.heading, marginTop: 20, marginBottom: 6 }}>Început</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('start', 'date')}>
                <Calendar size={16} color={t.mutedForeground} />
                <Text style={{ color: t.foreground, fontSize: fontSize.sm }}>{fmtDate(startDate)}</Text>
              </Pressable>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('start', 'time')}>
                <Clock size={16} color={t.mutedForeground} />
                <Text style={{ color: t.foreground, fontSize: fontSize.sm }}>{fmtTime(startDate)}</Text>
              </Pressable>
            </View>

            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.heading, marginTop: 16, marginBottom: 6 }}>Sfârșit</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('end', 'date')}>
                <Calendar size={16} color={t.mutedForeground} />
                <Text style={{ color: t.foreground, fontSize: fontSize.sm }}>{fmtDate(endDate)}</Text>
              </Pressable>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('end', 'time')}>
                <Clock size={16} color={t.mutedForeground} />
                <Text style={{ color: t.foreground, fontSize: fontSize.sm }}>{fmtTime(endDate)}</Text>
              </Pressable>
            </View>

            {/* Location */}
            <View style={{ marginTop: 24 }}>
              <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.heading, marginBottom: 6 }}>Locația turei</Text>
              {shiftAddress ? (
                <View style={[styles.locationBox, { backgroundColor: t.muted, borderColor: t.secondary }]}>
                  <MapPinned size={18} color={t.secondary} />
                  <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.sans, flex: 1 }}>{shiftAddress}</Text>
                  <CheckCircle2 size={16} color={t.secondary} />
                </View>
              ) : (
                <View style={[styles.locationBox, { backgroundColor: t.muted, borderColor: t.border }]}>
                  <MapPin size={18} color={t.mutedForeground} />
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans, flex: 1 }}>Neselectată</Text>
                </View>
              )}
              <Pressable
                style={[styles.locPickerBtn, { borderColor: t.border }]}
                onPress={() => { setAddressSearch(shiftAddress || ''); setSearchResults([]); setShowMapPicker(true); }}
              >
                <MapPin size={18} color={t.primary} />
                <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                  {shiftAddress ? 'Schimbă locația' : 'Alege locația'}
                </Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 24 }}>
              <Input label="Plată pe oră (RON)" placeholder="35" keyboardType="numeric" value={hourlyPay} onChangeText={setHourlyPay} leftIcon={CircleDollarSign} />
            </View>

            <Button onPress={editingShiftId ? handleEdit : handleCreate} loading={creating} fullWidth leftIcon={CheckCircle2} style={{ marginTop: 24 }}>
              {editingShiftId ? 'Salvează modificările' : 'Publică tura'}
            </Button>
          </ScrollView>

          {/* iOS date/time picker */}
          {pickerMode && pickerTarget && Platform.OS === 'ios' && (
            <Modal visible transparent animationType="slide" onRequestClose={cancelPicker}>
              <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={cancelPicker}>
                <Pressable style={{ backgroundColor: t.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 }} onPress={(e) => e.stopPropagation()}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.border }}>
                    <Pressable onPress={cancelPicker} hitSlop={8}><Text style={{ color: t.mutedForeground, fontSize: fontSize.base }}>Anulare</Text></Pressable>
                    <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.bold, fontFamily: font.heading }}>{pickerTarget === 'start' ? 'Început' : 'Sfârșit'} · {pickerMode === 'date' ? 'Data' : 'Ora'}</Text>
                    <Pressable onPress={confirmPicker} hitSlop={8}><Text style={{ color: t.primary, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>OK</Text></Pressable>
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode={pickerMode}
                    display="spinner"
                    onChange={(e, d) => { if (d) setTempDate(d); }}
                    minimumDate={pickerTarget === 'end' && pickerMode === 'date' ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : undefined}
                    maximumDate={new Date(Date.now() + 365 * 3 * 24 * 3600000)}
                    textColor={t.foreground}
                    style={{ height: 200 }}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          )}

          {pickerMode && pickerTarget && Platform.OS === 'android' && (
            <DateTimePicker
              value={pickerTarget === 'start' ? startDate : endDate}
              mode={pickerMode}
              display="default"
              onChange={onPickerChange}
              minimumDate={pickerTarget === 'end' && pickerMode === 'date' ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : undefined}
              maximumDate={new Date(Date.now() + 365 * 3 * 24 * 3600000)}
            />
          )}
        </View>
      </Modal>

      {/* Location picker modal — separate, with autocomplete */}
      <Modal visible={showMapPicker} animationType="slide" onRequestClose={() => setShowMapPicker(false)}>
        <View style={{ flex: 1, backgroundColor: t.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <Text accessibilityRole="header" style={{ color: t.foreground, fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontFamily: font.heading }}>Alege locația</Text>
            <Pressable onPress={() => setShowMapPicker(false)} hitSlop={12}><X color={t.foreground} size={24} /></Pressable>
          </View>

          <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, marginBottom: 12 }}>Caută adresa unde se desfășoară tura:</Text>

            {/* Search input with autocomplete */}
            <View style={[styles.searchInput, { backgroundColor: t.muted, borderColor: searchResults.length > 0 ? t.primary : t.border }]}>
              <MapPin size={18} color={t.mutedForeground} />
              <TextInput
                style={{ flex: 1, color: t.foreground, fontSize: fontSize.sm, fontFamily: font.sans, paddingVertical: 10 }}
                placeholder="Ex: Str. Cozia 77, Timișoara"
                placeholderTextColor={t.mutedForeground}
                value={addressSearch}
                onChangeText={onAddressSearchChange}
                autoFocus
              />
              {searching && <ActivityIndicator size="small" color={t.primary} />}
            </View>

            {/* Autocomplete suggestions */}
            {searchResults.length > 0 && (
              <View style={[styles.suggestionsList, { backgroundColor: t.card, borderColor: t.border }]}>
                <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="always">
                  {searchResults.map((result, i) => (
                    <Pressable
                      key={i}
                      style={[styles.suggestionItem, { borderBottomColor: t.border }]}
                      onPress={() => selectSearchResult(result)}
                    >
                      <MapPin size={16} color={t.primary} />
                      <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.sans, flex: 1 }} numberOfLines={2}>
                        {result.display_name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selected location */}
            {shiftAddress && shiftLat != null && (
              <View style={[styles.locationResult, { backgroundColor: t.muted, borderColor: t.secondary }]}>
                <CheckCircle2 size={18} color={t.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>{shiftAddress}</Text>
                </View>
              </View>
            )}

            {/* Quick presets */}
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.heading, marginTop: 20, marginBottom: 8 }}>Locații rapide</Text>
            <View style={{ gap: 8 }}>
              {QUICK_LOCATIONS.map(loc => (
                <Pressable
                  key={loc.name}
                  style={[styles.quickLoc, { backgroundColor: t.muted, borderColor: t.border }]}
                  onPress={() => quickSelect(loc)}
                >
                  <MapPin size={16} color={t.primary} />
                  <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.sans }}>{loc.name}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            <Button fullWidth onPress={() => setShowMapPicker(false)} disabled={shiftLat == null} style={{ marginTop: 16 }}>
              {shiftLat != null ? 'Confirmă locația' : 'Selectează o locație'}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
  pickerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: undefined as any,
  },
  locationBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 10, padding: 12,
  },
  locationResult: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12,
  },
  locPickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginTop: 8, minHeight: 44,
  },
  quickLoc: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
  },
  suggestionsList: {
    borderWidth: 1, borderRadius: 10, marginTop: 0, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderRadius: 10, paddingVertical: 8,
  },
});