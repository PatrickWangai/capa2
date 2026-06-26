import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

type Mode = 'mpesa' | 'bank' | 'withdraw';

export default function DepositScreen() {
  const [mode, setMode] = useState<Mode>('mpesa');
  const [mpesa, setMpesa] = useState({ phone: '', amount: '' });
  const [bank, setBank] = useState({ amount: '', currency: 'USD' });
  const [withdraw, setWithdraw] = useState({ amount: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [bankInstructions, setBankInstructions] = useState<any>(null);

  const submitMpesa = async () => {
    if (!mpesa.phone || !mpesa.amount) return Alert.alert('Error', 'Fill in phone and amount.');
    setLoading(true);
    try {
      await api.post('/api/deposits/mpesa', { phone: mpesa.phone, amount: Number(mpesa.amount), currency: 'KES' });
      Alert.alert('M-Pesa Sent! 📱', 'Check your phone and enter your M-Pesa PIN to complete the deposit.');
      setMpesa({ phone: '', amount: '' });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'M-Pesa request failed');
    } finally { setLoading(false); }
  };

  const submitBank = async () => {
    if (!bank.amount) return Alert.alert('Error', 'Enter amount.');
    setLoading(true);
    try {
      const { data } = await api.post('/api/deposits/bank', { amount: Number(bank.amount), currency: bank.currency });
      setBankInstructions(data.bankDetails);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Bank deposit failed');
    } finally { setLoading(false); }
  };

  const submitWithdrawal = async () => {
    if (!withdraw.amount || !withdraw.phone) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    try {
      await api.post('/api/deposits/withdraw', { amount: Number(withdraw.amount), currency: 'KES', method: 'MPESA', phone: withdraw.phone });
      Alert.alert('Withdrawal Submitted', 'Your request is being processed and will be completed in 1-2 business days.');
      setWithdraw({ amount: '', phone: '' });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Withdrawal request failed');
    } finally { setLoading(false); }
  };

  const MODES: { id: Mode; label: string; emoji: string }[] = [
    { id: 'mpesa', label: 'M-Pesa', emoji: '📱' },
    { id: 'bank', label: 'Bank', emoji: '🏦' },
    { id: 'withdraw', label: 'Withdraw', emoji: '💸' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Deposit & Withdraw</Text>

      <View style={styles.modeRow}>
        {MODES.map(m => (
          <TouchableOpacity key={m.id} onPress={() => { setMode(m.id); setBankInstructions(null); }}
            style={[styles.modeBtn, mode === m.id && styles.modeBtnActive]}>
            <Text style={styles.modeEmoji}>{m.emoji}</Text>
            <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        {/* M-Pesa */}
        {mode === 'mpesa' && (
          <>
            <Text style={styles.cardTitle}>M-Pesa Deposit</Text>
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>You'll receive an STK push. Enter your M-Pesa PIN to complete.</Text>
            </View>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="+254700000000" placeholderTextColor="#64748b" keyboardType="phone-pad" value={mpesa.phone} onChangeText={v => setMpesa(f => ({ ...f, phone: v }))} />
            <Text style={styles.label}>Amount (KES)</Text>
            <TextInput style={styles.input} placeholder="e.g. 5000" placeholderTextColor="#64748b" keyboardType="numeric" value={mpesa.amount} onChangeText={v => setMpesa(f => ({ ...f, amount: v }))} />
            <TouchableOpacity style={styles.btn} onPress={submitMpesa} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send M-Pesa Prompt</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Bank */}
        {mode === 'bank' && !bankInstructions && (
          <>
            <Text style={styles.cardTitle}>Bank Transfer</Text>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.currencyRow}>
              {['USD', 'GBP', 'KES'].map(c => (
                <TouchableOpacity key={c} onPress={() => setBank(f => ({ ...f, currency: c }))}
                  style={[styles.currencyBtn, bank.currency === c && styles.currencyBtnActive]}>
                  <Text style={[styles.currencyText, bank.currency === c && styles.currencyTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} placeholder="1000.00" placeholderTextColor="#64748b" keyboardType="numeric" value={bank.amount} onChangeText={v => setBank(f => ({ ...f, amount: v }))} />
            <TouchableOpacity style={styles.btn} onPress={submitBank} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Get Bank Details</Text>}
            </TouchableOpacity>
          </>
        )}

        {mode === 'bank' && bankInstructions && (
          <>
            <Text style={styles.cardTitle}>Transfer Details</Text>
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>Funds arrive in 1-3 business days. Use the reference below.</Text>
            </View>
            {[['Bank', bankInstructions.bankName], ['Account', bankInstructions.accountNumber], ['Sort Code', bankInstructions.sortCode], ['Reference', bankInstructions.reference], ['Amount', `${bankInstructions.currency} ${Number(bankInstructions.amount).toFixed(2)}`]].map(([k, v]) => (
              <View key={k} style={styles.detailRow}>
                <Text style={styles.detailKey}>{k}</Text>
                <Text style={styles.detailVal}>{v}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#334155' }]} onPress={() => setBankInstructions(null)}>
              <Text style={styles.btnText}>New Transfer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Withdraw placeholder */}
        {mode === 'withdraw' && (
          <>
            <Text style={styles.cardTitle}>Withdraw Funds</Text>
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>Withdrawals are processed within 1-2 business days.</Text>
            </View>
            <Text style={styles.label}>Amount (KES)</Text>
            <TextInput style={styles.input} placeholder="e.g. 5000" placeholderTextColor="#64748b" keyboardType="numeric" value={withdraw.amount} onChangeText={v => setWithdraw(f => ({ ...f, amount: v }))} />
            <Text style={styles.label}>M-Pesa Phone</Text>
            <TextInput style={styles.input} placeholder="+254700000000" placeholderTextColor="#64748b" keyboardType="phone-pad" value={withdraw.phone} onChangeText={v => setWithdraw(f => ({ ...f, phone: v }))} />
            <TouchableOpacity style={styles.btn} onPress={submitWithdrawal} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Withdrawal</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  modeBtn: { flex: 1, alignItems: 'center', padding: 14, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1.5, borderColor: '#1e293b' },
  modeBtnActive: { borderColor: '#2563EB', backgroundColor: '#172554' },
  modeEmoji: { fontSize: 24 },
  modeLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginTop: 6 },
  modeLabelActive: { color: '#60a5fa' },
  card: { backgroundColor: '#0f172a', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 },
  infoBanner: { backgroundColor: '#172554', borderRadius: 10, padding: 12, marginBottom: 16 },
  infoBannerText: { color: '#93c5fd', fontSize: 13 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 13, fontSize: 15, color: '#f1f5f9', marginBottom: 14 },
  btn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  currencyRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  currencyBtn: { flex: 1, padding: 10, backgroundColor: '#1e293b', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  currencyBtnActive: { borderColor: '#2563EB', backgroundColor: '#172554' },
  currencyText: { color: '#64748b', fontWeight: '700' },
  currencyTextActive: { color: '#60a5fa' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  detailKey: { color: '#64748b', fontSize: 13 },
  detailVal: { color: '#f1f5f9', fontWeight: '600', fontSize: 13, fontFamily: 'monospace' },
});
