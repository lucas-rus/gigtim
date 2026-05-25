import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MapPin, Calendar, MessageSquare, MessageCircle, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e5c158', // Warm Gold/Amber tint
        tabBarInactiveTintColor: '#64748b', // Slate gray
        tabBarStyle: {
          backgroundColor: '#0a0f1d', // Dark bottom bar
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0a0f1d',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '700',
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hartă Ture',
          headerTitle: 'Explorează Ture',
          tabBarLabel: 'Hartă',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Turele Mele',
          headerTitle: 'Ture și Aplicații',
          tabBarLabel: 'Aplicații',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum Zilieri',
          headerTitle: 'Discuții Comunitate',
          tabBarLabel: 'Forum',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Mesaje',
          headerTitle: 'Chat Angajatori',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilul Meu',
          headerTitle: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
