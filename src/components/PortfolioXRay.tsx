import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Info, AlertTriangle, CheckCircle2, Loader2, WifiOff, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserProfile } from '../App';
import { useAnalysis } from '../contexts/AnalysisContext';
import { ConfidenceBadge, ConfidenceDot, type ConfidenceLevel } from './ConfidenceBadge';
import { AgentExecutionLog } from './AgentExecutionLog';
import { useInfographic } from '../hooks/useInfographic';
import { InfographicCard } from './InfographicCard';

interface PortfolioResult {
  portfolio_data?: {
    totalValue: number;
    funds: Array<{ name: string; currentValue: number; category: string }>;
  };
  xirr_results?: {
    portfolioXirr: number;
    fundXirrs: Array<{ fund: string; xirr: number }>;
  };
  overlap_data?: {
    totalOverlappingStocks: number;
    overlapMatrix: Array<{
      stock: string;
      funds: string[];
      combinedWeight: number;
      confidence: ConfidenceLevel;
    }>;
    confidence: ConfidenceLevel;
    concentrationRisk: string;
  };
  expense_analysis?: {
    totalExpenseDrag: number;
    fundExpenses: Array<{
      fund: string;
      regularER: number;
      directER: number;
      annualDrag: number;
      switchRecommended: boolean;
      confidence: ConfidenceLevel;
    }>;
  };
  benchmark_comparison?: {
    funds: Array<{
      fund: string;
      fund3Y: number;
      benchmark3Y: number;
      benchmark: string;
      underperformer: boolean;
    }>;
  };
  rebalancing_plan?: {
    recommendations: Array<{
      fundToRedeem: string;
      units: number;
      currentValue: number;
      holdingPeriod: string;
      taxImplication: string;
      estimatedTax: number;
      fundToInvest: string;
      reason: string;
      expenseBenefit: string;
    }>;
    narrative: string;
    totalExpectedSavings: number;
    disclaimer: string;
  };
  execution_log?: Array<{
    agent: string;
    stage: number;
    latencyMs?: number;
  }>;
}

const EQUITY_LTCG_RATE = 0.125;

function isEquityFund(fundName: string): boolean {
  const lower = fundName.toLowerCase();
  return lower.includes('flexi') || lower.includes('large cap') || lower.includes('small cap') ||
    lower.includes('mid cap') || lower.includes('equity') || lower.includes('multicap') ||
    lower.includes('elss') || lower.includes('focused') || lower.includes('value');
}

function computePostTaxReturn(fundXirr: number, fundName: string, taxBracket: number): number {
  const marginalRate = taxBracket / 100;
  const effectiveRate = isEquityFund(fundName) ? EQUITY_LTCG_RATE : marginalRate;
  return fundXirr * (1 - effectiveRate);
}

export function PortfolioXRay({ profile }: { profile: UserProfile }) {
  const [showExecutionLog, setShowExecutionLog] = useState(false);
  const { portfolioPipeline, getCrossPipelineData } = useAnalysis();
  const { execute, events, result, error, isLoading, isComplete, isError } = portfolioPipeline;
  const infographic = useInfographic();

  const buildFundInput = useCallback(() => {
    const mfInvestment = profile.investments.find(i => i.type === 'Mutual Funds');
    const stockInvestment = profile.investments.find(i => i.type === 'Stocks');
    const totalMfValue = (mfInvestment?.value || 0) + (stockInvestment?.value || 0);
    
    const funds = totalMfValue > 0 ? [
      { name: 'Mirae Asset Large Cap Fund - Regular Plan', units: Math.round(totalMfValue * 0.35 / 85.2), nav: 85.2, investedAmount: Math.round(totalMfValue * 0.35) },
      { name: 'HDFC Flexi Cap Fund - Regular Plan', units: Math.round(totalMfValue * 0.25 / 145.6), nav: 145.6, investedAmount: Math.round(totalMfValue * 0.25) },
      { name: 'SBI Small Cap Fund - Direct Plan', units: Math.round(totalMfValue * 0.15 / 180.5), nav: 180.5, investedAmount: Math.round(totalMfValue * 0.15) },
      { name: 'Parag Parikh Flexi Cap Fund - Direct Plan', units: Math.round(totalMfValue * 0.25 / 65.4), nav: 65.4, investedAmount: Math.round(totalMfValue * 0.25) }
    ] : [
      { name: 'Mirae Asset Large Cap Fund - Regular Plan', units: 3500, nav: 85.2, investedAmount: 250000 },
      { name: 'HDFC Flexi Cap Fund - Regular Plan', units: 1200, nav: 145.6, investedAmount: 150000 },
      { name: 'SBI Small Cap Fund - Direct Plan', units: 450, nav: 180.5, investedAmount: 60000 },
      { name: 'Parag Parikh Flexi Cap Fund - Direct Plan', units: 2100, nav: 65.4, investedAmount: 120000 }
    ];

    const riskProfile = profile.goals.includes('Aggressive Growth') ? 'Aggressive' 
      : profile.goals.includes('Retirement Corpus') ? 'Moderate' 
      : 'Moderate';
    const horizon = profile.age < 35 ? '20+ years' : profile.age < 45 ? '15 years' : '10 years';

    return { funds, riskProfile: riskProfile as 'Aggressive' | 'Moderate' | 'Conservative', investmentHorizon: horizon };
  }, [profile]);

  useEffect(() => {
    if (result || isLoading) return;
    const input = buildFundInput();
    execute(input);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const data = (result as PortfolioResult) ?? ({} as PortfolioResult);
  const xirr = data.xirr_results?.portfolioXirr || 0;
  const benchmarkReturn = data.benchmark_comparison?.funds?.[0]?.benchmark3Y || 12;
  const expenseDrag = data.expense_analysis?.totalExpenseDrag || 0;
  const overlappingStocks = data.overlap_data?.totalOverlappingStocks || 0;
  const overlapConfidence = data.overlap_data?.confidence || 'HIGH';
  const totalValue = data.portfolio_data?.totalValue || 0;
  const fundCount = data.portfolio_data?.funds?.length || 4;
  const fundXirrs = data.xirr_results?.fundXirrs ?? [];

  const crossData = getCrossPipelineData();
  const taxBracket = crossData.taxBracket;
  const hasTaxData = taxBracket !== undefined;

  const handleGenerateInfographic = useCallback(() => {
    infographic.generate('portfolio', {
      xirr,
      benchmarkReturn,
      expenseDrag,
      overlappingStocks,
      totalValue,
      fundCount,
    });
  }, [infographic, xirr, benchmarkReturn, expenseDrag, overlappingStocks, totalValue, fundCount]);

  const expenseChartData = data.expense_analysis?.fundExpenses?.map(f => ({
    name: f.fund.split(' ').slice(0, 2).join(' '),
    regular: f.regularER ?? 0,
    direct: f.directER ?? 0,
  })) ?? [];

  const overlapDisplayData = data.overlap_data?.overlapMatrix?.slice(0, 5).map(o => ({
    stock: o.stock ?? '—',
    funds: Array.isArray(o.funds) ? o.funds.map(f => (f ?? '').split(' ')[0]) : [],
    percentage: o.combinedWeight ?? 0,
    confidence: o.confidence ?? 'MEDIUM',
  })) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-slate-400 text-sm">Executing Portfolio X-Ray pipeline...</p>
        
        <div className="w-full max-w-md space-y-2">
          {['IngestionAgent', 'XirrEngine', 'OverlapAgent', 'ExpenseAgent', 'BenchmarkAgent', 'RebalancingStrategist'].map(agent => {
            const startEvent = events.find(e => e.agent === agent && e.type === 'agent_start');
            const completeEvent = events.find(e => e.agent === agent && e.type === 'agent_complete');
            
            return (
              <div key={agent} className="flex items-center justify-between px-4 py-2 bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm">
                <span className="text-sm text-slate-300">{agent}</span>
                {completeEvent ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-500">{completeEvent.latencyMs}ms</span>
                  </div>
                ) : startEvent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#2a2a2a]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isError) {
    const isNetworkError = error?.toLowerCase().includes('failed to fetch') || error?.toLowerCase().includes('networkerror');
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <WifiOff className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold text-white">Analysis Failed</h3>
        <p className="text-slate-400 text-center max-w-md">
          {isNetworkError
            ? 'Could not connect to the server. Please make sure the dev server is running (npm run dev) and try again.'
            : (error || 'An error occurred during portfolio analysis.')}
        </p>
        <button
          onClick={() => execute(buildFundInput())}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-[#0a0a0a] font-semibold hover:bg-amber-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      </div>
    );
  }

  if (isComplete && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold text-white">No Portfolio Data Returned</h3>
        <p className="text-slate-400 text-center max-w-md">
          The pipeline completed but did not return a result payload. This can happen due to a slow network or timeout. Please retry.
        </p>
        <button
          onClick={() => execute(buildFundInput())}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-[#0a0a0a] font-semibold hover:bg-amber-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!isComplete || !result) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio X-Ray</h2>
          <p className="text-slate-400 mt-1">Multi-agent analysis of your mutual fund holdings.</p>
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceBadge level={overlapConfidence} />
          <div className="px-4 py-2 bg-[#141414] rounded-full border border-[#2a2a2a] flex items-center gap-2 self-start">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">V2 Pipeline</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'True XIRR', value: `${xirr.toFixed(1)}%`, trend: `+${(xirr - benchmarkReturn).toFixed(1)}% vs BM`, positive: xirr > benchmarkReturn },
          { label: 'Benchmark Return', value: `${benchmarkReturn.toFixed(1)}%`, trend: 'Nifty 500 TRI', positive: true },
          { label: 'Expense Ratio Drag', value: `${formatCurrency(expenseDrag)}/yr`, trend: 'Switch to Direct', positive: false },
          { label: 'Overlapping Stocks', value: overlappingStocks.toString(), trend: data.overlap_data?.concentrationRisk?.split(':')[0] || 'Check Overlap', positive: overlappingStocks < 10 },
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-sm hover:border-[#333] transition-colors"
          >
            <p className="text-sm font-medium text-slate-400 mb-2">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{metric.value}</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {metric.positive ? (
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${metric.positive ? 'text-amber-400' : 'text-red-400'}`}>
                {metric.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {fundXirrs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Fund Returns</h3>
            {hasTaxData && (
              <span className="text-xs text-slate-500">
                Tax bracket: {taxBracket}% &middot; Equity LTCG: 12.5% &middot; Debt: at slab
              </span>
            )}
          </div>

          {!hasTaxData && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2 shadow-sm">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200 text-xs">
                Run Tax Wizard to see post-tax returns
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            {fundXirrs.map((f, i) => {
              const postTax = hasTaxData ? computePostTaxReturn(f.xirr, f.fund, taxBracket!) : null;
              const isPositive = f.xirr >= 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-[#141414] border border-[#2a2a2a] shadow-sm hover:border-[#333] transition-colors"
                >
                  <p className="text-sm text-slate-300 mb-2 truncate font-medium" title={f.fund}>{f.fund}</p>
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold font-mono ${isPositive ? 'text-amber-400' : 'text-red-400'}`}>
                        {f.xirr.toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500">XIRR</span>
                    </div>
                    {postTax !== null && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          postTax >= 0
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        Post-tax: {postTax.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {postTax !== null && (
                    <p className="text-xs text-slate-500 mt-2 text-right">
                      {isEquityFund(f.fund) ? 'Equity LTCG 12.5%' : `Debt at slab ${taxBracket}%`}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 w-full">
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-sm flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Stock Overlap Heatmap</h3>
              <ConfidenceBadge level={overlapConfidence} size="sm" />
            </div>
            <Info className="w-4 h-4 text-slate-500" />
          </div>
          
          <div className="flex-1 overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-[#0a0a0a]">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Stock</th>
                  <th className="px-4 py-3">Funds</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3 rounded-tr-lg">Conf</th>
                </tr>
              </thead>
              <tbody>
                {overlapDisplayData.map((row, i) => (
                  <tr key={i} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#1a1a1a]">
                    <td className="px-4 py-4 font-medium text-slate-200">{row.stock}</td>
                    <td className="px-4 py-4 text-slate-400">{row.funds.join(', ')}</td>
                    <td className="px-4 py-4 text-amber-400 font-mono">{row.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-4"><ConfidenceDot level={row.confidence} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {overlapDisplayData[0] && (
            <p className="mt-6 text-sm text-slate-400 bg-[#0a0a0a] p-4 rounded-xl border border-[#2a2a2a]">
              <strong className="text-white">{overlapDisplayData[0].stock}</strong> makes up {overlapDisplayData[0].percentage.toFixed(1)}% of your effective portfolio — appearing in {overlapDisplayData[0].funds.length} of your funds.
            </p>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-sm flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Expense Ratio Drag</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#ef4444]" /> Regular Plan</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#00e5ff]" /> Direct Plan</div>
            </div>
          </div>
          
          <div className="flex-1 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                <Tooltip 
                  cursor={{ fill: '#2a2a2a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Bar dataKey="regular" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} name="Regular" />
                <Bar dataKey="direct" fill="#00e5ff" radius={[0, 4, 4, 0]} barSize={24} name="Direct" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {data.rebalancing_plan?.recommendations && data.rebalancing_plan.recommendations.length > 0 && (
        <div className="space-y-4 w-full">
          <h3 className="text-xl font-semibold text-white">Actionable Rebalancing Plan</h3>
          <div className="flex flex-col gap-4 w-full">
            {data.rebalancing_plan.recommendations.map((plan, i) => (
              <div key={i} className="flex flex-col gap-4 w-full">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-[#141414] border border-red-500/30 relative overflow-hidden group shadow-sm"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertTriangle className="w-24 h-24 text-red-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
                      Redeem
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{plan.fundToRedeem}</h4>
                    <p className="text-sm text-slate-400 mb-6">{plan.units} units • Current Value: {formatCurrency(plan.currentValue)}</p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                        <span className="text-slate-500">Holding Period</span>
                        <span className="text-slate-300 font-medium">{plan.holdingPeriod}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                        <span className="text-slate-500">Tax Implication</span>
                        <span className={`font-medium ${plan.taxImplication === 'No Tax' ? 'text-amber-400' : 'text-amber-500'}`}>
                          {plan.taxImplication} ({formatCurrency(plan.estimatedTax)})
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.05 }}
                  className="p-6 rounded-2xl bg-[#141414] border border-amber-500/30 relative overflow-hidden group shadow-sm"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle2 className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                      Invest
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{plan.fundToInvest}</h4>
                    <p className="text-sm text-slate-400 mb-6">Invest proceeds: {formatCurrency(plan.currentValue)}</p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                        <span className="text-slate-500">Why this fund?</span>
                        <span className="text-slate-300 font-medium text-right max-w-[250px]">{plan.reason}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                        <span className="text-slate-500">Expense Benefit</span>
                        <span className="text-amber-400 font-medium">{plan.expenseBenefit}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.rebalancing_plan?.narrative && (
        <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-[#00e5ff]/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-sm tracking-wide">AI</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-400 tracking-wide">ChanakAI Insight</h3>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
              <p>{data.rebalancing_plan.narrative}</p>
            </div>
            {data.rebalancing_plan.disclaimer && (
              <p className="mt-6 text-xs text-slate-500 italic border-t border-[#2a2a2a] pt-4">{data.rebalancing_plan.disclaimer}</p>
            )}
          </div>
        </div>
      )}

      <InfographicCard
        image={infographic.image}
        isLoading={infographic.isLoading}
        error={infographic.error}
        onGenerate={handleGenerateInfographic}
        onReset={infographic.reset}
        label="Portfolio X-Ray Summary"
      />

      <div className="border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm bg-[#141414]">
        <button
          onClick={() => setShowExecutionLog(!showExecutionLog)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
        >
          <span className="text-sm font-medium text-slate-300">Show Your Math — Execution Trace</span>
          {showExecutionLog ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {showExecutionLog && (
          <div className="p-6 bg-[#0a0a0a] border-t border-[#2a2a2a]">
            <AgentExecutionLog events={events} />
          </div>
        )}
      </div>
    </div>
  );
}