'use client';

import React, { useState } from 'react';

const mockUnits: Record<string, { block: string; flat: string; resident: string; target: string; paid: string; balance: string; status: string; va: string }> = {
  '325-1': { block: 'Block 325', flat: 'Flat 1', resident: 'Mr. Adebayo', target: '₦14,000', paid: '₦14,000', balance: '₦0', status: 'Reconciled', va: '9928400101' },
  '325-2': { block: 'Block 325', flat: 'Flat 2', resident: 'Resident', target: '₦14,000', paid: '₦6,000', balance: '₦8,000', status: 'Part Payment', va: '9928400102' },
  '326-1': { block: 'Block 326', flat: 'Flat 1', resident: 'Resident', target: '₦14,000', paid: '₦14,000', balance: '₦0', status: 'Reconciled', va: '9928400201' },
};

const mockVouchers = [
  { id: 'SEC-04-2026', title: 'Security Guards Monthly Allowances', date: '05 Apr 2026', amount: '₦90,000', cat: 'Security' },
  { id: 'SL-03-2026', title: 'Solar Streetlight Battery Replacement', date: '20 Mar 2026', amount: '₦45,000', cat: 'Repairs' },
  { id: 'SAN-03-2026', title: 'Drainage Evacuation & Sanitation', date: '10 Mar 2026', amount: '₦35,000', cat: 'Sanitation' },
];

export default function Home() {
  const [selectedUnitKey, setSelectedUnitKey] = useState('');
  const [activeUnit, setActiveUnit] = useState<any>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showExcoModal, setShowExcoModal] = useState(false);
  const [excoPin, setExcoPin] = useState('');
  const [isExcoAuthenticated, setIsExcoAuthenticated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLookup = () => {
    if (selectedUnitKey && mockUnits[selectedUnitKey]) {
      setActiveUnit(mockUnits[selectedUnitKey]);
    } else {
      alert('Please select your Block and Flat.');
    }
  };

  const handleExcoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (excoPin === '2026') {
      setIsExcoAuthenticated(true);
      setShowExcoModal(false);
      setExcoPin('');
    } else {
      alert('Access Denied: Invalid Exco PIN');
      setExcoPin('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B132B', color: '#E0E1DD', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px 16px 60px; }
        .card { background: #1C2541; border: 1px solid #2B3A67; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        .nav-btn { background: #243054; border: 1px solid #3A4D7C; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-emerald { background: #10B981; border: none; color: #064E3B; font-weight: 700; padding: 12px 20px; border-radius: 10px; cursor: pointer; width: 100%; font-size: 14px; }
        .btn-emerald:hover { background: #34D399; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-green { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .badge-amber { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.4); }
        select, input { width: 100%; background: #0F172A; border: 1px solid #334155; color: #fff; padding: 12px 14px; border-radius: 10px; font-size: 14px; outline: none; margin-top: 8px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: #151D35; border: 1px solid #253359; border-radius: 12px; padding: 12px; text-align: center; }
        .stat-title { font-size: 11px; color: #8D99AE; text-transform: uppercase; font-weight: 600; }
        .stat-val { font-size: 14px; font-weight: 800; color: #fff; margin-top: 4px; }
      `}</style>

      {/* Header with Visual Monogram Logo */}
      <header style={{ backgroundColor: '#090D1C', borderBottom: '1px solid #1C2541', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            
            {/* Visual Vector Monogram Icon (Concept 1) */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="20" fill="#151D35" />
              {/* Unit U Block */}
              <path d="M 24 28 V 56 C 24 64 30 70 38 70 C 46 70 52 64 52 56 V 28 H 42 V 54 C 42 57 40 59 38 59 C 36 59 34 57 34 54 V 28 H 24 Z" fill="#10B981" />
              {/* Mate M Block */}
              <path d="M 50 36 L 63 54 L 76 36 H 86 V 68 H 76 V 49 L 63 67 L 50 49 V 68 H 40 V 36 H 50 Z" fill="#34D399" />
              {/* Trust Checkmark Overlay */}
              <path d="M 18 64 L 38 82 L 84 32" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
                  Unit<span style={{ color: '#10B981' }}>Mate</span>
                </span>
                <span style={{ fontSize: '10px', background: '#243054', color: '#6EE7B7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  Ascotom Global
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#8D99AE', marginTop: '2px' }}>Action Unit • Zone B, Jakande Estate</p>
            </div>
          </div>

          <button 
            className="nav-btn" 
            onClick={() => {
              if (isExcoAuthenticated) setIsExcoAuthenticated(false);
              else setShowExcoModal(true);
            }}
          >
            {isExcoAuthenticated ? 'Logout Exco' : 'Exco Login'}
          </button>
        </div>
      </header>

      <div className="container">
        
        {/* High-Level Overview Metrics */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-title">Target Period</div>
            <div className="stat-val">Oct 25 – Apr 26</div>
            <div style={{ fontSize: '10px', color: '#8D99AE', marginTop: '2px' }}>7 Mos @ ₦2k/mo</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Disbursed</div>
            <div className="stat-val" style={{ color: '#F87171' }}>₦170,000</div>
            <div style={{ fontSize: '10px', color: '#8D99AE', marginTop: '2px' }}>3 Vouchers</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Liquid Reserve</div>
            <div className="stat-val" style={{ color: '#34D399' }}>₦122,000</div>
            <div style={{ fontSize: '10px', color: '#8D99AE', marginTop: '2px' }}>Operational</div>
          </div>
        </div>

        {/* Resident Private Access Portal */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Resident Dues Access</h2>
          <p style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '16px' }}>Select your residence to view payment credentials and reconciliation status.</p>
          
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#8D99AE' }}>Select Your Residence</label>
          <select 
            value={selectedUnitKey} 
            onChange={(e) => {
              setSelectedUnitKey(e.target.value);
              setActiveUnit(null);
            }}
          >
            <option value="">-- Choose Flat --</option>
            <option value="325-1">Block 325, Flat 1</option>
            <option value="325-2">Block 325, Flat 2</option>
            <option value="326-1">Block 326, Flat 1</option>
          </select>

          <div style={{ marginTop: '16px' }}>
            <button className="btn-emerald" onClick={handleLookup}>
              View Unit Statement
            </button>
          </div>

          {/* Statement View (Visible Only After Selection) */}
          {activeUnit && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #2B3A67' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{activeUnit.block}, {activeUnit.flat}</h3>
                  <p style={{ fontSize: '12px', color: '#8D99AE' }}>Registered: {activeUnit.resident}</p>
                </div>
                <span className={`badge ${activeUnit.status === 'Reconciled' ? 'badge-green' : 'badge-amber'}`}>
                  {activeUnit.status}
                </span>
              </div>

              <div style={{ background: '#0F172A', borderRadius: '12px', padding: '14px', marginBottom: '14px', border: '1px solid #1E293B' }}>
                <div style={{ fontSize: '11px', color: '#8D99AE', textTransform: 'uppercase', fontWeight: 600 }}>Dedicated Inflow Account</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1px', color: '#34D399', fontFamily: 'monospace' }}>
                    {activeUnit.va}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(activeUnit.va);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: '#8D99AE', marginTop: '6px' }}>
                  Wema Bank (Monnify) • UnitMate - {activeUnit.block} {activeUnit.flat}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: '#151D35', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#8D99AE' }}>Target</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{activeUnit.target}</div>
                </div>
                <div style={{ background: '#151D35', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#8D99AE' }}>Paid</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34D399' }}>{activeUnit.paid}</div>
                </div>
                <div style={{ background: '#151D35', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#8D99AE' }}>Balance</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171' }}>{activeUnit.balance}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Community Transparency Ledger */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Community Transparency Ledger</h2>
              <p style={{ fontSize: '11px', color: '#8D99AE' }}>Audited outflows verified by Action Unit Exco</p>
            </div>
            <button 
              className="nav-btn"
              onClick={() => setShowLedger(!showLedger)}
            >
              {showLedger ? 'Hide' : 'Expand (3)'}
            </button>
          </div>

          {showLedger && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #2B3A67', paddingTop: '12px' }}>
              {mockVouchers.map((voucher) => (
                <div key={voucher.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #253359' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{voucher.title}</div>
                    <div style={{ fontSize: '11px', color: '#8D99AE', marginTop: '2px' }}>{voucher.cat} • {voucher.date} • Ref: {voucher.id}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171' }}>-{voucher.amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exco Management Controls (Protected) */}
        {isExcoAuthenticated && (
          <div className="card" style={{ border: '1px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>Exco Administrative Actions</h2>
              <span className="badge badge-green">Authorized</span>
            </div>
            <p style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '16px' }}>Zone B Executive Committee privileged functions.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="nav-btn" style={{ flex: 1 }} onClick={() => alert('Opening Outflow Voucher Creator...')}>+ Post Expense Voucher</button>
              <button className="nav-btn" style={{ flex: 1 }} onClick={() => alert('Reconciling Monnify Inflows...')}>Sync Bank Inflows</button>
            </div>
          </div>
        )}

        <footer style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '30px' }}>
          UnitMate Platform • Managed by <strong>Ascotom Global Services</strong> for Action Unit, Zone B
        </footer>
      </div>

      {/* Exco PIN Modal */}
      {showExcoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100 }}>
          <div style={{ background: '#1C2541', border: '1px solid #2B3A67', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Exco PIN Authentication</h3>
            <p style={{ fontSize: '12px', color: '#8D99AE', margin: '6px 0 16px' }}>Authorized Action Unit Exco members only.</p>
            <form onSubmit={handleExcoLogin}>
              <input 
                type="password" 
                maxLength={4} 
                autoFocus 
                placeholder="Enter PIN (2026)" 
                value={excoPin} 
                onChange={(e) => setExcoPin(e.target.value)} 
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="nav-btn" style={{ flex: 1 }} onClick={() => setShowExcoModal(false)}>Cancel</button>
                <button type="submit" className="btn-emerald" style={{ flex: 1, padding: '10px' }}>Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
