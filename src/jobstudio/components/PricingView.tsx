// @ts-nocheck -- ported with 3-tier pricing (Free, Plus, Pro)
import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  Compass,
  Milestone,
  HelpCircle as QuestionIcon,
  Download,
  Briefcase,
  Loader2,
} from 'lucide-react';

interface PricingViewProps {
  userPlan?: 'free' | 'plus' | 'pro';
  isProUser: boolean;
  onUpgradeToPlan?: (plan: 'plus' | 'pro') => void;
  onUpgradeToPro: () => void;
  onDowngradeToFree: () => void;
  tailoredCount: number;
  onNavigateToTab: (tab: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  userPlan,
  isProUser,
  onUpgradeToPlan,
  onUpgradeToPro,
  onDowngradeToFree,
  tailoredCount,
  onNavigateToTab,
}) => {
  const currentPlan = userPlan || (isProUser ? 'pro' : 'free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'plus' | 'pro'>('plus');
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });

  // Plus pricing
  const plusMonthly = 9.99;
  const plusAnnualMonthly = 7.99; // 20% discount
  const plusAnnualTotal = (plusAnnualMonthly * 12).toFixed(2);

  // Pro pricing
  const proMonthly = 19.99;
  const proAnnualMonthly = 15.99; // 20% discount
  const proAnnualTotal = (proAnnualMonthly * 12).toFixed(2);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleStartCheckout = (plan: 'plus' | 'pro') => {
    setSelectedCheckoutPlan(plan);
    setCheckoutSuccess(false);
    setIsProcessing(false);
    setShowCheckoutModal(true);
  };

  const handleConfirmUpgrade = () => {
    if (onUpgradeToPlan) {
      onUpgradeToPlan(selectedCheckoutPlan);
    } else {
      onUpgradeToPro();
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  const faqs = [
    {
      q: 'How do the resume tailoring limits work across Free, Plus, and Pro?',
      a: 'Free users can tailor up to 2 resumes per month to test-drive the AI matching engine. Plus users receive 50 tailored resumes per month ($9.99/mo) — ideal for active candidates submitting 1–2 applications per day. Pro users ($19.99/mo) get unlimited tailored resumes with zero monthly quotas for intense or executive searches.',
    },
    {
      q: 'What is the main difference between Plus ($9.99) and Pro ($19.99)?',
      a: 'Plus includes 50 tailored resumes, 25 cover letters, full 3-persona recruiter reviews, DOCX exports, and access to all 100+ company focus packs. Pro unlocks unlimited resumes, plus advanced Stage 2 interview tools: the Behavioral STAR Mock Interview Practice Coach, Offer & Salary Negotiation Copilot (with counter-offer scripts and live phone tactics), and unlimited ATS portal questions.',
    },
    {
      q: 'Can I cancel or switch my plan at any time?',
      a: 'Yes, absolutely. There are no long-term contracts, lock-ins, or cancellation fees. You can upgrade, downgrade, or cancel with a single click at any time, retaining access until the end of your billing cycle.',
    },
    {
      q: 'What is included in the ATS Application Question Answerer?',
      a: 'When applying on Greenhouse, Lever, Ashby, or Workday, portals frequently ask custom open-ended questions like "Describe a time you mitigated an operational failure" or "Why do you want to work here?". Plus includes 20 portal answers/month, while Pro includes unlimited metric-backed STAR stories with embedded ATS keywords.',
    },
    {
      q: 'How does Interview Prep Intelligence work?',
      a: 'Both Plus and Pro unlock our curated 100+ global employer guidance library (Google, Amazon, Stripe, Revolut, etc.) with culture pillars, domain context, and interview strategies. Pro additionally provides real Glassdoor/AmbitionBox question breakdowns and behavioral STAR AI scoring.',
    },
    {
      q: 'Which ATS job platforms are connected?',
      a: 'Job Studio fetches live openings directly from public company job boards on Greenhouse, Lever, Ashby, SmartRecruiters and Workable, plus selected tech and remote job boards.',
    },
    {
      q: 'Are my personal details and resume confidential?',
      a: 'Yes, 100%. Your career history, contact details, and resume files are stored strictly within your secure user account and are never sold or shared with third parties.',
    },
  ];

  return (
    <div className="workspace-pricing max-w-6xl mx-auto space-y-12 pb-16">
      {/* Top Hero Banner */}
      <div className="text-center space-y-4 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wider uppercase font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          PRICING &amp; PLANS
        </div>

        <h1
          className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight max-w-2xl mx-auto leading-tight"
          style={{ letterSpacing: '-0.03em' }}
        >
          Choose the right plan for your job search
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From casual exploration to high-volume autonomous job applications. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center p-1 bg-surface rounded-full border border-border text-xs font-medium">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-card text-foreground shadow-elevated font-semibold'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-card text-foreground shadow-elevated font-semibold'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Tier Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 items-stretch">
        {/* 1. FREE CARD */}
        <div
          className={`bg-card rounded-3xl border p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
            currentPlan === 'free'
              ? 'border-brand/40 shadow-elevated'
              : 'border-border shadow-elevated'
          }`}
        >
          {currentPlan === 'free' && (
            <div className="absolute -top-3 left-6">
              <span className="px-3 py-1 bg-surface border border-border text-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                CURRENT PLAN
              </span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Free</h3>
              <p className="text-xs text-subtle mt-1">
                Explore the market &amp; test-drive truthful AI tailoring.
              </p>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  $0
                </span>
                <span className="text-xs font-semibold text-subtle">forever</span>
              </div>
              <p className="text-[11px] text-subtle mt-1">No credit card required</p>
            </div>

            {/* Free Usage Progress */}
            <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Monthly Tailoring Quota</span>
                <span className="font-bold text-brand font-mono">
                  {Math.min(tailoredCount, 2)} / 2 used
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    tailoredCount >= 2 ? 'bg-warning' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((tailoredCount / 2) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-subtle">
                {tailoredCount >= 2
                  ? 'Free quota reached. Upgrade to Plus or Pro for more tailoring.'
                  : `${2 - Math.min(tailoredCount, 2)} free tailored resume${
                      2 - Math.min(tailoredCount, 2) === 1 ? '' : 's'
                    } remaining.`}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                WHAT'S INCLUDED:
              </span>
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>2 tailored resumes per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>1 custom cover letter draft</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    Search live jobs across Greenhouse, Lever, Ashby, and SmartRecruiters
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    Foundational Career Roadmaps (Stages 1 &amp; 2)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    ATS-compliant Vector PDF exports
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>PDF, DOCX &amp; Plaintext Exports</span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>Full 3-Persona Recruiter Review</span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>100+ Curated Company Focus Packs</span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>Offer &amp; Salary Negotiation Copilot</span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>Behavioral Interview STAR Coach</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            {currentPlan === 'free' ? (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-full bg-surface text-subtle text-xs font-semibold cursor-default text-center"
              >
                Current Plan
              </button>
            ) : (
              <button
                type="button"
                onClick={onDowngradeToFree}
                className="w-full py-3 px-4 rounded-full bg-card border border-border hover:bg-surface text-foreground text-xs font-semibold cursor-pointer transition-colors text-center"
              >
                Downgrade to Free
              </button>
            )}
          </div>
        </div>

        {/* 2. PLUS CARD ($9.99/mo) - MOST POPULAR */}
        <div
          className={`bg-card rounded-3xl border-2 p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
            currentPlan === 'plus'
              ? 'border-success shadow-elevated'
              : 'border-brand/70 shadow-elevated'
          }`}
        >
          {/* Badge */}
          <div className="absolute -top-3.5 left-6 flex items-center gap-1.5">
            <span className="px-3.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
              MOST POPULAR
            </span>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Plus</h3>
                <p className="text-xs text-subtle mt-1">
                  The active job search copilot for steady momentum.
                </p>
              </div>
              {currentPlan === 'plus' && (
                <span className="px-2.5 py-1 bg-success/15 text-success text-[11px] font-bold rounded-full font-mono">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  ${billingCycle === 'monthly' ? plusMonthly : plusAnnualMonthly}
                </span>
                <span className="text-xs font-semibold text-subtle">/mo</span>
              </div>
              <p className="text-[11px] text-subtle mt-1">
                {billingCycle === 'monthly'
                  ? 'Billed monthly · Cancel anytime'
                  : `$${plusAnnualTotal} billed yearly · Save 20% on annual billing`}
              </p>
            </div>

            {/* Plus Highlight Box */}
            <div className="p-3.5 rounded-2xl bg-brand/5 border border-brand/15 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Zap className="w-3.5 h-3.5" />
                <span>50 Tailored Resumes / Month</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Ideal for 1–2 focused applications per day. Never get blocked by strict free limits.
              </p>
            </div>

            {/* Plus Quota Progress (if active) */}
            {currentPlan === 'plus' && (
              <div className="p-3 rounded-2xl bg-surface border border-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Monthly Plus Quota</span>
                  <span className="font-bold text-brand font-mono">
                    {Math.min(tailoredCount, 50)} / 50 used
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min((tailoredCount / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Feature List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                EVERYTHING IN FREE, PLUS:
              </span>
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>50 tailored resumes &amp; 25 cover letters/mo</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Full 3-Persona Recruiter Review</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>100+ Curated Company Focus Packs</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>PDF, DOCX &amp; Plaintext Exports</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>20 ATS Screening Answers/mo</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>Offer &amp; Salary Negotiation Copilot</span>
                </li>
                <li className="flex items-start gap-2.5 text-subtle">
                  <X className="w-4 h-4 text-subtle/40 shrink-0 mt-0.5" />
                  <span>Behavioral Interview STAR Coach</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            {currentPlan === 'plus' ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-full bg-success/15 text-success text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Plus Plan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartCheckout('plus')}
                className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all cursor-pointer shadow-elevated flex items-center justify-center gap-2 group"
              >
                <span>Upgrade to Plus (${billingCycle === 'monthly' ? '9.99' : '7.99'}/mo)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* 3. PRO CARD ($19.99/mo) - BEST VALUE · COMPLETE COPILOT */}
        <div
          className={`bg-card rounded-3xl border-2 p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
            currentPlan === 'pro'
              ? 'border-success shadow-elevated'
              : 'border-primary shadow-elevated'
          }`}
        >
          {/* Badge */}
          <div className="absolute -top-3.5 left-6 flex items-center gap-1.5">
            <span className="px-3.5 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              BEST VALUE · RECOMMENDED
            </span>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Pro</h3>
                <p className="text-xs text-subtle mt-1">
                  Run an intense, autonomous search with complete AI copilot tools.
                </p>
              </div>
              {currentPlan === 'pro' && (
                <span className="px-2.5 py-1 bg-success/15 text-success text-[11px] font-bold rounded-full font-mono">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  ${billingCycle === 'monthly' ? proMonthly : proAnnualMonthly}
                </span>
                <span className="text-xs font-semibold text-subtle">/mo</span>
              </div>
              <p className="text-[11px] text-subtle mt-1">
                {billingCycle === 'monthly'
                  ? 'Billed monthly · Cancel anytime'
                  : `$${proAnnualTotal} billed yearly · Save 20% on annual billing`}
              </p>
            </div>

            {/* Pro Highlight Box */}
            <div className="p-3.5 rounded-2xl bg-brand/5 border border-brand/15 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Zap className="w-3.5 h-3.5" />
                <span>Zero Limits on Tailoring &amp; Preparation</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tailor as many positions as you find. Full interview defense, bar-raiser practice, and salary negotiation copilot.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                EVERYTHING IN PLUS, PLUS:
              </span>
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Unlimited tailored resumes &amp; cover letters</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Offer &amp; Salary Negotiation Copilot</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Behavioral Interview STAR Coach</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Unlimited ATS Application Answers</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>
                    <strong>Priority AI Generation Pipeline</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            {currentPlan === 'pro' ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-full bg-success/15 text-success text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Pro Plan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartCheckout('pro')}
                className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all cursor-pointer shadow-elevated flex items-center justify-center gap-2 group"
              >
                <span>Upgrade to Pro (${billingCycle === 'monthly' ? '19.99' : '15.99'}/mo)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-border pb-4">
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Detailed Plan Comparison
          </h3>
          <p className="text-xs text-subtle mt-1">
            Compare every capability across Free, Plus, and Pro tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3 pr-4 font-semibold">Capability</th>
                <th className="py-3 px-3 font-semibold w-28 sm:w-36 text-center text-subtle">Free ($0)</th>
                <th className="py-3 px-3 font-semibold w-28 sm:w-36 text-center text-muted-foreground">
                  Plus ($9.99/mo)
                </th>
                <th className="py-3 pl-3 font-bold w-28 sm:w-36 text-center text-brand">
                  Pro ($19.99/mo)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)] text-foreground">
              {/* Category 1: BUILD & APPLY */}
              <tr className="bg-surface/50 font-semibold text-[11px] text-muted-foreground">
                <td colSpan={4} className="py-2.5 px-2">
                  BUILD &amp; APPLY
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Tailored Resumes with ATS Match Score</td>
                <td className="py-3 px-3 text-center font-medium text-subtle">2 per month</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">50 per month</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Clean (Unwatermarked) PDF + DOCX Export</td>
                <td className="py-3 px-3 text-center text-subtle">PDF Vector</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">
                  ✓ PDF + DOCX + Plaintext
                </td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ PDF + DOCX + Plaintext + Themes
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Recruiter-Panel Multi-Persona Reviews</td>
                <td className="py-3 px-3 text-center text-subtle">Score + Top findings</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">
                  ✓ Full 3-Persona Committee
                </td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Full Committee + Defense Scripts
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Custom Role-Specific Cover Letters</td>
                <td className="py-3 px-3 text-center font-medium text-subtle">1 draft</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">25 per month</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">Unlimited + InMails</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Match Gap Breakdown &amp; Action Plan</td>
                <td className="py-3 px-3 text-center text-subtle">✓ Included</td>
                <td className="py-3 px-3 text-center text-foreground font-medium">✓ Included</td>
                <td className="py-3 pl-3 text-center text-brand font-bold">✓ Included</td>
              </tr>

              {/* Category 2: COPILOT & INTERVIEWS */}
              <tr className="bg-surface/50 font-semibold text-[11px] text-muted-foreground">
                <td colSpan={4} className="py-2.5 px-2">
                  COPILOT &amp; INTERVIEWS
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">100+ Global Company Focus Guidance</td>
                <td className="py-3 px-3 text-center text-subtle">8 Featured</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">
                  ✓ Full 100+ Library
                </td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Full 100+ Library + Live Intel
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">ATS Application Question Answerer (STAR Stories)</td>
                <td className="py-3 px-3 text-center text-subtle">Preview (1 question)</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">20 questions / mo</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Unlimited questions
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Behavioral Interview Practice &amp; STAR Coach</td>
                <td className="py-3 px-3 text-center text-subtle">—</td>
                <td className="py-3 px-3 text-center text-subtle">Common questions</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ AI Bar Raiser + Model Rewrites
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Offer &amp; Salary Negotiation Copilot</td>
                <td className="py-3 px-3 text-center text-subtle">—</td>
                <td className="py-3 px-3 text-center text-subtle">—</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Email, Phone Scripts &amp; Objections
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">1-Click Applicant Dossier Autofill</td>
                <td className="py-3 px-3 text-center text-subtle">Standard</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">✓ Included</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Priority Autofill Copilot
                </td>
              </tr>

              {/* Category 3: CAREER ROADMAPS & SEARCH */}
              <tr className="bg-surface/50 font-semibold text-[11px] text-muted-foreground">
                <td colSpan={4} className="py-2.5 px-2">
                  CAREER ROADMAPS &amp; SEARCH
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">17 Career Roadmaps Access</td>
                <td className="py-3 px-3 text-center font-medium text-subtle">
                  Stages 1 &amp; 2 (Foundations)
                </td>
                <td className="py-3 px-3 text-center font-medium text-foreground">
                  All Stages (Complete 17 Paths)
                </td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  All Stages + Custom Projects
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Roadmap Readiness Assessments</td>
                <td className="py-3 px-3 text-center text-subtle">—</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">
                  ✓ 1-Click Profile Diagnostic
                </td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ 1-Click Diagnostic + Gap Bridging
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">Live ATS Job Explorer (Greenhouse, Lever, Ashby, and SmartRecruiters)</td>
                <td className="py-3 px-3 text-center text-subtle">✓ Full Search</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">✓ Full Search</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">✓ Full Search + Priority Crawler</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted-foreground">AI Processing Speed</td>
                <td className="py-3 px-3 text-center text-subtle">Standard</td>
                <td className="py-3 px-3 text-center font-medium text-foreground">Priority</td>
                <td className="py-3 pl-3 text-center font-bold text-brand">
                  ✓ Dedicated Instant Pipeline
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <HelpCircle className="w-5 h-5 text-brand" />
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-subtle">
              Everything you need to know about Free, Plus, and Pro billing.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[rgba(0,0,0,0.06)]">
          {faqs.map((faq, idx) => {
            const isOpen = !!openFaq[idx];
            return (
              <div key={idx} className="py-4 first:pt-2 last:pb-2">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="font-display font-semibold text-sm sm:text-base text-foreground group-hover:text-brand transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-subtle shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-[13px] text-muted-foreground leading-relaxed pr-8 animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border space-y-5 relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 text-subtle hover:text-foreground text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Welcome to Job Studio {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Plus'}!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your increased tailoring quota and advanced copilot features are now active.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setCheckoutSuccess(false);
                      if (onNavigateToTab) {
                        onNavigateToTab('evaluator');
                      }
                    }}
                    className="w-full py-3 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer transition-colors shadow-md"
                  >
                    Go to Job Evaluator
                  </button>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Activating {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Plus'} Subscription...
                </h3>
                <p className="text-xs text-subtle">
                  Securing your copilot pipeline and upgrading workspace quotas...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="apple-badge-blue text-[10px] uppercase font-mono font-bold">
                    UPGRADE TO {selectedCheckoutPlan === 'pro' ? 'PRO' : 'PLUS'}
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Confirm {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Plus'} Subscription
                  </h3>
                  <p className="text-xs text-subtle">
                    {selectedCheckoutPlan === 'pro'
                      ? 'Instant access to unlimited tailored resumes, interview coaching, and salary negotiation.'
                      : 'Instant access to 50 tailored resumes, 3-persona recruiter reviews, and clean DOCX exports.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>
                      Job Studio {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Plus'} (
                      {billingCycle === 'monthly' ? 'Monthly' : 'Annual'})
                    </span>
                    <span>
                      $
                      {selectedCheckoutPlan === 'pro'
                        ? billingCycle === 'monthly'
                          ? proMonthly
                          : proAnnualTotal
                        : billingCycle === 'monthly'
                        ? plusMonthly
                        : plusAnnualTotal}
                    </span>
                  </div>
                  <div className="text-[11px] text-subtle flex items-center justify-between">
                    <span>Billing cycle:</span>
                    <span>
                      {selectedCheckoutPlan === 'pro'
                        ? billingCycle === 'monthly'
                          ? `$${proMonthly}/month`
                          : `$${proAnnualMonthly}/month (Billed annually)`
                        : billingCycle === 'monthly'
                        ? `$${plusMonthly}/month`
                        : `$${plusAnnualMonthly}/month (Billed annually)`}
                    </span>
                  </div>
                  <div className="text-[11px] text-success font-medium flex items-center gap-1 pt-1 border-t border-border">
                    <Check className="w-3 h-3" />
                    <span>
                      {selectedCheckoutPlan === 'pro'
                        ? 'Includes unlimited tailored resumes & salary negotiation copilot'
                        : 'Includes 50 tailored resumes/month & full 3-persona panel reviews'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-subtle">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success shrink-0" />
                    <span>Cancel anytime with 1 click · No hidden charges</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-surface text-foreground hover:bg-surface-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmUpgrade}
                    className="flex-1 py-2.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer transition-colors shadow-md"
                  >
                    Activate {selectedCheckoutPlan === 'pro' ? 'Pro' : 'Plus'} Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
