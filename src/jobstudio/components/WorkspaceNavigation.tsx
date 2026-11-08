import React, { useState } from 'react';
import { PlayCircle, ArrowLeft, Briefcase, Bug, ChevronRight, Compass, FileText, HelpCircle, Layers, LogOut, Menu, Milestone, Sparkles, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const sections = [
  {
    label: 'Candidate Base',
    items: [
      { id: 'profile', label: 'Master Profile', icon: User },
    ],
  },
  {
    label: 'Core Workflow',
    items: [
      { id: 'evaluator', label: 'Job Evaluator', icon: Compass },
      { id: 'resume', label: 'Tailored Documents', icon: FileText },
      { id: 'screening', label: 'Interview Prep', icon: HelpCircle },
      { id: 'applied', label: 'Applied Jobs', icon: Briefcase },
    ],
  },
  {
    label: 'Career Growth',
    items: [
      { id: 'roadmaps', label: 'Career Roadmaps', icon: Milestone },
    ],
  },
];

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appliedCount: number;
  userName: string;
  userPlan?: 'free' | 'plus' | 'pro';
  isProUser: boolean;
  tailoredCount: number;
  onLogout: () => void;
  onStartTour?: () => void;
  activeRole?: string;
  onReportBug?: () => void;
}

export function WorkspaceNavigation(props: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const plan = props.userPlan || (props.isProUser ? 'pro' : 'free');
  const current = sections.flatMap(section => section.items).find(item =>
    item.id === props.activeTab || (item.id === 'resume' && (props.activeTab === 'cover-letter' || props.activeTab === 'referral'))
  );
  const currentLabel = props.activeTab === 'cover-letter'
    ? 'Tailored Documents / Cover Letter'
    : props.activeTab === 'referral'
    ? 'Tailored Documents / Referral Message'
    : current?.label || (props.activeTab === 'pricing' ? 'Pricing' : 'Workspace');

  return <>
    {/* Desktop Sidebar (hidden on mobile) */}
    <aside className="workspace-sidebar no-print">
      <Button
        variant="ghost"
        className="workspace-brand"
        onClick={() => {
          props.setActiveTab('home');
          window.scrollTo(0, 0);
        }}
        title="Job Studio - Home"
      >
        <span className="workspace-logo"><Layers /></span><span>Job Studio</span>
      </Button>
      <div className="workspace-account">
        <span className="workspace-avatar">{props.userName.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
        <div><strong>{props.userName.split(' ')[0]}'s workspace</strong><span>Personal workspace</span></div>
      </div>
      {props.activeRole && props.activeTab !== 'evaluator' && (
        <div className="px-3 pb-3">
          <div className="workspace-active-badge" title={props.activeRole}>
            <span className="workspace-active-dot" />
            <span className="truncate">{props.activeRole}</span>
          </div>
        </div>
      )}
      <nav aria-label="Workspace navigation">
        {sections.map(section => <div className="workspace-nav-group" key={section.label}>
          <p>{section.label}</p>
          {section.items.map(item => {
            const isActive = props.activeTab === item.id || (item.id === 'resume' && (props.activeTab === 'cover-letter' || props.activeTab === 'referral'));
            return (
              <Button
                key={item.id}
                data-tour={`nav-${item.id}`}
                variant="ghost"
                aria-label={item.label}
                className={`workspace-nav-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => props.setActiveTab(item.id)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.id === 'applied' && props.appliedCount > 0 && <span className="workspace-count">{props.appliedCount}</span>}
              </Button>
            );
          })}
        </div>)}
      </nav>
      <div className="workspace-sidebar-bottom">
        {/* Sleek Plan & Entitlement Card (Linear/Apple/Stripe Style) */}
        <div className="workspace-plan-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`workspace-plan-badge ${plan === 'pro' ? 'is-pro' : plan === 'plus' ? 'is-plus' : 'is-free'}`}>
              {plan === 'pro' && <Sparkles className="w-3 h-3" />}
              {plan === 'pro' ? 'Pro Plan' : plan === 'plus' ? 'Plus Plan' : 'Free Plan'}
            </span>
            <button
              type="button"
              onClick={() => props.setActiveTab('pricing')}
              className="workspace-plan-manage-btn"
              title="Manage subscription and quotas"
              aria-label={plan !== 'free' ? 'Manage plan' : 'View plans'}
            >
              <span>{plan !== 'free' ? 'Manage' : 'Upgrade'}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/70" />
            </button>
          </div>
          <p className="workspace-plan-desc">
            {plan === 'pro'
              ? 'Unlimited AI tailoring active'
              : plan === 'plus'
              ? `${Math.max(0, 50 - props.tailoredCount)} of 50 resumes left`
              : `${Math.max(0, 2 - props.tailoredCount)} of 2 resumes left`}
          </p>
          {plan !== 'pro' && (
            <div className="workspace-quota-track">
              <div
                className="workspace-quota-fill"
                style={{
                  width: `${Math.min(100, Math.max(5, (props.tailoredCount / (plan === 'plus' ? 50 : 2)) * 100))}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Quiet Minimalist Utilities (Onboarding Flight Map, Tour, Bug/Feedback, Website, Logout) */}
        <div className="workspace-sidebar-actions">
          <Button
            variant="ghost"
            size="sm"
            className="workspace-action-row-btn"
            onClick={() => {
              props.setActiveTab('onboarding');
              window.scrollTo(0, 0);
            }}
            title="View complete onboarding journey and flight map"
          >
            <Compass className="w-3.5 h-3.5 text-brand" />
            <span>Onboarding Guide</span>
          </Button>

          {props.onStartTour && (
            <Button
              variant="ghost"
              size="sm"
              className="workspace-action-row-btn"
              onClick={props.onStartTour}
              title="Take interactive tour"
            >
              <PlayCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Take the tour</span>
            </Button>
          )}

          {props.onReportBug && (
            <Button
              variant="ghost"
              size="sm"
              className="workspace-action-row-btn group"
              onClick={props.onReportBug}
              title="Send feedback or report an issue"
              aria-label="Report a bug"
            >
              <Bug className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Report a bug</span>
            </Button>
          )}

          <div className="workspace-sidebar-footer-row">
            <Button
              variant="ghost"
              size="sm"
              className="workspace-website-btn"
              onClick={() => {
                props.setActiveTab('home');
                window.scrollTo(0, 0);
              }}
              title="Open the public landing page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View website</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="workspace-logout-btn"
              title="Sign out"
              aria-label="Sign out"
              onClick={props.onLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>

    {/* Topbar */}
    <header className="workspace-topbar no-print">
      <div className="flex items-center gap-3 min-w-0">
        <div className="workspace-breadcrumb flex items-center gap-1.5 text-xs text-subtle truncate">
          <span>Workspace</span>
          <span className="text-subtle">/</span>
          <span className={props.activeRole ? 'text-subtle' : 'font-semibold text-foreground'}>{currentLabel}</span>
          {props.activeRole && (
            <>
              <span className="text-subtle">/</span>
              <strong className="text-foreground font-semibold truncate max-w-[220px]" title={props.activeRole}>
                {props.activeRole.includes('@')
                  ? props.activeRole.split('@')[1]?.trim()
                  : props.activeRole.replace(/^Active:\s*/i, '').trim()}
              </strong>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="workspace-plan-label">{plan === 'pro' ? 'Pro workspace' : plan === 'plus' ? 'Plus workspace' : 'Free workspace'}</span>
        <Button variant="outline" size="sm" className="workspace-mobile-signout" aria-label="Sign out" title="Sign out" onClick={props.onLogout}><LogOut /><span>Sign out</span></Button>
      </div>
    </header>

    {/* Mobile Bottom Navigation Bar (md:hidden) */}
    <nav
      aria-label="Mobile workspace navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border px-2 py-1.5 flex items-center justify-around shadow-2xl"
    >
      {/* 1. Profile */}
      <button
        type="button"
        aria-label="Profile"
        onClick={() => {
          props.setActiveTab('profile');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          props.activeTab === 'profile'
            ? 'text-brand font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] leading-none">Profile</span>
      </button>

      {/* 2. Jobs */}
      <button
        type="button"
        aria-label="Jobs"
        onClick={() => {
          props.setActiveTab('evaluator');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          props.activeTab === 'evaluator'
            ? 'text-brand font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] leading-none">Jobs</span>
      </button>

      {/* 3. Docs */}
      <button
        type="button"
        aria-label="Docs"
        onClick={() => {
          props.setActiveTab('resume');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          props.activeTab === 'resume' || props.activeTab === 'cover-letter' || props.activeTab === 'referral'
            ? 'text-brand font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px] leading-none">Docs</span>
      </button>

      {/* 4. Tracker */}
      <button
        type="button"
        aria-label="Tracker"
        onClick={() => {
          props.setActiveTab('applied');
          setIsMobileMenuOpen(false);
        }}
        className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          props.activeTab === 'applied'
            ? 'text-brand font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className="relative">
          <Briefcase className="w-5 h-5" />
          {props.appliedCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-brand text-background text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[14px] text-center leading-tight">
              {props.appliedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-none">Tracker</span>
      </button>

      {/* 5. Menu */}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
          isMobileMenuOpen || ['roadmaps', 'screening', 'pricing'].includes(props.activeTab)
            ? 'text-brand font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] leading-none">Menu</span>
      </button>
    </nav>

    {/* Mobile More Drawer Sheet */}
    {isMobileMenuOpen && (
      <>
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-Up Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More navigation options"
          className="fixed bottom-[56px] left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl p-5 md:hidden space-y-4 max-h-[78vh] overflow-y-auto"
        >
          {/* Drag handle */}
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto" />

          {/* User profile & workspace status header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="workspace-avatar">{props.userName.split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
              <div>
                <strong className="text-sm font-semibold text-foreground block">{props.userName.split(' ')[0]}'s workspace</strong>
                <span className="text-xs text-subtle">{plan === 'pro' ? 'Pro plan · Unlimited tailoring' : plan === 'plus' ? 'Plus plan' : 'Free plan'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-full text-subtle hover:text-foreground hover:bg-surface cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary Features Navigation */}
          <div className="space-y-1">
            {/* Career Roadmaps */}
            <button
              type="button"
              onClick={() => {
                props.setActiveTab('roadmaps');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium transition-all cursor-pointer ${
                props.activeTab === 'roadmaps' ? 'bg-primary/10 text-brand font-semibold' : 'text-foreground hover:bg-surface'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                <Milestone className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold">Career Roadmaps</span>
                <span className="text-xs text-subtle">Target skills & career progression</span>
              </div>
            </button>

            {/* Interview Prep */}
            <button
              type="button"
              onClick={() => {
                props.setActiveTab('screening');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium transition-all cursor-pointer ${
                props.activeTab === 'screening' ? 'bg-primary/10 text-brand font-semibold' : 'text-foreground hover:bg-surface'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold">Interview Prep</span>
                <span className="text-xs text-subtle">Role questions & STAR behavioral prep</span>
              </div>
            </button>

            {/* Pricing & Plans */}
            <button
              type="button"
              onClick={() => {
                props.setActiveTab('pricing');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium transition-all cursor-pointer ${
                props.activeTab === 'pricing' ? 'bg-primary/10 text-brand font-semibold' : 'text-foreground hover:bg-surface'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold">Pricing & Plans</span>
                <span className="text-xs text-subtle">Subscription tiers and entitlements</span>
              </div>
            </button>

            {/* Onboarding Guide & Flight Map */}
            <button
              type="button"
              onClick={() => {
                props.setActiveTab('onboarding');
                setIsMobileMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium text-foreground hover:bg-surface transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold">Onboarding Guide &amp; Flight Map</span>
                <span className="text-xs text-subtle">Visual system walkthrough</span>
              </div>
            </button>

            {/* Take the Tour */}
            {props.onStartTour && (
              <button
                type="button"
                onClick={() => {
                  props.onStartTour?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium text-foreground hover:bg-surface transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold">Take the Tour</span>
                  <span className="text-xs text-subtle">Interactive 2-minute walkthrough</span>
                </div>
              </button>
            )}

            {/* Report a Bug / Feedback */}
            {props.onReportBug && (
              <button
                type="button"
                onClick={() => {
                  props.onReportBug?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-all cursor-pointer group"
                aria-label="Report a bug"
              >
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
                  <Bug className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-foreground">Report a Bug</span>
                  <span className="text-xs text-subtle">Send feedback or report an issue</span>
                </div>
              </button>
            )}
          </div>

          {/* Footer Actions: Landing page and Sign out */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                props.setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-subtle hover:text-foreground rounded-xl hover:bg-surface transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View website</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                props.onLogout();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </>
    )}
  </>;
}