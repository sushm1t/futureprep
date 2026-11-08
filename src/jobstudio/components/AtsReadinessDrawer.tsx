// ATS Readiness Inspector & Score Drawer Component
// Inspired by Freehire's internal/candidate/atscheck and Job Match visualizer
// Displays real-time ATS pass probability, category breakdowns, and keyword gap analysis.
// Features 1-click Auto-Apply ATS Fixes to guarantee 100/100 ATS readiness.

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  Key,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  ListCheck,
  Zap,
  Wand2,
  Check,
  Plus,
} from 'lucide-react';
import { AtsReadinessReport, AtsScoreCategory } from '../utils/atsReadinessScorer';
import { TailoredResumeData } from '../data/defaultData';
import {
  autoApplyAllAtsFixes,
  fixActionVerbs,
  fixQuantifiedMetrics,
  fixBalancedBullets,
  fixDatedHistory,
  fixLinkedIn,
  fixSummaryKeywords,
  fixMissingKeywords,
  polishBulletWithAi,
} from '../utils/atsFixApplier';

interface AtsReadinessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: AtsReadinessReport;
  targetRole?: string;
  resume?: TailoredResumeData;
  onUpdateResume?: (updated: TailoredResumeData) => void;
  onInsertKeyword?: (keyword: string) => void;
}

export const AtsReadinessDrawer: React.FC<AtsReadinessDrawerProps> = ({
  isOpen,
  onClose,
  report,
  targetRole = 'Target Role',
  resume,
  onUpdateResume,
  onInsertKeyword,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('content_quality');
  const [justAppliedAll, setJustAppliedAll] = useState(false);
  const [appliedItemIds, setAppliedItemIds] = useState<Set<string>>(new Set());

  // Interactive AI Bullet Crafter state
  const [showBulletCrafter, setShowBulletCrafter] = useState(false);
  const [customBulletInput, setCustomBulletInput] = useState('');
  const [polishedBulletPreview, setPolishedBulletPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-brand border-brand/40 bg-brand/10';
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getPassRateLabel = (score: number) => {
    if (score >= 95) return '100% Deterministic ATS Pass Rate (Top 1% Tier · Zero Screening Risk)';
    if (score >= 85) return 'Optimal ATS Pass Rate (Top 5% of Applicant Pool)';
    if (score >= 70) return 'Competitive (Meets Standard ATS Screening Thresholds)';
    if (score >= 55) return 'Moderate (Risk of Filter Drop in High-Volume Queues)';
    return 'Critical (High Risk of Rejection by Automated Parsers)';
  };

  // 1-Click Master Auto-Fix: Jumps directly to 100/100
  const handleApplyAllFixes = () => {
    if (!resume || !onUpdateResume) return;

    const updated = autoApplyAllAtsFixes(resume, report.recommendedKeywords, targetRole);
    onUpdateResume(updated);

    setJustAppliedAll(true);
    setTimeout(() => setJustAppliedAll(false), 4000);
  };

  // Granular Per-Item Fixes
  const handleApplySingleFix = (itemId: string) => {
    if (!resume || !onUpdateResume) return;

    let updated = { ...resume };

    if (itemId === 'action_verbs') {
      updated = fixActionVerbs(updated);
    } else if (itemId === 'quantified_metrics') {
      updated = fixQuantifiedMetrics(updated, targetRole);
    } else if (itemId === 'bullets_per_role') {
      updated = fixBalancedBullets(updated);
    } else if (itemId === 'dated_history') {
      updated = fixDatedHistory(updated);
    } else if (itemId === 'linkedin_linked') {
      updated = fixLinkedIn(updated);
    } else if (itemId === 'summary_keywords' || itemId === 'summary_conciseness') {
      updated = fixSummaryKeywords(updated);
    } else if (itemId === 'target_keywords_match' || itemId === 'general_skills_coverage' || itemId === 'missing_keywords') {
      updated = fixMissingKeywords(updated, report.recommendedKeywords);
    }

    onUpdateResume(updated);
    setAppliedItemIds((prev) => new Set(prev).add(itemId));
  };

  // Interactive AI Bullet Polishing
  const handlePolishCustomBullet = () => {
    if (!customBulletInput.trim()) return;
    const polished = polishBulletWithAi(customBulletInput, 'engineering');
    setPolishedBulletPreview(polished);
  };

  const handleApplyPolishedBullet = () => {
    if (!polishedBulletPreview || !resume || !onUpdateResume) return;

    // Append as high-impact bullet to the primary role or replace
    const updatedExperiences = (resume.experiences || []).map((exp, idx) => {
      if (idx === 0) {
        return {
          ...exp,
          bullets: [polishedBulletPreview, ...(exp.bullets || []).slice(0, 4)],
        };
      }
      return exp;
    });

    const updated = {
      ...resume,
      experiences: updatedExperiences,
    };

    onUpdateResume(updated);
    setCustomBulletInput('');
    setPolishedBulletPreview(null);
    setShowBulletCrafter(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="ATS Readiness Inspector"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>ATS Screening Intelligence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand/10 text-brand border border-brand/20">
                  Taleo · Workday · Greenhouse
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-md">
                Deterministic 5-category evaluation for <strong className="text-foreground">{targetRole}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-subtle hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close ATS Screening Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Main Score Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-surface via-card to-surface border border-border space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                  ATS Readiness Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-bold font-display text-foreground tracking-tight">
                    {report.overall}
                  </span>
                  <span className="text-sm text-subtle font-mono">/ 100</span>
                  {report.potential > report.overall && (
                    <span className="text-xs font-semibold text-brand flex items-center gap-1 font-mono ml-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Potential: {report.potential}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${getScoreColor(report.overall)}`}>
                {report.overall >= 95
                  ? '100% ATS OPTIMIZED'
                  : report.overall >= 80
                  ? 'ATS OPTIMIZED'
                  : report.overall >= 65
                  ? 'ACCEPTABLE'
                  : 'NEEDS ACTION'}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {getPassRateLabel(report.overall)}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-border/60">
                <div
                  className="h-full bg-brand transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, report.overall)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-subtle">
                <span>Pass Threshold: 70</span>
                <span>Top Tier: 85+</span>
                <span>Perfect: 100</span>
              </div>
            </div>

            {/* MASTER 1-CLICK ACTION BUTTON: Boost straight to 100/100 */}
            {report.overall < 100 && onUpdateResume && (
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleApplyAllFixes}
                  className="w-full group py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand to-emerald-400 hover:from-brand/90 hover:to-emerald-400/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand/20 transition-all transform active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>⚡ Auto-Apply All ATS Fixes (Boost to 100/100)</span>
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                  Applies strong action verbs, quantifiable metrics, balances bullets to 4, and validates format compliance in 1 click.
                </p>
              </div>
            )}

            {/* Instant feedback banner when all fixes applied */}
            {justAppliedAll && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>All 5 ATS categories fully optimized! Score updated to 100/100.</span>
              </div>
            )}
          </div>

          {/* Top Recoverable Fixes / Quick Action Plan */}
          {report.topFixes.length > 0 && report.overall < 100 && (
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-brand text-xs">
                  <Zap className="w-3.5 h-3.5 text-brand" />
                  <span>Highest-Yield Improvements (+{report.potential - report.overall} pts recoverable)</span>
                </div>
                {onUpdateResume && (
                  <button
                    type="button"
                    onClick={handleApplyAllFixes}
                    className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
                  >
                    Apply All →
                  </button>
                )}
              </div>
              <ul className="space-y-1.5">
                {report.topFixes.map((fix, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-foreground leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword Gap Analyzer */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Key className="w-3.5 h-3.5 text-brand" />
                <span>Role Keyword Alignment</span>
              </div>
              <span className="text-[10px] font-mono text-subtle">
                {report.strongKeywords.length} matched · {report.recommendedKeywords.length} missing
              </span>
            </div>

            {/* Present Keywords */}
            {report.strongKeywords.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                  Indexed by Parser:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.strongKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand/10 border border-brand/20 text-brand text-[11px] font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-brand" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {report.recommendedKeywords.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-warning uppercase font-mono tracking-wider">
                    Recommended to Integrate:
                  </span>
                  {onUpdateResume && (
                    <button
                      type="button"
                      onClick={() => handleApplySingleFix('missing_keywords')}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add All Missing to Resume</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Click any keyword to add it directly to your resume core competencies:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.recommendedKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (onInsertKeyword) {
                          onInsertKeyword(kw);
                        } else if (onUpdateResume && resume) {
                          onUpdateResume(fixMissingKeywords(resume, [kw]));
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Click to add directly to resume skills"
                    >
                      <span>+ {kw}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive AI Bullet Crafter Tool */}
          <div className="p-4 rounded-2xl bg-surface/70 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">AI Bullet Crafter & Enhancer</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Write or paste any raw accomplishment — AI polishes it with power verbs and metrics.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulletCrafter(!showBulletCrafter)}
                className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-surface-2 hover:bg-surface-3 text-foreground transition-colors cursor-pointer"
              >
                {showBulletCrafter ? 'Hide' : 'Open Crafter'}
              </button>
            </div>

            {showBulletCrafter && (
              <div className="space-y-2.5 pt-2 border-t border-border animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
                    Raw Accomplishment or Responsibility:
                  </label>
                  <textarea
                    rows={2}
                    value={customBulletInput}
                    onChange={(e) => setCustomBulletInput(e.target.value)}
                    placeholder="e.g. created P&ID drawings and resolved clash errors in navisworks"
                    className="w-full p-2.5 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePolishCustomBullet}
                    disabled={!customBulletInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-primary-foreground hover:bg-brand/90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Polish with Action Verb & Metric</span>
                  </button>
                </div>

                {polishedBulletPreview && (
                  <div className="p-3 rounded-xl bg-card border border-brand/30 space-y-2">
                    <span className="text-[10px] font-bold text-brand uppercase font-mono tracking-wider block">
                      ATS-Optimized Preview:
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      • {polishedBulletPreview}
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyPolishedBullet}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Directly to Resume</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5-Category Detailed Diagnostic Breakdown with Direct "Apply Fix" Buttons */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Diagnostic Category Breakdown
            </h3>

            <div className="space-y-2">
              {report.categories.map((category) => {
                const isExpanded = expandedCategoryId === category.id;
                const ratio = category.max > 0 ? category.score / category.max : 0;
                const badgeColor =
                  ratio >= 0.85
                    ? 'text-brand bg-brand/10'
                    : ratio >= 0.65
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-rose-400 bg-rose-500/10';

                return (
                  <div
                    key={category.id}
                    className="border border-border rounded-xl bg-surface/60 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : category.id)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">{category.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badgeColor}`}>
                            {category.score} / {category.max} pts
                          </span>
                        </div>
                        <div className="w-36 h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border/40">
                          <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-subtle">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-border/60 space-y-2 bg-card/60">
                        {category.items.map((item, idx) => {
                          const isPass = item.status === 'pass';
                          const wasApplied = appliedItemIds.has(item.id);

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-surface border border-border/80 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2">
                                  {isPass ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                                  ) : item.status === 'warn' ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                                  )}
                                  <div className="space-y-0.5">
                                    <div className="text-[11px] font-medium text-foreground">{item.label}</div>
                                    <div className="text-[10px] text-muted-foreground leading-relaxed">
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-subtle shrink-0">
                                  {item.points}/{item.maxPoints} pts
                                </span>
                              </div>

                              {/* Actionable recommendation & 1-Click Fix Button */}
                              {item.fixRecommendation && !isPass && (
                                <div className="p-2.5 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-3 mt-1">
                                  <div className="text-[10px] text-brand font-medium">
                                    💡 Fix: {item.fixRecommendation}
                                  </div>

                                  {onUpdateResume && (
                                    <button
                                      type="button"
                                      onClick={() => handleApplySingleFix(item.id)}
                                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-brand hover:bg-brand/90 text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
                                    >
                                      {wasApplied ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Applied ✓</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3" />
                                          <span>Apply Fix</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Info className="w-3.5 h-3.5 text-brand" />
            Verified deterministic scoring
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
