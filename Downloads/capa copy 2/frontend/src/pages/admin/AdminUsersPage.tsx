import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Search, UserCheck, UserX } from 'lucide-react';
import { Badge, Modal, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/api/admin/users', { params: { search, limit: 50 } }).then(r => r.data),
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/users/${id}`, { status });
      toast.success(`User ${status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelected(null);
    } catch { toast.error('Action failed'); }
  };

  const kycColor: Record<string, 'green'|'yellow'|'red'|'gray'> = { APPROVED: 'green', PENDING: 'yellow', REJECTED: 'red', NOT_STARTED: 'gray' };
  const statusColor: Record<string, 'green'|'yellow'|'red'|'gray'> = { ACTIVE: 'green', PENDING: 'yellow', SUSPENDED: 'red', CLOSED: 'gray' };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Users</h1><p className="text-gray-400 mt-1">Manage platform users</p></div>
        <div className="text-sm text-gray-400">{data?.total || 0} total</div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              {['User', 'Country', 'KYC', 'Status', 'Joined', 'Last Login', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {(data?.users || []).map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white text-sm">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{u.countryOfResidence || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={kycColor[u.kycStatus] || 'gray'}>{u.kycStatus}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusColor[u.status] || 'gray'}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(u)} className="text-xs text-blue-400 hover:text-blue-300">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Manage — ${selected?.firstName} ${selected?.lastName}`}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Email', selected.email], ['Phone', selected.phone || '—'], ['KYC', selected.kycStatus], ['Status', selected.status], ['Country', selected.countryOfResidence || '—'], ['Joined', new Date(selected.createdAt).toLocaleDateString()]].map(([k,v]) => (
                <div key={k}><p className="text-gray-500 text-xs">{k}</p><p className="text-white font-medium mt-0.5">{v}</p></div>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-800">
              {selected.status !== 'ACTIVE' && <button onClick={() => updateStatus(selected.id, 'ACTIVE')} className="btn-primary flex items-center gap-1.5 text-sm"><UserCheck size={15} /> Activate</button>}
              {selected.status !== 'SUSPENDED' && <button onClick={() => updateStatus(selected.id, 'SUSPENDED')} className="btn-danger flex items-center gap-1.5 text-sm"><UserX size={15} /> Suspend</button>}
              {selected.status !== 'CLOSED' && <button onClick={() => updateStatus(selected.id, 'CLOSED')} className="btn-secondary text-sm">Close Account</button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
