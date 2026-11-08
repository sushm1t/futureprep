import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardCheck,
  Check,
  Copy,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  Clock,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  ScreeningAnswerEntry,
  generateAtsApplicationDossier,
  copyTextToClipboard,
  AtsDossierMeta,
} from '../utils/screeningAnswerBank';

export interface AtsDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  targetCompany?: string;
  targetLocation?: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  summary?: string;
  skills?: string[];
  screeningAnswers?: ScreeningAnswerEntry[];
  onNavigateToScreening?: () => void;
}

export const AtsDossierModal: React.FC<AtsDossierModalProps> = ({
  isOpen,
  onClose,
  targetRole = '',
  targetCompany = '',
  targetLocation = '',
  candidateName = '',
  email = '',
  phone = '',
  location = '',
  linkedin = '',
  portfolio = '',
  summary = '',
  skills = [],
  screeningAnswers = [],
  onNavigateToScreening,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isFullDossierCopied, setIsFullDossierCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const meta: AtsDossierMeta = {
    candidateName: candidateName || 'Candidate',
    email: email || 'N/A',
    phone: phone || 'N/A',
    location: location || targetLocation || 'N/A',
    linkedin: linkedin || 'N/A',
    portfolio: portfolio || undefined,
    targetRole,
    targetCompany,
    skills,
    summary,
  };

  const fullDossierText = generateAtsApplicationDossier(screeningAnswers, meta);

  const handleCopyField = async (key: string, value: string) => {
    if (!value || value === 'N/A') return;
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCopyFullDossier = async () => {
    const ok = await copyTextToClipboard(fullDossierText);
    if (ok) {
      setIsFullDossierCopied(true);
      setTimeout(() => setIsFullDossierCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ats-dossier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ats-dossier-modal-title" className="font-display text-base sm:text-lg font-semibold text-foreground">
                  ATS Application Dossier
                </h3>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/25">
                  Fast-Apply
                </span>
              </div>
              <p className="text-xs text-subtle mt-0.5">
                {targetRole ? (
                  <span>
                    Verified answers for <strong className="text-foreground">{targetRole}</strong>
                    {targetCompany ? ` at ${targetCompany}` : ''}
                  </span>
                ) : (
                  'Verified candidate answers pre-formatted for Workday, Eightfold & Greenhouse'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close ATS Dossier modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Primary Action Banner */}
          <div className="rounded-xl p-4 bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>1-Click Universal Copy</span>
              </div>
              <p className="text-[11px] text-subtle">
                Copy all answers, links, and contact fields into your clipboard at once, or copy individual fields below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyFullDossier}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand text-brand-foreground hover:bg-brand/90 transition-all cursor-pointer shadow-sm shrink-0"
            >
              {isFullDossierCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-300">Entire Dossier Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Dossier</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Candidate Contact & Identifiers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Contact & Application Fields</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Full Name', value: meta.candidateName, key: 'name', icon: User },
                { label: 'Email Address', value: meta.email, key: 'email', icon: Mail },
                { label: 'Phone Number', value: meta.phone, key: 'phone', icon: Phone },
                { label: 'Location / Residence', value: meta.location, key: 'location', icon: MapPin },
                { label: 'LinkedIn Profile', value: meta.linkedin, key: 'linkedin', icon: Globe },
                ...(meta.portfolio ? [{ label: 'Portfolio / Website', value: meta.portfolio, key: 'portfolio', icon: Globe }] : []),
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-surface/60 border border-border flex items-center justify-between gap-2 text-xs hover:border-brand/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-subtle font-medium block">
                      {item.label}
                    </span>
                    <span className="text-foreground font-mono text-[11px] truncate block select-all">
                      {item.value}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyField(item.key, item.value || '')}
                    disabled={!item.value || item.value === 'N/A'}
                    className={`p-1.5 rounded-lg border transition-all text-[11px] flex items-center gap-1 shrink-0 ${
                      copiedKey === item.key
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-card border-border hover:bg-surface text-subtle hover:text-foreground cursor-pointer'
                    }`}
                    title={`Copy ${item.label}`}
                  >
                    {copiedKey === item.key ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Standard ATS Screening Answers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Standard ATS Screening Answers</span>
            </h4>
            <div className="space-y-2">
              {screeningAnswers.map((ans, idx) => (
                <div
                  key={ans.id || idx}
                  className="p-3 rounded-xl bg-surface/60 border border-border space-y-1.5 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      {ans.topic === 'salary' && <DollarSign className="w-3.5 h-3.5 text-amber-400" />}
                      {ans.topic === 'notice_period' && <Clock className="w-3.5 h-3.5 text-cyan-400" />}
                      {ans.topic === 'work_authorization' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      {ans.topic === 'relocation' && <MapPin className="w-3.5 h-3.5 text-purple-400" />}
                      {ans.topic === 'custom_qna' && <Briefcase className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{ans.questionLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyField(`ans_${idx}`, ans.answerText)}
                      className={`px-2 py-1 rounded-lg border transition-all text-[11px] flex items-center gap-1 shrink-0 ${
                        copiedKey === `ans_${idx}`
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-card border-border hover:bg-surface text-subtle hover:text-foreground cursor-pointer'
                      }`}
                      title="Copy Answer"
                    >
                      {copiedKey === `ans_${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-subtle bg-card/60 p-2.5 rounded-lg border border-border/50 leading-relaxed select-all">
                    {ans.answerText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Role Elevator Pitch & ATS Keywords */}
          {(meta.summary || (meta.skills && meta.skills.length > 0)) && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-subtle flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Tailored Pitch & ATS Keywords</span>
              </h4>

              {meta.summary && (
                <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-foreground">
                      Candidate Summary / Elevator Pitch
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyField('summary', meta.summary || '')}
                      className={`px-2 py-1 rounded-lg border transition-all text-[11px] flex items-center gap-1 shrink-0 ${
                        copiedKey === 'summary'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-card border-border hover:bg-surface text-subtle hover:text-foreground cursor-pointer'
                      }`}
                    >
                      {copiedKey === 'summary' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-subtle bg-card/60 p-2.5 rounded-lg border border-border/50 leading-relaxed select-all">
                    {meta.summary}
                  </p>
                </div>
              )}

              {meta.skills && meta.skills.length > 0 && (
                <div className="p-3 rounded-xl bg-surface/60 border border-border space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-foreground">
                      ATS Keywords & Core Competencies
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyField('skills', meta.skills?.join(', ') || '')}
                      className={`px-2 py-1 rounded-lg border transition-all text-[11px] flex items-center gap-1 shrink-0 ${
                        copiedKey === 'skills'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-card border-border hover:bg-surface text-subtle hover:text-foreground cursor-pointer'
                      }`}
                    >
                      {copiedKey === 'skills' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.skills.slice(0, 15).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] text-foreground font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                    {meta.skills.length > 15 && (
                      <span className="text-[10px] text-subtle self-center">
                        +{meta.skills.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-border flex items-center justify-between bg-card shrink-0 gap-3">
          {onNavigateToScreening ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToScreening();
              }}
              className="text-xs text-brand hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Customize Answers in Interview Prep Tab</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-2 border border-border text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
