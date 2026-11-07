// @ts-nocheck -- ported verbatim from the original project
import React, { useState, useMemo, useEffect } from 'react';
import { LoadingProgress } from './LoadingProgress';
import {
  CAREER_ROADMAPS,
  CareerRoadmap,
  RoadmapStage,
  RoadmapSkill,
} from '../data/roadmapData';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Code,
  Milestone,
  HelpCircle,
  Briefcase,
  Layers,
  Zap,
  Award,
  Terminal,
} from 'lucide-react';

interface CareerRoadmapsViewProps {
  onSelectRoleForJobs?: (roleTitle: string) => void;
  onSelectRoleForResume?: (roleTitle: string) => void;
  masterProfileText?: string;
  isProUser?: boolean;
  onNavigateToPricing?: () => void;
  userEmail?: string;
}

export const CareerRoadmapsView: React.FC<CareerRoadmapsViewProps> = ({
  onSelectRoleForJobs,
  onSelectRoleForResume,
  masterProfileText = '',
  isProUser = false,
  onNavigateToPricing,
  userEmail = '',
}) => {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSkillIds, setExpandedSkillIds] = useState<Set<string>>(
    new Set(['swe-core-prog', 'fe-semantic-html', 'ops-queue-sla'])
  );
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isAssessingReadiness, setIsAssessingReadiness] = useState<boolean>(false);
  const [readinessData, setReadinessData] = useState<{
    readiness_score: number;
    readiness_level: string;
    summary: string;
    matched_competencies: string[];
    priority_gaps: {
      skill: string;
      rationale: string;
      recommended_action: string;
      estimated_weeks: string;
    }[];
  } | null>(null);

  const getProgressKey = (email?: string) => {
    const clean = (email || '').toLowerCase().trim();
    if (!clean) return 'jobstudio_roadmap_progress_demo';
    return `jobstudio_roadmap_progress_${clean}`;
  };

  // User progress persisted in user-scoped localStorage
  const [completedSkillIds, setCompletedSkillIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getProgressKey(userEmail || localStorage.getItem('jobstudio_user_email') || '');
        const saved = localStorage.getItem(key);
        if (saved) return new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse roadmap progress from localStorage', e);
      }
    }
    return new Set();
  });

  // Re-sync when user context changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getProgressKey(userEmail);
        const saved = localStorage.getItem(key);
        setCompletedSkillIds(saved ? new Set(JSON.parse(saved)) : new Set());
      } catch {}
    }
  }, [userEmail]);

  // Save progress changes to user-scoped storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getProgressKey(userEmail);
        localStorage.setItem(
          key,
          JSON.stringify(Array.from(completedSkillIds))
        );
      } catch (e) {
        console.error('Failed to save roadmap progress to localStorage', e);
      }
    }
  }, [completedSkillIds, userEmail]);

  const toggleSkillCompleted = (skillId: string) => {
    setCompletedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const toggleSkillExpanded = (skillId: string) => {
    setExpandedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const activeRoadmap = useMemo(() => {
    return CAREER_ROADMAPS.find((r) => r.id === selectedRoadmapId) || null;
  }, [selectedRoadmapId]);

  const handleAssessReadiness = async () => {
    if (!activeRoadmap) return;
    setIsAssessingReadiness(true);
    try {
      const res = await fetch('/api/roadmap-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId: activeRoadmap.id,
          roadmapTitle: activeRoadmap.title,
          masterProfileText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReadinessData(data);
      }
    } catch (err) {
      console.error('Error assessing roadmap readiness:', err);
    } finally {
      setIsAssessingReadiness(false);
    }
  };

  // Filter roadmaps for grid view
  const filteredRoadmaps = useMemo(() => {
    return CAREER_ROADMAPS.filter((r) => {
      if (selectedCategory !== 'All' && r.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesStack = r.coreStack.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesStack) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: CAREER_ROADMAPS.length };
    CAREER_ROADMAPS.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, []);

  const categories = useMemo(
    () => [
      'All',
      'Engineering',
      'AI & Data',
      'Cloud & DevOps',
      'Operations',
      'Product & Project',
      'Solutions & GTM',
      'Business & Finance',
      'Travel & Hospitality',
      'Creative & Design',
    ],
    []
  );

  // Calculate completed progress for active roadmap
  const activeRoadmapProgress = useMemo(() => {
    if (!activeRoadmap) return { completed: 0, total: 0, percent: 0 };
    const allSkills = activeRoadmap.stages.flatMap((s) => s.skills);
    const total = allSkills.length;
    const completed = allSkills.filter((s) => completedSkillIds.has(s.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [activeRoadmap, completedSkillIds]);

  // Career Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{
    interest?: string;
    level?: string;
    stack?: string;
  }>({});
  const [quizResult, setQuizResult] = useState<CareerRoadmap[] | null>(null);

  const handleRunQuiz = () => {
    const interest = quizAnswers.interest || 'swe';
    let recommendations: CareerRoadmap[] = [];
    if (interest === 'ops') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.category === 'Operations');
    } else if (interest === 'ai' || interest === 'data') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.category === 'AI & Data');
    } else if (interest === 'frontend') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.id === 'frontend' || r.id === 'new-grad-swe');
    } else if (interest === 'devops') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.category === 'Cloud & DevOps');
    } else if (interest === 'pm') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.category === 'Product & Project');
    } else if (interest === 'sales' || interest === 'solutions') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.category === 'Solutions & GTM');
    } else if (interest === 'security') {
      recommendations = CAREER_ROADMAPS.filter((r) => r.id === 'security-engineering' || r.category === 'Engineering');
    } else {
      recommendations = CAREER_ROADMAPS.filter((r) => r.id === 'new-grad-swe' || r.id === 'backend' || r.id === 'product-management');
    }
    setQuizResult(recommendations.slice(0, 3));
  };

  return (
    <div className="workspace-roadmaps space-y-8 animate-fade-in text-foreground pb-16 max-w-6xl mx-auto">
      {/* Detail View for a selected roadmap */}
      {activeRoadmap ? (
        <div className="space-y-6">
          {/* Back button & quick navigation */}
          <div className="roadmap-detail-navigation flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedRoadmapId(null)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-surface border border-border rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all roadmaps</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              {onSelectRoleForJobs && (
                <button
                  type="button"
                  onClick={() => onSelectRoleForJobs(activeRoadmap.title)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full shadow-sm transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Match Live Jobs ⚡</span>
                </button>
              )}
              {onSelectRoleForResume && (
                <button
                  type="button"
                  onClick={() => onSelectRoleForResume(activeRoadmap.title)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-foreground bg-card hover:bg-surface border border-border rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <Briefcase className="w-3.5 h-3.5 text-brand" />
                  <span>Tailor Resume</span>
                </button>
              )}
            </div>
          </div>

          {/* Landing-Inspired Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-9 shadow-elevated space-y-6">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-semibold tracking-widest uppercase font-mono border border-brand/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    ROADMAP · {activeRoadmap.category.toUpperCase()}
                  </span>
                  {activeRoadmap.badge && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      {activeRoadmap.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                  {activeRoadmap.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeRoadmap.description}
                </p>
                <div className="roadmap-stats flex items-center gap-3 text-xs text-subtle font-mono pt-1">
                  <span>{activeRoadmap.stages.length} stages</span>
                  <span>·</span>
                  <span>{activeRoadmapProgress.total} skills</span>
                  <span>·</span>
                  <span>
                    {activeRoadmap.stages.flatMap((s) => s.skills).flatMap((k) => k.resources).length} free resources
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAssessReadiness}
                  disabled={isAssessingReadiness}
                  className="px-4 py-2 bg-brand/10 hover:bg-brand/15 border border-brand/25 text-brand text-xs font-semibold rounded-full transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <LoadingProgress inline active={isAssessingReadiness} label="Analyzing profile" idleLabel="Assess My Readiness" expectedSeconds={35} resultToken={readinessData} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectRoleForJobs) onSelectRoleForJobs(activeRoadmap.title);
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full transition-all shadow-glow cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Train on this path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Core Stack */}
            <div className="relative z-10 space-y-2.5 pt-5 border-t border-border">
              <span className="font-mono text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                CORE STACK
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeRoadmap.coreStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-surface/90 border border-border/80 text-foreground hover:border-brand/40 transition-colors"
                  >
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-card font-bold text-brand border border-border">
                      {tech.tag}
                    </span>
                    <span>{tech.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="bg-gradient-to-b from-card to-surface/80 rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="roadmap-progress-heading flex items-center justify-between text-xs font-mono">
              <span className="text-subtle font-semibold tracking-wider uppercase">
                TRACK YOUR PROGRESS
              </span>
              <span className="text-brand font-bold">
                {activeRoadmapProgress.completed} / {activeRoadmapProgress.total} skills done ({activeRoadmapProgress.percent}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border/60">
              <div
                className="bg-gradient-to-r from-brand to-blue-400 h-full transition-all duration-300 rounded-full shadow-glow"
                style={{ width: `${activeRoadmapProgress.percent}%` }}
              />
            </div>
            <p className="text-[11px] text-subtle font-mono">
              Check off completed skills below to track your curriculum milestones in real-time.
            </p>
          </div>

          {/* Roadmap Readiness Assessment Diagnostic Card */}
          {readinessData && (
            <div className="bg-surface border border-brand/20 p-6 rounded-2xl shadow-xs space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                      CAREER READINESS ASSESSMENT
                    </span>
                    <span className="text-xs text-success font-mono font-bold">
                      {readinessData.readiness_level} CANDIDATE
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Diagnostic Match for {activeRoadmap.title}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                    {readinessData.summary}
                  </p>
                </div>

                <div className="bg-card px-4 py-3 rounded-xl border border-border text-center shrink-0 self-start sm:self-auto shadow-2xs">
                  <div className="text-3xl font-extrabold text-brand font-mono">
                    {readinessData.readiness_score}%
                  </div>
                  <div className="text-[10px] text-subtle uppercase font-semibold">
                    Readiness Score
                  </div>
                </div>
              </div>

              {/* Matched Competencies & Priority Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Matched */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                  <span className="font-bold text-success uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Skills in Your Profile
                  </span>
                  <ul className="space-y-1.5 text-foreground">
                    {readinessData.matched_competencies.map((comp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success font-bold">✓</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                  <span className="font-bold text-danger uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Priority Skills to Bridge
                  </span>
                  <div className="space-y-2.5">
                    {readinessData.priority_gaps.map((gap, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-foreground text-xs">{gap.skill}</strong>
                          <span className="text-[10px] font-mono text-brand bg-brand/10 px-2 py-0.5 rounded font-medium">
                            {gap.estimated_weeks}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{gap.recommended_action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Stages & Skills Timeline */}
          <div className="space-y-6 pt-2">
            {activeRoadmap.stages.map((stage) => (
              <div
                key={stage.id}
                className="bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-xs space-y-5"
              >
                {/* Stage Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    {stage.stageNumber}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-brand uppercase">
                      {stage.stageLabel}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Skills Accordion List */}
                <div className="space-y-3 pl-0 sm:pl-11">
                  {stage.skills.map((skill) => {
                    const isCompleted = completedSkillIds.has(skill.id);
                    const isExpanded = expandedSkillIds.has(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCompleted
                            ? 'bg-[#F0FDF4] border-success/30'
                            : 'bg-surface border-border hover:border-[rgba(0,0,0,0.12)]'
                        }`}
                      >
                        {/* Skill Row Header */}
                        <div className="roadmap-skill-heading p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSkillCompleted(skill.id);
                              }}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isCompleted
                                  ? 'bg-success text-primary-foreground'
                                  : 'border border-border hover:border-success text-transparent'
                              }`}
                              title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {skill.name}
                                </span>
                                <span
                                  className={`text-[9px] font-mono px-2 py-0.2 rounded font-bold uppercase tracking-wider ${
                                    skill.level === 'ESSENTIAL'
                                      ? 'bg-brand/10 text-brand border border-brand/20'
                                      : skill.level === 'RECOMMENDED'
                                      ? 'bg-success/10 text-success border border-success/20'
                                      : 'bg-warning/10 text-warning border border-warning/20'
                                  }`}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expand Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleSkillExpanded(skill.id)}
                            className="text-subtle hover:text-foreground flex items-center gap-1.5 text-xs font-mono shrink-0 cursor-pointer pl-2"
                          >
                            <span>{skill.resources.length} links</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-border space-y-3.5 text-xs text-foreground">
                            <p className="leading-relaxed text-muted-foreground">
                              {skill.description}
                            </p>

                            {/* Why It Matters Callout */}
                            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                              <span className="font-mono text-[10px] uppercase font-bold text-brand tracking-wider block">
                                WHY IT MATTERS
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {skill.whyItMatters}
                              </p>
                            </div>

                            {/* Free Learning Resources List */}
                            <div className="space-y-2">
                              <span className="font-mono text-[10px] uppercase font-semibold text-subtle tracking-wider block">
                                CURATED FREE RESOURCES
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {skill.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-card hover:bg-surface border border-border hover:border-brand/40 transition-all flex items-start justify-between gap-2 group text-xs shadow-2xs"
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface text-brand font-bold border border-border">
                                          {res.type}
                                        </span>
                                        <span className="text-[10px] text-subtle truncate">
                                          {res.provider}
                                        </span>
                                      </div>
                                      <p className="text-[11px] font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                                        {res.title}
                                      </p>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-brand shrink-0 mt-1" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid Overview of all Roadmaps */
        <div className="space-y-8">
          {/* Landing-Inspired Showcase Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-9 shadow-elevated space-y-6">
            {/* Ambient Cosmic Radial Glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-widest uppercase font-mono border border-brand/20 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>CAREER ROADMAPS · 2026 BLUEPRINTS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-foreground leading-[1.08]">
                Learning Paths for 2026 Careers
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Pick your target role, explore curriculum milestones with curated free resources, and bridge skill gaps directly into your tailored resume and ATS job applications.
              </p>

              {/* Value Highlight Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-muted-foreground bg-surface/80 border border-border/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  31 Production Blueprints
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-muted-foreground bg-surface/80 border border-border/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Curated Free Resources
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-muted-foreground bg-surface/80 border border-border/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Direct Resume &amp; ATS Bridge
                </span>
              </div>
            </div>

            {/* Career Quiz Callout Banner with Interactive Landing Treatment */}
            <div
              onClick={() => setIsQuizOpen(true)}
              className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-brand/10 via-surface/80 to-surface/60 hover:from-brand/15 hover:via-surface hover:to-surface rounded-2xl border border-brand/25 hover:border-brand/50 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-brand group-hover:text-background transition-all shadow-[0_0_16px_rgba(59,130,246,0.25)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-brand transition-colors">
                      Not sure which role fits you?
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand uppercase tracking-wider">
                      2-MIN MATCH QUIZ
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Take the two-minute career quiz and discover your top 3 matching paths.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-surface border border-border text-foreground group-hover:bg-brand group-hover:text-background group-hover:border-brand transition-all shrink-0 shadow-2xs">
                <span>Take career quiz</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Search and Domain Filters */}
            <div className="relative z-10 pt-4 border-t border-border space-y-4">
              {/* Row 1: Search Bar & Result Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roles, skills, or tech (e.g. React, Python, Cloud)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-surface/90 focus:bg-card border border-border focus:border-brand/60 rounded-xl text-xs sm:text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground text-xs font-bold p-1 cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-subtle shrink-0">
                  <span>
                    Showing <strong className="text-foreground font-semibold">{filteredRoadmaps.length}</strong> of {CAREER_ROADMAPS.length} learning paths
                  </span>
                  {(selectedCategory !== 'All' || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="text-xs font-semibold text-brand hover:underline cursor-pointer ml-1"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Category Filter Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block font-mono">
                  Browse by Domain:
                </span>
                <div className="roadmap-category-filters flex flex-wrap items-center gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    const count = categoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-glow border border-primary scale-[1.02]'
                            : 'bg-surface/80 hover:bg-surface-2 text-muted-foreground hover:text-foreground border border-border/80 hover:border-brand/30'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected
                              ? 'bg-black/20 text-primary-foreground font-bold'
                              : 'bg-surface-2 text-subtle'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Roadmaps Grid */}
          {filteredRoadmaps.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-surface text-subtle flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-foreground">
                No learning paths found
              </h3>
              <p className="text-xs text-subtle max-w-sm mx-auto">
                {selectedCategory !== 'All'
                  ? `There are currently no learning paths in "${selectedCategory}". Check back soon or browse another domain.`
                  : `No learning paths match "${searchQuery}". Try searching for another skill, role, or technology.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoadmaps.map((roadmap) => {
                const badgeUpper = (roadmap.badge || '').toUpperCase();
                const isStartHere = badgeUpper === 'START HERE';
                const isPopular = badgeUpper === 'POPULAR';
                const isHighDemand = badgeUpper === 'HIGH DEMAND';

                return (
                  <div
                    key={roadmap.id}
                    onClick={() => setSelectedRoadmapId(roadmap.id)}
                    className="relative bg-gradient-to-b from-card via-card/95 to-surface/80 hover:to-surface p-6 sm:p-7 rounded-3xl border border-border/90 hover:border-brand/60 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-5 group shadow-elevated hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_30px_0_rgba(59,130,246,0.15)] hover:-translate-y-1.5 overflow-hidden"
                  >
                    {/* Top edge glowing gradient border on hover */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="space-y-4">
                      {/* Top Stack Icons + Optional Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {roadmap.coreStack.slice(0, 4).map((tech) => (
                            <span
                              key={tech.name}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-surface border border-border/80 text-foreground/90 group-hover:border-brand/30 group-hover:text-brand transition-colors"
                              title={tech.name}
                            >
                              {tech.tag}
                            </span>
                          ))}
                          {roadmap.coreStack.length > 4 && (
                            <span className="text-[10px] font-mono text-subtle px-1">
                              +{roadmap.coreStack.length - 4}
                            </span>
                          )}
                        </div>

                        {roadmap.badge && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isStartHere
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : isHighDemand
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : isPopular
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                : 'bg-brand/10 text-brand border border-brand/20'
                            }`}
                          >
                            {roadmap.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg sm:text-xl text-foreground group-hover:text-brand transition-colors tracking-tight leading-snug">
                          {roadmap.title}
                        </h3>
                        <p className="text-xs font-mono text-brand/90 font-medium">
                          {roadmap.subtitle}
                        </p>
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors">
                        {roadmap.description}
                      </p>
                    </div>

                    {/* Footer Stats & Arrow Button */}
                    <div className="roadmap-card-stats pt-4 border-t border-border/80 flex items-center justify-between text-xs text-subtle font-mono group-hover:text-foreground transition-colors">
                      <span className="truncate pr-2">
                        {roadmap.stages.length} stages · {roadmap.stages.flatMap((s) => s.skills).length} skills · {roadmap.stages.flatMap((s) => s.skills).flatMap((k) => k.resources).length} resources
                      </span>
                      <div className="w-7 h-7 rounded-full bg-surface group-hover:bg-brand text-subtle group-hover:text-background border border-border group-hover:border-brand flex items-center justify-center transition-all shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2-Minute Career Quiz Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-label="Career Path Matcher" className="mobile-dialog-panel bg-card text-foreground rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-border shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <h3 className="font-display font-bold text-base text-foreground">
                  2-Minute Career Path Matcher
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuizOpen(false);
                  setQuizResult(null);
                }}
                className="text-subtle hover:text-foreground font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {quizResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-success/10 border border-success/20 rounded-2xl text-xs text-success font-semibold">
                  ✓ Based on your preferences, here are your top 3 recommended 2026 paths:
                </div>

                <div className="space-y-2.5">
                  {quizResult.map((r, i) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRoadmapId(r.id);
                        setIsQuizOpen(false);
                        setQuizResult(null);
                      }}
                      className="p-3.5 bg-surface hover:bg-surface-2 rounded-2xl border border-border hover:border-brand transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-brand">
                            MATCH #{i + 1}
                          </span>
                          <span className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                            {r.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {r.subtitle}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuizResult(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-subtle hover:text-foreground cursor-pointer"
                >
                  Restart Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Question 1 */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    1. What type of work energizes you most?
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { key: 'swe', label: 'Building systems, algorithms, APIs & programming logic' },
                      { key: 'frontend', label: 'Crafting user interfaces, web applications & UX' },
                      { key: 'ai', label: 'Generative AI, LLM orchestration, agents & embeddings' },
                      { key: 'data', label: 'Data science, analytics, business intelligence & predictive modeling' },
                      { key: 'pm', label: 'Product management, scoping PRDs & feature prioritization' },
                      { key: 'solutions', label: 'Pre-sales engineering, architecture & enterprise implementation' },
                      { key: 'sales', label: 'B2B tech sales, account management & GTM commercial strategy' },
                      { key: 'devops', label: 'Cloud infrastructure, Docker, Kubernetes & CI/CD pipelines' },
                      { key: 'security', label: 'Application security, threat modeling, IAM & cloud defense' },
                      { key: 'ops', label: 'Real-time operations, workforce queue triage & SLA response' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, interest: opt.key }))}
                        className={`p-2.5 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                          quizAnswers.interest === opt.key
                            ? 'bg-brand/10 border-brand text-brand font-semibold'
                            : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    2. What is your current experience level?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'junior', label: 'Early / New Grad' },
                      { key: 'mid', label: 'Mid-Level' },
                      { key: 'senior', label: 'Senior / Lead' },
                    ].map((lvl) => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, level: lvl.key }))}
                        className={`p-2 rounded-xl text-center transition-all border text-xs cursor-pointer ${
                          quizAnswers.level === lvl.key
                            ? 'bg-brand/10 border-brand text-brand font-semibold'
                            : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-2'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunQuiz}
                  className="w-full py-2.5 mt-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-sm cursor-pointer"
                >
                  Find My Top Career Paths →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
