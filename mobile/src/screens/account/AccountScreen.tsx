import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/common/PriceChange';

const KYC_INFO: Record<string, { label: string; color: 'green'|'yellow'|'red'|'gray'; desc: string }> = {
  APPROVED:    { label: 'Verified', color: 'green', desc: 'Your identity has been verified.' },
  PENDING:     { label: 'Under Review', color: 'yellow', desc: 'Documents submitted — review takes 1-2 business days.' },
  REJECTED:    { label: 'Action Required', color: 'red', desc: 'Some documents were rejected. Please re-submit.' },
  NOT_STARTED: { label: 'Not Started', color: 'gray', desc: 'Complete KYC to unlock all features.' },
};

export default function AccountScreen() {
  const { user, logout } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => api.get('/api/wallets').then(r => r.data),
  });

  const profile = data?.user || user;
  const kycStatus = profile?.kycStatus || 'NOT_STARTED';
  const kycInfo = KYC_INFO[kycStatus] || KYC_INFO.NOT_STARTED;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</Text>
        </View>
        <Text style={styles.name}>{profile?.firstName} {profile?.lastName}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <Badge label={profile?.status || 'PENDING'} variant={profile?.status === 'ACTIVE' ? 'green' : 'yellow'} />
      </View>

      {/* KYC status */}
      <View style={[styles.kycCard, kycStatus === 'APPROVED' ? styles.kycApproved : kycStatus === 'REJECTED' ? styles.kycRejected : styles.kycPending]}>
        <View style={styles.kycHeader}>
          <Text style={styles.kycTitle}>Identity Verification</Text>
          <Badge label={kycInfo.label} variant={kycInfo.color} />
        </View>
        <Text style={styles.kycDesc}>{kycInfo.desc}</Text>
      </View>

      {/* Account number */}
      {walletData?.account && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Account Number</Text>
            <Text style={styles.rowVal}>{walletData.account.accountNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Base Currency</Text>
            <Text style={styles.rowVal}>{walletData.account.baseCurrency}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Holdings</Text>
            <Text style={styles.rowVal}>{walletData.account.positionCount} positions</Text>
          </View>
        </View>
      )}

      {/* Balances */}
      {walletData?.balances?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balances</Text>
          {walletData.balances.filter((b: any) => Number(b.total) > 0).map((b: any) => (
            <View key={b.currency} style={styles.row}>
              <Text style={styles.rowLabel}>{b.currency}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowVal}>{Number(b.available).toFixed(2)} available</Text>
                {Number(b.reserved) > 0 && <Text style={styles.rowSub}>{Number(b.reserved).toFixed(2)} reserved</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Profile info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {[
          ['Phone', profile?.phone || '—'],
          ['Country', profile?.countryOfResidence || '—'],
          ['Member Since', profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'],
          ['Last Login', profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : '—'],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.rowLabel}>{k}</Text>
            <Text style={styles.rowVal}>{v}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Capa v1.0.0 · Invest Globally. Grow Confidently.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: '#f1f5f9' },
  email: { color: '#64748b', fontSize: 14, marginTop: 4, marginBottom: 10 },
  kycCard: { borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1 },
  kycApproved: { backgroundColor: '#052e16', borderColor: '#166534' },
  kycRejected: { backgroundColor: '#450a0a', borderColor: '#991b1b' },
  kycPending: { backgroundColor: '#1c1917', borderColor: '#57534e' },
  kycHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kycTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: 15 },
  kycDesc: { color: '#94a3b8', fontSize: 13 },
  section: { backgroundColor: '#0f172a', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#1e293b' },
  sectionTitle: { color: '#64748b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  rowLabel: { color: '#94a3b8', fontSize: 14 },
  rowVal: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  rowSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  logoutBtn: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444', marginTop: 8, marginBottom: 16 },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  version: { color: '#334155', fontSize: 11, textAlign: 'center' },
});
