import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import CapaLogo from '../../../../brand_assets/logo.svg';
import Constants from 'expo-constants';

const COUNTRIES = [
  { code: 'KE', name: 'Kenya' }, { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' }, { code: 'OTHER', name: 'Other' },
];

export default function RegisterScreen({ navigation }: any) {
  // Use the websiteUrl from app.json, with a fallback for safety
  const websiteUrl = Constants.expoConfig?.extra?.websiteUrl || 'http://localhost:5173';

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', country: 'KE' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.firstName || !form.email || !form.password) return Alert.alert('Error', 'Please fill in all required fields.');
    if (form.password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters.');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', form);
      await setAuth(data.user, data.accessToken, data.refreshToken);
      // After successful registration, auth state will change and navigator will switch to the main app stack.
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <CapaLogo width={64} height={64} />
          <Text style={styles.appName}>Capa</Text>
          <Text style={styles.tagline}>Invest Globally. Grow Confidently.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput style={styles.input} placeholder="Jane" placeholderTextColor="#64748b" value={form.firstName} onChangeText={set('firstName')} />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput style={styles.input} placeholder="Doe" placeholderTextColor="#64748b" value={form.lastName} onChangeText={set('lastName')} />
            </View>
          </View>

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#64748b" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} placeholder="+254700000000" placeholderTextColor="#64748b" keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} />

          <Text style={styles.label}>Password *</Text>
          <TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor="#64748b" secureTextEntry value={form.password} onChangeText={set('password')} />

          <Text style={styles.label}>Country</Text>
          <View style={styles.pickerWrap}>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c.code} onPress={() => set('country')(c.code)}
                style={[styles.countryChip, form.country === c.code && styles.countryChipActive]}>
                <Text style={[styles.countryText, form.country === c.code && styles.countryTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
          <Text style={styles.linkGray}>Already have an account? </Text>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(websiteUrl)} style={styles.linkRow}>
          <Text style={styles.link}>Visit our website</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scroll: { flexGrow: 1, padding: 20 },
  logoWrap: { alignItems: 'center', marginBottom: 32, paddingTop: 48 },
  appName: { fontSize: 28, fontWeight: '800', color: '#f1f5f9' },
  tagline: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#0f172a', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, fontSize: 14, color: '#f1f5f9', marginBottom: 14 },
  pickerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  countryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  countryChipActive: { backgroundColor: '#1e3a8a', borderColor: '#2563EB' },
  countryText: { fontSize: 12, color: '#94a3b8' },
  countryTextActive: { color: '#60a5fa', fontWeight: '600' },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkGray: { color: '#64748b', fontSize: 14 },
  link: { color: '#60a5fa', fontSize: 14, fontWeight: '600' },
});
