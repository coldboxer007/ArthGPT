import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Loader2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useWhatIf, type FireInputsServer, type WhatIfOverrides } from '../hooks/useWhatIf';
import type { FireMacroParameters } from '../hooks/useSSE';

interface WhatIfPanelProps {
  fireInputs: FireInputsServer | null;
  macroParameters: FireMacroParameters | null;
  baselineSuccessProbability: number;
  baselineSip: number;
  baselineRetirementAge: number;
  baselineMonthlyDraw: number;
  defaultEquityAllocation?: number;
}

interface SliderConfig {
  key: keyof WhatIfOverrides;
  label: string;
  min: number;
  max: number;
  step: number;
  baseline: number;
  format: (v: number) => string;
  deltaFormat: (delta: number) => string;
}

function formatINR(value: number): string {
  if (value >= 1e5) return `\u20B9${(value / 1e3).toFixed(0)}K`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Returns risk tier metadata for a given success probability (0-100 scale). */
function getRiskTier(pct: number) {
  if (pct < 50) return { label: 'High Risk', color: '#FF6B6B', tailwindText: 'text-coral-500', tailwindBg: 'bg-coral-500' };
  if (pct < 70) return { label: 'Moderate Risk', color: '#F59E0B', tailwindText: 'text-orange-400', tailwindBg: 'bg-orange-400' };
  if (pct < 85) return { label: 'Moderate', color: '#FBBF24', tailwindText: 'text-yellow-400', tailwindBg: 'bg-yellow-400' };
  return { label: 'On Track', color: '#34D399', tailwindText: 'text-emerald-400', tailwindBg: 'bg-emerald-400' };
}

/** Semi-circular gauge rendered with SVG. Animated via a clip-path trick + CSS transition. */
function ProbabilityGauge({ percentage, isLoading }: { percentage: number; isLoading: boolean }) {
  const tier = getRiskTier(percentage);
  const clampedPct = Math.min(100, Math.max(0, percentage));

  // SVG arc parameters
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // shift down slightly so the semi-circle sits well

  // Arc goes from 180° (left) to 0° (right) — a semi-circle
  const startAngle = Math.PI; // 180°
  const endAngle = 0; // 0°
  const sweepAngle = startAngle - endAngle; // π radians total

  // The filled portion angle
  const fillAngle = startAngle - (clampedPct / 100) * sweepAngle;

  // Background arc (full semi-circle)
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy - radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);
  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`;

  // Needle tip position
  const needleX = cx + (radius - 2) * Math.cos(fillAngle);
  const needleY = cy - (radius - 2) * Math.sin(fillAngle);

  // Animated stroke offset approach — we use stroke-dasharray/dashoffset for smooth transitions
  const circumference = Math.PI * radius; // semi-circle length
  const filledLength = (clampedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 30}
          viewBox={`0 0 ${size} ${size / 2 + 30}`}
          className="overflow-visible"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="65%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={bgPath}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc using dash-offset animation */}
          <path
            d={bgPath}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filledLength}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />

          {/* Needle dot */}
          <circle
            cx={needleX}
            cy={needleY}
            r={5}
            fill={tier.color}
            style={{
              transition: 'cx 0.6s ease-out, cy 0.6s ease-out',
              filter: `drop-shadow(0 0 4px ${tier.color}80)`,
            }}
          />
        </svg>

        {/* Center text overlay */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ bottom: 0 }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="text-3xl font-bold font-mono tabular-nums"
              style={{ color: tier.color, transition: 'color 0.4s ease' }}
            >
              {clampedPct.toFixed(1)}%
            </span>
            {isLoading && (
              <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
            )}
          </div>
          <span
            className="text-xs font-medium tracking-wide uppercase mt-0.5"
            style={{ color: tier.color, transition: 'color 0.4s ease', opacity: 0.85 }}
          >
            {tier.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Delta badge showing change from baseline */
function DeltaBadge({
  current,
  baseline,
  format,
}: {
  current: number;
  baseline: number;
  format: (delta: number) => string;
}) {
  const delta = current - baseline;
  if (delta === 0) return null;

  const isPositive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-mono px-1.5 py-0.5 rounded-md ${
        isPositive
          ? 'text-emerald-400 bg-emerald-400/10'
          : 'text-coral-500 bg-coral-500/10'
      }`}
    >
      {isPositive ? '▲' : '▼'} {format(delta)}
    </span>
  );
}

export function WhatIfPanel({
  fireInputs,
  macroParameters,
  baselineSuccessProbability,
  baselineSip,
  baselineRetirementAge,
  baselineMonthlyDraw,
  defaultEquityAllocation = 70,
}: WhatIfPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    overrides,
    setOverride,
    result,
    isLoading,
    error,
    resetOverrides,
  } = useWhatIf(fireInputs, macroParameters, baselineSuccessProbability);

  const sliders = useMemo<SliderConfig[]>(
    () => [
      {
        key: 'monthlySipOverride',
        label: 'Monthly SIP',
        min: 1000,
        max: 500000,
        step: 1000,
        baseline: baselineSip,
        format: (v: number) => formatINR(v),
        deltaFormat: (d: number) => `${d >= 0 ? '+' : ''}\u20B9${Math.abs(d / 1e3).toFixed(0)}K`,
      },
      {
        key: 'retirementAgeOverride',
        label: 'Retirement Age',
        min: 40,
        max: 70,
        step: 1,
        baseline: baselineRetirementAge,
        format: (v: number) => String(v),
        deltaFormat: (d: number) => `${d >= 0 ? '+' : ''}${d}yr`,
      },
      {
        key: 'targetMonthlyDrawOverride',
        label: 'Monthly Draw',
        min: 10000,
        max: 500000,
        step: 5000,
        baseline: baselineMonthlyDraw,
        format: (v: number) => formatINR(v),
        deltaFormat: (d: number) => `${d >= 0 ? '+' : ''}\u20B9${Math.abs(d / 1e3).toFixed(0)}K`,
      },
      {
        key: 'equityAllocationOverride',
        label: 'Equity Allocation',
        min: 30,
        max: 100,
        step: 5,
        baseline: defaultEquityAllocation,
        format: (v: number) => `${v}%`,
        deltaFormat: (d: number) => `${d >= 0 ? '+' : ''}${d}%`,
      },
    ],
    [baselineSip, baselineRetirementAge, baselineMonthlyDraw, defaultEquityAllocation]
  );

  // Don't render if we don't have the required data
  if (!fireInputs || !macroParameters) return null;

  // Normalize baseline probability: if 0-1 scale, convert to 0-100
  const baselinePct =
    baselineSuccessProbability >= 0 && baselineSuccessProbability <= 1
      ? baselineSuccessProbability * 100
      : baselineSuccessProbability;

  // What-if result probability
  const whatIfProbability = result?.successProbability;
  const whatIfPct =
    whatIfProbability != null
      ? whatIfProbability >= 0 && whatIfProbability <= 1
        ? whatIfProbability * 100
        : whatIfProbability
      : null;

  const deltaPP = whatIfPct != null ? whatIfPct - baselinePct : null;

  // Display probability (what-if result takes precedence over baseline)
  const displayPct = whatIfPct ?? baselinePct;

  const percentiles = result?.retirementCorpusPercentiles;
  const hasOverrides = Object.values(overrides).some((v) => v !== undefined);

  return (
    <div className="rounded-3xl bg-navy-900 border border-navy-700 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-navy-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-gold-500" />
          <span className="text-lg font-semibold text-white">What-If Builder</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="whatif-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {/* Reset button */}
              {hasOverrides && (
                <div className="flex justify-end">
                  <button
                    onClick={resetOverrides}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold-500 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              )}

              {/* Sliders with delta indicators */}
              <div className="space-y-5">
                {sliders.map((slider) => {
                  const current =
                    (overrides[slider.key] as number | undefined) ?? slider.baseline;

                  return (
                    <div key={slider.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">
                          {slider.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-white">
                            {slider.format(current)}
                          </span>
                          <DeltaBadge
                            current={current}
                            baseline={slider.baseline}
                            format={slider.deltaFormat}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={current}
                        onChange={(e) =>
                          setOverride(slider.key, Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Results display */}
              <div className="rounded-2xl bg-navy-800 border border-navy-700 p-5 space-y-5">
                {/* --- Probability Gauge --- */}
                <ProbabilityGauge percentage={displayPct} isLoading={isLoading} />

                {/* --- Delta from baseline --- */}
                {deltaPP != null && deltaPP !== 0 && (
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-full ${
                        deltaPP >= 0
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-coral-500 bg-coral-500/10'
                      }`}
                    >
                      {deltaPP >= 0 ? '▲' : '▼'}{' '}
                      {deltaPP >= 0 ? '+' : ''}
                      {deltaPP.toFixed(1)}pp from baseline
                    </span>
                  </div>
                )}

                {/* --- Corpus Preview (P50 prominent) --- */}
                {percentiles && (
                  <div className="rounded-xl bg-navy-900/60 border border-navy-700/50 p-4">
                    {/* P50 hero number */}
                    <div className="flex flex-col items-center mb-3">
                      <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Projected Corpus at Retirement
                      </span>
                      <span className="text-2xl font-bold font-mono text-gold-500">
                        {formatIndianCurrency(percentiles.p50)}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        median (P50) estimate
                      </span>
                    </div>

                    {/* P10 / P90 range */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="text-center">
                        <span className="text-slate-500 text-xs block">Pessimistic</span>
                        <span className="font-mono text-slate-300">
                          {formatIndianCurrency(percentiles.p10)}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-navy-700" />
                      <div className="text-center">
                        <span className="text-slate-500 text-xs block">Optimistic</span>
                        <span className="font-mono text-slate-300">
                          {formatIndianCurrency(percentiles.p90)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <p className="text-xs text-coral-500">
                    What-If error: {error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
