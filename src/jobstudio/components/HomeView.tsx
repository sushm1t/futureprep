// @ts-nocheck -- ported verbatim from the original project
import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface HomeViewProps {
  onNavigateToTab: (tab: string) => void;
  userPlan?: 'free' | 'plus' | 'pro';
  isProUser: boolean;
  onUpgradeToPlan?: (plan: 'plus' | 'pro') => void;
  onUpgradeToPro: () => void;
  tailoredCount: number;
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToTab,
  userPlan,
  isProUser,
  onUpgradeToPlan,
  onUpgradeToPro,
  tailoredCount,
  isLoggedIn,
  userEmail,
  userName,
  onLogin,
  onLogout,
}) => {
  const currentPlan = userPlan || (isProUser ? 'pro' : 'free');
  // Billing toggle for embedded pricing section
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-16 animate-fade-in text-foreground pb-24 max-w-6xl mx-auto">
      {/* =========================================================================
          EMBEDDED 3-TIER PRICING (Free $0 / Plus $4.99 / Pro $9.99)
         ========================================================================= */}
      <section id="landing-pricing" className="space-y-8 pt-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wider uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CLEAR &amp; TRANSPARENT PRICING
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Choose how much of the search your agent runs.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Free is a functional career workspace, not an artificial countdown. Pro adds unlimited tailoring workflows, clean exports, and deep interview prep. Cancel anytime.
          </p>

          {/* Billing Toggle */}
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

        {/* 3-Tier Pricing Cards: Free vs Plus vs Pro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 max-w-6xl mx-auto items-stretch">
          {/* 1. FREE PLAN */}
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
                  Explore the live job market &amp; test-drive AI tailoring.
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

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block font-mono">
                  INCLUDED ON FREE:
                </span>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span><strong>2 tailored resumes per month</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span><strong>1 custom cover letter draft</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>Search live jobs across Greenhouse, Lever, Ashby, and SmartRecruiters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>Foundational Career Roadmaps (Stages 1 &amp; 2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>ATS-compliant Vector PDF exports</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => onNavigateToTab('evaluator')}
                className="w-full py-3 px-4 rounded-full font-semibold text-xs transition-all border border-border text-foreground hover:bg-surface cursor-pointer"
              >
                Start Free Workspace
              </button>
            </div>
          </div>

          {/* 2. PLUS PLAN ($4.99/mo) */}
          <div
            className={`bg-card rounded-3xl border-2 p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
              currentPlan === 'plus'
                ? 'border-success shadow-elevated'
                : 'border-brand/70 shadow-elevated'
            }`}
          >
            <div className="absolute -top-3.5 left-6">
              <span className="px-3.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
                MOST POPULAR
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Plus</h3>
                  <p className="text-xs text-subtle mt-1">
                    The active job search copilot for steady application momentum.
                  </p>
                </div>
                {currentPlan === 'plus' && (
                  <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded-full font-mono">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                    ${billingCycle === 'monthly' ? '4.99' : '3.99'}
                  </span>
                  <span className="text-xs font-semibold text-subtle">/ month</span>
                </div>
                <p className="text-[11px] text-subtle mt-1">
                  {billingCycle === 'monthly' ? 'Billed monthly · Cancel anytime' : 'Billed annually ($47.88/yr) · Save 20% on annual billing'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider block font-mono">
                  EVERYTHING IN FREE, PLUS:
                </span>
                <ul className="space-y-2 text-xs text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>50 tailored resumes &amp; 25 cover letters/mo</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Full 3-Persona Recruiter Review</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>100+ Curated Company Focus Packs</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>PDF, DOCX &amp; Plaintext Exports</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>20 ATS Screening Answers/mo</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              {currentPlan === 'plus' ? (
                <div className="w-full py-3 px-4 rounded-full font-semibold text-xs bg-success/15 text-success text-center border border-success/30">
                  ✓ Active Plus Plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpgradeToPlan ? onUpgradeToPlan('plus') : onUpgradeToPro()}
                  className="w-full py-3 px-4 rounded-full font-semibold text-xs transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Upgrade to Plus (${billingCycle === 'monthly' ? '4.99' : '3.99'}/mo)</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. PRO PLAN ($9.99/mo) */}
          <div
            className={`bg-card rounded-3xl border-2 p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
              currentPlan === 'pro'
                ? 'border-success shadow-elevated'
                : 'border-primary shadow-elevated'
            }`}
          >
            <div className="absolute -top-3.5 left-6">
              <span className="px-3.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                BEST VALUE
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-1.5">
                    <span>Pro</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-mono">
                      UNLIMITED
                    </span>
                  </h3>
                  <p className="text-xs text-subtle mt-1">
                    Everything you need to run high-intensity, high-converting job searches.
                  </p>
                </div>
                {currentPlan === 'pro' && (
                  <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded-full font-mono">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                    ${billingCycle === 'monthly' ? '9.99' : '7.99'}
                  </span>
                  <span className="text-xs font-semibold text-subtle">/ month</span>
                </div>
                <p className="text-[11px] text-subtle mt-1">
                  {billingCycle === 'monthly' ? 'Billed monthly · Cancel anytime' : 'Billed annually ($95.88/yr) · Save 20% on annual billing'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider block font-mono">
                  EVERYTHING IN PLUS, PLUS:
                </span>
                <ul className="space-y-2 text-xs text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Unlimited tailored resumes &amp; cover letters</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Offer &amp; Salary Negotiation Copilot</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Behavioral Interview STAR Coach</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Unlimited ATS Application Answers</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span><strong>Priority AI Generation Pipeline</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              {currentPlan === 'pro' ? (
                <div className="w-full py-3 px-4 rounded-full font-semibold text-xs bg-success/15 text-success text-center border border-success/30">
                  ✓ Active Pro Plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpgradeToPlan ? onUpgradeToPlan('pro') : onUpgradeToPro()}
                  className="w-full py-3 px-4 rounded-full font-semibold text-xs transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro (${billingCycle === 'monthly' ? '9.99' : '7.99'}/mo)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SINGLE HIGH-CONVERTING CONVERSION BANNER ("Start Tailoring Free")
         ========================================================================= */}
      <section className="bg-gradient-to-br from-card via-surface to-brand/5 rounded-3xl border border-brand/20 p-8 sm:p-12 shadow-elevated text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wider uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            AUTHENTIC PROFILE GROUNDING
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Ready to find your next role?<br />
            <span className="text-brand">Start tailoring in minutes.</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Evaluate your fit against real Greenhouse, Lever, Ashby, and SmartRecruiters corporate listings, and export interview-ready, ATS-aligned applications in under 2 minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={() => onNavigateToTab('auth')}
            className="px-7 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-full shadow-elevated transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Start Tailoring Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab('roadmaps')}
            className="px-6 py-3.5 bg-surface hover:bg-surface-2 text-foreground font-semibold text-xs sm:text-sm rounded-full border border-border shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-subtle" />
            <span>Browse 2026 Roadmaps</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground border-t border-border/60 max-w-xl mx-auto relative z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            2 free tailored applications / mo
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            Cancel anytime
          </span>
        </div>
      </section>
    </div>
  );
};
