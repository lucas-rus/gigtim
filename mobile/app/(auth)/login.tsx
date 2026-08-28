import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Key, LogIn, Sparkles, ChevronRight } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing } from '@/src/design/useTheme';
import { Input, Button, toast } from '@/src/ui';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const t = useZoriTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.error('Te rugăm să completezi toate câmpurile.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = authError.message === 'Invalid login credentials'
          ? 'Datele de conectare sunt incorecte.'
          : authError.message === 'Email not confirmed'
          ? 'Confirmă mai întâi emailul. Verifică și folderul Spam.'
          : authError.message;
        toast.error(msg);
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      toast.error(e.message || 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: t.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Compact hero header */}
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
          <Text accessibilityRole="header" style={{ color: t.foreground, fontSize: 24, fontWeight: '700', fontFamily: 'Sora_700Bold', marginBottom: 4 }}>
            Bine ai venit înapoi
          </Text>
          <Text style={{ color: t.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
            Conectează-te pentru a continua
          </Text>
        </LinearGradient>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Input
            label="Email"
            leftIcon={Mail}
            placeholder="nume@exemplu.ro"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Parolă"
            leftIcon={Key}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <Button onPress={handleLogin} loading={loading} fullWidth leftIcon={LogIn} style={{ marginTop: 4 }}>
            Conectare
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ color: t.mutedForeground, fontSize: fontSize.sm }}>Nu ai cont?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={{ color: t.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              {' '}Creează un cont nou
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 24, marginBottom: 32,
  },
});
