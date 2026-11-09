// @ts-nocheck -- ported verbatim from the original project
import React, { useState } from 'react';
import { LoadingProgress } from './LoadingProgress';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserCheck,
  Briefcase,
  Cpu,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export interface RecruiterPanelData {
  overall_score: number;
  consensus_verdict: 'STRONG_HIRE' | 'HIRE' | 'NEEDS_IMPROVEMENT' | 'PASS';
  executive_summary: string;
  panel: {
    recruiter: {
      role: string;
      score: number;
      scan_time_verdict: string;
      feedback: string;
      top_strength: string;
      critical_flag: string;
    };
    hiring_manager: {
      role: string;
      score: number;
      business_impact_score: string;
      feedback: string;
      leadership_assessment: string;
      major_concern: string;
    };
    technical_lead: {
      role: string;
      score: number;
      execution_confidence: string;
      feedback: string;
      tooling_depth: string;
      gap_to_fill: string;
    };
  };
  top_strengths: string[];
  top_fixes: string[];
}

interface RecruiterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: RecruiterPanelData | null;
  isLoading: boolean;
  onRunReview: () => void;
  jobTitle: string;
  companyName: string;
  isProUser: boolean;
  userPlan?: 'free' | 'plus' | 'pro';
  onNavigateToPricing: () => void;
}

export const RecruiterReviewModal: React.FC<RecruiterReviewModalProps> = ({
  isOpen,
  onClose,
  reviewData,
  isLoading,
  onRunReview,
  jobTitle,
  companyName,
  isProUser,
  userPlan,
  onNavigateToPricing,
}) => {
  const hasFullAccess = isProUser || userPlan === 'plus' || userPlan === 'pro';
  const [activePersona, setActivePersona] = useState<'recruiter' | 'hiring_manager' | 'technical_lead'>(
    'recruiter'
  );

  if (!isOpen) return null;

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'STRONG_HIRE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/30">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            STRONG HIRE • CONSENSUS PASS
          </span>
        );
      case 'HIRE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/25">
            <span className="w-2 h-2 rounded-full bg-brand" />
            HIRE • ADVANCE TO PANEL
          </span>
        );
      case 'NEEDS_IMPROVEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold border border-warning/25">
            <span className="w-2 h-2 rounded-full bg-warning" />
            POLISH RECOMMENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-muted-foreground text-xs font-bold">
            SCREENING CALL
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-overlay/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Recruiter Panel Review" className="mobile-dialog-panel mobile-recruiter-panel relative w-full max-w-4xl bg-card rounded-2xl shadow-2xl border border-border my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="mobile-dialog-heading px-6 py-5 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
              <UserCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
                  Recruiter-Panel Multi-Persona Review
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-info/10 text-info border border-info/25 uppercase tracking-wider font-mono">
                  3-PERSON SIM
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluation for <strong className="text-foreground font-semibold">{jobTitle || 'Target Role'}</strong> at{' '}
                <strong className="text-foreground font-semibold">{companyName || 'Target Employer'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-subtle hover:text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mobile-dialog-content p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center mx-auto text-brand">
                <RefreshCw className="w-6 h-6 animate-spin text-brand" />
              </div>

              <div className="space-y-1.5 max-w-lg mx-auto">
                <LoadingProgress active={isLoading} label="Convening 3-Person Hiring Committee" expectedSeconds={45} resultToken={reviewData} />
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Evaluating 6-second recruiter ATS scan, hiring manager business ROI, and peer technical depth against the job description.
                </p>
              </div>

              {/* 3-Persona Simulation Pulse Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left max-w-2xl mx-auto">
                <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-xs">Senior Recruiter</div>
                      <div className="text-[10px] text-success font-medium">ATS & 6-Sec Scan</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-9">
                    Auditing keyword density, section taxonomy, and chronology.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-xs">Hiring Manager</div>
                      <div className="text-[10px] text-brand font-medium">Strategic Impact</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-9">
                    Validating business ROI, leadership scope, and ownership metrics.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-xs">Technical Peer</div>
                      <div className="text-[10px] text-warning font-medium">Tooling & Depth</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-9">
                    Reviewing workflow execution, systems rigor, and tooling stack.
                  </p>
                </div>
              </div>
            </div>
          ) : !reviewData ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center mx-auto text-brand">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-semibold text-foreground">Run Recruiter Panel Simulation</h4>
                <p className="text-xs text-subtle mt-1">
                  Simulate how your resume performs across a 3-person panel before applying: Senior Recruiter (ATS & format scan), Hiring Manager (business impact), and Technical Peer.
                </p>
              </div>
              <button
                onClick={onRunReview}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Start Hiring Panel Review
              </button>
            </div>
          ) : (
            <>
              {/* Top Consensus Score Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface/70 border border-border/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getVerdictBadge(reviewData.consensus_verdict)}
                    <span className="text-xs text-subtle">
                      Consensus across 3 interview personas
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 shrink-0 self-start sm:self-auto">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
                      {reviewData.overall_score}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/ 100 PANEL SCORE</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Executive Committee Consensus
                  </div>
                  <p className="text-[13.5px] text-foreground leading-relaxed font-normal">
                    {reviewData.executive_summary}
                  </p>
                </div>
              </div>

              {/* Free vs Plus/Pro Badge / Banner if Free user */}
              {!hasFullAccess && (
                <div className="p-3.5 rounded-xl bg-info/10 border border-info/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-info shrink-0" />
                    <p className="text-xs text-info font-medium leading-relaxed">
                      <strong>Free Plan:</strong> Viewing overall score and top panel findings. Unlock the full 3-persona line-by-line feedback with Plus or Pro.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToPricing();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-info hover:bg-info/90 text-primary-foreground text-xs font-semibold shrink-0 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    Upgrade to Plus ($4.99/mo)
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Persona Selector Tabs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActivePersona('recruiter')}
                    className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activePersona === 'recruiter'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-success" />
                    <span>Senior Recruiter</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface text-foreground font-bold">
                      {reviewData.panel.recruiter.score}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePersona('hiring_manager')}
                    className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activePersona === 'hiring_manager'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-brand" />
                    <span>Hiring Manager</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface text-foreground font-bold">
                      {reviewData.panel.hiring_manager.score}
                    </span>
                    {!hasFullAccess && <Lock className="w-3 h-3 text-warning ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePersona('technical_lead')}
                    className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activePersona === 'technical_lead'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-warning" />
                    <span>Technical Peer</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface text-foreground font-bold">
                      {reviewData.panel.technical_lead.score}
                    </span>
                    {!hasFullAccess && <Lock className="w-3 h-3 text-warning ml-0.5" />}
                  </button>
                </div>

                {/* Active Persona Details */}
                {activePersona === 'recruiter' && (
                  <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {reviewData.panel.recruiter.role}
                        </h5>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20 self-start sm:self-auto">
                        {reviewData.panel.recruiter.scan_time_verdict}
                      </span>
                    </div>

                    <p className="text-[13px] text-foreground leading-relaxed">
                      {reviewData.panel.recruiter.feedback}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-surface border border-success/25 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-success text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>Standout Strength</span>
                        </div>
                        <p className="text-[12.5px] text-foreground leading-relaxed">
                          {reviewData.panel.recruiter.top_strength}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface border border-warning/25 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-warning text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                          <span>Priority Polish Flag</span>
                        </div>
                        <p className="text-[12.5px] text-foreground leading-relaxed">
                          {reviewData.panel.recruiter.critical_flag}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePersona === 'hiring_manager' && (
                  <div className="relative">
                    {!hasFullAccess ? (
                      <div className="p-6 rounded-2xl border border-dashed border-info/25 bg-info/5 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center mx-auto">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-foreground">
                          Hiring Manager Evaluation Locked
                        </h5>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Upgrade to Plus or Pro to review the Department Director's business ROI score, leadership assessment, and exact questions they will probe during the interview.
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToPricing();
                          }}
                          className="px-4 py-2 rounded-xl bg-info text-primary-foreground text-xs font-semibold hover:bg-info/90 transition-colors cursor-pointer"
                        >
                          Unlock with Plus ($4.99/mo)
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                              {reviewData.panel.hiring_manager.role}
                            </h5>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 self-start sm:self-auto">
                            Business Impact: {reviewData.panel.hiring_manager.business_impact_score}
                          </span>
                        </div>

                        <p className="text-[13px] text-foreground leading-relaxed">
                          {reviewData.panel.hiring_manager.feedback}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3.5 rounded-xl bg-surface border border-brand/25 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold text-brand text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                              <span>Leadership Assessment</span>
                            </div>
                            <p className="text-[12.5px] text-foreground leading-relaxed">
                              {reviewData.panel.hiring_manager.leadership_assessment}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-surface border border-warning/25 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold text-warning text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                              <span>Interview Focus Probe</span>
                            </div>
                            <p className="text-[12.5px] text-foreground leading-relaxed">
                              {reviewData.panel.hiring_manager.major_concern}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activePersona === 'technical_lead' && (
                  <div className="relative">
                    {!hasFullAccess ? (
                      <div className="p-6 rounded-2xl border border-dashed border-info/25 bg-info/5 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center mx-auto">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-foreground">Technical Peer Evaluation Locked</h5>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Upgrade to Plus or Pro to review the Technical Lead's evaluation of tooling depth, architecture rigor, and execution confidence.
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToPricing();
                          }}
                          className="px-4 py-2 rounded-xl bg-info text-primary-foreground text-xs font-semibold hover:bg-info/90 transition-colors cursor-pointer"
                        >
                          Unlock with Plus ($4.99/mo)
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                              {reviewData.panel.technical_lead.role}
                            </h5>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 self-start sm:self-auto">
                            Execution Confidence: {reviewData.panel.technical_lead.execution_confidence}
                          </span>
                        </div>

                        <p className="text-[13px] text-foreground leading-relaxed">
                          {reviewData.panel.technical_lead.feedback}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3.5 rounded-xl bg-surface border border-warning/25 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold text-warning text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-warning" />
                              <span>Tooling Depth</span>
                            </div>
                            <p className="text-[12.5px] text-foreground leading-relaxed">
                              {reviewData.panel.technical_lead.tooling_depth}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-surface border border-info/25 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold text-info text-xs">
                              <TrendingUp className="w-3.5 h-3.5 text-info" />
                              <span>Recommended Technical Defense</span>
                            </div>
                            <p className="text-[12.5px] text-foreground leading-relaxed">
                              {reviewData.panel.technical_lead.gap_to_fill}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Key Strengths & Polish Fixes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Consensus Strengths
                  </h5>
                  <ul className="space-y-2.5">
                    {reviewData.top_strengths.slice(0, hasFullAccess ? 3 : 2).map((s, i) => (
                      <li key={i} className="text-[12.5px] text-foreground flex items-start gap-2.5 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Actionable Polish Fixes
                  </h5>
                  <ul className="space-y-2.5">
                    {reviewData.top_fixes.slice(0, hasFullAccess ? 3 : 2).map((f, i) => (
                      <li key={i} className="text-[12.5px] text-foreground flex items-start gap-2.5 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <div className="text-xs text-subtle flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Strict privacy: Resume text is processed confidentially</span>
          </div>
          <div className="flex items-center gap-2">
            {reviewData && (
              <button
                onClick={onRunReview}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-medium text-muted-foreground bg-surface border border-border rounded-xl hover:bg-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Re-evaluate
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

