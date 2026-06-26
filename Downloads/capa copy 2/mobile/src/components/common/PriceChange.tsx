import { View, Text, StyleSheet } from 'react-native';

// ─── PriceChange ──────────────────────────────────────────
interface PriceChangeProps {
  value: number;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceChange({ value, suffix = '%', size = 'md' }: PriceChangeProps) {
  const isUp = value >= 0;
  const sizes = { sm: 11, md: 13, lg: 15 };
  return (
    <Text style={[styles.change, { color: isUp ? '#22c55e' : '#ef4444', fontSize: sizes[size] }]}>
      {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{value.toFixed(2)}{suffix}
    </Text>
  );
}

// ─── ScreenHeader ─────────────────────────────────────────
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Badge ────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray';
export function Badge({ label, variant = 'gray' }: { label: string; variant?: BadgeVariant }) {
  const colors: Record<BadgeVariant, { bg: string; text: string }> = {
    green:  { bg: '#14532d40', text: '#4ade80' },
    red:    { bg: '#7f1d1d40', text: '#f87171' },
    yellow: { bg: '#78350f40', text: '#fbbf24' },
    blue:   { bg: '#1e3a8a40', text: '#60a5fa' },
    gray:   { bg: '#37415180', text: '#9ca3af' },
  };
  const c = colors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  change: { fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#f1f5f9' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '600' },
});
