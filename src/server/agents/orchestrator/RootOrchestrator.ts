import { GoogleGenAI } from '@google/genai';
import { classifyIntent, type Intent } from './intentClassifier';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ADVISOR_MODEL = 'gemini-3-flash';
const ADVISOR_FALLBACK_MODEL = 'gemini-2.5-flash';

// ═══════════════════════════════════════════════════════════════════════════
// Root Orchestrator — Routes NL queries to the correct pipeline
// ═══════════════════════════════════════════════════════════════════════════

export interface OrchestratorContext {
  profile?: {
    age: number;
    city: string;
    income: number;
    investments: { type: string; value: number }[];
    goals: string[];
    retireAge: number;
    baseSalary?: number;
    hraReceived?: number;
    rentPaid?: number;
    section80C?: number;
    section80CCD1B?: number;
    section80D?: number;
    homeLoanInterest?: number;
    isMetro?: boolean;
    monthlySipCurrent?: number;
    targetMonthlyExpense?: number;
    declaredLifeCover?: number;
  };
  crossPipelineData?: {
    taxRegime?: string;
    taxBracket?: number;
    totalDeductions?: number;
    taxableIncome?: number;
    portfolioXirr?: number;
    totalCorpus?: number;
    fundCount?: number;
    fireSuccessProbability?: number;
    requiredSip?: number;
  };
  documents?: {
    hasCas: boolean;
    hasForm16: boolean;
    hasPayslip: boolean;
    casData?: object;
    form16Data?: object;
    payslipData?: object;
  };
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface OrchestratorResponse {
  intent: Intent;
  pipeline: string; // 'portfolio' | 'tax' | 'fire' | 'advisory' | 'multi' | 'unknown'
  suggestedInputs?: Record<string, unknown>;
  message: string; // Natural language response explaining what will happen
}

// ═══════════════════════════════════════════════════════════════════════════
// Advisory System Prompt
// ═══════════════════════════════════════════════════════════════════════════

const ADVISORY_SYSTEM_PROMPT = `You are ChanakAI, India's AI financial advisor. You provide personalized, actionable financial advice for Indian users. Use the user's actual financial data to give specific recommendations.

Rules:
- Reference actual numbers from the user's profile (income, SIP, corpus, age)
- Give India-specific advice (mention actual schemes, tax sections like 80C/80CCD, SEBI guidelines)
- Be concise but substantive (3-5 paragraphs max)
- Include actionable next steps with specific amounts
- If cross-pipeline results are available, reference them (e.g., "Your portfolio XIRR of 14.2%...")
- If no user data is available, still give helpful general advice but mention that personalized recommendations require completing the onboarding
- Format amounts in Indian notation (₹X Lakh, ₹X Cr)

IMPORTANT: End every response with this disclaimer on a new line:
"⚠️ This is AI-generated educational content, not financial advice from a SEBI-registered advisor."`;

// ═══════════════════════════════════════════════════════════════════════════
// Advisory Response Generation
// ═══════════════════════════════════════════════════════════════════════════

async function generateAdvisoryResponse(
  userMessage: string,
  context?: OrchestratorContext
): Promise<string> {
  // Build context sections for the system prompt
  const contextSections: string[] = [];

  if (context?.profile && context.profile.age > 0) {
    const p = context.profile;
    const investmentSummary = p.investments?.length
      ? p.investments.map(i => `${i.type}: ₹${formatIndian(i.value)}`).join(', ')
      : 'none declared';
    contextSections.push(
      `USER PROFILE:\n` +
      `- Age: ${p.age}, City: ${p.city}\n` +
      `- Annual Income: ₹${formatIndian(p.income)}\n` +
      `- Investments: ${investmentSummary}\n` +
      `- Goals: ${p.goals?.join(', ') || 'none declared'}\n` +
      `- Retirement Age Target: ${p.retireAge}\n` +
      (p.monthlySipCurrent ? `- Current Monthly SIP: ₹${formatIndian(p.monthlySipCurrent)}\n` : '') +
      (p.targetMonthlyExpense ? `- Target Monthly Expense (Retirement): ₹${formatIndian(p.targetMonthlyExpense)}\n` : '') +
      (p.declaredLifeCover ? `- Life Cover: ₹${formatIndian(p.declaredLifeCover)}\n` : '') +
      (p.baseSalary ? `- Base Salary: ₹${formatIndian(p.baseSalary)}\n` : '') +
      (p.hraReceived ? `- HRA Received: ₹${formatIndian(p.hraReceived)}\n` : '')
    );
  }

  if (context?.crossPipelineData) {
    const cpd = context.crossPipelineData;
    const parts: string[] = [];
    if (cpd.portfolioXirr !== undefined) parts.push(`Portfolio XIRR: ${cpd.portfolioXirr}%`);
    if (cpd.totalCorpus !== undefined) parts.push(`Total Corpus: ₹${formatIndian(cpd.totalCorpus)}`);
    if (cpd.fundCount !== undefined) parts.push(`Fund Count: ${cpd.fundCount}`);
    if (cpd.taxRegime) parts.push(`Tax Regime: ${cpd.taxRegime}`);
    if (cpd.taxBracket !== undefined) parts.push(`Tax Bracket: ${cpd.taxBracket}%`);
    if (cpd.totalDeductions !== undefined) parts.push(`Total Deductions: ₹${formatIndian(cpd.totalDeductions)}`);
    if (cpd.taxableIncome !== undefined) parts.push(`Taxable Income: ₹${formatIndian(cpd.taxableIncome)}`);
    if (cpd.fireSuccessProbability !== undefined) parts.push(`FIRE Success Probability: ${cpd.fireSuccessProbability}%`);
    if (cpd.requiredSip !== undefined) parts.push(`Required SIP: ₹${formatIndian(cpd.requiredSip)}/mo`);
    if (parts.length > 0) {
      contextSections.push(`CROSS-PIPELINE ANALYSIS RESULTS:\n${parts.join('\n')}`);
    }
  }

  if (context?.documents) {
    const docs = context.documents;
    const docParts: string[] = [];
    if (docs.hasCas) docParts.push('CAS statement (parsed)');
    if (docs.hasForm16) docParts.push('Form 16 (parsed)');
    if (docs.hasPayslip) docParts.push('Payslip (parsed)');
    if (docParts.length > 0) {
      contextSections.push(`UPLOADED DOCUMENTS: ${docParts.join(', ')}`);
    }
  }

  const contextBlock = contextSections.length > 0
    ? `\n\n--- USER CONTEXT ---\n${contextSections.join('\n\n')}\n--- END CONTEXT ---\n`
    : '\n\n[No user profile data available — user has not completed onboarding yet]\n';

  // Build chat history messages
  const messages: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];

  if (context?.chatHistory && context.chatHistory.length > 0) {
    for (const msg of context.chatHistory) {
      messages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Add the current user message
  messages.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const fullSystemPrompt = ADVISORY_SYSTEM_PROMPT + contextBlock;

  // Try primary model, fall back if it fails
  try {
    return await callGemini(ADVISOR_MODEL, fullSystemPrompt, messages);
  } catch (primaryError) {
    console.warn(`ChanakAI advisory: ${ADVISOR_MODEL} failed, falling back to ${ADVISOR_FALLBACK_MODEL}`, primaryError);
    try {
      return await callGemini(ADVISOR_FALLBACK_MODEL, fullSystemPrompt, messages);
    } catch (fallbackError) {
      console.error('ChanakAI advisory: both models failed', fallbackError);
      return 'I apologize, but I\'m unable to generate a response right now. Please try again in a moment.\n\n⚠️ This is AI-generated educational content, not financial advice from a SEBI-registered advisor.';
    }
  }
}

async function callGemini(
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'model'; parts: { text: string }[] }>
): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: messages,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text || 'I wasn\'t able to generate a response. Please try rephrasing your question.';
}

// ═══════════════════════════════════════════════════════════════════════════
// Indian Number Formatting Helper
// ═══════════════════════════════════════════════════════════════════════════

function formatIndian(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)} Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)} Lakh`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

// ═══════════════════════════════════════════════════════════════════════════
// Personalized Canned Messages for Pipeline Intents
// ═══════════════════════════════════════════════════════════════════════════

function buildPortfolioMessage(context?: OrchestratorContext): string {
  if (context?.profile && context.profile.investments?.length > 0) {
    const fundCount = context.profile.investments.length;
    const totalValue = context.profile.investments.reduce((sum, i) => sum + i.value, 0);
    return `Based on your ${fundCount} investment holding${fundCount > 1 ? 's' : ''} worth ₹${formatIndian(totalValue)}, I'll run the 6-agent X-Ray — covering XIRR, overlap detection, expense analysis, benchmarking, and rebalancing recommendations.`;
  }
  return "I'll analyze your mutual fund portfolio with our 6-agent X-Ray pipeline — covering XIRR, overlap detection, expense analysis, benchmarking, and rebalancing recommendations.";
}

function buildTaxMessage(context?: OrchestratorContext): string {
  if (context?.profile && context.profile.income > 0) {
    const incomeStr = formatIndian(context.profile.income);
    const regime = context.crossPipelineData?.taxRegime || 'optimal';
    return `With your ₹${incomeStr} income, I'll optimize your tax strategy — comparing old vs new regime, finding missed deductions, and generating SEBI-compliant recommendations for the ${regime} regime.`;
  }
  return "Let me run the Tax Wizard to optimize your tax strategy — I'll compare both regimes, find missed deductions, and generate SEBI-compliant recommendations.";
}

function buildFireMessage(context?: OrchestratorContext): string {
  if (context?.profile && context.profile.age > 0 && context.profile.retireAge > 0) {
    const sipStr = context.profile.monthlySipCurrent
      ? `₹${formatIndian(context.profile.monthlySipCurrent)}`
      : 'your current';
    return `Given your age ${context.profile.age}, retirement target of ${context.profile.retireAge}, and ${sipStr} SIP, I'll build your FIRE roadmap with Monte Carlo simulations, SIP glidepath, and insurance gap analysis.`;
  }
  return "I'll build your FIRE roadmap with Monte Carlo simulations — including SIP glidepath, insurance gap analysis, and a comprehensive retirement plan.";
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Orchestrator
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Orchestrate a user's natural language query:
 * 1. Classify the intent via Gemini Flash
 * 2. Generate a friendly response message (or full AI advisory response)
 * 3. Return the pipeline name for frontend tab switching
 */
export async function orchestrate(
  userMessage: string,
  context?: OrchestratorContext
): Promise<OrchestratorResponse> {
  const intent = await classifyIntent(userMessage);

  const pipeline = intent.type;
  let message: string;

  switch (intent.type) {
    case 'portfolio':
      message = buildPortfolioMessage(context);
      break;
    case 'tax':
      message = buildTaxMessage(context);
      break;
    case 'fire':
      message = buildFireMessage(context);
      break;
    case 'advisory': {
      message = await generateAdvisoryResponse(userMessage, context);
      break;
    }
    case 'multi': {
      const first = intent.intents[0];
      const firstLabel = first ? pipelineLabel(first.type) : 'analysis';
      message = `This touches multiple areas. I'll start with ${firstLabel} and connect the insights across pipelines.`;
      break;
    }
    case 'unknown':
    default:
      message = "I can help with portfolio analysis, tax optimization, retirement planning, or general financial advice. Which would you like to explore?";
      break;
  }

  // If context has relevant data from previous pipeline runs, mention it (for non-advisory intents)
  if (context?.crossPipelineData && intent.type !== 'advisory') {
    if (context.crossPipelineData.portfolioXirr !== undefined && (intent.type === 'portfolio' || intent.type === 'fire')) {
      message += " I see you've already run Portfolio X-Ray — I'll use those results.";
    }
    if (context.crossPipelineData.taxRegime !== undefined && (intent.type === 'tax' || intent.type === 'fire')) {
      message += " Your tax analysis is available — I'll factor that in.";
    }
    if (context.crossPipelineData.fireSuccessProbability !== undefined && intent.type === 'fire') {
      message += " Previous FIRE simulation data is available for comparison.";
    }
  }

  return {
    intent,
    pipeline,
    suggestedInputs: undefined,
    message,
  };
}

function pipelineLabel(type: string): string {
  switch (type) {
    case 'portfolio': return 'Portfolio X-Ray';
    case 'tax': return 'Tax Wizard';
    case 'fire': return 'FIRE Roadmap';
    case 'advisory': return 'Financial Advisory';
    default: return 'analysis';
  }
}
