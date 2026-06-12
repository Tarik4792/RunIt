import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function Privacy() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Effective Date: June 11, 2026</Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>We collect your email address when you create an account. We also collect your location data to show nearby pickup games on the map.</Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.body}>Your email is used solely for authentication. Your location is used to display nearby games and venues. We do not sell your data to third parties.</Text>

      <Text style={styles.heading}>3. Data Storage</Text>
      <Text style={styles.body}>Your data is stored securely using Supabase. We retain your data as long as your account is active.</Text>

      <Text style={styles.heading}>4. Third-Party Services</Text>
      <Text style={styles.body}>RunIt uses Supabase for authentication and data storage, and Mapbox for map functionality. These services have their own privacy policies.</Text>

      <Text style={styles.heading}>5. Your Rights</Text>
      <Text style={styles.body}>You may request deletion of your account and associated data at any time by contacting us at tarik7683@gmail.com.</Text>

      <Text style={styles.heading}>6. Contact</Text>
      <Text style={styles.body}>For privacy-related questions, contact us at tarik7683@gmail.com.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24, paddingBottom: 60 },
  title: { color: '#00ff87', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  date: { color: '#666', fontSize: 13, marginBottom: 24 },
  heading: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  body: { color: '#aaa', fontSize: 14, lineHeight: 22 },
});
