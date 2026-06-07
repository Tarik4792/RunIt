import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSession } from '../lib/auth';

export default function UsernameSetup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!/^[a-z0-9_]+$/.test(trimmed)) { setError('Only letters, numbers, and underscores'); return; }
    setLoading(true);
    setError('');
    try {
      const session = await getSession();
      if (!session) { router.replace('/auth'); return; }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', session.user.id)
        .single();

      if (existing) { setError('Username already taken'); setLoading(false); return; }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: trimmed, username_set: true })
        .eq('id', session.user.id);

      if (updateError) throw updateError;
      router.replace('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🏃 RunIt</Text>
        <Text style={styles.title}>Pick a username</Text>
        <Text style={styles.subtitle}>This is how other players will see you in games.</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. hooper42"
          placeholderTextColor="#444"
          value={username}
          onChangeText={t => { setUsername(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0a0a0a" />
            : <Text style={styles.buttonText}>Let's Go →</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  logo: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  title: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#666', fontSize: 15, marginBottom: 32, lineHeight: 22 },
  input: { backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e1e', color: '#ffffff', fontSize: 18, padding: 16, marginBottom: 12 },
  error: { color: '#ff4444', fontSize: 13, marginBottom: 12 },
  button: { backgroundColor: '#00ff87', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
});
