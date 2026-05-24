import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getGames } from '../lib/games';
import { getSession, signOut } from '../lib/auth';

const FILTERS = ['All', '🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾', '🏉'];

export default function Home() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        const s = await getSession();
        if (!s) { router.replace('/auth'); return; }
        const data = await getGames();
        setGames(data);
        setLoading(false);
      }
      load();
    }, [])
  );

  async function handleSignOut() {
    if (confirm('Sign out?')) {
      await signOut();
      router.replace('/auth');
    }
  }

  const filtered = activeFilter === 'All' ? games : games.filter(g => g.sport === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.location}>📍 Jersey City, NJ</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/game/create')}>
            <Text style={styles.createButtonText}>+ Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Games Near You</Text>
        {loading ? (
          <ActivityIndicator color="#00ff87" style={{ marginTop: 60 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No games nearby for this sport</Text>
        ) : (
          filtered.map((game) => (
            <TouchableOpacity key={game.id} style={styles.card} onPress={() => router.push(`/game/${game.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.sportEmoji}>{game.sport}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{game.title}</Text>
                  <Text style={styles.cardLocation}>{game.location}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{game.time}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.levelText}>{game.level}</Text>
                <View style={styles.playersRow}>
                  <Text style={styles.playersText}>{game.players}/{game.max} players</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(game.players / game.max) * 100}%` }]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  location: { color: '#666', fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createButton: { backgroundColor: '#00ff87', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 14 },
  signOutButton: { paddingHorizontal: 10, paddingVertical: 8 },
  signOutText: { color: '#666', fontSize: 13 },
  filterWrapper: { height: 48, marginBottom: 8 },
  filterRow: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterChip: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  filterChipActive: { backgroundColor: '#00ff87', borderColor: '#00ff87' },
  filterText: { color: '#ffffff', fontSize: 13 },
  filterTextActive: { color: '#0a0a0a', fontWeight: '700' },
  feed: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sportEmoji: { fontSize: 32, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  cardLocation: { color: '#666', fontSize: 13, marginTop: 2 },
  timeBadge: { backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  timeText: { color: '#00ff87', fontSize: 12, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelText: { color: '#666', fontSize: 12 },
  playersRow: { alignItems: 'flex-end' },
  playersText: { color: '#999', fontSize: 12, marginBottom: 4 },
  progressBar: { width: 80, height: 4, backgroundColor: '#1e1e1e', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#00ff87', borderRadius: 2 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
