import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  "Reading your portfolio statement...",
  "Fetching NAV history for 6 funds...",
  "Calculating your true XIRR...",
  "Checking for stock overlap...",
  "Computing tax under both regimes...",
  "Building your retirement roadmap...",
  "Generating your personalised report..."
];

export function Loading({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-semibold text-white">ArthaGPT is working</h2>
          <p className="text-slate-400">Analysing your financial life.</p>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-navy-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-navy-900 transition-colors duration-500",
                  isCompleted ? "border-gold-500 text-gold-500" : isCurrent ? "border-blue-500 text-blue-500" : "border-slate-700 text-slate-700"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                
                <div className={cn(
                  "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border transition-all duration-500",
                  isCompleted ? "bg-navy-900/50 border-gold-500/20" : isCurrent ? "bg-navy-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-transparent border-transparent opacity-40"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-medium text-sm",
                      isCompleted ? "text-slate-200" : isCurrent ? "text-white" : "text-slate-500"
                    )}>{step}</span>
                  </div>
                  {(isCompleted || isCurrent) && (
                    <span className="text-xs font-mono text-slate-500">
                      {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
