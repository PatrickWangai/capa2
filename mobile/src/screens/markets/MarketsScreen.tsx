import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PriceChange } from '../../components/common/PriceChange';
import MiniChart from '../../components/charts/MiniChart';

const EXCHANGES = ['All', 'NASDAQ', 'NYSE', 'LSE', 'NSE'];

export default function MarketsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['assets', exchange, search],
    queryFn: () => api.get('/api/assets', {
      params: { ...(exchange !== 'All' && { exchange }), ...(search && { search }), limit: 80 }
    }).then(r => r.data),
    refetchInterval: 15_000,
  });

  const assets = data?.assets || [];

  return (
    <View style={styles.root}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search symbol or name…"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Exchange tabs */}
      <View style={styles.tabs}>
        {EXCHANGES.map(ex => (
          <TouchableOpacity key={ex} onPress={() => setExchange(ex)}
            style={[styles.tab, exchange === ex && styles.tabActive]}>
            <Text style={[styles.tabText, exchange === ex && styles.tabTextActive]}>{ex}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color="#2563EB" size="large" /></View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item: asset }) => {
            const change = Number(asset.price?.changePercent || 0);
            const isUp = change >= 0;
            return (
              <TouchableOpacity style={styles.row}
                onPress={() => navigation.navigate('AssetDetail', { assetId: asset.id, symbol: asset.symbol })}>
                <View style={styles.assetIcon}>
                  <Text style={styles.assetIconText}>{asset.symbol.slice(0, 2)}</Text>
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.symbol}>{asset.symbol}</Text>
                  <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
                </View>
                <MiniChart
                  data={[...Array(10)].map(() => Number(asset.price?.price || 100) * (0.98 + Math.random() * 0.04))}
                  positive={isUp}
                  width={60} height={28}
                />
                <View style={styles.priceWrap}>
                  <Text style={styles.price}>
                    {asset.currency} {asset.price ? Number(asset.price.price).toFixed(2) : '—'}
                  </Text>
                  <PriceChange value={change} size="sm" />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No assets found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  searchWrap: { padding: 14, paddingBottom: 8 },
  search: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, color: '#f1f5f9', fontSize: 14 },
  tabs: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  tabActive: { backgroundColor: '#1e3a8a', borderColor: '#2563EB' },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#60a5fa' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  sep: { height: 1, backgroundColor: '#0f172a' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#020617' },
  assetIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  assetIconText: { color: '#60a5fa', fontWeight: '700', fontSize: 13 },
  assetInfo: { flex: 1 },
  symbol: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  name: { color: '#64748b', fontSize: 11, marginTop: 2 },
  priceWrap: { alignItems: 'flex-end' },
  price: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  empty: { color: '#64748b' },
});
