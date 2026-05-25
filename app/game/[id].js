import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { getGame, deleteGame } from '../../lib/games';
import { supabase } from '../../lib/supabase';

export default function GameDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [leftEarly, setLeftEarly] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGame(id);
        setGame(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('game_id', id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    const channel = supabase
      .channel(`messages:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `game_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [id]);

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSending(true);
    const body = newMessage.trim();
    setNewMessage('');
    const { error } = await supabase
      .from('messages')
      .insert([{ game_id: id, sender_name: 'You', body }]);
    if (error) Alert.alert('Error', error.message);
    setSending(false);
  }

  async function handleCheckIn() {
    if (checkedIn) return;
    setCheckedIn(true);
    setLeftEarly(false);
    const current = game.checked_in ?? [];
    const updated = [...current.filter(n => n !== 'You'), 'You'];
    const { error } = await supabase
      .from('games')
      .update({ checked_in: updated, left_early: (game.left_early ?? []).filter(n => n !== 'You') })
      .eq('id', id);
    if (!error) setGame(g => ({ ...g, checked_in: updated }));
  }

  async function handleLeftEarly() {
    if (leftEarly) return;
    setLeftEarly(true);
    setCheckedIn(false);
    const current = game.left_early ?? [];
    const updated = [...current.filter(n => n !== 'You'), 'You'];
    const { error } = await supabase
      .from('games')
      .update({ left_early: updated, checked_in: (game.checked_in ?? []).filter(n => n !== 'You') })
      .eq('id', id);
    if (!error) setGame(g => ({ ...g, left_early: updated }));
  }

  function handleJoin() { setJoined(j => !j); }

  async function handleDelete() {
    Alert.alert('Cancel Game', 'Are you sure you want to delete this game?', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteGame(id); router.back(); }
          catch (e) { Alert.alert('Error', e.message); }
        }
      }
    ]);
  }

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}><ActivityIndicator color="#00ff87" size="large" /></View>
    </SafeAreaView>
  );

  if (!game) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.errorText}>Game not found</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Go back</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const isHost = game.host_name === 'You';
  const basePlayers = game.players?.length ?? 0;
  const players = joined ? basePlayers + 1 : basePlayers;
  const spotsLeft = game.max_players - players;
  const checkedInList = game.checked_in ?? [];
  const leftEarlyList = game.left_early ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {isHost && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.cancelText}>Cancel Game</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{game.sport}</Text>
            <Text style={styles.heroTitle}>{game.title}</Text>
            <Text style={styles.heroLocation}>📍 {game.location}</Text>
            {isHost && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>You're hosting</Text></View>}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{players}</Text>
              <Text style={styles.infoLabel}>Players</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={[styles.infoValue, spotsLeft <= 2 && { color: '#ff4444' }]}>{spotsLeft}</Text>
              <Text style={styles.infoLabel}>Spots Left</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{game.level}</Text>
              <Text style={styles.infoLabel}>Level</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <Text style={styles.sectionText}>{game.time}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hosted by</Text>
            <Text style={[styles.sectionText, { color: '#00ff87' }]}>{game.host_name}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who's In</Text>
            <View style={styles.playerChips}>
              {(game.players ?? []).map((p, i) => (
                <View key={i} style={styles.playerChip}>
                  <Text style={styles.playerChipText}>{p}</Text>
                </View>
              ))}
              {joined && (
                <View style={[styles.playerChip, styles.playerChipYou]}>
                  <Text style={[styles.playerChipText, { color: '#000' }]}>You</Text>
                </View>
              )}
              {!joined && players === 0 && <Text style={styles.sectionText}>No one yet — be the first!</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.attendanceRow}>
              <TouchableOpacity
                style={[styles.attendanceBtn, checkedIn && styles.attendanceBtnActive]}
                onPress={() => checkedIn ? setCheckedIn(false) : handleCheckIn()}
                
              >
                <Text style={styles.attendanceBtnIcon}>✅</Text>
                <Text style={[styles.attendanceBtnText, checkedIn && { color: '#00ff87' }]}>
                  {checkedIn ? "You're in!" : 'Check In'}
                </Text>
                {checkedInList.length > 0 && (
                  <Text style={styles.attendanceCount}>{checkedInList.length} here</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attendanceBtn, leftEarly && styles.attendanceBtnLeft]}
                onPress={() => leftEarly ? setLeftEarly(false) : handleLeftEarly()}
                
              >
                <Text style={styles.attendanceBtnIcon}>🏃💨</Text>
                <Text style={[styles.attendanceBtnText, leftEarly && { color: '#ff9500' }]}>
                  {leftEarly ? 'You left early' : 'Left Early'}
                </Text>
                {leftEarlyList.length > 0 && (
                  <Text style={styles.attendanceCount}>{leftEarlyList.length} left</Text>
                )}
              </TouchableOpacity>
            </View>

            {(checkedInList.length > 0 || leftEarlyList.length > 0) && (
              <View style={styles.attendanceSummary}>
                {checkedInList.length > 0 && (
                  <Text style={styles.attendanceSummaryText}>
                    ✅ Showed up: {checkedInList.join(', ')}
                  </Text>
                )}
                {leftEarlyList.length > 0 && (
                  <Text style={[styles.attendanceSummaryText, { color: '#ff9500' }]}>
                    🏃 Left early: {leftEarlyList.join(', ')}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chat</Text>
            {messages.length === 0 ? (
              <Text style={styles.emptyChat}>No messages yet — say something! 👋</Text>
            ) : (
              <View style={styles.messageList}>
                {messages.map((msg) => {
                  const isMe = msg.sender_name === 'You';
                  return (
                    <View key={msg.id} style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
                      {!isMe && <Text style={styles.messageSender}>{msg.sender_name}</Text>}
                      <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{msg.body}</Text>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Say something..."
                placeholderTextColor="#444"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!newMessage.trim() || sending) && { opacity: 0.4 }]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || sending}
              >
                <Text style={styles.sendBtnText}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isHost && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑 Delete Game</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {!isHost && (
          <View style={styles.joinContainer}>
            <TouchableOpacity style={[styles.joinBtn, joined && styles.joinBtnActive]} onPress={handleJoin}>
              <Text style={[styles.joinBtnText, joined && { color: '#00ff87' }]}>
                {joined ? '✓ You\'re In — Tap to Leave' : 'Join Game'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backText: { color: '#00ff87', fontSize: 16 },
  cancelText: { color: '#ff4444', fontSize: 14 },
  errorText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backLink: { color: '#00ff87', fontSize: 15, marginTop: 12 },
  hero: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  heroLocation: { color: '#888', fontSize: 15, marginTop: 6 },
  hostBadge: { marginTop: 12, backgroundColor: '#003d1f', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  hostBadgeText: { color: '#00ff87', fontSize: 13, fontWeight: '700' },
  infoRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  infoCard: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  infoValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  infoLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#111' },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  sectionText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  playerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#333' },
  playerChipYou: { backgroundColor: '#00ff87', borderColor: '#00ff87' },
  playerChipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  attendanceRow: { flexDirection: 'row', gap: 12 },
  attendanceBtn: { flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222', gap: 6 },
  attendanceBtnActive: { borderColor: '#00ff87', backgroundColor: '#003d1f' },
  attendanceBtnLeft: { borderColor: '#ff9500', backgroundColor: '#2a1a00' },
  attendanceBtnIcon: { fontSize: 24 },
  attendanceBtnText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  attendanceCount: { color: '#555', fontSize: 11 },
  attendanceSummary: { marginTop: 12, gap: 4 },
  attendanceSummaryText: { color: '#00ff87', fontSize: 13 },
  emptyChat: { color: '#555', fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
  messageList: { gap: 8, marginBottom: 12 },
  messageBubble: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', maxWidth: '80%', borderWidth: 1, borderColor: '#222' },
  messageBubbleMe: { backgroundColor: '#003d1f', alignSelf: 'flex-end', borderColor: '#00ff87' },
  messageSender: { color: '#888', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  messageText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  messageTextMe: { color: '#00ff87' },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 },
  input: { flex: 1, backgroundColor: '#111', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#222' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00ff87', justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#000', fontSize: 18, fontWeight: '800' },
  deleteBtn: { marginHorizontal: 20, marginTop: 16, borderWidth: 1, borderColor: '#ff4444', borderRadius: 14, padding: 16, alignItems: 'center' },
  deleteBtnText: { color: '#ff4444', fontSize: 15, fontWeight: '700' },
  joinContainer: { padding: 20, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#111' },
  joinBtn: { backgroundColor: '#00ff87', borderRadius: 16, padding: 18, alignItems: 'center' },
  joinBtnActive: { backgroundColor: '#111', borderWidth: 1, borderColor: '#00ff87' },
  joinBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
