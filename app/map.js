import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { getGames } from '../lib/games';

const FILTERS = ['All', '🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾'];
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export default function MapScreen() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);

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

  useEffect(() => {
    const handler = (e) => {
      try {
        const game = JSON.parse(e.data);
        if (game && game.id) setSelected(game);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const filtered = activeFilter === 'All' ? games : games.filter(g => g.sport === activeFilter);

  const mapHTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#111; }
#map { width:100vw; height:100vh; }
.marker { background:#00ff87; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; border:2px solid #000; box-shadow:0 2px 12px rgba(0,255,135,0.5); cursor:pointer; }
</style>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
</head>
<body>
<div id="map"></div>
<script>
mapboxgl.accessToken = '${MAPBOX_TOKEN}';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-74.0431, 40.7178],
  zoom: 13,
  pitch: 45,
  bearing: -10
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 12,
    paint: {
      'fill-extrusion-color': '#1a1a2e',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.8
    }
  });

  const games = ${JSON.stringify(filtered)};
  games.forEach(function(game, i) {
    const lat = 40.7178 + (i % 3) * 0.012 - 0.012;
    const lng = -74.0431 + (i % 2) * 0.018 - 0.009;
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = game.sport || '🏃';
    el.addEventListener('click', function() {
      parent.postMessage(JSON.stringify(game), '*');
    });
    new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
  });
});
</script>
</body>
</html>`;

  const blob = typeof Blob !== 'undefined' ? new Blob([mapHTML], { type: 'text/html' }) : null;
  const blobUrl = blob ? URL.createObjectURL(blob) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
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
      ) : (
        <View style={{ flex: 1 }}>
          {Platform.OS === 'web' && blobUrl && (
            <iframe
              src={blobUrl}
              style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
            />
          )}

          {selected && (
            <View style={styles.gameCard}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{selected.sport}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{selected.title}</Text>
                  <Text style={styles.cardLocation}>📍 {selected.location}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{selected.time}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardMeta}>{selected.level}</Text>
                <Text style={styles.cardMeta}>{selected.max_players} max</Text>
              </View>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => { setSelected(null); router.push(`/game/${selected.id}`); }}
              >
                <Text style={styles.viewBtnText}>View Game →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  filterChipActive: { backgroundColor: '#00ff87' },
  filterText: { color: '#aaa', fontSize: 14 },
  filterTextActive: { color: '#000', fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: '#222' },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardLocation: { color: '#888', fontSize: 13, marginTop: 2 },
  timeBadge: { backgroundColor: '#1a1a2e', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  timeBadgeText: { color: '#00ff87', fontSize: 12, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  cardMeta: { color: '#666', fontSize: 12 },
  viewBtn: { backgroundColor: '#00ff87', borderRadius: 12, padding: 14, alignItems: 'center' },
  viewBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
});
