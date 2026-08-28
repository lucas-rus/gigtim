import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MapPin, Calendar, MessageSquare, MessageCircle, User, Briefcase } from 'lucide-react-native';
import { useZoriTheme } from '@/src/design/useTheme';
import { supabase } from '@/lib/supabase';

export default function TabLayout() {
  const t = useZoriTheme();
  const [showIdentityBadge, setShowIdentityBadge] = useState(false);

  useEffect(() => {
    checkIdentityVerification();
  }, []);

  async function checkIdentityVerification() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userRow } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', user.id)
        .maybeSingle();
      if (!userRow || userRow.role !== 'WORKER') return;

      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('cnp, id_card_series')
        .eq('user_id', userRow.id)
        .maybeSingle();

      // Show badge if identity not yet verified
      setShowIdentityBadge(!workerProfile?.cnp || !workerProfile?.id_card_series);
    } catch (e) {
      // Silently fail — don't block the tab bar
    }
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.mutedForeground,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopWidth: 1,
          borderTopColor: t.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: t.card,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        },
        headerTintColor: t.foreground,
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '700',
          fontFamily: 'Sora',
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ture',
          headerTitle: 'Explorează Ture',
          tabBarLabel: 'Hartă',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Aplicații',
          headerTitle: 'Turele Mele',
          tabBarLabel: 'Aplicații',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          headerTitle: 'Discuții Comunitate',
          tabBarLabel: 'Forum',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Mesaje',
          headerTitle: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerTitle: 'Profilul Meu',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <View>
              <User size={size} color={color} />
              {showIdentityBadge && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -6,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: t.accent,
                    borderWidth: 1.5,
                    borderColor: t.card,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
