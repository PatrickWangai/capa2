import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import CapaLogo from '../../../../brand_assets/logo.svg';
import Constants from 'expo-constants';

export default function LoginScreen({ navigation }: any) {
  // Use the websiteUrl from app.json, with a fallback for safety
  const websiteUrl = Constants.expoConfig?.extra?.websiteUrl || 'http://localhost:5173';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode]   = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { setAuth } = useAuthStore();

  const submit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email: email.toLowerCase().trim(), password, mfaCode: mfaCode || undefined });
      if (data.requiresMfa) { setNeedsMfa(true); setLoading(false); return; }
      await setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <CapaLogo width={64} height={64} />
          <Text style={styles.appName}>Capa</Text>
          <Text style={styles.tagline}>Invest Globally. Grow Confidently.</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {needsMfa && (
            <>
              <Text style={styles.label}>MFA Code</Text>
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                maxLength={6}
                value={mfaCode}
                onChangeText={setMfaCode}
              />
            </>
          )}

          <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
          <Text style={styles.linkGray}>Don't have an account? </Text>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(websiteUrl)} style={styles.linkRow}>
          <Text style={styles.link}>Visit our website</Text>
        </TouchableOpacity>

        {/* Demo hint */}
        <View style={styles.demo}>
          <Text style={styles.demoText}>Demo: demo@capa.invest / Demo1234!</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 28, fontWeight: '800', color: '#2563EB' },
  appName: { fontSize: 28, fontWeight: '800', color: '#f1f5f9' },
  tagline: { fontSize: 13, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#0f172a', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 13, fontSize: 15, color: '#f1f5f9', marginBottom: 14 },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkGray: { color: '#64748b', fontSize: 14 },
  link: { color: '#60a5fa', fontSize: 14, fontWeight: '600' },
  demo: { backgroundColor: '#0f172a', borderRadius: 10, padding: 12, marginTop: 20, borderWidth: 1, borderColor: '#1e293b' },
  demoText: { color: '#475569', fontSize: 12, textAlign: 'center' },
});
