// ATS Readiness Inspector & Score Drawer Component
// Inspired by Freehire's internal/candidate/atscheck and Job Match visualizer
// Displays real-time ATS pass probability, category breakdowns, and keyword gap analysis.

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
} from 'lucide-react';
import { AtsReadinessReport, AtsScoreCategory } from '../utils/atsReadinessScorer';

interface AtsReadinessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: AtsReadinessReport;
  targetRole?: string;
  onInsertKeyword?: (keyword: string) => void;
}

export const AtsReadinessDrawer: React.FC<AtsReadinessDrawerProps> = ({
  isOpen,
  onClose,
  report,
  targetRole = 'Target Role',
  onInsertKeyword,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('keyword_strength');

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-brand border-brand/40 bg-brand/10';
    if (score >= 70) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getPassRateLabel = (score: number) => {
    if (score >= 85) return 'Optimal ATS Pass Rate (Top 5% of Applicant Pool)';
    if (score >= 70) return 'Competitive (Meets Standard ATS Screening Thresholds)';
    if (score >= 55) return 'Moderate (Risk of Filter Drop in High-Volume Queues)';
    return 'Critical (High Risk of Rejection by Automated Parsers)';
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
                {report.overall >= 80 ? 'ATS OPTIMIZED' : report.overall >= 65 ? 'ACCEPTABLE' : 'NEEDS ACTION'}
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
              </div>
            </div>
          </div>

          {/* Top Recoverable Fixes / Quick Action Plan */}
          {report.topFixes.length > 0 && (
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-brand text-xs">
                <Zap className="w-3.5 h-3.5 text-brand" />
                <span>Highest-Yield Improvements (+{report.potential - report.overall} pts recoverable)</span>
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
                <span className="text-[10px] font-semibold text-warning uppercase font-mono tracking-wider">
                  Recommended to Integrate:
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Incorporate where you have genuine experience to close the match gap:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.recommendedKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onInsertKeyword?.(kw)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Click to copy or consider adding to experience bullets"
                    >
                      <span>+ {kw}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5-Category Detailed Diagnostic Breakdown */}
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
                        {category.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-surface border border-border/80 flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2">
                              {item.status === 'pass' ? (
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
                                {item.fixRecommendation && item.status !== 'pass' && (
                                  <div className="text-[10px] text-brand font-medium pt-1">
                                    💡 Fix: {item.fixRecommendation}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-subtle shrink-0">
                              {item.points}/{item.maxPoints} pts
                            </span>
                          </div>
                        ))}
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
