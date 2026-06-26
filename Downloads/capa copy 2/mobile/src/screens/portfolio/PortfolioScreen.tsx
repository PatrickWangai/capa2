import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PriceChange } from '../../components/common/PriceChange';

export default function PortfolioScreen({ navigation }: any) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const summary = data?.summary;
  const positions = data?.positions || [];
  const balances = data?.cashBalances || [];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}>

      <Text style={styles.pageTitle}>Portfolio</Text>

      {isLoading ? <ActivityIndicator color="#2563EB" style={{ marginTop: 40 }} /> : (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <Text style={styles.summaryValue}>${Number(summary?.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
            <View style={styles.summaryStats}>
              {[
                { label: 'Invested', val: `$${Number(summary?.totalInvested || 0).toFixed(2)}` },
                { label: 'Total P&L', val: `${Number(summary?.totalGainLoss || 0) >= 0 ? '+' : ''}$${Number(summary?.totalGainLoss || 0).toFixed(2)}` },
                { label: 'Today', val: `${Number(summary?.dailyChange || 0) >= 0 ? '+' : ''}${Number(summary?.dailyChangePct || 0).toFixed(2)}%` },
              ].map(({ label, val }) => (
                <View key={label} style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatLabel}>{label}</Text>
                  <Text style={styles.summaryStatVal}>{val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Cash balances */}
          <Text style={styles.sectionTitle}>Cash</Text>
          <View style={styles.balancesRow}>
            {balances.map((b: any) => (
              <View key={b.currency} style={styles.balanceChip}>
                <Text style={styles.balanceCurrency}>{b.currency}</Text>
                <Text style={styles.balanceAmt}>{Number(b.available).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Positions */}
          <Text style={styles.sectionTitle}>Holdings ({positions.length})</Text>
          {positions.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No holdings yet.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Markets')} style={styles.browseBtn}>
                <Text style={styles.browseBtnText}>Browse Markets</Text>
              </TouchableOpacity>
            </View>
          ) : positions.map((pos: any) => (
            <TouchableOpacity key={pos.id} style={styles.posCard}
              onPress={() => navigation.navigate('AssetDetail', { assetId: pos.assetId, symbol: pos.symbol })}>
              <View style={styles.posLeft}>
                <View style={styles.posIcon}>
                  <Text style={styles.posIconText}>{pos.symbol.slice(0, 2)}</Text>
                </View>
                <View>
                  <Text style={styles.posSymbol}>{pos.symbol}</Text>
                  <Text style={styles.posDetail}>{Number(pos.quantity).toFixed(4)} @ {pos.currency} {Number(pos.avgCostPrice).toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.posRight}>
                <Text style={styles.posValue}>{pos.currency} {Number(pos.marketValue).toFixed(2)}</Text>
                <PriceChange value={Number(pos.gainLossPct)} size="sm" />
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 16 },
  summaryCard: { backgroundColor: '#0f172a', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  summaryLabel: { color: '#64748b', fontSize: 13 },
  summaryValue: { fontSize: 34, fontWeight: '800', color: '#f1f5f9', marginTop: 4, marginBottom: 16 },
  summaryStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 14 },
  summaryStatItem: { flex: 1, alignItems: 'center' },
  summaryStatLabel: { color: '#64748b', fontSize: 11 },
  summaryStatVal: { color: '#f1f5f9', fontWeight: '700', fontSize: 14, marginTop: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#94a3b8', marginBottom: 10, marginTop: 4 },
  balancesRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  balanceChip: { flex: 1, backgroundColor: '#0f172a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1e293b', alignItems: 'center' },
  balanceCurrency: { color: '#64748b', fontSize: 12 },
  balanceAmt: { color: '#f1f5f9', fontWeight: '700', fontSize: 16, marginTop: 4 },
  posCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1e293b' },
  posLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  posIconText: { color: '#60a5fa', fontWeight: '700', fontSize: 12 },
  posSymbol: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  posDetail: { color: '#64748b', fontSize: 11, marginTop: 2 },
  posRight: { alignItems: 'flex-end' },
  posValue: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#64748b', fontSize: 15, marginBottom: 14 },
  browseBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  browseBtnText: { color: '#fff', fontWeight: '700' },
});
