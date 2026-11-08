// @ts-nocheck -- ported verbatim from the original project
import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  X,
  Building2,
  Filter,
  FileText,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
  List,
  History,
  ArrowRight,
  GripVertical,
  Layers,
  Mail,
  Copy,
  Radio,
  Zap,
  Send,
  Check,
} from 'lucide-react';
import { AppliedJobRecord, ApplicationStatus, TailoredResumeData } from '../data/defaultData';
import { downloadResumeAsPdf } from '../utils/pdfExport';
import { useWebMCP } from 'use-webmcp-tool';
import { runWebMCPTool } from '@/lib/webmcp-telemetry';
import { classifyRecruiterEmail, EmailClassificationResult } from '../utils/recruiterEmailClassifier';
import { getSavedTracerLinks, TracerLinkRecord } from '../utils/tracerLinks';

interface AppliedJobsViewProps {
  appliedJobs: AppliedJobRecord[];
  candidateName?: string;
  onAddJob: (job: Omit<AppliedJobRecord, 'id' | 'created_at'>) => void;
  onUpdateJob: (id: string, updates: Partial<AppliedJobRecord>) => void;
  onDeleteJob: (id: string) => void;
  onClearAllJobs?: () => void;
  onSelectForTailoring?: (job: AppliedJobRecord) => void;
  onViewScreening?: (job: AppliedJobRecord) => void;
  currentResume?: TailoredResumeData;
  onSaveResumeVersion?: (jobId: string, resume: TailoredResumeData) => void;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Applied: {
    label: 'Applied',
    bg: 'bg-brand/10',
    text: 'text-brand',
    dot: 'bg-primary',
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  Interviewing: {
    label: 'Interviewing',
    bg: 'bg-info/10',
    text: 'text-info',
    dot: 'bg-info',
  },
  'Offer Received': {
    label: 'Offer Received',
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-subtle/10',
    text: 'text-subtle',
    dot: 'bg-subtle',
  },
  Archived: {
    label: 'Archived',
    bg: 'bg-subtle/10',
    text: 'text-subtle',
    dot: 'bg-subtle',
  },
};

const ALL_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Interviewing',
  'Offer Received',
  'Rejected',
  'Archived',
];

const formatStamp = (at: number): string =>
  new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const EVENT_META: Record<string, { icon: React.ElementType; tone: string }> = {
  created: { icon: Briefcase, tone: 'text-brand' },
  status_changed: { icon: ArrowRight, tone: 'text-info' },
  details_updated: { icon: Edit3, tone: 'text-muted-foreground' },
  resume_version_saved: { icon: FileText, tone: 'text-success' },
};

export function getDaysSinceApplied(job: AppliedJobRecord): number {
  const now = Date.now();
  if (job.applied_date) {
    const parsed = Date.parse(job.applied_date);
    if (!isNaN(parsed)) {
      const diffMs = now - parsed;
      return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }
  if (job.created_at) {
    const diffMs = now - job.created_at;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
  return 0;
}

export function isFollowUpDue(job: AppliedJobRecord): boolean {
  if (job.status !== 'Applied' && job.status !== 'Under Review') {
    return false;
  }
  if (job.followed_up_at) {
    return false;
  }
  return getDaysSinceApplied(job) >= 5;
}

export function generateFollowUpEmail(job: AppliedJobRecord, candidateName: string = 'Alex Rivera') {
  const recipient = `Recruiter / Hiring Team at ${job.company_name}`;
  const subject = `Following up on application for ${job.job_title} – ${candidateName}`;
  const appliedDate = job.applied_date || 'recently';
  const body = `Dear Hiring Team at ${job.company_name},

I hope you are having a productive week. I am following up on my application for the ${job.job_title} position that I submitted on ${appliedDate}.

I remain exceptionally enthusiastic about the opportunity to contribute to ${job.company_name}. Given my background in scaling operational efficiency, streamlining cross-functional workflows, and driving measurable impact, I am eager to bring my experience to your team's upcoming roadmap.

Please let me know if there are any additional work samples, metrics, or portfolio details I can provide to support my candidacy. Thank you again for your time and consideration, and I look forward to speaking soon.

Best regards,
${candidateName}`;

  return { recipient, subject, body };
}

export const AppliedJobsView: React.FC<AppliedJobsViewProps> = ({
  appliedJobs,
  candidateName,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onClearAllJobs,
  onSelectForTailoring,
  onViewScreening,
  currentResume,
  onSaveResumeVersion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AppliedJobRecord | null>(null);
  const [detailJobId, setDetailJobId] = useState<string | null>(null);
  const [dragJobId, setDragJobId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null);

  // Follow-Up Email Copilot State
  const [followUpModalJob, setFollowUpModalJob] = useState<AppliedJobRecord | null>(null);
  const [followUpCopied, setFollowUpCopied] = useState<boolean>(false);
  const [followUpSuccess, setFollowUpSuccess] = useState<boolean>(false);

  const effectiveCandidate = candidateName || currentResume?.full_name || 'Alex Rivera';

  const openFollowUpModal = (job: AppliedJobRecord) => {
    setFollowUpModalJob(job);
    setFollowUpCopied(false);
    setFollowUpSuccess(false);
  };

  const handleMarkAsFollowedUp = (job: AppliedJobRecord) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    onUpdateJob(job.id, {
      followed_up_at: todayStr,
    });
    setFollowUpSuccess(true);
    setTimeout(() => {
      setFollowUpSuccess(false);
      setFollowUpModalJob(null);
    }, 1200);
  };

  const detailJob = useMemo(
    () => appliedJobs.find((j) => j.id === detailJobId) || null,
    [appliedJobs, detailJobId]
  );

  // Form State for Adding / Editing
  const [formCompany, setFormCompany] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('Remote / Hybrid');
  const [formPlatform, setFormPlatform] = useState('Direct Portal');
  const [formUrl, setFormUrl] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formMatchScore, setFormMatchScore] = useState<number | undefined>(90);
  const [formStatus, setFormStatus] = useState<ApplicationStatus>('Applied');
  const [formSalary, setFormSalary] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Freehire Superpowers: Recruiter Email Parser & Radar
  const [isEmailParserOpen, setIsEmailParserOpen] = useState(false);
  const [emailSubjectInput, setEmailSubjectInput] = useState('');
  const [emailBodyInput, setEmailBodyInput] = useState('');
  const [selectedMatchJobId, setSelectedMatchJobId] = useState<string>('');
  const [parsedEmailResult, setParsedEmailResult] = useState<EmailClassificationResult | null>(null);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [tracerLinks, setTracerLinks] = useState<TracerLinkRecord[]>([]);

  useEffect(() => {
    setTracerLinks(getSavedTracerLinks());
  }, [isRadarModalOpen]);

  const handleAnalyzeEmail = () => {
    if (!emailBodyInput.trim()) return;
    const result = classifyRecruiterEmail(emailBodyInput, emailSubjectInput);
    setParsedEmailResult(result);

    if (appliedJobs.length > 0) {
      const lower = `${emailSubjectInput} ${emailBodyInput}`.toLowerCase();
      const matched = appliedJobs.find((j) =>
        lower.includes(j.company_name.toLowerCase()) ||
        lower.includes(j.job_title.toLowerCase())
      );
      if (matched) {
        setSelectedMatchJobId(matched.id);
      } else {
        setSelectedMatchJobId(appliedJobs[0].id);
      }
    }
  };

  const handleApplyEmailStageAdvance = () => {
    if (!parsedEmailResult || !selectedMatchJobId) return;
    const targetJob = appliedJobs.find((j) => j.id === selectedMatchJobId);
    if (!targetJob) return;

    let newStatus: ApplicationStatus = 'Under Review';
    if (parsedEmailResult.signal === 'offer') {
      newStatus = 'Offer Received';
    } else if (
      parsedEmailResult.signal === 'interview_invitation' ||
      parsedEmailResult.signal === 'assessment'
    ) {
      newStatus = 'Interviewing';
    } else if (parsedEmailResult.signal === 'rejection') {
      newStatus = 'Rejected';
    } else if (parsedEmailResult.signal === 'screening') {
      newStatus = 'Under Review';
    }

    const noteAddition = `[Recruiter Email: ${parsedEmailResult.label}] ${parsedEmailResult.actionableSummary}${
      parsedEmailResult.schedulingLink ? ` | Booking link: ${parsedEmailResult.schedulingLink}` : ''
    }`;

    onUpdateJob(selectedMatchJobId, {
      status: newStatus,
      notes: targetJob.notes ? `${targetJob.notes}\n\n${noteAddition}` : noteAddition,
    });

    setIsEmailParserOpen(false);
    setEmailSubjectInput('');
    setEmailBodyInput('');
    setParsedEmailResult(null);
  };

  const openAddModal = () => {
    setEditingJob(null);
    setFormCompany('');
    setFormTitle('');
    setFormLocation('Remote / Hybrid');
    setFormPlatform('Direct Portal');
    setFormUrl('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMatchScore(90);
    setFormStatus('Applied');
    setFormSalary('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (job: AppliedJobRecord) => {
    setEditingJob(job);
    setFormCompany(job.company_name);
    setFormTitle(job.job_title);
    setFormLocation(job.location || '');
    setFormPlatform(job.platform || 'Direct Portal');
    setFormUrl(job.apply_url || '');
    setFormDate(job.applied_date || new Date().toISOString().split('T')[0]);
    setFormMatchScore(job.match_score);
    setFormStatus(job.status);
    setFormSalary(job.salary || '');
    setFormNotes(job.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formTitle.trim()) return;

    if (editingJob) {
      onUpdateJob(editingJob.id, {
        company_name: formCompany.trim(),
        job_title: formTitle.trim(),
        location: formLocation.trim() || undefined,
        platform: formPlatform.trim() || undefined,
        apply_url: formUrl.trim() || undefined,
        applied_date: formDate,
        match_score: formMatchScore,
        status: formStatus,
        salary: formSalary.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      onAddJob({
        company_name: formCompany.trim(),
        job_title: formTitle.trim(),
        location: formLocation.trim() || undefined,
        platform: formPlatform.trim() || undefined,
        apply_url: formUrl.trim() || undefined,
        applied_date: formDate,
        match_score: formMatchScore,
        status: formStatus,
        salary: formSalary.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
    setEditingJob(null);
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return appliedJobs
      .filter((job) => {
        if (statusFilter !== 'All' && job.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          job.company_name.toLowerCase().includes(q) ||
          job.job_title.toLowerCase().includes(q) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.platform && job.platform.toLowerCase().includes(q)) ||
          (job.notes && job.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }, [appliedJobs, statusFilter, searchQuery]);

  useWebMCP({
    name: 'read_application_view',
    description: 'Read the applications currently shown in the application board or list, respecting its search and status filters.',
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool('read_application_view', () => {
      return filteredJobs.length ? filteredJobs.map(job => `${job.id}: ${job.company_name} — ${job.job_title} — ${job.status}`).join('\n') : 'No applications shown.';
    }),
  });

  // Board columns honour the same filters; a status filter narrows to that column only
  const boardColumns = useMemo(() => {
    const statuses = statusFilter === 'All' ? ALL_STATUSES : [statusFilter];
    return statuses.map((st) => ({
      status: st,
      jobs: filteredJobs.filter((j) => j.status === st),
    }));
  }, [filteredJobs, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = appliedJobs.length;
    const applied = appliedJobs.filter((j) => j.status === 'Applied').length;
    const reviewing = appliedJobs.filter((j) => j.status === 'Under Review').length;
    const interviewing = appliedJobs.filter((j) => j.status === 'Interviewing').length;
    const offered = appliedJobs.filter((j) => j.status === 'Offer Received').length;
    const scores = appliedJobs.map((j) => j.match_score).filter((s): s is number => typeof s === 'number');
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    return { total, applied, reviewing, interviewing, offered, avgScore };
  }, [appliedJobs]);

  // Drag & Drop between board columns
  const handleDrop = (status: ApplicationStatus) => {
    const id = dragJobId;
    setDragJobId(null);
    setDragOverStatus(null);
    if (!id) return;
    const job = appliedJobs.find((j) => j.id === id);
    if (job && job.status !== status) {
      onUpdateJob(job.id, { status });
    }
  };

  const handleDownloadVersion = (job: AppliedJobRecord, versionIndex: number) => {
    const version = job.resume_versions?.[versionIndex];
    if (!version) return;
    const safeCompany = (job.company_name || 'Application').replace(/[^a-zA-Z0-9]+/g, '_');
    void downloadResumeAsPdf('', `JobStudio_${safeCompany}_${version.label}.pdf`, true, version.resume);
  };

  const canSaveVersion = Boolean(
    currentResume &&
      ((currentResume.tailored_summary || '').trim().length > 0 ||
        (currentResume.experiences && currentResume.experiences.length > 0))
  );

  // Export to CSV
  const handleExportCsv = () => {
    if (appliedJobs.length === 0) return;
    const headers = [
      'Company',
      'Job Title',
      'Status',
      'Applied Date',
      'Match Score',
      'Location',
      'Platform',
      'Portal URL',
      'Resume Versions',
      'Notes',
    ];
    const rows = appliedJobs.map((j) => [
      `"${j.company_name.replace(/"/g, '""')}"`,
      `"${j.job_title.replace(/"/g, '""')}"`,
      `"${j.status}"`,
      `"${j.applied_date}"`,
      j.match_score ? `${j.match_score}%` : 'N/A',
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.platform || '').replace(/"/g, '""')}"`,
      `"${(j.apply_url || '').replace(/"/g, '""')}"`,
      j.resume_versions?.length || 0,
      `"${(j.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JobStudio_Applied_Jobs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderApplicationCard = (job: AppliedJobRecord) => {
    const statusStyle = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
    const versionCount = job.resume_versions?.length || 0;
    const eventCount = job.events?.length || 0;
    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => {
          setDragJobId(job.id);
          e.dataTransfer.setData('text/plain', job.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          setDragJobId(null);
          setDragOverStatus(null);
        }}
        onClick={() => setDetailJobId(job.id)}
        className={`relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-brand/50 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5),0_0_20px_0_rgba(59,130,246,0.15)] text-left w-full group after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand/25 after:to-transparent ${
          dragJobId === job.id ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {job.job_title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 min-w-0 font-medium">
              <Building2 className="w-3 h-3 shrink-0 text-brand" />
              <span className="truncate">{job.company_name}</span>
            </p>
          </div>
        </div>

        {(job.location || job.match_score !== undefined) && (
          <div className="flex items-center gap-2 mt-2 pl-[22px] flex-wrap">
            {job.match_score !== undefined && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-mono">
                {job.match_score}% match
              </span>
            )}
            {job.location && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5 mt-2.5 pl-[22px] text-[10px] text-subtle">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {job.applied_date || 'Recent'}
          </span>
          {versionCount > 0 && (
            <span className="flex items-center gap-1 text-success" title={`${versionCount} saved resume version${versionCount > 1 ? 's' : ''}`}>
              <Layers className="w-3 h-3" />
              {versionCount}
            </span>
          )}
          {eventCount > 0 && (
            <span className="flex items-center gap-1" title={`${eventCount} activity entries`}>
              <History className="w-3 h-3" />
              {eventCount}
            </span>
          )}
        </div>

        {job.followed_up_at ? (
          <div className="mt-2 pl-[22px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium border border-success/20">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Followed up on {job.followed_up_at}</span>
            </span>
          </div>
        ) : isFollowUpDue(job) ? (
          <div className="mt-2 pl-[22px] flex items-center justify-between gap-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium border border-warning/20">
              <span>⏰ Follow up due (Applied {getDaysSinceApplied(job)} days ago)</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openFollowUpModal(job);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 hover:bg-warning/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer border border-warning/20"
              title="Generate Follow-Up Email"
            >
              <Mail className="w-2.5 h-2.5" />
              <span>Follow Up</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="workspace-applications space-y-6 max-w-6xl mx-auto">
      {/* Landing-Inspired Showcase Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-8 shadow-elevated">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-widest uppercase font-mono border border-brand/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>APPLICATION TRACKER · ACTIVE PIPELINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              Applied Jobs
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your applications, active interview rounds, follow-up battlecards, and tailored resume snapshots in one unified cockpit.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium font-mono bg-surface/90 border border-border/80 text-foreground shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>{appliedJobs.length} {appliedJobs.length === 1 ? 'Tracked Role' : 'Tracked Roles'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI / Metrics Header Banner */}
      <div className="workspace-metrics grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Total Applied</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-foreground mt-1 tracking-tight">
            {stats.total}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Tracked applications</span>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-brand uppercase tracking-wider font-mono">Sent / Pending</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-brand mt-1 tracking-tight">
            {stats.applied}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Awaiting initial review</span>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-warning uppercase tracking-wider font-mono">Under Review</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-warning mt-1 tracking-tight">
            {stats.reviewing}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Recruiter screening</span>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-info uppercase tracking-wider font-mono">Interviewing</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-info mt-1 tracking-tight">
            {stats.interviewing}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Active interview rounds</span>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-success uppercase tracking-wider font-mono">Offers</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-success mt-1 tracking-tight">
            {stats.offered}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Offers received</span>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-b from-card via-card/95 to-surface/90 border border-border/80 shadow-elevated flex flex-col justify-between hover:border-brand/40 transition-all duration-200">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Avg Match</span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-foreground mt-1 tracking-tight">
            {stats.avgScore ? `${stats.avgScore}%` : '—'}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">ATS fit overlap</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Toggle, and New Application CTA */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-2xl border border-border/80 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-elevated">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, title, notes, or platform..."
            className="w-full pl-10 pr-4 py-2 bg-surface/90 border border-border/80 focus:border-brand focus:bg-card rounded-full text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap text-xs font-medium ${
              statusFilter === 'All'
                ? 'bg-foreground text-primary-foreground shadow-sm'
                : 'bg-surface text-subtle hover:text-foreground'
            }`}
          >
            All ({appliedJobs.length})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = appliedJobs.filter((j) => j.status === st).length;
            if (count === 0 && statusFilter !== st) return null;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap text-xs font-medium flex items-center gap-1.5 ${
                  statusFilter === st
                    ? 'bg-foreground text-primary-foreground shadow-sm'
                    : 'bg-surface text-subtle hover:text-foreground'
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Actions: View Toggle, Add Application & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-surface rounded-full p-0.5">
            <button
              onClick={() => setViewMode('board')}
              title="Board view — drag cards between columns"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-card text-foreground shadow-sm' : 'text-subtle hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-subtle hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {appliedJobs.length > 0 && (
            <button
              onClick={handleExportCsv}
              title="Export as CSV"
              className="p-2 text-subtle hover:text-foreground bg-surface hover:bg-surface-2 rounded-full transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTracerLinks(getSavedTracerLinks());
              setIsRadarModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-surface hover:bg-surface-2 border border-border text-foreground rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
            title="View Recruiter Radar - live CV link click notifications"
          >
            <Radio className="w-3.5 h-3.5 text-brand animate-pulse" />
            <span>Recruiter Radar</span>
            {tracerLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-brand/20 text-brand font-bold">
                {tracerLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setParsedEmailResult(null);
              setEmailSubjectInput('');
              setEmailBodyInput('');
              setIsEmailParserOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-surface hover:bg-surface-2 border border-border text-foreground rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
            title="Paste recruiter email to automatically classify status, extract interview links, and advance application"
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Parse Recruiter Email</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-elevated cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Applications: Board or List */}
      {filteredJobs.length === 0 ? (
        <div className="apple-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface text-subtle mx-auto flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-display font-semibold text-base text-foreground">
              {searchQuery || statusFilter !== 'All'
                ? 'No applications match your filter'
                : 'No Applications Tracked Yet'}
            </h3>
            <p className="text-xs text-subtle leading-relaxed">
              {searchQuery || statusFilter !== 'All'
                ? 'Try clearing your search query or selecting "All" to view all tracked roles.'
                : 'Keep all your applied roles, interview statuses, and follow-ups in one unified workspace. Track applications directly from the Job Evaluator or add them manually.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery || statusFilter !== 'All' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold bg-surface hover:bg-surface-2 text-foreground rounded-full transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer shadow-elevated"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Track Your First Application</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'board' ? (
        <div className="app-board">
          {boardColumns.map(({ status: st, jobs: colJobs }) => {
            const colStyle = STATUS_CONFIG[st];
            const isDragOver = dragOverStatus === st;
            return (
              <div
                key={st}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverStatus(st);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverStatus((cur) => (cur === st ? null : cur));
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(st);
                }}
                className={`app-col ${isDragOver ? 'app-col-dragover' : ''}`}
              >
                <div className="flex items-center gap-2 px-1 pb-2.5 border-b border-border">
                  <span className={`w-2 h-2 rounded-full ${colStyle.dot}`} />
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{st}</span>
                  <span className="text-[11px] text-subtle ml-auto">{colJobs.length}</span>
                </div>

                <div className="pt-2.5 space-y-2 min-h-[80px]">
                  {colJobs.length === 0 ? (
                    <p className="text-[10px] text-subtle/70 text-center py-4 border border-dashed border-border rounded-lg">
                      Drop a card here
                    </p>
                  ) : (
                    colJobs.map((job) => renderApplicationCard(job))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const statusStyle = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
            const versionCount = job.resume_versions?.length || 0;
            return (
              <div
                key={job.id}
                className="apple-card p-5 transition-all hover:shadow-elevated space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Company & Role */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                      {job.company_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-semibold text-base text-foreground truncate" title={job.job_title}>
                          {job.job_title}
                        </h4>
                        {job.match_score !== undefined && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                            {job.match_score}% Match
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-subtle flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="font-medium text-foreground">{job.company_name}</span>
                        {job.location && (
                          <>
                            <span className="text-subtle">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-subtle" />
                              {job.location}
                            </span>
                          </>
                        )}
                        {job.platform && (
                          <>
                            <span className="text-subtle">·</span>
                            <span className="px-1.5 py-0.2 bg-surface rounded text-[11px] text-muted-foreground">
                              {job.platform}
                            </span>
                          </>
                        )}
                        {versionCount > 0 && (
                          <>
                            <span className="text-subtle">·</span>
                            <span className="flex items-center gap-1 text-success text-[11px]">
                              <Layers className="w-3 h-3" />
                              {versionCount} resume version{versionCount > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown Selector & Quick Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="relative inline-block">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          onUpdateJob(job.id, {
                            status: e.target.value as ApplicationStatus,
                          })
                        }
                        className={`appearance-none cursor-pointer text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border border-transparent transition-all outline-none ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusStyle.text}`}
                      />
                    </div>

                    <button
                      onClick={() => setDetailJobId(job.id)}
                      title="Open application details, resume versions, and activity"
                      className="p-1.5 text-subtle hover:text-foreground hover:bg-surface rounded-full transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openEditModal(job)}
                      title="Edit application details"
                      className="p-1.5 text-subtle hover:text-foreground hover:bg-surface rounded-full transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${job.company_name} - ${job.job_title} from your tracker?`)) {
                          onDeleteJob(job.id);
                        }
                      }}
                      title="Delete application"
                      className="p-1.5 text-subtle hover:text-danger hover:bg-danger/10 rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata & Notes row */}
                <div className="border-t border-border pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-subtle">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-subtle" />
                      Applied: {job.applied_date || 'Recent'}
                    </span>
                    {job.salary && (
                      <span className="text-foreground font-medium bg-surface px-2 py-0.5 rounded">
                        {job.salary}
                      </span>
                    )}
                    {job.apply_url && (
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
                      >
                        <span>Portal Listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {job.followed_up_at ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Followed up on {job.followed_up_at}</span>
                      </span>
                    ) : isFollowUpDue(job) ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                        <span>⏰ Follow up due (Applied {getDaysSinceApplied(job)} days ago)</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Cross-Tab Jumps & Follow Up */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                    {(job.status === 'Applied' || job.status === 'Under Review') && (
                      <button
                        type="button"
                        onClick={() => openFollowUpModal(job)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning bg-warning/10 hover:bg-warning/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-warning/20"
                        title="Generate tailored follow-up email"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Generate Follow-Up Email</span>
                      </button>
                    )}
                    {onSelectForTailoring && (
                      <button
                        onClick={() => onSelectForTailoring(job)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground bg-surface hover:bg-surface-2 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        title="Open tailored resume for this job"
                      >
                        <FileText className="w-3 h-3 text-brand" />
                        <span>Resume</span>
                      </button>
                    )}
                    {onViewScreening && (
                      <button
                        onClick={() => onViewScreening(job)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground bg-surface hover:bg-surface-2 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        title="View ATS answers and interview prep"
                      >
                        <HelpCircle className="w-3 h-3 text-warning" />
                        <span>ATS Prep</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes snippet if present */}
                {job.notes && (
                  <div className="bg-surface rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Notes: </span>
                    {job.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Application Detail Drawer: resume versions + full activity trail */}
      {detailJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setDetailJobId(null)}
          />
          <div className="relative bg-card border-l border-border w-full max-w-md h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-5 py-4 z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                    {detailJob.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-base text-foreground leading-snug">
                      {detailJob.job_title}
                    </h3>
                    <p className="text-xs text-subtle mt-0.5 truncate">{detailJob.company_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailJobId(null)}
                  className="p-2 rounded-full text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="relative inline-block flex-1">
                  <select
                    value={detailJob.status}
                    onChange={(e) =>
                      onUpdateJob(detailJob.id, { status: e.target.value as ApplicationStatus })
                    }
                    className={`w-full appearance-none cursor-pointer text-xs font-semibold px-3 py-2 pr-8 rounded-lg border border-border transition-all outline-none ${STATUS_CONFIG[detailJob.status]?.bg} ${STATUS_CONFIG[detailJob.status]?.text}`}
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtle" />
                </div>
                <button
                  onClick={() => openEditModal(detailJob)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground bg-surface hover:bg-surface-2 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${detailJob.company_name} - ${detailJob.job_title} from your tracker?`)) {
                      onDeleteJob(detailJob.id);
                      setDetailJobId(null);
                    }
                  }}
                  className="p-2 text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete application"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                {detailJob.followed_up_at ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Followed up on {detailJob.followed_up_at}</span>
                  </span>
                ) : isFollowUpDue(detailJob) ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                    <span>⏰ Follow up due (Applied {getDaysSinceApplied(detailJob)} days ago)</span>
                  </span>
                ) : <div />}

                {(detailJob.status === 'Applied' || detailJob.status === 'Under Review') && (
                  <button
                    type="button"
                    onClick={() => openFollowUpModal(detailJob)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning bg-warning/10 hover:bg-warning/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-warning/20"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Generate Follow-Up Email</span>
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="text-subtle flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Applied
                  </span>
                  <span className="text-foreground font-medium">{detailJob.applied_date || 'Recent'}</span>
                </div>
                {detailJob.location && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-subtle flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </span>
                    <span className="text-foreground text-right">{detailJob.location}</span>
                  </div>
                )}
                {detailJob.platform && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-subtle">Platform</span>
                    <span className="text-foreground">{detailJob.platform}</span>
                  </div>
                )}
                {detailJob.salary && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-subtle">Target Compensation</span>
                    <span className="text-foreground font-medium">{detailJob.salary}</span>
                  </div>
                )}
                {detailJob.match_score !== undefined && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-subtle">Match Score</span>
                    <span className="text-success font-semibold">{detailJob.match_score}%</span>
                  </div>
                )}
                {detailJob.apply_url && (
                  <a
                    href={detailJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-1.5 text-brand hover:underline font-medium"
                  >
                    <span>Portal Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {detailJob.notes && (
                  <div className="bg-surface rounded-xl p-3 text-muted-foreground leading-relaxed mt-2">
                    <span className="font-semibold text-foreground">Notes: </span>
                    {detailJob.notes}
                  </div>
                )}
              </div>

              {/* Cross-tab jumps */}
              {(onSelectForTailoring || onViewScreening) && (
                <div className="flex items-center gap-2">
                  {onSelectForTailoring && (
                    <button
                      onClick={() => onSelectForTailoring(detailJob)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-foreground bg-surface hover:bg-surface-2 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand" />
                      <span>Resume</span>
                    </button>
                  )}
                  {onViewScreening && (
                    <button
                      onClick={() => onViewScreening(detailJob)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-foreground bg-surface hover:bg-surface-2 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-warning" />
                      <span>ATS Prep</span>
                    </button>
                  )}
                </div>
              )}

              {/* Resume Versions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-semibold text-subtle uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Resume Versions
                  </h4>
                  <span className="text-[11px] text-subtle">
                    {(detailJob.resume_versions || []).length}
                  </span>
                </div>

                <div className="space-y-2">
                  {(detailJob.resume_versions || []).length === 0 ? (
                    <p className="text-[11px] text-subtle leading-relaxed bg-surface rounded-xl p-3">
                      No resume versions saved for this application yet.
                    </p>
                  ) : (
                    [...(detailJob.resume_versions || [])].reverse().map((version, reverseIdx) => {
                      const realIdx = (detailJob.resume_versions || []).length - 1 - reverseIdx;
                      const summary = (version.resume?.tailored_summary || '').trim();
                      return (
                        <div key={version.id} className="border border-border rounded-xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-semibold text-foreground">{version.label}</span>
                              {version.match_score !== undefined && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                                  {version.match_score}% match
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDownloadVersion(detailJob, realIdx)}
                              title={`Download ${version.label} as PDF`}
                              className="p-1.5 text-subtle hover:text-foreground hover:bg-surface rounded-full transition-colors cursor-pointer shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-subtle">Saved {formatStamp(version.saved_at)}</p>
                          {summary && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                              {summary}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {onSaveResumeVersion && (
                  <div className="mt-2.5">
                    <button
                      onClick={() => onSaveResumeVersion(detailJob.id, currentResume as TailoredResumeData)}
                      disabled={!canSaveVersion}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        canSaveVersion
                          ? 'text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer shadow-elevated'
                          : 'text-subtle bg-surface cursor-not-allowed opacity-70'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Current Tailored Resume</span>
                    </button>
                    {!canSaveVersion && (
                      <p className="text-[10px] text-subtle mt-1.5 leading-relaxed">
                        Tailor a resume for this role in the Resume tab first — it will be saved here as an immutable version.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Activity / Audit Trail */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-semibold text-subtle uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Activity
                  </h4>
                  <span className="text-[11px] text-subtle">
                    {(detailJob.events || []).length}
                  </span>
                </div>

                <div className="space-y-0">
                  {((detailJob.events || []).length === 0
                    ? [{ id: 'none', at: detailJob.created_at, type: 'created', detail: 'Application added to tracker' }]
                    : [...(detailJob.events || [])].reverse()
                  ).map((event, idx, arr) => {
                    const meta = EVENT_META[event.type] || EVENT_META.details_updated;
                    const Icon = meta.icon;
                    return (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                            <Icon className={`w-3 h-3 ${meta.tone}`} />
                          </span>
                          {idx < arr.length - 1 && <span className="w-px flex-1 bg-border min-h-[16px]" />}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className="text-[11px] text-foreground leading-snug">{event.detail}</p>
                          <p className="text-[10px] text-subtle mt-0.5">{formatStamp(event.at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-label={editingJob ? 'Edit Application' : 'Track New Application'} className="mobile-dialog-panel bg-card rounded-3xl border border-border max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mobile-application-heading flex items-center gap-2 mb-4">
              <span className="apple-badge-blue text-[11px]">TRACKER</span>
              <h3 className="font-display font-semibold text-lg text-foreground">
                {editingJob ? 'Edit Application' : 'Track New Application'}
              </h3>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Revolut, Honeywell, Google"
                  className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Real-Time Operations SME / Product Ops Lead"
                  className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Location / Work Type
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote Hybrid / Bengaluru"
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Platform / ATS
                  </label>
                  <input
                    type="text"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    placeholder="e.g. Workday, SmartRecruiters, LinkedIn"
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Match Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formMatchScore ?? ''}
                    onChange={(e) => setFormMatchScore(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 94"
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                    Target Compensation
                  </label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. ₹22-26 LPA"
                    className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                  Portal URL / Listing Link
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                  Notes / Interview Next Steps
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Recruiter contact, interview scheduled date, screening questions asked, etc."
                  className="w-full px-3.5 py-2 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-xl text-xs text-foreground outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-subtle hover:text-foreground hover:bg-surface rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-elevated cursor-pointer"
                >
                  {editingJob ? 'Save Changes' : 'Add to Applications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Follow-Up Email Generator Modal */}
      {followUpModalJob && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Generate Follow-Up Email"
            className="mobile-dialog-panel bg-card rounded-3xl border border-border max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 space-y-4"
          >
            <button
              type="button"
              onClick={() => setFollowUpModalJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-subtle hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="apple-badge-blue text-[11px] font-mono">FOLLOW-UP COPILOT</span>
              <h3 className="font-display font-semibold text-lg text-foreground">
                Generate Follow-Up Email
              </h3>
            </div>
            <p className="text-xs text-subtle -mt-2">
              Polite, tailored follow-up check-in for{' '}
              <strong className="text-foreground">{followUpModalJob.company_name}</strong> ·{' '}
              {followUpModalJob.job_title}
            </p>

            {followUpSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-display text-base font-bold text-foreground">
                  Marked as Followed Up!
                </h4>
                <p className="text-xs text-subtle">
                  Updated application activity with today's date.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                      Recipient
                    </label>
                    <div className="px-3.5 py-2 bg-surface rounded-xl text-xs text-foreground font-medium border border-border">
                      {generateFollowUpEmail(followUpModalJob, effectiveCandidate).recipient}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                      Subject Line
                    </label>
                    <div className="px-3.5 py-2 bg-surface rounded-xl text-xs text-foreground font-medium border border-border select-all">
                      {generateFollowUpEmail(followUpModalJob, effectiveCandidate).subject}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-subtle uppercase tracking-wider mb-1">
                      Email Body
                    </label>
                    <textarea
                      readOnly
                      rows={8}
                      value={generateFollowUpEmail(followUpModalJob, effectiveCandidate).body}
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-foreground leading-relaxed outline-none select-all font-sans resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const email = generateFollowUpEmail(followUpModalJob, effectiveCandidate);
                        const fullText = `Subject: ${email.subject}\n\n${email.body}`;
                        navigator.clipboard.writeText(fullText);
                        setFollowUpCopied(true);
                        setTimeout(() => setFollowUpCopied(false), 2000);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 font-medium text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full text-xs transition-colors cursor-pointer"
                    >
                      {followUpCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>Copied Email</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-subtle" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        generateFollowUpEmail(followUpModalJob, effectiveCandidate).subject
                      )}&body=${encodeURIComponent(
                        generateFollowUpEmail(followUpModalJob, effectiveCandidate).body
                      )}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 font-medium text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full text-xs transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-subtle" />
                      <span>Open in Mail Client</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarkAsFollowedUp(followUpModalJob)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Followed Up</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recruiter Email Parser & Pipeline Auto-Advance Modal */}
      {isEmailParserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                    Recruiter Email Classifier & Auto-Advance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deterministic inbound correspondence triage & pipeline automation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailParserOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Subject Line (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invitation to Interview: Stripe Operations Specialist"
                  value={emailSubjectInput}
                  onChange={(e) => setEmailSubjectInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Content / Recruiter Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste the recruiter's email message here (e.g. 'We loved your profile and would like to invite you for a 30-min interview with the hiring manager...')"
                  value={emailBodyInput}
                  onChange={(e) => setEmailBodyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyzeEmail}
                disabled={!emailBodyInput.trim()}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Classify Recruiter Signal</span>
              </button>
            </div>

            {/* Analysis Result Card */}
            {parsedEmailResult && (
              <div className="p-4 rounded-2xl bg-surface/70 border border-border/80 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {parsedEmailResult.label}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {parsedEmailResult.confidence}% confidence
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Next Stage: <strong className="text-brand">{parsedEmailResult.recommendedStage}</strong>
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  {parsedEmailResult.actionableSummary}
                </p>

                {parsedEmailResult.schedulingLink && (
                  <div className="p-2.5 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground truncate">
                      Booking Link: <strong className="text-foreground">{parsedEmailResult.schedulingLink}</strong>
                    </span>
                    <a
                      href={parsedEmailResult.schedulingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline font-semibold shrink-0"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Assign and advance which application?
                  </label>
                  <select
                    value={selectedMatchJobId}
                    onChange={(e) => setSelectedMatchJobId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-brand"
                  >
                    {appliedJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.company_name} — {j.job_title} (Current: {j.status})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleApplyEmailStageAdvance}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Advance Pipeline Stage to "{parsedEmailResult.recommendedStage}"</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recruiter Radar Live Click Logs Modal */}
      {isRadarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                    Recruiter Radar: Live CV Link Tracking
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time engagement signals when recruiters open links in your PDF resume
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRadarModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Recruiter Clicks</span>
                <span className="text-2xl font-bold font-display text-emerald-400 mt-1">
                  {tracerLinks.reduce((sum, l) => sum + (l.clickCount || 0), 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Across active CV tracer links</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Active Tracer Links</span>
                <span className="text-2xl font-bold font-display text-foreground mt-1">
                  {tracerLinks.length}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Portfolio, LinkedIn & GitHub</span>
              </div>
            </div>

            {/* List of Click Logs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                Recent Link Engagements
              </span>
              {tracerLinks.length === 0 ? (
                <div className="p-8 text-center bg-surface/40 rounded-2xl border border-border space-y-2">
                  <Radio className="w-8 h-8 text-subtle mx-auto opacity-30" />
                  <p className="text-xs text-muted-foreground font-medium">
                    No active recruiter clicks recorded yet.
                  </p>
                  <p className="text-[11px] text-subtle max-w-sm mx-auto">
                    Export your resume with "Recruiter Radar Links" enabled to automatically generate secure click-tracking tokens for your portfolio and LinkedIn.
                  </p>
                </div>
              ) : (
                tracerLinks.map((tl) => (
                  <div
                    key={tl.id || tl.token}
                    className="p-3 rounded-2xl bg-surface border border-border/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground capitalize">
                          {tl.linkLabel || 'CV Link'}
                        </span>
                        {tl.companyName && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface-2 text-muted-foreground">
                            {tl.companyName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-subtle truncate mt-0.5" title={tl.targetUrl}>
                        {tl.targetUrl}
                      </p>
                      {tl.lastClickedAt && (
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          Last opened: {new Date(tl.lastClickedAt).toLocaleDateString()} {new Date(tl.lastClickedAt).toLocaleTimeString()} ({tl.lastReferrer || 'Direct PDF'})
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-display text-emerald-400 tabular-nums">
                        {tl.clickCount}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">clicks</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
