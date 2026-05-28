import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!user && !inAuthGroup) router.replace('/auth');
    if (user && inAuthGroup) router.replace('/');
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/index" />
      <Stack.Screen name="index" />
      <Stack.Screen name="map" />
      <Stack.Screen name="profile" />
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
