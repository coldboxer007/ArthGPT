import { useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { useInfographic } from '../hooks/useInfographic';
import { InfographicCard } from './InfographicCard';
import { WhatIfPanel } from './WhatIfPanel';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loading, type LoadingPipelineConfig } from './Loading';
import type { UserProfile } from '../App';
import { useAnalysis } from '../contexts/AnalysisContext';
import {
  type FirePipelineResult,
  type FireSummary,
  type MonteCarloResults,
  type SipPlan,
  type InsuranceGaps,
  type FireRoadmap,
  type FireMacroParameters,
  type FireMacroSource,
  type FireRoadmapAction,
  type FireRoadmapTimelineItem,
} from '../hooks/useSSE';

function fmtCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

function fmtPercent(value: number | undefined) {
  const numeric = Number(value || 0);
  const percent = numeric >= 0 && numeric <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(percent >= 100 || Number.isInteger(percent) ? 0 : 1)}%`;
}

function toNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function timelineFromActions(actions: FireRoadmapAction[] = []): FireRoadmapTimelineItem[] {
  return actions.map((action) => ({
    title: action.title,
    detail: action.detail || action.impact,
    milestone: action.timeframe,
  }));
}

function normalizeFireResult(result: FirePipelineResult | null) {
  const summary = (result?.fire_summary ?? {}) as Partial<FireSummary>;
  const monte = (result?.monte_carlo_results ?? {}) as Partial<MonteCarloResults>;
  const sip = (result?.sip_plan ?? {}) as Partial<SipPlan>;
  const insurance = (result?.insurance_gaps ?? {}) as Partial<InsuranceGaps>;
  const roadmap = (result?.fire_roadmap ?? {}) as Partial<FireRoadmap>;
  const macro = (result?.macro_parameters ?? {}) as Partial<FireMacroParameters>;

  const percentiles = monte.retirementCorpusPercentiles ?? { p10: 0, p50: 0, p90: 0 };
  const sources: FireMacroSource[] = macro.sources ?? [];
  const actions = roadmap.recommendedActions ?? [];
  const timeline = roadmap.timeline ?? timelineFromActions(actions);

  return {
    successProbability: toNumber(summary.successProbability ?? monte.successProbability),
    p10Corpus: toNumber(summary.p10Corpus ?? percentiles.p10),
    p50Corpus: toNumber(summary.p50Corpus ?? percentiles.p50),
    p90Corpus: toNumber(summary.p90Corpus ?? percentiles.p90),
    medianSipRequired: toNumber(summary.medianSipRequired ?? sip.medianSipRequired),
    safetySipRequired: toNumber(summary.safetySipRequired ?? sip.safetySipRequired),
    insuranceGap: toNumber(summary.insuranceGap ?? insurance.lifeCoverGap),
    requiredLifeCover: toNumber(insurance.requiredLifeCover),
    declaredLifeCover: toNumber(insurance.declaredLifeCover),
    recommendedHealthCover: toNumber(insurance.recommendedHealthCover),
    macroAsOf: String(summary.macroAsOf ?? macro.asOf ?? ''),
    macroSourceMode: String(summary.macroSourceMode ?? macro.sourceMode ?? 'unknown'),
    roadmapHeadline: String(summary.roadmapHeadline ?? roadmap.headline ?? 'FIRE roadmap'),
    probabilityInterpretation: String(summary.probabilityInterpretation ?? roadmap.probabilityInterpretation ?? ''),
    narrative: String(result?.compliant_narrative ?? summary.narrative ?? roadmap.narrative ?? ''),
    disclaimer: String(roadmap.disclaimer ?? 'Monte Carlo simulations express probabilities, not guarantees.'),
    iterations: toNumber(monte.iterations),
    seed: toNumber(monte.seed),
    targetCorpusAtRetirement: toNumber(monte.targetCorpusAtRetirement ?? percentiles.p50),
    shortfallAnalysis: monte.shortfallAnalysis,
    fanChartData: monte.fanChartData ?? [],
    sources,
    actions,
    timeline,
    firstYearMonthlyPlan: sip.firstYearMonthlyPlan ?? [],
    glidepath: sip.glidepath ?? [],
    targetCorpus: toNumber(monte.targetCorpusAtRetirement ?? percentiles.p50),
  };
}

const FIRE_LOADING_CONFIG: LoadingPipelineConfig = {
  title: 'Building your FIRE roadmap',
  subtitle: 'Nested agents are simulating retirement outcomes from your inputs and live macro assumptions.',
  traceLabel: 'GoalProfiler -> MacroAgent -> MonteCarlo -> SIP Glidepath -> Insurance Gap -> Adjusted MC -> Roadmap -> Compliance',
  steps: [
    {
      id: 'goal',
      text: 'Normalizing FIRE inputs...',
      agent: 'GoalProfiler • Deterministic',
      stage: 1,
      agentMatches: ['GoalProfiler'],
    },
    {
      id: 'macro',
      text: 'Fetching macro assumptions...',
      agent: 'MacroAgent • Gemini Flash + Search',
      stage: 1,
      agentMatches: ['MacroAgent'],
    },
    {
      id: 'monte-carlo',
      text: 'Running Monte Carlo simulations...',
      agent: 'MonteCarloEngine • Deterministic',
      stage: 2,
      agentMatches: ['MonteCarloEngine'],
    },
    {
      id: 'sip',
      text: 'Solving SIP glidepath...',
      agent: 'SipGlidepathEngine • Deterministic',
      stage: 2,
      agentMatches: ['SipGlidepathEngine'],
    },
    {
      id: 'insurance',
      text: 'Estimating insurance gaps...',
      agent: 'InsuranceGapAgent • Deterministic',
      stage: 2,
      agentMatches: ['InsuranceGapAgent'],
    },
    {
      id: 'adjusted-mc',
      text: 'Re-simulating with required SIP...',
      agent: 'AdjustedMonteCarloEngine • Deterministic',
      stage: 2,
      agentMatches: ['AdjustedMonteCarloEngine'],
    },
    {
      id: 'roadmap',
      text: 'Interpreting probability distribution...',
      agent: 'RoadmapBuilder • Gemini Pro',
      stage: 3,
      agentMatches: ['RoadmapBuilder'],
    },
    {
      id: 'compliance',
      text: 'Checking probability framing...',
      agent: 'ComplianceChecker • Gemini Flash',
      stage: 4,
      agentMatches: ['ComplianceChecker'],
    },
    {
      id: 'disclaimer',
      text: 'Injecting compliance disclaimer...',
      agent: 'DisclaimerInjector • Gemini Flash',
      stage: 4,
      agentMatches: ['DisclaimerInjector'],
    },
  ],
  footer: 'Live probabilistic execution trace • Streaming via SSE',
};

function MetricCard({
  label,
  value,
  subtext,
  positive = true,
}: {
  label: string;
  value: string;
  subtext?: string;
  positive?: boolean;
}) {
  return (
    <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-sm">
      <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
      </div>
      {subtext && (
        <p className={`mt-3 text-sm font-medium ${positive ? 'text-amber-400' : 'text-red-400'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {icon}
        </div>
      </div>
      {children}
    </div>
  );
}

function MiniTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm text-white font-medium mt-1">{value}</p>
    </div>
  );
}

function formatCompactINR(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${value.toFixed(0)}`;
}

function FanChart({ data, retirementAge }: { data: { age: number; p10: number; p50: number; p90: number }[]; retirementAge: number }) {
  if (!data || data.length < 2) return null;
  return (
    <SectionCard title="Monte Carlo Fan Chart" icon={<Info className="w-4 h-4 text-slate-500" />}>
      <p className="text-xs text-slate-400 mb-4">
        Corpus projection across 1,000 simulations — P10 (worst), P50 (median), P90 (best).
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="fanP90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fanP50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b77d2" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2b77d2" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="age"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis
            tickFormatter={formatCompactINR}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
            width={60}
          />
          <Tooltip
            contentStyle={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(val: number, name: string) => [fmtCurrency(val), name]}
            labelFormatter={(age) => `Age ${age}`}
          />
          <Area type="monotone" dataKey="p90" name="P90 (Upside)" stroke="#00e5ff" fill="url(#fanP90)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="p50" name="P50 (Median)" stroke="#2b77d2" fill="url(#fanP50)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="p10" name="P10 (Downside)" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}

function GlidepathChart({ data }: { data: { age: number; equity: number; debt: number }[] }) {
  if (!data || data.length < 2) return null;
  return (
    <SectionCard title="Asset Glidepath" icon={<Info className="w-4 h-4 text-slate-500" />}>
      <p className="text-xs text-slate-400 mb-4">
        Equity/debt allocation shifts from aggressive to conservative as you approach retirement.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="age"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
            width={45}
          />
          <Tooltip
            contentStyle={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '12px' }}
            labelFormatter={(age) => `Age ${age}`}
            formatter={(val: number, name: string) => [`${val}%`, name]}
          />
          <Area type="monotone" dataKey="equity" name="Equity" stackId="1" stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.3} strokeWidth={2} />
          <Area type="monotone" dataKey="debt" name="Debt" stackId="1" stroke="#10d5ff" fill="#10d5ff" fillOpacity={0.1} strokeWidth={2} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}

export function FIRERoadmap({ profile }: { profile: UserProfile }) {
  const { firePipeline: pipeline, getCrossPipelineData } = useAnalysis();
  const infographic = useInfographic();

  const autoFilled = useMemo(() => {
    const crossData = getCrossPipelineData();
    return {
      existingMfCorpus: !!(crossData.totalCorpus && crossData.totalCorpus > 0),
      monthlySipCurrent: !!(crossData.taxableIncome && crossData.taxableIncome > 0),
    };
  }, [getCrossPipelineData]);

  const fireInput = useMemo(
    () => {
      const crossData = getCrossPipelineData();

      const profileMfCorpus = profile.investments
        .filter((investment) => investment.type === 'Mutual Funds' || investment.type === 'Stocks')
        .reduce((sum, investment) => sum + Number(investment.value || 0), 0);

      const existingMfCorpus =
        crossData.totalCorpus && crossData.totalCorpus > 0
          ? crossData.totalCorpus
          : profileMfCorpus;

      const profileSip = Math.max(0, Number(profile.monthlySipCurrent) || 0);
      const monthlySipCurrent =
        crossData.taxableIncome && crossData.taxableIncome > 0
          ? Math.round(
              (crossData.taxableIncome * (1 - (crossData.taxBracket ?? 30) / 100)) / 12 * 0.10
            )
          : profileSip;

      return {
        age: Math.max(18, Number(profile.age) || 0),
        retireAge: Math.max((Number(profile.age) || 0) + 1, Number(profile.retireAge) || 0),
        income: Math.max(0, Number(profile.income) || 0),
        existingMfCorpus,
        existingPpfCorpus: profile.investments
          .filter((investment) => investment.type === 'PPF' || investment.type === 'EPF')
          .reduce((sum, investment) => sum + Number(investment.value || 0), 0),
        targetMonthlyDraw:
          profile.targetMonthlyExpense > 0
            ? profile.targetMonthlyExpense
            : Math.max(50000, Math.round((Number(profile.income) || 0) / 24)),
        declaredLifeCover: Math.max(0, Number(profile.declaredLifeCover) || 0),
        monthlySipCurrent,
      };
    },
    [profile, getCrossPipelineData]
  );

  useEffect(() => {
    if (fireInput.income <= 0 || pipeline.result || pipeline.isLoading) return;
    void pipeline.execute(fireInput);
  }, [fireInput]);

  const data = normalizeFireResult(pipeline.result);

  const fireInputsServer = useMemo(
    () => ({
      currentAge: fireInput.age,
      retirementAge: fireInput.retireAge,
      yearsToRetirement: fireInput.retireAge - fireInput.age,
      lifeExpectancyAge: 85,
      currentMonthlySip: fireInput.monthlySipCurrent,
      existingMfCorpus: fireInput.existingMfCorpus,
      existingPpfCorpus: fireInput.existingPpfCorpus,
      targetMonthlyDrawToday: fireInput.targetMonthlyDraw,
    }),
    [fireInput]
  );
  const sources = data.sources;
  const actions = data.actions;
  const timeline = data.timeline;
  const firstYearPlan = data.firstYearMonthlyPlan;

  const handleGenerateInfographic = useCallback(() => {
    infographic.generate('fire', {
      age: fireInput.age,
      retireAge: fireInput.retireAge,
      income: fireInput.income,
      successProbability: data.successProbability >= 0 && data.successProbability <= 1 ? data.successProbability * 100 : data.successProbability,
      p50Corpus: data.p50Corpus,
      requiredSip: data.medianSipRequired,
      insuranceGap: data.insuranceGap,
      macroSourceMode: data.macroSourceMode,
    });
  }, [infographic, fireInput, data]);

  if (profile.income <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold text-white">Income data required</h3>
        <p className="text-slate-400 text-center max-w-md">
          We need your income details to model your FIRE roadmap. Please go back and enter your annual income first.
        </p>
      </div>
    );
  }

  if (pipeline.isError) {
    const isNetworkError = pipeline.error?.toLowerCase().includes('failed to fetch') || pipeline.error?.toLowerCase().includes('networkerror');
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold text-white">FIRE analysis failed</h3>
        <p className="text-slate-400 text-center max-w-md">
          {isNetworkError
            ? 'Could not connect to the server. Please make sure the dev server is running (npm run dev) and try again.'
            : (pipeline.error || 'An error occurred while building the FIRE pipeline.')}
        </p>
        <button
          onClick={() => pipeline.execute(fireInput)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-[#0a0a0a] font-semibold hover:bg-amber-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!pipeline.isComplete) {
    return (
      <Loading
        onComplete={() => undefined}
        events={pipeline.events}
        useRealAgents
        pipeline={FIRE_LOADING_CONFIG}
        layout="panel"
      />
    );
  }

  if (!pipeline.result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold text-white">No FIRE data returned</h3>
        <p className="text-slate-400 text-center max-w-md">
          The pipeline completed without a result payload. Retry the analysis to rebuild the roadmap.
        </p>
        <button
          onClick={() => pipeline.execute(fireInput)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-[#0a0a0a] font-semibold hover:bg-amber-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="fire-results"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-6 w-full"
      >
        <header className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">FIRE Roadmap</h2>
            <p className="text-slate-400 mt-1">Probability-based retirement planning with Monte Carlo output.</p>
          </div>
          <div className="px-4 py-2 bg-[#141414] rounded-full border border-[#2a2a2a] self-start flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">V2 Pipeline</span>
          </div>
        </header>

        {(autoFilled.existingMfCorpus || autoFilled.monthlySipCurrent) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-200 text-xs font-medium">
              FIRE inputs enhanced with data from{' '}
              {[
                autoFilled.existingMfCorpus && 'Portfolio X-Ray',
                autoFilled.monthlySipCurrent && 'Tax Wizard',
              ]
                .filter(Boolean)
                .join(' and ')}
            </span>
          </div>
        )}

        <div className="p-8 rounded-2xl bg-[#141414] border border-amber-500/30 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] to-[#10d5ff]" />
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            <span className="text-amber-400">{fmtPercent(data.successProbability)}</span> success probability
          </h3>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            {data.roadmapHeadline}
          </p>
          {data.narrative && <p className="text-sm text-slate-400 mt-4 max-w-4xl mx-auto">{data.narrative}</p>}
          <p className="text-xs text-slate-500 mt-6">
            Monte Carlo target corpus: {fmtCurrency(data.targetCorpus)} | Macro snapshot: {data.macroAsOf || 'unavailable'} | Source mode: {data.macroSourceMode}
          </p>
        </div>

        <WhatIfPanel
          fireInputs={fireInputsServer}
          macroParameters={pipeline.result?.macro_parameters ?? null}
          baselineSuccessProbability={data.successProbability}
          baselineSip={data.medianSipRequired || fireInput.monthlySipCurrent}
          baselineRetirementAge={fireInput.retireAge}
          baselineMonthlyDraw={fireInput.targetMonthlyDraw}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Success Probability"
            value={fmtPercent(data.successProbability)}
            subtext={data.probabilityInterpretation || 'Probability, not guarantee'}
          />
          <MetricCard label="P10 Worst Case" value={fmtCurrency(data.p10Corpus)} subtext="Downside corpus at retirement" positive={false} />
          <MetricCard label="P50 Median" value={fmtCurrency(data.p50Corpus)} subtext="Median retirement corpus" />
          <MetricCard label="P90 Upside" value={fmtCurrency(data.p90Corpus)} subtext="Upper-range retirement corpus" />
        </div>

        <div className="flex flex-col gap-6 w-full">
          <FanChart data={data.fanChartData as { age: number; p10: number; p50: number; p90: number }[]} retirementAge={fireInput.retireAge} />
          <GlidepathChart data={data.glidepath} />
        </div>

        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="SIP Plan" icon={<Info className="w-4 h-4 text-slate-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <MiniTag label="Median SIP" value={fmtCurrency(data.medianSipRequired) + '/mo'} />
              <MiniTag label="Safety SIP" value={fmtCurrency(data.safetySipRequired) + '/mo'} />
              <div className="relative">
                <MiniTag label="Current SIP" value={fmtCurrency(fireInput.monthlySipCurrent) + '/mo'} />
                {autoFilled.monthlySipCurrent && (
                  <span className="absolute top-1.5 right-2 text-[9px] font-medium text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.5 rounded-full">
                    via Tax Wizard
                  </span>
                )}
              </div>
              <MiniTag label="Step-up" value={`${firstYearPlan.length ? 'Included' : 'Annual'} | check roadmap`} />
            </div>

            <div className="space-y-3">
              {firstYearPlan.length > 0 ? (
                firstYearPlan.slice(0, 6).map((entry) => (
                  <div key={entry.month} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                    <div>
                      <p className="text-sm text-slate-300">Month {entry.month}</p>
                      <p className="text-xs text-slate-500">
                        {entry.note || (entry.equity !== undefined && entry.debt !== undefined
                          ? `${entry.equity}% equity / ${entry.debt}% debt`
                          : 'Planned SIP contribution')}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-white font-mono">{fmtCurrency(entry.amount ?? entry.sip ?? 0)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">SIP glidepath details are not available in this response.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Macro Snapshot" icon={<Info className="w-4 h-4 text-slate-500" />}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <MiniTag label="As of" value={data.macroAsOf || 'Not provided'} />
              <MiniTag label="Source mode" value={data.macroSourceMode || 'unknown'} />
              <MiniTag label="Required life cover" value={fmtCurrency(data.requiredLifeCover || 0)} />
              <MiniTag label="Declared cover" value={fmtCurrency(data.declaredLifeCover || 0)} />
            </div>

            <div className="space-y-3">
              {sources.length > 0 ? (
                sources.map((source, index) => (
                  <div key={`${source.label}-${index}`} className="px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white font-medium">{source.label}</p>
                        <p className="text-xs text-slate-500">{source.url || 'Source metadata provided by backend'}</p>
                      </div>
                      <p className="text-xs text-amber-400 font-mono">{source.retrievedAt || data.macroAsOf || 'n/a'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No macro source breakdown returned.</p>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Probability Interpretation" icon={<Info className="w-4 h-4 text-slate-500" />}>
            <p className="text-slate-300 leading-relaxed">
              {data.probabilityInterpretation || 'The roadmap reflects probabilities derived from a Monte Carlo distribution, not guarantees.'}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <MiniTag label="Iterations" value={data.iterations > 0 ? String(data.iterations) : 'n/a'} />
              <MiniTag label="Seed" value={data.seed > 0 ? String(data.seed) : 'n/a'} />
              <MiniTag label="Insurance gap" value={fmtCurrency(data.insuranceGap)} />
            </div>

            {data.shortfallAnalysis ? (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-medium text-red-400">Shortfall analysis</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-300">
                  <div>
                    <p className="text-xs text-slate-500">Average shortfall</p>
                    <p className="font-mono text-white">{fmtCurrency(data.shortfallAnalysis.averageShortfall || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Average depletion age</p>
                    <p className="font-mono text-white">{data.shortfallAnalysis.averageDepletionAge ? data.shortfallAnalysis.averageDepletionAge.toFixed(1) : 'n/a'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Failing scenarios</p>
                    <p className="font-mono text-white">{data.shortfallAnalysis.failingSimulations ?? 'n/a'}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title={data.roadmapHeadline || 'Roadmap'}
            icon={<ShieldAlert className="w-4 h-4 text-slate-500" />}
          >
            <p className="text-slate-300 leading-relaxed">{data.narrative || 'Roadmap details were not returned by the backend.'}</p>

            <div className="space-y-3 mt-6">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                        {item.milestone && <p className="text-[10px] text-amber-500 mt-2">{item.milestone}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No roadmap actions were returned.</p>
              )}
            </div>

            {actions.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((action, index) => (
                    <div key={`${action.title}-${index}`} className="rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] p-4">
                      <p className="text-sm text-white font-medium">{action.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{action.detail || action.impact}</p>
                    {action.impact && <p className="text-[10px] text-amber-400 mt-2">{action.impact}</p>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <SectionCard title="Insurance Gap" icon={<ShieldAlert className="w-4 h-4 text-slate-500" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-2">
                <span className="text-slate-400">Required life cover</span>
                <span className="text-xl font-mono text-white">{fmtCurrency(data.requiredLifeCover || 0)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-2">
                <span className="text-slate-400">Declared cover</span>
                <span className="text-xl font-mono text-white">{fmtCurrency(data.declaredLifeCover || 0)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-2">
                <span className="text-slate-400">Life cover gap</span>
                <span className={`text-xl font-mono ${data.insuranceGap > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {fmtCurrency(data.insuranceGap)}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-400">Recommended health cover</span>
                <span className="text-xl font-mono text-white">{fmtCurrency(data.recommendedHealthCover || 0)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Monte Carlo Summary" icon={<Loader2 className="w-4 h-4 text-slate-500" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <MiniTag label="Target corpus" value={fmtCurrency(data.targetCorpus)} />
                  {autoFilled.existingMfCorpus && (
                    <span className="absolute top-1.5 right-2 text-[9px] font-medium text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.5 rounded-full">
                      via Portfolio X-Ray
                    </span>
                  )}
                </div>
                <MiniTag label="P10 / P50 / P90" value={`${fmtCurrency(data.p10Corpus)} | ${fmtCurrency(data.p50Corpus)} | ${fmtCurrency(data.p90Corpus)}`} />
                <MiniTag label="Source mode" value={data.macroSourceMode || 'unknown'} />
              </div>
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                <p className="text-sm font-medium text-white">Compliance note</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {data.disclaimer}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <InfographicCard
          image={infographic.image}
          isLoading={infographic.isLoading}
          error={infographic.error}
          onGenerate={handleGenerateInfographic}
          onReset={infographic.reset}
          label="FIRE Roadmap Summary"
        />

        <div className="mt-6 p-5 rounded-2xl bg-[#141414] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Mandatory Compliance Disclaimer</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This analysis is generated by ChanakAI for educational purposes only. Monte Carlo outputs express probability, not certainty. Actual market conditions may differ materially from simulated scenarios. Please consult a qualified financial professional before making investment decisions.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}