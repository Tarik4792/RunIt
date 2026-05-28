import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const isActive = (p) => path === p || (p === '/' && path === '/index');

  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/')}>
        <Text style={styles.icon}>🏃</Text>
        <Text style={[styles.label, isActive('/') && styles.active]}>Feed</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/map')}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={[styles.label, isActive('/map') && styles.active]}>Map</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/profile')}>
        <Text style={styles.icon}>👤</Text>
        <Text style={[styles.label, isActive('/profile') && styles.active]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', backgroundColor: '#111', borderTopWidth: 1, borderColor: '#222', paddingBottom: 8 },
  item: { flex: 1, alignItems: 'center', paddingTop: 10 },
  icon: { fontSize: 20 },
  label: { color: '#555', fontSize: 11, marginTop: 2 },
  active: { color: '#00ff87', fontWeight: '600' },
});
