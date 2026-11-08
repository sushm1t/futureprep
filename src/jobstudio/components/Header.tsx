// @ts-nocheck -- ported verbatim from the original project
import React from 'react';
import {
  Download,
  CheckCircle2,
  Compass,
  FileText,
  Mail,
  HelpCircle,
  Briefcase,
  Milestone,
  Sparkles,
  User,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadPdf: () => void;
  isDownloading: boolean;
  downloadSuccess?: boolean;
  score?: number;
  appliedCount?: number;
  isProUser?: boolean;
  tailoredCount?: number;
  isLoggedIn?: boolean;
  userName?: string;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadPdf,
  isDownloading,
  downloadSuccess = false,
  appliedCount = 0,
  isProUser = false,
  tailoredCount = 0,
  isLoggedIn = true,
  userName = 'Candidate',
  onOpenAuthModal,
  onLogout,
}) => {
  const tabs = [
    { id: 'evaluator', label: 'Job Evaluator', icon: Compass },
    { id: 'roadmaps', label: 'Career Roadmaps', icon: Milestone },
    { id: 'resume', label: 'Tailored Resume', icon: FileText },
    { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
    { id: 'screening', label: 'ATS & Interview', icon: HelpCircle },
    { id: 'applied', label: 'Applied Jobs', icon: Briefcase, count: appliedCount },
    { id: 'pricing', label: 'Pricing', icon: Sparkles },
    { id: 'profile', label: 'Master Profile', icon: User },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-2.5 z-40 px-2 sm:px-6 max-w-7xl w-full mx-auto">
      <div className="bg-card/85 backdrop-blur-xl border border-border shadow-elevated rounded-full h-14 px-3 sm:px-4 flex items-center justify-between gap-2 lg:gap-3 transition-all duration-[0.25s] ease-in-out">
        {/* Brand - Combined logo and title navigate to Home */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 group cursor-pointer text-left focus:outline-none"
          title="Job Studio - Home"
        >
          <div className="w-7 h-7 rounded-lg bg-foreground group-hover:bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-2xs transition-colors duration-[0.2s]">
            <span className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>JS</span>
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground group-hover:text-brand transition-colors duration-[0.2s]" style={{ fontFamily: 'var(--font-display)' }}>
            Job Studio
          </span>
        </button>

        {/* Apple Segmented Control Navigation - 1 Sleek Bar without scrolling */}
        <nav className="flex items-center p-0.5 sm:p-1 bg-surface rounded-full text-xs font-medium overflow-x-auto lg:overflow-visible scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-full transition-all duration-[0.2s] ease-in-out cursor-pointer whitespace-nowrap text-[11px] xl:text-xs ${
                  isActive
                    ? 'bg-card text-foreground shadow-elevated font-semibold'
                    : 'text-subtle hover:text-foreground hover:bg-card/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-foreground' : 'text-subtle'}`} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button & Plan / Auth Status */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn && (
            isProUser ? (
              <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 bg-brand/15 text-brand border border-brand/30 text-[11px] font-bold rounded-full font-mono">
                <span>★ PRO</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-foreground hover:text-brand bg-surface hover:bg-brand/10 rounded-full transition-colors cursor-pointer"
                title="View pricing & upgrade to Pro"
              >
                <span>Free</span>
                <span className="text-brand font-semibold">({2 - Math.min(tailoredCount, 2)} left)</span>
              </button>
            )
          )}

          {/* User Sign In / Profile */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-brand/10 border-brand text-brand'
                    : 'bg-surface border-transparent hover:border-brand/30 text-foreground'
                }`}
                title={`My Master Profile (${userName})`}
              >
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-[9px] flex items-center justify-center">
                  {getInitials(userName || 'User')}
                </div>
                <span className="hidden xl:inline text-xs font-semibold max-w-[85px] truncate">
                  {userName.split(' ')[0]}
                </span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:flex p-1.5 text-subtle hover:text-danger hover:bg-danger/10 rounded-full transition-colors cursor-pointer"
                  title="Sign out of workspace"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : null}

          {/* Export PDF: Hidden on home page and hidden when user is logged out */}
          {isLoggedIn && activeTab !== 'home' && (
            <button
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-[0.25s] ease-in-out whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                downloadSuccess
                  ? 'bg-success text-primary-foreground shadow-elevated'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                  <span>Saved PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-primary-foreground" />
                  <span>{isDownloading ? 'Exporting...' : 'Export PDF'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
