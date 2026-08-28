import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { useZoriFonts } from '@/src/design/fonts';
import { lightTokens, darkTokens } from '@/src/design/tokens';
import { ToastProvider } from '@/src/ui/Toast';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Zori-aware navigation themes (linen / espresso instead of pure white/black).
const ZoriLightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTokens.primary,
    background: lightTokens.background,
    card: lightTokens.card,
    text: lightTokens.foreground,
    border: lightTokens.border,
    notification: lightTokens.primary,
  },
};

const ZoriDarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTokens.primary,
    background: darkTokens.background,
    card: darkTokens.card,
    text: darkTokens.foreground,
    border: darkTokens.border,
    notification: darkTokens.primary,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useZoriFonts();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onRegister = segments[1] === 'register';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (session && inAuthGroup && !onRegister) {
      // Show loading screen while we check the profile and redirect
      setRedirecting(true);
      const checkProfile = async () => {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .maybeSingle();
        if (data) {
          router.replace('/(tabs)');
        } else {
          await supabase.auth.signOut();
        }
        setRedirecting(false);
      };
      checkProfile();
    }
  }, [session, initialized, segments]);

  if (!initialized || redirecting) {
    const t = colorScheme === 'dark' ? darkTokens : lightTokens;
    return (
      <View style={{ flex: 1, backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? ZoriDarkNavTheme : ZoriLightNavTheme}>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
