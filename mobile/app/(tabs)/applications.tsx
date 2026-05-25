import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CircleDollarSign, Building, AlertCircle, MapPin } from 'lucide-react-native';

const skillLabels: Record<string, string> = {
  BARISTA: 'Barista',
  WAITER: 'Ospătar',
  DISHWASHER: 'Spălător vase',
  STAGEHAND: 'Stagehand',
};

const statusLabels: Record<string, string> = {
  PENDING: 'În așteptare',
  ACCEPTED: 'Acceptat',
  REJECTED: 'Respins',
  NO_SHOW: 'Absent',
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user row ID
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userRow) return;

      // Fetch applications with shift and employer profiles
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          shift:job_shifts(
            *,
            employer:employer_profiles(company_name, address)
          )
        `)
        .eq('worker_id', userRow.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setApplications(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchApplications();
  }

  function formatTime(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  }

  // Filter application list based on active/history tabs
  const activeApplications = applications.filter(app => app.status === 'ACCEPTED');
  const historyApplications = applications.filter(app => app.status !== 'ACCEPTED');

  function getStatusColor(status: string) {
    switch (status) {
      case 'ACCEPTED': return '#10b981'; // Emerald
      case 'PENDING': return '#e5c158'; // Amber
      case 'REJECTED': return '#ef4444'; // Red
      case 'NO_SHOW': return '#64748b'; // Gray
      default: return '#94a3b8';
    }
  }

  return (
    <View style={styles.container}>
      {/* Tab Selectors */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Programate ({activeApplications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Istoric ({historyApplications.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e5c158" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e5c158" />
          }
        >
          {(activeTab === 'active' ? activeApplications : historyApplications).length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>
                {activeTab === 'active' 
                  ? 'Nu ai nicio tură programată în acest moment.' 
                  : 'Nu există nicio aplicație în istoric.'}
              </Text>
            </View>
          ) : (
            (activeTab === 'active' ? activeApplications : historyApplications).map((app) => (
              <View key={app.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {selectedRole(app.shift?.role_needed)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '20', borderColor: getStatusColor(app.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                      {statusLabels[app.status] || app.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.employerRow}>
                  <Building size={14} color="#e5c158" style={{ marginRight: 6 }} />
                  <Text style={styles.employerText}>{app.shift?.employer?.company_name}</Text>
                </View>

                <View style={styles.metaGrid}>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.metaText}>{formatDate(app.shift?.start_time)}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Clock size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.metaText}>
                      {formatTime(app.shift?.start_time)} - {formatTime(app.shift?.end_time)}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <CircleDollarSign size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.payText}>{app.shift?.hourly_pay_ron} RON / oră</Text>
                  </View>
                </View>

                {app.status === 'ACCEPTED' && (
                  <View style={styles.alertBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={14} color="#6366f1" style={{ marginRight: 6 }} />
                      <Text style={styles.alertText}>
                        Adresă: {app.shift?.employer?.address || 'Nespecificată'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function selectedRole(role: string) {
  return skillLabels[role] || role;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 6,
    margin: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#002b7f',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  card: {
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
    marginBottom: 8,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  employerText: {
    color: '#e5c158',
    fontSize: 13,
    fontWeight: '500',
  },
  metaGrid: {
    flexDirection: 'column',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12.5,
  },
  payText: {
    color: '#cbd5e1',
    fontSize: 12.5,
    fontWeight: '600',
  },
  alertBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  alertText: {
    color: '#34d399',
    fontSize: 12,
    lineHeight: 16,
  },
});
