import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import CapaLogo from '../../../../brand_assets/logo.svg';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '📈', text: 'Trade US, UK & Kenyan markets' },
  { icon: '⚡', text: 'Instant M-Pesa deposits' },
  { icon: '🔒', text: 'Regulated & secure platform' },
  { icon: '✦',  text: 'Zero monthly fees — ever' },
];

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top glow */}
      <View style={styles.glowTop} />

      {/* Logo + headline */}
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <CapaLogo width={72} height={72} />
        </View>
        <Text style={styles.brand}>CAPA</Text>
        <Text style={styles.tagline}>UNSTOPPABLE MINDS</Text>
        <Text style={styles.sub}>
          Invest in global markets from Africa.{'\n'}Real-time data. No monthly fees.
        </Text>
      </View>

      {/* Feature pills */}
      <View style={styles.features}>
        {FEATURES.map(f => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Bottom glow */}
      <View style={styles.glowBottom} />

      {/* CTA buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Get Started — It's Free</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>No minimum deposit · Capital at risk</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  glowTop: {
    position: 'absolute',
    top: -80,
    left: width * 0.5 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#2563EB',
    opacity: 0.12,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#06B6D4',
    opacity: 0.08,
  },

  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: 42,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 4,
    marginTop: 4,
    marginBottom: 20,
  },
  sub: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  features: {
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  featureIcon: { fontSize: 16 },
  featureText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },

  actions: { gap: 12 },

  btnPrimary: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  btnSecondaryText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },

  disclaimer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: 11,
    marginTop: 4,
  },
});
