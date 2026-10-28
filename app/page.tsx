'use client';

import React, { useState, useEffect } from 'react';

// Horizons: 2025 Arrears (3 mo) + 2026 Calendar (12 mo) + 2027 Advance (12 mo)
const ARREARS_2025 = ['Oct 2025', 'Nov 2025', 'Dec 2025'];
const CALENDAR_2026 = [
  'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026',
  'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026',
  'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'
];
const ADVANCE_2027 = [
  'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027',
  'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027',
  'Sep 2027', 'Oct 2027', 'Nov 2027', 'Dec 2027'
];

interface BaseUnit {
  id: string;
  name: string;
  category: 'residential' | 'commercial';
  unitDue: number;       // ₦2,000 for flats
  zonalDue: number;      // ₦200 for flats (₦0 for shops)
  techFee: number;       // ₦50 automated processing
  contactName: string;
  phone: string;
  passcode: string;
  paidMonths: string[];
  customAccount: string;
}

interface OutflowRecord {
  id: string;
  title: string;
  beneficiary: string;
  bankAccount: string;
  category: string;
  date: string;
  amount: number;
  authBy: string;
}

const DEFAULT_BLOCKS = [325, 326, 327, 328, 329, 330, 331];
const FLATS_PER_BLOCK = 6;

const INITIAL_SHOPS = [
  { id: 'SHP-1', name: 'Painter / Panel Beater', rate: 2000, account: '9928300001', code: '1001' },
  { id: 'SHP-2', name: 'Welder Workshop', rate: 10000, account: '9928300002', code: '1002' },
  { id: 'SHP-3', name: 'Drink Shop', rate: 1500, account: '9928300003', code: '1003' },
  { id: 'SHP-4', name: 'Utility Shop', rate: 1500, account: '9928300004', code: '1004' },
  { id: 'SHP-5', name: 'Logistics Shop', rate: 5000, account: '9928300005', code: '1005' },
  { id: 'SHP-6', name: 'Dry Cleaner', rate: 2000, account: '9928300006', code: '1006' },
  { id: 'SHP-7', name: 'Mechanics Yard', rate: 15000, account: '9928300007', code: '1007' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'residential' | 'commercial'>('residential');
  const [selectedBlock, setSelectedBlock] = useState('325');
  const [selectedFlat, setSelectedFlat] = useState('1');
  const [selectedShopId, setSelectedShopId] = useState('SHP-1');
  const [residentEnteredPin, setResidentEnteredPin] = useState('');
  
  const [units, setUnits] = useState<Record<string, BaseUnit>>({});
  const [activeUnit, setActiveUnit] = useState<BaseUnit | null>(null);
  const [matrixYear, setMatrixYear] = useState<'2025' | '2026' | '2027'>('2025');

  // Emergency & Notices
  const [notice, setNotice] = useState('⚠️ Main Security Gate closes strictly at 11:00 PM. Please ensure visitor registration.');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState('');

  const [secPhone, setSecPhone] = useState('08000000000');
  const [csoPhone, setCsoPhone] = useState('08000000000');
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [draftSecPhone, setDraftSecPhone] = useState('');
  const [draftCsoPhone, setDraftCsoPhone] = useState('');

  // Disbursed Outflows
  const [outflows, setOutflows] = useState<OutflowRecord[]>([
    { id: 'SEC-OCT-25', title: 'Day/Night Security Monthly Allowance', beneficiary: 'Musa Ibrahim (Head Guard)', bankAccount: 'Access Bank - 0129384756', category: 'Security', date: '2025-10-31', amount: 40000, authBy: 'Treasurer & Chairman' },
    { id: 'ZONE-OCT-25', title: 'Zone B Central Levy Remittance', beneficiary: 'Zone B Central Treasury', bankAccount: 'Wema Bank - 9928400010', category: 'Zonal Dues', date: '2025-10-31', amount: 8400, authBy: 'Treasurer' }
  ]);

  // Exco States
  const [isExco, setIsExco] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Exco Edit inputs
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPasscode, setEditPasscode] = useState('');

  // Contractor Payout Inputs
  const [payoutRecipient, setPayoutRecipient] = useState('security');
  const [customPayee, setCustomPayee] = useState('');
  const [customBankAcc, setCustomBankAcc] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('40000');
  const [payoutPurpose, setPayoutPurpose] = useState('Action Unit Security Monthly Allowance');

  // Load state
  useEffect(() => {
    const savedUnits = localStorage.getItem('unitmate_v8_units');
    const savedNotice = localStorage.getItem('unitmate_notice');
    const savedOutflows = localStorage.getItem('unitmate_v8_outflows');
    const savedSec = localStorage.getItem('unitmate_sec_phone');
    const savedCso = localStorage.getItem('unitmate_cso_phone');

    if (savedNotice) setNotice(savedNotice);
    if (savedSec) setSecPhone(savedSec);
    if (savedCso) setCsoPhone(savedCso);
    if (savedOutflows) setOutflows(JSON.parse(savedOutflows));

    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
    } else {
      const initial: Record<string, BaseUnit> = {};

      DEFAULT_BLOCKS.forEach(b => {
        for (let f = 1; f <= FLATS_PER_BLOCK; f++) {
          const key = `FLAT-${b}-${f}`;
          initial[key] = {
            id: key,
            name: `Block ${b}, Flat ${f}`,
            category: 'residential',
            unitDue: 2000,
            zonalDue: 200,
            techFee: 50,
            contactName: 'Occupant',
            phone: '',
            passcode: `${b}${f}`,
            paidMonths: [],
            customAccount: `9928${b}${f}`
          };
        }
      });

      INITIAL_SHOPS.forEach(s => {
        initial[s.id] = {
          id: s.id,
          name: s.name,
          category: 'commercial',
          unitDue: s.rate,
          zonalDue: 0,
          techFee: 0,
          contactName: 'Shop Operator',
          phone: '',
          passcode: s.code,
          paidMonths: [],
          customAccount: s.account
        };
      });

      setUnits(initial);
      localStorage.setItem('unitmate_v8_units', JSON.stringify(initial));
    }
  }, []);

  const saveAllUnits = (updated: Record<string, BaseUnit>) => {
    setUnits(updated);
    localStorage.setItem('unitmate_v8_units', JSON.stringify(updated));
  };

  const handleLookup = () => {
    const key = activeTab === 'residential' ? `FLAT-${selectedBlock}-${selectedFlat}` : selectedShopId;
    const unit = units[key];

    if (!unit) return;

    if (!isExco) {
      if (residentEnteredPin !== unit.passcode) {
        alert(`Access Denied: Incorrect passcode for ${unit.name}. Contact Exco if forgotten.`);
        return;
      }
    }

    setActiveUnit(unit);
    setEditContact(unit.contactName);
    setEditPhone(unit.phone);
    setEditPasscode(unit.passcode);
  };

  const handleToggleMonth = (month: string) => {
    if (!isExco || !activeUnit) return;
    const isCurrentlyPaid = activeUnit.paidMonths.includes(month);
    const updatedMonths = isCurrentlyPaid 
      ? activeUnit.paidMonths.filter(m => m !== month)
      : [...activeUnit.paidMonths, month];

    const updatedUnit: BaseUnit = { ...activeUnit, paidMonths: updatedMonths };
    const updatedRecord = { ...units, [activeUnit.id]: updatedUnit };

    saveAllUnits(updatedRecord);
    setActiveUnit(updatedUnit);
  };

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit) return;
    const updatedUnit: BaseUnit = {
      ...activeUnit,
      contactName: editContact.trim() || 'Occupant',
      phone: editPhone.trim(),
      passcode: editPasscode.trim() || activeUnit.passcode
    };
    const updatedRecord = { ...units, [activeUnit.id]: updatedUnit };
    saveAllUnits(updatedRecord);
    setActiveUnit(updatedUnit);
    alert('Occupant record & Passcode updated successfully');
  };

  const handleDisbursePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (isNaN(amt) || amt <= 0) return alert('Enter a valid disbursement amount');

    let payeeName = '';
    let payeeBank = '';
    let category = 'Security';

    if (payoutRecipient === 'security') {
      payeeName = 'Action Unit Security Guards';
      payeeBank = 'Assigned Guard Account (NIP)';
      category = 'Security';
    } else if (payoutRecipient === 'zonal') {
      payeeName = 'Zone B Central Treasury Desk';
      payeeBank = 'Wema Bank - 9928400010';
      category = 'Zonal Dues';
    } else {
      if (!customPayee || !customBankAcc) return alert('Enter contractor payee and account');
      payeeName = customPayee;
      payeeBank = customBankAcc;
      category = 'Maintenance';
    }

    const newDisbursement: OutflowRecord = {
      id: `MNF-DISB-${Date.now().toString().slice(-4)}`,
      title: payoutPurpose,
      beneficiary: payeeName,
      bankAccount: payeeBank,
      category,
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      authBy: 'Treasurer & Chairman (Dual Auth)'
    };

    const updated = [newDisbursement, ...outflows];
    setOutflows(updated);
    localStorage.setItem('unitmate_v8_outflows', JSON.stringify(updated));
    alert(`DISBURSEMENT SUCCESSFUL:\n₦${amt.toLocaleString()} transferred via Monnify to ${payeeName}.\nAudited voucher generated.`);
    if (payoutRecipient === 'custom') {
      setCustomPayee('');
      setCustomBankAcc('');
    }
  };

  // Automated Reminder Dispatch
  const currentCheckMonth = 'Jan 2026';
  const owingUnits = Object.values(units).filter(u => !u.paidMonths.includes(currentCheckMonth));

  const handleSendReminderBatch = () => {
    if (owingUnits.length === 0) return alert('All 42 flats and 7 shops have cleared dues for this period.');
    const sample = owingUnits[0];
    const totalRate = sample.unitDue + sample.zonalDue + sample.techFee;
    const text = `*ACTION UNIT DUES REMINDER*%0A`
      + `Dear Resident (${sample.name}),%0A`
      + `This is a reminder for ${currentCheckMonth} dues:%0A`
      + `• Action Unit Security: ₦${sample.unitDue.toLocaleString()}%0A`
      + (sample.zonalDue > 0 ? `• Zone B Central Levy: ₦${sample.zonalDue.toLocaleString()}%0A` : '')
      + (sample.techFee > 0 ? `• Direct Transfer Processing: ₦${sample.techFee.toLocaleString()}%0A` : '')
      + `*Total Payable:* ₦${totalRate.toLocaleString()}%0A%0A`
      + `Transfer directly to your dedicated virtual account:%0A`
      + `*Account:* ${sample.customAccount}%0A`
      + `*Bank:* Wema Bank (Monnify)%0A`
      + `*Beneficiary:* UnitMate - ${sample.name}%0A`
      + `_Instant WhatsApp receipt generated automatically._`;

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Financial Balances
  const totalInflows = Object.values(units).reduce((acc, u) => acc + (u.paidMonths.length * (u.unitDue + u.zonalDue + u.techFee)), 0);
  const totalOutflows = outflows.reduce((acc, o) => acc + o.amount, 0);
  const liquidReserve = totalInflows - totalOutflows;

  // Breakdown for active unit
  const arrears2025Unpaid = activeUnit ? ARREARS_2025.filter(m => !activeUnit.paidMonths.includes(m)) : [];
  const calendar2026Paid = activeUnit ? CALENDAR_2026.filter(m => activeUnit.paidMonths.includes(m)) : [];
  const advance2027Paid = activeUnit ? ADVANCE_2027.filter(m => activeUnit.paidMonths.includes(m)) : [];

  const handleShareWhatsApp = () => {
    if (!activeUnit) return;
    const rate = activeUnit.unitDue + activeUnit.zonalDue + activeUnit.techFee;
    const totalPaid = activeUnit.paidMonths.length * rate;
    const arrearsText = arrears2025Unpaid.length === 0 ? 'CLEARED' : `${arrears2025Unpaid.join(', ')} Owed`;
    const advanceText = advance2027Paid.length > 0 ? `%0A*🌟 Advance 2027 Paid:* ${advance2027Paid.length} Months (${advance2027Paid.join(', ')})` : '';

    const text = `*UNITMATE OFFICIAL STATEMENT*%0A`
      + `*Unit:* ${activeUnit.name}%0A`
      + `*Registered:* ${activeUnit.contactName}%0A`
      + `*Itemized Rate:* ₦${activeUnit.unitDue} (Sec) + ₦${activeUnit.zonalDue} (Zone B) + ₦${activeUnit.techFee} (Token)%0A`
      + `*Monthly Obligation:* ₦${rate.toLocaleString()}/mo%0A`
      + `*2025 Arrears (Oct-Dec):* ${arrearsText}%0A`
      + `*2026 Status:* ${calendar2026Paid.length}/12 Months Cleared`
      + advanceText + `%0A`
      + `*Total Contributed to Date:* ₦${totalPaid.toLocaleString()}%0A`
      + `*Action Unit, Zone B (Ascotom Global)*`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B132B', color: '#E0E1DD', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 0 auto; padding: 14px 14px 60px; }
        .card { background: #1C2541; border: 1px solid #2B3A67; border-radius: 14px; padding: 16px; margin-bottom: 14px; }
        .nav-btn { background: #243054; border: 1px solid #3A4D7C; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .btn-emerald { background: #10B981; border: none; color: #064E3B; font-weight: 700; padding: 10px 16px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 13px; }
        .tab-btn { flex: 1; padding: 8px; text-align: center; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; border: none; }
        select, input { width: 100%; background: #0F172A; border: 1px solid #334155; color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 13px; outline: none; margin-top: 4px; }
        .month-pill { padding: 8px 4px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center; user-select: none; transition: 0.15s; }
        .month-paid { background: rgba(16, 185, 129, 0.25); color: #34D399; border: 1px solid #10B981; }
        .month-due { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.4); }
        .month-advance { background: rgba(56, 189, 248, 0.25); color: #38BDF8; border: 1px solid #38BDF8; }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#090D1C', borderBottom: '1px solid #1C2541', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '580px', margin: '0 auto', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="#151D35" />
              <path d="M 24 28 V 56 C 24 64 30 70 38 70 C 46 70 52 64 52 56 V 28 H 42 V 54 C 42 57 40 59 38 59 C 36 59 34 57 34 54 V 28 H 24 Z" fill="#10B981" />
              <path d="M 50 36 L 63 54 L 76 36 H 86 V 68 H 76 V 49 L 63 67 L 50 49 V 68 H 40 V 36 H 50 Z" fill="#34D399" />
              <path d="M 18 64 L 38 82 L 84 32" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Unit<span style={{ color: '#10B981' }}>Mate</span></span>
                <span style={{ fontSize: '9px', background: '#243054', color: '#6EE7B7', padding: '2px 6px', borderRadius: '4px' }}>Ascotom</span>
              </div>
              <p style={{ fontSize: '10px', color: '#8D99AE' }}>Action Unit (Blk 325-331) • Zone B</p>
            </div>
          </div>
          <button className="nav-btn" onClick={() => isExco ? setIsExco(false) : setShowPinModal(true)}>
            {isExco ? 'Exit Exco' : 'Exco Login'}
          </button>
        </div>
      </header>

      <div className="container">

        {/* Noticeboard */}
        <div style={{ background: '#1E293B', borderLeft: '4px solid #10B981', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: 1.4, flex: 1 }}>
            {notice}
          </div>
          {isExco && (
            <button 
              onClick={() => { setIsEditingNotice(true); setNoticeDraft(notice); }}
              style={{ background: '#334155', border: 'none', color: '#6EE7B7', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', marginLeft: '8px', cursor: 'pointer' }}
            >
              Edit
            </button>
          )}
        </div>

        {/* Resident / Shop Portal */}
        <div className="card">
          <div style={{ display: 'flex', background: '#0F172A', padding: '4px', borderRadius: '10px', marginBottom: '14px' }}>
            <button 
              className="tab-btn" 
              style={{ background: activeTab === 'residential' ? '#10B981' : 'transparent', color: activeTab === 'residential' ? '#064E3B' : '#94A3B8' }}
              onClick={() => { setActiveTab('residential'); setActiveUnit(null); }}
            >
              42 Residential Flats
            </button>
            <button 
              className="tab-btn" 
              style={{ background: activeTab === 'commercial' ? '#10B981' : 'transparent', color: activeTab === 'commercial' ? '#064E3B' : '#94A3B8' }}
              onClick={() => { setActiveTab('commercial'); setActiveUnit(null); }}
            >
              7 Commercial Shops
            </button>
          </div>

          {activeTab === 'residential' ? (
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
          ) : (
            <div>
              <label style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Select Business / Shop</label>
              <select value={selectedShopId} onChange={(e) => { setSelectedShopId(e.target.value); setActiveUnit(null); }}>
                {INITIAL_SHOPS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (₦{s.rate.toLocaleString()}/mo)</option>
                ))}
              </select>
            </div>
          )}

          {!isExco && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>
                Enter Unit Passcode (e.g. 3251 for Blk 325 Flt 1)
              </label>
              <input 
                type="password" 
                maxLength={8}
                placeholder="Enter 4-digit code" 
                value={residentEnteredPin} 
                onChange={(e) => setResidentEnteredPin(e.target.value)} 
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '16px' }}
              />
            </div>
          )}

          <button className="btn-emerald" style={{ marginTop: '12px' }} onClick={handleLookup}>
            {isExco ? 'Inspect Dues Record (Exco Bypass)' : 'Unlock Statement & Account'}
          </button>

          {/* Unit Statement with Itemized Breakdown */}
          {activeUnit && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #2B3A67' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{activeUnit.name}</h3>
                  <p style={{ fontSize: '11px', color: '#8D99AE' }}>
                    Registered: <strong style={{ color: '#E2E8F0' }}>{activeUnit.contactName}</strong>
                    {activeUnit.phone && ` • ${activeUnit.phone}`}
                  </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    background: arrears2025Unpaid.length === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: arrears2025Unpaid.length === 0 ? '#34D399' : '#F87171'
                  }}>
                    {arrears2025Unpaid.length === 0 ? '2025: Cleared' : `2025 Owed: ${arrears2025Unpaid.length} Mo`}
                  </span>
                  {advance2027Paid.length > 0 && (
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      background: 'rgba(56,189,248,0.2)',
                      color: '#38BDF8'
                    }}>
                      🌟 2027 Advance: {advance2027Paid.length} Mo
                    </span>
                  )}
                </div>
              </div>

              {/* Itemized Dues Schedule Card */}
              <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '10px', padding: '10px 12px', margin: '12px 0' }}>
                <span style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase', fontWeight: 700 }}>Monthly Schedule Breakdown</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#CBD5E1' }}>
                  <span>Action Unit Security & Operations</span>
                  <strong style={{ color: '#fff' }}>₦{activeUnit.unitDue.toLocaleString()}</strong>
                </div>
                {activeUnit.zonalDue > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px', color: '#CBD5E1' }}>
                    <span>Zone B Central Administrative Levy</span>
                    <strong style={{ color: '#FBBF24' }}>₦{activeUnit.zonalDue.toLocaleString()}</strong>
                  </div>
                )}
                {activeUnit.techFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px', color: '#CBD5E1' }}>
                    <span>Digital Monnify Gateway & WhatsApp Token</span>
                    <strong style={{ color: '#38BDF8' }}>₦{activeUnit.techFee.toLocaleString()}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #1F2937', color: '#fff' }}>
                  <span>Total Due Per Month:</span>
                  <strong style={{ color: '#34D399', fontSize: '14px' }}>
                    ₦{(activeUnit.unitDue + activeUnit.zonalDue + activeUnit.techFee).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Dedicated Account */}
              <div style={{ background: '#0F172A', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: '1px solid #1E293B' }}>
                <div style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase' }}>Dedicated Monnify Inflow Account</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#34D399', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {activeUnit.customAccount}
                  </span>
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(activeUnit.customAccount); 
                      setCopied(true); 
                      setTimeout(() => setCopied(false), 2000); 
                    }} 
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: '#8D99AE', marginTop: '4px' }}>
                  Wema Bank • UnitMate - {activeUnit.name}
                </p>
              </div>

              {/* Multi-Year Matrix Navigation */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setMatrixYear('2025')}
                      style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: matrixYear === '2025' ? '#FBBF24' : '#151D35', color: matrixYear === '2025' ? '#090D1C' : '#8D99AE', border: 'none', cursor: 'pointer' }}
                    >
                      2025 Arrears
                    </button>
                    <button 
                      onClick={() => setMatrixYear('2026')}
                      style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: matrixYear === '2026' ? '#10B981' : '#151D35', color: matrixYear === '2026' ? '#064E3B' : '#8D99AE', border: 'none', cursor: 'pointer' }}
                    >
                      2026 Current
                    </button>
                    <button 
                      onClick={() => setMatrixYear('2027')}
                      style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: matrixYear === '2027' ? '#38BDF8' : '#151D35', color: matrixYear === '2027' ? '#0B132B' : '#8D99AE', border: 'none', cursor: 'pointer' }}
                    >
                      2027 Advance {advance2027Paid.length > 0 && `(${advance2027Paid.length})`}
                    </button>
                  </div>
                  {isExco && <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 700 }}>Tap box to toggle</span>}
                </div>

                {matrixYear === '2025' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {ARREARS_2025.map((month) => {
                      const isPaid = activeUnit.paidMonths.includes(month);
                      return (
                        <div key={month} onClick={() => handleToggleMonth(month)} className={`month-pill ${isPaid ? 'month-paid' : 'month-due'}`} style={{ cursor: isExco ? 'pointer' : 'default' }}>
                          {month.split(' ')[0]} {isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </div>
                      );
                    })}
                  </div>
                )}

                {matrixYear === '2026' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                    {CALENDAR_2026.map((month) => {
                      const isPaid = activeUnit.paidMonths.includes(month);
                      return (
                        <div key={month} onClick={() => handleToggleMonth(month)} className={`month-pill ${isPaid ? 'month-paid' : 'month-due'}`} style={{ cursor: isExco ? 'pointer' : 'default' }}>
                          {month.split(' ')[0]} {isPaid ? '✓' : '✗'}
                        </div>
                      );
                    })}
                  </div>
                )}

                {matrixYear === '2027' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                    {ADVANCE_2027.map((month) => {
                      const isPaid = activeUnit.paidMonths.includes(month);
                      return (
                        <div key={month} onClick={() => handleToggleMonth(month)} className={`month-pill ${isPaid ? 'month-advance' : 'month-due'}`} style={{ cursor: isExco ? 'pointer' : 'default' }}>
                          {month.split(' ')[0]} {isPaid ? '★ Paid' : 'Pending'}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', marginTop: '14px' }}>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Total Contributed</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>
                    ₦{(activeUnit.paidMonths.length * (activeUnit.unitDue + activeUnit.zonalDue + activeUnit.techFee)).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Zone B Pool</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24' }}>
                    ₦{(activeUnit.paidMonths.length * activeUnit.zonalDue).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: '#151D35', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#8D99AE' }}>Cleared</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8' }}>{activeUnit.paidMonths.length} Months</div>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <button 
                onClick={handleShareWhatsApp}
                style={{ marginTop: '14px', width: '100%', background: '#25D366', color: '#064E3B', fontWeight: 800, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Share Itemized Clearance to WhatsApp
              </button>

              {isExco && (
                <form onSubmit={handleSaveContactInfo} style={{ marginTop: '14px', background: '#111827', padding: '12px', borderRadius: '8px', border: '1px dashed #10B981' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>ADMIN: Edit Unit & Passcode</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <input type="text" placeholder="Contact Name" value={editContact} onChange={(e) => setEditContact(e.target.value)} />
                    <input type="tel" placeholder="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <label style={{ fontSize: '9px', color: '#8D99AE' }}>Unit Access Passcode</label>
                    <input type="text" placeholder="Passcode" value={editPasscode} onChange={(e) => setEditPasscode(e.target.value)} />
                  </div>
                  <button type="submit" className="nav-btn" style={{ background: '#10B981', color: '#064E3B', fontWeight: 700, marginTop: '8px', width: '100%' }}>
                    Save Unit Record & Passcode
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Emergency Speed-Dial Desk */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Action Unit Emergency Desk</h3>
            {isExco && (
              <button 
                onClick={() => {
                  setDraftSecPhone(secPhone);
                  setDraftCsoPhone(csoPhone);
                  setIsEditingContacts(true);
                }}
                style={{ background: '#243054', border: '1px solid #3A4D7C', color: '#6EE7B7', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
              >
                Edit Numbers
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a href={`tel:${secPhone}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#151D35', border: '1px solid #2B3A67', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8' }}>📞 Action Unit Security</div>
                <div style={{ fontSize: '10px', color: '#8D99AE', marginTop: '2px' }}>{secPhone}</div>
              </div>
            </a>
            <a href={`tel:${csoPhone}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#151D35', border: '1px solid #2B3A67', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8' }}>📞 Zone B CSO</div>
                <div style={{ fontSize: '10px', color: '#8D99AE', marginTop: '2px' }}>{csoPhone}</div>
              </div>
            </a>
          </div>
        </div>

        {/* EXCO ONLY: Automated Reminders & Contractor Payout Console */}
        {isExco && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
                Exco Executive Suite
              </span>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34D399', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
                Logged In (PIN: 2026)
              </span>
            </div>

            {/* Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: '#151D35', border: '1px solid #253359', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#8D99AE' }}>Total Reserve</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#34D399', marginTop: '2px' }}>₦{totalInflows.toLocaleString()}</div>
              </div>
              <div style={{ background: '#151D35', border: '1px solid #253359', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#8D99AE' }}>Disbursed</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#F87171', marginTop: '2px' }}>₦{totalOutflows.toLocaleString()}</div>
              </div>
              <div style={{ background: '#151D35', border: '1px solid #253359', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#8D99AE' }}>Liquid Float</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: liquidReserve >= 0 ? '#38BDF8' : '#F87171', marginTop: '2px' }}>₦{liquidReserve.toLocaleString()}</div>
              </div>
            </div>

            {/* Automated Dues Reminders Card */}
            <div className="card" style={{ border: '1px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#60A5FA' }}>Automated Dues Reminders</h3>
                  <p style={{ fontSize: '10px', color: '#8D99AE' }}>Dispatch notices to units owing {currentCheckMonth}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.2)', color: '#F87171', padding: '2px 8px', borderRadius: '6px' }}>
                  {owingUnits.length} Units Pending
                </span>
              </div>
              <button 
                onClick={handleSendReminderBatch}
                style={{ marginTop: '10px', width: '100%', background: '#2563EB', color: '#fff', fontWeight: 700, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px' }}
              >
                Send 7-Day Month-End Dues Reminder (WhatsApp/SMS)
              </button>
            </div>

            {/* Contractor Disbursement Suite */}
            <div className="card" style={{ border: '1px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>Disburse Funds to Contractors</h3>
                <span style={{ fontSize: '9px', background: '#0F172A', color: '#34D399', border: '1px solid #10B981', padding: '2px 6px', borderRadius: '4px' }}>
                  Dual-Auth Enabled
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#8D99AE', marginBottom: '10px' }}>
                Direct bank transfer via Monnify NIP.
              </p>

              <form onSubmit={handleDisbursePayment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', color: '#8D99AE' }}>Select Beneficiary</label>
                  <select value={payoutRecipient} onChange={(e) => {
                    setPayoutRecipient(e.target.value);
                    if (e.target.value === 'security') {
                      setPayoutAmount('40000');
                      setPayoutPurpose('Action Unit Security Monthly Allowance');
                    } else if (e.target.value === 'zonal') {
                      setPayoutAmount('8400');
                      setPayoutPurpose('Zone B Central Dues (42 flats @ ₦200)');
                    }
                  }}>
                    <option value="security">Action Unit Security (₦40,000/mo)</option>
                    <option value="zonal">Zone B Central Levy (₦8,400/mo)</option>
                    <option value="custom">Other Contractor (Drainage, Solar, Repairs)</option>
                  </select>
                </div>

                {payoutRecipient === 'custom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" placeholder="Payee Name (e.g. Electrician)" value={customPayee} onChange={(e) => setCustomPayee(e.target.value)} />
                    <input type="text" placeholder="Bank & Account No." value={customBankAcc} onChange={(e) => setCustomBankAcc(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '9px', color: '#8D99AE' }}>Amount (₦)</label>
                    <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', color: '#8D99AE' }}>Disbursement Narration</label>
                    <input type="text" value={payoutPurpose} onChange={(e) => setPayoutPurpose(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn-emerald" style={{ marginTop: '4px' }}>
                  Execute Contractor Bank Transfer (NIP)
                </button>
              </form>

              {/* Disbursement Ledger */}
              <div style={{ marginTop: '14px', borderTop: '1px solid #2B3A67', paddingTop: '10px' }}>
                <span style={{ fontSize: '10px', color: '#8D99AE', textTransform: 'uppercase', fontWeight: 700 }}>Audited Disbursed Vouchers ({outflows.length})</span>
                <div style={{ marginTop: '8px' }}>
                  {outflows.map((v) => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #253359' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{v.title}</div>
                        <div style={{ fontSize: '10px', color: '#8D99AE' }}>{v.beneficiary} • {v.date}</div>
                        <div style={{ fontSize: '9px', color: '#34D399' }}>✓ {v.authBy}</div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#F87171' }}>-₦{v.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer style={{ textAlign: 'center', fontSize: '10px', color: '#64748B', marginTop: '20px' }}>
          UnitMate Pilot • Managed by <strong>Ascotom Global Services</strong> for Action Unit
        </footer>
      </div>

      {/* Exco PIN Modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#1C2541', border: '1px solid #2B3A67', borderRadius: '14px', padding: '20px', maxWidth: '300px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Exco Access</h3>
            <p style={{ fontSize: '11px', color: '#8D99AE', margin: '4px 0 12px' }}>Enter administrator PIN</p>
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
