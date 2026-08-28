import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Sparkles, User, Briefcase, Mail, Key, UserCheck, Phone, MapPin, Building, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Input, Button, toast } from '@/src/ui';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const router = useRouter();
  const t = useZoriTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'EMPLOYER'>('WORKER');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [address, setAddress] = useState('');

  const [city, setCity] = useState('Timișoara');
  const [county, setCounty] = useState('Timiș');
  const [loading, setLoading] = useState(false);

  // Sign out any existing session on mount — the user wants to register a new account
  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  async function handleRegister() {
    if (!email || !password || !city || !county) {
      toast.error('Completează emailul, parola și locația.');
      return;
    }
    if (password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid.');
      return;
    }
    if (role === 'WORKER') {
      if (!fullName || !phone) {
        toast.error('Completează numele și telefonul.');
        return;
      }
    } else {
      if (!companyName || !cui || !address) {
        toast.error('Completează Numele Companiei, CUI și Adresa.');
        return;
      }
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: role === 'WORKER' ? (fullName || '') : '',
            phone: role === 'WORKER' ? (phone || '') : '',
            company_name: role === 'EMPLOYER' ? (companyName || '') : '',
            cui: role === 'EMPLOYER' ? (cui || '') : '',
            address: role === 'EMPLOYER' ? (address || '') : '',
            city: city || '',
            county: county || '',
          },
        },
      });

      if (authError) { toast.error(authError.message); return; }
      if (!authData.user) { toast.error('Eroare la crearea contului.'); return; }

      toast.success('Cont creat! Verifică emailul pentru confirmare, apoi conectează-te.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      toast.error(e.message || 'A apărut o eroare neașteptată.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Header */}
        <LinearGradient
          colors={t.scheme === 'dark' ? ['#1C1612', '#120C09'] : ['#FFFBF6', '#F7F1E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Sparkles size={20} color={t.accent} strokeWidth={2} />
            </View>
            <Text style={{ color: t.foreground, fontSize: 22, fontWeight: '800', fontFamily: 'Sora_700Bold', letterSpacing: 0.3 }}>
              GigTim
            </Text>
          </View>
          <Text accessibilityRole="header" style={{ color: t.foreground, fontSize: 24, fontWeight: '700', fontFamily: 'Sora_700Bold', marginBottom: 4 }}>Creează cont nou</Text>
          <Text style={{ color: t.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>Alătură-te platformei de zilieri din Timișoara</Text>
        </LinearGradient>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          {/* Role toggle */}
          <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 8, fontFamily: font.heading }}>
            TIPUL CONTULUI
          </Text>
          <View style={styles.roleRow}>
            <Pressable
              style={[styles.roleBtn, { borderColor: role === 'WORKER' ? t.primary : t.border, backgroundColor: role === 'WORKER' ? t.primaryStrong : 'transparent' }]}
              onPress={() => setRole('WORKER')}
              accessibilityRole="button"
              accessibilityState={{ selected: role === 'WORKER' }}
            >
              <User size={16} color={role === 'WORKER' ? t.primaryForeground : t.mutedForeground} strokeWidth={2} />
              <Text style={{ color: role === 'WORKER' ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                Lucrător
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleBtn, { borderColor: role === 'EMPLOYER' ? t.primary : t.border, backgroundColor: role === 'EMPLOYER' ? t.primaryStrong : 'transparent' }]}
              onPress={() => setRole('EMPLOYER')}
              accessibilityRole="button"
              accessibilityState={{ selected: role === 'EMPLOYER' }}
            >
              <Briefcase size={16} color={role === 'EMPLOYER' ? t.primaryForeground : t.mutedForeground} strokeWidth={2} />
              <Text style={{ color: role === 'EMPLOYER' ? t.primaryForeground : t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.sans }}>
                Angajator
              </Text>
            </Pressable>
          </View>

          <Input label="Email" leftIcon={Mail} placeholder="nume@exemplu.ro" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <Input label="Parolă" leftIcon={Key} placeholder="minim 6 caractere" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
          <Input label="Confirmă parola" leftIcon={Key} placeholder="repetă parola" secureTextEntry autoCapitalize="none" value={confirmPassword} onChangeText={setConfirmPassword} />

          {role === 'WORKER' && (
            <>
              <Input label="Nume complet" leftIcon={UserCheck} placeholder="Popescu Ionuț" value={fullName} onChangeText={setFullName} />
              <Input label="Telefon" leftIcon={Phone} placeholder="07xx xxx xxx" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </>
          )}

          {role === 'EMPLOYER' && (
            <>
              <Input label="Nume companie" leftIcon={Building} placeholder="SC Restaurant SRL" value={companyName} onChangeText={setCompanyName} />
              <Input label="CUI (cod fiscal)" leftIcon={ShieldCheck} placeholder="Ex: RO12345678" autoCapitalize="characters" value={cui} onChangeText={setCui} />
              <Input label="Adresă sediu" leftIcon={MapPin} placeholder="Str. Victoriei, Nr. 1" value={address} onChangeText={setAddress} />
            </>
          )}

          <View style={styles.gridRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Județ" placeholder="Timiș" value={county} onChangeText={setCounty} />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input label="Oraș" placeholder="Timișoara" value={city} onChangeText={setCity} />
            </View>
          </View>

          <Button onPress={handleRegister} loading={loading} fullWidth style={{ marginTop: 8 }}>
            Înregistrare
          </Button>
        </View>

        {role === 'WORKER' && (
          <View style={[styles.infoBox, { backgroundColor: t.muted, borderColor: t.border }]}>
            <ShieldCheck size={16} color={t.secondary} strokeWidth={2} />
            <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, flex: 1, lineHeight: 18 }}>
              Datele de identitate (CNP, Serie CI) nu sunt necesare la înregistrare. Le poți adăuga ulterior din profil pentru a aplica la ture.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm }}>Ai deja cont?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}> Conectează-te</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32 },
  header: {
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 28,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(247, 184, 61, 0.15)',
    borderWidth: 1, borderColor: 'rgba(247, 184, 61, 0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    marginTop: 20, marginHorizontal: 24,
    borderWidth: 1, borderRadius: 16, padding: 20, gap: 14,
  },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 10, minHeight: 44 },
  gridRow: { flexDirection: 'row', alignItems: 'flex-end' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginHorizontal: 24, marginTop: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 24 },
});
