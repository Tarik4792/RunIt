import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';

export default function Support() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>RunIt Support</Text>
      <Text style={styles.subtitle}>Find Pickup Games Near You</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <Text style={styles.question}>How do I create a game?</Text>
        <Text style={styles.answer}>Tap the "+" button on the home screen, fill in the game details including sport, location, time, and number of players, then tap Create.</Text>

        <Text style={styles.question}>How do I join a game?</Text>
        <Text style={styles.answer}>Browse games on the home screen or map view, tap a game to see details, then tap "Join" to add yourself to the game.</Text>

        <Text style={styles.question}>How do I cancel a game I created?</Text>
        <Text style={styles.answer}>Go to the game detail page and tap "Cancel Game". All joined players will be notified.</Text>

        <Text style={styles.question}>Why do I need to create an account?</Text>
        <Text style={styles.answer}>An account lets you create games, join games, and track your activity. It also lets other players identify you in the game.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.answer}>Having trouble? Email us and we'll get back to you within 24 hours.</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:tarik7683@gmail.com')}>
          <Text style={styles.link}>tarik7683@gmail.com</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#00ff87', marginTop: 60, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  question: { fontSize: 15, fontWeight: '600', color: '#00ff87', marginTop: 12, marginBottom: 4 },
  answer: { fontSize: 14, color: '#ccc', lineHeight: 22 },
  link: { fontSize: 15, color: '#00ff87', marginTop: 8, textDecorationLine: 'underline' },
});
