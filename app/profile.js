import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useState, useCallback } from 'react';
import { getGames } from '../lib/games';

export default function Profile() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          setLoading(true);
          const data = await getGames();
          setGames(data.filter(g => g.host_name === 'You'));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [])
  );

  const sportCounts = games.reduce((acc, g) => {
    acc[g.sport] = (acc[g.sport] || 0) + 1;
    return acc;
  }, {});

  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '🏃';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>T</Text>
          </View>
          <Text style={styles.name}>Tarik</Text>
          <Text style={styles.location}>📍 Jersey City, NJ</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{games.length}</Text>
            <Text style={styles.statLabel}>Games Hosted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Object.keys(sportCounts).length}</Text>
            <Text style={styles.statLabel}>Sports</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{topSport}</Text>
            <Text style={styles.statLabel}>Top Sport</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Games</Text>
            <TouchableOpacity onPress={() => router.push('/game/create')}>
              <Text style={styles.newGameLink}>+ New</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#00ff87" style={{ marginTop: 24 }} />
          ) : games.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No games yet</Text>
              <Text style={styles.emptySubText}>Create your first game!</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/game/create')}>
                <Text style={styles.createBtnText}>+ Create Game</Text>
              </TouchableOpacity>
            </View>
          ) : (
            games.map(game => {
              const players = game.players?.length ?? 0;
              const spotsLeft = game.max_players - players;
              return (
                <TouchableOpacity key={game.id} style={styles.card} onPress={() => router.push(`/game/${game.id}`)}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardEmoji}>{game.sport}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{game.title}</Text>
                      <Text style={styles.cardLocation}>📍 {game.location}</Text>
                    </View>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{game.time}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.cardMeta}>{game.level}</Text>
                    <Text style={styles.cardMeta}>{players}/{game.max_players} players</Text>
                    <Text style={[styles.cardMeta, spotsLeft <= 2 && { color: '#ff4444' }]}>{spotsLeft} spots left</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#000' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  location: { color: '#888', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  newGameLink: { color: '#00ff87', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#888', fontSize: 14, marginTop: 6 },
  createBtn: { marginTop: 20, backgroundColor: '#00ff87', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  createBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardLocation: { color: '#888', fontSize: 13, marginTop: 2 },
  timeBadge: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  timeBadgeText: { color: '#00ff87', fontSize: 12, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  signOutBtn: { marginTop: 12, borderWidth: 1, borderColor: "#ff4444", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  signOutText: { color: "#ff4444", fontSize: 13, fontWeight: "600" },
  cardMeta: { color: '#666', fontSize: 12 },
});
