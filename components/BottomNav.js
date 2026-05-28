import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const isActive = (p) => path === p || (p === '/' && path === '/index');

  const tabs = [
    { label: 'Feed', icon: '🏃', path: '/' },
    { label: 'Map', icon: '🗺️', path: '/map' },
    { label: 'Profile', icon: '👤', path: '/profile' },
  ];

  return (
    <View style={styles.nav}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.path} style={styles.item} onPress={() => router.push(tab.path)}>
          <View style={[styles.iconWrap, isActive(tab.path) && styles.iconWrapActive]}>
            <Text style={styles.icon}>{tab.icon}</Text>
          </View>
          <Text style={[styles.label, isActive(tab.path) && styles.active]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', backgroundColor: '#111', borderTopWidth: 1, borderColor: '#222', paddingBottom: 8 },
  item: { flex: 1, alignItems: 'center', paddingTop: 8 },
  iconWrap: { width: 40, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  iconWrapActive: { backgroundColor: '#00ff8722' },
  icon: { fontSize: 18 },
  label: { color: '#555', fontSize: 11, marginTop: 2 },
  active: { color: '#00ff87', fontWeight: '600' },
});
