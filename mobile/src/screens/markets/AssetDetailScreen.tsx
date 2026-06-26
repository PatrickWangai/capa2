import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PriceChange, Badge } from '../../components/common/PriceChange';

export default function AssetDetailScreen({ route, navigation }: any) {
  const { assetId } = route.params;
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => api.get(`/api/assets/${assetId}`).then(r => r.data),
    refetchInterval: 15_000,
  });

  const asset = data?.asset;
  const price = asset?.price;
  const change = Number(price?.changePercent || 0);
  const currentPrice = Number(price?.price || 0);
  const estimated = qty ? (currentPrice * Number(qty)).toFixed(2) : null;
  const fee = estimated ? (Number(estimated) * 0.001).toFixed(2) : null;

  const placeOrder = async () => {
    if (!qty || Number(qty) <= 0) return Alert.alert('Error', 'Enter a valid quantity.');
    setLoading(true);
    try {
      await api.post('/api/orders', { assetId, side, orderType: 'MARKET', quantity: qty });
      Alert.alert('Order Placed! 🎉', `${side} order for ${qty} ${asset.symbol} submitted. It will fill at market price.`, [{ text: 'OK' }]);
      setQty('');
      refetch();
    } catch (err: any) {
      Alert.alert('Order Failed', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color="#2563EB" size="large" /></View>;
  }
  if (!asset) return <View style={styles.center}><Text style={styles.errorText}>Asset not found</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Asset header */}
      <View style={styles.assetHeader}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>{asset.symbol.slice(0, 2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.symbol}>{asset.symbol}</Text>
            <Badge label={asset.exchange} variant="blue" />
            <Badge label={asset.assetClass} variant="gray" />
          </View>
          <Text style={styles.name}>{asset.name}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceCard}>
        <Text style={styles.priceVal}>{asset.currency} {currentPrice.toFixed(2)}</Text>
        <PriceChange value={change} size="lg" />
        <View style={styles.priceStats}>
          {[
            ['Open', price?.open ? Number(price.open).toFixed(2) : '—'],
            ['High', price?.high ? Number(price.high).toFixed(2) : '—'],
            ['Low', price?.low ? Number(price.low).toFixed(2) : '—'],
            ['Vol', price?.volume ? (Number(price.volume) / 1e6).toFixed(1) + 'M' : '—'],
          ].map(([l, v]) => (
            <View key={l} style={styles.priceStat}>
              <Text style={styles.priceStatLabel}>{l}</Text>
              <Text style={styles.priceStatVal}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 52W range */}
      <View style={styles.rangeCard}>
        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>52W Low: {asset.currency} {price?.weekLow52 ? Number(price.weekLow52).toFixed(2) : '—'}</Text>
          <Text style={styles.rangeLabel}>52W High: {asset.currency} {price?.weekHigh52 ? Number(price.weekHigh52).toFixed(2) : '—'}</Text>
        </View>
      </View>

      {/* Order form */}
      <View style={styles.orderCard}>
        <Text style={styles.orderTitle}>Place Order</Text>

        {/* Buy / Sell toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity style={[styles.toggleBtn, side === 'BUY' && styles.toggleBuyActive]} onPress={() => setSide('BUY')}>
            <Text style={[styles.toggleText, side === 'BUY' && styles.toggleBuyText]}>BUY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, side === 'SELL' && styles.toggleSellActive]} onPress={() => setSide('SELL')}>
            <Text style={[styles.toggleText, side === 'SELL' && styles.toggleSellText]}>SELL</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Quantity {asset.isFractional ? '(fractional ok)' : '(whole shares only)'}
        </Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => String(Math.max(0, Number(q) - 1)))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.qtyInput}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#64748b"
            value={qty}
            onChangeText={setQty}
          />
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => String(Number(q) + 1))}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {estimated && (
          <View style={styles.summary}>
            {[['Est. Value', `${asset.currency} ${estimated}`], ['Fee (0.1%)', `${asset.currency} ${fee}`], ['Total', `${asset.currency} ${(Number(estimated) * 1.001).toFixed(2)}`]].map(([k, v]) => (
              <View key={k} style={styles.summaryRow}>
                <Text style={styles.summaryKey}>{k}</Text>
                <Text style={k === 'Total' ? styles.summaryValBold : styles.summaryVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.orderBtn, side === 'BUY' ? styles.orderBtnBuy : styles.orderBtnSell, (!qty || loading) && styles.orderBtnDisabled]}
          onPress={placeOrder}
          disabled={!qty || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>Place {side} Order</Text>}
        </TouchableOpacity>
        <Text style={styles.orderNote}>Market orders execute at current market price</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' },
  errorText: { color: '#ef4444' },
  assetHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#60a5fa', fontWeight: '800', fontSize: 16 },
  symbol: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  name: { color: '#64748b', fontSize: 13, marginTop: 2 },
  priceCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 10 },
  priceVal: { fontSize: 32, fontWeight: '800', color: '#f1f5f9' },
  priceStats: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  priceStat: { flex: 1, alignItems: 'center' },
  priceStatLabel: { color: '#64748b', fontSize: 11 },
  priceStatVal: { color: '#f1f5f9', fontWeight: '600', fontSize: 13, marginTop: 2 },
  rangeCard: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 14 },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabel: { color: '#64748b', fontSize: 12 },
  orderCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  orderTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },
  toggle: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 10, padding: 3, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBuyActive: { backgroundColor: '#166534' },
  toggleSellActive: { backgroundColor: '#7f1d1d' },
  toggleText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  toggleBuyText: { color: '#4ade80' },
  toggleSellText: { color: '#f87171' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  qtyBtn: { width: 44, height: 44, backgroundColor: '#1e293b', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#f1f5f9', fontSize: 22, fontWeight: '300' },
  qtyInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 10, padding: 12, color: '#f1f5f9', fontSize: 16, textAlign: 'center', borderWidth: 1, borderColor: '#334155' },
  summary: { backgroundColor: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryKey: { color: '#94a3b8', fontSize: 13 },
  summaryVal: { color: '#f1f5f9', fontSize: 13 },
  summaryValBold: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
  orderBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  orderBtnBuy: { backgroundColor: '#166534' },
  orderBtnSell: { backgroundColor: '#7f1d1d' },
  orderBtnDisabled: { opacity: 0.5 },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  orderNote: { color: '#475569', fontSize: 11, textAlign: 'center', marginTop: 10 },
});
