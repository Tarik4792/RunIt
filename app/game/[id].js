import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { getGame, deleteGame } from '../../lib/games';

const PLAYERS = ['Marcus', 'Jordan', 'Dre', 'Cam', 'Tyler', 'Nate', 'Zion', 'Kev', 'DeShawn', 'Ray', 'Luis', 'Mateo'];

export default function GameDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const base = getGame(id);
  const [joined, setJoined] = useState(false);

  if (!base) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.notFound}>Game not found</Text>
    </SafeAreaView>
  );

  const isHost = base.host === 'You';
  const players = joined ? base.players + 1 : base.players;
  const spots = base.max - players;
  const playerNames = [...PLAYERS.slice(0, base.players), ...(joined ? ['You'] : [])];

  function handleDelete() {
    Alert.alert(
      'Cancel Game',
      'Are you sure you want to cancel this game? All players will be removed.',
      [
        { text: 'Keep Game', style: 'cancel' },
        { text: 'Cancel Game', style: 'destructive', onPress: () => { deleteGame(id); router.back(); } },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {isHost && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>Cancel Game</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.hero}>
          <Text style={styles.sportEmoji}>{base.sport}</Text>
          <Text style={styles.title}>{base.title}</Text>
          <Text style={styles.location}>📍 {base.location} · {base.distance}</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{base.time}</Text>
          </View>
          {isHost && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>You're hosting</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Players</Text>
              <Text style={styles.infoValue}>{players}/{base.max}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Spots Left</Text>
              <Text style={[styles.infoValue, { color: spots <= 2 ? '#ff4444' : '#00ff87' }]}>{spots}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>{base.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{base.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>{base.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosted by</Text>
          <Text style={styles.host}>{base.host}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who's In · {players}</Text>
          <View style={styles.playersGrid}>
            {playerNames.map((name, i) => (
              <View key={i} style={[styles.playerChip, name === 'You' && styles.playerChipYou]}>
                <Text style={[styles.playerText, name === 'You' && styles.playerTextYou]}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {isHost ? (
          <TouchableOpacity style={styles.cancelButton} onPress={handleDelete}>
            <Text style={styles.cancelText}>🗑 Delete Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, joined && styles.leaveButton]}
            onPress={() => setJoined(!joined)}
          >
            <Text style={[styles.joinText, joined && styles.leaveText]}>
              {joined ? "✓ You're In  —  Tap to Leave" : 'Join Game'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 20, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: '#00ff87', fontSize: 16 },
  deleteText: { color: '#ff4444', fontSize: 14 },
  hero: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  sportEmoji: { fontSize: 64, marginBottom: 12 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  location: { color: '#666', fontSize: 14, marginBottom: 12 },
  timeBadge: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  timeText: { color: '#00ff87', fontSize: 14, fontWeight: '600' },
  hostBadge: { backgroundColor: '#1a1a1a', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#00ff87' },
  hostBadgeText: { color: '#00ff87', fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e' },
  infoLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
  infoValue: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  description: { color: '#ccc', fontSize: 15, lineHeight: 22 },
  address: { color: '#ccc', fontSize: 15 },
  host: { color: '#00ff87', fontSize: 15, fontWeight: '600' },
  playersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip: { backgroundColor: '#1a1a1a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  playerChipYou: { backgroundColor: '#003d20', borderColor: '#00ff87' },
  playerText: { color: '#ffffff', fontSize: 13 },
  playerTextYou: { color: '#00ff87', fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  joinButton: { backgroundColor: '#00ff87', borderRadius: 14, padding: 16, alignItems: 'center' },
  leaveButton: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  joinText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
  leaveText: { color: '#666' },
  cancelButton: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444' },
  cancelText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
  notFound: { color: '#fff', textAlign: 'center', marginTop: 100 },
});
