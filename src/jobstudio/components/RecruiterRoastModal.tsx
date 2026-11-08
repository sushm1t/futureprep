import React, { useEffect } from 'react';
import {
  X,
  Flame,
  Check,
  AlertTriangle,
  Eye,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { RecruiterRoastAnalysis } from '../utils/recruiterRoast';

export interface RecruiterRoastModalProps {
  isOpen: boolean;
  onClose: () => void;
  roast: RecruiterRoastAnalysis;
  targetRole?: string;
  onApplyUpgrade?: (replacementBullet: string) => void;
}

export const RecruiterRoastModal: React.FC<RecruiterRoastModalProps> = ({
  isOpen,
  onClose,
  roast,
  targetRole = 'Target Role',
  onApplyUpgrade,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-roast-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="recruiter-roast-title" className="font-display text-base sm:text-lg font-semibold text-foreground">
                  Recruiter 6-Second Roast
                </h3>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  Eye-Tracking
                </span>
              </div>
              <p className="text-xs text-subtle mt-0.5">
                Simulating what an executive recruiter reads in seconds 1–6 before deciding to pass or interview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close Recruiter Roast modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Signal-to-Fluff Meter Banner */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-foreground">
                  Signal-to-Fluff Diagnostic
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    roast.verdictBadgeColor === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : roast.verdictBadgeColor === 'cyan'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : roast.verdictBadgeColor === 'amber'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {roast.verdict}
                </span>
              </div>
              <p className="text-xs text-subtle max-w-sm">
                Calculated from quantified metrics, technical noun density, and elimination of passive filler phrases.
              </p>
            </div>

            <div className="text-center shrink-0">
              <div className="text-3xl font-display font-extrabold text-foreground">
                <span className={roast.signalToFluffScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
                  {roast.signalToFluffScore}
                </span>
                <span className="text-sm text-subtle"> / 100</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-subtle block mt-0.5">
                {roast.metricCount} metrics · {roast.fluffWordsDetected.length} fluff flags
              </span>
            </div>
          </div>

          {/* Section: 6-Second Eye Tracking Anchors */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5 font-mono">
              <Eye className="w-3.5 h-3.5 text-brand" />
              <span>Where the Recruiter’s Eye Actually Lands</span>
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface/60 border border-border flex items-start gap-3 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  SEC 1-2
                </span>
                <div>
                  <span className="font-semibold text-foreground block">
                    Headline & Current Stature
                  </span>
                  <span className="text-subtle font-mono text-[11px] block mt-0.5">
                    {roast.eyeTrackingScanSummary.anchor1Title}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface/60 border border-border flex items-start gap-3 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  SEC 3-4
                </span>
                <div>
                  <span className="font-semibold text-foreground block">
                    Primary Proof Bullet
                  </span>
                  <span className="text-subtle font-mono text-[11px] block mt-0.5">
                    {roast.eyeTrackingScanSummary.anchor2FirstImpression}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface/60 border border-border flex items-start gap-3 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-brand/15 text-brand font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  SEC 5-6
                </span>
                <div>
                  <span className="font-semibold text-foreground block">
                    Keyword Anchor Scan
                  </span>
                  <span className="text-subtle font-mono text-[11px] block mt-0.5">
                    {roast.eyeTrackingScanSummary.anchor3TechStackReadout}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Unvarnished Recruiter Roast Comments */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5 font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>The Unvarnished Recruiter Critique</span>
            </h4>
            <div className="space-y-2">
              {roast.unvarnishedRoast.map((critique, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground/90 leading-relaxed flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{critique}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Actionable High-Signal Bullet Upgrades */}
          {roast.actionableUpgrades.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>10x Bullet Upgrades (Replace Fluff with ROI)</span>
              </h4>
              <div className="space-y-2.5">
                {roast.actionableUpgrades.map((upgrade, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface/60 border border-border space-y-2 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">
                        Before (Weak Fluff):
                      </span>
                      <p className="text-subtle line-through text-[11px]">
                        "{upgrade.fluffPhrase}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>After (High-Signal Outcome):</span>
                      </span>
                      <p className="text-foreground font-medium text-[11px] bg-card p-2 rounded-lg border border-border select-all">
                        {upgrade.highSignalReplacement}
                      </p>
                    </div>

                    <p className="text-[10px] text-subtle italic">
                      💡 {upgrade.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-border flex items-center justify-between bg-card shrink-0 gap-3">
          <span className="text-[11px] text-subtle">
            Targeting: <strong className="text-foreground">{targetRole}</strong>
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
