import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00ff87',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏃</Text>,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen name="game/[id]" options={{ href: null }} />
      <Tabs.Screen name="game/create" options={{ href: null }} />
      <Tabs.Screen name="auth/index" options={{ href: null }} />
    </Tabs>
  );
}
