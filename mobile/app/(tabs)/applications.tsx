import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CircleDollarSign, Building, MapPin, Inbox } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Card, Badge, Button, EmptyState, Skeleton, toast } from '@/src/ui';
import { EmployerApplications } from '@/src/screens/EmployerApplications';

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

const statusLabels: Record<string, string> = {
  PENDING: 'În așteptare', ACCEPTED: 'Acceptat', REJECTED: 'Respins', NO_SHOW: 'Absent',
};

const statusVariant: Record<string, 'accent' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'accent', ACCEPTED: 'secondary', REJECTED: 'destructive', NO_SHOW: 'outline',
};

export default function ApplicationsScreen() {
  const t = useZoriTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDbId, setUserDbId] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRoleLoaded(true); return; }
      const { data: userRow } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', user.id)
        .maybeSingle();
      if (userRow) { setUserRole(userRow.role); setUserDbId(userRow.id); }
      setRoleLoaded(true);
    })();
  }, []);

  if (!roleLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, padding: 16, gap: 12 }}>
        <Skeleton height={140} />
        <Skeleton height={140} />
      </View>
    );
  }

  // Employers see the applicant review screen
  if (userRole === 'EMPLOYER' && userDbId) {
    return <EmployerApplications userDbId={userDbId} />;
  }

  // Workers see their own applications
  return <WorkerApplications userDbId={userDbId} />;
}

function WorkerApplications({ userDbId }: { userDbId: string | null }) {
  const t = useZoriTheme();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const fetchApplications = useCallback(async () => {
    if (!userDbId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          shift:job_shifts(
            *,
            employer:employer_profiles(company_name, address, city)
          )
        `)
        .eq('worker_id', userDbId)
        .order('created_at', { ascending: false });

      if (error) { toast.error(error.message); return; }
      setApplications(data || []);
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDbId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const active = applications.filter(a => a.status === 'ACCEPTED' || a.status === 'PENDING');
  const history = applications.filter(a => a.status === 'REJECTED' || a.status === 'NO_SHOW');
  const list = tab === 'active' ? active : history;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: t.muted, borderColor: t.border }]}>
        {[['active', `Active (${active.length})`], ['history', `Istoric (${history.length})`]].map(([key, label]) => (
          <React.Fragment key={key}>
            <PressableTab
              active={tab === key}
              label={label}
              t={t}
              onPress={() => setTab(key as 'active' | 'history')}
            />
          </React.Fragment>
        ))}
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Skeleton height={140} />
          <Skeleton height={140} />
        </ScrollView>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === 'active' ? 'Nicio aplicare activă' : 'Niciun istoric'}
          description={tab === 'active' ? 'Aplică la ture din tab-ul Hartă pentru a le urmări aici.' : 'Aplicările respinse sau absențele vor apărea aici.'}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} tintColor={t.primary} />}
        >
          {list.map(app => (
            <Card key={app.id} padding="md">
              <View style={styles.cardHeader}>
                <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading, flexShrink: 1 }}>
                  {skillLabels[app.shift?.role_needed] || app.shift?.role_needed}
                </Text>
                <Badge variant={statusVariant[app.status] || 'outline'}>
                  {statusLabels[app.status] || app.status}
                </Badge>
              </View>

              <View style={[styles.metaRow, { marginTop: 8 }]}>
                <Building color={t.mutedForeground} size={14} strokeWidth={2} />
                <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>
                  {app.shift?.employer?.company_name}
                </Text>
              </View>

              <View style={[styles.metaCol, { marginTop: 10, paddingTop: 10, borderTopColor: t.border, borderTopWidth: 1 }]}>
                <View style={styles.metaRow}>
                  <Calendar color={t.mutedForeground} size={14} strokeWidth={2} />
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>
                    {app.shift ? new Date(app.shift.start_time).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }) : ''}
                  </Text>
                  <Clock color={t.mutedForeground} size={14} strokeWidth={2} style={{ marginLeft: 12 }} />
                  <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm, fontFamily: font.sans }}>
                    {app.shift ? new Date(app.shift.start_time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : ''}–{app.shift ? new Date(app.shift.end_time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={styles.metaRow}>
                    <CircleDollarSign color={t.primary} size={15} strokeWidth={2} />
                    <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.bold, fontFamily: font.mono }}>
                      {app.shift?.hourly_pay_ron} RON/oră
                    </Text>
                    {app.shift && (
                      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontFamily: font.sans }}>
                        ({Math.max(1, Math.round((new Date(app.shift.end_time).getTime() - new Date(app.shift.start_time).getTime()) / 3600000))}h)
                      </Text>
                    )}
                  </View>
                  {app.shift && (
                    <View style={{ backgroundColor: t.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ color: t.primaryStrong, fontSize: fontSize.xs, fontWeight: fontWeight.bold, fontFamily: font.mono }}>
                        ~{Math.round(Math.max(1, (new Date(app.shift.end_time).getTime() - new Date(app.shift.start_time).getTime()) / 3600000) * app.shift.hourly_pay_ron)} RON total
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {app.status === 'ACCEPTED' && app.shift?.employer?.address && (
                <View style={[styles.alertBox, { backgroundColor: t.secondary + '15', borderColor: t.secondary + '30', borderRadius: radius.md }]}>
                  <View style={styles.metaRow}>
                    <MapPin color={t.secondary} size={14} strokeWidth={2} />
                    <Text style={{ color: t.secondary, fontSize: fontSize.sm, fontFamily: font.sans }}>
                      Adresă: {app.shift.employer.address}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function PressableTab({ active, label, t, onPress }: { active: boolean; label: string; t: any; onPress: () => void }) {
  return (
    <PressableTabInner active={active} label={label} t={t} onPress={onPress} />
  );
}

function PressableTabInner({ active, label, t, onPress }: { active: boolean; label: string; t: any; onPress: () => void }) {
  const { Pressable } = require('react-native');
  return (
    <Pressable
      style={{ flex: 1, minHeight: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: active ? t.primaryStrong : 'transparent' }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={{ color: active ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', padding: 6, margin: 16, borderWidth: 1, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaCol: { flexDirection: 'column', gap: 6 },
  alertBox: { borderWidth: 1, padding: 10, marginTop: 12 },
});
