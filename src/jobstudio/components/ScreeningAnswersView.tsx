// @ts-nocheck -- ported verbatim from the original project
import React, { useState } from 'react';
import { CompanyFocusPacks } from './CompanyFocusPacks';
import { LoadingProgress } from './LoadingProgress';
import { deriveLeveragePoints } from '../utils/leveragePoints';
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  User,
  Sparkles,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Zap,
  Plus,
  Trash2,
  Lightbulb,
  Tag,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Building2,
  Award,
  Send,
  Lock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PhoneCall,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { ScreeningAnswer, CandidateInfo, InterviewPrepQuestion } from '../data/defaultData';

interface ScreeningAnswersViewProps {
  screeningAnswers: ScreeningAnswer[];
  candidateInfo: CandidateInfo;
  applyUrl?: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  masterProfileText?: string;
  interviewQuestions?: InterviewPrepQuestion[];
  onFetchInterviewPrep?: () => void;
  isFetchingInterviewPrep?: boolean;
  onTrackApplication?: () => void;
  onApplyClick?: (url: string) => void;
  isTracked?: boolean;
  onAddScreeningAnswer?: (newAnswer: ScreeningAnswer) => void;
  onRemoveScreeningAnswer?: (index: number) => void;
  isProUser?: boolean;
  onNavigateToPricing?: () => void;
  initialTab?: 'screening' | 'portal' | 'company_packs' | 'behavioral' | 'negotiation';
}

export const ScreeningAnswersView: React.FC<ScreeningAnswersViewProps> = ({
  screeningAnswers,
  candidateInfo,
  applyUrl,
  companyName,
  jobTitle,
  jobDescription = '',
  masterProfileText = '',
  interviewQuestions = [],
  onFetchInterviewPrep,
  isFetchingInterviewPrep = false,
  onTrackApplication,
  onApplyClick,
  isTracked = false,
  onAddScreeningAnswer,
  onRemoveScreeningAnswer,
  isProUser = false,
  onNavigateToPricing,
  initialTab = 'screening',
}) => {
  // Stage 1 (Immediate / Application Stage): Screening Question Answers & Company Focus Guidance
  const [stage1Tab, setStage1Tab] = useState<'screening' | 'company_packs'>(
    initialTab === 'company_packs' ? 'company_packs' : 'screening'
  );

  // Stage 2 (Late Stage / Interview Call Stage): Expandable Round 2 & Offer Prep module
  const [isRound2Expanded, setIsRound2Expanded] = useState<boolean>(
    initialTab === 'behavioral' || initialTab === 'negotiation'
  );
  const [stage2Tab, setStage2Tab] = useState<'behavioral' | 'negotiation'>(
    initialTab === 'negotiation' ? 'negotiation' : 'behavioral'
  );

  // Copy states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copiedInterviewIndex, setCopiedInterviewIndex] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'portal' | 'technical' | 'behavioral'>('all');

  // Custom ATS Application Question Answerer State
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<'star' | 'concise' | 'executive'>('star');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState<boolean>(false);
  const [isCopiedGenerated, setIsCopiedGenerated] = useState<boolean>(false);
  const [isSavedToForm, setIsSavedToForm] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedAnswerResult, setGeneratedAnswerResult] = useState<{
    question: string;
    answer: string;
    key_points: string[];
    keywords: string[];
    category: string;
    word_count: number;
  } | null>(null);

  // Behavioral Practice Coach State
  const [practiceQuestion, setPracticeQuestion] = useState<string>(
    'Describe a relevant challenge, your actions, and what you learned.'
  );
  const [practiceAnswerInput, setPracticeAnswerInput] = useState<string>('');
  const [isGradingPractice, setIsGradingPractice] = useState<boolean>(false);
  const [practiceResult, setPracticeResult] = useState<{
    overall_score: number;
    situation_task_score: number;
    situation_task_feedback: string;
    action_ownership_score: number;
    action_ownership_feedback: string;
    results_metrics_score: number;
    results_metrics_feedback: string;
    delivery_polish_score: number;
    delivery_polish_feedback: string;
    strengths: string[];
    weaknesses: string[];
    gold_standard_answer: string;
  } | null>(null);
  const [copiedGoldStandard, setCopiedGoldStandard] = useState<boolean>(false);

  // Offer Negotiation Copilot State
  const [offeredBase, setOfferedBase] = useState<string>('');
  const [targetBase, setTargetBase] = useState<string>('');
  const [benefitsInput, setBenefitsInput] = useState<string>('');
  const [competingOfferInput, setCompetingOfferInput] = useState<string>('');
  const [leverageInput, setLeverageInput] = useState<string>(() => deriveLeveragePoints(masterProfileText));
  const leverageEditedRef = React.useRef(false);
  React.useEffect(() => {
    if (!leverageEditedRef.current) setLeverageInput(deriveLeveragePoints(masterProfileText));
  }, [masterProfileText]);
  const [isGeneratingOfferPrep, setIsGeneratingOfferPrep] = useState<boolean>(false);
  const [offerPrepResult, setOfferPrepResult] = useState<{
    counter_offer_email: string;
    phone_script: string;
    talking_points: string[];
    objection_handlers: { objection: string; response: string; backup_tactic: string }[];
    market_benchmark_insight: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const copyAnswer = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyField = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAnswerText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedGenerated(true);
    setTimeout(() => setIsCopiedGenerated(false), 2000);
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyInterviewAnswer = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInterviewIndex(idx);
    setTimeout(() => setCopiedInterviewIndex(null), 2000);
  };

  const handleGenerateAnswer = async (overrideQuestion?: string) => {
    const q = (overrideQuestion || customQuestionInput).trim();
    if (!q) return;

    setIsGeneratingAnswer(true);
    setGenerationError(null);
    setIsCopiedGenerated(false);
    setIsSavedToForm(false);

    try {
      const response = await fetch('/api/ats/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          companyName: companyName || 'Target Employer',
          jobTitle: jobTitle || 'Target Role',
          jobDescription,
          masterProfile: masterProfileText,
          style: selectedStyle,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate answer');
      }

      setGeneratedAnswerResult({
        question: q,
        answer: data.answer,
        key_points: data.key_points || [],
        keywords: data.keywords || [],
        category: data.category || 'General',
        word_count: data.word_count || data.answer.split(/\s+/).length,
      });
    } catch (err: any) {
      console.error('Answer generation error:', err);
      setGenerationError(err.message || 'Failed to generate answer. Please try again.');
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  // Run Behavioral Interview Grading
  const handleGradeBehavioralAnswer = async () => {
    if (!practiceAnswerInput.trim()) return;

    setIsGradingPractice(true);
    try {
      const response = await fetch('/api/behavioral-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: practiceQuestion,
          candidateAnswer: practiceAnswerInput,
          jobTitle: jobTitle || 'Target Role',
          companyName: companyName || 'Target Employer',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPracticeResult(data);
      }
    } catch (err) {
      console.error('Error grading practice answer:', err);
    } finally {
      setIsGradingPractice(false);
    }
  };

  // Run Offer Negotiation Generation
  const handleGenerateNegotiation = async () => {
    setIsGeneratingOfferPrep(true);
    try {
      const response = await fetch('/api/negotiate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: `${candidateInfo.first_name} ${candidateInfo.last_name}`.trim() || 'Candidate',
          companyName: companyName || 'Target Employer',
          jobTitle: jobTitle || 'Target Role',
          offeredBase,
          targetBase,
          benefitsSummary: benefitsInput,
          competingOffer: competingOfferInput,
          leveragePoints: leverageInput,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOfferPrepResult(data);
      }
    } catch (err) {
      console.error('Error generating negotiation:', err);
    } finally {
      setIsGeneratingOfferPrep(false);
    }
  };

  const PRESET_ATS_QUESTIONS = [
    {
      icon: '⚡',
      label: 'Operational Failure Mitigation',
      question: 'Describe a time you mitigated a major operational failure or critical incident under pressure.',
    },
    {
      icon: '🏢',
      label: 'Why This Company?',
      question: `Why are you interested in joining ${companyName || 'our company'} and this specific role?`,
    },
    {
      icon: '⚙️',
      label: 'Process Automation & Efficiency',
      question: 'Tell us about a manual or inefficient process you automated or redesigned to save time or costs.',
    },
    {
      icon: '🤝',
      label: 'Stakeholder Conflict Resolution',
      question: 'Describe a situation where you had a disagreement with a team or stakeholder. How did you handle it?',
    },
    {
      icon: '🏆',
      label: 'Proudest Achievement',
      question: 'What is your proudest career achievement or the project you are most proud of delivering?',
    },
    {
      icon: '💰',
      label: 'Salary & Notice Availability',
      question: 'What are your compensation expectations and what is your earliest available start date?',
    },
  ];

  const portalCount = interviewQuestions.filter((q) => q.isFromPortal || q.category === 'Portal Reported').length;
  const filteredQuestions = interviewQuestions.filter((q) => {
    if (filterCategory === 'portal') return q.isFromPortal || q.category === 'Portal Reported';
    if (filterCategory === 'technical')
      return q.category.toLowerCase().includes('technical') || q.category.toLowerCase().includes('operational');
    if (filterCategory === 'behavioral')
      return (
        q.category.toLowerCase().includes('behavioral') ||
        q.category.toLowerCase().includes('star') ||
        q.category.toLowerCase().includes('situational')
      );
    return true;
  });


  return (
    <div className="workspace-screening space-y-6 max-w-5xl mx-auto">
      {/* Top Banner with Direct Application Link */}
      <div
        className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-elevated"
      >
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-brand/10 text-brand text-[11px] font-bold rounded-md px-2.5 py-0.5 uppercase tracking-wider font-mono border border-brand/20 shadow-2xs">
              INTERVIEW COPILOT
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              ATS &amp; Interview
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Tailored for <strong className="text-foreground">{jobTitle || 'Target Role'}</strong> at{' '}
            <strong className="text-foreground">{companyName || 'your target opportunity'}</strong> · Grounded in your Master Profile
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (typeof window !== 'undefined' && typeof window.open === 'function') {
                  try {
                    window.open(applyUrl, '_blank');
                  } catch (_) {}
                }
                onApplyClick?.(applyUrl);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors cursor-pointer whitespace-nowrap justify-center shadow-xs"
              title={`Open official job portal for ${companyName || 'this role'} in a new tab`}
            >
              <span>Apply now</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary-foreground/80" />
            </a>
          )}

          {Boolean(jobTitle && onTrackApplication) && (
            <button
              onClick={onTrackApplication}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap justify-center ${
                isTracked
                  ? 'bg-success/10 text-success hover:bg-success/20 border border-success/30'
                  : 'text-foreground bg-surface hover:bg-surface-2 border border-border'
              }`}
              title={isTracked ? 'Click to untrack and remove from applied jobs' : 'Mark as applied and track application'}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isTracked ? 'text-success' : 'text-subtle'}`} />
              <span>{isTracked ? 'Tracked as Applied' : 'Mark as Applied'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: IMMEDIATE / APPLICATION STAGE                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 font-mono">
              STAGE 1 · APPLICATION STAGE
            </span>
            <span className="text-xs text-subtle font-medium">
              Tools needed right now while submitting your job application
            </span>
          </div>
        </div>

        {/* Stage 1 Sub-Navigation Tabs */}
        <div className="workspace-section-tabs flex items-center border-b border-border gap-2 sm:gap-4 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setStage1Tab('screening')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
              stage1Tab === 'screening'
                ? 'border-brand text-brand'
                : 'border-transparent text-subtle hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Screening Question Answers</span>
          </button>

          <button
            type="button"
            onClick={() => setStage1Tab('company_packs')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
              stage1Tab === 'company_packs'
                ? 'border-brand text-brand'
                : 'border-transparent text-subtle hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Focus Guidance</span>
          </button>
        </div>

        {/* Stage 1 Content: Screening Question Answers */}
        {stage1Tab === 'screening' && (
          <div className="space-y-6 pt-1">
          {/* Quick-Copy Applicant Details Grid */}
          <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-7 space-y-5 shadow-elevated">
            <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-brand/10 text-brand text-[11px] font-bold rounded-md px-2.5 py-0.5 uppercase tracking-wider font-mono border border-brand/20">
                  QUICK AUTOFILL
                </span>
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                  Standard Portal Application Fields
                </h3>
              </div>
              <span className="text-xs text-subtle">Click any field to copy into form</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                onClick={() => copyField('name', `${candidateInfo.first_name} ${candidateInfo.last_name}`)}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">Full Name</div>
                  <div className="text-xs font-semibold text-foreground">{candidateInfo.first_name} {candidateInfo.last_name}</div>
                </div>
                {copiedField === 'name' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>

              <div
                onClick={() => copyField('email', candidateInfo.email)}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">Email Address</div>
                  <div className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                    {candidateInfo.email}
                  </div>
                </div>
                {copiedField === 'email' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>

              <div
                onClick={() => copyField('phone', candidateInfo.phone)}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">Phone Number</div>
                  <div className="text-xs font-semibold text-foreground">{candidateInfo.phone}</div>
                </div>
                {copiedField === 'phone' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>

              <div
                onClick={() => copyField('location', candidateInfo.location)}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">Current Location</div>
                  <div className="text-xs font-semibold text-foreground">{candidateInfo.location}</div>
                </div>
                {copiedField === 'location' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>

              <div
                onClick={() => copyField('linkedin', candidateInfo.linkedin)}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">LinkedIn URL</div>
                  <div className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                    {candidateInfo.linkedin}
                  </div>
                </div>
                {copiedField === 'linkedin' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>

              <div
                onClick={() => copyField('work_auth', 'Authorized to work (India / Remote / Global)')}
                className="p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-subtle font-mono uppercase">Work Authorization</div>
                  <div className="text-xs font-semibold text-foreground">Authorized to work (India / Remote)</div>
                </div>
                {copiedField === 'work_auth' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-subtle group-hover:text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* ATS Custom Question Generator */}
          <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-7 space-y-5 shadow-elevated">
            <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-brand/10 text-brand text-[11px] font-semibold rounded-md px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 border border-brand/25">
                    <Sparkles className="w-3 h-3 text-brand" />
                    ATS PORTAL ASSISTANT
                  </span>
                  <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                    Custom Application Question Answerer
                  </h3>
                </div>
                <p className="text-xs text-subtle">
                  Paste any custom question from Greenhouse, Lever, Ashby, or Workday to generate a tailored, ATS-ready answer.
                </p>
              </div>

              {/* Style Selector */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-full text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedStyle('star')}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    selectedStyle === 'star' ? 'bg-card text-foreground shadow-xs' : 'text-subtle hover:text-foreground'
                  }`}
                >
                  STAR Method
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStyle('concise')}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    selectedStyle === 'concise'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-subtle hover:text-foreground'
                  }`}
                >
                  Concise (100w)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStyle('executive')}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    selectedStyle === 'executive'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-subtle hover:text-foreground'
                  }`}
                >
                  Executive
                </button>
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Enter Portal Question (or pick a preset below):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateAnswer()}
                  placeholder='e.g., "Describe a time you handled a critical system outage under high pressure"'
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAnswer()}
                  disabled={isGeneratingAnswer || !customQuestionInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 shadow-sm shrink-0 cursor-pointer"
                >
                  {isGeneratingAnswer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                  <LoadingProgress inline active={isGeneratingAnswer} label="Generating" idleLabel="Generate Answer" expectedSeconds={30} resultToken={generatedAnswerResult} />
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                Common Portal Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_ATS_QUESTIONS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setCustomQuestionInput(preset.question);
                      handleGenerateAnswer(preset.question);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface border border-border/60 text-xs text-muted-foreground transition-colors cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span className="font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Answer Display */}
            {generatedAnswerResult && (
              <div className="p-5 rounded-2xl bg-brand/10/40 border border-brand/25 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand/25 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand/10 text-brand">
                        {generatedAnswerResult.category}
                      </span>
                      <span className="text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                        ✓ Grounded in Master Profile
                      </span>
                      <span className="text-[11px] font-mono text-subtle">
                        {generatedAnswerResult.word_count} words
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{generatedAnswerResult.question}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyAnswerText(generatedAnswerResult.answer)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer shadow-sm"
                    >
                      {isCopiedGenerated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>

                    {onAddScreeningAnswer && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddScreeningAnswer({
                            question: generatedAnswerResult.question,
                            suggested_answer: generatedAnswerResult.answer,
                            category: generatedAnswerResult.category,
                            keywords: generatedAnswerResult.keywords,
                            key_points: generatedAnswerResult.key_points,
                            word_count: generatedAnswerResult.word_count,
                          });
                          setIsSavedToForm(true);
                          setTimeout(() => setIsSavedToForm(false), 2500);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                          isSavedToForm
                            ? 'bg-success/10 text-success'
                            : 'bg-surface text-muted-foreground hover:bg-surface-2'
                        }`}
                      >
                        {isSavedToForm ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" />
                            <span>Saved to List</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save to List</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line shadow-xs">
                  {generatedAnswerResult.answer}
                </div>

                {generatedAnswerResult.keywords && generatedAnswerResult.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider mr-1">
                      ATS Keywords:
                    </span>
                    {generatedAnswerResult.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/10 text-brand font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screening Form Answers List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-surface text-muted-foreground text-[11px] font-semibold rounded-md px-2 py-0.5 uppercase tracking-wider">
                  SAVED RESPONSES
                </span>
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                  Application Screening Form Answers ({screeningAnswers.length})
                </h3>
              </div>
              <span className="text-xs text-subtle">1-click copy into application form</span>
            </div>

            {screeningAnswers.map((item, idx) => (
              <div
                key={idx}
                className="bg-card rounded-2xl border border-border/80 p-5 space-y-3 shadow-sm relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-display text-sm sm:text-base font-semibold text-foreground">
                        {item.question}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] font-mono text-brand bg-brand/10 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold border border-brand/25">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyAnswer(idx, item.suggested_answer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-surface hover:bg-surface-2 rounded-full transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-subtle" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>

                    {onRemoveScreeningAnswer && (
                      <button
                        type="button"
                        onClick={() => onRemoveScreeningAnswer(idx)}
                        className="p-1.5 rounded-full text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Remove answer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-foreground bg-surface border border-border rounded-xl p-4 leading-relaxed whitespace-pre-line">
                  {item.suggested_answer}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Stage 1 Content: Company Focus Guidance */}
        {stage1Tab === 'company_packs' && (
          <div className="pt-1">
            <CompanyFocusPacks
              companyName={companyName}
              jobTitle={jobTitle}
              jobDescription={jobDescription}
              masterProfileText={masterProfileText}
              applyUrl={applyUrl}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STAGE 2: LATE STAGE / INTERVIEW CALL STAGE (EXPANDABLE MODULE)            */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-surface/90 p-6 sm:p-7 space-y-5 shadow-elevated" data-testid="round-2-module">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-info/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20 font-mono">
                STAGE 2 · LATE STAGE
              </span>
              <span className="text-xs text-subtle font-medium">
                Interview Call Stage
              </span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-xl text-foreground tracking-tight">
              Round 2 &amp; Offer Prep
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Behavioral STAR mock interview scoring and salary negotiation battlecards. Kept distinct so first-round applicants aren't overwhelmed by salary tactics before submitting their resume.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRound2Expanded((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-2 border border-border text-foreground transition-all cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
          >
            <span>{isRound2Expanded ? 'Collapse Round 2 & Offer Prep' : 'Expand Round 2 & Offer Prep'}</span>
            {isRound2Expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsed State Guidance Note */}
        {!isRound2Expanded && (
          <div className="p-3.5 rounded-xl bg-surface/70 border border-border/80 text-xs text-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info shrink-0" />
              <span>First-round applicant? Focus on Stage 1 above. Expand this module when scheduling your interview or negotiating an offer.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRound2Expanded(true)}
              className="text-xs font-semibold text-brand hover:underline self-start sm:self-auto cursor-pointer"
            >
              Open Late-Stage Tools →
            </button>
          </div>
        )}

        {/* Expanded State Content */}
        {isRound2Expanded && (
          <div className="pt-4 border-t border-border space-y-6">
            {/* Stage 2 Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStage2Tab('behavioral')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  stage2Tab === 'behavioral'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Behavioral STAR Mock Interview Coach</span>
                {!isProUser && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-info/20 text-info">
                    PRO
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStage2Tab('negotiation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  stage2Tab === 'negotiation'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Salary Negotiation Battlecards</span>
                {!isProUser && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-info/20 text-info">
                    PRO
                  </span>
                )}
              </button>
            </div>

            {/* Behavioral STAR Mock Interview Coach */}
            {stage2Tab === 'behavioral' && (
        <div className="space-y-6">
          <LoadingProgress active={isFetchingInterviewPrep} label="Preparing interview questions" expectedSeconds={40} resultToken={interviewQuestions} />
          <div className="bg-card rounded-2xl border border-border/80 p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-info/10 text-info text-[11px] font-semibold rounded-md px-2 py-0.5 uppercase tracking-wider border border-info/25 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-info" />
                    AI STAR INTERVIEW COACH
                  </span>
                  <h3 className="font-display font-bold text-base text-foreground">
                    Behavioral Practice &amp; AI STAR Scoring
                  </h3>
                </div>
                <p className="text-xs text-subtle mt-0.5">
                  Type or paste your draft practice answer to any interview question. The AI Bar Raiser grades your answer across 4 STAR dimensions and generates a rewritten Gold Standard version.
                </p>
              </div>
            </div>

            {/* Question Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Target Interview Question:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  'Describe a relevant challenge, your actions, and what you learned.',
                  'Tell me about a time you had a serious disagreement with a stakeholder. How did you resolve it?',
                  'Describe a situation where you had to prioritize competing high-severity deadlines.',
                  'Give an example of work you improved and explain the outcome.',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPracticeQuestion(q)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer text-left ${
                      practiceQuestion === q
                        ? 'bg-info/10 text-info border-info/25 font-semibold'
                        : 'bg-surface text-muted-foreground border-border/60 hover:bg-surface'
                    }`}
                  >
                    {q.slice(0, 55)}...
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={practiceQuestion}
                onChange={(e) => setPracticeQuestion(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-info/25"
              />
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Your Draft Practice Response:</span>
                <span className="text-[11px] text-subtle font-normal">
                  Write freely — include your situation, actions, and any numbers you recall
                </span>
              </label>
              <textarea
                rows={5}
                value={practiceAnswerInput}
                onChange={(e) => setPracticeAnswerInput(e.target.value)}
                placeholder="Describe a real situation, your own actions, and the outcome. Include numbers only if you can verify them."
                className="w-full p-4 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-info/25 transition-all font-sans leading-relaxed"
              />
            </div>

            <button
              onClick={handleGradeBehavioralAnswer}
              disabled={isGradingPractice || !practiceAnswerInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-info hover:bg-info text-primary-foreground font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGradingPractice ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
              <LoadingProgress inline active={isGradingPractice} label="Grading answer" idleLabel="Grade Answer & Generate Gold Standard Rewrite" expectedSeconds={30} resultToken={practiceResult} />
            </button>

            {/* Results Display */}
            {practiceResult && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-surface/50 via-white to-surface/40 border border-info/25/80 space-y-6">
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-info/25 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-info uppercase tracking-wider">
                      EVALUATION VERDICT
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      Overall STAR Readiness Score:{' '}
                      <span className="text-info font-mono text-xl">
                        {practiceResult.overall_score}/100
                      </span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="font-bold text-foreground">{practiceResult.situation_task_score}/25</div>
                      <div className="text-[10px] text-subtle uppercase">Situation/Task</div>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="font-bold text-foreground">{practiceResult.action_ownership_score}/25</div>
                      <div className="text-[10px] text-subtle uppercase">Action/Ownership</div>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="font-bold text-foreground">{practiceResult.results_metrics_score}/25</div>
                      <div className="text-[10px] text-subtle uppercase">Results/Metrics</div>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="font-bold text-foreground">{practiceResult.delivery_polish_score}/25</div>
                      <div className="text-[10px] text-subtle uppercase">Executive Polish</div>
                    </div>
                  </div>
                </div>

                {/* Feedback Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">Situation &amp; Task Context:</span>
                    <p className="text-muted-foreground">{practiceResult.situation_task_feedback}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">Action &amp; Personal Ownership:</span>
                    <p className="text-muted-foreground">{practiceResult.action_ownership_feedback}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">Results &amp; Measurable Metrics:</span>
                    <p className="text-muted-foreground">{practiceResult.results_metrics_feedback}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">Delivery Polish &amp; Presence:</span>
                    <p className="text-muted-foreground">{practiceResult.delivery_polish_feedback}</p>
                  </div>
                </div>

                {/* Gold Standard Rewrite */}
                <div className="space-y-3 pt-2 border-t border-info/25">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-warning" />
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Gold Standard Model Rewrite (STAR Masterclass)
                      </h5>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(practiceResult.gold_standard_answer);
                        setCopiedGoldStandard(true);
                        setTimeout(() => setCopiedGoldStandard(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-info text-primary-foreground text-xs font-semibold hover:bg-info transition-colors shadow-xs"
                    >
                      {copiedGoldStandard ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Model Story</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-info/25 shadow-xs text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {practiceResult.gold_standard_answer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {/* Salary Negotiation Battlecards */}
            {stage2Tab === 'negotiation' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/80 p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-brand/10 text-brand text-[11px] font-semibold rounded-md px-2 py-0.5 uppercase tracking-wider border border-brand/20 flex items-center gap-1 font-mono">
                    <DollarSign className="w-3 h-3 text-brand" />
                    OFFER &amp; COMPENSATION COPILOT
                  </span>
                  <h3 className="font-display font-bold text-base text-foreground">
                    Strategic Salary Counter &amp; Negotiation Prep
                  </h3>
                </div>
                <p className="text-xs text-subtle mt-0.5">
                  Never leave money on the table. Generate polite, diplomatic counter-offer emails, word-for-word recruiter phone scripts, and objection battlecards.
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Initial Offered Base Salary:</label>
                <input
                  type="text"
                  value={offeredBase}
                  onChange={(e) => setOfferedBase(e.target.value)}
                  placeholder="e.g. $95,000"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Target Counter Base Salary:</label>
                <input
                  type="text"
                  value={targetBase}
                  onChange={(e) => setTargetBase(e.target.value)}
                  placeholder="e.g. $115,000"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Offered Benefits &amp; Equity (Optional):
                </label>
                <input
                  type="text"
                  value={benefitsInput}
                  onChange={(e) => setBenefitsInput(e.target.value)}
                  placeholder="e.g. Standard health, 15 days PTO, 401(k) match, 2,000 stock options"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Key Leverage Points / Unique Value:
                  </label>
                  {masterProfileText && (
                    <button
                      type="button"
                      onClick={() => { leverageEditedRef.current = false; setLeverageInput(deriveLeveragePoints(masterProfileText)); }}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                    >
                      Use my profile
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={leverageInput}
                  onChange={(e) => { leverageEditedRef.current = true; setLeverageInput(e.target.value); }}
                  placeholder="Your strongest achievements, certifications, or results from your Master Profile"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateNegotiation}
              disabled={isGeneratingOfferPrep}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingOfferPrep ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                </>
              )}
              <LoadingProgress inline active={isGeneratingOfferPrep} label="Preparing negotiation" idleLabel="Generate Counter Email & Phone Battlecards" expectedSeconds={40} resultToken={offerPrepResult} />
            </button>

            {/* Negotiation Output */}
            {offerPrepResult && (
              <div className="space-y-6 pt-2">
                {/* Market Benchmark Insight */}
                <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 text-xs text-foreground flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-foreground">Market Benchmark Context:</span>
                    <span className="text-muted-foreground">{offerPrepResult.market_benchmark_insight}</span>
                  </div>
                </div>

                {/* Counter Offer Email Draft */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand" />
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Diplomatic Counter-Offer Email
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offerPrepResult.counter_offer_email);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied Email!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-mono">
                    {offerPrepResult.counter_offer_email}
                  </div>
                </div>

                {/* Live Phone Call Talking Script */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-brand" />
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Live Phone Call Speaking Script &amp; Talking Track
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offerPrepResult.phone_script);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-muted-foreground text-xs font-semibold hover:bg-surface-2 transition-colors"
                    >
                      {copiedScript ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>Copied Script!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {offerPrepResult.phone_script}
                  </div>
                </div>

                {/* Recruiter Objection Battlecards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    Recruiter Objection Battlecards ({offerPrepResult.objection_handlers.length})
                  </h4>

                  <div className="space-y-3">
                    {offerPrepResult.objection_handlers.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs"
                      >
                        <div className="text-xs font-bold text-danger flex items-center gap-1.5">
                          <span>Objection:</span>
                          <span className="italic">"{item.objection}"</span>
                        </div>
                        <div className="text-xs text-foreground bg-surface p-2.5 rounded-lg border border-border">
                          <strong className="text-foreground block mb-0.5">Your Response:</strong>
                          "{item.response}"
                        </div>
                        <div className="text-[11px] text-brand bg-brand/10 p-2 rounded-lg border border-brand/25">
                          <strong>Pivot Strategy:</strong> {item.backup_tactic}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
          </div>
        )}
      </div>
    </div>
  );
};
