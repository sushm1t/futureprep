// @ts-nocheck -- ported verbatim from the original project
import React, { useState, useEffect, useRef } from 'react';
import { LoadingProgress } from './LoadingProgress';
import { BusyIndicator } from './BusyIndicator';
import {
  User,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Layers,
  UploadCloud,
  RefreshCw,
  GraduationCap,
  Award,
  Briefcase,
  Check,
  FileUp,
  File,
  X,
  Pencil,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderGit2,
  Loader2,
} from 'lucide-react';
import {
  CandidateProfileRecord,
  getUserMasterProfile,
  saveUserMasterProfile,
  resetUserMasterProfile,
  profileRecordToResume,
  profileRecordToCandidateInfo,
} from '../data/candidateProfiles';
import { CandidateInfo, TailoredResumeData } from '../data/defaultData';
import { triggerCloudSync } from '../utils/cloudSync';
import { getAuthHeader } from '../utils/apiAuth';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface ProfileBuilderViewProps {
  currentProfileText: string;
  setMasterProfileText: (val: string) => void;
  candidateInfo: CandidateInfo;
  setCandidateInfo: React.Dispatch<React.SetStateAction<CandidateInfo>>;
  resume: TailoredResumeData;
  setResume: React.Dispatch<React.SetStateAction<TailoredResumeData>>;
  userName: string;
  setUserName: (val: string) => void;
  userEmail: string;
  setUserEmail: (val: string) => void;
  isLoggedIn: boolean;
  onLogin: (name: string, email: string) => void;
  onNavigateToTab: (tab: string) => void;
  onProfileReset?: () => void;
  isGeneratingMaterials?: boolean;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface CloudSyncIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({ status, className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border shadow-xs ${className}`}
      data-testid="cloud-sync-indicator"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-warning shrink-0" />
          <span className="text-xs font-medium text-warning">Saving changes...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span className="text-xs text-muted-foreground">Cloud synced</span>
        </>
      )}

      {status === 'unsaved' && (
        <>
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse shrink-0" />
          <span className="text-xs text-warning">Unsaved draft</span>
        </>
      )}
    </div>
  );
};

export const ProfileBuilderView: React.FC<ProfileBuilderViewProps> = ({
  userName,
  userEmail,
  isLoggedIn,
  setMasterProfileText,
  setCandidateInfo,
  setResume,
  setUserName,
  setUserEmail,
  onLogin,
  onNavigateToTab,
  onProfileReset,
  isGeneratingMaterials = false,
}) => {
  // Single Master Profile for the active user
  const [selectedProfile, setSelectedProfile] = useState<CandidateProfileRecord>(() => {
    return getUserMasterProfile(userEmail, userName);
  });

  // Check if the profile is already populated with authentic data
  const isProfilePopulated = Boolean(
    (selectedProfile.name && selectedProfile.name !== 'Candidate' && selectedProfile.name !== 'Parsed Candidate') ||
    selectedProfile.experiences.length > 0 ||
    selectedProfile.skills.length > 0 ||
    (selectedProfile.summary && selectedProfile.summary.trim().length > 0)
  );

  // Progressive Disclosure: Default manual fields to collapsed if populated
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(!isProfilePopulated);

  // Active step for guided layout (1: Contact, 2: Experience, 3: Skills & Projects, 4: Education & Certs)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Section accordions open state
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const toggleSection = (stepNumber: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  // Re-hydrate when user context changes
  useEffect(() => {
    const userProfile = getUserMasterProfile(userEmail, userName);
    setSelectedProfile(userProfile);
    const populated = Boolean(
      (userProfile.name && userProfile.name !== 'Candidate' && userProfile.name !== 'Parsed Candidate') ||
      userProfile.experiences.length > 0 ||
      userProfile.skills.length > 0 ||
      (userProfile.summary && userProfile.summary.trim().length > 0)
    );
    if (!populated) {
      setIsEditingProfile(true);
    }
  }, [userEmail, userName]);

  // Editor Tabs: 'builder' | 'vault'
  const [activeStudioTab, setActiveStudioTab] = useState<'builder' | 'vault'>('builder');

  // Real-time Cloud Auto-Save & Debounce State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const lastSavedJsonRef = useRef<string>(JSON.stringify(selectedProfile));

  // Pure helper to generate Markdown Vault from candidate fields without state mutations
  const generateVaultMarkdown = (profile: CandidateProfileRecord): string => {
    const expText = profile.experiences
      .map(
        (e) => `**${e.company}** | ${e.title} | ${e.date_range}${e.location ? ` | ${e.location}` : ''}
${e.bullets.map((b) => `- ${b}`).join('\n')}`
      )
      .join('\n\n');

    const projText = (profile.projects || []).length > 0
      ? `\n\n### FEATURED PROJECTS & PORTFOLIO\n` +
        (profile.projects || [])
          .map(
            (p) => `**${p.name}** | ${p.role}${p.url ? ` | [Link](${p.url})` : ''}
${p.description}
${(p.bullets || []).map((b) => `- ${b}`).join('\n')}`
          )
          .join('\n\n')
      : '';

    const eduText = profile.education
      .map((ed) => `- **${ed.degree}**, ${ed.institution} (${ed.year})`)
      .join('\n');

    const certText = profile.certifications
      .map((c) => `- ${c}`)
      .join('\n');

    return `### CANDIDATE: ${profile.name || 'Candidate'}
**Headline:** ${profile.headline || 'Professional'}
**Email:** ${profile.email || userEmail} | **Phone:** ${profile.phone || ''} | **Location:** ${profile.location || ''}
${profile.linkedin ? `**LinkedIn:** ${profile.linkedin}\n` : ''}
### EXECUTIVE PROFESSIONAL SUMMARY
${profile.summary || 'Summary not provided.'}

### CORE COMPETENCIES & TECHNICAL SKILLS
${profile.skills.join(', ')}

### VERIFIED PROFESSIONAL EXPERIENCE
${expText}${projText}

### EDUCATION
${eduText}

### CERTIFICATIONS & CREDENTIALS
${certText}
`;
  };

  // 1,500ms auto-save debounce on profile edits
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedJsonRef.current = JSON.stringify(selectedProfile);
      return;
    }

    const currentJson = JSON.stringify(selectedProfile);
    if (currentJson === lastSavedJsonRef.current) {
      return;
    }

    // Immediately reflect that changes are in flight / saving
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const vaultText =
          activeStudioTab === 'vault'
            ? (selectedProfile.masterProfileText || '')
            : generateVaultMarkdown(selectedProfile);

        const recordToSave: CandidateProfileRecord = {
          ...selectedProfile,
          masterProfileText: vaultText,
          updatedAt: Date.now(),
        };

        saveUserMasterProfile(recordToSave, userEmail);
        await triggerCloudSync();

        // Update application state
        setMasterProfileText(recordToSave.masterProfileText);
        setCandidateInfo(profileRecordToCandidateInfo(recordToSave));
        setResume(profileRecordToResume(recordToSave));
        if (typeof window !== 'undefined') {
          (window as any).__JOBSTUDIO_ACTIVE_RESUME__ = profileRecordToResume(recordToSave);
        }

        lastSavedJsonRef.current = currentJson;
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('unsaved');
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [selectedProfile, activeStudioTab, userEmail]);

  // AI Import & PDF Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPdf, setUploadedPdf] = useState<{
    file: File;
    name: string;
    sizeFormatted: string;
    base64: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'pdf' | 'text'>('pdf');
  const [rawResumeInput, setRawResumeInput] = useState<string>('');
  const [isParsingWithAi, setIsParsingWithAi] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Skill Input helper
  const [skillInput, setSkillInput] = useState<string>('');

  // Save / Action feedback
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteProfile = () => {
    try {
      const blank = resetUserMasterProfile(userEmail);
      setSelectedProfile(blank);
      setMasterProfileText('');
      setCandidateInfo(profileRecordToCandidateInfo(blank));
      const emptyResume = profileRecordToResume(blank);
      setResume(emptyResume);
      window.__JOBSTUDIO_ACTIVE_RESUME__ = emptyResume;
      setUploadedPdf(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setRawResumeInput('');
      setSkillInput('');
      setIsDragging(false);
      setParseError(null);
      setSaveSuccessMessage(null);
      setImportMode('pdf');
      setIsEditingProfile(true);
      setActiveStep(1);
      onProfileReset?.();
      setDeleteDialogOpen(false);
      setSaveFeedback({ success: true, message: 'Master Profile deleted. Ready for a fresh start.' });
    } catch (error) {
      setSaveFeedback({ success: false, message: error instanceof Error ? error.message : 'Unable to delete your profile.' });
      setDeleteDialogOpen(false);
    }
  };

  // Activate & synchronize the master profile across the entire application
  const applyProfileToApp = (profile: CandidateProfileRecord) => {
    if (!saveUserMasterProfile(profile, userEmail)) throw new Error('Your profile could not be saved. Please try again.');
    setSelectedProfile(profile);

    // 1. Sync User / Auth Info
    if (profile.name && profile.name !== 'Candidate' && profile.name !== 'Parsed Candidate') {
      setUserName(profile.name);
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobstudio_user_name', profile.name);
      }
    }

    // 2. Sync Candidate Contact Info
    const cInfo = profileRecordToCandidateInfo(profile);
    setCandidateInfo(cInfo);

    // 3. Sync Active Master Resume
    const resData = profileRecordToResume(profile);
    setResume(resData);

    // 4. Sync Master Ground-Truth Profile Text (for AI ATS Tailoring)
    setMasterProfileText(profile.masterProfileText);

    // 5. Global window hook for PDF exports
    if (typeof window !== 'undefined') {
      (window as any).__JOBSTUDIO_ACTIVE_RESUME__ = resData;
    }

    setSaveSuccessMessage(`Master Profile for "${profile.name}" is now live across Job Evaluator, Tailored Resume, and ATS Interview tabs!`);
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  // Add Skill Tag
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const fresh = skillInput.trim();
    if (!selectedProfile.skills.includes(fresh)) {
      const updated = {
        ...selectedProfile,
        skills: [...selectedProfile.skills, fresh],
        updatedAt: Date.now(),
      };
      setSelectedProfile(updated);
    }
    setSkillInput('');
  };

  // Remove Skill Tag
  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = {
      ...selectedProfile,
      skills: selectedProfile.skills.filter((s) => s !== skillToRemove),
      updatedAt: Date.now(),
    };
    setSelectedProfile(updated);
  };

  // Add Experience Card
  const handleAddExperience = () => {
    const updated = {
      ...selectedProfile,
      experiences: [
        {
          title: '',
          company: '',
          date_range: '',
          location: '',
          bullets: [''],
        },
        ...selectedProfile.experiences,
      ],
      updatedAt: Date.now(),
    };
    setSelectedProfile(updated);
  };

  // Update Experience Card Field
  const handleUpdateExperience = (index: number, field: string, value: any) => {
    const list = [...selectedProfile.experiences];
    list[index] = { ...list[index], [field]: value };
    setSelectedProfile({
      ...selectedProfile,
      experiences: list,
      updatedAt: Date.now(),
    });
  };

  // Add Bullet Point to Experience
  const handleAddBullet = (expIndex: number) => {
    const list = [...selectedProfile.experiences];
    list[expIndex].bullets.push('');
    setSelectedProfile({
      ...selectedProfile,
      experiences: list,
      updatedAt: Date.now(),
    });
  };

  // Remove Bullet Point from Experience
  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const list = [...selectedProfile.experiences];
    list[expIndex].bullets.splice(bulletIndex, 1);
    setSelectedProfile({
      ...selectedProfile,
      experiences: list,
      updatedAt: Date.now(),
    });
  };

  // Remove Experience Card
  const handleRemoveExperience = (index: number) => {
    const list = selectedProfile.experiences.filter((_, i) => i !== index);
    setSelectedProfile({
      ...selectedProfile,
      experiences: list,
      updatedAt: Date.now(),
    });
  };

  // Add Project
  const handleAddProject = () => {
    const currentProjects = selectedProfile.projects || [];
    setSelectedProfile({
      ...selectedProfile,
      projects: [
        ...currentProjects,
        {
          name: '',
          role: '',
          description: '',
          bullets: [''],
          url: '',
        },
      ],
      updatedAt: Date.now(),
    });
  };

  // Update Project
  const handleUpdateProject = (index: number, field: string, value: any) => {
    const currentProjects = [...(selectedProfile.projects || [])];
    currentProjects[index] = { ...currentProjects[index], [field]: value };
    setSelectedProfile({
      ...selectedProfile,
      projects: currentProjects,
      updatedAt: Date.now(),
    });
  };

  // Remove Project
  const handleRemoveProject = (index: number) => {
    const currentProjects = (selectedProfile.projects || []).filter((_, i) => i !== index);
    setSelectedProfile({
      ...selectedProfile,
      projects: currentProjects,
      updatedAt: Date.now(),
    });
  };

  // Add Education
  const handleAddEducation = () => {
    setSelectedProfile({
      ...selectedProfile,
      education: [
        ...selectedProfile.education,
        {
          degree: '',
          institution: '',
          year: '',
        },
      ],
      updatedAt: Date.now(),
    });
  };

  // Remove Education
  const handleRemoveEducation = (index: number) => {
    setSelectedProfile({
      ...selectedProfile,
      education: selectedProfile.education.filter((_, i) => i !== index),
      updatedAt: Date.now(),
    });
  };

  // Add Certification
  const handleAddCertification = () => {
    const name = window.prompt('Enter Certification Name (e.g., "AWS Solutions Architect", "Scrum Master", "PMP"):');
    if (!name || !name.trim()) return;
    setSelectedProfile({
      ...selectedProfile,
      certifications: [...selectedProfile.certifications, name.trim()],
      updatedAt: Date.now(),
    });
  };

  // Remove Certification
  const handleRemoveCertification = (index: number) => {
    setSelectedProfile({
      ...selectedProfile,
      certifications: selectedProfile.certifications.filter((_, i) => i !== index),
      updatedAt: Date.now(),
    });
  };

  // Auto-generate Markdown Master Vault text from the visual fields
  const handleSyncToVaultText = () => {
    const expText = selectedProfile.experiences
      .map(
        (e) => `**${e.company}** | ${e.title} | ${e.date_range}${e.location ? ` | ${e.location}` : ''}
${e.bullets.map((b) => `- ${b}`).join('\n')}`
      )
      .join('\n\n');

    const projText = (selectedProfile.projects || []).length > 0
      ? `\n\n### FEATURED PROJECTS & PORTFOLIO\n` +
        (selectedProfile.projects || [])
          .map((p) => `**${p.name}**${p.role ? ` | ${p.role}` : ''}${p.url ? ` | [Link](${p.url})` : ''}\n${p.description}`)
          .join('\n\n')
      : '';

    const eduText = selectedProfile.education
      .map((ed) => `- ${ed.degree}, ${ed.institution} (${ed.year})`)
      .join('\n');

    const certText = selectedProfile.certifications.map((c) => `- ${c}`).join('\n');

    const vault = `### CANDIDATE: ${selectedProfile.name}
**Target Role / Headline:** ${selectedProfile.headline}
**Contact:** ${selectedProfile.email} | ${selectedProfile.phone} | ${selectedProfile.location} | ${selectedProfile.linkedin}

### PROFESSIONAL SUMMARY
${selectedProfile.summary}

### CORE COMPETENCIES & KEY TECHNICAL STACK
${selectedProfile.skills.join(', ')}

### VERIFIED PROFESSIONAL EXPERIENCE
${expText}${projText}

### EDUCATION
${eduText}

### CERTIFICATIONS & CREDENTIALS
${certText}
`;

    const updatedProfile = { ...selectedProfile, masterProfileText: vault, updatedAt: Date.now() };
    setSelectedProfile(updatedProfile);
    return updatedProfile;
  };

  // File format and upload helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processSelectedFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setParseError('Please upload a valid PDF file (.pdf format).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setParseError('The selected PDF file exceeds 25MB. Please upload a smaller resume PDF.');
      return;
    }

    setParseError(null);
    const reader = new FileReader();
    setIsReadingFile(true);
    reader.onloadend = () => setIsReadingFile(false);
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedPdf({
          file,
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          base64: result,
        });
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read the PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearPdf = () => {
    setUploadedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // AI Resume Parsing Handler
  const handleParseResumeWithAi = async () => {
    if (importMode === 'pdf') {
      if (!uploadedPdf) {
        setParseError('Please upload or drag-and-drop a PDF resume before analyzing.');
        return;
      }
    } else {
      if (!rawResumeInput.trim()) {
        setParseError('Please paste your resume text before running AI extraction.');
        return;
      }
    }

    setIsParsingWithAi(true);
    setParseError(null);

    try {
      const payload: any = {};
      if (importMode === 'pdf' && uploadedPdf) {
        payload.pdfBase64 = uploadedPdf.base64;
        payload.fileName = uploadedPdf.name;
        if (rawResumeInput.trim()) {
          payload.rawText = rawResumeInput.trim();
        }
      } else {
        payload.rawText = rawResumeInput.trim();
      }

      const authHeader = await getAuthHeader(userEmail);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (!res.ok || !data?.success || !data?.profile) {
        throw new Error(data?.error || `Failed to parse resume with AI (Status ${res.status}).`);
      }

      const p = data.profile;
      const parsedRecord: CandidateProfileRecord = {
        id: `profile-${userEmail}-${Date.now()}`,
        isPreset: false,
        name: p.full_name || userName || selectedProfile.name || 'Candidate',
        headline: p.headline || selectedProfile.headline || 'Professional Headline',
        email: p.email || userEmail || selectedProfile.email,
        phone: p.phone || selectedProfile.phone || '',
        location: p.location || selectedProfile.location || 'Remote',
        linkedin: p.linkedin || selectedProfile.linkedin || '',
        summary: p.summary || '',
        skills: Array.isArray(p.skills) && p.skills.length > 0 ? p.skills : [],
        experiences: Array.isArray(p.experiences) && p.experiences.length > 0 ? p.experiences : [],
        projects: Array.isArray(p.projects) ? p.projects : (selectedProfile.projects || []),
        education: Array.isArray(p.education) && p.education.length > 0 ? p.education : [],
        certifications: Array.isArray(p.certifications) ? p.certifications : [],
        masterProfileText: p.master_profile_text || rawResumeInput,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveUserMasterProfile(parsedRecord, userEmail);
      setSelectedProfile(parsedRecord);
      applyProfileToApp(parsedRecord);

      setIsEditingProfile(false);
      setActiveStudioTab('builder');
      if (data.fallbackNotice) {
        setSaveSuccessMessage(`ℹ️ ${data.fallbackNotice}`);
      } else {
        setSaveSuccessMessage(
          `🎉 Successfully parsed ${uploadedPdf?.name ? `PDF "${uploadedPdf.name}"` : 'resume'} for "${parsedRecord.name}"! Loaded contact details, ${parsedRecord.experiences.length} positions, and ${parsedRecord.skills.length} skills into your Master Profile.`
        );
      }
      setTimeout(() => setSaveSuccessMessage(null), 7000);
    } catch (err: any) {
      console.error('Resume parsing error:', err);
      const raw = err?.message || '';
      const isFetchFailed = raw === 'fetch failed' || /network|failed to fetch|ENOTFOUND/i.test(raw);
      const cleanError = isFetchFailed
        ? 'Unable to connect to AI parsing service. Please check your connection or switch to "Paste Text" mode.'
        : (raw || 'Failed to parse resume. Check the file/text and try again.');
      setParseError(cleanError);
    } finally {
      setIsParsingWithAi(false);
    }
  };

  // Save changes to current master profile and update entire application
  const handleSaveAndActivate = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    try {
      const profile = activeStudioTab === 'vault'
        ? { ...selectedProfile, updatedAt: Date.now() }
        : handleSyncToVaultText();
      applyProfileToApp(profile);
      await triggerCloudSync();
      lastSavedJsonRef.current = JSON.stringify(profile);
      setSaveStatus('saved');
      setSaveFeedback({ success: true, message: 'Profile Saved & Activated. Ready for job evaluation.' });
      setIsEditingProfile(false);
      setTimeout(() => setSaveFeedback(null), 6000);
      return true;
    } catch (error) {
      setSaveStatus('unsaved');
      setSaveFeedback({ success: false, message: error instanceof Error ? error.message : 'Unable to save your profile. Please try again.' });
      return false;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'ME';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="workspace-profile space-y-6 max-w-5xl mx-auto pb-20">
      <BusyIndicator active={isReadingFile} label="Reading resume file" />

      {/* Landing-Inspired Showcase Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-8 shadow-elevated">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-widest uppercase font-mono border border-brand/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>MASTER PROFILE VAULT · SINGLE SOURCE OF TRUTH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              Master Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Curate your career experience, accomplishments, and skills. Every tailored resume and ATS application grounds directly into this verified profile.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium font-mono bg-surface/90 border border-border/80 text-foreground shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>{isLoggedIn ? 'Cloud Synced' : 'Guest Mode (Local)'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-brand shrink-0" />
            <span className="text-foreground">
              You are currently viewing in guest mode. <strong>Sign in or create a free account</strong> to save and isolate your personal Master Profile.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('home')}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Create Free Account / Sign In
          </button>
        </div>
      )}

      {/* HERO AI / PDF FAST-TRACK */}
      <section aria-label="Resume auto-fill fast-track" className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated space-y-6 rounded-3xl after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand/35 after:to-transparent">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider font-mono border border-brand/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hero AI Fast-Track</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Upload Resume to Auto-Fill Profile
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Fast-track your profile setup in seconds. Drop your PDF resume or paste raw text. Gemini AI parses your contact details, timeline, metric-driven bullets, skills, and credentials directly into all 4 sections.
            </p>
          </div>

          {/* Toggle: PDF Upload vs Text Paste */}
          <div className="flex items-center p-1 bg-surface/90 rounded-full text-xs font-medium shrink-0 self-start sm:self-auto border border-border/80 shadow-2xs">
            <button
              type="button"
              data-tour="profile-upload"
              onClick={() => {
                setImportMode('pdf');
                setParseError(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                importMode === 'pdf'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileUp className="w-3.5 h-3.5 text-brand" />
              <span>Upload PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setImportMode('text');
                setParseError(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                importMode === 'text'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Paste Text</span>
            </button>
          </div>
        </div>

        {parseError && (
          <div className="relative z-10 p-3.5 rounded-xl bg-danger/10 text-danger border border-danger/20 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* MODE 1: PDF UPLOAD (DRAG & DROP) */}
        {importMode === 'pdf' && (
          <div className="relative z-10 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="application/pdf,.pdf"
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-brand bg-brand/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.25)]'
                  : uploadedPdf
                  ? 'border-success/60 bg-success/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-border/80 hover:border-brand/70 hover:bg-surface/90 bg-surface/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]'
              }`}
            >
              {uploadedPdf ? (
                <div className="space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-danger/10 text-danger flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/15 text-success text-xs font-semibold rounded-full mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PDF Ready for AI Extraction</span>
                    </div>
                    <h4 className="font-semibold text-base sm:text-lg text-foreground">
                      {uploadedPdf.name}
                    </h4>
                    <p className="text-xs text-subtle font-mono mt-0.5">
                      File Size: {uploadedPdf.sizeFormatted}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-center gap-3 pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-semibold text-foreground bg-card hover:bg-surface rounded-full border border-border shadow-2xs transition-all cursor-pointer"
                    >
                      Select Different PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPdf}
                      className="px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-full transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-xs">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-foreground">
                      Drag &amp; drop your resume PDF here
                    </h4>
                    <p className="text-xs text-subtle mt-1">
                      or <span className="text-brand underline font-medium">browse files</span> to upload from your device
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-card rounded-full border border-border text-[11px] text-subtle shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span>Supports PDF (up to 25MB) · Multimodal AI Parsing</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons for PDF Mode */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-subtle">
                Auto-fills: 1. Contact, 2. Experience, 3. Skills &amp; Projects, 4. Education &amp; Certs.
              </span>

              <button
                type="button"
                onClick={handleParseResumeWithAi}
                disabled={isParsingWithAi || !uploadedPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-elevated disabled:opacity-50 cursor-pointer"
              >
                {isParsingWithAi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <LoadingProgress inline active={isParsingWithAi} label="Analyzing PDF" idleLabel="Extract & Create Master Profile from PDF" expectedSeconds={40} resultToken={selectedProfile} />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: RAW TEXT / MARKDOWN PASTE */}
        {importMode === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-subtle">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Raw Resume or LinkedIn Text:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRawResumeInput(`Alex Rivera
Senior Software Engineer | San Francisco, CA | alex.rivera@example.com | (555) 234-5678 | linkedin.com/in/alex-rivera

SUMMARY:
Full-stack software engineer with 5 years of experience building scalable microservices and responsive web platforms. Proficient in React, TypeScript, Node.js, and AWS.

EXPERIENCE:
Staff Software Engineer | CloudFlow Inc. | 2021 - Present | Remote
- Led migration of monolith to 12 serverless microservices on AWS Lambda and DynamoDB, cutting infrastructure spend by 35%.
- Built customer-facing dashboard in Next.js and TailwindCSS with sub-second page loads.
- Mentored 6 engineers and instituted CI/CD testing with GitHub Actions.

Software Engineer | DevPulse | 2019 - 2021 | San Francisco, CA
- Developed RESTful APIs in Node.js handling 2M requests daily.
- Optimized PostgreSQL queries to reduce p99 response times from 450ms to 95ms.

EDUCATION:
B.S. in Computer Science | San Jose State University | 2015 - 2019

SKILLS:
TypeScript, JavaScript, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Redis, AWS, Docker, Jest`)
                    }
                    className="text-brand hover:underline"
                  >
                    Paste Sample Software Engineer CV
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setRawResumeInput('')}
                    className="text-subtle hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={rawResumeInput}
                onChange={(e) => setRawResumeInput(e.target.value)}
                placeholder="Paste raw text from your PDF, Word document, or LinkedIn profile here..."
                rows={8}
                className="w-full p-4 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm font-mono text-foreground outline-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-subtle">
                Extracts: Contact Details, Role Timeline, Bullets, Skills, Education &amp; Certifications.
              </span>

              <button
                type="button"
                onClick={handleParseResumeWithAi}
                disabled={isParsingWithAi || !rawResumeInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-elevated disabled:opacity-50 cursor-pointer"
              >
                {isParsingWithAi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <LoadingProgress inline active={isParsingWithAi} label="Analyzing resume" idleLabel="Parse & Auto-Build Profile with AI" expectedSeconds={40} resultToken={selectedProfile} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your entire Master Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently clears your profile details, imported resume, and current tailored materials and assessments. You can upload a new resume or start from scratch. Your account, saved applications, and their resume history stay unchanged. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteProfile}>Delete and start fresh</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Notification Banner */}
      {(saveFeedback || saveSuccessMessage) && (
        <div
          role={saveFeedback ? (saveFeedback.success ? 'status' : 'alert') : 'status'}
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-fadeIn ${
            saveFeedback && !saveFeedback.success
              ? 'bg-danger/10 text-danger border-danger/20'
              : 'bg-success/10 text-success border-success/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveFeedback && !saveFeedback.success ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            )}
            <span className="font-medium">{saveFeedback ? saveFeedback.message : saveSuccessMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('evaluator')}
              className="text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              Test with Live Jobs →
            </button>
            <button
              type="button"
              onClick={() => {
                setSaveFeedback(null);
                setSaveSuccessMessage(null);
              }}
              className="text-subtle hover:text-foreground p-1 cursor-pointer font-bold"
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Primary Studio Mode Controls */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              setActiveStudioTab('builder');
              setIsEditingProfile(true);
              setSaveFeedback(null);
            }}
            disabled={isParsingWithAi}
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            <span>Edit existing profile</span>
          </Button>

          <Button
            type="button"
            onClick={handleSaveAndActivate}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shadow-xs cursor-pointer transition-colors ${
              saveFeedback?.success
                ? 'bg-success text-primary-foreground hover:bg-success/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {saveFeedback?.success ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile Saved &amp; Activated</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Master Profile</span>
              </>
            )}
          </Button>

          <CloudSyncIndicator status={saveStatus} />

          <Button
            variant="ghost"
            className="text-danger hover:text-danger hover:bg-danger/10"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isParsingWithAi || isGeneratingMaterials}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete entire profile</span>
          </Button>
        </div>

        <div className="profile-mode-tabs flex items-center gap-1 bg-surface p-1 rounded-full text-xs font-medium border border-border">
          <button
            type="button"
            onClick={() => {
              setActiveStudioTab('builder');
              setIsEditingProfile(true);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeStudioTab === 'builder'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-subtle hover:text-foreground'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-brand" />
            <span>Interactive Resume Builder</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleSyncToVaultText();
              setActiveStudioTab('vault');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeStudioTab === 'vault'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-subtle hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Vault Context (Markdown)</span>
          </button>
        </div>
      </div>

      {/* VIEW A: OVERVIEW CARD (DEFAULT WHEN POPULATED & NOT EDITING) */}
      {activeStudioTab === 'builder' && isProfilePopulated && !isEditingProfile && (
        <div aria-label="Profile overview card" className="apple-card p-6 sm:p-8 bg-card border border-border shadow-elevated space-y-6 rounded-3xl animate-fadeIn">
          {/* Header row with Avatar, Identity & Edit Trigger */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {getInitials(selectedProfile.name || userName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    {selectedProfile.name || userName}
                  </h3>
                  <span className="text-[11px] font-mono text-success bg-success/10 px-2.5 py-0.5 rounded-full font-semibold">
                    ● Master Profile Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {selectedProfile.headline || 'Professional Candidate'}
                </p>
              </div>
            </div>

            {/* Prominent Edit Profile Trigger */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => {
                  setIsEditingProfile(true);
                  setActiveStudioTab('builder');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-full shadow-elevated cursor-pointer transition-all"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

          {/* Contact Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
            {selectedProfile.email && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface rounded-full border border-border">
                <Mail className="w-3.5 h-3.5 text-brand" />
                <span>{selectedProfile.email}</span>
              </div>
            )}
            {selectedProfile.phone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface rounded-full border border-border">
                <Phone className="w-3.5 h-3.5 text-brand" />
                <span>{selectedProfile.phone}</span>
              </div>
            )}
            {selectedProfile.location && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface rounded-full border border-border">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>{selectedProfile.location}</span>
              </div>
            )}
            {selectedProfile.linkedin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface rounded-full border border-border">
                <Linkedin className="w-3.5 h-3.5 text-brand" />
                <span className="truncate max-w-[200px]">{selectedProfile.linkedin}</span>
              </div>
            )}
          </div>

          {/* Professional Summary Excerpt */}
          {selectedProfile.summary && (
            <div className="p-4 bg-surface rounded-2xl border border-border space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Professional Executive Summary
              </span>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                "{selectedProfile.summary}"
              </p>
            </div>
          )}

          {/* 4 Summary Cards corresponding to the 4 Guided Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Step 1: Contact & Identity */}
            <div className="p-4 bg-surface rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">1. Basic Identity</span>
                <User className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-sm font-bold text-foreground truncate">{selectedProfile.name}</p>
              <p className="text-xs text-subtle truncate">{selectedProfile.headline}</p>
            </div>

            {/* Step 2: Core Experience */}
            <div className="p-4 bg-surface rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">2. Core Experience</span>
                <Briefcase className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {selectedProfile.experiences.length} Position{selectedProfile.experiences.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-subtle truncate">
                {selectedProfile.experiences[0]
                  ? `${selectedProfile.experiences[0].title} @ ${selectedProfile.experiences[0].company}`
                  : 'No positions added yet'}
              </p>
            </div>

            {/* Step 3: Key Skills & Projects */}
            <div className="p-4 bg-surface rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">3. Skills &amp; Projects</span>
                <Layers className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {selectedProfile.skills.length} Skills · {(selectedProfile.projects || []).length} Projects
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedProfile.skills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-card rounded-md font-medium text-foreground">
                    {s}
                  </span>
                ))}
                {selectedProfile.skills.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 text-subtle">+{selectedProfile.skills.length - 3}</span>
                )}
              </div>
            </div>

            {/* Step 4: Education & Certifications */}
            <div className="p-4 bg-surface rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">4. Education &amp; Certs</span>
                <GraduationCap className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {selectedProfile.education.length} Degrees · {selectedProfile.certifications.length} Certs
              </p>
              <p className="text-xs text-subtle truncate">
                {selectedProfile.education[0] ? selectedProfile.education[0].degree : selectedProfile.certifications[0] || 'No credentials added'}
              </p>
            </div>
          </div>

          {/* Bottom overview callout */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Manual input fields are collapsed. Click <strong>Edit Profile</strong> to modify any section in the guided 4-step editor.
            </span>
            <Button
              onClick={() => {
                setIsEditingProfile(true);
                setActiveStudioTab('builder');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full shadow-xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </Button>
          </div>
        </div>
      )}

      {/* VIEW B: GUIDED 4-STEP / ACCORDION BUILDER */}
      {activeStudioTab === 'builder' && (!isProfilePopulated || isEditingProfile) && (
        <div className="space-y-6 animate-fadeIn">
          {/* Guided Setup Header with Step Indicators */}
          <div className="apple-card p-5 sm:p-6 bg-card border border-border shadow-elevated rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand font-mono uppercase">
                    Guided Profile Builder
                  </span>
                  <span className="text-xs text-muted-foreground">4 logical stages</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Complete Your Authentic Profile Setup
                </h3>
              </div>

              {isProfilePopulated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
                >
                  Done Editing (Collapse to Overview)
                </Button>
              )}
            </div>

            {/* 4 Step Progress Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {[
                { id: 1, label: '1. Basic Contact & Identity', icon: User, complete: Boolean(selectedProfile.name && selectedProfile.email) },
                { id: 2, label: '2. Core Experience', icon: Briefcase, complete: selectedProfile.experiences.length > 0 },
                { id: 3, label: '3. Skills & Projects', icon: Layers, complete: selectedProfile.skills.length > 0 },
                { id: 4, label: '4. Education & Certs', icon: GraduationCap, complete: selectedProfile.education.length > 0 || selectedProfile.certifications.length > 0 },
              ].map((step) => {
                const isActive = activeStep === step.id;
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setActiveStep(step.id as 1 | 2 | 3 | 4);
                      setOpenSections((prev) => ({ ...prev, [step.id]: true }));
                    }}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand/10 border-brand/40 shadow-xs'
                        : 'bg-surface hover:bg-surface-2 border-border'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isActive
                          ? 'bg-brand text-primary-foreground'
                          : step.complete
                          ? 'bg-success/15 text-success'
                          : 'bg-card text-muted-foreground border border-border'
                      }`}
                    >
                      {step.complete ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isActive ? 'text-brand' : 'text-foreground'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {step.complete ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1 ACCORDION: BASIC CONTACT & IDENTITY */}
          <div className="apple-card bg-card border border-border shadow-elevated rounded-3xl overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection(1)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-surface/50 transition-colors cursor-pointer border-b border-border/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground">
                    1. Basic Contact &amp; Identity
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Name, headline, contact coordinates, and executive career summary narrative.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {selectedProfile.name ? selectedProfile.name : 'Incomplete'}
                </span>
                {openSections[1] ? <ChevronUp className="w-4 h-4 text-subtle" /> : <ChevronDown className="w-4 h-4 text-subtle" />}
              </div>
            </button>

            {/* Accordion Content */}
            {openSections[1] && (
              <div className="p-5 sm:p-6 space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={selectedProfile.name}
                      onChange={(e) => setSelectedProfile({ ...selectedProfile, name: e.target.value, updatedAt: Date.now() })}
                      className="w-full px-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      Target Headline / Role
                    </label>
                    <input
                      type="text"
                      value={selectedProfile.headline}
                      onChange={(e) => setSelectedProfile({ ...selectedProfile, headline: e.target.value, updatedAt: Date.now() })}
                      className="w-full px-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                      placeholder="e.g. Senior Operations Specialist / Staff SWE"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={selectedProfile.email}
                        onChange={(e) => setSelectedProfile({ ...selectedProfile, email: e.target.value, updatedAt: Date.now() })}
                        className="w-full pl-8 pr-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={selectedProfile.phone}
                        onChange={(e) => setSelectedProfile({ ...selectedProfile, phone: e.target.value, updatedAt: Date.now() })}
                        className="w-full pl-8 pr-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      Location (City, Country)
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={selectedProfile.location}
                        onChange={(e) => setSelectedProfile({ ...selectedProfile, location: e.target.value, updatedAt: Date.now() })}
                        className="w-full pl-8 pr-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                        placeholder="e.g. San Francisco, CA (or Remote)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mb-1">
                      LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <Linkedin className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={selectedProfile.linkedin}
                        onChange={(e) => setSelectedProfile({ ...selectedProfile, linkedin: e.target.value, updatedAt: Date.now() })}
                        className="w-full pl-8 pr-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Executive Summary */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                      Professional Executive Summary
                    </label>
                    <span className="text-[11px] text-muted-foreground">High-impact summary used for ATS matching</span>
                  </div>
                  <textarea
                    value={selectedProfile.summary}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, summary: e.target.value, updatedAt: Date.now() })}
                    rows={4}
                    className="w-full p-3.5 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs sm:text-sm text-foreground outline-none transition-all leading-relaxed"
                    placeholder="Detail your overarching experience, domain leadership, and key business outcomes..."
                  />
                </div>

                {/* Step 1 Stepper Navigation */}
                <div className="pt-3 border-t border-border flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setActiveStep(2);
                      setOpenSections((prev) => ({ ...prev, 2: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>Next: Core Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2 ACCORDION: CORE EXPERIENCE & IMPACT BULLETS */}
          <div className="apple-card bg-card border border-border shadow-elevated rounded-3xl overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection(2)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-surface/50 transition-colors cursor-pointer border-b border-border/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground">
                    2. Core Experience &amp; Impact Bullets
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Work history, leadership roles, dates, and metric-driven achievement bullets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {selectedProfile.experiences.length} Position{selectedProfile.experiences.length === 1 ? '' : 's'}
                </span>
                {openSections[2] ? <ChevronUp className="w-4 h-4 text-subtle" /> : <ChevronDown className="w-4 h-4 text-subtle" />}
              </div>
            </button>

            {/* Accordion Content */}
            {openSections[2] && (
              <div className="p-5 sm:p-6 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Recorded Work History ({selectedProfile.experiences.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand bg-brand/10 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Position</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedProfile.experiences.map((exp, expIdx) => (
                    <div key={expIdx} className="p-4 rounded-2xl bg-surface/80 border border-border space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 text-xs">
                          <div>
                            <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => handleUpdateExperience(expIdx, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs font-semibold text-foreground outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                              Company
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                              Date Range
                            </label>
                            <input
                              type="text"
                              value={exp.date_range}
                              onChange={(e) => handleUpdateExperience(expIdx, 'date_range', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none font-mono"
                              placeholder="e.g. Oct 2022 – Present"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(expIdx)}
                          className="text-subtle hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors shrink-0"
                          title="Remove experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bullet points */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                          <span>Accomplishment Bullets ({exp.bullets.length}):</span>
                          <button
                            type="button"
                            onClick={() => handleAddBullet(expIdx)}
                            className="text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add bullet</span>
                          </button>
                        </div>

                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <span className="text-brand font-bold text-xs mt-1.5">•</span>
                            <textarea
                              value={bullet}
                              onChange={(e) => {
                                const list = [...selectedProfile.experiences];
                                list[expIdx].bullets[bIdx] = e.target.value;
                                setSelectedProfile({ ...selectedProfile, experiences: list, updatedAt: Date.now() });
                              }}
                              rows={2}
                              className="flex-1 p-2 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none leading-relaxed resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(expIdx, bIdx)}
                              className="text-subtle hover:text-danger p-1 mt-1 rounded hover:bg-danger/10 transition-colors"
                              title="Remove bullet"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 2 Stepper Navigation */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveStep(1);
                      setOpenSections((prev) => ({ ...prev, 1: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>← Back to Contact</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setActiveStep(3);
                      setOpenSections((prev) => ({ ...prev, 3: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>Next: Skills &amp; Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3 ACCORDION: KEY SKILLS & PROJECTS */}
          <div className="apple-card bg-card border border-border shadow-elevated rounded-3xl overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection(3)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-surface/50 transition-colors cursor-pointer border-b border-border/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground">
                    3. Key Skills &amp; Projects
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    ATS technical skill keyword tags and verified portfolio projects.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {selectedProfile.skills.length} Skills · {(selectedProfile.projects || []).length} Projects
                </span>
                {openSections[3] ? <ChevronUp className="w-4 h-4 text-subtle" /> : <ChevronDown className="w-4 h-4 text-subtle" />}
              </div>
            </button>

            {/* Accordion Content */}
            {openSections[3] && (
              <div className="p-5 sm:p-6 space-y-6 animate-fadeIn">
                {/* Part A: Core Skills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Technical &amp; Domain Skills ({selectedProfile.skills.length})
                    </span>
                    <span className="text-[11px] text-muted-foreground">Press Enter to quickly add skills</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type a skill (e.g. Python, React, SQL, Project Governance) and press Enter..."
                      className="flex-1 px-3 py-2 bg-surface border border-border focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-foreground hover:bg-primary text-primary-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedProfile.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface hover:bg-surface-2 text-foreground text-xs font-medium rounded-full transition-colors border border-border"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-subtle hover:text-danger text-xs cursor-pointer font-bold"
                          title="Remove skill"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Part B: Portfolio Projects */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                        Featured Projects &amp; Portfolio ({(selectedProfile.projects || []).length})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Side projects, open source, or client deliverables highlighting real-world competence.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand bg-brand/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(selectedProfile.projects || []).map((proj, pIdx) => (
                      <div key={pIdx} className="p-4 rounded-2xl bg-surface/80 border border-border space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 text-xs">
                            <div>
                              <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                                Project Name
                              </label>
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => handleUpdateProject(pIdx, 'name', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs font-semibold text-foreground outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                                Role / Tech Stack
                              </label>
                              <input
                                type="text"
                                value={proj.role || ''}
                                onChange={(e) => handleUpdateProject(pIdx, 'role', e.target.value)}
                                placeholder="e.g. Lead Architect (TypeScript, AWS)"
                                className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                                Project URL / Demo
                              </label>
                              <input
                                type="text"
                                value={proj.url || ''}
                                onChange={(e) => handleUpdateProject(pIdx, 'url', e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full px-2.5 py-1.5 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none font-mono"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProject(pIdx)}
                            className="text-subtle hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors shrink-0"
                            title="Remove project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-muted-foreground font-semibold text-[10px] uppercase mb-0.5">
                            Description &amp; Impact
                          </label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => handleUpdateProject(pIdx, 'description', e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-card border border-border focus:border-brand rounded-lg text-xs text-foreground outline-none resize-none leading-relaxed"
                            placeholder="Describe architecture, user problem solved, and technical outcomes..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3 Stepper Navigation */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveStep(2);
                      setOpenSections((prev) => ({ ...prev, 2: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>← Back to Experience</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setActiveStep(4);
                      setOpenSections((prev) => ({ ...prev, 4: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>Next: Education &amp; Certifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4 ACCORDION: EDUCATION & CERTIFICATIONS */}
          <div className="apple-card bg-card border border-border shadow-elevated rounded-3xl overflow-hidden">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection(4)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-surface/50 transition-colors cursor-pointer border-b border-border/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground">
                    4. Education &amp; Certifications
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Academic degrees, accredited institutions, professional licenses, and industry credentials.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {selectedProfile.education.length} Degrees · {selectedProfile.certifications.length} Certs
                </span>
                {openSections[4] ? <ChevronUp className="w-4 h-4 text-subtle" /> : <ChevronDown className="w-4 h-4 text-subtle" />}
              </div>
            </button>

            {/* Accordion Content */}
            {openSections[4] && (
              <div className="p-5 sm:p-6 space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Education */}
                  <div className="p-4 bg-surface rounded-2xl border border-border space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <h5 className="font-display text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4 text-brand" />
                        <span>Academic Degrees ({selectedProfile.education.length})</span>
                      </h5>
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                      >
                        + Add Degree
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectedProfile.education.map((edu, edIdx) => (
                        <div key={edIdx} className="p-3 bg-card rounded-xl flex items-start justify-between gap-2 text-xs border border-border">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">{edu.degree}</p>
                            <p className="text-subtle">{edu.institution} · <span className="font-mono">{edu.year}</span></p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(edIdx)}
                            className="text-subtle hover:text-danger p-1 cursor-pointer"
                            title="Remove degree"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 bg-surface rounded-2xl border border-border space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <h5 className="font-display text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-success" />
                        <span>Certifications &amp; Credentials ({selectedProfile.certifications.length})</span>
                      </h5>
                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                      >
                        + Add Cert
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {selectedProfile.certifications.map((cert, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-card rounded-xl flex items-center justify-between gap-2 text-xs border border-border">
                          <span className="font-medium text-foreground truncate">{cert}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertification(cIdx)}
                            className="text-subtle hover:text-danger p-1 shrink-0 cursor-pointer"
                            title="Remove certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4 Stepper Navigation */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveStep(3);
                      setOpenSections((prev) => ({ ...prev, 3: true }));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full"
                  >
                    <span>← Back to Skills &amp; Projects</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleSaveAndActivate();
                      setIsEditingProfile(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save &amp; Finish Editing</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW C: MASTER GROUND-TRUTH VAULT (MARKDOWN) */}
      {activeStudioTab === 'vault' && (
        <div className="apple-card p-6 sm:p-8 bg-card border border-border shadow-elevated space-y-4 rounded-3xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" />
                <span>Master Ground-Truth Vault (Markdown)</span>
              </h3>
              <p className="text-xs text-subtle">
                This is the raw, unhallucinated factual source of truth sent to Gemini AI for job evaluations, ATS score grading, and cover letters.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncToVaultText}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/15 rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync from Visual Builder</span>
            </button>
          </div>

          <textarea
            aria-label="Master Ground-Truth Markdown Vault"
            placeholder="Paste or write your full career chronology..."
            value={selectedProfile.masterProfileText}
            onChange={(e) => setSelectedProfile({ ...selectedProfile, masterProfileText: e.target.value, updatedAt: Date.now() })}
            rows={18}
            className="w-full p-4 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm font-mono text-foreground outline-none transition-all leading-relaxed"
          />
        </div>
      )}

      {/* Bottom Action Bar (in edit mode or vault mode) - in normal document flow so it NEVER stays fixed or covers content while scrolling */}
      {(!isProfilePopulated || isEditingProfile || activeStudioTab === 'vault') && (
        <div className="relative mt-6 p-4 sm:p-5 bg-card border border-border shadow-sm rounded-3xl flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="profile-save-context flex items-center gap-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-xs">
                {getInitials(selectedProfile.name || userName)}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {selectedProfile.experiences.length > 0 || selectedProfile.skills.length > 0 ? (
                    <>Active Profile: <span className="text-brand">{selectedProfile.name || userName}</span></>
                  ) : (
                    <>Active Account: <span className="text-brand">{selectedProfile.name || userName}</span> (Awaiting Resume)</>
                  )}
                </p>
                <p className="text-[11px] text-subtle truncate max-w-[280px]">
                  {selectedProfile.experiences.length > 0 || selectedProfile.skills.length > 0
                    ? `${selectedProfile.headline} · ${selectedProfile.experiences.length} positions · ${selectedProfile.skills.length} skills`
                    : 'Upload your resume PDF or paste text to auto-populate'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              <CloudSyncIndicator status={saveStatus} />

              {isEditingProfile && isProfilePopulated && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs rounded-full cursor-pointer"
                >
                  Done Editing
                </Button>
              )}

              <Button
                type="button"
                onClick={handleSaveAndActivate}
                className={`h-auto min-h-10 whitespace-normal flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all shadow-elevated cursor-pointer ${
                  saveFeedback?.success
                    ? 'bg-success text-primary-foreground hover:bg-success/90'
                    : 'text-primary-foreground bg-primary hover:bg-primary/90'
                }`}
              >
                {saveFeedback?.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    <span>Profile Saved &amp; Activated</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Activate Master Profile</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  if (handleSaveAndActivate()) onNavigateToTab('evaluator');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-foreground hover:text-brand bg-surface hover:bg-brand/10 rounded-full transition-colors cursor-pointer"
              >
                <span>Job Evaluator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
