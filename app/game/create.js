import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { addGame } from '../../lib/games';
import { getSession, getProfile } from '../../lib/auth';

const SPORTS = ['🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾', '🏉'];
const LEVELS = ['Casual', 'All levels', 'Intermediate', 'Advanced'];
const MAX_PLAYERS = ['4', '6', '8', '10', '12', '14', '16', '18', '20', '22'];
const DAYS = ['Today', 'Tomorrow', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['6:00am','7:00am','8:00am','9:00am','10:00am','11:00am','12:00pm','1:00pm','2:00pm','3:00pm','4:00pm','5:00pm','6:00pm','7:00pm','8:00pm','9:00pm'];

export default function CreateGame() {
  const router = useRouter();
  const [sport, setSport] = useState('🏀');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState('Today');
  const [time, setTime] = useState('5:00pm');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [level, setLevel] = useState('All levels');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title || !location) { Alert.alert('Fill in title and location'); return; }
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) { Alert.alert('Not logged in', 'Please sign in first'); router.replace('/auth'); return; }
      const profile = await getProfile(session.user.id);
      await addGame({ sport, title, location, time: `${day} ${time}`, max: parseInt(maxPlayers), level, hostId: session.user.id, hostName: profile.username });
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Game</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Sport</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SPORTS.map((s) => (
            <TouchableOpacity key={s} style={[styles.sportChip, sport === s && styles.sportChipActive]} onPress={() => setSport(s)}>
              <Text style={styles.sportEmoji}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Game Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Sunday Hoops" placeholderTextColor="#444" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="e.g. Rucker Park" placeholderTextColor="#444" value={location} onChangeText={setLocation} />
        <Text style={styles.label}>Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {DAYS.map((d) => (
            <TouchableOpacity key={d} style={[styles.chip, day === d && styles.chipActive]} onPress={() => setDay(d)}>
              <Text style={[styles.chipText, day === d && styles.chipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TIMES.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, time === t && styles.chipActive]} onPress={() => setTime(t)}>
              <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Max Players</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {MAX_PLAYERS.map((n) => (
            <TouchableOpacity key={n} style={[styles.chip, maxPlayers === n && styles.chipActive]} onPress={() => setMaxPlayers(n)}>
              <Text style={[styles.chipText, maxPlayers === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Skill Level</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l} style={[styles.levelChip, level === l && styles.chipActive]} onPress={() => setLevel(l)}>
              <Text style={[styles.chipText, level === l && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#0a0a0a" /> : <Text style={styles.createText}>{sport} Create Game · {day} {time}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backText: { color: '#00ff87', fontSize: 16, width: 60 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  label: { color: '#666', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 24 },
  input: { backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e1e', color: '#ffffff', fontSize: 15, padding: 14 },
  chipRow: { gap: 8, paddingBottom: 4 },
  sportChip: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  sportChipActive: { borderColor: '#00ff87', backgroundColor: '#003d20' },
  sportEmoji: { fontSize: 28 },
  chip: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  chipActive: { backgroundColor: '#00ff87', borderColor: '#00ff87' },
  chipText: { color: '#ffffff', fontSize: 13 },
  chipTextActive: { color: '#0a0a0a', fontWeight: '700' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  createButton: { backgroundColor: '#00ff87', borderRadius: 14, padding: 16, alignItems: 'center' },
  createText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
});
