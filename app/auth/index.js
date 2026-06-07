import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { signIn, signUp, isUsernameSet, getSession } from '../../lib/auth';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email || !password) { setError('Fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setError('Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        await signIn(email, password);
        const session = await getSession();
        const usernameSet = await isUsernameSet(session.user.id);
        if (!usernameSet) {
          router.replace('/username');
        } else {
          router.replace('/');
        }
      }
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
        <Text style={styles.tagline}>Find pickup games near you</Text>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signin' && styles.toggleActive]}
            onPress={() => { setMode('signin'); setError(''); }}
          >
            <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
            onPress={() => { setMode('signup'); setError(''); }}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#444"
          value={email}
          onChangeText={t => { setEmail(t); setError(''); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#444"
          value={password}
          onChangeText={t => { setPassword(t); setError(''); }}
          secureTextEntry
        />

        {error ? <Text style={[styles.error, error.includes('Check your email') && styles.success]}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0a0a0a" />
            : <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  logo: { color: '#ffffff', fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  tagline: { color: '#666', fontSize: 15, textAlign: 'center', marginBottom: 40 },
  toggle: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, padding: 4, marginBottom: 28 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#00ff87' },
  toggleText: { color: '#666', fontWeight: '600' },
  toggleTextActive: { color: '#0a0a0a' },
  input: { backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e1e', color: '#ffffff', fontSize: 15, padding: 14, marginBottom: 12 },
  error: { color: '#ff4444', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  success: { color: '#00ff87' },
  button: { backgroundColor: '#00ff87', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
});
