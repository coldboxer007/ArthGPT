import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Onboarding } from './components/Onboarding';
import { Loading } from './components/Loading';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep((s) => s + 1);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-gold-500/30">
      <AnimatePresence mode="wait">
        {step < 5 && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Onboarding step={step} nextStep={nextStep} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loading onComplete={() => setStep(6)} />
          </motion.div>
        )}
        {step === 6 && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
