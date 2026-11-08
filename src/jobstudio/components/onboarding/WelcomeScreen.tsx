import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Compass,
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  Zap,
  Flame,
  Radio,
  ClipboardCheck,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WelcomeScreenProps {
  userName: string;
  onStartTour: () => void;
  onSkip: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface JourneyPhase {
  id: string;
  tabKey: string;
  stepNumber: number;
  title: string;
  shortLabel: string;
  tagline: string;
  icon: React.ElementType;
  userAction: string;
  automation: string;
  keyFeatures: string[];
}

const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: 'profile',
    tabKey: 'profile',
    stepNumber: 1,
    title: 'Build your master profile',
    shortLabel: 'Profile Vault',
    tagline: 'Master Career Baseline · Fact-Enforced',
    icon: User,
    userAction: 'Upload your existing resume PDF or sync LinkedIn once. Review parsed experience blocks.',
    automation: 'Extracts 50+ normalized skills, structures chronology, and establishes the zero-hallucination baseline.',
    keyFeatures: [
      'Fast-Track AI PDF & DOCX Parser',
      'Fact-Enforced Anti-Fabrication Engine',
      'Verified Competency & Certification Vault',
    ],
  },
  {
    id: 'evaluator',
    tabKey: 'evaluator',
    stepNumber: 2,
    title: 'Evaluate target jobs',
    shortLabel: 'Live ATS Radar & Match Intelligence',
    tagline: 'Live Multi-Board Discovery & Transferable Skills',
    icon: Compass,
    userAction: 'Enter your target title or paste any job URL to evaluate 100-point ATS fit and bridge gaps.',
    automation: 'Crawls official boards, maps transferable skill adjacencies (PDMS ↔ SP3D at 94%), and exposes fake reposts.',
    keyFeatures: [
      'Multi-ATS Fanout (Greenhouse, Lever, Ashby, Eightfold)',
      'Transferable Skill Adjacencies with 1-Click Bridging Scripts',
      'True Age Sentinel & Optimal Delivery Window (2.4x Callbacks)',
    ],
  },
  {
    id: 'resume',
    tabKey: 'resume',
    stepNumber: 3,
    title: 'Tailor documents',
    shortLabel: 'Application Studio',
    tagline: 'Precision 1-Page ATS Resumes & 6-Second Roast',
    icon: FileText,
    userAction: 'Click "Tailor Application" to generate a requisition-specific resume, cover letter, and referral pitch.',
    automation: 'Restructures bullets into metric-driven STAR impact statements with zero-overflow 1-page vector layout.',
    keyFeatures: [
      'Single-Column Vector ATS PDF & Clean DOCX Export',
      'Recruiter 6-Second Roast Mode (Signal-to-Fluff Ratio)',
      'Recruiter Radar Stealth Links with Live Click Telemetry',
    ],
  },
  {
    id: 'screening',
    tabKey: 'screening',
    stepNumber: 4,
    title: 'Interview prep & tracking',
    shortLabel: 'Post-Apply Copilot',
    tagline: '1-Click ATS Dossier & Kanban Pipeline',
    icon: Briefcase,
    userAction: 'Copy pre-filled ATS screening answers for workday/greenhouse forms and track application status.',
    automation: 'Generates company-specific STAR behavioral stories, salary negotiation scripts, and keeps your timeline organized.',
    keyFeatures: [
      '1-Click ATS Dossier Autofill (Notice, CTC, Work Auth)',
      'Company Focus Packs & Behavioral STAR Coach',
      'Integrated Post-Apply Kanban Application Tracker',
    ],
  },
];

export function WelcomeScreen({ userName, onStartTour, onSkip, onNavigateToTab }: WelcomeScreenProps) {
  const first = (userName || '').split(' ')[0];
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const activePhase = JOURNEY_PHASES[activePhaseIndex];

  const handleLaunchTab = (tabKey: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabKey);
    } else {
      onSkip();
    }
  };

  return (
    <section className="onboarding-welcome max-w-6xl mx-auto my-6 p-6 sm:p-8 md:p-10 bg-card rounded-3xl border border-border shadow-2xl space-y-8" aria-labelledby="onboarding-title">
      {/* 1. Header Banner & Eyebrow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/80">
        <div className="space-y-2 max-w-2xl">
          <p className="onboarding-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Job Studio</span>
          </p>
          <h1 id="onboarding-title" className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
            {first ? `Hi ${first}, let's get you set up.` : "Let's get you set up."}
          </h1>
          <p className="onboarding-lead text-sm sm:text-base text-muted-foreground leading-relaxed">
            Job Studio saves you time on searching, tailoring and preparing. Here's how it works: establish your verified profile baseline once, and our intelligence crawls official ATS company boards, scores keyword compatibility, and tailors high-converting application materials in seconds.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="onboarding-actions flex flex-wrap items-center gap-3 shrink-0">
          <Button
            onClick={onStartTour}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 shadow-elevated flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Take the 2-minute tour</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border border-border/80 text-foreground text-xs sm:text-sm font-medium hover:bg-surface cursor-pointer transition-colors"
          >
            Skip, start with my profile
          </Button>
        </div>
      </div>

      {/* 2. Canonical 4 Pillars Path (Required for Navigation & Semantic Flow) */}
      <ol className="onboarding-path grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-0 border-t border-b border-border py-4">
        {JOURNEY_PHASES.map((step, i) => (
          <li
            key={step.id}
            onClick={() => setActivePhaseIndex(i)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
              activePhaseIndex === i
                ? 'bg-surface border-brand/40 shadow-xs ring-1 ring-brand/20'
                : 'bg-card border-border/60 hover:bg-surface/50 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="onboarding-step-index text-[11px] font-mono font-bold text-brand">0{i + 1}</span>
              <step.icon className={`w-4 h-4 ${activePhaseIndex === i ? 'text-brand' : 'text-subtle'}`} aria-hidden />
            </div>
            <strong className="text-xs font-semibold text-foreground">{step.title}</strong>
            <span className="text-[11px] text-muted-foreground line-clamp-2">{step.userAction}</span>
          </li>
        ))}
      </ol>

      {/* 3. Deep Visual Interactive Graphic Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Graphic Simulation Window (7 cols) */}
        <div className="lg:col-span-7 bg-surface/60 border border-border/80 rounded-2xl p-4 sm:p-6 flex flex-col justify-between space-y-4 shadow-inner relative overflow-hidden">
          {/* Top Bar of Graphic Window */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
              <span className="font-mono text-[11px] text-subtle ml-2">jobstudio.app/{activePhase.tabKey}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-2 border border-border text-[10px] font-mono text-brand font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span>LIVE DEMONSTRATION</span>
            </div>
          </div>

          {/* DYNAMIC VISUAL GRAPHIC ACCORDING TO ACTIVE PHASE */}
          <div className="min-h-[290px] flex flex-col justify-center py-2">
            {activePhaseIndex === 0 && (
              /* Graphic 1: Master Profile Vault */
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-foreground">
                          {userName || 'Candidate Master Profile'}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success/15 text-success border border-success/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Profile-Backed Baseline</span>
                        </span>
                      </div>
                      <p className="text-xs text-subtle">Primary Experience Baseline · 4 Verified Roles · 18 Skills</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-surface text-[11px] font-mono text-brand font-bold border border-border">
                      100% Fact Enforced
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="p-2.5 rounded-lg bg-surface/80 border border-border/40 text-xs flex items-center justify-between">
                      <span className="font-medium text-foreground">Lead Systems &amp; Piping Designer · Energy Global</span>
                      <span className="text-[11px] font-mono text-subtle">2021 – Present</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/80 border border-border/40 text-xs flex items-center justify-between">
                      <span className="font-medium text-foreground">Senior Design Engineer · Fluor Technical</span>
                      <span className="text-[11px] font-mono text-subtle">2018 – 2021</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['SP3D', 'Aveva PDMS', 'CAESAR II', 'Stress Analysis', 'ISO Generation', 'EPC Deliverables'].map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand/10 text-brand border border-brand/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 flex items-center justify-between text-xs text-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand shrink-0" />
                    <span>Upload existing PDF or paste text — Job Studio extracts everything once.</span>
                  </div>
                  <span className="font-mono text-[11px] text-brand font-bold">Fast-Track AI</span>
                </div>
              </div>
            )}

            {activePhaseIndex === 1 && (
              /* Graphic 2: Live Multi-ATS Discovery & Match Fit */
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border text-xs text-foreground">
                    <Search className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span className="font-medium">Piping Designer</span>
                    <span className="ml-auto text-[10px] font-mono text-brand bg-brand/15 px-2 py-0.5 rounded">
                      Live Multi-ATS Crawl
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-subtle">Multi-Query Fanout:</span>
                    <span className="text-brand font-mono font-semibold">Greenhouse · Ashby · Lever · Eightfold</span>
                  </div>
                </div>

                {/* Match Fit & Adjacency Card */}
                <div className="p-3.5 rounded-xl bg-card border border-primary/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Arcadis · Senior Piping Designer</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success/15 text-success">
                        94% Fit
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">⚡ FRESH REQ</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-brand flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Transferable Skill Adjacency
                      </span>
                      <span className="text-success font-semibold">2.4x Optimal Window: Tue 9:30 AM</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic border-l-2 border-brand/60 pl-2">
                      "PDMS experience transfers directly to SP3D with 94% architectural equivalence."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePhaseIndex === 2 && (
              /* Graphic 3: Tailored Documents & 6-Second Roast */
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold text-foreground">1-Page ATS Vector Resume</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">
                      ✓ Clean 1-Page Margin Fit
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-foreground font-mono">
                    <p className="font-bold text-xs text-foreground">LEAD PIPING DESIGNER | Energy Engineering Ltd</p>
                    <p className="text-muted-foreground">
                      • Engineered 140+ 3D piping isometric spools in SP3D for $28M refinery expansion, achieving zero fabrication clashes.
                    </p>
                    <p className="text-muted-foreground">
                      • Coordinated Caesar II pipe stress analyses across 18 high-pressure lines, reducing design cycle time by 22%.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-amber-500/30 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">6-Sec Roast (88/100)</div>
                      <div className="text-[10px] text-subtle">Zero buzzwords · Strong metrics</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-emerald-500/30 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Recruiter Radar Active</div>
                      <div className="text-[10px] text-subtle">Stealth click tracking enabled</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePhaseIndex === 3 && (
              /* Graphic 4: Interview Prep & Pipeline Kanban */
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-brand" />
                      1-Click ATS Application Dossier
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-mono font-bold">
                      Ready to Paste
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-surface border border-border/60">
                      <span className="text-[10px] text-subtle block">Notice Period</span>
                      <strong className="text-foreground">30 Days</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border/60">
                      <span className="text-[10px] text-subtle block">Work Auth</span>
                      <strong className="text-foreground">Authorized</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-surface border border-border/60">
                      <span className="text-[10px] text-subtle block">Salary Target</span>
                      <strong className="text-foreground">Target Role Met</strong>
                    </div>
                  </div>
                </div>

                {/* Pipeline Kanban Miniature */}
                <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                  <span className="text-[10px] font-mono uppercase text-subtle block">Application Pipeline Kanban</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-surface border border-border">
                      <div className="text-subtle">Tailored</div>
                      <div className="font-bold text-foreground text-xs mt-0.5">3</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-border">
                      <div className="text-subtle">Applied</div>
                      <div className="font-bold text-brand text-xs mt-0.5">2</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-border">
                      <div className="text-subtle">Screening</div>
                      <div className="font-bold text-warning text-xs mt-0.5">1</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-border">
                      <div className="text-subtle">Interview</div>
                      <div className="font-bold text-success text-xs mt-0.5">1</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Direct launch into this exact feature */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-subtle">Phase {activePhase.stepNumber} of 4 in candidate flight path</span>
            <button
              type="button"
              onClick={() => handleLaunchTab(activePhase.tabKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-brand text-xs font-semibold border border-primary/25 cursor-pointer transition-all"
            >
              <span>Open {activePhase.shortLabel} now</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Side: Actionable Flight Instructions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 p-5 sm:p-6 bg-surface/30 rounded-2xl border border-border">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold block">
                PHASE 0{activePhase.stepNumber} · {activePhase.shortLabel}
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mt-0.5">
                {activePhase.tagline}
              </h3>
            </div>

            {/* Action Box: What You Do vs What System Does */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-subtle font-bold block flex items-center gap-1">
                  <User className="w-3 h-3 text-brand" />
                  Your Action:
                </span>
                <p className="text-foreground leading-relaxed">
                  {activePhase.userAction}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand" />
                  What Job Studio Does Automatically:
                </span>
                <p className="text-foreground leading-relaxed">
                  {activePhase.automation}
                </p>
              </div>
            </div>

            {/* Key Features List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-subtle font-bold block">
                INCLUDED CAPABILITIES:
              </span>
              <ul className="space-y-1.5 text-xs text-foreground">
                {activePhase.keyFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={activePhaseIndex === 0}
              onClick={() => setActivePhaseIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-subtle hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              Previous Phase
            </button>

            {activePhaseIndex < JOURNEY_PHASES.length - 1 ? (
              <button
                type="button"
                onClick={() => setActivePhaseIndex((prev) => Math.min(JOURNEY_PHASES.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface text-foreground text-xs font-semibold border border-border cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>Next Phase</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleLaunchTab('profile')}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer flex items-center gap-1.5 shadow-elevated transition-all"
              >
                <span>Get Started in Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleLaunchTab('profile')}
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 shadow-elevated flex items-center gap-2 cursor-pointer"
          >
            <span>🚀 Start Step 1: Build My Master Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={onStartTour}
            className="px-4 py-2.5 rounded-full border border-border text-foreground text-xs sm:text-sm font-medium hover:bg-surface cursor-pointer"
          >
            Guided walkthrough
          </Button>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchTab('evaluator')}
          className="text-xs text-subtle hover:text-brand transition-colors cursor-pointer text-left sm:text-right"
        >
          Already have your profile ready? <span className="underline font-semibold">Jump straight to Job Evaluator →</span>
        </button>
      </div>
    </section>
  );
}
