import { motion } from 'motion/react';
import { ArrowRight, UploadCloud, CheckCircle2, IndianRupee, Briefcase, Home, GraduationCap, TrendingUp, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  step: number;
  nextStep: () => void;
}

export function Onboarding({ step, nextStep }: OnboardingProps) {
  const [goals, setGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-3xl mx-auto w-full">
      {step > 0 && (
        <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 px-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 max-w-16 rounded-full transition-colors duration-500",
                step >= i ? "bg-gold-500" : "bg-navy-800"
              )}
            />
          ))}
        </div>
      )}

      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              ArthaGPT
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light">
              Your money. Finally understood.
            </p>
          </div>
          <button
            onClick={nextStep}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-navy-950 bg-gold-500 rounded-full hover:bg-gold-400 transition-all hover:scale-105 active:scale-95"
          >
            Start my financial review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">About you</h2>
            <p className="text-slate-400">Let's start with the basics.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Age</label>
              <input type="number" placeholder="34" className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">City</label>
              <input type="text" placeholder="Bengaluru" className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Annual Income (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="24,00,000" className="w-full bg-navy-900 border border-navy-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
              </div>
            </div>
          </div>

          <button onClick={nextStep} className="w-full py-4 bg-white text-navy-950 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            Continue
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">Your investments</h2>
            <p className="text-slate-400">What do you currently hold?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['Mutual Funds', 'PPF', 'NPS', 'Fixed Deposits', 'Stocks'].map((item) => (
              <div key={item} className="p-4 rounded-xl border border-navy-700 bg-navy-900 hover:border-gold-500/50 cursor-pointer transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200">{item}</span>
                  <div className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-gold-500 flex items-center justify-center" />
                </div>
                <input type="text" placeholder="₹ Value" className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none" onClick={(e) => e.stopPropagation()} />
              </div>
            ))}
          </div>

          <button onClick={nextStep} className="w-full py-4 bg-white text-navy-950 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            Continue
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">Your goals</h2>
            <p className="text-slate-400">Select all that apply.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'retire', label: 'Retire Early', icon: Briefcase },
              { id: 'child', label: "Child's Education", icon: GraduationCap },
              { id: 'home', label: 'Buy a Home', icon: Home },
              { id: 'wealth', label: 'Wealth Building', icon: TrendingUp },
              { id: 'tax', label: 'Tax Optimisation', icon: ShieldCheck },
            ].map((goal) => {
              const isSelected = goals.includes(goal.id);
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3",
                    isSelected ? "border-gold-500 bg-gold-500/10" : "border-navy-700 bg-navy-900 hover:border-slate-500"
                  )}
                >
                  {isSelected && (
                    <motion.div layoutId="ring" className="absolute inset-0 rounded-2xl border-2 border-gold-500" />
                  )}
                  <Icon className={cn("w-8 h-8", isSelected ? "text-gold-500" : "text-slate-400")} />
                  <span className={cn("font-medium", isSelected ? "text-white" : "text-slate-300")}>{goal.label}</span>
                </div>
              );
            })}
          </div>

          <button onClick={nextStep} className="w-full py-4 bg-white text-navy-950 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            Continue
          </button>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">Upload your statements</h2>
            <p className="text-slate-400">For precise analysis, upload your CAMS/KFintech PDF.</p>
          </div>

          <div 
            onClick={nextStep}
            className="border-2 border-dashed border-navy-700 hover:border-gold-500/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-navy-900/50 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-gold-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Drag & drop your PDF here</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Supports CAMS PDF, KFintech PDF, and Form 16. Password protected? We'll ask for it.
            </p>
          </div>

          <div className="text-center">
            <button onClick={nextStep} className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4">
              I'll do this later
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
