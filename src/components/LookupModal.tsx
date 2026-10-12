import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  FileCheck2,
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Registration } from '../types/warranty';

interface LookupModalProps {
  onSelectRegistration: (reg: Registration) => void;
  onClose: () => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  onSelectRegistration,
  onClose,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = queryInput.trim();
    if (!q) return;

    setIsSearching(true);
    setNotFound(false);
    setErrorMsg(null);
    setResult(null);

    try {
      // 1. If it looks like a registration ID
      if (q.toUpperCase().startsWith('TM-LW-')) {
        const docRef = doc(db, 'registrations', q.toUpperCase());
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setResult(snap.data() as Registration);
          setIsSearching(false);
          return;
        }
      }

      // 2. Otherwise query by email or mobile
      const regsRef = collection(db, 'registrations');
      // Try email
      const qEmail = query(regsRef, where('email', '==', q.toLowerCase()));
      const snapEmail = await getDocs(qEmail).catch(() => null);
      if (snapEmail && !snapEmail.empty) {
        setResult(snapEmail.docs[0].data() as Registration);
        setIsSearching(false);
        return;
      }

      // Try ID directly
      const docRefDirect = doc(db, 'registrations', q);
      const snapDirect = await getDoc(docRefDirect).catch(() => null);
      if (snapDirect && snapDirect.exists()) {
        setResult(snapDirect.data() as Registration);
        setIsSearching(false);
        return;
      }

      setNotFound(true);
    } catch (err: any) {
      console.warn('Lookup restricted or not found:', err);
      // In hardened rules, get is restricted to admin or direct lookup
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#399FC5] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Check Warranty Status</h3>
              <p className="text-xs text-slate-500">Look up your registered product record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Registration ID or Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. TM-LW-2026-XXXXXX or your@email.com"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#399FC5] bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !queryInput.trim()}
            className="w-full py-3 rounded-xl bg-[#399FC5] text-white text-xs font-bold hover:bg-[#2e86a7] disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isSearching ? 'Searching Records...' : 'Verify Status'}</span>
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-slate-900">
                {result.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  result.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : result.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {result.status}
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600">
              <p>
                <strong>Customer:</strong> {result.fullName}
              </p>
              <p>
                <strong>Product:</strong> {result.productName}
              </p>
              <p>
                <strong>Purchase Date:</strong> {result.purchaseDate}
              </p>
            </div>

            <button
              onClick={() => {
                onSelectRegistration(result);
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>View Full Warranty Certificate</span>
            </button>
          </div>
        )}

        {notFound && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              No matching record found
            </p>
            <p className="text-amber-800">
              Please ensure your Registration ID is formatted as <code className="font-mono">TM-LW-2026-XXXXXX</code>. If you just registered, allow a moment or contact <a href="mailto:help@tapmate.in" className="underline font-semibold">help@tapmate.in</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
