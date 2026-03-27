import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info, TrendingUp, ShieldCheck, PiggyBank, Calculator, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function TaxWizard() {
  const [hraOpen, setHraOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxPlan = async () => {
      try {
        const res = await fetch('/api/tax-compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseSalary: 1800000,
            hraReceived: 360000,
            rentPaid: 360000,
            section80C: 150000,
            section80CCD1B: 50000,
            section80D: 25000,
            homeLoanInterest: 40000,
            isMetro: true
          })
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxPlan();
  }, []);

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Tax Wizard</h2>
          <p className="text-slate-400 mt-1">FY 2025-26 Regime Comparison & Optimisation.</p>
        </div>
      </header>

      {/* Winner Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-navy-800 to-navy-900 border border-gold-500/30 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-500 text-sm font-semibold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-4 h-4" /> Recommended
          </div>
          <h3 className="text-4xl font-bold text-white mb-2">
            {data.winner === 'new' ? 'New' : 'Old'} Tax Regime saves you <span className="text-gold-500">{formatCurrency(data.savings)}</span> this year
          </h3>
          <p className="text-slate-300 text-lg">
            Based on your declared salary of ₹18L and current deductions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-900 border border-navy-800">
          <h3 className="text-xl font-semibold text-white mb-6">Side-by-Side Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-navy-800">
                  <th className="pb-4 font-medium text-slate-400">Line Item</th>
                  <th className="pb-4 font-medium text-coral-500/80 text-right pr-6">Old Regime</th>
                  <th className="pb-4 font-medium text-teal-500 text-right pl-6 border-l border-navy-800">New Regime</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Gross Salary</td>
                  <td className="py-4 text-right font-mono text-slate-300 pr-6">{formatCurrency(data.oldRegime.grossSalary)}</td>
                  <td className="py-4 text-right font-mono text-slate-300 pl-6 border-l border-navy-800">{formatCurrency(data.newRegime.grossSalary)}</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Standard Deduction</td>
                  <td className="py-4 text-right font-mono text-coral-400 pr-6">-{formatCurrency(data.oldRegime.standardDeduction)}</td>
                  <td className="py-4 text-right font-mono text-teal-400 pl-6 border-l border-navy-800">-{formatCurrency(data.newRegime.standardDeduction)}</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">HRA Exemption</td>
                  <td className="py-4 text-right font-mono text-coral-400 pr-6">-{formatCurrency(data.oldRegime.hraExemption)}</td>
                  <td className="py-4 text-right font-mono text-slate-500 pl-6 border-l border-navy-800">₹0</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Section 80C</td>
                  <td className="py-4 text-right font-mono text-coral-400 pr-6">-{formatCurrency(data.oldRegime.section80C)}</td>
                  <td className="py-4 text-right font-mono text-slate-500 pl-6 border-l border-navy-800">₹0</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Section 80CCD(1B) NPS</td>
                  <td className="py-4 text-right font-mono text-coral-400 pr-6">-{formatCurrency(data.oldRegime.section80CCD1B)}</td>
                  <td className="py-4 text-right font-mono text-slate-500 pl-6 border-l border-navy-800">₹0</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Home Loan Interest (24b)</td>
                  <td className="py-4 text-right font-mono text-coral-400 pr-6">-{formatCurrency(data.oldRegime.homeLoanInterest)}</td>
                  <td className="py-4 text-right font-mono text-slate-500 pl-6 border-l border-navy-800">₹0</td>
                </tr>
                <tr className="border-b border-navy-800/50 bg-navy-950/30">
                  <td className="py-4 font-medium text-white">Taxable Income</td>
                  <td className="py-4 text-right font-mono font-medium text-white pr-6">{formatCurrency(data.oldRegime.taxableIncome)}</td>
                  <td className="py-4 text-right font-mono font-medium text-white pl-6 border-l border-navy-800">{formatCurrency(data.newRegime.taxableIncome)}</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Tax on Slab</td>
                  <td className="py-4 text-right font-mono text-slate-300 pr-6">{formatCurrency(data.oldRegime.taxOnSlab)}</td>
                  <td className="py-4 text-right font-mono text-slate-300 pl-6 border-l border-navy-800">{formatCurrency(data.newRegime.taxOnSlab)}</td>
                </tr>
                <tr className="border-b border-navy-800/50">
                  <td className="py-4 text-slate-300">Health & Education Cess (4%)</td>
                  <td className="py-4 text-right font-mono text-slate-300 pr-6">{formatCurrency(data.oldRegime.cess)}</td>
                  <td className="py-4 text-right font-mono text-slate-300 pl-6 border-l border-navy-800">{formatCurrency(data.newRegime.cess)}</td>
                </tr>
                <tr>
                  <td className="py-6 font-bold text-lg text-white">Total Tax Liability</td>
                  <td className={cn("py-6 text-right font-mono font-bold text-lg pr-6", data.winner === 'old' ? "text-coral-400 text-2xl bg-coral-500/5 rounded-l-xl shadow-[inset_-2px_0_0_rgba(248,113,113,0.5)]" : "text-slate-400")}>{formatCurrency(data.oldRegime.totalTaxLiability)}</td>
                  <td className={cn("py-6 text-right font-mono font-bold text-lg pl-6 border-l border-navy-800", data.winner === 'new' ? "text-teal-400 text-2xl bg-teal-500/5 rounded-r-xl shadow-[inset_2px_0_0_rgba(20,184,166,0.5)]" : "text-slate-400")}>{formatCurrency(data.newRegime.totalTaxLiability)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* HRA Accordion */}
          <div className="mt-8 border border-navy-700 rounded-xl overflow-hidden">
            <button 
              onClick={() => setHraOpen(!hraOpen)}
              className="w-full flex items-center justify-between p-4 bg-navy-800 hover:bg-navy-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-white">View HRA Exemption Working</span>
              </div>
              {hraOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            <AnimatePresence>
              {hraOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-navy-900 border-t border-navy-700 p-6"
                >
                  <p className="text-sm text-slate-400 mb-4">
                    HRA exemption is the minimum of the following three conditions (Section 10(13A)):
                  </p>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-navy-950/50 border border-navy-800">
                      <span className="text-slate-300">1. Actual HRA received</span>
                      <span className="text-white">{formatCurrency(data.hraBreakdown.hraReceived)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-navy-950/50 border border-navy-800">
                    <span className="text-slate-300">2. 50% of Basic Salary (Metro)</span>
                    <span className="text-white">{formatCurrency(data.hraBreakdown.metroLimit)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                    <span className="text-teal-400 font-medium">3. Rent paid minus 10% of Basic</span>
                    <span className="text-teal-400 font-bold">{formatCurrency(data.hraBreakdown.rentMinus10Percent)}</span>
                  </div>
                </div>
                <p className="text-sm text-teal-400 mt-4 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Minimum value ({formatCurrency(data.oldRegime.hraExemption)}) is the allowed exemption.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Missed Deductions */}
          {(data.missedDeductions.section80D > 0 || data.missedDeductions.section80CCD1B > 0) && (
            <div className="p-6 rounded-2xl bg-navy-900 border border-gold-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle className="w-24 h-24 text-gold-500" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-4">Missed Deductions</h3>
                <p className="text-sm text-slate-300 mb-6">
                  You are leaving money on the table in the Old Regime. Claiming these could make the Old Regime more beneficial.
                </p>
                
                <div className="space-y-4">
                  {data.missedDeductions.section80D > 0 && (
                    <div className="p-4 rounded-xl bg-navy-950/50 border border-navy-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">80D Health Insurance</span>
                        <span className="text-xs font-bold text-gold-500 bg-gold-500/10 px-2 py-1 rounded">Missed: {formatCurrency(data.missedDeductions.section80D)}</span>
                      </div>
                      <p className="text-xs text-slate-400">Up to ₹25,000 deduction available for self & family.</p>
                    </div>
                  )}
                  
                  {data.missedDeductions.section80CCD1B > 0 && (
                    <div className="p-4 rounded-xl bg-navy-950/50 border border-navy-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">80CCD(1B) Additional NPS</span>
                        <span className="text-xs font-bold text-gold-500 bg-gold-500/10 px-2 py-1 rounded">Missed: {formatCurrency(data.missedDeductions.section80CCD1B)}</span>
                      </div>
                      <p className="text-xs text-slate-400">Extra ₹50,000 deduction beyond the 80C limit.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Instruments */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
            <h3 className="text-lg font-semibold text-white mb-4">Top Tax-Saving Instruments</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">ELSS Mutual Funds</h4>
                  <p className="text-xs text-slate-400">3-yr lock-in, equity returns, 80C</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Public Provident Fund (PPF)</h4>
                  <p className="text-xs text-slate-400">15-yr lock-in, guaranteed, 80C</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <PiggyBank className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">NPS Tier 1</h4>
                  <p className="text-xs text-slate-400">Retirement lock-in, 80CCD(1B)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
