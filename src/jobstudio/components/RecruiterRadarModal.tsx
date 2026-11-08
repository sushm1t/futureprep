import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Building2,
  Copy,
  ChevronRight,
  Info,
  MousePointerClick,
} from 'lucide-react';
import {
  TracerLinkRecord,
  getSavedTracerLinks,
  recordTracerClick,
  copyTextToClipboard,
} from '../utils/screeningAnswerBank';

export interface RecruiterRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  companyName?: string;
  jobTitle?: string;
  targetLinkedInUrl?: string;
  targetPortfolioUrl?: string;
}

export const RecruiterRadarModal: React.FC<RecruiterRadarModalProps> = ({
  isOpen,
  onClose,
  isEnabled,
  onToggleEnabled,
  companyName = '',
  jobTitle = '',
  targetLinkedInUrl = '',
  targetPortfolioUrl = '',
}) => {
  const [tracerLinks, setTracerLinks] = useState<TracerLinkRecord[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const refreshLinks = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jobstudio_tracer_links_default');
        const list: TracerLinkRecord[] = raw ? JSON.parse(raw) : [];
        setTracerLinks(list);
      } catch {
        setTracerLinks([]);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshLinks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalClicks = tracerLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0);

  const handleTestClick = (token: string, targetUrl: string) => {
    // Record click locally in client storage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jobstudio_tracer_links_default');
        const list: TracerLinkRecord[] = raw ? JSON.parse(raw) : [];
        const updated = list.map((item) => {
          if (item.token === token) {
            return {
              ...item,
              clickCount: (item.clickCount || 0) + 1,
              lastClickedAt: new Date().toISOString(),
              lastReferrer: 'Browser Test Console',
              lastVisitorNetwork: 'Candidate Local Network (Test)',
            };
          }
          return item;
        });
        localStorage.setItem('jobstudio_tracer_links_default', JSON.stringify(updated));
        setTracerLinks(updated);
        setTestSuccessMessage('Test click recorded! Click count updated in real time.');
        setTimeout(() => setTestSuccessMessage(null), 3500);
      } catch {}
    }

    // Open target url in new tab
    if (typeof window !== 'undefined' && targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = async (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullTracerUrl = `${origin}/r/${token}`;
    const ok = await copyTextToClipboard(fullTracerUrl);
    if (ok) {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-radar-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="recruiter-radar-title" className="font-display text-base sm:text-lg font-semibold text-foreground">
                  Recruiter Radar: CV Link Tracking
                </h3>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Stealth Beacons
                </span>
              </div>
              <p className="text-xs text-subtle mt-0.5">
                Real-time engagement alerts when hiring teams open links from your submitted PDF resume
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close Recruiter Radar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Main Activation Banner */}
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Resume Radar Links
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isEnabled
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-subtle border border-border'
                  }`}
                >
                  {isEnabled ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}
                </span>
              </div>
              <p className="text-xs text-subtle leading-relaxed">
                {isEnabled
                  ? 'Active in your document. Your LinkedIn & Portfolio links will automatically generate click beacons when exporting PDF or DOCX.'
                  : 'Radar is turned off. Your resume will export plain, untracked links.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleEnabled(!isEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                isEnabled
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-brand text-brand-foreground border-brand hover:bg-brand/90'
              }`}
            >
              {isEnabled ? 'Turn OFF' : 'Turn ON'}
            </button>
          </div>

          {/* Test Notification Banner if clicked */}
          {testSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 shrink-0" />
              <span>{testSuccessMessage}</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface/60 border border-border flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-subtle">Total Recruiter Clicks</span>
              <span className="text-2xl font-bold font-display text-emerald-400 mt-1">
                {totalClicks}
              </span>
              <span className="text-[10px] text-subtle mt-0.5">Across active CV tracer links</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface/60 border border-border flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-subtle">Active Tracer Links</span>
              <span className="text-2xl font-bold font-display text-foreground mt-1">
                {tracerLinks.length}
              </span>
              <span className="text-[10px] text-subtle mt-0.5">LinkedIn, Portfolio & Projects</span>
            </div>
          </div>

          {/* How It Works Explainer */}
          <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 space-y-2 text-xs">
            <div className="font-semibold text-brand flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>How Recruiter Radar Works</span>
            </div>
            <p className="text-foreground/90 leading-relaxed text-[11px]">
              When you submit a resume to an ATS (like Workday, Eightfold, or Greenhouse), you rarely know when someone is actually reviewing it. 
              <strong> Radar Links</strong> replaces your LinkedIn or portfolio URL with a stealth forwarding link. 
              When a recruiter clicks it in your PDF, they are seamlessly forwarded to your profile in milliseconds, while sending you an alert right here with the company name, timestamp, and device network.
            </p>
          </div>

          {/* Active Links & Logs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5 font-mono">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Tracked CV Links ({tracerLinks.length})</span>
              </h4>
            </div>

            {tracerLinks.length === 0 ? (
              <div className="p-6 text-center bg-surface/40 rounded-xl border border-border space-y-2">
                <Radio className="w-8 h-8 text-subtle mx-auto opacity-30" />
                <p className="text-xs text-subtle font-medium">
                  No active recruiter clicks recorded yet.
                </p>
                <p className="text-[11px] text-subtle max-w-sm mx-auto">
                  Keep <strong>Radar Links: ON</strong> and download your PDF resume. When you send it to companies, recruiter clicks will appear here!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {tracerLinks.map((tl) => (
                  <div
                    key={tl.id || tl.token}
                    className="p-3 rounded-xl bg-surface/60 border border-border flex items-center justify-between gap-3 text-xs hover:border-brand/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground capitalize">
                          {tl.linkLabel || 'CV Link'}
                        </span>
                        {tl.companyName && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-subtle">
                            {tl.companyName}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          {tl.clickCount} {tl.clickCount === 1 ? 'click' : 'clicks'}
                        </span>
                      </div>
                      <p className="text-[11px] text-subtle font-mono truncate mt-0.5" title={tl.targetUrl}>
                        {tl.targetUrl}
                      </p>
                      {tl.lastClickedAt && (
                        <p className="text-[10px] text-emerald-400/90 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Last clicked {new Date(tl.lastClickedAt).toLocaleTimeString()} ({tl.lastVisitorNetwork || 'Recruiter Network'})</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestClick(tl.token, tl.targetUrl)}
                        className="px-2.5 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-foreground text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        title="Simulate a recruiter clicking this link"
                      >
                        <ExternalLink className="w-3 h-3 text-brand" />
                        <span>Test Click</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(tl.token)}
                        className="p-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-subtle hover:text-foreground text-[11px] cursor-pointer transition-colors"
                        title="Copy direct radar link"
                      >
                        {copiedToken === tl.token ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-border flex items-center justify-between bg-card shrink-0 gap-3">
          <span className="text-[11px] text-subtle">
            {isEnabled ? '✓ Links are active for export' : '○ Radar is currently disabled'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-2 border border-border text-foreground transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
