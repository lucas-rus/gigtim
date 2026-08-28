import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Share, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Download, Users, Calendar, Star, Phone, ShieldCheck, MessageCircle, Inbox } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Badge, Button, EmptyState, Skeleton, toast, Avatar, RatingStars } from '@/src/ui';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista', WAITER: 'Ospătar', DISHWASHER: 'Spălător vase', STAGEHAND: 'Stagehand',
};

const statusLabels: Record<string, string> = {
  PENDING: 'În așteptare', ACCEPTED: 'Acceptat', REJECTED: 'Respins', NO_SHOW: 'Absent',
};

export function EmployerApplications({ userDbId }: { userDbId: string }) {
  const t = useZoriTheme();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'processed'>('pending');
  const [acting, setActing] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Get the employer's shift IDs first
      const { data: shifts } = await supabase
        .from('job_shifts')
        .select('id, role_needed, start_time, end_time, hourly_pay_ron')
        .eq('employer_id', userDbId);

      if (!shifts || shifts.length === 0) { setApplications([]); return; }

      const shiftIds = shifts.map(s => s.id);
      const shiftMap = new Map(shifts.map(s => [s.id, s]));

      const { data: apps, error } = await supabase
        .from('applications')
        .select(`
          *,
          worker:worker_profiles(
            full_name, phone_number, city, cnp, id_card_series,
            reliability_score, total_shifts_completed, skills
          )
        `)
        .in('shift_id', shiftIds)
        .order('created_at', { ascending: false });

      if (error) { toast.error(error.message); return; }

      // Merge shift info into each application
      const merged = (apps || []).map(a => ({ ...a, shift: shiftMap.get(a.shift_id) }));
      setApplications(merged);
    } catch (e: any) {
      toast.error(e.message || 'Eroare la încărcarea aplicărilor');
    } finally {
      setLoading(false);
    }
  }, [userDbId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleAction(appId: string, status: 'ACCEPTED' | 'REJECTED') {
    setActing(appId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId);
      if (error) { toast.error(error.message); return; }
      toast.success(status === 'ACCEPTED' ? 'Lucrător acceptat!' : 'Lucrător respins.');
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    } finally {
      setActing(null);
    }
  }

  async function handleExportITM(app: any) {
    const w = app.worker;
    if (!w) return;
    const csv = [
      'Nume Complet,CNP,Serie CI,Telefon,Oraș',
      `${w.full_name},${w.cnp},${w.id_card_series},${w.phone_number || ''},${w.city || ''}`,
    ].join('\n');

    try {
      await Share.share({
        message: csv,
        title: `ITM Export — ${w.full_name}`,
      });
      toast.success('Date ITM exportate.');
    } catch (e: any) {
      // User cancelled share — not an error
      if (e?.message?.includes('CANCEL')) return;
      toast.error('Export eșuat.');
    }
  }

  async function handleStartChat(workerId: string) {
    try {
      const { data: myRooms } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', userDbId);
      const { data: workerRooms } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', workerId);

      let existingRoomId: string | null = null;
      if (myRooms && workerRooms) {
        const myIds = myRooms.map(r => r.room_id);
        const wIds = workerRooms.map(r => r.room_id);
        const common = myIds.filter(id => wIds.includes(id));
        if (common.length > 0) {
          const { data: room } = await supabase
            .from('chat_rooms')
            .select('id')
            .in('id', common)
            .maybeSingle();
          if (room) existingRoomId = room.id;
        }
      }

      if (!existingRoomId) {
        // Insert room — don't use .select() because RLS blocks SELECT on
        // chat_rooms for non-members (chicken-and-egg: we need the ID to
        // add members, but can't SELECT until we're a member).
        const { error: rErr } = await supabase
          .from('chat_rooms')
          .insert({ type: 'DIRECT', name: 'Chat direct' });
        if (rErr) { toast.error('Eroare la crearea conversației: ' + rErr.message); return; }

        // Fetch the room we just created by querying for the most recent
        // DIRECT room that we're not yet a member of.
        const { data: myRoomIds } = await supabase
          .from('chat_room_members')
          .select('room_id')
          .eq('user_id', userDbId);
        const myIds = (myRoomIds || []).map(r => r.room_id);

        let newRoom: any = null;
        if (myIds.length > 0) {
          const { data: room } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('type', 'DIRECT')
            .order('created_at', { ascending: false })
            .limit(10);
          newRoom = (room || []).find(r => !myIds.includes(r.id));
        } else {
          const { data: room } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('type', 'DIRECT')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          newRoom = room;
        }

        if (!newRoom) { toast.error('Eroare: camera nu a putut fi găsită.'); return; }

        const { error: mErr } = await supabase
          .from('chat_room_members')
          .insert([
            { room_id: newRoom.id, user_id: userDbId },
            { room_id: newRoom.id, user_id: workerId },
          ]);
        if (mErr) { toast.error(mErr.message); return; }
        existingRoomId = newRoom.id;
      }

      toast.success('Conversație deschisă. Merge la tab-ul Chat.');
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    }
  }

  const pending = applications.filter(a => a.status === 'PENDING');
  const processed = applications.filter(a => a.status === 'ACCEPTED' || a.status === 'REJECTED');
  const list = tab === 'pending' ? pending : processed;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: t.muted, borderColor: t.border }]}>
        <Pressable
          style={[styles.tab, tab === 'pending' && { backgroundColor: t.primaryStrong, borderRadius: 10 }]}
          onPress={() => setTab('pending')}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'pending' }}
        >
          <Text style={{ color: tab === 'pending' ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
            În așteptare ({pending.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'processed' && { backgroundColor: t.primaryStrong, borderRadius: 10 }]}
          onPress={() => setTab('processed')}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'processed' }}
        >
          <Text style={{ color: tab === 'processed' ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
            Procesate ({processed.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Skeleton height={140} />
          <Skeleton height={140} />
        </ScrollView>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === 'pending' ? 'Nicio aplicare în așteptare' : 'Nicio aplicare procesată'}
          description={tab === 'pending' ? 'Când lucrătorii aplică la turele tale, apar aici pentru revizuire.' : 'Aplicările acceptate sau respinse vor apărea aici.'}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}>
          {list.map(app => {
            const w = app.worker;
            const isPending = app.status === 'PENDING';
            const isAccepted = app.status === 'ACCEPTED';
            const isActing = acting === app.id;
            return (
              <Card key={app.id} padding="md">
                {/* Worker header */}
                <View style={styles.workerHeader}>
                  <Avatar name={w?.full_name} size="md" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading }}>
                      {w?.full_name || 'Lucrător'}
                    </Text>
                    <View style={styles.metaRow}>
                      <RatingStars value={w?.reliability_score || 0} size={13} showValue={false} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                        {' '}· {w?.total_shifts_completed || 0} ture
                      </Text>
                    </View>
                  </View>
                  <Badge variant={isAccepted ? 'secondary' : isPending ? 'accent' : 'outline'}>
                    {statusLabels[app.status] || app.status}
                  </Badge>
                </View>

                {/* Shift info */}
                <View style={[styles.shiftBox, { backgroundColor: t.muted, borderRadius: radius.md }]}>
                  <View style={styles.metaRow}>
                    <Users color={t.mutedForeground} size={14} strokeWidth={2} />
                    <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontFamily: font.sans, fontWeight: fontWeight.semibold }}>
                      {skillLabels[app.shift?.role_needed] || app.shift?.role_needed}
                    </Text>
                  </View>
                  <View style={[styles.metaRow, { marginTop: 6 }]}>
                    <Calendar color={t.mutedForeground} size={14} strokeWidth={2} />
                    <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>
                      {app.shift ? new Date(app.shift.start_time).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }) : ''} · {app.shift?.hourly_pay_ron} RON/oră
                    </Text>
                  </View>
                </View>

                {/* Worker details (for ITM compliance) */}
                {isAccepted && w && (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    <View style={styles.metaRow}>
                      <Phone color={t.mutedForeground} size={13} strokeWidth={2} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>{w.phone_number || '—'}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <ShieldCheck color={t.mutedForeground} size={13} strokeWidth={2} />
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.mono }}>CNP: {w.cnp} · CI: {w.id_card_series}</Text>
                    </View>
                  </View>
                )}

                {/* Skills */}
                {w?.skills && w.skills.length > 0 && (
                  <View style={[styles.skillsRow, { marginTop: 10 }]}>
                    {w.skills.map((s: string) => (
                      <Badge key={s} variant="outline" size="sm">{skillLabels[s] || s}</Badge>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={[styles.actionsRow, { marginTop: 14 }]}>
                  {isPending ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={CheckCircle2}
                        loading={isActing}
                        onPress={() => handleAction(app.id, 'ACCEPTED')}
                        style={{ flex: 1, marginRight: 6 }}
                      >
                        Acceptă
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        leftIcon={XCircle}
                        loading={isActing}
                        onPress={() => handleAction(app.id, 'REJECTED')}
                        style={{ flex: 1, marginLeft: 6 }}
                      >
                        Respinge
                      </Button>
                    </>
                  ) : isAccepted ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={Download}
                        onPress={() => handleExportITM(app)}
                        style={{ flex: 1, marginRight: 6 }}
                      >
                        Export ITM
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={MessageCircle}
                        onPress={() => handleStartChat(app.worker_id)}
                        style={{ flex: 1, marginLeft: 6 }}
                      >
                        Mesaj
                      </Button>
                    </>
                  ) : null}
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', padding: 6, margin: 16, borderWidth: 1, borderRadius: 12 },
  tab: { flex: 1, minHeight: 38, justifyContent: 'center', alignItems: 'center' },
  workerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shiftBox: { padding: 10, marginTop: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
});
