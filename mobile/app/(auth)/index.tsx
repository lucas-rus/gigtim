import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, MapPin, ShieldCheck, Star, Zap, ArrowRight, Users, Briefcase, ChevronRight } from 'lucide-react-native';
import { useZoriTheme, font, fontSize, fontWeight, spacing, radius } from '@/src/design/useTheme';
import { Button } from '@/src/ui';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingScreen() {
  const router = useRouter();
  const t = useZoriTheme();
  const { height } = useWindowDimensions();

  const isDark = t.scheme === 'dark';
  const heroTextColor = isDark ? '#F6F1EB' : '#221812';
  const heroSubColor = isDark ? '#F7B83D' : '#E14D28';
  const heroDescColor = isDark ? 'rgba(246, 241, 235, 0.65)' : '#6B6159';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero — clean two-tone gradient, not the muddy three-color one */}
      <LinearGradient
        colors={isDark
          ? ['#1C1612', '#120C09']
          : ['#FFFBF6', '#F7F1E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          {/* Logo badge with ember accent */}
          <View style={styles.logoBadge}>
            <Sparkles size={26} color="#F7B83D" strokeWidth={2} />
          </View>
          <Text style={[styles.heroTitle, { color: heroTextColor }]}>GigTim</Text>
          <Text style={[styles.heroSubtitle, { color: heroSubColor }]}>Ture rapide în Timișoara</Text>
          <Text style={[styles.heroDescription, { color: heroDescColor }]}>
            Platforma de zilieri pentru HoReCa. Găsește lucrări de o zi sau angajează personal, conform Legii 52/2011.
          </Text>

          {/* CTA buttons inline in the hero — no scrolling needed */}
          <View style={{ marginTop: 28, gap: 10, width: '100%' }}>
            <Pressable
              style={styles.primaryCTA}
              onPress={() => router.push('/(auth)/login')}
              accessibilityRole="button"
            >
              <Text style={styles.primaryCTAText}>Conectează-te</Text>
              <ArrowRight size={18} color="#FFFBF6" strokeWidth={2.5} />
            </Pressable>
            <Pressable
              style={styles.secondaryCTA}
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryCTAText}>Creează cont nou</Text>
              <ChevronRight size={16} color={heroSubColor} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Feature highlights — compact, scannable */}
      <View style={{ padding: 20, gap: 16, paddingTop: 24 }}>
        <FeatureRow icon={MapPin} title="Hartă live" description="Ture disponibile în zona ta" t={t} />
        <FeatureRow icon={Zap} title="Aplicare instant" description="Răspuns în câteva minute" t={t} />
        <FeatureRow icon={ShieldCheck} title="Conform Legea 52/2011" description="Registrul ITM automat" t={t} />
        <FeatureRow icon={Star} title="Recenzii și reputație" description="Scor de fiabilitate verificat" t={t} />
      </View>

      {/* Role cards */}
      <View style={{ padding: 20, paddingTop: 4, gap: 12 }}>
        <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, fontFamily: font.heading, textAlign: 'center', letterSpacing: 1, marginBottom: 4 }}>
          ALEGE ROLUL TĂU
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <RoleCard icon={Users} title="Lucrător" description="Găsește ture plătite" t={t} />
          <RoleCard icon={Briefcase} title="Angajator" description="Postează și primește aplicări" t={t} />
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FeatureRow({ icon: Icon, title, description, t }: { icon: any; title: string; description: string; t: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: t.muted, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: t.border,
      }}>
        <Icon size={20} color={t.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.foreground, fontSize: fontSize.sm, fontWeight: fontWeight.bold, fontFamily: font.heading }}>
          {title}
        </Text>
        <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, lineHeight: 16, fontFamily: font.sans }}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function RoleCard({ icon: Icon, title, description, t }: { icon: any; title: string; description: string; t: any }) {
  return (
    <View style={{
      flex: 1, backgroundColor: t.card, borderRadius: radius.lg, padding: 16,
      borderWidth: 1, borderColor: t.border, gap: 8,
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: t.primary, justifyContent: 'center', alignItems: 'center',
      }}>
        <Icon size={18} color={t.primaryForeground} strokeWidth={2} />
      </View>
      <Text style={{ color: t.foreground, fontSize: fontSize.base, fontWeight: fontWeight.bold, fontFamily: font.heading }}>
        {title}
      </Text>
      <Text style={{ color: t.mutedForeground, fontSize: fontSize.xs, lineHeight: 16, fontFamily: font.sans }}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(247, 184, 61, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(247, 184, 61, 0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Sora_700Bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    maxWidth: 280,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E14D28',
    borderRadius: 14,
    height: 52,
    width: '100%',
  },
  primaryCTAText: {
    color: '#FFFBF6',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_600SemiBold',
  },
  secondaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(247, 184, 61, 0.4)',
    borderRadius: 14,
    height: 48,
    width: '100%',
  },
  secondaryCTAText: {
    color: '#F7B83D',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
