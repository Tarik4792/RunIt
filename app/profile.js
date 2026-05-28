import BottomNav from '../components/BottomNav';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getGames } from '../lib/games';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hostedGames, setHostedGames] = useState([]);
  const [joinedGames, setJoinedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        const all = await getGames();
        setHostedGames(all.filter(g => g.host_id === user?.id));
        setJoinedGames(all.filter(g => g.players?.includes(user?.id) && g.host_id !== user?.id));
        setLoading(false);
      }
      load();
    }, [])
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator color="#00ff87" size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.joined}>Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{hostedGames.length}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{joinedGames.length}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{hostedGames.length + joinedGames.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Hosted Games */}
        <Text style={styles.sectionTitle}>Games You're Hosting</Text>
        {hostedGames.length === 0 ? (
          <Text style={styles.empty}>No hosted games yet</Text>
        ) : hostedGames.map(g => (
          <TouchableOpacity key={g.id} style={styles.gameCard} onPress={() => router.push(`/game/${g.id}`)}>
            <Text style={styles.gameEmoji}>{g.sport}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{g.title}</Text>
              <Text style={styles.gameSub}>{g.location} · {g.time}</Text>
            </View>
            <Text style={styles.gameChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Joined Games */}
        <Text style={styles.sectionTitle}>Games You've Joined</Text>
        {joinedGames.length === 0 ? (
          <Text style={styles.empty}>No joined games yet</Text>
        ) : joinedGames.map(g => (
          <TouchableOpacity key={g.id} style={styles.gameCard} onPress={() => router.push(`/game/${g.id}`)}>
            <Text style={styles.gameEmoji}>{g.sport}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{g.title}</Text>
              <Text style={styles.gameSub}>{g.location} · {g.time}</Text>
            </View>
            <Text style={styles.gameChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#000' },
  email: { color: '#fff', fontSize: 16, fontWeight: '600' },
  joined: { color: '#555', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: '#111', marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#222' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: '#00ff87', fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#555', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#222' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 10 },
  empty: { color: '#444', fontSize: 14, paddingHorizontal: 16, marginBottom: 24 },
  gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 },
  gameEmoji: { fontSize: 24 },
  gameTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  gameSub: { color: '#555', fontSize: 12, marginTop: 2 },
  gameChevron: { color: '#444', fontSize: 22 },
  signOutBtn: { margin: 16, marginTop: 32, backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  signOutText: { color: '#ff4444', fontWeight: '600', fontSize: 15 },
});
