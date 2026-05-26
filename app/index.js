import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getGames } from '../lib/games';

const FILTERS = ['All', '🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾'];

export default function Home() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          setLoading(true);
          const data = await getGames();
          setGames(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, [])
  );

  const filtered = activeFilter === 'All' ? games : games.filter(g => g.sport === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Let's run it 🔥</Text>
          <Text style={styles.location}>📍 Jersey City, NJ</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/game/create')}>
          <Text style={styles.addBtnText}>+ Game</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 48, alignItems: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00ff87" size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No games found</Text>
          <Text style={styles.emptySubText}>Be the first — create one!</Text>
        </View>
      ) : (
        <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
          {filtered.map(game => {
            const isCancelled = game.status === 'cancelled';
            const players = game.players?.length ?? 0;
            const spotsLeft = game.max_players - players;
            const pct = Math.round((players / game.max_players) * 100);
            return (
              <TouchableOpacity
                key={game.id}
                style={[styles.card, isCancelled && styles.cardCancelled]}
                onPress={() => router.push(`/game/${game.id}`)}
              >
                {isCancelled && (
                  <View style={styles.cancelledBanner}>
                    <Text style={styles.cancelledBannerText}>❌ CANCELLED{game.cancel_reason ? ` · ${game.cancel_reason}` : ''}</Text>
                  </View>
                )}
                <View style={[styles.cardTop, isCancelled && { opacity: 0.5 }]}>
                  <Text style={styles.cardEmoji}>{game.sport}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isCancelled && styles.cardTitleCancelled]}>{game.title}</Text>
                    <Text style={styles.cardLocation}>📍 {game.location}</Text>
                  </View>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>{game.time}</Text>
                  </View>
                </View>
                {!isCancelled && (
                  <>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardMeta}>{game.level}</Text>
                      <Text style={styles.cardMeta}>{players}/{game.max_players} players</Text>
                      <Text style={[styles.cardMeta, spotsLeft <= 2 && { color: '#ff4444' }]}>{spotsLeft} spots left</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700' },
  location: { color: '#888', fontSize: 13, marginTop: 2 },
  addBtn: { backgroundColor: '#00ff87', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  filterChipActive: { backgroundColor: '#00ff87' },
  filterText: { color: '#aaa', fontSize: 14 },
  filterTextActive: { color: '#000', fontWeight: '700' },
  feed: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#888', fontSize: 14, marginTop: 6 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
  cardCancelled: { borderColor: '#ff4444', backgroundColor: '#0d0000' },
  cancelledBanner: { backgroundColor: '#1a0000', borderRadius: 8, padding: 8, marginBottom: 10, alignItems: 'center' },
  cancelledBannerText: { color: '#ff4444', fontSize: 12, fontWeight: '700' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardTitleCancelled: { textDecorationLine: 'line-through', color: '#888' },
  cardLocation: { color: '#888', fontSize: 13, marginTop: 2 },
  timeBadge: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  timeBadgeText: { color: '#00ff87', fontSize: 12, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardMeta: { color: '#666', fontSize: 12 },
  progressBg: { height: 4, backgroundColor: '#222', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#00ff87', borderRadius: 2 },
});
