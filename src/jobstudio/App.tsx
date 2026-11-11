// @ts-nocheck -- ported verbatim from the original project
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bug, CheckCircle2, ExternalLink } from 'lucide-react';
import { Header } from './components/Header';
import { BusyIndicator } from './components/BusyIndicator';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { HomeView } from './components/HomeView';
import { AuthView } from './components/AuthView';
import { supabase } from '@/integrations/supabase/client';
import { installCloudSync, startCloudSession, endCloudSession } from './utils/cloudSync';
import { CinematicHome } from './components/CinematicHome';
import { CareerRoadmapsView } from './components/CareerRoadmapsView';
import { JobEvaluatorView } from './components/JobEvaluatorView';
import { ResumeDocument } from './components/ResumeDocument';
import { CoverLetterView } from './components/CoverLetterView';
import { ReferralMessageView } from './components/ReferralMessageView';
import { ScreeningAnswersView } from './components/ScreeningAnswersView';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { AppliedJobsView } from './components/AppliedJobsView';
import { PricingView } from './components/PricingView';
import { ProfileBuilderView } from './components/ProfileBuilderView';
import { RecruiterReviewModal, RecruiterPanelData } from './components/RecruiterReviewModal';
import { ReportBugModal } from './components/ReportBugModal';
import { generatePlainTextResume } from './utils/pdfExport';
import { sortExperiencesReverseChronological } from './utils/chronology';
import {
  getUserMasterProfile,
  saveUserMasterProfile,
  profileRecordToResume,
  profileRecordToCandidateInfo,
  SAMPLE_CANDIDATE_PROFILE,
} from './data/candidateProfiles';
import {
  PRESET_JOBS,
  MASTER_BASE_RESUME,
  EMPTY_EVALUATION,
  EMPTY_COVER_LETTER,
  JobEvaluationData,
  TailoredResumeData,
  CoverLetterData,
  ScreeningAnswer,
  InterviewPrepQuestion,
  CandidateInfo,
  JobOpportunity,
  AppliedJobRecord,
} from './data/defaultData';
import { applyJobUpdate, withCreatedEvent, withNewResumeVersion } from './data/applicationHistory';
import { downloadResumeAsPdf } from './utils/pdfExport';
import { installApiAuth, fetchEntitlement } from './utils/apiAuth';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { ProductTour } from './components/onboarding/ProductTour';
import { GettingStartedChecklist } from './components/onboarding/GettingStartedChecklist';
import { ProfileActivationModal } from './components/onboarding/ProfileActivationModal';
import { PostApplyTrackingBanner } from './components/PostApplyTrackingBanner';
import { TOUR_STEPS } from './components/onboarding/tourSteps';
import { readOnboarding, shouldShowOnboarding, writeOnboarding, type OnboardingState } from './components/onboarding/onboardingState';
import { readWorkspaceTab, rememberWorkspaceTab, clearWorkspaceTab } from './utils/workspaceNavigation';

installApiAuth();

const getAppliedJobsKey = (email?: string): string => {
  const clean = (email || '').toLowerCase().trim();
  if (!clean) {
    return 'jobstudio_applied_jobs_demo';
  }
  return `jobstudio_applied_jobs_${clean}`;
};

const loadUserAppliedJobs = (email?: string): AppliedJobRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getAppliedJobsKey(email);
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse applied jobs from localStorage', e);
  }
  return [];
};

export type PlanTier = 'free' | 'plus' | 'pro';

const getUserPlanKey = (email?: string): string => {
  const clean = (email || '').toLowerCase().trim();
  return `jobstudio_plan_${clean}`;
};

const getProUserKey = (email?: string): string => {
  const clean = (email || '').toLowerCase().trim();
  return `jobstudio_is_pro_${clean}`;
};

const getTailoredCountKey = (email?: string): string => {
  const clean = (email || '').toLowerCase().trim();
  return `jobstudio_tailored_count_${clean}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        if (p.get('tab') === 'evaluator' || p.has('keyword') || p.has('share')) {
          return 'evaluator';
        }
      } catch { /* ignore */ }
    }
    return 'home';
  });
  const [sessionChecked, setSessionChecked] = useState(false);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobText, setCustomJobText] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');

  // Authentication & Account State (1 User Account = 1 Master Profile)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobstudio_logged_in') === 'true';
    }
    return false;
  });

  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobstudio_user_name') || 'Candidate';
    }
    return 'Candidate';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobstudio_user_email') || '';
    }
    return '';
  });

  const handleLogin = (name: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    setIsLoggedIn(true);
    setUserName(cleanName);
    setUserEmail(cleanEmail);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobstudio_logged_in', 'true');
      localStorage.setItem('jobstudio_user_name', cleanName);
      localStorage.setItem('jobstudio_user_email', cleanEmail);
      // Clean up legacy unscoped key so it never leaks
      localStorage.removeItem('jobstudio_applied_jobs');
    }
    const userProfile = getUserMasterProfile(cleanEmail, cleanName);
    setMasterProfileText(userProfile.masterProfileText);
    setCandidateInfo(profileRecordToCandidateInfo(userProfile));
    setResume(profileRecordToResume(userProfile));

    // Load user-scoped applied jobs
    const userJobs = loadUserAppliedJobs(cleanEmail);
    setAppliedJobs(userJobs);

    // Load user-scoped Pro/Plus status & tailored count
    const savedPlan = (localStorage.getItem(getUserPlanKey(cleanEmail)) as PlanTier) || (localStorage.getItem(getProUserKey(cleanEmail)) === 'true' ? 'pro' : 'free');
    setUserPlan(savedPlan);
    const userTailored = localStorage.getItem(getTailoredCountKey(cleanEmail));
    setTailoredCount(userTailored ? parseInt(userTailored, 10) : 0);
  };

  const handleLogout = () => {
    if (onboardingUserId) clearWorkspaceTab(onboardingUserId);
    void endCloudSession().then(() => supabase.auth.signOut());
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobstudio_logged_in', 'false');
      localStorage.removeItem('jobstudio_user_name');
      localStorage.removeItem('jobstudio_user_email');
      localStorage.removeItem('jobstudio_applied_jobs');
    }
    setUserName('');
    setUserEmail('');
    setAppliedJobs([]);
    setTailoredCount(0);
    setIsProUser(false);
    setCandidateInfo({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    });
    setMasterProfileText('');
    setResume(MASTER_BASE_RESUME);
    setEvaluation(EMPTY_EVALUATION);
    setCoverLetter(EMPTY_COVER_LETTER);
    setScreeningAnswers([]);
    setInterviewQuestions([]);
    setOpportunities([]);
    setSelectedJobId('');
    setCustomJobText('');
    setCustomUrl('');
    setActiveTab('home');
  };

  const [evaluation, setEvaluation] = useState<JobEvaluationData>(EMPTY_EVALUATION);
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
  const [resume, setResume] = useState<TailoredResumeData>(() => {
    if (typeof window !== 'undefined') {
      const isLogged = localStorage.getItem('jobstudio_logged_in') === 'true';
      const email = localStorage.getItem('jobstudio_user_email') || '';
      const name = localStorage.getItem('jobstudio_user_name') || '';
      if (isLogged && email) {
        const p = getUserMasterProfile(email, name);
        if (p) return profileRecordToResume(p);
      }
    }
    return MASTER_BASE_RESUME;
  });
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(EMPTY_COVER_LETTER);
  const [screeningAnswers, setScreeningAnswers] = useState<ScreeningAnswer[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewPrepQuestion[]>([]);
  const [isFetchingInterviewPrep, setIsFetchingInterviewPrep] = useState<boolean>(false);

  const [masterProfileText, setMasterProfileText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const isLogged = localStorage.getItem('jobstudio_logged_in') === 'true';
      const email = localStorage.getItem('jobstudio_user_email') || '';
      const name = localStorage.getItem('jobstudio_user_name') || '';
      if (isLogged && email) {
        const p = getUserMasterProfile(email, name);
        if (p?.masterProfileText) return p.masterProfileText;
      }
    }
    return '';
  });
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>(() => {
    if (typeof window !== 'undefined') {
      const isLogged = localStorage.getItem('jobstudio_logged_in') === 'true';
      const email = localStorage.getItem('jobstudio_user_email') || '';
      const name = localStorage.getItem('jobstudio_user_name') || '';
      if (isLogged && email) {
        const p = getUserMasterProfile(email, name);
        if (p) return profileRecordToCandidateInfo(p);
      }
    }
    return {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    };
  });

  // Real accounts (Lovable Cloud): restore saved data on sign-in, keep browser state in sync with the session.
  // Onboarding (per account): welcome screen once for new sign-ups, replayable tour, checklist.
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const onboardingPendingRef = React.useRef(false);
  const updateOnboarding = (patch: Partial<OnboardingState>) => {
    if (!onboardingUserId) return;
    setOnboarding(writeOnboarding(onboardingUserId, patch));
  };
  const startTour = () => {
    onboardingPendingRef.current = false;
    updateOnboarding({ welcomed: true });
    setTourStep(0);
    setActiveTab(TOUR_STEPS[0].tab);
    window.scrollTo(0, 0);
  };
  const goToTourStep = (step: number) => {
    setTourStep(step);
    const target = TOUR_STEPS[step];
    if (target) { setActiveTab(target.tab); window.scrollTo(0, 0); }
  };
  const closeTour = (completed: boolean) => {
    setTourStep(null);
    updateOnboarding({ tourDone: true, welcomed: true });
    if (completed) { setActiveTab('profile'); window.scrollTo(0, 0); }
  };
  const skipWelcome = () => {
    onboardingPendingRef.current = false;
    updateOnboarding({ welcomed: true });
    setActiveTab('profile');
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    if (!onboardingUserId || !onboarding || onboarding.visited.includes(activeTab)) return;
    if (!['roadmaps', 'evaluator', 'resume', 'applied', 'screening'].includes(activeTab)) return;
    updateOnboarding({ visited: [...onboarding.visited, activeTab] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, onboardingUserId]);

  const handleLoginRef = React.useRef(handleLogin);
  handleLoginRef.current = handleLogin;

  // Returning to the Job Evaluator from the tailored resume lands on the evaluation
  // card (match, gaps, Recruiter Panel Review / View Resume) instead of the top of the tab.
  const prevTabRef = React.useRef(activeTab);
  React.useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (activeTab === 'evaluator' && prev === 'resume' && evaluation.match_score > 0) {
      requestAnimationFrame(() => {
        document.getElementById('evaluation-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [activeTab]);
  useEffect(() => {
    installCloudSync();
    let lastUserId: string | null = null;
    const apply = async (session: any) => {
      const user = session?.user;
      if (!user) {
        if (lastUserId !== null || localStorage.getItem('jobstudio_logged_in') === 'true') {
          if (lastUserId) clearWorkspaceTab(lastUserId);
          lastUserId = null;
          await endCloudSession();
          setIsLoggedIn(false);
          localStorage.setItem('jobstudio_logged_in', 'false');
          localStorage.removeItem('jobstudio_user_name');
          localStorage.removeItem('jobstudio_user_email');
        }
        return;
      }
      if (user.id === lastUserId) return;
      lastUserId = user.id;
      await startCloudSession(user.id);
      const name = user.user_metadata?.full_name || user.user_metadata?.name || (user.email || '').split('@')[0];
      handleLoginRef.current(name, user.email || '');
      setOnboardingUserId(user.id);
      if (shouldShowOnboarding(user.id, user.created_at)) {
        setOnboarding(writeOnboarding(user.id, {}));
        onboardingPendingRef.current = true;
        try { sessionStorage.removeItem('jobstudio_auth_intent'); } catch { /* ignore */ }
        setActiveTab('onboarding');
        window.scrollTo(0, 0);
        return;
      }
      setOnboarding(readOnboarding(user.id));
      // After a successful sign-in launched from the auth screen (e.g. Google
      // OAuth returns to the site root), open the workspace. Runs after the
      // login state applies so the signed-out snap-back rule cannot override it.
      const signingIn = sessionStorage.getItem('jobstudio_auth_intent') !== null;
      sessionStorage.removeItem('jobstudio_auth_intent');
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const hasEvaluatorParam = urlParams?.get('tab') === 'evaluator' || urlParams?.has('keyword') || urlParams?.has('share');
      setActiveTab(hasEvaluatorParam || signingIn ? 'evaluator' : readWorkspaceTab(user.id));
      window.scrollTo(0, 0);
    };
    // Serialize restoration so overlapping sign-in events cannot finish the
    // initial session check before account data and navigation are ready.
    let restoration = Promise.resolve();
    const restore = (session: any) => {
      restoration = restoration.catch(() => {}).then(() => apply(session));
      return restoration;
    };
    supabase.auth.getSession().then(({ data }) => restore(data.session)).finally(() => setSessionChecked(true));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setTimeout(() => restore(session), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionChecked && isLoggedIn && onboardingUserId) {
      rememberWorkspaceTab(onboardingUserId, activeTab);
    }
  }, [sessionChecked, isLoggedIn, onboardingUserId, activeTab]);

  // Re-sync master profile and user-scoped data across application whenever user account changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Purge legacy unscoped key so it never leaks across accounts
      localStorage.removeItem('jobstudio_applied_jobs');
    }

    if (isLoggedIn && userEmail) {
      const cleanEmail = userEmail.toLowerCase().trim();

      // 1. Master profile sync
      const p = getUserMasterProfile(cleanEmail, userName);
      if (p) {
        setMasterProfileText(p.masterProfileText);
        setCandidateInfo(profileRecordToCandidateInfo(p));
        setResume(profileRecordToResume(p));
      }

      // 2. Applied jobs isolation (strictly scoped to this user)
      const userJobs = loadUserAppliedJobs(cleanEmail);
      setAppliedJobs(userJobs);

      // 3. Pro status & quota isolation
      const savedPlan = (localStorage.getItem(getUserPlanKey(cleanEmail)) as PlanTier) || (localStorage.getItem(getProUserKey(cleanEmail)) === 'true' ? 'pro' : 'free');
      setUserPlan(savedPlan);

      const userTailored = localStorage.getItem(getTailoredCountKey(cleanEmail));
      setTailoredCount(userTailored ? parseInt(userTailored, 10) : 0);
    } else if (!isLoggedIn) {
      setAppliedJobs([]);
      setTailoredCount(0);
      setUserPlan('free');
      setCandidateInfo({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      });
      setMasterProfileText('');
    }
  }, [isLoggedIn, userEmail, userName]);

  // Tab navigation must not rehydrate the master resume over tailored materials.
  // Keep the signed-out navigation guard separate from account synchronization.
  useEffect(() => {
    if (!sessionChecked) return;
    if (isLoggedIn && activeTab === 'auth') {
      setActiveTab(onboardingPendingRef.current ? 'onboarding' : 'evaluator');
      window.scrollTo(0, 0);
      return;
    }
    if (!isLoggedIn && activeTab !== 'home' && activeTab !== 'auth') {
      setActiveTab('home');
    }
  }, [sessionChecked, isLoggedIn, activeTab]);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(false);
  const [postApplyPrompt, setPostApplyPrompt] = useState<{
    isOpen: boolean;
    jobTitle: string;
    companyName: string;
    applyUrl?: string;
  } | null>(null);
  const [isReportBugOpen, setIsReportBugOpen] = useState<boolean>(false);

  // 3-Tier Subscription (Free, Plus, Pro) & Tailoring Quota State (strictly user-scoped)
  const [userPlan, setUserPlan] = useState<PlanTier>(() => {
    if (typeof window !== 'undefined') {
      try {
        const email = (localStorage.getItem('jobstudio_user_email') || '').toLowerCase().trim();
        const plan = localStorage.getItem(getUserPlanKey(email)) as PlanTier;
        if (plan === 'pro' || plan === 'plus' || plan === 'free') return plan;
        if (localStorage.getItem(getProUserKey(email)) === 'true') return 'pro';
        return 'free';
      } catch {
        return 'free';
      }
    }
    return 'free';
  });

  const isProUser = userPlan === 'pro';
  const isPlusUser = userPlan === 'plus';

  const [tailoredCount, setTailoredCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const email = (localStorage.getItem('jobstudio_user_email') || '').toLowerCase().trim();
        const val = localStorage.getItem(getTailoredCountKey(email));
        return val ? parseInt(val, 10) : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  // Recruiter-Panel Multi-Persona Review State
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState<boolean>(false);
  const [recruiterReviewData, setRecruiterReviewData] = useState<RecruiterPanelData | null>(null);
  const [isLoadingRecruiterReview, setIsLoadingRecruiterReview] = useState<boolean>(false);

  const handleRunRecruiterReview = async () => {
    setIsLoadingRecruiterReview(true);
    try {
      const resumeText = generatePlainTextResume(resume);
      const response = await fetch('/api/recruiter-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobTitle: evaluation.job_title || currentPreset?.title || 'Target Role',
          companyName: evaluation.company_name || currentPreset?.company || 'Target Employer',
          jobDescription: customJobText || currentPreset?.description || '',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRecruiterReviewData(data);
      }
    } catch (err) {
      console.error('Error running recruiter review:', err);
    } finally {
      setIsLoadingRecruiterReview(false);
    }
  };

  // Plan status and tailoring usage come from the server; the browser never grants Pro.
  useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;
    fetchEntitlement().then((ent) => {
      if (cancelled || !ent) return;
      const nextPlan: PlanTier = ent.plan || (ent.isPro ? 'pro' : ent.isPlus ? 'plus' : 'free');
      setUserPlan(nextPlan);
      setTailoredCount(ent.tailoredCount ?? 0);
      if (typeof window !== 'undefined' && userEmail) {
        try {
          localStorage.setItem(getUserPlanKey(userEmail), nextPlan);
          localStorage.setItem(getProUserKey(userEmail), String(nextPlan === 'pro'));
        } catch {}
      }
    });
    return () => { cancelled = true; };
  }, [userEmail]);

  const handleUpgradeToPlan = (targetPlan: 'plus' | 'pro') => {
    alert(`Online checkout is not available yet, so ${targetPlan === 'pro' ? 'Pro' : 'Plus'} cannot be activated from here.`);
  };

  const handleUpgradeToPro = () => {
    handleUpgradeToPlan('pro');
  };

  const handleDowngradeToFree = () => {
    setUserPlan('free');
    if (typeof window !== 'undefined' && userEmail) {
      try {
        localStorage.setItem(getUserPlanKey(userEmail), 'free');
        localStorage.setItem(getProUserKey(userEmail), 'false');
      } catch {}
    }
  };

  // Applied Jobs Tracking State with localStorage Persistence (strictly user-scoped)
  const [appliedJobs, setAppliedJobs] = useState<AppliedJobRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('jobstudio_user_email') || '';
      return loadUserAppliedJobs(email);
    }
    return [];
  });

  // Sync applied jobs to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
      try {
        const key = getAppliedJobsKey(userEmail);
        localStorage.setItem(key, JSON.stringify(appliedJobs));
        // Ensure legacy global key is wiped
        localStorage.removeItem('jobstudio_applied_jobs');
      } catch (e) {
        console.error('Failed to save applied jobs to localStorage', e);
      }
    }
  }, [appliedJobs, userEmail]);

  const handleAddAppliedJob = (jobData: Omit<AppliedJobRecord, 'id' | 'created_at'>) => {
    const newRecord: AppliedJobRecord = withCreatedEvent({
      ...jobData,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: Date.now(),
    });
    setAppliedJobs((prev) => [newRecord, ...prev]);
  };

  const handleUpdateAppliedJob = (id: string, updates: Partial<AppliedJobRecord>) => {
    setAppliedJobs((prev) => prev.map((j) => (j.id === id ? applyJobUpdate(j, updates) : j)));
  };

  // Save the current tailored resume as an immutable, labelled version on an application
  const handleSaveResumeVersion = (jobId: string, resumeSnapshot: TailoredResumeData) => {
    setAppliedJobs((prev) =>
      prev.map((j) => (j.id === jobId ? withNewResumeVersion(j, resumeSnapshot, j.match_score) : j))
    );
  };

  const handleDeleteAppliedJob = (id: string) => {
    setAppliedJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleClearAllAppliedJobs = () => {
    setAppliedJobs([]);
  };

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

  const trackedJobRecord = appliedJobs.find(
    (j) =>
      Boolean(evaluation.company_name) &&
      Boolean(evaluation.job_title) &&
      j.company_name.toLowerCase() === evaluation.company_name.toLowerCase() &&
      j.job_title.toLowerCase() === evaluation.job_title.toLowerCase()
  );

  const effectiveApplyUrl =
    (activeOpportunity?.applyUrl && activeOpportunity.applyUrl.startsWith('http')
      ? activeOpportunity.applyUrl
      : '') ||
    (trackedJobRecord?.apply_url && trackedJobRecord.apply_url.startsWith('http')
      ? trackedJobRecord.apply_url
      : '') ||
    (customUrl && customUrl.startsWith('http') ? customUrl : '') ||
    (evaluation.company_name
      ? `https://www.google.com/search?q=${encodeURIComponent(
          `${evaluation.company_name} ${evaluation.job_title || ''} careers apply`
        )}`
      : '');

  const isCurrentJobTracked = Boolean(
    evaluation.company_name &&
    evaluation.job_title &&
    appliedJobs.some(
      (j) =>
        j.company_name.toLowerCase() === evaluation.company_name.toLowerCase() &&
        j.job_title.toLowerCase() === evaluation.job_title.toLowerCase()
    )
  );

  const handleTriggerPostApplyPrompt = (url?: string) => {
    const jobTitle = evaluation.job_title || activeOpportunity?.title || currentPreset?.title || 'Target Role';
    const companyName = evaluation.company_name || activeOpportunity?.company || currentPreset?.company || '';
    setPostApplyPrompt({
      isOpen: true,
      jobTitle,
      companyName,
      applyUrl: url || effectiveApplyUrl,
    });
  };

  const handleTrackCurrentJob = (customData?: {
    company_name?: string;
    job_title?: string;
    location?: string;
    platform?: string;
    apply_url?: string;
    match_score?: number;
    resume_snapshot?: TailoredResumeData;
    forceAdd?: boolean;
  }) => {
    const company = customData?.company_name || evaluation.company_name;
    const title = customData?.job_title || evaluation.job_title;
    if (!company || !title) return;

    const existingIndex = appliedJobs.findIndex(
      (j) =>
        j.company_name.toLowerCase() === company.toLowerCase() &&
        j.job_title.toLowerCase() === title.toLowerCase()
    );

    if (existingIndex >= 0) {
      if (customData?.forceAdd) {
        // Keep tracked as applied and snapshot the current tailored resume
        setAppliedJobs((prev) =>
          prev.map((j, idx) => {
            if (idx !== existingIndex) return j;
            let updated = { ...j, status: 'Applied' as const };
            const resumeToSnapshot = customData?.resume_snapshot || resume;
            if (resumeToSnapshot) {
              updated = withNewResumeVersion(updated, resumeToSnapshot, updated.match_score);
            }
            return updated;
          })
        );
      } else {
        // Toggle OFF: Remove from appliedJobs so button flips back to "Mark as applied"
        setAppliedJobs((prev) => prev.filter((_, idx) => idx !== existingIndex));
      }
    } else {
      // Toggle ON: Add to appliedJobs
      const resolvedApplyUrl =
        customData?.apply_url ||
        effectiveApplyUrl ||
        (customUrl && customUrl.startsWith('http') ? customUrl : undefined);

      let newRecord: AppliedJobRecord = withCreatedEvent({
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        company_name: company,
        job_title: title,
        location: customData?.location || evaluation.location_info || 'Remote / Hybrid',
        platform: customData?.platform || 'Direct Portal',
        apply_url: resolvedApplyUrl || undefined,
        applied_date: new Date().toISOString().split('T')[0],
        match_score: customData?.match_score || evaluation.match_score || 90,
        status: 'Applied',
        created_at: Date.now(),
      });

      // Automatically snapshot current tailored resume state to the job record
      const resumeToSnapshot = customData?.resume_snapshot || resume;
      if (resumeToSnapshot) {
        newRecord = withNewResumeVersion(newRecord, resumeToSnapshot, newRecord.match_score);
      }

      setAppliedJobs((prev) => [newRecord, ...prev]);
    }
  };

  // Sync active resume to global window for seamless export across tabs
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__JOBSTUDIO_ACTIVE_RESUME__ = resume;
    }
  }, [resume]);

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const safeTitle = (evaluation.company_name && evaluation.job_title)
      ? (evaluation.company_name + '_' + evaluation.job_title).replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'Master';
    const fileName = `${safeTitle}_${resume.full_name.replace(/\s+/g, '_')}_Resume.pdf`;
    const success = await downloadResumeAsPdf('printable-resume-container', fileName, true, resume);
    setIsDownloadingPdf(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  // Switch preset or live discovered target opportunity
  const handleSelectPreset = (jobId: string, jobOverride?: JobOpportunity) => {
    setIsEvaluationComplete(false);
    // If clicking the currently selected job or clearing, return to plain state
    if (!jobId || (jobId === selectedJobId && !jobOverride)) {
      setSelectedJobId('');
      setCustomJobText('');
      setCustomUrl('');
      setEvaluation(EMPTY_EVALUATION);
      setResume(profileRecordToResume(getUserMasterProfile(userEmail, userName)));
      setCoverLetter(EMPTY_COVER_LETTER);
      setScreeningAnswers([]);
      setInterviewQuestions([]);
      return;
    }

    setSelectedJobId(jobId);
    const found = jobOverride ?? opportunities.find((j) => j.id === jobId);
    if (!found) return;

    setCustomJobText(found.description);
    setCustomUrl(found.applyUrl);
    setEvaluation({ ...EMPTY_EVALUATION, job_title: found.title, company_name: found.company,
      location_info: found.location, executive_summary: 'Full assessment pending.' });
    setResume(profileRecordToResume(getUserMasterProfile(userEmail, userName)));
    setCoverLetter(EMPTY_COVER_LETTER);
    setScreeningAnswers([]);
    setInterviewQuestions([]);
  };

  // Reset all tailored content back to clean slate derived from user's Master Profile
  const handleResetWorkspace = () => {
    setSelectedJobId('');
    setCustomJobText('');
    setCustomUrl('');
    setEvaluation(EMPTY_EVALUATION);
    setResume(profileRecordToResume(getUserMasterProfile(userEmail, userName)));
    setCoverLetter(EMPTY_COVER_LETTER);
    setScreeningAnswers([]);
    setInterviewQuestions([]);
  };

  // Remove a specific opportunity from active view
  const handleRemoveOpportunity = (jobId: string) => {
    setOpportunities((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) {
      setSelectedJobId('');
      setCustomJobText('');
      setCustomUrl('');
      setEvaluation(EMPTY_EVALUATION);
      setResume(profileRecordToResume(getUserMasterProfile(userEmail, userName)));
      setCoverLetter(EMPTY_COVER_LETTER);
      setScreeningAnswers([]);
      setInterviewQuestions([]);
    }
  };

  // Clear all opportunities to start completely clean
  const handleClearAllOpportunities = () => {
    setOpportunities([]);
    setSelectedJobId('');
    setCustomJobText('');
    setCustomUrl('');
    setEvaluation(EMPTY_EVALUATION);
    setResume(profileRecordToResume(getUserMasterProfile(userEmail, userName)));
    setCoverLetter(EMPTY_COVER_LETTER);
    setScreeningAnswers([]);
    setInterviewQuestions([]);
  };

  const handleApplySampleProfile = () => {
    const sample = SAMPLE_CANDIDATE_PROFILE;
    saveUserMasterProfile(sample, userEmail);
    setMasterProfileText(sample.masterProfileText);
    setCandidateInfo(profileRecordToCandidateInfo(sample));
    setResume(profileRecordToResume(sample));
    setIsActivationModalOpen(false);
  };

  // Call Gemini backend to evaluate & tailor
  const handleRunEvaluation = async (overrideJobText?: string) => {
    let jobDescription = typeof overrideJobText === 'string' && overrideJobText.trim()
      ? overrideJobText.trim()
      : customJobText;
    if (!jobDescription) {
      const preset = PRESET_JOBS.find((j) => j.id === selectedJobId);
      jobDescription = preset?.description || '';
    }

    if (!jobDescription) {
      alert('Please select a preset job or paste a job description.');
      return;
    }

    // Activation Guardrail: if master profile is empty, prompt user to add their profile or explore with sample profile
    const isProfileEmpty =
      !masterProfileText ||
      !masterProfileText.trim() ||
      /No resume uploaded yet/i.test(masterProfileText);

    if (isProfileEmpty) {
      setIsActivationModalOpen(true);
      return;
    }

    // Enforce monthly tailoring quotas across Free (2/mo), Plus (50/mo), Pro (Unlimited)
    const planLimit = userPlan === 'plus' ? 50 : userPlan === 'pro' ? Infinity : 2;
    if (tailoredCount >= planLimit) {
      if (userPlan === 'plus') {
        if (
          confirm(
            'You have reached your monthly limit of 50 tailored resumes on the Plus plan.\n\nUpgrade to Pro for $9.99/mo to unlock unlimited AI resume tailoring, full interview prep intelligence, and salary negotiation.\n\nWould you like to view plans?'
          )
        ) {
          setActiveTab('pricing');
        }
      } else {
        if (
          confirm(
            'You have reached your monthly limit of 2 free tailored resumes.\n\nUpgrade to Plus ($4.99/mo for 50 resumes) or Pro ($9.99/mo for unlimited tailoring) to continue.\n\nWould you like to view plans?'
          )
        ) {
          setActiveTab('pricing');
        }
      }
      return;
    }

    setIsEvaluating(true);
    try {
      // 1. Evaluate Job
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobText: jobDescription,
          masterProfile: masterProfileText,
          minScore: 70,
        }),
      });

      if (!evalRes.ok) {
        const errData = await evalRes.json().catch(() => null);
        throw new Error(errData?.error || 'Evaluation request failed');
      }

      const evalData: JobEvaluationData = await evalRes.json();
      setEvaluation(evalData);
      setIsEvaluationComplete(true);

      // Immediately synchronize the evaluated score & summary back to the saved opportunity card
      if (selectedJobId) {
        setOpportunities((prev) =>
          prev.map((opp) =>
            opp.id === selectedJobId
              ? {
                  ...opp,
                  matchScore: evalData.match_score,
                  matchHighlight:
                    evalData.executive_summary?.trim() ||
                    evalData.key_matching_factors?.[0] ||
                    opp.matchHighlight,
                }
              : opp
          )
        );
      }

      // 2. Generate Tailored Resume and Materials
      const tailorRes = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobText: jobDescription,
          masterProfile: masterProfileText,
          recommendations: evalData.tailoring_recommendations,
          candidateInfo: candidateInfo,
        }),
      });

      if (!tailorRes.ok) {
        const errData = await tailorRes.json().catch(() => null);
        throw new Error(errData?.error || 'Tailoring request failed');
      }

      const tailorData = await tailorRes.json();

      // Update resume state
      setResume({
        full_name: `${candidateInfo.first_name} ${candidateInfo.last_name}`,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        location: '',
        linkedin: candidateInfo.linkedin,
        tailored_summary: tailorData.tailored_summary,
        skills: tailorData.skills,
        experiences: sortExperiencesReverseChronological(tailorData.experiences || []),
        projects: Array.isArray(tailorData.projects) ? tailorData.projects : [],
        education: getUserMasterProfile(userEmail, userName).education,
        certifications: Array.isArray(tailorData.certifications)
          ? tailorData.certifications.filter((credential: string) =>
              getUserMasterProfile(userEmail, userName).certifications.includes(credential))
          : getUserMasterProfile(userEmail, userName).certifications,
      });

      // Update cover letter
      if (tailorData.cover_letter) {
        setCoverLetter(tailorData.cover_letter);
      }

      // Update screening answers
      if (tailorData.screening_answers) {
        setScreeningAnswers(tailorData.screening_answers);
      }

      // Concurrently fetch interview questions & portal intelligence for the evaluated role
      handleFetchInterviewPrep(evalData.company_name, evalData.job_title, jobDescription);

      // Increment tailored resume count for users with quotas (Free and Plus)
      if (userPlan !== 'pro') {
        setTailoredCount((prev) => {
          const next = prev + 1;
          if (typeof window !== 'undefined' && userEmail) {
            try {
              localStorage.setItem(getTailoredCountKey(userEmail), next.toString());
            } catch {}
          }
          return next;
        });
      }

      // Stay on the Job Evaluator after tailoring — the user opens the tailored resume
      // themselves via "View Resume".
    } catch (err: any) {
      console.error('Error running evaluation:', err);
      alert(err?.message || 'Failed to evaluate with Gemini API. Please check server logs or API key.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Fetch interview prep questions & answers from portals or role generation
  const handleFetchInterviewPrep = async (company?: string, role?: string, jd?: string) => {
    setIsFetchingInterviewPrep(true);
    try {
      const targetCompany = company || evaluation.company_name;
      const targetRole = role || evaluation.job_title;
      const targetJd = jd || customJobText || `${targetRole} at ${targetCompany}`;

      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: targetCompany,
          jobTitle: targetRole,
          company: targetCompany,
          role: targetRole,
          jobDescription: targetJd,
          masterProfile: masterProfileText,
          candidateProfile: masterProfileText,
        }),
      });

      if (!res.ok) {
        throw new Error('Interview prep request failed');
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setInterviewQuestions(data.questions);
      }
    } catch (err: any) {
      console.error('Error fetching interview prep:', err);
      alert('Failed to fetch interview questions. Please check server logs or API key.');
    } finally {
      setIsFetchingInterviewPrep(false);
    }
  };

  // Landing pages must never open workspace tabs for visitors without an
  // account: send them to the sign-in screen instead (matches the search CTAs).
  const handleLandingNavigate = (tab: string) => {
    if (isLoggedIn && tab === 'auth') {
      setActiveTab('evaluator');
      window.scrollTo(0, 0);
      return;
    }
    if (!isLoggedIn && tab !== 'home' && tab !== 'auth') {
      setActiveTab('auth');
      window.scrollTo(0, 0);
      return;
    }
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const currentPreset = activeOpportunity || PRESET_JOBS.find((j) => j.id === selectedJobId);
  const activeRoleTitle = evaluation.job_title || currentPreset?.title;
  const activeCompanyName = evaluation.company_name || currentPreset?.company;
  const activeRoleBadge = activeRoleTitle && activeCompanyName
    ? `Active: ${activeRoleTitle} @ ${activeCompanyName}`
    : activeRoleTitle
      ? `Active: ${activeRoleTitle}`
      : activeCompanyName
        ? `Active: @ ${activeCompanyName}`
        : undefined;

  if (!sessionChecked) return <main className="min-h-screen bg-background p-6 flex items-center justify-center"><BusyIndicator label="Opening your workspace" /></main>;

  return (
    <div className={`min-h-screen text-foreground flex flex-col font-sans ${activeTab !== 'home' && activeTab !== 'auth' ? 'job-workspace' : ''}`}>
      {/* Top Bar Navigation: only on the auth screen; the signed-in landing page stays clean */}
      {isLoggedIn && activeTab === 'auth' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDownloadPdf={handleDownloadPdf}
          isDownloading={isDownloadingPdf}
          downloadSuccess={downloadSuccess}
          score={evaluation.match_score}
          appliedCount={appliedJobs.length}
          isProUser={isProUser}
          userPlan={userPlan}
          tailoredCount={tailoredCount}
          isLoggedIn={isLoggedIn}
          userName={userName}
          onOpenAuthModal={() => setActiveTab('home')}
          onLogout={handleLogout}
        />
      )}
      {isLoggedIn && activeTab === 'home' && (
        <div className="fixed top-4 right-4 z-50 no-print">
          <button type="button" onClick={() => setActiveTab('evaluator')} aria-label="Back to workspace" className="rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 text-sm text-foreground hover:bg-card transition-colors">
            Back to workspace
          </button>
        </div>
      )}

      {isLoggedIn && activeTab !== 'home' && activeTab !== 'auth' && activeTab !== 'onboarding' && <WorkspaceNavigation
        onStartTour={startTour}
        activeTab={activeTab} setActiveTab={setActiveTab} appliedCount={appliedJobs.length}
        userName={userName} userPlan={userPlan} isProUser={isProUser} tailoredCount={tailoredCount}
        onLogout={handleLogout}
        activeRole={activeRoleBadge}
        onReportBug={() => setIsReportBugOpen(true)}
      />}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 ${activeTab !== 'home' && activeTab !== 'auth' ? 'workspace-main' : ''}`}>
        {isLoggedIn && activeTab === 'onboarding' && (
          <WelcomeScreen
            userName={userName}
            userEmail={userEmail}
            onLogout={handleLogout}
            onStartTour={startTour}
            onSkip={skipWelcome}
            onNavigateToTab={(tab) => {
              onboardingPendingRef.current = false;
              updateOnboarding({ welcomed: true });
              setActiveTab(tab);
              window.scrollTo(0, 0);
            }}
          />
        )}
        {isLoggedIn && tourStep !== null && activeTab !== 'onboarding' && (
          <ProductTour step={tourStep} onStep={goToTourStep} onClose={closeTour} />
        )}
        {isLoggedIn && tourStep === null && onboarding?.welcomed && !onboarding.checklistDismissed
          && !['home', 'auth', 'onboarding'].includes(activeTab) && (() => {
            const items = [
              { id: 'profile', label: '1. Save your Master Profile', tab: 'profile', done: Boolean(masterProfileText.trim()) && !/No resume uploaded yet/i.test(masterProfileText) },
              { id: 'assess', label: '2. Evaluate and tailor a job', tab: 'evaluator', done: tailoredCount > 0 || evaluation.match_score > 0 },
              { id: 'docs', label: '3. Review tailored documents', tab: 'resume', done: Boolean(resume.tailored_summary && resume.tailored_summary.trim()) },
              { id: 'prep', label: '4. Prepare interview answers', tab: 'screening', done: screeningAnswers.length > 0 || interviewQuestions.length > 0 },
              { id: 'track', label: '5. Track an application', tab: 'applied', done: appliedJobs.length > 0 },
            ];
            if (items.every((i) => i.done)) return null;
            return <GettingStartedChecklist items={items} onOpen={(tab) => { setActiveTab(tab); window.scrollTo(0, 0); }} onDismiss={() => updateOnboarding({ checklistDismissed: true })} />;
          })()}
        {activeTab === 'auth' && !isLoggedIn && (
          <>
            <button type="button" onClick={() => { setActiveTab('home'); window.scrollTo(0, 0); }} className="cine-link">Back to Job Studio</button>
            <AuthView onLogin={() => setActiveTab('auth')} onNavigateToTab={(tab) => setActiveTab(onboardingPendingRef.current ? 'onboarding' : tab)} />
          </>
        )}

        {activeTab === 'home' && (
          <>
          <CinematicHome onNavigateToTab={handleLandingNavigate} />
          <HomeView
            onNavigateToTab={handleLandingNavigate}
            userPlan={userPlan}
            isProUser={isProUser}
            onUpgradeToPlan={handleUpgradeToPlan}
            onUpgradeToPro={handleUpgradeToPro}
            tailoredCount={tailoredCount}
            isLoggedIn={isLoggedIn}
            userName={userName}
            userEmail={userEmail}
            onLogin={() => handleLandingNavigate('auth')}
            onLogout={handleLogout}
          />
          </>
        )}

        {activeTab === 'roadmaps' && (
          <CareerRoadmapsView
            userEmail={userEmail}
            onSelectRoleForJobs={(roleTitle) => {
              setCustomJobText(`Target Role: ${roleTitle}`);
              setActiveTab('evaluator');
            }}
            onSelectRoleForResume={(roleTitle) => {
              setEvaluation((prev) => ({
                ...prev,
                job_title: roleTitle,
              }));
              setActiveTab('resume');
            }}
            masterProfileText={masterProfileText}
            isProUser={isProUser}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'evaluator' && (
          <JobEvaluatorView
            resume={resume}
            setResume={setResume}
            masterProfileText={masterProfileText}
            evaluation={evaluation}
            isEvaluationComplete={isEvaluationComplete}
            opportunities={opportunities}
            onAddOpportunities={(newJobs) => setOpportunities((prev) => [...newJobs, ...prev])}
            onSelectPreset={handleSelectPreset}
            selectedJobId={selectedJobId}
            customJobText={customJobText}
            setCustomJobText={setCustomJobText}
            customUrl={customUrl}
            setCustomUrl={setCustomUrl}
            onEvaluate={handleRunEvaluation}
            isLoading={isEvaluating}
            onProceedToResume={() => {
              setActiveTab('resume');
            }}
            onOpenTab={(tab: string) => setActiveTab(tab)}
            onResetWorkspace={handleResetWorkspace}
            onRemoveOpportunity={handleRemoveOpportunity}
            onClearOpportunities={handleClearAllOpportunities}
            onTrackApplication={handleTrackCurrentJob}
            onApplyClick={handleTriggerPostApplyPrompt}
            isTracked={isCurrentJobTracked}
            userPlan={userPlan}
            isProUser={isProUser}
            tailoredCount={tailoredCount}
            onNavigateToPricing={() => setActiveTab('pricing')}
            onOpenRecruiterReview={() => {
              setIsRecruiterModalOpen(true);
              if (!recruiterReviewData) {
                handleRunRecruiterReview();
              }
            }}
            resume={resume}
            setResume={setResume}
            coverLetter={coverLetter}
            interviewQuestions={interviewQuestions}
            onFetchInterviewPrep={() => handleFetchInterviewPrep()}
            isFetchingInterviewPrep={isFetchingInterviewPrep}
          />
        )}

        {(activeTab === 'resume' || activeTab === 'cover-letter' || activeTab === 'referral') && (
          <div className="flex items-center justify-between gap-3 mb-6 border-b border-border pb-3 no-print flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'resume'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                Tailored Resume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cover-letter')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'cover-letter'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                Cover Letter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('referral')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'referral'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                Referral Message
              </button>
            </div>

            {evaluation.job_title && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Target: <strong className="text-foreground">{evaluation.job_title}</strong> {evaluation.company_name ? `at ${evaluation.company_name}` : ''}
                </span>

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
                      handleTriggerPostApplyPrompt(effectiveApplyUrl);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    title={`Open official job portal for ${evaluation.company_name || 'this role'} in a new tab`}
                  >
                    <span>Apply now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleTrackCurrentJob()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    isCurrentJobTracked
                      ? 'bg-success/10 text-success hover:bg-success/20 border border-success/30'
                      : 'text-foreground bg-surface hover:bg-surface-2 border border-border'
                  }`}
                  title={isCurrentJobTracked ? 'Click to untrack and remove from applied jobs' : 'Mark as applied and track application'}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentJobTracked ? 'text-success' : 'text-subtle'}`} />
                  <span>{isCurrentJobTracked ? 'Tracked as Applied' : 'Mark as Applied'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('evaluator')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-brand hover:text-brand/80 bg-brand/10 hover:bg-brand/15 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Fit Analysis</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <ResumeDocument
            resume={resume}
            setResume={setResume}
            jobTitle={evaluation.job_title}
            companyName={evaluation.company_name}
            onRegenerateWithAi={handleRunEvaluation}
            isAiGenerating={isEvaluating}
            onOpenRecruiterReview={() => {
              setIsRecruiterModalOpen(true);
              if (!recruiterReviewData) {
                handleRunRecruiterReview();
              }
            }}
            isProUser={isProUser}
            applyUrl={effectiveApplyUrl}
            onApplyClick={handleTriggerPostApplyPrompt}
            isTracked={isCurrentJobTracked}
            onTrackApplication={handleTrackCurrentJob}
          />
        )}

        {activeTab === 'cover-letter' && (
          <CoverLetterView
            coverLetter={coverLetter}
            candidateName={resume.full_name}
            companyName={evaluation.company_name}
            jobTitle={evaluation.job_title}
          />
        )}

        {activeTab === 'referral' && (
          <ReferralMessageView
            candidateName={resume.full_name || userName}
            companyName={evaluation.company_name}
            jobTitle={evaluation.job_title}
            candidateSkills={resume.skills}
            candidateSummary={resume.tailored_summary}
            keyFactors={evaluation.key_matching_factors}
            masterProfileText={masterProfileText}
            jobReqUrl={effectiveApplyUrl || customUrl || currentPreset?.applyUrl || ''}
            onNavigateToEvaluator={() => setActiveTab('evaluator')}
          />
        )}

        {activeTab === 'screening' && (
          <ScreeningAnswersView
            screeningAnswers={screeningAnswers}
            candidateInfo={candidateInfo}
            applyUrl={effectiveApplyUrl || currentPreset?.applyUrl || customUrl}
            companyName={evaluation.company_name}
            jobTitle={evaluation.job_title}
            jobDescription={customJobText || currentPreset?.description || ''}
            masterProfileText={masterProfileText}
            interviewQuestions={interviewQuestions}
            onFetchInterviewPrep={() => handleFetchInterviewPrep()}
            isFetchingInterviewPrep={isFetchingInterviewPrep}
            onTrackApplication={() => handleTrackCurrentJob()}
            onApplyClick={handleTriggerPostApplyPrompt}
            isTracked={isCurrentJobTracked}
            onAddScreeningAnswer={(newAns) => setScreeningAnswers((prev) => [newAns, ...prev])}
            onRemoveScreeningAnswer={(idx) =>
              setScreeningAnswers((prev) => prev.filter((_, i) => i !== idx))
            }
            isProUser={isProUser}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'applied' && (
          <AppliedJobsView
            appliedJobs={appliedJobs}
            candidateName={resume.full_name || 'Alex Rivera'}
            onAddJob={handleAddAppliedJob}
            onUpdateJob={handleUpdateAppliedJob}
            onDeleteJob={handleDeleteAppliedJob}
            onClearAllJobs={handleClearAllAppliedJobs}
            currentResume={resume}
            onSaveResumeVersion={handleSaveResumeVersion}
            onSelectForTailoring={(job) => {
              setEvaluation((prev) => ({
                ...prev,
                job_title: job.job_title,
                company_name: job.company_name,
                match_score: job.match_score || 90,
                location_info: job.location,
              }));
              setActiveTab('resume');
            }}
            onViewScreening={(job) => {
              setEvaluation((prev) => ({
                ...prev,
                job_title: job.job_title,
                company_name: job.company_name,
                match_score: job.match_score || 90,
                location_info: job.location,
              }));
              if (job.apply_url) setCustomUrl(job.apply_url);
              setActiveTab('screening');
            }}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingView
            userPlan={userPlan}
            isProUser={isProUser}
            onUpgradeToPlan={handleUpgradeToPlan}
            onUpgradeToPro={handleUpgradeToPro}
            onDowngradeToFree={handleDowngradeToFree}
            tailoredCount={tailoredCount}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileBuilderView
            currentProfileText={masterProfileText}
            setMasterProfileText={setMasterProfileText}
            candidateInfo={candidateInfo}
            setCandidateInfo={setCandidateInfo}
            resume={resume}
            setResume={setResume}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            isLoggedIn={isLoggedIn}
            onLogin={() => setActiveTab('auth')}
            onNavigateToTab={setActiveTab}
            isGeneratingMaterials={isEvaluating || isFetchingInterviewPrep || isLoadingRecruiterReview}
            onProfileReset={() => {
              setEvaluation(EMPTY_EVALUATION);
              setCoverLetter(EMPTY_COVER_LETTER);
              setScreeningAnswers([]);
              setInterviewQuestions([]);
              setRecruiterReviewData(null);
              setIsRecruiterModalOpen(false);
              setSelectedJobId('');
              setCustomJobText('');
              setCustomUrl('');
            }}
          />
        )}
      </main>

      {/* Candidate Profile Editor Modal */}
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        masterProfileText={masterProfileText}
        setMasterProfileText={setMasterProfileText}
        candidateInfo={candidateInfo}
        setCandidateInfo={setCandidateInfo}
      />

      {/* Activation Guardrail: Profile Required Before Tailoring */}
      <ProfileActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onNavigateToProfile={() => {
          setIsActivationModalOpen(false);
          setActiveTab('profile');
        }}
        onApplySampleProfile={handleApplySampleProfile}
      />

      {/* Post-Apply Application Tracking Slide-over Banner */}
      {postApplyPrompt && (
        <PostApplyTrackingBanner
          isOpen={postApplyPrompt.isOpen}
          jobTitle={postApplyPrompt.jobTitle}
          companyName={postApplyPrompt.companyName}
          isTracked={isCurrentJobTracked}
          onTrackAndSave={() => {
            handleTrackCurrentJob({
              company_name: postApplyPrompt.companyName,
              job_title: postApplyPrompt.jobTitle,
              apply_url: postApplyPrompt.applyUrl || effectiveApplyUrl,
              forceAdd: true,
            });
          }}
          onDismiss={() => setPostApplyPrompt(null)}
        />
      )}

      {/* Recruiter-Panel Multi-Persona Review Modal */}
      <RecruiterReviewModal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        reviewData={recruiterReviewData}
        isLoading={isLoadingRecruiterReview}
        onRunReview={handleRunRecruiterReview}
        jobTitle={evaluation.job_title || currentPreset?.title || 'Target Role'}
        companyName={evaluation.company_name || currentPreset?.company || 'Target Employer'}
        isProUser={isProUser}
        userPlan={userPlan}
        onNavigateToPricing={() => setActiveTab('pricing')}
      />

      {/* Report Bug / Feedback Modal */}
      <ReportBugModal
        isOpen={isReportBugOpen}
        onClose={() => setIsReportBugOpen(false)}
        userEmail={userEmail}
        activeTab={activeTab}
        activeRole={evaluation.job_title || currentPreset?.title}
      />

      {/* Footer */}
      <footer className="no-print bg-card border-t border-border mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {activeTab !== 'home' && isLoggedIn && (candidateInfo.first_name || userName) ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill-pixel text-xs py-0.5 px-2">MASTER PROFILE</span>
                <span className="font-bold text-foreground">
                  {candidateInfo.first_name || userName.split(' ')[0]} {candidateInfo.last_name || userName.split(' ').slice(1).join(' ')}
                </span>
                <span>· {candidateInfo.location || 'Remote'} · {evaluation.job_title || 'Active Profile'}</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-display italic text-warning">Job Studio</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-subtle flex-wrap">
                <span className="font-semibold text-foreground">Job Studio</span>
                <span>· Autonomous Career Workspace &amp; Ground-Truth ATS Optimization</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-display italic text-warning">Job Studio</span>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
