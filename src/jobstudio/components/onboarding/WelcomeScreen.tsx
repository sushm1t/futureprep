import React from 'react';
import {
  ArrowRight,
  Briefcase,
  Compass,
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  UploadCloud,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WelcomeScreenProps {
  userName: string;
  userEmail?: string;
  onLogout?: () => void;
  onStartTour: () => void;
  onSkip: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface StepInfo {
  step: string;
  tab: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  whatYouDo: string;
  whatJobStudioDoes: string;
  color: string;
}

const STEPS: StepInfo[] = [
  {
    step: '01',
    tab: 'profile',
    title: 'Build your master profile',
    badge: 'Step 1 • 1 min',
    icon: UploadCloud,
    whatYouDo: 'Upload your existing resume PDF once.',
    whatJobStudioDoes: 'Automatically extracts your work history, education, and skills into your secure master profile.',
    color: 'text-brand bg-brand/10 border-brand/20',
  },
  {
    step: '02',
    tab: 'evaluator',
    title: 'Evaluate target jobs',
    badge: 'Step 2 • Instant',
    icon: Search,
    whatYouDo: 'Search live jobs or paste any job link.',
    whatJobStudioDoes: 'Scores your resume against the job description (0–100) and highlights missing keywords.',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    step: '03',
    tab: 'resume',
    title: 'Tailor documents',
    badge: 'Step 3 • 1-Click',
    icon: Sparkles,
    whatYouDo: 'Click "Tailor Application" for any job.',
    whatJobStudioDoes: 'Rewrites your resume and creates a matching cover letter designed to pass company ATS filters.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    step: '04',
    tab: 'screening',
    title: 'Interview prep & tracking',
    badge: 'Step 4 • Auto-Prep',
    icon: Briefcase,
    whatYouDo: 'Copy pre-filled answers and track your status.',
    whatJobStudioDoes: 'Generates custom interview answers for tricky questions and keeps all your applications organized.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  userEmail,
  onLogout,
  onStartTour,
  onSkip,
  onNavigateToTab,
}) => {
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const handleGo = (tab: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    } else {
      onSkip();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-6 sm:space-y-8 animate-fade-in text-foreground">
      {/* Top Brand Bar with Sign Out escape hatch */}
      <header className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm shadow-xs">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            Job Studio
          </span>
        </div>

        {userEmail && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground hidden sm:inline max-w-[200px] truncate font-mono text-[11px]">
              {userEmail}
            </span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-subtle hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </header>

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WELCOME TO JOB STUDIO</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-display">
          Hi {firstName}, let&apos;s get you set up.
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Job Studio helps you find jobs, see your match score, and automatically tailor your resume to pass company filters in seconds. Here is how it works:
        </p>

        {/* Quick Tour Option Header */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartTour}
            className="rounded-full text-xs font-semibold gap-1.5 border-border hover:bg-surface cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-brand" />
            <span>Take the 2-minute tour &rarr;</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="rounded-full text-xs text-subtle hover:text-foreground cursor-pointer"
          >
            Skip, start with my profile
          </Button>
        </div>
      </div>

      {/* 4 Clean Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              onClick={() => handleGo(s.tab)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleGo(s.tab);
              }}
              className="bg-card hover:bg-surface border border-border/80 hover:border-brand/40 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-elevated text-left cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-surface border border-border text-subtle">
                    {s.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                    <span>{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand" />
                  </h3>
                  <p className="text-xs text-foreground/90 font-medium mt-1 leading-snug">
                    {s.whatYouDo}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                  {s.whatJobStudioDoes}
                </p>
              </div>

              <div className="pt-2 flex items-center text-[11px] font-semibold text-brand">
                <span>Open {s.title.toLowerCase()} &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Call to Action Box */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 text-center space-y-4 shadow-elevated">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Ready to land more interviews?
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Everything starts with your master profile. Upload your resume once, and you can tailor it to hundreds of jobs with a single click.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => handleGo('profile')}
            className="w-full sm:w-auto rounded-full font-semibold gap-2 shadow-elevated text-xs sm:text-sm px-5 sm:px-7 py-3 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer whitespace-normal sm:whitespace-nowrap text-center"
          >
            <span>🚀 Start Step 1: Build My Master Profile</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onStartTour}
            className="w-full sm:w-auto rounded-full font-medium text-xs sm:text-sm px-5 py-3 border-border hover:bg-surface text-foreground cursor-pointer"
          >
            <span>Take interactive tour</span>
          </Button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleGo('evaluator')}
            className="text-xs text-subtle hover:text-foreground transition-colors cursor-pointer underline underline-offset-4"
          >
            Already have your profile ready? Jump straight to Job Evaluator &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
