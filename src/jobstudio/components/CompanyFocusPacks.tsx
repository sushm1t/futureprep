import { useEffect, useMemo, useState } from 'react';
import { LoadingProgress } from './LoadingProgress';
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Building2,
  Target,
  Sparkles,
  Pencil,
  UserCheck,
  ArrowRight,
  Search,
  X,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  COMPANY_GUIDANCE,
  findCompanyGuidance,
  synthesizeCompanyGuidance,
  CompanyGuidance,
} from '../data/companyGuidance';
import { buildPracticeQuestions } from '../utils/practiceQuestions';
import type { InterviewPrepQuestion } from '../data/defaultData';

const FEATURED_COMPANY_IDS = [
  'revolut',
  'amazon',
  'google',
  'stripe',
  'figma',
  'openai',
  'apple',
  'microsoft',
];

const COMPANY_CATEGORIES = [
  'All',
  'Big Tech & Cloud Platforms',
  'Frontier AI & Data',
  'Fintech & Banking',
  'Productivity & Design',
  'Developer Tools & Infra',
  'Global Remote & HR Tech',
  'Consumer Tech & Marketplace',
  'Enterprise SaaS & CRM',
  'Global Finance & Banking',
  'Strategy Consulting',
] as const;

function getQuestionCompetency(question: string, family: string): string {
  const q = question.toLowerCase();
  if (q.includes('capacity') || q.includes('prioritize') || q.includes('staffing')) {
    return 'Capacity Allocation & SLA Prioritization';
  }
  if (q.includes('bottleneck') || q.includes('service quality') || q.includes('defect') || q.includes('failure')) {
    return 'Root-Cause Analysis & SOP Optimization';
  }
  if (q.includes('disruption') || q.includes('outage') || q.includes('incident') || q.includes('stakeholder')) {
    return 'Incident Escalation & Cross-Functional Governance';
  }
  if (q.includes('specimen') || q.includes('calibration') || q.includes('testing queues')) {
    return 'Clinical Quality Control & Specimen Integrity';
  }
  if (q.includes('critical alert') || q.includes('escalating') || q.includes('alert values')) {
    return 'Critical Value Escalation & Patient Safety';
  }
  if (q.includes('audit readiness') || q.includes('sop') || q.includes('cross-shift')) {
    return 'SOP Compliance & Laboratory Audit Readiness';
  }
  if (q.includes('competing feature') || q.includes('tech debt') || q.includes('backlog')) {
    return 'Product Strategy & Trade-off Prioritization';
  }
  if (q.includes('kpi') || q.includes('okr') || q.includes('launch') || q.includes('metric')) {
    return 'Hypothesis Testing & Metric Impact Analysis';
  }
  if (q.includes('drop-off') || q.includes('funnel') || q.includes('diagnosed')) {
    return 'Funnel Diagnostics & Root-Cause Resolution';
  }
  if (q.includes('dispute') || q.includes('chargeback') || q.includes('reconciliation') || q.includes('settlement')) {
    return 'Financial Disputes & Settlement Governance';
  }
  if (q.includes('rag') || q.includes('unsupported') || q.includes('hallucination')) {
    return 'RAG Architecture & Hallucination Mitigation';
  }
  if (q.includes('latency') || q.includes('cost') || q.includes('trade-off')) {
    return 'Production Latency, Cost & Quality Trade-offs';
  }
  if (q.includes('leakage') || q.includes('validation')) {
    return 'Data Leakage Detection & Validation Strategy';
  }
  if (q.includes('prospect') || q.includes('qualify')) {
    return 'Prospect Discovery & Pain Point Mapping';
  }
  if (q.includes('pricing') || q.includes('objection')) {
    return 'Objection Handling & Value Framing';
  }
  if (q.includes('pipeline') || q.includes('stall')) {
    return 'Pipeline Velocity & Deal Diagnostic';
  }
  if (q.includes('reliable') || q.includes('design')) {
    return 'System Reliability & Architecture Design';
  }
  if (q.includes('feedback') || q.includes('accessibility') || q.includes('user')) {
    return 'User Advocacy, Accessibility & Stakeholder Alignment';
  }
  return `${family} Focus`;
}

export function CompanyFocusPacks({
  companyName,
  jobTitle,
  jobDescription,
  masterProfileText,
  applyUrl,
}: {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  masterProfileText: string;
  applyUrl?: string;
}) {
  // Determine if active companyName is provided and distinct from the curated list
  const activeCompanyGuidance = useMemo<CompanyGuidance | null>(() => {
    if (!companyName || !companyName.trim()) return null;
    const existing = findCompanyGuidance(companyName);
    if (existing) return null;
    return synthesizeCompanyGuidance(companyName, jobTitle, jobDescription, applyUrl);
  }, [companyName, jobTitle, jobDescription, applyUrl]);

  // If custom company is active, place it first so the guide automatically anchors to it
  const allCompanies = useMemo<CompanyGuidance[]>(() => {
    if (activeCompanyGuidance) {
      return [activeCompanyGuidance, ...COMPANY_GUIDANCE];
    }
    return COMPANY_GUIDANCE;
  }, [activeCompanyGuidance]);

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (activeCompanyGuidance) return activeCompanyGuidance.id;
    return findCompanyGuidance(companyName)?.id || 'revolut';
  });

  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [targetRole, setTargetRole] = useState(jobTitle);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [generated, setGenerated] = useState<InterviewPrepQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestKey, setRequestKey] = useState('');
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const handleCopyQuestion = (idx: number, qText: string, ansText: string) => {
    const fullText = `Question: ${qText}\n\nModel STAR Answer:\n${ansText || 'STAR Framework: Focus on direct situation context, specific task ownership, concrete actions taken, and measurable business results.'}`;
    navigator.clipboard.writeText(fullText);
    setCopiedQuestionIndex(idx);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  // Re-anchor whenever companyName or jobTitle changes
  useEffect(() => {
    setTargetRole(jobTitle);
    setIsEditingRole(false);
  }, [jobTitle]);

  useEffect(() => {
    if (activeCompanyGuidance) {
      setSelectedId(activeCompanyGuidance.id);
    } else {
      setSelectedId(findCompanyGuidance(companyName)?.id || 'revolut');
    }
  }, [companyName, activeCompanyGuidance]);

  const company = allCompanies.find(item => item.id === selectedId) || allCompanies[0];
  const isSelectedActiveRole = Boolean(
    (activeCompanyGuidance && selectedId === activeCompanyGuidance.id) ||
    (companyName && findCompanyGuidance(companyName)?.id === selectedId)
  );

  const hasActiveRoleCompany = Boolean(companyName && companyName.trim());
  const activeRoleItem = allCompanies.find((item) =>
    Boolean(
      (activeCompanyGuidance && item.id === activeCompanyGuidance.id) ||
      (companyName && findCompanyGuidance(companyName)?.id === item.id)
    )
  );

  const displayedCompanies = useMemo(() => {
    if (hasActiveRoleCompany && activeRoleItem) {
      return [activeRoleItem];
    }
    return allCompanies.filter(c => FEATURED_COMPANY_IDS.includes(c.id));
  }, [hasActiveRoleCompany, activeRoleItem, allCompanies]);

  const filteredDirectoryCompanies = useMemo(() => {
    return allCompanies.filter(c => {
      if (selectedCategory !== 'All' && c.industry !== selectedCategory) {
        return false;
      }
      if (companySearch.trim()) {
        const query = companySearch.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesIndustry = (c.industry || '').toLowerCase().includes(query);
        const matchesValues = c.values.some(v => v.toLowerCase().includes(query));
        return matchesName || matchesIndustry || matchesValues;
      }
      return true;
    });
  }, [allCompanies, selectedCategory, companySearch]);

  const practice = buildPracticeQuestions(targetRole, jobDescription, masterProfileText);
  const key = JSON.stringify([selectedId, targetRole, jobDescription, masterProfileText]);

  const hasProfile = Boolean(masterProfileText.trim()) && !/No resume uploaded yet/i.test(masterProfileText);
  const canGenerate = Boolean(targetRole.trim()) && hasProfile;

  if (!company) return null;

  async function generate() {
    if (!company) return;
    setBusy(true);
    setError('');
    const submittedKey = key;
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          jobTitle: targetRole,
          jobDescription,
          masterProfile: masterProfileText,
        }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error(data.error || 'Could not prepare questions. Please try again.');
      }
      setGenerated(data.questions);
      setRequestKey(submittedKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare questions.');
    } finally {
      setBusy(false);
    }
  }

  const questions = requestKey === key ? generated : [];

  return (
    <section className="space-y-5" aria-label="Company focus packs">
      {/* Company Selector Quick-Access Row */}
      <div className="flex flex-wrap items-center gap-2">
        {displayedCompanies.map((item) => {
          const isThisActiveRole = Boolean(
            (activeCompanyGuidance && item.id === activeCompanyGuidance.id) ||
            (companyName && findCompanyGuidance(companyName)?.id === item.id)
          );
          return (
            <Button
              key={item.id}
              variant={selectedId === item.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedId(item.id)}
              className="cursor-pointer"
            >
              {isThisActiveRole && <Sparkles className="w-3.5 h-3.5 mr-1 text-brand" />}
              <span>{item.name}</span>
              {isThisActiveRole && (
                <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-brand/20 text-brand uppercase font-mono font-bold">
                  Active Role
                </span>
              )}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAllCompanies(!showAllCompanies)}
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-subtle" />
          <span>{showAllCompanies ? 'Hide Other Companies ▴' : 'Browse Other Companies (100+) ▾'}</span>
        </Button>

        {hasActiveRoleCompany && activeRoleItem && selectedId !== activeRoleItem.id && (
          <button
            type="button"
            onClick={() => {
              setSelectedId(activeRoleItem.id);
              setShowAllCompanies(false);
            }}
            className="text-xs text-brand hover:underline cursor-pointer inline-flex items-center gap-1 ml-auto font-medium"
          >
            <span>Return to {activeRoleItem.name} (Active Role)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Expanded Interactive 100-Company Directory */}
      {showAllCompanies && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface/70 border border-border space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand" />
                <h4 className="font-semibold text-foreground text-sm sm:text-base">
                  Top 100 Global Employers &amp; Talent Leaders
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand/15 text-brand font-bold">
                  {allCompanies.length} AVAILABLE
                </span>
              </div>
              <p className="text-xs text-subtle mt-0.5">
                Explore site-verified culture pillars, operating domains, and interview frameworks across top employers.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAllCompanies(false)}
              className="text-xs cursor-pointer self-start sm:self-auto"
            >
              Close Directory ▴
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
                placeholder="Search 100+ companies by name, industry, or culture value (e.g. OpenAI, Stripe, McKinsey, Netflix)..."
                className="w-full pl-9 pr-9 py-2 text-xs bg-card border border-border rounded-xl text-foreground outline-none focus:border-brand transition-all"
              />
              {companySearch && (
                <button
                  type="button"
                  onClick={() => setCompanySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground text-xs p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {COMPANY_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-foreground text-background border-foreground font-semibold'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="max-h-[340px] overflow-y-auto pr-1">
            {filteredDirectoryCompanies.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-card/50 rounded-xl border border-dashed border-border">
                <p className="text-xs text-subtle">
                  No companies found matching "{companySearch}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCompanySearch('');
                    setSelectedCategory('All');
                  }}
                  className="text-xs text-brand cursor-pointer"
                >
                  Reset search &amp; filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredDirectoryCompanies.map(item => {
                  const isSelected = selectedId === item.id;
                  const isThisActiveRole = Boolean(
                    (activeCompanyGuidance && item.id === activeCompanyGuidance.id) ||
                    (companyName && findCompanyGuidance(companyName)?.id === item.id)
                  );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={item.name}
                      onClick={() => {
                        setSelectedId(item.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-brand/10 border-brand shadow-2xs ring-1 ring-brand/30'
                          : 'bg-card hover:bg-surface border-border hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-foreground">
                              {item.name}
                            </span>
                            {isThisActiveRole && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand/20 text-brand font-mono font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          {item.industry && (
                            <span className="text-[10px] text-subtle block mt-0.5 line-clamp-1">
                              {item.industry}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-brand text-background flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {item.values && item.values.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.values.slice(0, 2).map((val, vi) => (
                            <span
                              key={vi}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-surface text-subtle line-clamp-1"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Company Guidance Dossier */}
      <section className="relative overflow-hidden space-y-5 rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-surface/90 p-6 sm:p-7 shadow-elevated">
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="font-display font-bold text-foreground text-base sm:text-lg tracking-tight">
              {company.isRoleAnchored ? 'Role-anchored company guidance' : 'Site-verified company guidance'} · {company.name}
            </h4>
            {isSelectedActiveRole && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand/15 text-brand uppercase tracking-wider font-mono border border-brand/30 shadow-2xs">
                ACTIVE APPLICATION
              </span>
            )}
          </div>
          {company.industry && (
            <span className="text-xs text-muted-foreground font-mono">
              {company.industry}
            </span>
          )}
        </div>

        <p className="relative z-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">{company.guidance}</p>

        {/* Culture & Operational Pillars */}
        {company.values.length > 0 && (
          <div className="relative z-10 space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block font-mono">
              {company.isRoleAnchored ? 'IDENTIFIED CULTURE & OPERATIONAL PILLARS:' : 'OFFICIAL COMPANY VALUES:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {company.values.map((val, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-3 py-1 rounded-xl bg-surface/90 text-foreground border border-border/80 shadow-2xs font-mono"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Domain Context & Interview Strategy Cards */}
        {(company.domainContext || company.interviewStrategy) && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {company.domainContext && (
              <div className="p-4 rounded-2xl bg-surface/80 border border-border/80 space-y-1.5 text-xs shadow-2xs">
                <span className="font-semibold text-brand flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                  <Building2 className="w-3.5 h-3.5" /> Domain &amp; Industry Context
                </span>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {company.domainContext}
                </p>
              </div>
            )}

            {company.interviewStrategy && (
              <div className="p-4 rounded-2xl bg-surface/80 border border-border/80 space-y-1.5 text-xs shadow-2xs">
                <span className="font-semibold text-brand flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                  <Target className="w-3.5 h-3.5" /> Company Interview Strategy
                </span>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {company.interviewStrategy}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex flex-wrap gap-4 pt-1">
          {company.sources.map(source => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand hover:underline underline-offset-4 font-medium"
            >
              {source.label}
              <ExternalLink className="size-3" />
            </a>
          ))}
        </div>

        {company.checkedOn && !company.isRoleAnchored && (
          <p className="relative z-10 text-[11px] text-muted-foreground pt-1 font-mono">
            Official employer guidance verified on {company.checkedOn}.
          </p>
        )}
      </section>

      {/* Practice Questions Header & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-surface/60 border border-border">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand uppercase font-mono tracking-wider">
              ROLE PRACTICE
            </span>
            <span className="text-xs text-subtle font-medium">
              {practice.family} · {hasProfile ? 'Saved profile grounded' : 'No saved profile'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">
              Practice questions for <span className="text-brand">{targetRole || 'Target Role'}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsEditingRole(!isEditingRole)}
              className="text-[11px] text-subtle hover:text-foreground font-medium underline-offset-4 hover:underline cursor-pointer inline-flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-surface transition-colors"
            >
              <Pencil className="w-3 h-3 text-subtle" />
              <span>{isEditingRole ? 'Done' : 'Change role'}</span>
            </button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-auto min-h-9 whitespace-normal cursor-pointer shrink-0"
          disabled={!canGenerate || busy}
          onClick={generate}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          <LoadingProgress
            inline
            active={busy}
            label="Preparing questions"
            idleLabel="Personalize by role & saved profile"
            expectedSeconds={40}
            resultToken={generated}
          />
        </Button>
      </div>

      {/* Collapsible Role Editor */}
      {isEditingRole && (
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label htmlFor="target-role-input" className="text-xs text-subtle font-medium">
              Customize target role title for question synthesis:
            </label>
            <button
              type="button"
              onClick={() => setIsEditingRole(false)}
              className="text-xs text-subtle hover:text-foreground cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex gap-2">
            <input
              id="target-role-input"
              aria-label="Target role for company practice"
              value={targetRole}
              onChange={event => setTargetRole(event.target.value)}
              placeholder="e.g. Data Scientist, Operations Manager, AI Engineer, Sales Manager"
              className="flex-1 border border-border rounded-xl bg-surface px-3 py-1.5 text-xs sm:text-sm text-foreground outline-none focus:border-brand transition-all"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => setIsEditingRole(false)}
              className="text-xs cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Accessible reference input when editor is collapsed */}
      {!isEditingRole && (
        <input
          type="hidden"
          aria-label="Target role for company practice"
          value={targetRole}
          readOnly
        />
      )}

      {/* Single Candidate Grounding Banner (Eliminates 3x repetitive paragraph) */}
      {hasProfile && practice.evidence && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface/70 border border-border/80 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
            <UserCheck className="w-4 h-4 text-brand" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-brand uppercase tracking-wider">
                Profile Evidence Grounding
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-brand/15 text-brand font-semibold">
                Anchored to Saved Profile
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Personalized practice answers and key talking points will anchor directly to your documented background:{' '}
              <span className="text-foreground font-medium">{practice.evidence}</span>
            </p>
          </div>
        </div>
      )}

      {!canGenerate && (
        <p className="text-xs text-muted-foreground">
          Select a target role and save your Master Profile to prepare personalized questions.
        </p>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {/* Structured Question Cards with Distinct Competency Focus */}
      <div className="space-y-3">
        {(questions.length
          ? questions.map(q => ({
              q: q.question,
              strategy: q.suggested_answer,
              points: q.key_talking_points || [],
              competency: getQuestionCompetency(q.question, practice.family),
            }))
          : practice.questions.map(q => ({
              ...q,
              points: [] as string[],
              competency: getQuestionCompetency(q.q, practice.family),
            }))
        ).map((item, index) => (
          <div key={index} className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-surface/90 space-y-4 shadow-elevated after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand/25 after:to-transparent">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 shadow-2xs">
                    QUESTION {index + 1}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground font-mono">
                    Target Competency: <strong className="text-foreground font-semibold">{item.competency}</strong>
                  </span>
                </div>
                <h5 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug tracking-tight">
                  {index + 1}. {item.q}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => handleCopyQuestion(index, item.q, questions.length ? item.strategy : '')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-surface/90 hover:bg-surface border border-border/80 text-foreground transition-all cursor-pointer shrink-0 shadow-2xs"
                title="Copy question and model STAR framework"
              >
                {copiedQuestionIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed pl-4 border-l-2 border-brand bg-surface/70 p-3.5 rounded-r-2xl space-y-1.5">
              <span className="font-display font-bold text-foreground block text-xs">
                {questions.length ? 'Suggested practice answer:' : 'Preparation framework:'}
              </span>
              <p className="whitespace-pre-line text-muted-foreground">
                {questions.length
                  ? item.strategy
                  : 'Structure your response using the STAR method (Situation, Task, Action, Result). Focus on your direct ownership, process metrics, and cross-functional coordination without claiming unverified achievements.'}
              </p>
            </div>

            {item.points.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                  Key Talking Points:
                </span>
                <ul className="space-y-1.5">
                  {item.points.map((point, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
