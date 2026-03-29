import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Sparkles, MessageCircle, Send, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserProfile, UploadedDocument } from '../App';

type Tab = 'portfolio' | 'fire' | 'tax';

interface ChatMentorProps {
  profile: UserProfile;
  uploadedDocs: UploadedDocument[];
  setActiveTab: (tab: Tab) => void;
  getCrossPipelineData: () => any;
}

const pipelineLabels: Record<string, string> = {
  portfolio: 'Portfolio X-Ray',
  tax: 'Tax Wizard',
  fire: 'FIRE Roadmap',
};

export function ChatMentor({ profile, uploadedDocs, setActiveTab, getCrossPipelineData }: ChatMentorProps) {
  const [orchestratorQuery, setOrchestratorQuery] = useState('');
  const [orchestratorLoading, setOrchestratorLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; pipeline?: string; intentType?: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive parsed data
  const parsedCas = uploadedDocs.find(d => d.parsedData?.type === 'cas')?.parsedData;
  const parsedForm16 = uploadedDocs.find(d => d.parsedData?.type === 'form16')?.parsedData;
  const parsedPayslip = uploadedDocs.find(d => d.parsedData?.type === 'payslip')?.parsedData;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, orchestratorLoading]);

  const handleOrchestratorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orchestratorQuery.trim() || orchestratorLoading) return;

    const currentQuery = orchestratorQuery;
    setOrchestratorQuery('');

    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setOrchestratorLoading(true);

    try {
      const res = await fetch('/api/v2/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentQuery,
          profile: {
            age: profile.age,
            city: profile.city,
            income: profile.income,
            investments: profile.investments,
            goals: profile.goals,
            retireAge: profile.retireAge,
            baseSalary: profile.baseSalary,
            hraReceived: profile.hraReceived,
            rentPaid: profile.rentPaid,
            section80C: profile.section80C,
            section80CCD1B: profile.section80CCD1B,
            section80D: profile.section80D,
            homeLoanInterest: profile.homeLoanInterest,
            isMetro: profile.isMetro,
            monthlySipCurrent: profile.monthlySipCurrent,
            targetMonthlyExpense: profile.targetMonthlyExpense,
            declaredLifeCover: profile.declaredLifeCover,
          },
          crossPipelineData: getCrossPipelineData(),
          documents: {
            hasCas: !!parsedCas,
            hasForm16: !!parsedForm16,
            hasPayslip: !!parsedPayslip,
            ...(parsedCas && { casData: parsedCas }),
            ...(parsedForm16 && { form16Data: parsedForm16 }),
            ...(parsedPayslip && { payslipData: parsedPayslip }),
          },
          chatHistory: chatHistory.slice(-5),
        }),
      });
      const data = await res.json();

      const pipelineValue = data.pipeline && ['portfolio', 'fire', 'tax'].includes(data.pipeline) ? data.pipeline : undefined;
      const intentType = data.intent?.type || undefined;

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'Processing your request...',
          pipeline: pipelineValue,
          intentType,
        },
      ]);
    } catch {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t process that request. Please try again.' },
      ]);
    } finally {
      setOrchestratorLoading(false);
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-navy-900 border-l border-navy-800 shadow-xl backdrop-blur-xl bg-opacity-90">
      {/* Chat header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-navy-800 bg-navy-950 shrink-0">
        <Sparkles className="w-5 h-5 text-teal-400" />
        <span className="text-base font-bold text-white tracking-wide">ChanakAI</span>
        <span className="text-[10px] text-slate-400 ml-1 uppercase tracking-widest font-semibold">Mentor</span>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {chatHistory.length === 0 && !orchestratorLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 border border-teal-500/20">
              <MessageCircle className="w-8 h-8 text-teal-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">
              Ask me anything about your finances.
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
              I can analyze portfolios, optimize taxes, or plan retirement.
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] px-4 py-3 bg-teal-600 rounded-2xl rounded-tr-sm shadow-md">
                <p className="text-sm text-navy-950 font-medium whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[90%] bg-navy-800 border border-navy-700 rounded-2xl rounded-tl-sm p-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.pipeline && msg.intentType !== 'advisory' && msg.intentType !== 'unknown' && (
                  <button
                    onClick={() => setActiveTab(msg.pipeline as Tab)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-xl hover:bg-teal-500/20 transition-all duration-200"
                  >
                    Launch {pipelineLabels[msg.pipeline] || msg.pipeline}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {orchestratorLoading && (
          <div className="flex justify-start">
            <div className="bg-navy-800 border border-navy-700 rounded-2xl rounded-tl-sm p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
              <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </span>
                ChanakAI is thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat input bar */}
      <form onSubmit={handleOrchestratorSubmit} className="shrink-0 border-t border-navy-800 bg-navy-950 p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={orchestratorQuery}
            onChange={(e) => setOrchestratorQuery(e.target.value)}
            placeholder="Ask a question..."
            disabled={orchestratorLoading}
            className="w-full pl-4 pr-12 py-3.5 bg-navy-900 border border-navy-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={orchestratorLoading || !orchestratorQuery.trim()}
            className="absolute right-2 p-2 bg-teal-500 text-navy-950 rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}