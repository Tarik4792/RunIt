import BottomNav from '../components/BottomNav';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { getGames } from '../lib/games';
import * as Location from 'expo-location';

const MapView = Platform.OS !== 'web' ? require('react-native-maps').default : null;
const { Marker, Callout } = Platform.OS !== 'web' ? require('react-native-maps') : {};

const FILTERS = ['All', '🏀', '⚽', '🏈', '🎾', '🏐', '🏒', '⚾'];
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const PLACES_API = 'https://runit-navy.vercel.app/api/places';

const DEFAULT_REGION = {
  latitude: 40.7178,
  longitude: -74.0431,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const router = useRouter();
  const iframeRef = useRef(null);
  const mapRef = useRef(null);

  const [games, setGames] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [venueLoading, setVenueLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [venueType, setVenueType] = useState('All');
  const [selected, setSelected] = useState(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  // Get user location on mount
  useEffect(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // Load games
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

  // Load gyms and fields when venueType or region changes (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (venueType === 'Games') { setGyms([]); setFields([]); return; }

    async function loadVenues() {
      setVenueLoading(true);
      const { latitude: lat, longitude: lng } = region;
      try {
        if (venueType === 'All' || venueType === 'Gyms') {
          const r = await fetch(`${PLACES_API}?lat=${lat}&lng=${lng}&radius=5000&type=gym&keyword=gym+fitness+sports`);
          const d = await r.json();
          setGyms(d.results || []);
        } else {
          setGyms([]);
        }
        if (venueType === 'All' || venueType === 'Fields') {
          const r = await fetch(`${PLACES_API}?lat=${lat}&lng=${lng}&radius=5000&type=park&keyword=sports+field+court`);
          const d = await r.json();
          setFields(d.results || []);
        } else {
          setFields([]);
        }
      } catch (e) {
        console.error('Venue load error:', e);
      } finally {
        setVenueLoading(false);
      }
    }
    loadVenues();
  }, [venueType, region.latitude, region.longitude]);

  // Web: listen for iframe pin taps
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && (payload.id || payload.place_id)) setSelected(payload);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const sendDataToIframe = useCallback(() => {
    if (Platform.OS !== 'web' || !iframeRef.current) return;
    const filtered = (activeFilter === 'All' ? games : games.filter(g => g.sport === activeFilter))
      .filter(g => g.status !== 'cancelled');
    iframeRef.current.contentWindow?.postMessage(JSON.stringify({ type: 'INIT', games: filtered, venueType }), '*');
  }, [games, activeFilter, venueType]);

  const filtered = (activeFilter === 'All' ? games : games.filter(g => g.sport === activeFilter))
    .filter(g => g.status !== 'cancelled');

  const mapHTML = Platform.OS === 'web' ? `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#111; }
#map { width:100vw; height:100vh; }
.marker-game { background:#00ff87; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; border:2.5px solid #000; box-shadow:0 2px 12px rgba(0,255,135,0.5); cursor:pointer; transition:transform 0.15s; }
.marker-game:hover { transform:scale(1.15); }
.marker-gym { background:#818cf8; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:17px; border:2.5px solid #fff; box-shadow:0 2px 10px rgba(129,140,248,0.5); cursor:pointer; transition:transform 0.15s; }
.marker-gym:hover { transform:scale(1.15); }
.marker-field { background:#f59e0b; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:17px; border:2.5px solid #fff; box-shadow:0 2px 10px rgba(245,158,11,0.5); cursor:pointer; transition:transform 0.15s; }
.marker-field:hover { transform:scale(1.15); }
#legend { position:absolute; bottom:24px; left:14px; background:rgba(0,0,0,0.78); border-radius:10px; padding:10px 14px; display:flex; flex-direction:column; gap:7px; pointer-events:none; }
.leg-row { display:flex; align-items:center; gap:8px; font-size:12px; color:#ccc; font-family:sans-serif; }
.leg-dot { width:13px; height:13px; border-radius:50%; flex-shrink:0; }
.leg-sq { width:13px; height:13px; border-radius:3px; flex-shrink:0; }
.leg-label { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px; font-family:sans-serif; }
</style>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
</head>
<body>
<div id="map"></div>
<div id="legend">
  <div class="leg-label">Legend</div>
  <div class="leg-row"><div class="leg-dot" style="background:#00ff87;"></div>Live game</div>
  <div class="leg-row"><div class="leg-sq" style="background:#818cf8;"></div>Gym</div>
  <div class="leg-row"><div class="leg-sq" style="background:#f59e0b;"></div>Outdoor field</div>
</div>
<script>
mapboxgl.accessToken = '${MAPBOX_TOKEN}';
const map = new mapboxgl.Map({ container:'map', style:'mapbox://styles/mapbox/satellite-streets-v12', center:[-74.0431,40.7178], zoom:13, pitch:45, bearing:-10 });
map.addControl(new mapboxgl.NavigationControl());
const gameMarkers=[],venueMarkers=[];
function clearMarkers(arr){arr.forEach(m=>m.remove());arr.length=0;}
function addGamePin(game){
  const lat=game.lat||40.7178+(Math.random()-0.5)*0.04,lng=game.lng||-74.0431+(Math.random()-0.5)*0.04;
  const el=document.createElement('div');el.className='marker-game';el.innerHTML=game.sport||'🏃';
  el.addEventListener('click',()=>parent.postMessage(JSON.stringify(game),'*'));
  gameMarkers.push(new mapboxgl.Marker(el).setLngLat([lng,lat]).addTo(map));
}
function addVenuePin(place,kind){
  const lat=place.geometry.location.lat,lng=place.geometry.location.lng;
  const el=document.createElement('div');el.className=kind==='gym'?'marker-gym':'marker-field';
  el.innerHTML=kind==='gym'?'🏋️':'🏟️';
  el.addEventListener('click',()=>parent.postMessage(JSON.stringify({place_id:place.place_id,kind,name:place.name,vicinity:place.vicinity,rating:place.rating,open_now:place.opening_hours?place.opening_hours.open_now:null,lat,lng}),'*'));
  venueMarkers.push(new mapboxgl.Marker(el).setLngLat([lng,lat]).addTo(map));
}
map.on('load',function(){
  map.addLayer({id:'3d-buildings',source:'composite','source-layer':'building',filter:['==','extrude','true'],type:'fill-extrusion',minzoom:12,paint:{'fill-extrusion-color':'#1a1a2e','fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','min_height'],'fill-extrusion-opacity':0.8}});
});
const seen=new Set();
async function loadVenuesAtCenter(lat,lng,venueTypeRef){
  if(venueTypeRef==='All'||venueTypeRef==='Gyms'){
    const r=await fetch('https://runit-navy.vercel.app/api/places?lat='+lat+'&lng='+lng+'&radius=5000&type=gym&keyword=gym+fitness+sports');
    const d=await r.json();(d.results||[]).forEach(p=>{if(!seen.has(p.place_id)){seen.add(p.place_id);addVenuePin(p,'gym');}});
  }
  if(venueTypeRef==='All'||venueTypeRef==='Fields'){
    const r=await fetch('https://runit-navy.vercel.app/api/places?lat='+lat+'&lng='+lng+'&radius=5000&type=park&keyword=sports+field+court');
    const d=await r.json();(d.results||[]).forEach(p=>{if(!seen.has(p.place_id)){seen.add(p.place_id);addVenuePin(p,'field');}});
  }
}
window.addEventListener('message',async function(e){
  try{
    const msg=JSON.parse(e.data);if(msg.type!=='INIT')return;
    clearMarkers(gameMarkers);clearMarkers(venueMarkers);seen.clear();
    const{games,venueType}=msg;
    if(venueType==='All'||venueType==='Games')games.forEach(addGamePin);
    const center=map.getCenter();
    await loadVenuesAtCenter(center.lat,center.lng,venueType);
    map.on('moveend',async function(){const c=map.getCenter();await loadVenuesAtCenter(c.lat,c.lng,venueType);});
  }catch(err){console.error('iframe error',err);}
});
</script>
</body>
</html>` : null;

  const blobUrl = Platform.OS === 'web' && typeof Blob !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(new Blob([mapHTML], { type: 'text/html' }))
    : null;

  const isVenue = selected && selected.place_id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/game/create')}>
          <Text style={styles.addBtnText}>+ Game</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 48, alignItems: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.venueTabRow}>
        {['All', 'Games', 'Gyms', 'Fields'].map(t => (
          <TouchableOpacity key={t} style={[styles.venueTab, venueType === t && styles.venueTabActive]} onPress={() => { setVenueType(t); setSelected(null); }}>
            <Text style={[styles.venueTabText, venueType === t && styles.venueTabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#00ff87" size="large" /></View>
      ) : (
        <View style={{ flex: 1 }}>

          {/* WEB: Mapbox iframe */}
          {Platform.OS === 'web' && blobUrl && (
            <iframe ref={iframeRef} src={blobUrl} style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} onLoad={sendDataToIframe} />
          )}

          {/* NATIVE: Apple Maps via react-native-maps */}
          {Platform.OS !== 'web' && MapView && (
            <View style={{ flex: 1 }}>
              <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={region}
                region={region}
                showsUserLocation
                showsMyLocationButton
                onRegionChangeComplete={(r) => setRegion(r)}
              >
                {/* Game pins */}
                {(venueType === 'All' || venueType === 'Games') && filtered.map(game => (
                  game.lat && game.lng ? (
                    <Marker
                      key={game.id}
                      coordinate={{ latitude: game.lat, longitude: game.lng }}
                      onPress={() => setSelected(game)}
                      pinColor="#00ff87"
                    >
                      <View style={styles.gamePin}>
                        <Text style={styles.gamePinText}>{game.sport || '🏃'}</Text>
                      </View>
                    </Marker>
                  ) : null
                ))}

                {/* Gym pins */}
                {(venueType === 'All' || venueType === 'Gyms') && gyms.map(gym => (
                  <Marker
                    key={gym.place_id}
                    coordinate={{ latitude: gym.geometry.location.lat, longitude: gym.geometry.location.lng }}
                    onPress={() => setSelected({ ...gym, kind: 'gym' })}
                  >
                    <View style={styles.gymPin}>
                      <Text style={styles.venuePinText}>🏋️</Text>
                    </View>
                  </Marker>
                ))}

                {/* Field pins */}
                {(venueType === 'All' || venueType === 'Fields') && fields.map(field => (
                  <Marker
                    key={field.place_id}
                    coordinate={{ latitude: field.geometry.location.lat, longitude: field.geometry.location.lng }}
                    onPress={() => setSelected({ ...field, kind: 'field' })}
                  >
                    <View style={styles.fieldPin}>
                      <Text style={styles.venuePinText}>🏟️</Text>
                    </View>
                  </Marker>
                ))}
              </MapView>

              {venueLoading && (
                <View style={styles.venueLoadingBadge}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.venueLoadingText}>Loading venues...</Text>
                </View>
              )}
            </View>
          )}

          {/* Game card popup */}
          {selected && !isVenue && (
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
              <TouchableOpacity style={styles.viewBtn} onPress={() => { setSelected(null); router.push('/game/' + selected.id); }}>
                <Text style={styles.viewBtnText}>View Game →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Venue card popup */}
          {selected && isVenue && (
            <View style={styles.gameCard}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{selected.kind === 'gym' ? '🏋️' : '🏟️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{selected.name}</Text>
                  <Text style={styles.cardLocation}>📍 {selected.vicinity}</Text>
                </View>
                <View style={[styles.timeBadge, { backgroundColor: selected.kind === 'gym' ? '#1e1b4b' : '#1c1200', borderColor: selected.kind === 'gym' ? '#4338ca' : '#b45309' }]}>
                  <Text style={[styles.timeBadgeText, { color: selected.kind === 'gym' ? '#818cf8' : '#f59e0b' }]}>
                    {selected.kind === 'gym' ? 'Gym' : 'Field'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                {selected.rating != null && <Text style={styles.cardMeta}>⭐ {selected.rating}</Text>}
                {selected.open_now != null && (
                  <Text style={[styles.cardMeta, { color: selected.open_now ? '#00ff87' : '#ff4444' }]}>
                    {selected.open_now ? '● Open now' : '● Closed'}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.viewBtn, { flex: 1, backgroundColor: selected.kind === 'gym' ? '#818cf8' : '#f59e0b' }]}
                  onPress={() => Linking.openURL('https://www.google.com/maps/place/?q=place_id:' + selected.place_id)}
                >
                  <Text style={styles.viewBtnText}>Open in Maps →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewBtn, { flex: 1, backgroundColor: '#00ff87' }]}
                  onPress={() => { setSelected(null); router.push({ pathname: '/game/create', params: { location: selected.vicinity, venueName: selected.name } }); }}
                >
                  <Text style={[styles.viewBtnText, { color: '#000' }]}>+ Game here</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: '#00ff87', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  filterChipActive: { backgroundColor: '#00ff87' },
  filterText: { color: '#aaa', fontSize: 14 },
  filterTextActive: { color: '#000', fontWeight: '700' },
  venueTabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  venueTab: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  venueTabActive: { backgroundColor: '#1a1a1a', borderColor: '#444' },
  venueTabText: { color: '#555', fontSize: 13 },
  venueTabTextActive: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gamePin: { backgroundColor: '#00ff87', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#000', shadowColor: '#00ff87', shadowOpacity: 0.5, shadowRadius: 6 },
  gamePinText: { fontSize: 20 },
  gymPin: { backgroundColor: '#818cf8', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  fieldPin: { backgroundColor: '#f59e0b', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  venuePinText: { fontSize: 17 },
  venueLoadingBadge: { position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 },
  venueLoadingText: { color: '#fff', fontSize: 13 },
  gameCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: '#222' },
  closeBtn: { position: 'absolute', top: -44, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', zIndex: 100, borderWidth: 1, borderColor: '#555' },
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