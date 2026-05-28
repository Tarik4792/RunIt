import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { addGame } from '../../lib/games';
import { useAuth } from '../../lib/auth';

const SPORTS = ['🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾', '🏉'];
const LEVELS = ['Casual', 'All levels', 'Intermediate', 'Advanced'];
const MAX_PLAYERS = ['4', '6', '8', '10', '12', '14', '16', '20'];
const DAYS = ['Today', 'Tomorrow', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['6:00am', '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm', '7:00pm', '8:00pm', '9:00pm'];
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

async function geocodeLocation(location) {
  try {
    const query = encodeURIComponent(location);
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return { lat: 40.7178, lng: -74.0431 };
}

export default function CreateGame() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const username = 'You';
  const [sport, setSport] = useState('🏀');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState('Today');
  const [time, setTime] = useState('6:00pm');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [level, setLevel] = useState('All levels');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !location.trim()) {
      alert('Please fill in title and location.');
      return;
    }
    try {
      setSaving(true);
      const coords = await geocodeLocation(location.trim());
      await addGame({
        sport,
        title: title.trim(),
        location: location.trim(),
        day,
        time: `${day} ${time}`,
        max_players: parseInt(maxPlayers),
        level,
        host_name: username,
        host_id: profile?.id ?? null,
        players: [],
        lat: coords.lat,
        lng: coords.lng,
      });
      router.back();
    } catch (e) {
      alert('Failed to create game: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Game</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Sport</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SPORTS.map(s => (
            <TouchableOpacity key={s} style={[styles.chip, sport === s && styles.chipActive]} onPress={() => setSport(s)}>
              <Text style={styles.chipEmoji}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Game Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Sunday Hoops" placeholderTextColor="#444" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="e.g. Pershing Field" placeholderTextColor="#444" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {DAYS.map(d => (
            <TouchableOpacity key={d} style={[styles.chip, styles.chipText, day === d && styles.chipActive]} onPress={() => setDay(d)}>
              <Text style={[styles.chipLabel, day === d && styles.chipLabelActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TIMES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, styles.chipText, time === t && styles.chipActive]} onPress={() => setTime(t)}>
              <Text style={[styles.chipLabel, time === t && styles.chipLabelActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Max Players</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {MAX_PLAYERS.map(n => (
            <TouchableOpacity key={n} style={[styles.chip, styles.chipText, maxPlayers === n && styles.chipActive]} onPress={() => setMaxPlayers(n)}>
              <Text style={[styles.chipLabel, maxPlayers === n && styles.chipLabelActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Skill Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {LEVELS.map(l => (
            <TouchableOpacity key={l} style={[styles.chip, styles.chipText, level === l && styles.chipActive]} onPress={() => setLevel(l)}>
              <Text style={[styles.chipLabel, level === l && styles.chipLabelActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={[styles.createBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.createBtnText}>Create — {day} at {time}</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backText: { color: '#00ff87', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: 20 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#111', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#222', marginBottom: 4 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', justifyContent: 'center', alignItems: 'center' },
  chipText: { width: 'auto', paddingHorizontal: 14 },
  chipActive: { backgroundColor: '#00ff87', borderColor: '#00ff87' },
  chipEmoji: { fontSize: 26 },
  chipLabel: { color: '#aaa', fontSize: 14, fontWeight: '600' },
  chipLabelActive: { color: '#000' },
  createBtn: { backgroundColor: '#00ff87', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 32 },
  createBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
