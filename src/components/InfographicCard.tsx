import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, Loader2, AlertCircle, Download, RefreshCw, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface InfographicCardProps {
  image: { imageBase64: string; mimeType: string; caption?: string } | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onReset: () => void;
  label?: string;
}

/**
 * Reusable card for Nano Banana 2 AI-generated infographic images.
 * Renders a generate button, loading state, image display, or error state.
 */
export function InfographicCard({ image, isLoading, error, onGenerate, onReset, label = 'Visual Summary' }: InfographicCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = `data:${image.mimeType};base64,${image.imageBase64}`;
    link.download = `chanakai-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.click();
  };

  // ── Idle: show generate button ──
  if (!image && !isLoading && !error) {
    return (
      <motion.button
        onClick={onGenerate}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full p-5 rounded-2xl border border-dashed border-navy-700 bg-navy-900/40',
          'hover:border-gold-500/40 hover:bg-navy-900/60 transition-all cursor-pointer',
          'flex items-center gap-4 group'
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-teal-500/10 flex items-center justify-center shrink-0 group-hover:from-gold-500/30 group-hover:to-teal-500/20 transition-colors">
          <Sparkles className="w-5 h-5 text-gold-500" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-white">Generate {label}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Powered by <span className="text-gold-500 font-medium">Nano Banana 2</span> — AI-generated infographic from your data
          </p>
        </div>
        <ImageIcon className="w-5 h-5 text-slate-600 group-hover:text-gold-500 transition-colors shrink-0" />
      </motion.button>
    );
  }

  // ── Loading: spinner + shimmer ──
  if (isLoading) {
    return (
      <div className="w-full p-6 rounded-2xl bg-navy-900/60 border border-navy-700 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-teal-500/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-gold-500 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-teal-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">Generating {label}…</p>
          <p className="text-xs text-slate-500 mt-1">Nano Banana 2 is creating your visual summary</p>
        </div>
        {/* shimmer bar */}
        <div className="w-48 h-1 rounded-full bg-navy-800 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-gold-500 to-teal-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="w-full p-5 rounded-2xl bg-navy-900/60 border border-coral-500/30 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-coral-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-coral-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-coral-400">Image generation failed</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{error}</p>
        </div>
        <button onClick={onGenerate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-slate-300 transition-colors shrink-0">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
        <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-500 transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ── Image display ──
  if (image) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl bg-navy-900/60 border border-navy-700 overflow-hidden"
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</span>
              <span className="text-[10px] text-slate-600 font-mono">• Nano Banana 2</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-500 hover:text-teal-500 transition-colors" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={onGenerate} className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-500 hover:text-gold-500 transition-colors" title="Regenerate">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-500 hover:text-coral-400 transition-colors" title="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* image */}
          <div className={cn('cursor-pointer transition-all', expanded ? 'p-0' : 'p-4')} onClick={() => setExpanded(!expanded)}>
            <img
              src={`data:${image.mimeType};base64,${image.imageBase64}`}
              alt={image.caption || label}
              className={cn(
                'w-full object-contain transition-all',
                expanded ? 'max-h-none rounded-none' : 'max-h-80 rounded-xl'
              )}
            />
          </div>

          {/* caption + footer */}
          {image.caption && (
            <div className="px-5 py-3 border-t border-navy-800">
              <p className="text-xs text-slate-400 leading-relaxed">{image.caption}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
