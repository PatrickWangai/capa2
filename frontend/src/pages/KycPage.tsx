import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, ShieldX, Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge, PageLoader } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const DOC_TYPES = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'UTILITY_BILL', label: 'Utility Bill (address proof)' },
  { value: 'SELFIE', label: 'Selfie / Liveness check' },
];

const STEPS = [
  { id: 'NATIONAL_ID', label: 'Government ID', required: true },
  { id: 'SELFIE', label: 'Selfie Verification', required: true },
  { id: 'UTILITY_BILL', label: 'Proof of Address', required: false },
];

export default function KycPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ documentType: 'NATIONAL_ID', documentNumber: '', issueDate: '', expiryDate: '', countryIssued: 'KE' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => api.get('/api/kyc/status').then(r => r.data),
  });

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file.');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.post('/api/kyc/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document submitted for review!');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  if (isLoading) return <PageLoader />;

  const docs = data?.documents || [];
  const kycStatus = data?.kycStatus || user?.kycStatus || 'NOT_STARTED';

  const StatusBanner = () => {
    const map = {
      APPROVED: { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-900/20 border-green-700/40', msg: 'Your identity is verified. You can trade and withdraw.' },
      PENDING:  { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700/40', msg: 'Documents submitted. Review takes 1-2 business days.' },
      REJECTED: { icon: ShieldX, color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/40', msg: 'Some documents were rejected. Please re-submit below.' },
      NOT_STARTED: { icon: ShieldX, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', msg: 'Complete identity verification to unlock all features.' },
    };
    const s = map[kycStatus as keyof typeof map] || map.NOT_STARTED;
    return (
      <div className={clsx('flex items-center gap-4 p-4 border rounded-xl', s.bg)}>
        <s.icon size={28} className={s.color} />
        <div>
          <p className={clsx('font-semibold', s.color)}>KYC Status: {kycStatus.replace('_', ' ')}</p>
          <p className="text-sm text-gray-400 mt-0.5">{s.msg}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
        <p className="text-gray-400 mt-1">KYC is required to deposit, trade, and withdraw</p>
      </div>

      <StatusBanner />

      {/* Progress steps */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Verification Steps</h2>
        <div className="space-y-3">
          {STEPS.map(step => {
            const doc = docs.find((d: any) => d.documentType === step.id);
            const Icon = doc?.status === 'APPROVED' ? CheckCircle : doc?.status === 'REJECTED' ? XCircle : doc ? Clock : FileText;
            const color = doc?.status === 'APPROVED' ? 'text-green-400' : doc?.status === 'REJECTED' ? 'text-red-400' : doc ? 'text-yellow-400' : 'text-gray-500';
            return (
              <div key={step.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {Icon && <span className={color}><Icon size={18} /></span>}
                  <div>
                    <p className="text-sm font-medium text-white">{step.label} {!step.required && <span className="text-gray-500 text-xs">(optional)</span>}</p>
                    {doc?.rejectionReason && <p className="text-xs text-red-400 mt-0.5">{doc.rejectionReason}</p>}
                  </div>
                </div>
                {doc ? <Badge variant={doc.status === 'APPROVED' ? 'green' : doc.status === 'REJECTED' ? 'red' : 'yellow'}>{doc.status}</Badge>
                  : <Badge variant="gray">NOT SUBMITTED</Badge>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload form */}
      {kycStatus !== 'APPROVED' && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Upload size={18} className="text-blue-400" /> Upload Document</h2>
          <form onSubmit={upload} className="space-y-4">
            <div>
              <label className="label">Document Type</label>
              <select className="input" value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}>
                {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Document Number</label>
                <input className="input" placeholder="e.g. 12345678" value={form.documentNumber} onChange={e => setForm(f => ({ ...f, documentNumber: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country Issued</label>
                <select className="input" value={form.countryIssued} onChange={e => setForm(f => ({ ...f, countryIssued: e.target.value }))}>
                  {[['KE','Kenya'],['US','USA'],['GB','UK'],['UG','Uganda'],['TZ','Tanzania'],['RW','Rwanda'],['NG','Nigeria']].map(([c,n]) => (
                    <option key={c} value={c}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Issue Date</label>
                <input className="input" type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input className="input" type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">File (JPG, PNG, PDF — max 10MB)</label>
              <div
                className={clsx('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors', file ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600')}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <>
                    <FileText size={24} className="mx-auto text-blue-400 mb-2" />
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-400 text-sm">Click to upload or drag & drop</p>
                    <p className="text-gray-600 text-xs mt-1">JPG, PNG, PDF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
            <button type="submit" disabled={uploading || !file} className="btn-primary w-full py-2.5">
              {uploading ? 'Uploading…' : 'Submit Document'}
            </button>
          </form>
        </div>
      )}

      {/* Submitted docs list */}
      {docs.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3">Submitted Documents</h2>
          <div className="space-y-2">
            {docs.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm">
                <div>
                  <p className="text-white font-medium">{DOC_TYPES.find(t => t.value === d.documentType)?.label}</p>
                  <p className="text-gray-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</p>
                  {d.rejectionReason && <p className="text-red-400 text-xs mt-0.5">Reason: {d.rejectionReason}</p>}
                </div>
                <Badge variant={d.status === 'APPROVED' ? 'green' : d.status === 'REJECTED' ? 'red' : 'yellow'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
