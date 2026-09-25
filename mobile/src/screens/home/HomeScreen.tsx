import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PriceChange, Card } from '../../components/common/PriceChange';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();

  const { data: portfolio, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications?limit=5').then(r => r.data),
  });

  const summary = portfolio?.summary;
  const positions = portfolio?.positions || [];
  const isUp = Number(summary?.dailyChange || 0) >= 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {user?.firstName} 👋</Text>
          <Text style={styles.subGreeting}>Your portfolio at a glance</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Account')} style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </TouchableOpacity>
      </View>

      {/* KYC Banner */}
      {user?.kycStatus !== 'APPROVED' && (
        <TouchableOpacity style={styles.kycBanner} onPress={() => navigation.navigate('Account')}>
          <Text style={styles.kycIcon}>🛡️</Text>
          <View style={styles.kycText}>
            <Text style={styles.kycTitle}>Complete Verification</Text>
            <Text style={styles.kycSub}>Verify identity to unlock trading</Text>
          </View>
          <Text style={styles.kycArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Portfolio value */}
      <Card style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
        {isLoading ? <ActivityIndicator color="#2563EB" style={{ marginTop: 8 }} /> : (
          <>
            <Text style={styles.portfolioValue}>
              ${Number(summary?.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.changeRow}>
              <PriceChange value={Number(summary?.dailyChangePct || 0)} size="md" />
              <Text style={styles.changeLabel}> today</Text>
            </View>
          </>
        )}
        <View style={styles.statsRow}>
          {[
            { label: 'Invested', val: `$${Number(summary?.totalInvested || 0).toFixed(2)}` },
            { label: 'P&L', val: `${Number(summary?.totalGainLoss || 0) >= 0 ? '+' : ''}$${Number(summary?.totalGainLoss || 0).toFixed(2)}` },
            { label: 'Positions', val: String(positions.length) },
          ].map(({ label, val }) => (
            <View key={label} style={styles.statBox}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statVal}>{val}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Top positions */}
      {positions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Holdings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {positions.slice(0, 4).map((pos: any) => (
            <TouchableOpacity key={pos.id} style={styles.posRow} onPress={() => navigation.navigate('AssetDetail', { assetId: pos.assetId, symbol: pos.symbol })}>
              <View style={styles.posIcon}>
                <Text style={styles.posIconText}>{pos.symbol.slice(0, 2)}</Text>
              </View>
              <View style={styles.posInfo}>
                <Text style={styles.posSymbol}>{pos.symbol}</Text>
                <Text style={styles.posQty}>{Number(pos.quantity).toFixed(4)} shares</Text>
              </View>
              <View style={styles.posRight}>
                <Text style={styles.posValue}>{pos.currency} {Number(pos.marketValue).toFixed(2)}</Text>
                <PriceChange value={Number(pos.gainLossPct)} size="sm" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Notifications */}
      {notifs?.notifications?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {notifs.notifications.slice(0, 3).map((n: any) => (
            <View key={n.id} style={[styles.notifRow, !n.isRead && styles.notifUnread]}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 8 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#f1f5f9' },
  subGreeting: { fontSize: 13, color: '#64748b', marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  kycBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#422006', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#92400e' },
  kycIcon: { fontSize: 22, marginRight: 12 },
  kycText: { flex: 1 },
  kycTitle: { color: '#fbbf24', fontWeight: '700', fontSize: 14 },
  kycSub: { color: '#d97706', fontSize: 12, marginTop: 2 },
  kycArrow: { color: '#fbbf24', fontSize: 22, fontWeight: '300' },
  portfolioCard: { marginBottom: 20 },
  portfolioLabel: { fontSize: 13, color: '#94a3b8' },
  portfolioValue: { fontSize: 36, fontWeight: '800', color: '#f1f5f9', marginTop: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  changeLabel: { color: '#64748b', fontSize: 13 },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#64748b' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginTop: 3 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 10 },
  seeAll: { color: '#60a5fa', fontSize: 13 },
  posRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e293b' },
  posIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  posIconText: { color: '#60a5fa', fontWeight: '700', fontSize: 13 },
  posInfo: { flex: 1 },
  posSymbol: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  posQty: { color: '#64748b', fontSize: 12, marginTop: 2 },
  posRight: { alignItems: 'flex-end' },
  posValue: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  notifRow: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e293b' },
  notifUnread: { borderColor: '#1e3a8a', backgroundColor: '#172554' },
  notifTitle: { color: '#f1f5f9', fontWeight: '600', fontSize: 13 },
  notifBody: { color: '#64748b', fontSize: 12, marginTop: 3 },
});
