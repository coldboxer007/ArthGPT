import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Info, Loader2 } from 'lucide-react';

export function FIRERoadmap() {
  const [retireAge, setRetireAge] = useState(50);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirePlan = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/fire-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: 34,
            retireAge,
            income: 2400000,
            existingMfCorpus: 1800000,
            existingPpfCorpus: 600000,
            targetMonthlyDraw: 150000
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

    const debounce = setTimeout(fetchFirePlan, 300);
    return () => clearTimeout(debounce);
  }, [retireAge]);

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const requiredSip = (data.requiredMonthlySip / 100000).toFixed(2);
  const targetCorpus = (data.requiredCorpus / 10000000).toFixed(2);

  // Generate corpus data for chart
  const corpusData = [];
  let current = 1.22; // starting corpus in cr
  let recommended = 1.22;
  const currentSip = 0.5; // current sip in cr/yr
  const recommendedSip = data.requiredMonthlySip * 12 / 10000000; // recommended sip in cr/yr
  
  for (let age = 34; age <= 65; age++) {
    corpusData.push({
      age,
      current: Number(current.toFixed(2)),
      recommended: Number(recommended.toFixed(2)),
    });
    current = current * 1.12 + currentSip;
    recommended = recommended * 1.12 + recommendedSip;
  }

  const sipAllocationData = data.sipAllocation.map((item: any) => ({
    name: item.category,
    value: item.percentage,
    color: item.category === 'Large Cap' ? '#20B2AA' : item.category === 'Debt' ? '#FF6B6B' : '#D4AF37'
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">FIRE Roadmap</h2>
          <p className="text-slate-400 mt-1">Your path to Financial Independence, Retire Early.</p>
        </div>
      </header>

      {/* Hero Metric */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 border border-navy-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-teal-500 to-coral-500" />
        <h3 className="text-5xl font-bold text-white mb-4">
          You can retire in <span className="text-gold-500">April {2026 + (retireAge - 34)}</span>
        </h3>
        <p className="text-lg text-slate-300">
          Assuming <strong className="text-white">₹{requiredSip}L/month</strong> SIP starting now, 12% equity returns, 6% inflation.
        </p>
      </div>

      {/* Interactive Slider */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Target Retirement Age</h3>
          <span className="text-2xl font-bold text-gold-500">{retireAge}</span>
        </div>
        <input
          type="range"
          min="45"
          max="65"
          value={retireAge}
          onChange={(e) => setRetireAge(Number(e.target.value))}
          className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
        />
        <div className="flex justify-between text-sm text-slate-500 mt-2 font-mono">
          <span>45</span>
          <span>55</span>
          <span>65</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Corpus Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Corpus Growth (₹ Crores)</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-500" /> Current Trajectory</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gold-500" /> Recommended Plan</div>
            </div>
          </div>
          
          <div className="flex-1 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={corpusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="age" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [`₹${value} Cr`, '']}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Line type="monotone" dataKey="current" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="recommended" stroke="#D4AF37" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIP Allocation */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly SIP Split</h3>
          <div className="flex-1 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sipAllocationData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sipAllocationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-white">₹{requiredSip}L</span>
              <span className="text-xs text-slate-400">Total SIP</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {sipAllocationData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-medium text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Glidepath */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Asset Glidepath</h3>
            <Info className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.glidepath} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#20B2AA" fill="#20B2AA" fillOpacity={0.6} />
                <Area type="monotone" dataKey="debt" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insurance Gap */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-coral-500/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="w-32 h-32 text-coral-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-6 h-6 text-coral-500" />
              <h3 className="text-xl font-bold text-white">Critical Insurance Gap</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Your declared life cover is significantly below the recommended threshold for your income level and dependents.
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-navy-800 pb-2">
                <span className="text-slate-400">Declared Life Cover</span>
                <span className="text-xl font-mono text-white">₹50L</span>
              </div>
              <div className="flex justify-between items-end border-b border-navy-800 pb-2">
                <span className="text-slate-400">Recommended (12x Income)</span>
                <span className="text-xl font-mono text-white">₹2.88 Cr</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-coral-500 font-medium">Coverage Gap</span>
                <span className="text-2xl font-mono font-bold text-coral-500">₹{(data.insuranceGap / 10000000).toFixed(2)} Cr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
