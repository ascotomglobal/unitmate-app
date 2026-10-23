'use client';

import './globals.css';
import { useState } from 'react';

const mockFlats = [
  { id: '325-1', block: 'Block 325', flat: 'Flat 1', resident: 'Mr. Adebayo', status: 'Reconciled', target: 14000, paid: 14000, va: '9928400101' },
  { id: '325-2', block: 'Block 325', flat: 'Flat 2', resident: 'Resident', status: 'Pending', target: 14000, paid: 6000, va: '9928400102' },
  { id: '326-1', block: 'Block 326', flat: 'Flat 1', resident: 'Resident', status: 'Reconciled', target: 14000, paid: 14000, va: '9928400201' },
];

const mockOutflows = [
  { id: 'SEC-04-2026', title: 'Security Guards Allowances (Day & Night)', cat: 'Security', date: '2026-04-05', amount: 90000 },
  { id: 'SL-03-2026', title: 'Solar Streetlight Battery Replacement', cat: 'Maintenance', date: '2026-03-20', amount: 45000 },
  { id: 'SAN-03-2026', title: 'Quarterly Drainage Evacuation', cat: 'Sanitation', date: '2026-03-10', amount: 35000 },
];

export default function Home() {
  const [selectedFlatId, setSelectedFlatId] = useState('325-1');
  const [showLedger, setShowLedger] = useState(false);
  const [excoUnlocked, setExcoUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFlat = mockFlats.find(f => f.id === selectedFlatId) || mockFlats[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFlat.va);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setExcoUnlocked(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('Invalid Exco PIN');
      setPin('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Top Navbar with Interlocking UM Monogram */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Concept 1 Monogram Emblem */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
              <span className="text-emerald-400 font-black tracking-tighter text-xl">U</span>
              <span className="text-white font-black tracking-tighter text-xl -ml-0.5">M</span>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <span className="text-slate-950 text-[8px] font-black">✓</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg text-white tracking-tight">
                  Unit<span className="text-emerald-400">Mate</span>
                </h1>
                <span className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-900/60 font-medium">
                  Ascotom Global
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Action Unit • Zone B, Jakande Estate</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (excoUnlocked) setExcoUnlocked(false);
              else setShowPinModal(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              excoUnlocked 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {excoUnlocked ? 'Exco Mode (Active)' : 'Exco Login'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* High-Level Estate Summary Cards */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Target Period</p>
            <p className="text-sm font-bold text-white mt-1">Oct 2025 – Apr 2026</p>
            <p className="text-[10px] text-slate-500 mt-0.5">7 Mos @ ₦2,000/mo</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Verified Outflows</p>
            <p className="text-sm font-bold text-rose-400 mt-1">₦170,000</p>
            <p className="text-[10px] text-slate-500 mt-0.5">3 audited vouchers</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Liquid Reserve</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">₦122,000</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Treasury balance</p>
          </div>
        </section>

        {/* Resident Unit Portal (Privacy-Protected Dropdown) */}
        <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Find Your Unit Ledger</h2>
              <p className="text-xs text-slate-400">Select your flat to view dedicated transfer details</p>
            </div>
            <select
              value={selectedFlatId}
              onChange={(e) => setSelectedFlatId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="325-1">Block 325, Flat 1 (Mr. Adebayo)</option>
              <option value="325-2">Block 325, Flat 2</option>
              <option value="326-1">Block 326, Flat 1</option>
            </select>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contribution Status</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-black text-white">{selectedFlat.block}, {selectedFlat.flat}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  selectedFlat.status === 'Reconciled' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedFlat.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Target: <span className="text-slate-200">₦{selectedFlat.target.toLocaleString()}</span> • Paid: <span className="text-emerald-400 font-semibold">₦{selectedFlat.paid.toLocaleString()}</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dedicated Virtual Account</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-mono font-bold text-white tracking-wider">{selectedFlat.va}</span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-semibold border border-slate-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Bank: <span className="text-slate-200">Wema Bank (Monnify)</span> • Name: <span className="text-slate-200">UnitMate - {selectedFlat.block} {selectedFlat.flat}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Collapsible Transparency Ledger */}
        <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Action Unit Transparency Ledger</h2>
              <p className="text-xs text-slate-400">Audited outflows and verified receipts</p>
            </div>
            <button
              onClick={() => setShowLedger(!showLedger)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
            >
              {showLedger ? 'Collapse Ledger ▲' : 'View Ledger (3) ▼'}
            </button>
          </div>

          {showLedger && (
            <div className="mt-4 space-y-2.5 border-t border-slate-800/80 pt-4">
              {mockOutflows.map((outflow) => (
                <div key={outflow.id} className="bg-slate-900/60 border border-slate-800/70 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{outflow.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{outflow.cat} • {outflow.date} • Ref: {outflow.id}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-400">-₦{outflow.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Exco PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white">Enter Exco Passcode</h3>
            <p className="text-xs text-slate-400 mt-1">Authorized personnel only</p>
            <form onSubmit={handlePinSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                maxLength={4}
                value={pin}
                placeholder="Enter 4-digit PIN (2026)"
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-white outline-none focus:border-emerald-500"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
