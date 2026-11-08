// @ts-nocheck -- ported verbatim from the original project
import { LoadingProgress } from './LoadingProgress';
import { BusyIndicator } from './BusyIndicator';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Building2,
  MapPin,
  ExternalLink,
  RefreshCw,
  Search,
  Globe,
  Compass,
  Filter,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Milestone,
  Trash2,
  Zap,
  FileText,
  Link2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Plus,
  X,
  RotateCcw,
  ArrowLeft,
  MoreHorizontal,
  Share2,
  Copy,
  Check,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ClipboardCheck,
  XCircle,
} from 'lucide-react';
import { AllFiltersModal, FilterState } from './AllFiltersModal';
import { evaluateHardConstraints, HardConstraintReport } from '../utils/hardConstraints';
import { detectGhostJobSignal, GhostSignal } from '../utils/ghostJobDetector';
import { generateAtsApplicationDossier, getSavedScreeningAnswers } from '../utils/screeningAnswerBank';
import {
  JobEvaluationData,
  JobOpportunity,
  PRESET_JOBS,
  ATSJobListing,
  ATSCompanyEntry,
  SeniorityFilter,
  WorkplaceFilter,
  TailoredResumeData,
  CoverLetterData,
  InterviewPrepQuestion,
  MASTER_BASE_RESUME,
  EMPTY_COVER_LETTER,
} from '../data/defaultData';
import { buildProfileTerms, scoreJobAgainstProfile, PROFILE_MATCH_THRESHOLD, quickFitTier } from '../utils/profileMatch';
import { extractProfileSearchContext } from '../utils/profileSearchContext';


interface JobEvaluatorViewProps {
  evaluation: JobEvaluationData;
  isEvaluationComplete?: boolean;
  opportunities?: JobOpportunity[];
  onAddOpportunities?: (newJobs: JobOpportunity[]) => void;
  onSelectPreset: (jobId: string, jobOverride?: any) => void;
  selectedJobId: string;
  customJobText: string;
  setCustomJobText: (val: string) => void;
  customUrl: string;
  setCustomUrl: (val: string) => void;
  onEvaluate: (jobTextOverride?: string) => void;
  isLoading: boolean;
  onProceedToResume: () => void;
  onResetWorkspace?: () => void;
  onRemoveOpportunity?: (jobId: string) => void;
  onClearOpportunities?: () => void;
  onTrackApplication?: (job: { company_name: string; job_title: string; location?: string; platform?: string; apply_url?: string; match_score?: number }) => void;
  onApplyClick?: (applyUrl: string) => void;
  isTracked?: boolean;
  isProUser?: boolean;
  tailoredCount?: number;
  onNavigateToPricing?: () => void;
  onOpenRecruiterReview?: () => void;
  masterProfileText?: string;
  onOpenTab?: (tab: string) => void;
  resume?: TailoredResumeData;
  setResume?: React.Dispatch<React.SetStateAction<TailoredResumeData>>;
  coverLetter?: CoverLetterData;
  interviewQuestions?: InterviewPrepQuestion[];
  onFetchInterviewPrep?: () => void;
  isFetchingInterviewPrep?: boolean;
}

export const JobEvaluatorView: React.FC<JobEvaluatorViewProps> = ({
  evaluation,
  isEvaluationComplete: evaluationFinished = false,
  opportunities = [],
  onAddOpportunities,
  masterProfileText = '',
  onSelectPreset,
  selectedJobId,
  customJobText,
  setCustomJobText,
  customUrl,
  setCustomUrl,
  onEvaluate,
  isLoading,
  onProceedToResume,
  onResetWorkspace,
  onRemoveOpportunity,
  onClearOpportunities,
  onTrackApplication,
  onApplyClick,
  isTracked = false,
  isProUser = false,
  tailoredCount = 0,
  onNavigateToPricing,
  onOpenRecruiterReview,
  onOpenTab,
  resume: propResume,
  setResume: propSetResume,
  coverLetter: propCoverLetter,
  interviewQuestions: propInterviewQuestions,
  onFetchInterviewPrep,
  isFetchingInterviewPrep = false,
}) => {
  // Results appear only after the whole Tailor Application run (assessment + materials) finishes.
  const isEvaluationComplete = evaluationFinished && !isLoading;
  const isRoleActive = Boolean(selectedJobId || evaluation.job_title);

  const activeOpportunity =
    opportunities.find((j) => j.id === selectedJobId) ||
    PRESET_JOBS.find((j) => j.id === selectedJobId) ||
    opportunities.find(
      (j) =>
        Boolean(evaluation.company_name) &&
        Boolean(evaluation.job_title) &&
        j.company?.toLowerCase() === evaluation.company_name.toLowerCase() &&
        j.title?.toLowerCase() === evaluation.job_title.toLowerCase()
    );

  const effectiveApplyUrl =
    (activeOpportunity?.applyUrl && activeOpportunity.applyUrl.startsWith('http')
      ? activeOpportunity.applyUrl
      : '') ||
    (customUrl && customUrl.startsWith('http') ? customUrl : '') ||
    (evaluation.company_name
      ? `https://www.google.com/search?q=${encodeURIComponent(
          `${evaluation.company_name} ${evaluation.job_title || ''} careers apply`
        )}`
      : '');

  const [localResume, setLocalResume] = useState<TailoredResumeData>(() => MASTER_BASE_RESUME);

  const activeResume = propResume || localResume;
  const activeSetResume = propSetResume || setLocalResume;
  const activeCoverLetter = propCoverLetter || EMPTY_COVER_LETTER;
  const activeInterviewQuestions = propInterviewQuestions || [];
  const [searchExpanded, setSearchExpanded] = useState<boolean>(false);
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState<boolean>(false);
  const [isCustomJdOpen, setIsCustomJdOpen] = useState<boolean>(() => Boolean(customJobText.trim() || customUrl.trim()));
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeNotification, setScrapeNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [feedTab, setFeedTab] = useState<'live' | 'saved'>(() => opportunities.length > 0 ? 'saved' : 'live');
  const [activeDossierTab, setActiveDossierTab] = useState<'breakdown' | 'committee'>('breakdown');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);

  // Tailor a new role from scratch: reset drafts, return cleanly to evaluator discovery
  const handleTailorNewRole = () => {
    setSearchExpanded(true);
    setIsCustomJdOpen(false);
    setCustomJobText('');
    setCustomUrl('');
    onSelectPreset('');
    onResetWorkspace?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start fresh: reset current application draft back to Master Profile
  const handleStartFresh = () => {
    onSelectPreset('');
    setCustomJobText('');
    setCustomUrl('');
    setIsCustomJdOpen(false);
    if (onResetWorkspace) {
      onResetWorkspace();
    } else if (onClearOpportunities) {
      onClearOpportunities();
    }
    setSearchExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live opportunity verification & filtering
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [isVerifyingListing, setIsVerifyingListing] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const platforms = [
    'All',
    'SmartRecruiters',
    'Greenhouse',
    'Lever',
    'Ashby',
    'LinkedIn',
    'UltiPro',
    'Oracle Cloud HCM',
    'Workable',
  ];

  // Direct ATS Crawler State (Zero-Scrape unauthenticated APIs) - On-demand only (no auto-refresh on mount)
  const [showAtsFeed, setShowAtsFeed] = useState<boolean>(true);
  const [atsCompanies] = useState<ATSCompanyEntry[]>([
    { name: '🌐 All Companies (Unified Live Feed)', slug: 'all', ats: 'greenhouse', category: 'Aggregated Live Feed' },
    // AI Leaders
    { name: 'Anthropic', slug: 'anthropic', ats: 'ashby', category: 'Frontier AI & LLMs' },
    { name: 'OpenAI', slug: 'openai', ats: 'ashby', category: 'Generative AI Research' },
    { name: 'Scale AI', slug: 'scaleai', ats: 'greenhouse', category: 'AI Data Infrastructure' },
    { name: 'Perplexity', slug: 'perplexity', ats: 'ashby', category: 'AI Search & Knowledge' },
    { name: 'Cohere', slug: 'cohere', ats: 'ashby', category: 'Enterprise AI Platforms' },
    { name: 'Palantir', slug: 'palantir', ats: 'lever', category: 'Enterprise AI & Data Ops' },
    // Fintech & Global Banking
    { name: 'Stripe', slug: 'stripe', ats: 'greenhouse', category: 'Fintech Infrastructure' },
    { name: 'Revolut', slug: 'revolut', ats: 'lever', category: 'Global Fintech & Digital Banking' },
    { name: 'Brex', slug: 'brex', ats: 'greenhouse', category: 'Fintech & Spend Operations' },
    { name: 'Ramp', slug: 'ramp', ats: 'ashby', category: 'Finance Automation' },
    { name: 'Plaid', slug: 'plaid', ats: 'ashby', category: 'Fintech Data Network' },
    { name: 'Coinbase', slug: 'coinbase', ats: 'greenhouse', category: 'Crypto & Financial Ops' },
    { name: 'Robinhood', slug: 'robinhood', ats: 'greenhouse', category: 'Fintech & Brokerage' },
    { name: 'Wise', slug: 'Wise', ats: 'smartrecruiters', category: 'Cross-Border Payments' },
    { name: 'Klarna', slug: 'Klarna', ats: 'smartrecruiters', category: 'Fintech & Payments' },
    { name: 'Monzo', slug: 'monzo', ats: 'greenhouse', category: 'Digital Banking' },
    // Product & Productivity
    { name: 'Figma', slug: 'figma', ats: 'greenhouse', category: 'Product & Design Systems' },
    { name: 'Linear', slug: 'linear', ats: 'ashby', category: 'Productivity & AI Tools' },
    { name: 'Notion', slug: 'notion', ats: 'ashby', category: 'Connected Workspace' },
    { name: 'Canva', slug: 'canva', ats: 'greenhouse', category: 'Creative & Visual Platform' },
    { name: 'Automattic', slug: 'automattic', ats: 'greenhouse', category: 'Distributed Remote Ops' },
    // Dev Tools & Infrastructure
    { name: 'Vercel', slug: 'vercel', ats: 'ashby', category: 'Cloud Frameworks & Edge' },
    { name: 'Supabase', slug: 'supabase', ats: 'ashby', category: 'Open Source Cloud DB' },
    { name: 'Retool', slug: 'retool', ats: 'greenhouse', category: 'Internal Systems & Ops Tools' },
    { name: 'Datadog', slug: 'datadog', ats: 'greenhouse', category: 'Cloud Observability' },
    { name: 'GitLab', slug: 'gitlab', ats: 'greenhouse', category: 'DevOps & Remote Ops' },
    { name: 'Cloudflare', slug: 'cloudflare', ats: 'greenhouse', category: 'Internet Security & CDN' },
    { name: 'Docker', slug: 'docker', ats: 'greenhouse', category: 'Containerization & Cloud' },
    { name: 'Postman', slug: 'postman', ats: 'greenhouse', category: 'API Platform' },
    { name: 'Zapier', slug: 'zapier', ats: 'lever', category: 'Workflow Automation' },
    // Global Remote & HR
    { name: 'Deel', slug: 'deel', ats: 'ashby', category: 'Global Payroll & Compliance' },
    { name: 'Remote.com', slug: 'remote', ats: 'greenhouse', category: 'Global Employment & HR' },
    { name: 'Gusto', slug: 'gusto', ats: 'greenhouse', category: 'Payroll & HR Tech' },
    { name: 'Rippling', slug: 'rippling', ats: 'greenhouse', category: 'Workforce Management' },
    // Consumer Tech & Scale
    { name: 'Airbnb', slug: 'airbnb', ats: 'greenhouse', category: 'Travel & Platform Ops' },
    { name: 'Spotify', slug: 'spotify', ats: 'lever', category: 'Audio Streaming & Tech' },
    { name: 'Reddit', slug: 'reddit', ats: 'greenhouse', category: 'Community & Media' },
    { name: 'DoorDash', slug: 'doordash', ats: 'greenhouse', category: 'Logistics & Marketplace' },
    { name: 'Uber', slug: 'uber', ats: 'greenhouse', category: 'Mobility & Operations' },
  ]);

  const profileSearchContext = useMemo(() => {
    return extractProfileSearchContext(activeResume, masterProfileText);
  }, [activeResume, masterProfileText]);

  const hasAutoCrawledUrlRef = useRef(false);

  const [selectedAtsCompany, setSelectedAtsCompany] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        return p.get('company') || p.get('co') || 'all';
      } catch { /* ignore */ }
    }
    return 'all';
  });
  const [atsCustomInput, setAtsCustomInput] = useState<string>('');
  const [atsKeyword, setAtsKeyword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        const k = p.get('keyword') || p.get('q');
        if (k) return k;
      } catch { /* ignore */ }
    }
    return profileSearchContext.targetRole || '';
  });
  const [selectedSeniority, setSelectedSeniority] = useState<SeniorityFilter>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        const s = p.get('seniority');
        if (s) return s as SeniorityFilter;
      } catch { /* ignore */ }
    }
    return 'All';
  });
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceFilter>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        const w = p.get('workplace');
        if (w) return w as WorkplaceFilter;
      } catch { /* ignore */ }
    }
    return 'All';
  });
  const [selectedAtsLocation, setSelectedAtsLocation] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        const l = p.get('location') || p.get('loc');
        if (l) return l;
      } catch { /* ignore */ }
    }
    return profileSearchContext.location || 'All';
  });

  const lastProfileRoleRef = useRef(profileSearchContext.targetRole);
  useEffect(() => {
    if (hasAutoCrawledUrlRef.current) return;
    if (profileSearchContext.targetRole && profileSearchContext.targetRole !== lastProfileRoleRef.current) {
      const prev = lastProfileRoleRef.current;
      lastProfileRoleRef.current = profileSearchContext.targetRole;
      if (!atsKeyword || atsKeyword === prev) {
        setAtsKeyword(profileSearchContext.targetRole);
      }
      if (profileSearchContext.location && (selectedAtsLocation === 'All' || selectedAtsLocation === '')) {
        setSelectedAtsLocation(profileSearchContext.location);
      }
    }
  }, [profileSearchContext.targetRole, profileSearchContext.location]);

  const searchRoleLabel = (atsKeyword || profileSearchContext.targetRole || '').trim()
    ? `${(atsKeyword || profileSearchContext.targetRole).trim()} roles`
    : selectedAtsCompany !== 'all' || atsCustomInput.trim()
      ? `roles at ${atsCustomInput.trim() || selectedAtsCompany}`
      : evaluation.job_title
        ? `${evaluation.job_title} roles`
        : 'roles';
  const searchSummaryText = `Searching ${searchRoleLabel}`;

  const roleInterviewQuestions = useMemo<InterviewPrepQuestion[]>(() => {
    if (activeInterviewQuestions && activeInterviewQuestions.length > 0) {
      return activeInterviewQuestions.slice(0, 3);
    }
    const role = evaluation.job_title || 'Specialist';
    const company = evaluation.company_name || 'the team';
    return [
      {
        question: `Tell me about a high-stakes technical or operational challenge you navigated under tight deadlines as a ${role}.`,
        category: 'Behavioral (STAR)',
        source: 'Glassdoor Verified Candidate Report',
        why_asked: `Assesses your composure under pressure, methodical root-cause isolation, and stakeholder communication when critical milestones are at risk.`,
        key_talking_points: [
          'Situation: Clarify the urgency, project scope, and what depended on timely delivery.',
          'Task: State your exact role and personal ownership versus cross-team dependencies.',
          'Action: Detail the systematic diagnostic steps, triage cadence, and trade-offs you led.',
          'Result: Share concrete impact: zero customer downtime, error rate drop, or accelerated delivery.',
        ],
        suggested_answer: `At my previous company, a high-priority customer launch encountered unexpected workflow regressions 48 hours before go-live. I immediately initiated an emergency triage call, isolated the offending data mapping anomaly, and coordinated an operational mitigation branch. We delivered the launch 4 hours ahead of schedule with zero data discrepancies.`,
      },
      {
        question: `How do you structure and maintain high quality and scalability when building workflows for ${company}?`,
        category: 'Technical & Operational',
        source: 'Role Competency Benchmark',
        why_asked: `Evaluates whether you apply engineering and operational discipline rather than ad-hoc shortcuts when scaling solutions.`,
        key_talking_points: [
          'Situation: Outline an architecture or workflow that needed scalability or quality guardrails.',
          'Task: The benchmark (e.g. latency, throughput, error reduction) required.',
          'Action: Automated checks, modular architecture, and telemetry dashboards you instituted.',
          'Result: Quantifiable improvements in reliability, onboarding speed, or maintenance overhead.',
        ],
        suggested_answer: `I adhere to a modular, contract-first design methodology. When refactoring our primary data pipeline, I established automated schema verification tests and structured alerting. This decreased production incident tickets by 38% and cut pull request turnaround times from 2 days to under 4 hours.`,
      },
      {
        question: `Why ${company}, and what allows you to make an immediate, measurable impact in this ${role} role?`,
        category: 'Situational Case',
        source: 'Hiring Committee Screen',
        why_asked: `Tests candidate motivation, company research, and readiness to deliver value in the first 30-60-90 days without prolonged ramp-up.`,
        key_talking_points: [
          `Context: Reference ${company}'s operational scale, product trajectory, and standards.`,
          'Connection: Connect 2-3 specific skills from your master profile directly to this role.',
          'Trajectory: Your 30-60 day plan to audit existing workflows, ship early wins, and partner effectively.',
        ],
        suggested_answer: `${company}'s focus on speed and product excellence matches how I operate. My background directly aligns with the technical and domain requirements of this role, enabling me to deliver immediate impact on your key milestones from month one.`,
      },
    ];
  }, [activeInterviewQuestions, evaluation.job_title, evaluation.company_name]);

  const [isCrawlingAts, setIsCrawlingAts] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreAtsJobs, setHasMoreAtsJobs] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return new URLSearchParams(window.location.search).get('dept') || 'All';
      } catch { /* ignore */ }
    }
    return 'All';
  });
  const [atsJobs, setAtsJobs] = useState<ATSJobListing[]>([]);
  const [totalInCatalogue, setTotalInCatalogue] = useState<number>(7135839);
  const [atsFeedback, setAtsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAllRoles, setShowAllRoles] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return new URLSearchParams(window.location.search).get('view') === 'all';
      } catch { /* ignore */ }
    }
    return false;
  });
  const [importedAtsIds, setImportedAtsIds] = useState<Map<string, string>>(new Map());
  const [importingCount, setImportingCount] = useState(0);

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [isDirectCopied, setIsDirectCopied] = useState<boolean>(false);
  const [isListCopied, setIsListCopied] = useState<boolean>(false);
  const [isDossierCopied, setIsDossierCopied] = useState<boolean>(false);

  // Freehire 55+ ATS & Multi-Filter States
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    sources: [],
    sourceType: 'all',
    specializations: [],
    seniority: 'All',
    minExperienceYears: 0,
    peopleManagerOnly: false,
    includeNoLevelStated: true,
    includeNoExperienceStated: true,
    applyLimitOnlyNoLevel: false,
    workplace: 'All',
    employmentType: 'all',
    location: 'All',
    postedWithin: 'all',
    industries: [],
    companyTypes: [],
    collections: [],
    skills: [],
    minSalary: undefined,
    benefits: [],
    languages: [],
    relocation: [],
    strictness: 'any',
  });

  const activeFiltersBadgeCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.specializations?.length > 0) count += advancedFilters.specializations.length;
    if (advancedFilters.minExperienceYears !== undefined && advancedFilters.minExperienceYears > 0) count += 1;
    if (advancedFilters.peopleManagerOnly) count += 1;
    if (advancedFilters.industries?.length > 0) count += advancedFilters.industries.length;
    if (advancedFilters.companyTypes?.length > 0) count += advancedFilters.companyTypes.length;
    if (advancedFilters.collections?.length > 0) count += advancedFilters.collections.length;
    if (advancedFilters.skills?.length > 0) count += advancedFilters.skills.length;
    if (advancedFilters.postedWithin && advancedFilters.postedWithin !== 'all') count += 1;
    if (advancedFilters.employmentType && advancedFilters.employmentType !== 'all') count += 1;
    if (advancedFilters.minSalary) count += 1;
    if (advancedFilters.benefits?.length > 0) count += advancedFilters.benefits.length;
    if (advancedFilters.languages?.length > 0) count += advancedFilters.languages.length;
    if (advancedFilters.relocation?.length > 0) count += advancedFilters.relocation.length;
    if (selectedSeniority !== 'All') count += 1;
    if (selectedWorkplace !== 'All') count += 1;
    if (selectedAtsLocation !== 'All') count += 1;
    return count;
  }, [advancedFilters, selectedSeniority, selectedWorkplace, selectedAtsLocation]);

  const handleCrawlAts = async (
    companyInputOverride?: string,
    seniorityOverride?: SeniorityFilter,
    workplaceOverride?: WorkplaceFilter,
    locationOverride?: string,
    keywordOverride?: string,
    isLoadMore: boolean = false,
    filtersOverride?: Partial<FilterState>
  ) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsCrawlingAts(true);
      setAtsFeedback(null);
    }

    const targetCompany = companyInputOverride !== undefined ? companyInputOverride : (atsCustomInput.trim() || selectedAtsCompany);
    if (companyInputOverride !== undefined) {
      setSelectedAtsCompany(companyInputOverride);
    }
    const currentSeniority = seniorityOverride || selectedSeniority;
    const currentWorkplace = workplaceOverride || selectedWorkplace;
    const currentLocation = locationOverride !== undefined ? locationOverride : (selectedAtsLocation || profileSearchContext.location || 'All');
    const currentKeyword = keywordOverride !== undefined ? keywordOverride : (atsKeyword || profileSearchContext.targetRole);

    const mergedFilters = { ...advancedFilters, ...filtersOverride };
    const sourcesToSend = mergedFilters.sources && mergedFilters.sources.length > 0 ? mergedFilters.sources : undefined;

    try {
      const res = await fetch('/api/ats/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: targetCompany,
          keyword: currentKeyword,
          seniority: currentSeniority,
          workplaceType: currentWorkplace,
          location: currentLocation,
          limit: 400,
          offset: isLoadMore ? atsJobs.length : 0,
          profileContext: profileSearchContext,
          sources: sourcesToSend,
          sourceType: mergedFilters.sourceType !== 'all' ? mergedFilters.sourceType : undefined,
          category: mergedFilters.specializations?.length ? mergedFilters.specializations.join(',') : undefined,
          domain: mergedFilters.industries?.length ? mergedFilters.industries.join(',') : undefined,
          collection: mergedFilters.collections?.length ? mergedFilters.collections.join(',') : undefined,
          benefits: mergedFilters.benefits?.length ? mergedFilters.benefits.join(',') : undefined,
          languages: mergedFilters.languages?.length ? mergedFilters.languages.join(',') : undefined,
          relocation: mergedFilters.relocation?.length ? mergedFilters.relocation.join(',') : undefined,
          minSalary: mergedFilters.minSalary,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to crawl ATS board.');
      }

      if (data.totalAvailableInCatalogue) {
        setTotalInCatalogue(data.totalAvailableInCatalogue);
      }

      let incomingJobs: ATSJobListing[] = data.jobs || [];

      // Load full descriptions for the top candidate roles so fit labels reflect the whole posting.
      const terms = buildProfileTerms(masterProfileText);
      if (terms.size > 0) {
        const candidates = incomingJobs
          .filter((j) => j.slug && (j.rawDescription || '').length < 1500)
          .map((j) => ({ slug: j.slug as string, score: scoreJobAgainstProfile(j, terms) }))
          .filter((c) => c.score >= 30)
          .sort((a, b) => b.score - a.score)
          .slice(0, 30);
        if (candidates.length > 0) {
          try {
            const detailRes = await fetch('/api/ats/details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slugs: candidates.map((c) => c.slug) }),
            });
            const detail = await detailRes.json();
            const descriptions: Record<string, string> = detail?.descriptions || {};
            incomingJobs = incomingJobs.map((j) =>
              j.slug && descriptions[j.slug] && descriptions[j.slug].length > (j.rawDescription || '').length
                ? { ...j, rawDescription: descriptions[j.slug] }
                : j
            );
          } catch (detailErr) {
            console.warn('Full description load skipped:', detailErr);
          }
        }
      }

      let freshCount = incomingJobs.length;
      if (isLoadMore) {
        setAtsJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const fresh = incomingJobs.filter((j) => !existingIds.has(j.id));
          freshCount = fresh.length;
          return [...prev, ...fresh];
        });
      } else {
        setAtsJobs(incomingJobs);
      }

      // Track if there are genuinely more jobs to load
      if (targetCompany !== 'all') {
        // Single-company ATS endpoints return all open roles on their official board in one request.
        setHasMoreAtsJobs(false);
      } else {
        // Unified multi-company feed: has more only if fresh jobs arrived and batch was large
        setHasMoreAtsJobs(freshCount > 0 && incomingJobs.length >= 20);
      }

      // Never show misleading or inflated banners claiming "Fetched 400 active roles".
      // Only set feedback if 0 jobs were returned to guide the user.
      if (incomingJobs.length === 0) {
        setAtsFeedback({
          type: 'error',
          message: `No active positions currently found on ${data.company || targetCompany}'s board matching your filters.`,
        });
      } else {
        setAtsFeedback(null);
      }
    } catch (err: any) {
      console.error('ATS crawl error:', err);
      setAtsFeedback({
        type: 'error',
        message: err.message || 'Failed to query ATS board. Please check company slug or link.',
      });
    } finally {
      setIsCrawlingAts(false);
      setIsLoadingMore(false);
    }
  };

  const handleApplyAllFilters = (newFilters: FilterState) => {
    setAdvancedFilters(newFilters);
    if (newFilters.seniority && newFilters.seniority !== 'All') {
      setSelectedSeniority(newFilters.seniority as SeniorityFilter);
    }
    if (newFilters.workplace && newFilters.workplace !== 'All') {
      setSelectedWorkplace(newFilters.workplace as WorkplaceFilter);
    }
    if (newFilters.location && newFilters.location !== 'All') {
      setSelectedAtsLocation(newFilters.location);
    }
    handleCrawlAts(
      undefined,
      newFilters.seniority as SeniorityFilter,
      newFilters.workplace as WorkplaceFilter,
      newFilters.location,
      undefined,
      false,
      newFilters
    );
  };

  const handleResetAllFilters = () => {
    setSelectedSeniority('All');
    setSelectedWorkplace('All');
    setSelectedAtsLocation('All');
    setSelectedDepartment('All');
    setAtsKeyword('');
    const emptyFilters: FilterState = {
      sources: [],
      sourceType: 'all',
      specializations: [],
      seniority: 'All',
      minExperienceYears: 0,
      peopleManagerOnly: false,
      includeNoLevelStated: true,
      includeNoExperienceStated: true,
      applyLimitOnlyNoLevel: false,
      workplace: 'All',
      employmentType: 'all',
      location: 'All',
      postedWithin: 'all',
      industries: [],
      companyTypes: [],
      collections: [],
      skills: [],
      minSalary: undefined,
      benefits: [],
      languages: [],
      relocation: [],
      strictness: 'any',
    };
    setAdvancedFilters(emptyFilters);
    handleCrawlAts(undefined, 'All', 'All', 'All', '', false, emptyFilters);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || hasAutoCrawledUrlRef.current) return;
    try {
      const p = new URLSearchParams(window.location.search);
      const hasSearch = p.has('keyword') || p.has('q') || p.has('location') || p.has('company') || p.has('share');
      if (hasSearch) {
        hasAutoCrawledUrlRef.current = true;
        const k = p.get('keyword') || p.get('q') || atsKeyword;
        const l = p.get('location') || p.get('loc') || selectedAtsLocation;
        const c = p.get('company') || p.get('co') || selectedAtsCompany;
        const s = (p.get('seniority') as SeniorityFilter) || selectedSeniority;
        const w = (p.get('workplace') as WorkplaceFilter) || selectedWorkplace;
        handleCrawlAts(c, s, w, l, k);
      }
    } catch { /* ignore */ }
  }, []);

  const buildShareUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('tab', 'evaluator');
      if (atsKeyword.trim()) {
        url.searchParams.set('keyword', atsKeyword.trim());
      }
      if (selectedAtsLocation && selectedAtsLocation !== 'All') {
        url.searchParams.set('location', selectedAtsLocation);
      }
      if (selectedAtsCompany && selectedAtsCompany !== 'all') {
        url.searchParams.set('company', selectedAtsCompany);
      }
      if (selectedSeniority && selectedSeniority !== 'All') {
        url.searchParams.set('seniority', selectedSeniority);
      }
      if (selectedWorkplace && selectedWorkplace !== 'All') {
        url.searchParams.set('workplace', selectedWorkplace);
      }
      if (selectedDepartment && selectedDepartment !== 'All') {
        url.searchParams.set('dept', selectedDepartment);
      }
      if (showAllRoles) {
        url.searchParams.set('view', 'all');
      }
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const getFormattedRolesList = () => {
    const url = buildShareUrl();
    const locationText = selectedAtsLocation && selectedAtsLocation !== 'All' ? ` in ${selectedAtsLocation}` : '';
    const header = `🎯 Live Roles on JobStudio (${filteredAtsJobs.length} positions)\nSearch: ${searchRoleLabel}${locationText}\n`;
    const items = filteredAtsJobs.slice(0, 25).map((job, index) => {
      const loc = job.location ? ` | ${job.location}` : '';
      const wp = job.workplaceType ? ` (${job.workplaceType})` : '';
      const link = job.applyUrl ? `\n   Apply: ${job.applyUrl}` : '';
      return `${index + 1}. ${job.title} — ${job.company}${loc}${wp}${link}`;
    }).join('\n\n');
    const footer = `\n\nExplore and evaluate match score on JobStudio:\n${url}`;
    return `${header}\n${items}${footer}`;
  };

  const handleCopyShareUrl = async () => {
    const url = buildShareUrl();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  const handleDirectCopyShareLink = async () => {
    const url = buildShareUrl();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setIsDirectCopied(true);
        setTimeout(() => setIsDirectCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Failed to direct copy link:', err);
      setIsShareModalOpen(true);
    }
  };

  const handleCopyRolesList = async () => {
    const text = getFormattedRolesList();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setIsListCopied(true);
        setTimeout(() => setIsListCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Failed to copy roles list:', err);
    }
  };

  const handleNativeShare = async () => {
    const url = buildShareUrl();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Live Roles for ${searchRoleLabel} on JobStudio`,
          text: `Found ${filteredAtsJobs.length} live openings for ${searchRoleLabel}${selectedAtsLocation !== 'All' ? ` in ${selectedAtsLocation}` : ''} on JobStudio:`,
          url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyShareUrl();
        }
      }
    } else {
      handleCopyShareUrl();
    }
  };

  const hardConstraintReport = useMemo(() => {
    if (!masterProfileText) return null;
    const jdText =
      (activeOpportunity as any)?.rawDescription ||
      (activeOpportunity as any)?.description ||
      evaluation.job_description ||
      customJobText ||
      '';
    if (!jdText || jdText.length < 20) return null;
    return evaluateHardConstraints(masterProfileText, jdText, profileSearchContext);
  }, [masterProfileText, activeOpportunity, evaluation.job_description, customJobText, profileSearchContext]);

  const handleCopyAtsDossier = () => {
    const answers = getSavedScreeningAnswers();
    const dossierText = generateAtsApplicationDossier(answers, {
      candidateName: (candidateProfileContext as any)?.fullName || profileSearchContext?.targetRole ? undefined : undefined,
      email: (candidateProfileContext as any)?.email,
      phone: (candidateProfileContext as any)?.phone,
      linkedin: (candidateProfileContext as any)?.linkedin,
    });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(dossierText).then(() => {
        setIsDossierCopied(true);
        setTimeout(() => setIsDossierCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const [isDiscoveringWeb, setIsDiscoveringWeb] = useState<boolean>(false);

  const handleDiscoverLiveWebJobs = async () => {
    setIsDiscoveringWeb(true);
    setAtsFeedback(null);
    try {
      const loc = selectedAtsLocation !== 'All' ? selectedAtsLocation : (profileSearchContext.location || 'India');
      const role = atsKeyword.trim() || profileSearchContext.targetRole || 'Specialized Professional';
      const res = await fetch('/api/discover-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: loc,
          roles: [role],
          masterProfile: masterProfileText,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
        const newAtsJobs: ATSJobListing[] = data.opportunities.map((o: any, idx: number) => ({
          id: o.id || `discovered-${Date.now()}-${idx}`,
          title: o.title,
          company: o.company,
          location: o.location,
          department: o.category || 'Specialized Practice',
          platform: o.platform || 'Hospital Career Portal',
          applyUrl: o.applyUrl,
          publishedAt: o.verifiedAt || new Date().toISOString(),
          descriptionSnippet: (o.description || '').slice(0, 300),
          rawDescription: o.description,
          isRemote: Boolean(o.location && o.location.toLowerCase().includes('remote')),
          workplaceType: 'On-site',
          seniority: 'Mid-Level',
          matchScore: typeof o.matchScore === 'number' && o.matchScore > 0 ? o.matchScore : 82,
          matchHighlight: o.matchHighlight || 'High relevance to candidate experience.',
          verifiedLive: o.verifiedLive ?? true,
          verifiedAt: o.verifiedAt || new Date().toISOString(),
        }));

        if (onAddOpportunities) {
          onAddOpportunities(data.opportunities);
        }
        setAtsJobs((prev) => {
          const ids = new Set(prev.map((j) => j.id));
          const unique = newAtsJobs.filter((j) => !ids.has(j.id));
          return [...unique, ...prev];
        });
        setShowAllRoles(false);
      }
    } catch (err: any) {
      console.warn('Manual web discovery failed:', err);
    } finally {
      setIsDiscoveringWeb(false);
    }
  };

  // Instant reactive client-side filter
  const profileTerms = useMemo(() => buildProfileTerms(masterProfileText), [masterProfileText]);
  const hasProfile = profileTerms.size > 0;

  const baseFilteredAtsJobs = useMemo(() => {
    return atsJobs.filter((job) => {
      // 1. Seniority filter
      if (selectedSeniority !== 'All' && job.seniority !== selectedSeniority) {
        return false;
      }
      // 2. Workplace filter
      if (selectedWorkplace !== 'All') {
        const combined = `${job.location || ''} ${job.title || ''}`.toLowerCase();
        if (selectedWorkplace === 'Remote') {
          if (!job.isRemote && job.workplaceType !== 'Remote' && !combined.includes('remote') && !combined.includes('anywhere') && !combined.includes('wfh')) {
            return false;
          }
        } else if (selectedWorkplace === 'Hybrid') {
          if (job.workplaceType !== 'Hybrid' && !combined.includes('hybrid')) {
            return false;
          }
        } else if (selectedWorkplace === 'On-site') {
          if (job.workplaceType !== 'On-site' && (job.isRemote || combined.includes('remote'))) {
            return false;
          }
        }
      }
      // 3. Location filter
      if (selectedAtsLocation !== 'All') {
        const lq = selectedAtsLocation.toLowerCase();
        const loc = (job.location || '').toLowerCase();
        const titleLoc = (job.title || '').toLowerCase();
        const combined = `${loc} ${titleLoc}`;

        if (lq === 'remote') {
          if (!job.isRemote && job.workplaceType !== 'Remote' && !combined.includes('remote') && !combined.includes('anywhere')) {
            return false;
          }
        } else if (lq.includes('india')) {
          const isIndia =
            combined.includes('india') ||
            combined.includes('bengaluru') ||
            combined.includes('bangalore') ||
            combined.includes('hyderabad') ||
            combined.includes('mumbai') ||
            combined.includes('delhi') ||
            combined.includes('gurgaon') ||
            combined.includes('gurugram') ||
            combined.includes('noida') ||
            combined.includes('kochi') ||
            combined.includes('pune') ||
            combined.includes('chennai') ||
            combined.includes('kolkata') ||
            combined.includes('ahmedabad');
          if (!isIndia) return false;
        } else if (lq.includes('united states') || lq === 'us') {
          const isUS =
            combined.includes('united states') ||
            combined.includes('usa') ||
            combined.includes('san francisco') ||
            combined.includes('new york') ||
            combined.includes('seattle') ||
            combined.includes('austin') ||
            combined.includes('california') ||
            combined.includes('texas') ||
            combined.includes('boston') ||
            combined.includes('chicago');
          if (!isUS) return false;
        } else if (lq.includes('uae') || lq.includes('emirates') || lq.includes('dubai') || lq.includes('abu dhabi')) {
          const isUae =
            combined.includes('uae') ||
            combined.includes('united arab emirates') ||
            combined.includes('dubai') ||
            combined.includes('abu dhabi') ||
            combined.includes('sharjah') ||
            combined.includes('ajman');
          if (!isUae) return false;
        } else if (lq.includes('canada')) {
          const isCa =
            combined.includes('canada') ||
            combined.includes('toronto') ||
            combined.includes('vancouver') ||
            combined.includes('montreal') ||
            combined.includes('calgary') ||
            combined.includes('alberta') ||
            combined.includes('ontario') ||
            combined.includes('quebec') ||
            combined.includes('british columbia');
          if (!isCa) return false;
        } else if (lq.includes('australia')) {
          const isAu =
            combined.includes('australia') ||
            combined.includes('sydney') ||
            combined.includes('melbourne') ||
            combined.includes('brisbane') ||
            combined.includes('perth') ||
            combined.includes('adelaide');
          if (!isAu) return false;
        } else if (lq.includes('new zealand')) {
          const isNz =
            combined.includes('new zealand') ||
            combined.includes('auckland') ||
            combined.includes('wellington') ||
            combined.includes('christchurch');
          if (!isNz) return false;
        } else if (lq.includes('singapore')) {
          if (!combined.includes('singapore')) return false;
        } else if (lq.includes('germany') || lq.includes('deutschland')) {
          const isDe =
            combined.includes('germany') ||
            combined.includes('deutschland') ||
            combined.includes('berlin') ||
            combined.includes('munich') ||
            combined.includes('frankfurt') ||
            combined.includes('hamburg');
          if (!isDe) return false;
        } else if (lq.includes('netherlands') || lq.includes('holland')) {
          const isNl =
            combined.includes('netherlands') ||
            combined.includes('amsterdam') ||
            combined.includes('rotterdam') ||
            combined.includes('utrecht');
          if (!isNl) return false;
        } else if (lq.includes('switzerland')) {
          const isCh =
            combined.includes('switzerland') ||
            combined.includes('zurich') ||
            combined.includes('geneva') ||
            combined.includes('basel');
          if (!isCh) return false;
        } else if (lq.includes('ireland')) {
          const isIe =
            combined.includes('ireland') ||
            combined.includes('dublin') ||
            combined.includes('cork') ||
            combined.includes('galway');
          if (!isIe) return false;
        } else if (lq.includes('qatar')) {
          const isQa =
            combined.includes('qatar') ||
            combined.includes('doha') ||
            combined.includes('al rayyan');
          if (!isQa) return false;
        } else if (lq.includes('kuwait')) {
          const isKw =
            combined.includes('kuwait') ||
            combined.includes('kuwait city') ||
            combined.includes('ahmadi');
          if (!isKw) return false;
        } else if (lq.includes('saudi')) {
          const isSa =
            combined.includes('saudi') ||
            combined.includes('riyadh') ||
            combined.includes('jeddah') ||
            combined.includes('dammam');
          if (!isSa) return false;
        } else if (lq.includes('europe') || lq.includes('uk') || lq.includes('united kingdom')) {
          const isEuUk =
            combined.includes('europe') ||
            combined.includes('london') ||
            combined.includes('uk') ||
            combined.includes('united kingdom') ||
            combined.includes('dublin') ||
            combined.includes('ireland') ||
            combined.includes('germany') ||
            combined.includes('berlin') ||
            combined.includes('france') ||
            combined.includes('paris') ||
            combined.includes('amsterdam') ||
            combined.includes('netherlands') ||
            combined.includes('poland') ||
            combined.includes('krakow') ||
            combined.includes('spain');
          if (!isEuUk) return false;
        } else {
          if (!combined.includes(lq)) return false;
        }
      }
      // 4. Keyword search (tokenized):
      // When exploring "All Open Roles" or broad profile matching, show the full catalog unless user typed an ad-hoc query.
      // In "Best Matches", profileTerms scoring evaluates the candidate's actual qualifications against the entire catalog.
      if (atsKeyword.trim()) {
        const isDefaultProfileRole = hasProfile && (
          atsKeyword.toLowerCase().trim() === (profileSearchContext.targetRole || '').toLowerCase().trim() ||
          (profileSearchContext.targetRole && (profileSearchContext.targetRole.toLowerCase().includes(atsKeyword.toLowerCase().trim()) || atsKeyword.toLowerCase().trim().includes(profileSearchContext.targetRole.toLowerCase())))
        );
        if (!isDefaultProfileRole) {
          const q = atsKeyword.toLowerCase().trim();
          const cleanQ = q.replace(/[–—/|•\-]/g, ' ').replace(/\s+/g, ' ').trim();
          const text = `${job.title} ${job.company} ${job.department || ''} ${job.descriptionSnippet || ''}`.toLowerCase();
          const tokens = cleanQ.split(/\s+/).filter((t) => t.length > 2);
          const matches =
            text.includes(q) ||
            (cleanQ && text.includes(cleanQ)) ||
            (tokens.length > 0 && tokens.some((t) => text.includes(t)));
          if (!matches) return false;
        }
      }
      // 5. Discipline / Department filter
      if (selectedDepartment !== 'All') {
        const text = `${job.title || ''} ${job.department || ''}`.toLowerCase();
        if (selectedDepartment === 'Engineering') {
          if (!/software|engineer|developer|frontend|backend|full\s*stack|devops|infrastructure|sre|platform|architect|systems|mobile|ios|android|cloud/i.test(text)) return false;
        } else if (selectedDepartment === 'Trades') {
          if (!/plumb|electric|carpenter|welder|hvac|mechanic|mason|painter|pipefitter|machinist|construction|roofer|handyman|technician|fitter|fabricator|foreman|site supervisor/i.test(text)) return false;
        } else if (selectedDepartment === 'Logistics') {
          if (!/truck|driver|transport|freight|logistics|warehouse|forklift|courier|dispatch|fleet|delivery|cdl|shipping|receiving|material handler/i.test(text)) return false;
        } else if (selectedDepartment === 'Hospitality') {
          if (!/chef|cook|hotel|hospitality|barista|waiter|steward|housekeeping|restaurant|catering|retail|cashier|store|customer service|front desk|concierge|bartender|facilities/i.test(text)) return false;
        } else if (selectedDepartment === 'Product & Design') {
          if (!/product manager|product management|designer|design|ux|ui|\bpm\b|creative|art director/i.test(text)) return false;
        } else if (selectedDepartment === 'Operations & Strategy') {
          if (!/operations|operational|support|specialist|analyst|coordinator|program manager|project manager|bizops|strategy|supply chain|hr|finance|procurement/i.test(text)) return false;
        } else if (selectedDepartment === 'Data & AI') {
          if (!/data|\bai\b|machine learning|\bml\b|deep learning|researcher|scientist|analytics|prompt|llm/i.test(text)) return false;
        } else if (selectedDepartment === 'Sales & Growth') {
          if (!/sales|account|customer success|growth|marketing|bdr|sdr|revops|business development/i.test(text)) return false;
        } else if (selectedDepartment === 'Healthcare') {
          if (!/medical|laboratory|technologist|technician|hospital|clinic|clinical|nurse|nursing|phlebotomy|pathology|biochem|hematology|health|doctor|pharma|apheresis|caregiver/i.test(text)) return false;
        }
      }

      // Combined text for deep keyword matching
      const combinedJobText = `${job.title || ''} ${job.company || ''} ${job.department || ''} ${job.location || ''} ${job.descriptionSnippet || ''} ${job.rawDescription || ''} ${(job.skills || []).join(' ')}`.toLowerCase();

      // 6. Source Filter (from All Filters if applied)
      if (advancedFilters.sources.length > 0) {
        const plat = ((job as any).sourceId || job.platform || '').toLowerCase();
        const matchesSource = advancedFilters.sources.some((s) => plat.includes(s.toLowerCase()));
        if (!matchesSource) return false;
      }

      // 7. Specializations Filter (Role Specialization)
      if (advancedFilters.specializations && advancedFilters.specializations.length > 0) {
        const specMatches = advancedFilters.specializations.some((spec) => {
          const s = spec.toLowerCase().replace(/_/g, ' ');
          if (combinedJobText.includes(s)) return true;
          if (spec === 'software_engineering' && /software\s*engine|software\s*develop/i.test(combinedJobText)) return true;
          if (spec === 'backend' && /back\s*end|server\s*side|node|golang|python|java\s*engine/i.test(combinedJobText)) return true;
          if (spec === 'frontend' && /front\s*end|react|vue|angular|web\s*develop/i.test(combinedJobText)) return true;
          if (spec === 'fullstack' && /full\s*stack/i.test(combinedJobText)) return true;
          if (spec === 'mobile' && /ios|android|swift|kotlin|react\s*native|flutter|mobile/i.test(combinedJobText)) return true;
          if (spec === 'devops' && /devops|infra|sre|platform|cloud\s*engine|terraform|k8s|kubernetes/i.test(combinedJobText)) return true;
          if (spec === 'data_engineering' && /data\s*engine|etl|pipeline|spark|dbt|bigquery|snowflake/i.test(combinedJobText)) return true;
          if (spec === 'data_science' && /data\s*scien|machine\s*learn|statistician/i.test(combinedJobText)) return true;
          if (spec === 'product_manager' && /product\s*manag|group\s*pm|\bpm\b|technical\s*pm/i.test(combinedJobText)) return true;
          if (spec === 'technical_pm' && /technical\s*product\s*manag|technical\s*pm|\btpm\b/i.test(combinedJobText)) return true;
          if (spec === 'ai_pm' && /ai\s*product|machine\s*learning\s*product/i.test(combinedJobText)) return true;
          if (spec === 'growth_pm' && /growth\s*product|growth\s*pm/i.test(combinedJobText)) return true;
          if (spec === 'qa' && /qa|test|quality\s*assur|sdet|automation\s*test/i.test(combinedJobText)) return true;
          if (spec === 'security' && /security|infosec|cyber|soc\s*analyst|appsec/i.test(combinedJobText)) return true;
          return false;
        });
        if (!specMatches) return false;
      }

      // 8. Role Type / People Manager Filter
      if (advancedFilters.peopleManagerOnly) {
        const isManager = /manager|lead|director|head\s*of|vp\s*|vice\s*president|supervisor|chief/i.test(job.title || '');
        if (!isManager) return false;
      }

      // 9. Experience Years Filter
      if (advancedFilters.minExperienceYears && advancedFilters.minExperienceYears > 0) {
        const expMatch = combinedJobText.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s*(?:of\s*)?experience)?/i);
        if (expMatch) {
          const years = parseInt(expMatch[1], 10);
          if (years < advancedFilters.minExperienceYears) return false;
        } else if (!advancedFilters.includeNoExperienceStated) {
          return false;
        }
      }

      // 10. Employment Type Filter
      if (advancedFilters.employmentType && advancedFilters.employmentType !== 'all') {
        const emp = (job.employmentType || '').toLowerCase();
        const targetType = advancedFilters.employmentType.toLowerCase();
        if (targetType === 'full_time' && !/full[\s-]?time|permanent/i.test(emp + ' ' + combinedJobText)) return false;
        if (targetType === 'part_time' && !/part[\s-]?time/i.test(emp + ' ' + combinedJobText)) return false;
        if (targetType === 'contract' && !/contract|freelance|consultant|temp/i.test(emp + ' ' + combinedJobText)) return false;
        if (targetType === 'internship' && !/intern|apprentice/i.test(emp + ' ' + combinedJobText)) return false;
      }

      // 11. Industry Filter
      if (advancedFilters.industries && advancedFilters.industries.length > 0) {
        const matchesIndustry = advancedFilters.industries.some((ind) => {
          const indClean = ind.toLowerCase();
          if (combinedJobText.includes(indClean)) return true;
          if (indClean === 'fintech' && /fintech|bank|pay|crypto|trading|securities/i.test(combinedJobText)) return true;
          if (indClean === 'healthcare' && /health|clinic|hospital|med|biotech|pharma/i.test(combinedJobText)) return true;
          if (indClean === 'ecommerce' && /ecommerce|retail|store|cart|marketplace/i.test(combinedJobText)) return true;
          if (indClean === 'devtools' && /devtools|developer\s*tools|infra|cloud|saas/i.test(combinedJobText)) return true;
          if (indClean === 'cybersecurity' && /security|cyber|soc|threat/i.test(combinedJobText)) return true;
          if (indClean === 'ai' && /ai|machine\s*learning|llm|deep\s*learning/i.test(combinedJobText)) return true;
          return false;
        });
        if (!matchesIndustry) return false;
      }

      // 12. Company Type Filter
      if (advancedFilters.companyTypes && advancedFilters.companyTypes.length > 0) {
        const matchesCompanyType = advancedFilters.companyTypes.some((ct) => {
          const c = ct.toLowerCase();
          if (c === 'startup' && /startup|seed|series\s*[a-d]|early\s*stage/i.test(combinedJobText)) return true;
          if (c === 'product' && /product\s*company|saas|software\s*company/i.test(combinedJobText)) return true;
          if (c === 'agency' && /agency|consultancy|digital\s*agency/i.test(combinedJobText)) return true;
          if (c === 'government' && /government|public\s*sector|defense|ministry/i.test(combinedJobText)) return true;
          if (c === 'inhouse' && !/agency|outsource/i.test(combinedJobText)) return true;
          return false;
        });
        if (!matchesCompanyType) return false;
      }

      // 13. VC Collections Filter
      if (advancedFilters.collections && advancedFilters.collections.length > 0) {
        const matchesCol = advancedFilters.collections.some((col) => {
          const c = col.toLowerCase().replace(/_/g, ' ');
          if (c.includes('y combinator') && /y\s*combinator|yc/i.test(combinedJobText)) return true;
          if (c.includes('sequoia') && /sequoia/i.test(combinedJobText)) return true;
          if (c.includes('a16z') && /a16z|andreessen/i.test(combinedJobText)) return true;
          if (c.includes('techstars') && /techstars/i.test(combinedJobText)) return true;
          return combinedJobText.includes(c);
        });
        if (!matchesCol) return false;
      }

      // 14. Salary Minimum Filter
      if (advancedFilters.minSalary && advancedFilters.minSalary > 0) {
        if (job.salaryMax && job.salaryMax < advancedFilters.minSalary) return false;
        if (job.salaryMin && job.salaryMin < advancedFilters.minSalary && !job.salaryMax) return false;
      }

      // 15. Skills Filter
      if (advancedFilters.skills && advancedFilters.skills.length > 0) {
        const isStrict = advancedFilters.strictness === 'all';
        if (isStrict) {
          const matchesAllSkills = advancedFilters.skills.every((sk) => combinedJobText.includes(sk.toLowerCase()));
          if (!matchesAllSkills) return false;
        } else {
          const matchesAnySkill = advancedFilters.skills.some((sk) => combinedJobText.includes(sk.toLowerCase()));
          if (!matchesAnySkill) return false;
        }
      }

      // 16. Benefits & Perks Filter
      if (advancedFilters.benefits && advancedFilters.benefits.length > 0) {
        const checkBenefit = (bId: string) => {
          if (bId === 'health_insurance') return /health|medical|dental|vision|insurance/i.test(combinedJobText);
          if (bId === 'equity_stock') return /equity|stock|options|rsu|shares/i.test(combinedJobText);
          if (bId === 'retirement_401k') return /401\s*k|pension|retirement|match/i.test(combinedJobText);
          if (bId === 'parental_leave') return /parental|maternity|paternity|family\s*leave/i.test(combinedJobText);
          if (bId === 'flexible_hours') return /flexible\s*(?:hours|schedule)|core\s*hours/i.test(combinedJobText);
          if (bId === 'unlimited_pto') return /unlimited\s*(?:pto|vacation)|generous\s*(?:pto|vacation)|paid\s*time\s*off/i.test(combinedJobText);
          if (bId === 'remote_stipend') return /wfh\s*stipend|home\s*office|remote\s*stipend|equipment\s*budget/i.test(combinedJobText);
          if (bId === 'learning_budget') return /learning|education|tuition|conference|l&d/i.test(combinedJobText);
          if (bId === 'gym_wellness') return /gym|fitness|wellness|mental\s*health/i.test(combinedJobText);
          return false;
        };
        const isStrict = advancedFilters.strictness === 'all';
        if (isStrict) {
          const matchesAllBenefits = advancedFilters.benefits.every((b) => checkBenefit(b));
          if (!matchesAllBenefits) return false;
        } else {
          const matchesAnyBenefit = advancedFilters.benefits.some((b) => checkBenefit(b));
          if (!matchesAnyBenefit) return false;
        }
      }

      // 17. Language Filter
      if (advancedFilters.languages && advancedFilters.languages.length > 0) {
        const checkLanguage = (lId: string) => {
          if (lId === 'english') return /english|fluent\s*in\s*english/i.test(combinedJobText);
          if (lId === 'german') return /german|deutsch/i.test(combinedJobText);
          if (lId === 'french') return /french|français/i.test(combinedJobText);
          if (lId === 'spanish') return /spanish|español/i.test(combinedJobText);
          if (lId === 'japanese') return /japanese|日本語/i.test(combinedJobText);
          if (lId === 'arabic') return /arabic|العربية/i.test(combinedJobText);
          if (lId === 'mandarin') return /mandarin|chinese|中文/i.test(combinedJobText);
          if (lId === 'portuguese') return /portuguese|português/i.test(combinedJobText);
          if (lId === 'italian') return /italian|italiano/i.test(combinedJobText);
          if (lId === 'dutch') return /dutch|nederlands/i.test(combinedJobText);
          if (lId === 'swedish') return /swedish|svenska/i.test(combinedJobText);
          if (lId === 'polish') return /polish|polski/i.test(combinedJobText);
          if (lId === 'hindi') return /hindi|हिन्दी/i.test(combinedJobText);
          return false;
        };
        const isStrict = advancedFilters.strictness === 'all';
        if (isStrict) {
          const matchesAllLangs = advancedFilters.languages.every((l) => checkLanguage(l));
          if (!matchesAllLangs) return false;
        } else {
          const matchesAnyLang = advancedFilters.languages.some((l) => checkLanguage(l));
          if (!matchesAnyLang) return false;
        }
      }

      // 18. Relocation & Work Auth Filter
      if (advancedFilters.relocation && advancedFilters.relocation.length > 0) {
        const checkReloc = (rId: string) => {
          if (rId === 'relocation_assistance') return /relocation\s*(?:assistance|package|support|allowance)|flights|temporary\s*housing/i.test(combinedJobText);
          if (rId === 'visa_sponsorship') return /visa\s*sponsor|h-?1b|blue\s*card|sponsorship\s*available|work\s*permit\s*support/i.test(combinedJobText);
          if (rId === 'work_authorization') return /authorized\s*to\s*work|no\s*sponsorship|citizen|green\s*card|permanent\s*resident/i.test(combinedJobText);
          if (rId === 'worldwide_remote') return /anywhere|worldwide|global\s*remote|remote\s*worldwide|eor/i.test(combinedJobText);
          return false;
        };
        const isStrict = advancedFilters.strictness === 'all';
        if (isStrict) {
          const matchesAllReloc = advancedFilters.relocation.every((r) => checkReloc(r));
          if (!matchesAllReloc) return false;
        } else {
          const matchesAnyReloc = advancedFilters.relocation.some((r) => checkReloc(r));
          if (!matchesAnyReloc) return false;
        }
      }

      return true;
    });
  }, [atsJobs, selectedSeniority, selectedWorkplace, selectedAtsLocation, atsKeyword, selectedDepartment, advancedFilters]);

  // Score every fetched role against the Master Profile; by default show only matching roles, best first.
  const scoredAtsJobs = useMemo(
    () => baseFilteredAtsJobs.map((job) => (hasProfile ? { ...job, matchScore: scoreJobAgainstProfile(job, profileTerms) } : job)),
    [baseFilteredAtsJobs, profileTerms, hasProfile]
  );
  const profileMatchedJobs = useMemo(
    () => scoredAtsJobs.filter((j) => (j.matchScore || 0) >= PROFILE_MATCH_THRESHOLD).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)),
    [scoredAtsJobs]
  );
  const filteredAtsJobs = hasProfile && !showAllRoles ? profileMatchedJobs : scoredAtsJobs;
  const effectiveFeedTab = (opportunities.length === 0 && feedTab === 'saved') ? 'live' : feedTab;

  const uniqueCompaniesCount = useMemo(() => {
    const set = new Set<string>();
    filteredAtsJobs.forEach((j) => {
      if (j.company) set.add(j.company.toLowerCase().trim());
    });
    return set.size;
  }, [filteredAtsJobs]);

  const handleImportAtsJob = async (job: ATSJobListing, andSelect: boolean = false) => {
    setImportingCount(count => count + 1);
    try {
      const res = await fetch('/api/ats/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.opportunity) {
        throw new Error(data.error || 'Failed to import ATS job.');
      }
      if (onAddOpportunities) {
        onAddOpportunities([data.opportunity]);
      }
      setImportedAtsIds((prev) => new Map(prev).set(job.id, data.opportunity.id));
      onSelectPreset(data.opportunity.id, data.opportunity);
      setSearchExpanded(false);
      if (andSelect) {
        onProceedToResume();
      } else {
        // Jump to the newly added role in "Saved & Evaluated Roles" so its actions are visible.
        const targetId = data.opportunity.id;
        let tries = 0;
        const scrollToCard = () => {
          const el = document.querySelector(`[data-saved-job-id="${CSS.escape(targetId)}"]`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else if (tries++ < 20) setTimeout(scrollToCard, 100);
        };
        setTimeout(scrollToCard, 50);
      }
    } catch (err: any) {
      console.error('Import ATS job error:', err);
      alert('Failed to import job: ' + (err.message || 'Unknown error'));
    } finally {
      setImportingCount(count => Math.max(0, count - 1));
    }
  };

  // Handle URL scraping via Firecrawl or direct fetch
  const handleScrapeUrl = async () => {
    if (!customUrl.trim()) return;
    setIsScraping(true);
    setScrapeNotification(null);

    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch job content');
      }

      if (data.text) {
        setCustomJobText(data.text);
        setScrapeNotification({
          type: 'success',
          message: `Successfully extracted job description via ${data.source === 'firecrawl' ? 'Firecrawl' : 'direct web crawler'}!`,
        });
      }
    } catch (err: any) {
      setScrapeNotification({
        type: 'error',
        message: err.message || 'Could not auto-fetch page. Please copy-paste the JD below.',
      });
    } finally {
      setIsScraping(false);
    }
  };

  // Verify and confirm an active live listing from any hiring platform URL before displaying
  const handleVerifyLiveJob = async (inputUrl?: string) => {
    const targetUrl = (inputUrl || customUrl).trim();
    if (!targetUrl) return;

    setIsVerifyingListing(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch('/api/verify-and-import-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(
          data.error ||
            'Could not confirm an active live job listing at this URL. Unverified or closed listings cannot be displayed.'
        );
      }

      if (data.opportunity) {
        if (onAddOpportunities) {
          onAddOpportunities([data.opportunity]);
        }
        onSelectPreset(data.opportunity.id);
        setVerificationFeedback({
          type: 'success',
          message: `Confirmed active listing: "${data.opportunity.title}" at ${data.opportunity.company} (${data.opportunity.platform}). Full assessment pending.`,
        });
      }
    } catch (err: any) {
      setVerificationFeedback({
        type: 'error',
        message:
          err.message ||
          'Listing verification failed. Only confirmed live job postings from active hiring portals can be added.',
      });
    } finally {
      setIsVerifyingListing(false);
    }
  };

  // Filter opportunities based on platform
  const filteredOpportunities = opportunities.filter((job) => {
    const matchesPlatform =
      selectedPlatform === 'All' ||
      job.platform?.toLowerCase() === selectedPlatform.toLowerCase();
    return matchesPlatform;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-brand';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getGapsList = (evalData: JobEvaluationData): Array<{ missing: string; where_to_work: string; severity?: string }> => {
    // 1. Explicit structured gaps if available
    if (evalData.gaps && evalData.gaps.length > 0) {
      return evalData.gaps;
    }

    // 2. Parse from missing_critical_skills
    if (evalData.missing_critical_skills && evalData.missing_critical_skills.length > 0) {
      return evalData.missing_critical_skills.map((raw) => {
        if (raw.includes('— Where to work on:')) {
          const [missingPart, workPart] = raw.split('— Where to work on:');
          return {
            missing: missingPart.replace(/^Missing:\s*/i, '').trim(),
            where_to_work: workPart.trim(),
            severity: 'CRITICAL',
          };
        }
        if (raw.includes('(mitigated by')) {
          const parts = raw.split('(mitigated by');
          return {
            missing: parts[0].trim(),
            where_to_work: `Mitigate by: ${parts[1].replace(/\)$/, '').trim()}`,
            severity: 'MODERATE',
          };
        }
        const matchedRoadmap = evalData.skill_roadmap?.find((r) =>
          r.skill.toLowerCase().includes(raw.toLowerCase().slice(0, 15)) ||
          raw.toLowerCase().includes(r.skill.toLowerCase().slice(0, 15))
        );
        if (matchedRoadmap) {
          return {
            missing: raw,
            where_to_work: matchedRoadmap.action_plan,
            severity: matchedRoadmap.importance || 'RECOMMENDED',
          };
        }
        return {
          missing: raw,
          where_to_work: 'Review the requirements and identify relevant examples from your saved work history.',
          severity: 'RECOMMENDED',
        };
      });
    }

    // 3. Fallback to skill_roadmap if missing_critical_skills is empty
    if (evalData.skill_roadmap && evalData.skill_roadmap.length > 0) {
      return evalData.skill_roadmap.slice(0, 3).map((s) => ({
        missing: s.skill,
        where_to_work: s.action_plan,
        severity: s.importance || 'RECOMMENDED',
      }));
    }

    return [];
  };

  return (
    <div className="workspace-evaluator space-y-6 max-w-7xl mx-auto">
      {/* Landing-Inspired Showcase Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-8 shadow-elevated">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-widest uppercase font-mono border border-brand/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>ROLE DISCOVERY &amp; ATS INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              Job Evaluator
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discover opportunities and evaluate how well they match your experience.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium font-mono bg-surface/90 border border-border/80 text-foreground shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>{isProUser ? 'Pro plan · Unlimited tailoring' : `${2 - Math.min(tailoredCount, 2)} of 2 tailored resumes available`}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modern 2-Pane Master-Detail Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (lg:col-span-5): The Discovery Feed */}
        <div id="discovery-feed-pane" className="lg:col-span-5 space-y-4">
          {/* Stage 2B: Collapsed Discovery Summary Bar when a role is active */}
          {isRoleActive && !searchExpanded ? (
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{searchSummaryText}</p>
                    <p className="text-xs text-subtle truncate">
                      Search new roles across Greenhouse, Lever, Ashby, or custom URLs
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  className="text-xs font-semibold text-subtle hover:text-foreground shrink-0 px-3 py-1.5 rounded-xl border border-border hover:bg-surface transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/80 flex-wrap">
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-subtle hover:text-danger px-3 py-1.5 rounded-xl border border-border hover:bg-danger/10 transition-colors cursor-pointer"
                  title="Reset current tailored application draft back to your Master Profile"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Fresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleTailorNewRole}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs ml-auto"
                  title="Tailor a brand new role from scratch"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tailor New Role</span>
                </button>
              </div>
            </div>
          ) : (
            /* Stage 2A: Role Discovery Card (Search Mode) */
            <div className="workspace-discovery relative overflow-hidden p-6 sm:p-7 space-y-5 bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 rounded-3xl shadow-elevated">
              <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Role Discovery
                </h2>
                {isProUser ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success font-mono tracking-wider border border-success/30">
                    ★ PRO
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface text-subtle font-mono border border-border/70">
                    FREE PLAN
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Search live positions across official company boards or import any job listing URL.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {isRoleActive && (
                <>
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-subtle hover:text-danger border border-border hover:bg-danger/10 transition-colors cursor-pointer inline-flex items-center gap-1"
                    title="Reset current tailored application draft back to Master Profile"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Start Fresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchExpanded(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-subtle hover:text-foreground border border-border hover:bg-surface transition-colors cursor-pointer"
                  >
                    ✕ Back to active role
                  </button>
                </>
              )}
              <span className="text-[11px] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live feed connected
              </span>
            </div>
          </div>

          {/* Profile Focus Active Indicator */}
          {profileSearchContext.targetRole && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-brand/5 border border-brand/20 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="text-foreground">
                  Profile Focus: <strong className="text-brand font-semibold">{profileSearchContext.targetRole}</strong>
                </span>
                {profileSearchContext.domain && (
                  <span className="text-subtle font-normal">· {profileSearchContext.domain}</span>
                )}
                {profileSearchContext.location && (
                  <span className="text-subtle font-normal">· {profileSearchContext.location}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscoverLiveWebJobs}
                  disabled={isDiscoveringWeb}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDiscoveringWeb ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Searching Web...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3" />
                      <span>Discover Live Roles via Web Search</span>
                    </>
                  )}
                </button>
                {atsKeyword !== profileSearchContext.targetRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setAtsKeyword(profileSearchContext.targetRole);
                      handleCrawlAts(undefined, undefined, undefined, undefined, profileSearchContext.targetRole);
                    }}
                    className="text-[11px] text-muted-foreground hover:underline cursor-pointer"
                  >
                    Reset to {profileSearchContext.targetRole}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Default Search Form: Company or URL & Title or Keyword */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-5 relative">
              <Building2 className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={atsCustomInput}
                onChange={(e) => setAtsCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCrawlAts();
                  }
                }}
                placeholder="Company or URL (e.g. Figma, Stripe, Ashby link)"
                className="w-full pl-9 pr-3 py-2.5 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={atsKeyword}
                onChange={(e) => setAtsKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCrawlAts();
                  }
                }}
                placeholder={profileSearchContext.targetRole ? `Search ${profileSearchContext.targetRole} roles...` : "Title or keyword, e.g. Product Designer"}
                className="w-full pl-9 pr-3 py-2.5 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                type="button"
                data-tour="evaluator-search"
                onClick={() => handleCrawlAts()}
                disabled={isCrawlingAts}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-elevated"
              >
                {isCrawlingAts ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying ATS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Fetch Live Roles</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Refinement Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
            <div className="flex items-center gap-1.5 text-subtle font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-brand" />
              <span>Filter By:</span>
            </div>

            {/* All Filters Deep Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsAllFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-brand border border-primary/30 font-medium rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
              <span className="font-semibold">All Filters</span>
              {activeFiltersBadgeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {activeFiltersBadgeCount}
                </span>
              )}
            </button>

            {/* Seniority */}
            <div className="relative shrink-0">
              <select
                value={selectedSeniority}
                onChange={(e) => setSelectedSeniority(e.target.value as SeniorityFilter)}
                className="appearance-none pl-3 pr-7 py-1.5 bg-surface hover:bg-surface-2 text-foreground font-medium rounded-xl text-xs outline-none cursor-pointer border border-transparent focus:border-brand transition-all"
              >
                <option value="All">All Experience Levels</option>
                <option value="Early / Junior">🌱 Early / Junior (0-2 yrs)</option>
                <option value="Mid-Level">⚡ Mid-Level (2-5 yrs)</option>
                <option value="Senior">⭐ Senior (5-8 yrs)</option>
                <option value="Lead / Staff / Director">👑 Lead / Staff / Director (8+ yrs)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-subtle">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Workplace Mode */}
            <div className="relative shrink-0">
              <select
                value={selectedWorkplace}
                onChange={(e) => {
                  const newWorkplace = e.target.value as WorkplaceFilter;
                  setSelectedWorkplace(newWorkplace);
                }}
                className="appearance-none pl-3 pr-7 py-1.5 bg-surface hover:bg-surface-2 text-foreground font-medium rounded-xl text-xs outline-none cursor-pointer border border-transparent focus:border-brand transition-all"
              >
                <option value="All">All Workplace Modes</option>
                <option value="Remote">🌐 Remote Only</option>
                <option value="Hybrid">🏢 Hybrid</option>
                <option value="On-site">📍 On-site Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-subtle">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Location */}
            <div className="relative shrink-0">
              <select
                value={selectedAtsLocation}
                onChange={(e) => {
                  const newLoc = e.target.value;
                  setSelectedAtsLocation(newLoc);
                }}
                className="appearance-none pl-3 pr-7 py-1.5 bg-surface hover:bg-surface-2 text-foreground font-medium rounded-xl text-xs outline-none cursor-pointer border border-transparent focus:border-brand transition-all"
              >
                <option value="All">All Locations (Worldwide)</option>
                <option value="Remote">🌍 Global Remote</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="India">🇮🇳 India</option>
                <option value="Ireland">🇮🇪 Ireland</option>
                <option value="Kuwait">🇰🇼 Kuwait</option>
                <option value="Netherlands">🇳🇱 Netherlands</option>
                <option value="New Zealand">🇳🇿 New Zealand</option>
                <option value="Qatar">🇶🇦 Qatar</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="Switzerland">🇨🇭 Switzerland</option>
                <option value="UAE">🇦🇪 United Arab Emirates (UAE)</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="Europe">🇪🇺 Europe (All)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-subtle">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Reset Filters Shortcut */}
            {(activeFiltersBadgeCount > 0 || atsKeyword.trim()) && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-[11px] font-semibold text-brand hover:text-brand px-2.5 py-1 rounded-lg hover:bg-brand/10 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Subtle Accordion Toggles for Edge-Case Tools */}
          <div className="space-y-2 pt-1">
            {/* Accordion 1: Custom JD Paste Box & URL Extractor */}
            <details
              id="custom-jd-accordion"
              open={isCustomJdOpen}
              onToggle={(e) => setIsCustomJdOpen(e.currentTarget.open)}
              className="workspace-accordion-toggle"
            >
              <summary className="cursor-pointer font-medium text-xs text-subtle hover:text-foreground flex items-center justify-between py-2 px-3.5 rounded-xl bg-surface/70 hover:bg-surface border border-border transition-colors">
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-brand" />
                  <span>Or paste a custom job description</span>
                </span>
                <ChevronDown className="accordion-chevron w-4 h-4 text-subtle transition-transform duration-200" />
              </summary>
              <div className="pt-3 pb-1 px-1 space-y-3">
                <div className="p-4 bg-surface/40 rounded-xl border border-border space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleScrapeUrl();
                          }
                        }}
                        placeholder="Or import from job link (Greenhouse, Lever, LinkedIn, etc.)"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border rounded-xl text-foreground outline-none focus:border-brand"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleScrapeUrl}
                      disabled={isScraping || !customUrl.trim()}
                      className="px-3.5 py-2 text-xs font-semibold text-foreground bg-surface hover:bg-surface-2 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isScraping ? 'Auto-fetching...' : 'Auto-Fetch JD'}
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      id="custom-jd-input"
                      value={customJobText}
                      onChange={(e) => setCustomJobText(e.target.value)}
                      rows={5}
                      placeholder="Paste the full job description, role requirements, and responsibilities here..."
                      className="w-full p-3 text-xs bg-card border border-border rounded-xl text-foreground outline-none focus:border-brand"
                    />
                    {customJobText.trim() && (
                      <button
                        type="button"
                        onClick={() => setCustomJobText('')}
                        className="absolute top-2 right-2 text-[10px] text-subtle hover:text-danger px-2 py-0.5 rounded bg-surface"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-subtle">
                      {customJobText.trim() ? `${customJobText.trim().length} characters entered` : 'Ready to analyze & tailor'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEvaluate(customJobText)}
                      disabled={isLoading || !customJobText.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assess & Tailor with Custom JD</span>
                    </button>
                  </div>
                </div>
              </div>
            </details>

            {/* Accordion 2: Full Curated Company Boards Picker */}
            <details className="workspace-accordion-toggle">
              <summary className="cursor-pointer font-medium text-xs text-subtle hover:text-foreground flex items-center justify-between py-2 px-3.5 rounded-xl bg-surface/70 hover:bg-surface border border-border transition-colors">
                <span className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span>Browse curated company boards ({atsCompanies.length} companies)</span>
                </span>
                <ChevronDown className="accordion-chevron w-4 h-4 text-subtle transition-transform duration-200" />
              </summary>
              <div className="pt-3 pb-1 px-1">
                <div className="workspace-company-grid text-xs max-h-48 overflow-y-auto p-1">
                  {atsCompanies.map((c) => {
                    const isSelected = selectedAtsCompany === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          setSelectedAtsCompany(c.slug);
                          setAtsCustomInput(c.slug === 'all' ? '' : c.slug);
                          handleCrawlAts(c.slug);
                        }}
                        className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-surface text-foreground hover:bg-surface-2'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span
                          className={`text-[10px] px-1 py-0.2 rounded font-mono uppercase ${
                            isSelected ? 'bg-card/20 text-primary-foreground' : 'bg-surface text-subtle'
                          }`}
                        >
                          {c.slug === 'all' ? 'ALL' : c.slug === 'revolut' ? 'DIR' : c.ats.slice(0, 2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          </div>

          {/* Feedback Banners */}
          {atsFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 ${
                atsFeedback.type === 'success'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {atsFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{atsFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAtsFeedback(null)}
                className="text-subtle hover:text-foreground text-xs font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Saved Opportunities in Search Mode */}
          {filteredOpportunities.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Saved & Evaluated Roles ({filteredOpportunities.length})
                  </h3>
                </div>
                {onClearOpportunities && (
                  <button
                    type="button"
                    onClick={onClearOpportunities}
                    className="px-2.5 py-1 text-xs text-danger hover:bg-danger/10 rounded-full transition-colors font-medium cursor-pointer"
                  >
                    Clear Evaluated ({filteredOpportunities.length})
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredOpportunities.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      data-saved-job-id={job.id}
                      onClick={() => {
                        onSelectPreset(job.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          const el = document.getElementById('role-action-dossier');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-card border-brand ring-2 ring-brand/20 shadow-elevated'
                          : 'bg-surface/50 border-border hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-subtle" />
                          {job.company}
                        </span>
                        {job.matchScore !== undefined && (
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                            {job.matchScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground">{job.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results Grid */}
          {atsJobs.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Header Title & Subtitle (Full Width) */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-semibold text-sm sm:text-base text-foreground">
                    {selectedAtsCompany === 'all' ? (
                      <>Live Openings across <span className="text-brand">{uniqueCompaniesCount} Companies</span></>
                    ) : (
                      <>Live Openings at <span className="text-brand">{atsCompanies.find((c) => c.slug === selectedAtsCompany)?.name || selectedAtsCompany}</span></>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-success inline-flex items-center gap-1.5 bg-success/10 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Live Stream
                  </span>
                </div>
                <p className="text-xs text-subtle">
                  Showing <strong className="text-foreground font-semibold">{filteredAtsJobs.length}</strong> {hasProfile && !showAllRoles ? 'matched positions' : 'open positions'}
                  {selectedAtsLocation !== 'All' && (
                    <span> in <strong className="text-brand font-semibold">{selectedAtsLocation}</strong></span>
                  )}
                  {selectedDepartment !== 'All' && (
                    <span> · <strong className="text-foreground font-semibold">{selectedDepartment}</strong></span>
                  )}
                </p>
              </div>

              {/* View Switcher and Share Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                {/* LinkedIn-Style Discovery Switcher (Best Matches vs All Open Roles) */}
                {hasProfile ? (
                  <div className="flex items-center bg-surface p-1 rounded-xl border border-border text-xs gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAllRoles(false)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        !showAllRoles
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-subtle hover:text-foreground'
                      }`}
                    >
                      <span>🎯 Best Matches</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${!showAllRoles ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-2 text-subtle'}`}>
                        {profileMatchedJobs.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAllRoles(true)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        showAllRoles
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-subtle hover:text-foreground'
                      }`}
                    >
                      <span>🌐 All Open Roles</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${showAllRoles ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-2 text-subtle'}`}>
                        {baseFilteredAtsJobs.length}
                      </span>
                    </button>
                  </div>
                ) : <div />}

                {/* Share Fetched Roles Button & Quick Copy */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 hover:bg-surface-2 text-foreground group"
                    title="Share link to all fetched roles"
                    aria-label="Share fetched roles"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand group-hover:scale-110 transition-transform" />
                    <span>Share Roles</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-brand/15 text-brand border border-brand/20">
                      {filteredAtsJobs.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectCopyShareLink}
                    className={`px-2 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isDirectCopied
                        ? 'bg-success/20 text-success font-semibold'
                        : 'text-subtle hover:text-foreground hover:bg-surface-2'
                    }`}
                    title={isDirectCopied ? 'Link copied!' : 'Copy direct share link'}
                    aria-label="Copy direct share link"
                  >
                    {isDirectCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span className="text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Discipline Filter Bar (LinkedIn style) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
                <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold mr-1 shrink-0">Discipline:</span>
                {[
                  { id: 'All', label: 'All Roles' },
                  { id: 'Trades', label: '🔧 Skilled Trades & Construction' },
                  { id: 'Logistics', label: '🚛 Logistics & Transport' },
                  { id: 'Hospitality', label: '🛎️ Hospitality & Services' },
                  { id: 'Healthcare', label: '🩺 Healthcare & Clinical' },
                  { id: 'Engineering', label: '💻 Engineering' },
                  { id: 'Data & AI', label: '🤖 Data & AI' },
                  { id: 'Product & Design', label: '🎨 Product & Design' },
                  { id: 'Operations & Strategy', label: '⚙️ Operations & Corporate' },
                  { id: 'Sales & Growth', label: '📈 Sales / Growth' },
                ].map((dept) => {
                  const isActive = selectedDepartment === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                          : 'bg-surface text-subtle hover:text-foreground hover:bg-surface-2 border border-border/60'
                      }`}
                    >
                      {dept.label}
                    </button>
                  );
                })}
              </div>

              {/* Results rows */}
              <div className="workspace-job-results grid grid-cols-1 gap-2 max-h-[520px] overflow-y-auto">
                {isCrawlingAts ? (
                  <div className="p-10 text-center bg-surface/30 rounded-2xl border border-border">
                    <BusyIndicator active={true} label="Querying official ATS boards..." />
                  </div>
                ) : filteredAtsJobs.length === 0 ? (
                  <div className="p-8 text-center bg-surface/30 rounded-2xl border border-border space-y-2.5">
                    <Search className="w-8 h-8 text-subtle mx-auto opacity-40" />
                    <h4 className="font-display font-semibold text-sm text-foreground">No matching positions found</h4>
                    <p className="text-xs text-subtle max-w-md mx-auto">
                      {hasProfile && !showAllRoles
                        ? `No roles met the strict profile match threshold in this view. Switch to "All Open Roles" (${baseFilteredAtsJobs.length}) to inspect all available openings.`
                        : 'No active roles matched your current filter criteria. Try selecting "All Disciplines" or resetting filters.'}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDiscoverLiveWebJobs}
                        disabled={isDiscoveringWeb}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        {isDiscoveringWeb ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Searching live {profileSearchContext.targetRole ? `${profileSearchContext.targetRole} openings...` : 'verified employer sites...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Discover Live {profileSearchContext.targetRole || 'Specialized'} Roles via Web Search</span>
                          </>
                        )}
                      </button>
                      {hasProfile && !showAllRoles && (
                        <button
                          type="button"
                          onClick={() => setShowAllRoles(true)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-surface transition-all cursor-pointer"
                        >
                          View All Open Roles ({baseFilteredAtsJobs.length})
                        </button>
                      )}
                      {selectedAtsLocation !== 'All' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAtsLocation('All');
                            handleCrawlAts(undefined, undefined, undefined, 'All');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-surface transition-all cursor-pointer"
                        >
                          Search Globally (All Locations)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCustomJdOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-surface transition-all cursor-pointer"
                      >
                        Paste Job Link or JD
                      </button>
                      {(selectedSeniority !== 'All' || selectedWorkplace !== 'All' || selectedAtsLocation !== 'All' || selectedDepartment !== 'All' || atsKeyword.trim()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSeniority('All');
                            setSelectedWorkplace('All');
                            setSelectedAtsLocation('All');
                            setSelectedDepartment('All');
                            setAtsKeyword('');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-surface transition-all cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>

                    {/* One-Click Verified Live Job Searches */}
                    <div className="pt-3 pb-1 border-t border-border/60 max-w-lg mx-auto space-y-2">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Search live openings on verified job portals for{' '}
                        <span className="text-foreground font-semibold">
                          "{atsKeyword || profileSearchContext.targetRole || 'Specialized Professional'}"
                        </span>{' '}
                        in{' '}
                        <span className="text-foreground font-semibold">
                          {selectedAtsLocation !== 'All' ? selectedAtsLocation : (profileSearchContext.location || 'India')}
                        </span>:
                      </p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <a
                          href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent((atsKeyword || profileSearchContext.targetRole || 'Specialized Professional').trim())}&location=${encodeURIComponent(selectedAtsLocation !== 'All' ? selectedAtsLocation : (profileSearchContext.location || 'India'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium rounded-xl bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#0A66C2]" />
                          <span>Search on LinkedIn Jobs</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <a
                          href={`https://in.indeed.com/jobs?q=${encodeURIComponent((atsKeyword || profileSearchContext.targetRole || 'Specialized Professional').trim())}&l=${encodeURIComponent(selectedAtsLocation !== 'All' ? selectedAtsLocation : (profileSearchContext.location || 'India'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium rounded-xl bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#2164f3]" />
                          <span>Search on Indeed</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent((atsKeyword || profileSearchContext.targetRole || 'Specialized Professional') + ' jobs in ' + (selectedAtsLocation !== 'All' ? selectedAtsLocation : (profileSearchContext.location || 'India')))}&ibp=htl;jobs`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium rounded-xl bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                          <span>Google Jobs</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                      <p className="text-[10px] text-subtle pt-1">
                        Found an active role? Paste the link or JD above to immediately assess fit and generate your tailored ATS application.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredAtsJobs.map((job) => {
                  const importedId = importedAtsIds.get(job.id);
                  const isImported = !!importedId && opportunities.some((o) => o.id === importedId);
                  const fitInfo = quickFitTier(job.matchScore || 0);
                  return (
                    <div
                      key={job.id}
                      className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-surface/90 hover:border-brand/50 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5),0_0_25px_0_rgba(59,130,246,0.15)] transition-all duration-200 flex flex-col justify-between gap-3 group after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand/25 after:to-transparent"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground font-display tracking-tight">
                                {job.company}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-surface/90 text-muted-foreground border border-border/70 uppercase">
                                {job.platform}
                              </span>
                              {job.seniority && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-surface/90 text-foreground border border-border/70">
                                  {job.seniority}
                                </span>
                              )}
                              {job.workplaceType && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-surface/90 text-muted-foreground border border-border/70">
                                  {job.workplaceType}
                                </span>
                              )}
                              {(() => {
                                const gs: GhostSignal = (job as any).ghostSignal || detectGhostJobSignal({
                                  title: job.title,
                                  company: job.company,
                                  platform: job.platform,
                                  verifiedLive: job.verifiedLive,
                                  applyUrl: (job as any).applyUrl || (job as any).url,
                                  rawDescription: (job as any).rawDescription || job.description,
                                });
                                if (gs.level === 'likely') {
                                  return (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-2xs font-mono" title={gs.evidenceSummary || 'Evergreen requisition with high phantom risk (>180d)'}>
                                      <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
                                      <span>Likely Ghost (&gt;180d)</span>
                                    </span>
                                  );
                                }
                                if (gs.level === 'possible') {
                                  return (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-2xs font-mono" title={gs.evidenceSummary || 'Slow-moving requisition (90d+)'}>
                                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Slow Requisition (90d+)</span>
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-2xs font-mono" title="Verified direct requisition on company ATS">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Direct ATS Verified</span>
                                  </span>
                                );
                              })()}
                            </div>
                            <h4 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-brand transition-colors line-clamp-1" title={job.title}>
                              {job.title}
                            </h4>
                          </div>

                          {/* High-Contrast Clean Fit Badge */}
                          {job.matchScore !== undefined && (
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs ${
                                fitInfo.tone === 'strong'
                                  ? 'bg-success text-white'
                                  : fitInfo.tone === 'good'
                                  ? 'bg-brand text-white'
                                  : fitInfo.tone === 'possible'
                                  ? 'bg-warning text-white'
                                  : 'bg-muted text-muted-foreground border border-border'
                              }`}
                              title="Match estimate based on your Master Profile"
                            >
                              {fitInfo.label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 truncate" title={job.location}>
                            <MapPin className="w-3 h-3 shrink-0 text-subtle" />
                            <span className="truncate">{job.location}</span>
                          </span>
                          {job.salarySnippet && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-md font-mono">
                              <span>💰</span>
                              <span>{job.salarySnippet}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/80 text-xs">
                        {job.applyUrl && job.applyUrl !== '#' ? (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-brand hover:text-brand/80 hover:underline flex items-center gap-1.5 font-medium transition-colors"
                            title="Direct requisition link to this specific opening"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block shrink-0 shadow-xs" />
                            <span>Direct Requisition</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span />}

                        {/* Single Prominent Action: + Save & Assess */}
                        <button
                          type="button"
                          onClick={() => {
                            handleImportAtsJob(job, false);
                            setSearchExpanded(false);
                          }}
                          disabled={isImported}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                            isImported
                              ? 'bg-success/15 text-success font-medium'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                          }`}
                        >
                          {isImported ? '✓ Saved & Active' : '+ Save & Assess'}
                        </button>
                      </div>
                    </div>
                  );
                }))}
              </div>

              {/* Load Next Positions / End of Stream */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-border bg-surface/40 p-3 rounded-xl flex-wrap">
                <div className="flex items-center gap-2 text-xs text-subtle">
                  {!hasMoreAtsJobs ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span className="text-foreground font-medium">
                        {filteredAtsJobs.length === 0
                          ? 'No matching positions found with current filters.'
                          : `All ${filteredAtsJobs.length} live positions loaded.`}
                      </span>
                    </>
                  ) : (
                    <span>Loaded {filteredAtsJobs.length} live positions</span>
                  )}
                </div>

                {hasMoreAtsJobs ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleCrawlAts(
                        selectedAtsCompany,
                        selectedSeniority,
                        selectedWorkplace,
                        selectedAtsLocation,
                        atsKeyword,
                        true
                      )
                    }
                    disabled={isLoadingMore || isCrawlingAts}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground bg-card border border-border hover:bg-surface transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingMore ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    <span>Load More</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ✓ Up to date with official {selectedAtsCompany === 'all' ? 'company boards' : `${selectedAtsCompany} ATS`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segmented Feed Tabs (Change 5): Live Roles vs Saved Dossiers */}
      {isRoleActive && !searchExpanded && (filteredAtsJobs.length > 0 || filteredOpportunities.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setFeedTab('live')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                effectiveFeedTab === 'live'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              <span>Live Roles</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-2 text-subtle font-mono">
                {filteredAtsJobs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFeedTab('saved')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                effectiveFeedTab === 'saved'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              <span>Saved Dossiers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-2 text-subtle font-mono">
                {filteredOpportunities.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Live Crawled Positions */}
          <div className={effectiveFeedTab === 'live' ? 'block' : 'hidden'}>
            <div className="p-4 bg-card border border-border rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-border">
                <span className="font-semibold text-foreground">Live Crawled Positions ({filteredAtsJobs.length})</span>
                <span className="text-subtle text-[11px]">Click to inspect</span>
              </div>
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {filteredAtsJobs.map((job) => {
                  const importedId = importedAtsIds.get(job.id);
                  const isImported = !!importedId && opportunities.some((o) => o.id === importedId);
                  const isCurrentActive = isImported && (selectedJobId === importedId || (evaluation.job_title === job.title && evaluation.company_name === job.company));
                  const fitInfo = quickFitTier(job.matchScore || 0);
                  const displayScore = isCurrentActive && isEvaluationComplete ? evaluation.match_score : job.matchScore;
                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        handleImportAtsJob(job, false);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          const el = document.getElementById('role-action-dossier');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isCurrentActive
                          ? 'bg-card border-brand ring-2 ring-brand/30 shadow-xs'
                          : isImported
                            ? 'bg-card border-border shadow-2xs'
                            : 'bg-surface/50 border-border hover:bg-surface hover:border-brand/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-foreground truncate">{job.company}</span>
                        {displayScore !== undefined && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCurrentActive && isEvaluationComplete
                              ? evaluation.match_score >= 80 ? 'bg-success text-white' : evaluation.match_score >= 60 ? 'bg-warning text-white' : 'bg-danger/20 text-danger border border-danger/30'
                              : fitInfo.tone === 'strong' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {displayScore > 0 ? `${displayScore}%` : fitInfo.label}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-xs text-foreground line-clamp-1">{job.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-subtle pt-1 border-t border-border/50">
                        <span className="truncate">{job.location}</span>
                        {isCurrentActive ? (
                          <span className="text-brand font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                            Viewing Dossier
                          </span>
                        ) : isImported ? (
                          <span className="text-subtle font-medium">Saved · Inspect →</span>
                        ) : (
                          <span className="text-brand font-medium">Select →</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab 2: Saved & Evaluated Roles */}
          <div className={effectiveFeedTab === 'saved' ? 'block' : 'hidden'}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Saved & Evaluated Roles ({filteredOpportunities.length})
                  </h3>
                </div>
                {onClearOpportunities && (
                  <button
                    type="button"
                    onClick={onClearOpportunities}
                    className="px-2.5 py-1 text-xs text-danger hover:bg-danger/10 rounded-full transition-colors font-medium cursor-pointer"
                    title="Clear evaluated opportunities from workspace"
                  >
                    Clear Evaluated ({filteredOpportunities.length})
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredOpportunities.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      data-saved-job-id={job.id}
                      style={{ scrollMarginTop: 96 }}
                      onClick={() => {
                        onSelectPreset(job.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          const el = document.getElementById('role-action-dossier');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-card border-brand ring-2 ring-brand/20 shadow-elevated'
                          : 'bg-card border-border hover:border-border hover:shadow-elevated'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-subtle" />
                              <span>{job.company}</span>
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[rgba(120,120,128,0.12)] text-muted-foreground">
                              {job.platform}
                            </span>
                            {(() => {
                              const gs: GhostSignal = (job as any).ghostSignal || detectGhostJobSignal({
                                title: job.title,
                                company: job.company,
                                platform: job.platform,
                                verifiedLive: (job as any).verifiedLive,
                                applyUrl: job.applyUrl,
                                rawDescription: (job as any).rawDescription || job.description,
                              });
                              if (gs.level === 'likely') {
                                return (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-mono" title={gs.evidenceSummary}>
                                    <AlertOctagon className="w-2.5 h-2.5" />
                                    <span>Ghost Risk</span>
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono" title="Verified ATS requisition">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Verified Direct</span>
                                </span>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {isSelected && isEvaluationComplete ? 'Assessed' : 'Assessment pending'}
                            </span>
                            {onRemoveOpportunity && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveOpportunity(job.id);
                                }}
                                className="p-1 rounded-md text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                                title="Remove listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
                          {job.title}
                        </h3>

                        <div className="text-[13px] text-subtle flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>

                        <div className={`p-3 rounded-xl text-[12px] leading-snug ${
                          (job.matchScore || 0) < 60
                            ? 'bg-warning/10 text-warning border border-warning/25/60'
                            : 'bg-surface text-muted-foreground'
                        }`}>
                          <span className="font-semibold text-foreground">
                            {isSelected && isEvaluationComplete ? 'Assessment: ' : 'Role overview: '}
                          </span>
                          <span>{job.matchHighlight}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border text-[13px]">
                        <span className={`font-medium ${isSelected ? 'text-brand font-semibold' : 'text-subtle'}`}>
                          {isSelected ? '✓ Selected' : 'Click to select & focus'}
                        </span>

                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[12px] text-brand font-medium transition-colors hover:underline"
                            title="Open verified live posting in new tab"
                          >
                            <span>Open on {job.platform}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Right Pane (lg:col-span-7): The Action Dossier & Analysis */}
    <div id="role-action-dossier" className="lg:col-span-7 space-y-5 lg:sticky lg:top-6">
      {/* Stage 2B: Dedicated Active Role Workspace */}
      {isRoleActive ? (
        <>
          {/* Mobile Back Button */}
          <div className="lg:hidden flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => {
                const feedEl = document.getElementById('discovery-feed-pane');
                if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to search results</span>
            </button>
            <span className="text-[11px] text-subtle font-medium">Viewing Active Role</span>
          </div>

          {/* Quick Switcher among Saved Roles */}
          {filteredOpportunities.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-subtle font-medium shrink-0">Saved roles:</span>
              {filteredOpportunities.map((op) => {
                const isActive = selectedJobId === op.id;
                return (
                  <div
                    key={op.id}
                    className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-card border border-border text-foreground hover:bg-surface'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPreset(op.id)}
                      className="cursor-pointer truncate max-w-[220px]"
                      title={`Switch to ${op.title} @ ${op.company}`}
                    >
                      {op.title} @ {op.company}
                    </button>
                    {onRemoveOpportunity && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveOpportunity(op.id);
                        }}
                        className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                          isActive
                            ? 'hover:bg-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground'
                            : 'hover:bg-surface-2 text-subtle hover:text-danger'
                        }`}
                        title={`Remove ${op.title} from saved roles`}
                        aria-label={`Remove ${op.title} from saved roles`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {onClearOpportunities && (
                <button
                  type="button"
                  onClick={onClearOpportunities}
                  className="text-xs text-subtle hover:text-danger ml-auto shrink-0 font-medium transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-danger/10"
                  title="Clear all saved roles"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Mandatory Eligibility Gate Alert */}
          {evaluation.is_gated && (
            <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs space-y-2 text-danger flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Mandatory Eligibility Gate Warning</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-danger/20 text-danger font-semibold">GATED SCORE</span>
                </div>
                <p className="leading-relaxed text-danger/90">
                  {evaluation.gate_reason || 'This role has mandatory eligibility requirements that were not met in your profile. The overall match score has been restricted to avoid misleading applications.'}
                </p>
                {evaluation.mandatory_gates && evaluation.mandatory_gates.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {evaluation.mandatory_gates.map((gate, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                          gate.status === 'PASSED'
                            ? 'bg-success/20 text-success'
                            : 'bg-danger/20 text-danger border border-danger/40'
                        }`}
                      >
                        {gate.status === 'PASSED' ? '✓' : '✕'} {gate.requirement}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deterministic Hard-Constraint Eligibility Panel */}
          {hardConstraintReport && (
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-elevated space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${hardConstraintReport.overallEligible ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground">
                    Deterministic Hard-Constraint Eligibility
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                    hardConstraintReport.overallEligible
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {hardConstraintReport.overallEligible
                      ? '100% Score Ceiling'
                      : `Score Capped at max ${hardConstraintReport.scoreCeiling}%`}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {hardConstraintReport.overallEligible
                  ? 'All 6 deterministic criteria (Work Authorization, Experience Floor, Degree, Certifications, Language, and Workplace Mode) are satisfied by your Master Profile.'
                  : `Identified ${hardConstraintReport.unmetCount} unmet mandatory criteria in the job requisition. Match score ceiling strictly enforced at ${hardConstraintReport.scoreCeiling}%.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {hardConstraintReport.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between gap-1.5 ${
                      item.isMet
                        ? 'bg-surface/50 border-border/60 text-muted-foreground'
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-[11px] text-foreground flex items-center gap-1.5">
                        {item.isMet ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span>{item.title}</span>
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        item.isMet ? 'bg-surface-2 text-muted-foreground' : 'bg-rose-500/20 text-rose-300 font-semibold'
                      }`}>
                        {item.isMet ? 'PASS' : `CAP ${item.scoreCap}%`}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1" title={item.explanation}>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Summary Card */}
          <div id="evaluation-summary" className="relative overflow-hidden p-6 sm:p-8 space-y-6 bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 rounded-3xl shadow-elevated">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center gap-5 min-w-0">
                {/* Score Circle */}
                {isEvaluationComplete && <div className={`relative w-16 h-16 rounded-full bg-surface/90 border-2 ${
                  evaluation.match_score >= 80 ? 'border-success shadow-[0_0_15px_rgba(16,185,129,0.25)]' : evaluation.match_score >= 60 ? 'border-brand shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'border-warning shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                } flex flex-col items-center justify-center shrink-0`}>
                  <span className={`font-display text-lg font-bold tabular-nums ${getScoreColor(evaluation.match_score)}`}>
                    {evaluation.match_score}%
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    MATCH
                  </span>
                </div>}

                <div className="space-y-1.5 min-w-0 flex-1">
                  {isEvaluationComplete ? <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-mono ${evaluation.should_apply ? 'bg-success/15 text-success border border-success/30' : 'bg-warning/15 text-warning border border-warning/30'}`}>
                      {(evaluation.verdict || 'MATCH').replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {evaluation.should_apply ? '✓ Recommended' : 'Low Overlap'}
                    </span>
                  </div> : <p className="text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">Potential fit · Full assessment pending</p>}
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {evaluation.job_title}
                  </h2>
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 font-medium">
                    <span className="text-foreground font-semibold">{evaluation.company_name}</span>
                    {evaluation.location_info && (
                      <>
                        <span className="text-subtle">·</span>
                        <span>{evaluation.location_info}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action CTAs: Context-Aware Decision Hierarchy */}
              {isEvaluationComplete && (!evaluation.should_apply || (evaluation.match_score !== undefined && evaluation.match_score > 0 && evaluation.match_score < 50)) && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-amber-300">
                      AI Application Advisory · Low Match ({evaluation.match_score}%)
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Our assessment detected significant qualification or credential gaps. Applying is not advised without prerequisites. We suggest reviewing the gap bridge plan below or selecting a role with 70%+ alignment.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {!isEvaluationComplete ? (
                    <button
                      data-tour="evaluator-tailor"
                      onClick={() => onEvaluate()}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <LoadingProgress inline active={isLoading} label="Tailoring" idleLabel="Tailor Application" resultToken={evaluation} />
                    </button>
                  ) : (!evaluation.should_apply || (evaluation.match_score !== undefined && evaluation.match_score > 0 && evaluation.match_score < 50)) ? (
                    <>
                      {/* Primary CTA for Low Matches: Explore Closer Matches */}
                      <button
                        type="button"
                        onClick={() => {
                          setFeedTab('live');
                          const feedEl = document.getElementById('discovery-feed-pane');
                          if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs"
                        title="Focus live discovery feed to find roles with higher qualification alignment"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Explore Closer Matches</span>
                      </button>

                      {/* Secondary Ghost Button: Tailor Anyway (respects candidate autonomy) */}
                      <button
                        data-tour="evaluator-tailor"
                        onClick={() => onOpenTab ? onOpenTab('resume') : onProceedToResume()}
                        aria-label="Review Tailored Application (Tailor Anyway)"
                        title="Review Tailored Application"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-subtle hover:text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full transition-all cursor-pointer whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5 text-subtle" />
                        <span>Tailor Anyway</span>
                      </button>
                    </>
                  ) : (
                    <button
                      data-tour="evaluator-tailor"
                      onClick={() => onOpenTab ? onOpenTab('resume') : onProceedToResume()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Tailored Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {effectiveApplyUrl && (
                    <a
                      href={effectiveApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && typeof window.open === 'function') {
                          try {
                            window.open(effectiveApplyUrl, '_blank');
                          } catch (_) {}
                        }
                        onApplyClick?.(effectiveApplyUrl);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-brand hover:text-brand/90 bg-brand/10 hover:bg-brand/15 border border-brand/20 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs"
                      title={`Open official job portal for ${evaluation.company_name || 'this role'} in a new tab`}
                    >
                      <span>Apply now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {onTrackApplication && (
                    <button
                      onClick={() =>
                        onTrackApplication({
                          company_name: evaluation.company_name,
                          job_title: evaluation.job_title,
                          location: evaluation.location_info,
                          apply_url: effectiveApplyUrl,
                          match_score: evaluation.match_score,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        isTracked
                          ? 'bg-success/10 text-success hover:bg-success/20 border border-success/30'
                          : 'text-foreground bg-surface hover:bg-surface-2 border border-border'
                      }`}
                      title={isTracked ? 'Click to untrack and remove from applied jobs' : 'Track in Applied Jobs'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isTracked ? 'text-success' : 'text-subtle'}`} />
                      <span>{isTracked ? 'Tracked as Applied' : 'Mark as Applied'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyAtsDossier}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold rounded-full bg-surface hover:bg-surface-2 border border-border text-foreground transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    title="Copy standard ATS application answers (notice period, work auth, salary, STAR stories) to clipboard"
                  >
                    {isDossierCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Dossier Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-3.5 h-3.5 text-brand" />
                        <span>Copy ATS Dossier</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Overflow ··· Menu for secondary options */}
                <div className="relative shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    className="p-2.5 text-subtle hover:text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                    title="More actions"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isActionMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      {onRemoveOpportunity && selectedJobId && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveOpportunity(selectedJobId);
                            setIsActionMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove from Saved</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleStartFresh();
                          setIsActionMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-subtle hover:text-foreground hover:bg-surface flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Dossier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleTailorNewRole();
                          setIsActionMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-subtle hover:text-foreground hover:bg-surface flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tailor a Different Role</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEvaluationComplete && evaluation.executive_summary && (
              <p className="text-[13px] text-muted-foreground border-t border-border pt-4 leading-relaxed">
                <span className="font-semibold text-foreground">Assessment: </span>
                {evaluation.executive_summary}
              </p>
            )}
          </div>

          {/* Fit Analysis & Center Stage Assessment */}
          <div className="space-y-5">

          {/* Perspective Switcher (Change 4) */}
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveDossierTab('breakdown')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeDossierTab === 'breakdown'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Match Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActiveDossierTab('committee')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDossierTab === 'committee'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              <span>Hiring Committee 3-Person Review</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-info/15 text-info font-mono">
                3 PERSPECTIVES
              </span>
            </button>
          </div>

          {/* Tab 2: Hiring Committee Feedback Panel */}
          <div className={activeDossierTab === 'committee' ? 'block' : 'hidden'}>
            <div className="apple-card p-4 sm:p-5 space-y-3.5 border border-info/20 bg-info/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-info/15 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info/15 text-info flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                        Hiring Committee Feedback
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-info/15 text-info uppercase tracking-wider font-mono">
                        3-PERSON PANEL
                      </span>
                    </div>
                    <p className="text-xs text-subtle mt-0.5">
                      Multi-perspective review from Lead Recruiter, Hiring Manager, and Technical Lead.
                    </p>
                  </div>
                </div>
                {onOpenRecruiterReview && (
                  <button
                    type="button"
                    onClick={onOpenRecruiterReview}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-info-foreground bg-info hover:bg-info/90 rounded-full transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Launch Panel Review</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-card/70 border border-border/80 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[13px]">Lead Recruiter</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">ATS & Resume</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="truncate">
                      {isEvaluationComplete
                        ? (evaluation.match_score >= 70 ? 'Strong ATS keyword alignment' : 'Moderate keyword overlap')
                        : 'Screening evaluation ready'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card/70 border border-border/80 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[13px]">Hiring Manager</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">Strategic Impact</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span className="truncate">
                      {isEvaluationComplete
                        ? 'Leadership & project metrics aligned'
                        : 'Direct relevancy evaluation ready'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card/70 border border-border/80 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[13px]">Domain Lead</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Craft & Depth</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span className="truncate">
                      {isEvaluationComplete
                        ? 'Core competencies ready for defense'
                        : 'Technical trade-offs evaluation ready'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 1: Match Breakdown in 2 Balanced Columns (50% / 50%) */}
          <div className={activeDossierTab === 'breakdown' ? 'block' : 'hidden'}>
            {isEvaluationComplete && (
              (() => {
                const gapsList = getGapsList(evaluation);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    {/* 1. Left Column: Candidate Strengths & Transferable Skills */}
                    <div className="apple-card p-6 space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border/80">
                          <div className="flex items-center gap-2">
                            <span className="apple-badge-blue text-[11px]">FIT FACTORS</span>
                            <h3 className="font-display font-semibold text-base text-foreground">
                              Candidate Strengths & Transferable Skills
                            </h3>
                          </div>
                          <span className="text-[11px] text-subtle font-medium">
                            {(evaluation.key_matching_factors || []).length} factors aligned
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
                          Matching Qualifications
                        </div>
                        <ul className="space-y-3 text-[13px] text-muted-foreground">
                          {(evaluation.key_matching_factors || []).map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 2. Right Column: Identified Gaps & Bridge Strategy */}
                    <div className="apple-card p-6 space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border/80">
                          <div className="flex items-center gap-2">
                            <span className="apple-badge text-[11px] bg-warning/10 text-warning font-semibold">
                              GAP ANALYSIS
                            </span>
                            <h3 className="font-display font-semibold text-base text-foreground">
                              Identified Gaps & Bridge Strategy
                            </h3>
                          </div>
                          {gapsList.length > 0 && (
                            <span className="text-[11px] text-subtle font-medium">
                              {gapsList.length} {gapsList.length === 1 ? 'area' : 'areas'}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
                          Gaps & Where to Work
                        </div>

                        <ul className="space-y-3 text-[13px]">
                          {gapsList.length > 0 ? (
                            gapsList.map((gap, idx) => (
                              <li
                                key={idx}
                                className="p-3.5 rounded-xl bg-surface border border-border space-y-2"
                              >
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-warning">
                                        What is Missing
                                      </span>
                                      {gap.severity && (
                                        <span
                                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                            gap.severity === 'CRITICAL'
                                              ? 'bg-danger/10 text-danger'
                                              : 'bg-warning/10 text-warning'
                                          }`}
                                        >
                                          {gap.severity}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-semibold text-foreground leading-snug block">
                                      {gap.missing}
                                    </span>
                                  </div>
                                </div>

                                <div className="pl-6 pt-1.5 border-t border-border text-[12px] text-muted-foreground leading-relaxed">
                                  <span className="font-semibold text-brand flex items-center gap-1 mb-0.5">
                                    <Target className="w-3 h-3" />
                                    <span>Where to work on:</span>
                                  </span>
                                  <span>{gap.where_to_work}</span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="p-4 rounded-xl bg-success/5 border border-success/15 flex items-start gap-2.5 text-success">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-success mt-0.5" />
                              <div>
                                <span className="font-semibold block mb-0.5">No Critical Gaps Detected</span>
                                <span className="text-[12px] text-success/80">
                                  Candidate qualifications strongly align with all primary requirements.
                                </span>
                              </div>
                            </li>
                          )}
                        </ul>

                        {/* Merged Bridge Strategy within the same card */}
                        <div className="pt-3 border-t border-border/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="apple-badge text-[11px] bg-brand/10 text-brand font-semibold">STRATEGY</span>
                              <h4 className="font-display font-semibold text-sm text-foreground">Tailoring Recommendations</h4>
                            </div>
                            <span className="text-[11px] text-subtle font-medium">Bridge Actions</span>
                          </div>
                          <ul className="space-y-2 text-[12px] text-muted-foreground">
                            {(evaluation.tailoring_recommendations || []).map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface/50 border border-border/60">
                                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>



          {/* Skill-Building Roadmap & Certifications */}
          {(() => {
            const roadmapSteps =
              evaluation.skill_roadmap && evaluation.skill_roadmap.length > 0
                ? evaluation.skill_roadmap
                : (evaluation.missing_critical_skills || []).map((gap, i) => ({
                    skill: gap.split('(')[0].replace(/mitigated by.*$/i, '').trim(),
                    action_plan: `Master core operational methodologies and industry frameworks related to: ${gap}.`,
                    recommended_certification: 'Industry Professional Certification',
                    certification_provider: 'Accredited Provider',
                    timeline: '2–4 weeks',
                    importance: i === 0 ? 'CRITICAL' : 'RECOMMENDED',
                    practical_project: 'Build a targeted portfolio case study demonstrating practical application of this competency.',
                  }));

            const titleLow = (evaluation.job_title || '').toLowerCase();
            const isB2B = titleLow.includes('merchant') || titleLow.includes('b2b') || titleLow.includes('payment') || titleLow.includes('acquiring') || titleLow.includes('client delivery');
            const isFinCrime = titleLow.includes('fincrime') || titleLow.includes('financial crime') || titleLow.includes('dispute') || titleLow.includes('fraud') || titleLow.includes('aml') || titleLow.includes('compliance');
            const isIncident = titleLow.includes('incident') || titleLow.includes('itsm') || titleLow.includes('service delivery');
            const isWfm = titleLow.includes('workforce') || titleLow.includes('wfm') || titleLow.includes('real-time') || titleLow.includes('queue');
            const isProdOps = titleLow.includes('product') || titleLow.includes('program');

            const domainFallbackCertifications = isB2B
              ? [
                  {
                    name: 'Certified Payments Professional (CPP)',
                    issuer: 'Electronic Transactions Association (ETA)',
                    target_skill: 'Merchant operations, acquiring workflows & payment gateway API specs',
                    estimated_time: '2–3 weeks',
                    why_it_helps: 'High-value ATS qualification for fintech merchant and B2B operational scaling.',
                    difficulty: 'Intermediate',
                  },
                  {
                    name: 'B2B Client Relationship & Account Governance',
                    issuer: 'SuccessHACKER',
                    target_skill: 'Multi-currency account management, SLA metrics & delivery integrity',
                    estimated_time: '2 weeks',
                    why_it_helps: 'Proves client lifecycle ownership and revenue retention capabilities.',
                    difficulty: 'Beginner',
                  },
                ]
              : isFinCrime
              ? [
                  {
                    name: 'Certified Anti-Money Laundering Specialist (CAMS)',
                    issuer: 'ACAMS',
                    target_skill: 'Regulatory screening, AML red flags & dispute investigation',
                    estimated_time: '3–4 weeks',
                    why_it_helps: 'Industry benchmark for financial crime operations and dispute integrity.',
                    difficulty: 'Intermediate',
                  },
                  {
                    name: 'SC-900: Security, Compliance, and Identity Fundamentals',
                    issuer: 'Microsoft',
                    target_skill: 'Access control, audit trails & digital regulatory compliance',
                    estimated_time: '1–2 weeks',
                    why_it_helps: 'Direct proof of compliance controls and access governance.',
                    difficulty: 'Beginner',
                  },
                ]
              : isIncident
              ? [
                  {
                    name: 'ITIL 4 Foundation in IT Service Management',
                    issuer: 'AXELOS / PeopleCert',
                    target_skill: 'Incident command, problem management, ITIL service governance',
                    estimated_time: '2 weeks',
                    why_it_helps: 'The universal benchmark for major incident command and enterprise service management roles.',
                    difficulty: 'Beginner',
                  },
                  {
                    name: 'ServiceNow Certified System Administrator (ITSM)',
                    issuer: 'ServiceNow',
                    target_skill: 'Enterprise ticketing workflow automation, SLA alerting, incident triage',
                    estimated_time: '3–4 weeks',
                    why_it_helps: 'High demand across BETSOL and IT service employers looking for platform-certified incident leads.',
                    difficulty: 'Intermediate',
                  },
                ]
              : isWfm
              ? [
                  {
                    name: 'Certified Workforce Planning Professional (CWPP)',
                    issuer: 'The Workforce Management Institute (SWPP)',
                    target_skill: 'Capacity forecasting, intraday variance steering, Erlang modeling',
                    estimated_time: '3–4 weeks',
                    why_it_helps: 'Supports learning workforce planning methods relevant to this role.',
                    difficulty: 'Intermediate',
                  },
                  {
                    name: 'Advanced Operational Queue & Capacity Modeling',
                    issuer: 'Operations Management Institute',
                    target_skill: 'Dynamic sensitivity analysis, shift optimization formulas, roster forecasting',
                    estimated_time: '2 weeks',
                    why_it_helps: 'Demonstrates deep analytical rigor for command center lead positions.',
                    difficulty: 'Intermediate',
                  },
                ]
              : isProdOps
              ? [
                  {
                    name: 'Certified Scrum Product Owner (CSPO)',
                    issuer: 'Scrum Alliance',
                    target_skill: 'Sprint-level backlog prioritization, stakeholder alignment, feature rollout telemetry',
                    estimated_time: '2 weeks',
                    why_it_helps: 'Gold standard for agile product operations and cross-functional feature lifecycle management.',
                    difficulty: 'Beginner',
                  },
                  {
                    name: 'Product Operations & Telemetry Governance',
                    issuer: 'Product Institute',
                    target_skill: 'Operational readiness reviews (ORR), incident feedback loops, product KPIs',
                    estimated_time: '3 weeks',
                    why_it_helps: 'Validates operational excellence and engineering defect triage expertise.',
                    difficulty: 'Intermediate',
                  },
                ]
              : [
                  {
                    name: 'Lean Six Sigma Green Belt (LSSGB)',
                    issuer: 'ASQ / IASSC',
                    target_skill: 'Root-cause analysis, defect reduction, DMAIC process re-engineering',
                    estimated_time: '3–4 weeks',
                    why_it_helps: 'Offers strong proof of candidate process improvement and defect elimination capability.',
                    difficulty: 'Intermediate',
                  },
                  {
                    name: 'Certified Business Analysis Professional (CBAP)',
                    issuer: 'IIBA',
                    target_skill: 'Requirements analysis, operational mapping, process governance',
                    estimated_time: '3–4 weeks',
                    why_it_helps: 'Validates business analysis capability across complex enterprise environments.',
                    difficulty: 'Intermediate',
                  },
                ];

            const certifications =
              evaluation.recommended_certifications && evaluation.recommended_certifications.length > 0
                ? evaluation.recommended_certifications
                : domainFallbackCertifications;

            const gapPercentage = Math.max(0, 100 - evaluation.match_score);

            return (
              <div id="bridge-plan-section" className="apple-card p-5 sm:p-6 space-y-4">
                {/* Header / Progressive Disclosure Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Milestone className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
                          Skill Roadmap & Certifications
                        </h3>
                        {gapPercentage > 0 ? (
                          <span className="apple-badge text-[10px] font-mono">
                            {gapPercentage}% TO BRIDGE
                          </span>
                        ) : (
                          <span className="apple-badge bg-success/10 text-success text-[10px] font-mono">
                            100% MATCH
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-subtle mt-0.5">
                        {roadmapSteps.length} learning milestones and {certifications.length} industry certifications identified to bridge skill gaps for {evaluation.job_title}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {onOpenTab && (
                      <button
                        type="button"
                        onClick={() => onOpenTab('roadmaps')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card hover:bg-surface border border-border rounded-lg transition-all cursor-pointer"
                        title="Open full interactive roadmap workspace"
                      >
                        <span>Career Roadmaps</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-foreground bg-surface hover:bg-surface-2 border border-border rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{isRoadmapExpanded ? 'Hide Bridge Plan' : 'View Bridge Plan'}</span>
                      {isRoadmapExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-subtle" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-subtle" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isRoadmapExpanded && (
                  <div className="pt-4 border-t border-border space-y-6">
                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Column 1: Learning Roadmap */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-display font-semibold text-[13px] uppercase tracking-wider">
                          <Milestone className="w-4 h-4 text-subtle" />
                          <span>Learning Roadmap</span>
                        </div>

                        <div className="space-y-3">
                          {roadmapSteps.map((step, idx) => {
                            const isCritical = step.importance === 'CRITICAL';
                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl border border-border bg-surface text-[13px] space-y-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="font-display font-semibold text-foreground text-[14px]">
                                      {step.skill}
                                    </span>
                                  </div>

                                  <span className={`apple-badge text-[10px] ${isCritical ? 'bg-danger/10 text-danger' : ''}`}>
                                    {step.importance || 'RECOMMENDED'}
                                  </span>
                                </div>

                                <p className="text-muted-foreground leading-relaxed pl-[34px]">
                                  {step.action_plan}
                                </p>

                                <div className="pt-2 border-t border-border pl-[34px] flex flex-wrap gap-2 text-[11px]">
                                  {step.timeline && (
                                    <span className="inline-flex items-center gap-1 text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-lg font-medium">
                                      <Clock className="w-3 h-3 text-subtle" />
                                      <span>{step.timeline}</span>
                                    </span>
                                  )}

                                  {step.recommended_certification && (
                                    <span className="inline-flex items-center gap-1 text-brand bg-card border border-border px-2.5 py-1 rounded-lg font-semibold">
                                      <Award className="w-3 h-3" />
                                      <span>{step.recommended_certification}</span>
                                    </span>
                                  )}
                                </div>

                                {step.practical_project && (
                                  <div className="ml-[34px] p-3 rounded-xl bg-card border border-border text-[12px] text-muted-foreground flex items-start gap-2">
                                    <Target className="w-3.5 h-3.5 text-subtle shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-semibold text-foreground">Project: </span>
                                      <span>{step.practical_project}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2: Certifications */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-display font-semibold text-[13px] uppercase tracking-wider">
                          <Award className="w-4 h-4 text-subtle" />
                          <span>Target Certifications</span>
                        </div>

                        <div className="space-y-3">
                          {certifications.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl border border-border bg-surface text-[13px] space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-display font-semibold text-foreground text-[14px]">
                                    {cert.name}
                                  </h4>
                                  <span className="text-[12px] text-brand font-medium block mt-0.5">
                                    {cert.issuer}
                                  </span>
                                </div>

                                {cert.difficulty && (
                                  <span className="apple-badge text-[10px]">
                                    {cert.difficulty}
                                  </span>
                                )}
                              </div>

                              <div className="text-muted-foreground text-[12px] flex items-start gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-subtle shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground">Validates: </span>
                                  <span>{cert.target_skill}</span>
                                </div>
                              </div>

                              <div className="p-3 rounded-xl bg-card border border-border text-[12px] text-muted-foreground">
                                <span className="font-semibold text-foreground">Impact: </span>
                                <span>{cert.why_it_helps}</span>
                              </div>

                              <div className="flex items-center justify-between pt-2 text-[11px] text-subtle font-medium border-t border-border">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Prep: {cert.estimated_time}</span>
                                </span>
                                <span className="text-success font-semibold">
                                  ATS Approved ✓
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tip Banner */}
                    <div className="p-4 rounded-2xl bg-surface flex items-start sm:items-center gap-3 text-[13px]">
                      <Lightbulb className="w-5 h-5 text-warning shrink-0" />
                      <div className="leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">Tip: </span>
                        <span>
                          Use the identified gaps to focus your learning and document relevant projects in your resume.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
            </div>





        </>
      ) : (
        <div className="workspace-evaluation-empty relative overflow-hidden p-6 sm:p-10 text-center space-y-6 bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 rounded-3xl shadow-elevated">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-md mx-auto">
            <div className="workspace-empty-symbol mx-auto w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <Compass className="w-7 h-7 text-brand" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Your match analysis starts here
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Select a position from the live feed or import your custom job description to inspect your match.
            </p>
          </div>

          {/* What You'll Unlock Preview Card (Calm, non-interactive visual explanation) */}
          <div className="relative z-10 max-w-sm mx-auto p-4 rounded-2xl bg-surface/30 border border-border/60 text-left space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>What you'll see upon selecting a role</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span><strong className="text-foreground">100-point fit score</strong> with ATS keyword match</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span><strong className="text-foreground">Missing competencies</strong> & critical requirements</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span><strong className="text-foreground">1-click tailored resume</strong> & behavioral STAR questions</span>
              </li>
            </ul>
          </div>

          <div className="pt-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setSearchExpanded(true);
                setIsCustomJdOpen(true);
                setTimeout(() => {
                  const el = document.getElementById('custom-jd-accordion');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
                    if (input) input.focus();
                  }
                }, 50);
              }}
              className="gap-2 text-brand text-xs font-semibold cursor-pointer hover:bg-brand/10"
            >
              Import a job description <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Share Fetched Roles Dialog */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-roles-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mobile-dialog-heading px-6 py-5 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="share-roles-title" className="font-display text-base sm:text-lg font-semibold text-foreground">
                    Share Fetched Roles
                  </h3>
                  <p className="text-xs text-subtle">
                    Share {filteredAtsJobs.length} live positions for {searchRoleLabel}
                    {selectedAtsLocation !== 'All' ? ` in ${selectedAtsLocation}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Shareable Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Direct Shareable Link</span>
                  {isLinkCopied && (
                    <span className="text-xs text-success flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={buildShareUrl()}
                    className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-hidden focus:border-brand/60 select-all"
                  />
                  <Button
                    type="button"
                    variant={isLinkCopied ? 'secondary' : 'default'}
                    onClick={handleCopyShareUrl}
                    className="shrink-0 text-xs font-semibold cursor-pointer"
                  >
                    {isLinkCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-subtle">
                  Anyone opening this link will see these exact search filters and all matching live positions loaded automatically.
                </p>
              </div>

              {/* Action Buttons: Native Share + Copy Formatted Text List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyRolesList}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isListCopied
                      ? 'bg-success/15 border-success/40 text-success'
                      : 'border-border bg-surface hover:bg-surface-2 text-foreground'
                  }`}
                >
                  {isListCopied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="font-semibold">Text List Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-brand" />
                      <span>Copy List (for WhatsApp / Slack)</span>
                    </>
                  )}
                </button>

                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-2 text-foreground text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-brand" />
                    <span>Share via Apps...</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border border-border/60 bg-surface/50 text-[11px] text-subtle flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                    <span>Link ready to paste into any chat or email</span>
                  </div>
                )}
              </div>

              {/* Roles Preview */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs text-subtle">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Positions Included ({filteredAtsJobs.length})
                  </span>
                  <span>{uniqueCompaniesCount} companies</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-xl">
                  {filteredAtsJobs.slice(0, 15).map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xl border border-border bg-surface/60 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">{job.title}</div>
                        <div className="text-[11px] text-subtle truncate flex items-center gap-2 mt-0.5">
                          <span className="text-brand font-medium">{job.company}</span>
                          {job.location && <span>• {job.location}</span>}
                          {job.workplaceType && <span>• {job.workplaceType}</span>}
                        </div>
                      </div>
                      {job.applyUrl && (
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-subtle hover:text-foreground shrink-0"
                          title="Open requisition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                  {filteredAtsJobs.length > 15 && (
                    <div className="text-center py-1 text-[11px] text-subtle">
                      + {filteredAtsJobs.length - 15} more positions included in the link
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-border bg-surface/40 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsShareModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* All Filters Deep Modal */}
      <AllFiltersModal
        isOpen={isAllFiltersOpen}
        onClose={() => setIsAllFiltersOpen(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAllFilters}
        onResetFilters={handleResetAllFilters}
        totalCatalogueJobs={totalInCatalogue}
        candidateProfileContext={profileSearchContext}
      />
    </div>
  );
};
