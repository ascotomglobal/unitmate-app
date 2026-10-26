'use client';

import React, { useState, useEffect } from 'react';

interface UnitRecord {
  block: number;
  flat: number;
  paid: number;
  lastPaymentDate?: string;
}

interface OutflowRecord {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
}

const DEFAULT_BLOCKS = [325, 326, 327, 328, 329, 330, 331];
const FLATS_PER_BLOCK = 6;
const MONTHLY_RATE = 2000;
const MONTHS_COUNT = 7; // Oct 2025 - Apr 2026
const TARGET_PER_FLAT = MONTHLY_RATE * MONTHS_COUNT; // 14,000

export default function Home() {
  const [units, setUnits] = useState<Record<string, UnitRecord>>({});
  const [outflows, setOutflows] = useState<OutflowRecord[]>([
    { id: 'SEC-OCT-25', title: 'Security Guard Allowances (Oct)', category: 'Security', date: '2025-10-31', amount: 40000 },
    { id: 'ZONE-OCT-25', title: 'Zone B Central Levy (Oct @ ₦200/flat)', category: 'Zonal Dues', date: '2025-10-31', amount: 8400 }
  ]);
  
  const [selectedBlock, setSelectedBlock] = useState('325');
  const [selectedFlat, setSelectedFlat] = useState('1');
  const [activeUnit, setActiveUnit] = useState<any>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [isExco, setIsExco] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('Security');
  const [copied, setCopied] = useState(false);

  // Initialize or load all 42 flats
  useEffect(() => {
    const savedUnits = localStorage.getItem('unitmate_units');
    const savedOutflows = localStorage.getItem('unitmate_outflows');
    
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
    } else {
      const initial: Record<string, UnitRecord> = {};
      DEFAULT_BLOCKS.forEach(b => {
        for (let f = 1; f <= FLATS_PER_BLOCK; f++) {
          initial[`${b}-${f}`] = { block: b, flat: f, paid: 0 };
        }
      });
      setUnits(initial);
      localStorage.setItem('unitmate_units', JSON.stringify(initial));
    }

    if (savedOutflows) {
      setOutflows(JSON.parse(savedOutflows));
    }
  }, []);

  const saveUnits = (updated: Record<string, UnitRecord>) => {
    setUnits(updated);
    localStorage.setItem('unitmate_units', JSON.stringify(updated));
  };

  const saveOutflows = (updated: OutflowRecord[]) => {
    setOutflows(updated);
    localStorage.setItem('unitmate_outflows', JSON.stringify(updated));
  };

  // Lookup Unit
  const handleLookup = () => {
    const key = `${selectedBlock}-${selectedFlat}`;
    const record = units[key] || { block: Number(selectedBlock), flat: Number(selectedFlat), paid: 0 };
    setActiveUnit(record);
  };

  // Exco Updates Payment for a Flat
  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit) return;
    const key = `${activeUnit.block}-${activeUnit.flat}`;
    const amt = Number(editAmount);
    if (isNaN(amt) || amt < 0) return alert('Enter a valid amount');
    
    const updated = {
      ...units,
      [key]: {
        ...units[key],
        paid: amt,
        lastPaymentDate: new Date().toISOString().split('T')[0]
      }
    };
    saveUnits(updated);
    setActiveUnit(updated[key]);
    setEditAmount('');
    alert(`Updated Block ${activeUnit.block}, Flat ${activeUnit.flat} to ₦${amt.toLocaleString()}`);
  };

  // Exco Adds New Outflow Voucher
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newExpenseAmount);
    if (!newExpenseTitle || isNaN(amt) || amt <= 0) return alert('Enter valid expense details');
    
    const newEntry: OutflowRecord = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      title: newExpenseTitle,
      category: newExpenseCat,
      date: new Date().toISOString().split('T')[0],
      amount: amt
    };
    const updated = [newEntry, ...outflows];
    saveOutflows(updated);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    alert('Expense recorded successfully');
  };

  // Financial Calculations
  const totalInflows = Object.values(units).reduce((acc, curr) => acc + (curr.paid || 0), 0);
  const totalOutflows = outflows.reduce((acc, curr) => acc + curr.amount, 0);
  const liquidReserve = totalInflows - totalOutflows;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B132B', color: '#E0E1DD', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 16px 14px 60px; }
        .card { background: #1C2541; border: 1px solid #2B3A67; border-radius: 14px; padding: 18px; margin-bottom: 16px; }
        .nav-btn { background: #243054; border: 1px solid #3A4D7C; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .btn-emerald { background: #10B981; border: none; color: #064E3B; font-weight: 700; padding: 10px 16px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 14px; }
        select, input { width: 100%; background: #0F172A; border: 1px solid #334155; color: #fff; padding: 10px 12px; border-radius: 8px; font-size: 13px; outline: none; margin-top: 6px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .stat-card { background: #151D35; border: 1px solid #253359; border-radius: 10px; padding: 10px; text-align: center; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
        .badge-green { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .badge-amber { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.4); }
        .badge-red { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.4); }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#090D1C', borderBottom: '1px solid #1C2541', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="#151D35" />
              <path d="M 24 28 V 56 C 24 64 30 70 38 70 C 46 70 52 64 52 56 V 28 H 42 V 54 C 42 57 40 59 38 59 C 36 59 34 57 34 54 V 28 H 24 Z" fill="#10B981" />
              <path d="M 50 36 L 63 54 L 76 36 H 86 V 68 H 76 V 49 L 63 67 L 50 49 V 68 H 40 V 36 H 50 Z" fill="#34D399" />
              <path d="M 18 64 L 38 82 L 84 32" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>Unit<span style={{ color: '#10B981' }}>Mate</span></span>
                <span style={{ fontSize: '9px', background: '#243054', color: '#6EE7B7', padding: '2px 6px', borderRadius: '4px' }}>Ascotom</span>
              </div>
              <p style={{ fontSize: '10px', color: '#8D99AE' }}>Action Unit (Blk 325-331) • Zone B</p>
            </div>
          </div>
          <button className="nav-btn" onClick={() => isExco ? setIsExco(false) : setShowPinModal(true)}>
            {isExco ? 'Exit Admin' : 'Exco Login'}
          </button>
        </div>
      </header>

      <div className="container">
        {/* Estate Dashboard Metrics */}
        <div className="stat-grid">
          <div className="stat-card">
            <div style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Collected</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#34D399', marginTop: '2px' }}>₦{totalInflows.toLocaleString()}</div>
            <div style={{ fontSize: '9px', color: '#8D99AE' }}>42 Units Total</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Expenses</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#F87171', marginTop: '2px' }}>₦{totalOutflows.toLocaleString()}</div>
            <div style={{ fontSize: '9px', color: '#8D99AE' }}>{outflows.length} Vouchers</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Reserve</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: liquidReserve >= 0 ? '#38BDF8' : '#F87171', marginTop: '2px' }}>₦{liquidReserve.toLocaleString()}</div>
            <div style={{ fontSize: '9px', color: '#8D99AE' }}>Liquid Balance</div>
          </div>
        </div>

        {/* Resident Unit Portal */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Resident Dues Portal</h2>
          <p style={{ fontSize: '11px', color: '#8D99AE', marginBottom: '12px' }}>Select your Block & Flat to view your current dues record.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Select Block</label>
              <select value={selectedBlock} onChange={(e) => { setSelectedBlock(e.target.value); setActiveUnit(null); }}>
                {DEFAULT_BLOCKS.map(b => (
                  <option key={b} value={b}>Block {b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Select Flat</label>
              <select value={selectedFlat} onChange={(e) => { setSelectedFlat(e.target.value); setActiveUnit(null); }}>
                {[1, 2, 3, 4, 5, 6].map(f => (
                  <option key={f} value={f}>Flat {f}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button className="btn-emerald" onClick={handleLookup}>View Account Statement</button>
          </div>

          {activeUnit && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #2B3A67' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Block {activeUnit.block}, Flat {activeUnit.flat}</h3>
                <span className={`badge ${
                  activeUnit.paid >= TARGET_PER_FLAT ? 'badge-green' : activeUnit.paid > 0 ? 'badge-amber' : 'badge-red'
                }`}>
                  {activeUnit.paid >= TARGET_PER_FLAT ? 'Fully Reconciled' : activeUnit.paid > 0 ? 'Part Payment' : 'Unpaid'}
                </span>
              </div>

              {/* Dedicated Virtual Account */}
              <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px', margin: '12px 0', border: '1px solid #1E293B' }}>
                <div style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Dedicated Inflow Account (Monnify)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#34D399', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    9928{activeUnit.block}{activeUnit.flat}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(`9928${activeUnit.block}${activeUnit.flat}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: '#8D99AE', marginTop: '4px' }}>Wema Bank • UnitMate - Blk {activeUnit.block} Flt {activeUnit.flat}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Target Due</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>₦{TARGET_PER_FLAT.toLocaleString()}</div>
                </div>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Total Paid</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>₦{(activeUnit.paid || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Balance</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#F87171' }}>₦{Math.max(0, TARGET_PER_FLAT - (activeUnit.paid || 0)).toLocaleString()}</div>
                </div>
              </div>

              {/* In-App Exco Editor: Adjust payment on this flat directly */}
              {isExco && (
                <form onSubmit={handleUpdatePayment} style={{ marginTop: '14px', background: '#111827', padding: '12px', borderRadius: '8px', border: '1px dashed #10B981' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>ADMIN: Update Flat Payment Amount</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input 
                      type="number" 
                      placeholder="Enter new total paid (e.g. 14000)" 
                      value={editAmount} 
                      onChange={(e) => setEditAmount(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <button type="submit" className="nav-btn" style={{ background: '#10B981', color: '#064E3B', fontWeight: 700 }}>
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Transparency Ledger */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Community Transparency Ledger</h2>
              <p style={{ fontSize: '10px', color: '#8D99AE' }}>Security (₦40k/mo), Zonal Levy (₦8.4k/mo), and repairs</p>
            </div>
            <button className="nav-btn" onClick={() => setShowLedger(!showLedger)}>
              {showLedger ? 'Hide' : `View (${outflows.length})`}
            </button>
          </div>

          {showLedger && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #2B3A67', paddingTop: '10px' }}>
              {outflows.map((v) => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #253359' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{v.title}</div>
                    <div style={{ fontSize: '10px', color: '#8D99AE' }}>{v.category} • {v.date}</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#F87171' }}>-₦{v.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exco Admin Expense Entry */}
        {isExco && (
          <div className="card" style={{ border: '1px solid #10B981' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginBottom: '8px' }}>ADMIN: Log New Estate Outflow</h3>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Expense Description (e.g. Nov Security Allowance)" 
                value={newExpenseTitle} 
                onChange={(e) => setNewExpenseTitle(e.target.value)} 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Amount (e.g. 40000)" 
                  value={newExpenseAmount} 
                  onChange={(e) => setNewExpenseAmount(e.target.value)} 
                />
                <select value={newExpenseCat} onChange={(e) => setNewExpenseCat(e.target.value)}>
                  <option value="Security">Security</option>
                  <option value="Zonal Dues">Zonal Dues</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="UnitMate Fee">UnitMate Admin Fee</option>
                </select>
              </div>
              <button type="submit" className="btn-emerald" style={{ marginTop: '6px' }}>Add Outflow Voucher</button>
            </form>
          </div>
        )}

        <footer style={{ textAlign: 'center', fontSize: '10px', color: '#64748B', marginTop: '20px' }}>
          UnitMate Pilot • Managed by <strong>Ascotom Global</strong> for Action Unit (Blocks 325–331)
        </footer>
      </div>

      {/* Exco Passcode Modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#1C2541', border: '1px solid #2B3A67', borderRadius: '14px', padding: '20px', maxWidth: '300px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Exco Passcode</h3>
            <p style={{ fontSize: '11px', color: '#8D99AE', margin: '4px 0 12px' }}>Enter your administrator PIN</p>
            <input 
              type="password" 
              maxLength={6} 
              autoFocus 
              placeholder="Enter PIN" 
              value={pinInput} 
              onChange={(e) => setPinInput(e.target.value)} 
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '16px', margin: 0 }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="nav-btn" style={{ flex: 1 }} onClick={() => setShowPinModal(false)}>Cancel</button>
              <button className="btn-emerald" style={{ flex: 1, padding: '8px' }} onClick={() => {
                if (pinInput === '2026') {
                  setIsExco(true);
                  setShowPinModal(false);
                  setPinInput('');
                } else {
                  alert('Invalid PIN');
                }
              }}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
