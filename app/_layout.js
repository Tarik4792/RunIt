import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/AuthProvider';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'auth';
    const isPublicPage = segments[0] === 'support' || segments[0] === 'privacy';
    if (!user && !inAuthGroup && !isPublicPage) router.replace('/login');
    if (user && inAuthGroup) router.replace('/');
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="auth/index" />
      <Stack.Screen name="username" />
      <Stack.Screen name="index" />
      <Stack.Screen name="map" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="support" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="game/[id]" />
      <Stack.Screen name="game/create" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
