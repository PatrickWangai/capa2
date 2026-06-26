import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Badge, Modal, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminKycPage() {
  const [selected, setSelected] = useState<any>(null);
  const [rejReason, setRejReason] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: () => api.get('/api/admin/kyc/pending').then(r => r.data),
    refetchInterval: 15_000,
  });

  const review = async (decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !rejReason.trim()) return toast.error('Please enter a rejection reason.');
    setLoading(true);
    try {
      await api.patch(`/api/admin/kyc/${selected.id}/review`, { decision, rejectionReason: rejReason });
      toast.success(`Document ${decision.toLowerCase()}.`);
      qc.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
      setSelected(null);
      setRejReason('');
    } catch { toast.error('Review failed'); }
    finally { setLoading(false); }
  };

  const docs = data?.documents || [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Review</h1>
        <p className="text-gray-400 mt-1">{docs.length} document{docs.length !== 1 ? 's' : ''} awaiting review</p>
      </div>

      {isLoading ? <PageLoader /> : docs.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
          <p className="font-medium text-white">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No documents pending review.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              {['User', 'Document Type', 'Submitted', 'Number', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {docs.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white text-sm">{d.user?.firstName} {d.user?.lastName}</p>
                    <p className="text-xs text-gray-400">{d.user?.email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="blue">{d.documentType.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm font-mono">{d.documentNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(d); setRejReason(''); }} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm">
                      <Eye size={15} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review KYC Document">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['User', `${selected.user?.firstName} ${selected.user?.lastName}`],
                ['Email', selected.user?.email],
                ['Doc Type', selected.documentType?.replace('_', ' ')],
                ['Doc Number', selected.documentNumber || '—'],
                ['Country', selected.countryIssued || '—'],
                ['Expiry', selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k}><p className="text-gray-500 text-xs">{k}</p><p className="text-white mt-0.5">{v}</p></div>
              ))}
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Document URL</p>
              <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs break-all hover:underline">{selected.fileUrl}</a>
            </div>
            <div>
              <label className="label">Rejection Reason (required if rejecting)</label>
              <textarea className="input h-20 resize-none" placeholder="e.g. Document unclear or expired…" value={rejReason} onChange={e => setRejReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => review('APPROVED')} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={() => review('REJECTED')} disabled={loading} className="btn-danger flex-1 flex items-center justify-center gap-2">
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
