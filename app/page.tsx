"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Building2, 
  Wallet, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface FlatRecord {
  id: string;
  block: string;
  flat: string;
  resident: string;
  phone: string;
  paidAmount: number;
  totalDue: number;
  virtualAccount: string;
  status: "PAID" | "PARTIAL" | "UNPAID";
}

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  receiptVoucher: string;
}

const INITIAL_FLATS: FlatRecord[] = [
  { id: "1", block: "Block 325", flat: "Block 325, Flat 1", resident: "Mr. Adebayo", phone: "08031234567", paidAmount: 14000, totalDue: 14000, virtualAccount: "9928400101", status: "PAID" },
  { id: "2", block: "Block 325", flat: "Block 325, Flat 2", resident: "Mrs. Okon", phone: "08039876543", paidAmount: 6000, totalDue: 14000, virtualAccount: "9928400102", status: "PARTIAL" },
  { id: "3", block: "Block 325", flat: "Block 325, Flat 3", resident: "Pastor Eze", phone: "08023456789", paidAmount: 0, totalDue: 14000, virtualAccount: "9928400103", status: "UNPAID" },
  { id: "4", block: "Block 326", flat: "Block 326, Flat 1", resident: "Alhaji Musa", phone: "08055678901", paidAmount: 14000, totalDue: 14000, virtualAccount: "9928400107", status: "PAID" },
  { id: "5", block: "Block 326", flat: "Block 326, Flat 2", resident: "Mr. Williams", phone: "08077889900", paidAmount: 0, totalDue: 14000, virtualAccount: "9928400108", status: "UNPAID" },
  { id: "6", block: "Block 327", flat: "Block 327, Flat 1", resident: "Engr. Dike", phone: "08099887766", paidAmount: 14000, totalDue: 14000, virtualAccount: "9928400113", status: "PAID" },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", title: "Security Guards Allowances (Day & Night)", category: "Security", amount: 90000, date: "2026-04-05", receiptVoucher: "Voucher #SEC-04-2026" },
  { id: "2", title: "Solar Streetlight Battery Replacement (Block 328/329)", category: "Maintenance", amount: 45000, date: "2026-03-20", receiptVoucher: "Voucher #SL-03-2026" },
  { id: "3", title: "Quarterly Drainage Evacuation & Dislodgement", category: "Sanitation", amount: 35000, date: "2026-03-10", receiptVoucher: "Voucher #SAN-03-2026" },
];

export default function UnitMateApp() {
  const [role, setRole] = useState<"resident" | "exco">("resident");
  const [copied, setCopied] = useState(false);
  const [flats, setFlats] = useState<FlatRecord[]>(INITIAL_FLATS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("ALL");

  const totalTargetExpected = 42 * 14000;
  const sampleCollected = flats.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalOutflows = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const reserveFundBalance = sampleCollected - totalOutflows;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateWhatsAppLink = (flat: FlatRecord) => {
    const arrears = flat.totalDue - flat.paidAmount;
    const message = encodeURIComponent(
      `Hello ${flat.resident},\n\nThis is a notification from Action Unit (Zone B) Exco.\n\n` +
      `Your current security dues balance for Oct 2025 – Apr 2026 is ₦${arrears.toLocaleString()}.\n\n` +
      `Please make your transfer directly to your dedicated flat account:\n` +
      `• Bank: Wema Bank (Monnify)\n` +
      `• Account No: ${flat.virtualAccount}\n` +
      `• Beneficiary: UnitMate - ${flat.flat}\n\n` +
      `Payment is verified automatically and your receipt will be issued instantly.\n\n` +
      `Thank you.\nAction Unit Exco / Ascotom Global Services`
    );
    return `https://wa.me/234${flat.phone.slice(1)}?text=${message}`;
  };

  const filteredFlats = selectedBlockFilter === "ALL" 
    ? flats 
    : flats.filter(f => f.block === selectedBlockFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">UnitMate</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Ascotom Global
                </span>
              </div>
              <p className="text-xs text-slate-400">Action Unit • Zone B, Jakande Estate</p>
            </div>
          </div>

          <div className="bg-slate-800 p-1 rounded-lg flex space-x-1 border border-slate-700">
            <button
              onClick={() => setRole("resident")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                role === "resident" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Resident View
            </button>
            <button
              onClick={() => setRole("exco")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                role === "exco" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Chairman / Exco
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Target Period</span>
            <p className="text-sm font-bold text-slate-800 mt-1">Oct 2025 – Apr 2026</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">7 Months @ ₦2,000/mo</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Target (42 Flats)</span>
            <p className="text-sm font-bold text-slate-800 mt-1">₦{totalTargetExpected.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">₦14,000 per flat</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Outflows</span>
            <p className="text-sm font-bold text-slate-800 mt-1">₦{totalOutflows.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">3 verified vouchers</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Reserve Fund Balance</span>
            <p className={`text-sm font-bold mt-1 ${reserveFundBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              ₦{reserveFundBalance.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Unit Liquid Reserve</p>
          </div>
        </div>

        {role === "resident" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    Your Dedicated Flat Account
                  </span>
                  <h2 className="text-xl font-bold mt-1">Block 325, Flat 1</h2>
                  <p className="text-xs text-slate-400">Action Unit • Resident: Mr. Adebayo</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/30">
                  Fully Reconciled (₦14,000 Paid)
                </div>
              </div>

              <div className="mt-6 bg-slate-950/60 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">Transfer directly via your Bank App:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-mono font-bold tracking-wider text-white">9928400101</span>
                    <button 
                      onClick={() => copyToClipboard("9928400101")}
                      className="text-slate-400 hover:text-white p-1 transition"
                      title="Copy Account Number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copied && <span className="text-xs text-emerald-400 font-medium">Copied!</span>}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">Bank: <strong>Wema Bank (Monnify)</strong> • Name: <strong>UnitMate - Block 325 Flat 1</strong></p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400">Status</span>
                  <p className="text-sm font-semibold text-emerald-400 flex items-center sm:justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" /> All dues cleared
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Action Unit Transparency Ledger</h3>
                  <p className="text-xs text-slate-500">Live operational inflows & verified expenses</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                  Public to all 42 flats
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{expense.title}</p>
                        <p className="text-xs text-slate-500">{expense.category} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">-₦{expense.amount.toLocaleString()}</p>
                      <span className="text-[11px] text-slate-500 underline flex items-center justify-end gap-0.5 cursor-pointer hover:text-slate-800">
                        {expense.receiptVoucher} <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {role === "exco" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Action Unit Payment Roster</h3>
                  <p className="text-xs text-slate-500">Cycle: Oct 2025 – Apr 2026 (₦14,000 / flat)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-500">Filter Block:</span>
                  <select 
                    value={selectedBlockFilter}
                    onChange={(e) => setSelectedBlockFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white font-medium"
                  >
                    <option value="ALL">All Blocks (325 - 331)</option>
                    <option value="Block 325">Block 325</option>
                    <option value="Block 326">Block 326</option>
                    <option value="Block 327">Block 327</option>
                    <option value="Block 328">Block 328</option>
                    <option value="Block 329">Block 329</option>
                    <option value="Block 330">Block 330</option>
                    <option value="Block 331">Block 331</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="p-3">Flat / Resident</th>
                      <th className="p-3">Dedicated Virtual NUBAN</th>
                      <th className="p-3">Paid so far</th>
                      <th className="p-3">Balance</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFlats.map((flat) => {
                      const balance = flat.totalDue - flat.paidAmount;
                      return (
                        <tr key={flat.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{flat.flat}</span>
                            <div className="text-[11px] text-slate-500">{flat.resident} • {flat.phone}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {flat.virtualAccount}
                          </td>
                          <td className="p-3 font-semibold text-emerald-700">
                            ₦{flat.paidAmount.toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-rose-600">
                            ₦{balance.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              flat.status === "PAID" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : flat.status === "PARTIAL"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}>
                              {flat.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {balance > 0 ? (
                              <a
                                href={generateWhatsAppLink(flat)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                              >
                                <Send className="w-3 h-3" /> Remind
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Reconciled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-400">
        UnitMate Platform • Operated by <strong>Ascotom Global Services</strong> for Action Unit, Zone B
      </footer>
    </div>
  );
}
