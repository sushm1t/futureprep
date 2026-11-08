import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  Layers,
  Wrench,
  DollarSign,
  Globe2,
  Shield,
  Zap,
} from 'lucide-react';
import {
  ALL_JOB_SOURCES,
  ALL_SPECIALIZATION_GROUPS,
  ALL_INDUSTRIES,
  ALL_VC_COLLECTIONS,
  ALL_EXPERIENCE_LEVELS,
  POSTED_OPTIONS,
  WORKPLACE_MODES,
  EMPLOYMENT_TYPES,
  POPULAR_LOCATIONS,
  POPULAR_SKILLS,
  JobSourceEntry,
} from '../data/jobFiltersData';

export interface FilterState {
  sources: string[];
  sourceType: 'all' | 'ats' | 'company' | 'aggregator' | 'social';
  specializations: string[];
  seniority: string;
  workplace: string;
  employmentType: string;
  location: string;
  postedWithin: string;
  industries: string[];
  collections: string[];
  skills: string[];
  minSalary?: number;
}

interface AllFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalCatalogueJobs?: number;
  candidateProfileContext?: {
    targetRole?: string;
    domain?: string;
    seniority?: string;
    location?: string;
  };
}

type TabKey =
  | 'specialization'
  | 'experience'
  | 'posted'
  | 'location'
  | 'workplace'
  | 'skills'
  | 'industry'
  | 'source'
  | 'salary';

export const AllFiltersModal: React.FC<AllFiltersModalProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  onResetFilters,
  totalCatalogueJobs = 7135839,
  candidateProfileContext,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [activeTab, setActiveTab] = useState<TabKey>('specialization');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [specSearch, setSpecSearch] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    engineering: true,
    data_ai: true,
    ai_specialization: true,
  });

  if (!isOpen) return null;

  // Toggle helpers
  const toggleSource = (sourceId: string) => {
    setDraftFilters((prev) => {
      const exists = prev.sources.includes(sourceId);
      const updated = exists ? prev.sources.filter((s) => s !== sourceId) : [...prev.sources, sourceId];
      return { ...prev, sources: updated };
    });
  };

  const selectAllAtsSources = () => {
    const atsIds = ALL_JOB_SOURCES.filter((s) => s.kind === 'ats').map((s) => s.id);
    setDraftFilters((prev) => ({ ...prev, sources: Array.from(new Set([...prev.sources, ...atsIds])) }));
  };

  const clearAllSources = () => {
    setDraftFilters((prev) => ({ ...prev, sources: [] }));
  };

  const toggleSpecialization = (specId: string) => {
    setDraftFilters((prev) => {
      const exists = prev.specializations.includes(specId);
      const updated = exists ? prev.specializations.filter((s) => s !== specId) : [...prev.specializations, specId];
      return { ...prev, specializations: updated };
    });
  };

  const toggleIndustry = (indId: string) => {
    setDraftFilters((prev) => {
      const exists = prev.industries.includes(indId);
      const updated = exists ? prev.industries.filter((i) => i !== indId) : [...prev.industries, indId];
      return { ...prev, industries: updated };
    });
  };

  const toggleCollection = (colId: string) => {
    setDraftFilters((prev) => {
      const exists = prev.collections.includes(colId);
      const updated = exists ? prev.collections.filter((c) => c !== colId) : [...prev.collections, colId];
      return { ...prev, collections: updated };
    });
  };

  const toggleSkill = (skill: string) => {
    setDraftFilters((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Profile prefill
  const handleApplyProfile = () => {
    if (!candidateProfileContext) return;
    setDraftFilters((prev) => ({
      ...prev,
      seniority: candidateProfileContext.seniority || prev.seniority,
      location: candidateProfileContext.location || prev.location,
    }));
  };

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (draftFilters.sources.length > 0) count += draftFilters.sources.length;
    if (draftFilters.sourceType !== 'all') count += 1;
    if (draftFilters.specializations.length > 0) count += draftFilters.specializations.length;
    if (draftFilters.seniority && draftFilters.seniority !== 'All' && draftFilters.seniority !== 'all') count += 1;
    if (draftFilters.workplace && draftFilters.workplace !== 'All' && draftFilters.workplace !== 'all') count += 1;
    if (draftFilters.employmentType && draftFilters.employmentType !== 'all') count += 1;
    if (draftFilters.location && draftFilters.location !== 'All' && draftFilters.location !== 'all') count += 1;
    if (draftFilters.postedWithin && draftFilters.postedWithin !== 'all') count += 1;
    if (draftFilters.industries.length > 0) count += draftFilters.industries.length;
    if (draftFilters.collections.length > 0) count += draftFilters.collections.length;
    if (draftFilters.skills.length > 0) count += draftFilters.skills.length;
    if (draftFilters.minSalary) count += 1;
    return count;
  }, [draftFilters]);

  // Sources filtered by type & search
  const visibleSources = useMemo(() => {
    return ALL_JOB_SOURCES.filter((s) => {
      if (draftFilters.sourceType !== 'all' && s.kind !== draftFilters.sourceType) return false;
      if (sourceSearch.trim()) {
        const q = sourceSearch.toLowerCase().trim();
        return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [draftFilters.sourceType, sourceSearch]);

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: FilterState = {
      sources: [],
      sourceType: 'all',
      specializations: [],
      seniority: 'All',
      workplace: 'All',
      employmentType: 'all',
      location: 'All',
      postedWithin: 'all',
      industries: [],
      collections: [],
      skills: [],
    };
    setDraftFilters(empty);
    onResetFilters();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[820px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden text-foreground">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-semibold tracking-wide">All Filters</h2>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-primary/20 text-brand rounded-full border border-primary/30">
                  {activeCount}
                </span>
              )}
            </div>

            {/* Quick Filter Search */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-3.5 h-3.5 text-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search filters..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-transparent focus:border-brand rounded-lg text-xs outline-none transition-all placeholder:text-subtle"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {candidateProfileContext?.targetRole && (
              <button
                type="button"
                onClick={handleApplyProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply my profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-subtle hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Tabs + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-56 shrink-0 border-r border-border bg-surface/30 overflow-y-auto py-3 px-2 text-xs">
            {/* SAVED */}
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-subtle">Saved</div>
            <button
              type="button"
              onClick={() => setActiveTab('specialization')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'specialization' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>My Profile Focus</span>
              </span>
            </button>

            {/* ROLE */}
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">Role</div>
            <button
              type="button"
              onClick={() => setActiveTab('specialization')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'specialization' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Specialization</span>
              </span>
              {draftFilters.specializations.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {draftFilters.specializations.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'experience' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Experience</span>
              </span>
              {draftFilters.seniority && draftFilters.seniority !== 'All' && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('posted')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'posted' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Posted Date</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'location' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </span>
              {draftFilters.location && draftFilters.location !== 'All' && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workplace')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'workplace' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Workplace & Type</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'skills' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Skills & Tech</span>
              </span>
              {draftFilters.skills.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {draftFilters.skills.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('industry')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'industry' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Industry & VC</span>
              </span>
              {(draftFilters.industries.length > 0 || draftFilters.collections.length > 0) && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {draftFilters.industries.length + draftFilters.collections.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('source')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'source' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Source & ATS</span>
              </span>
              {draftFilters.sources.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand text-[10px] font-bold text-white">
                  {draftFilters.sources.length}
                </span>
              )}
            </button>

            {/* PAY & BENEFITS */}
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">Pay & Benefits</div>
            <button
              type="button"
              onClick={() => setActiveTab('salary')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'salary' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Salary Range</span>
              </span>
              {draftFilters.minSalary ? (
                <span className="w-2 h-2 rounded-full bg-brand" />
              ) : null}
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-card">
            {/* TAB: SPECIALIZATION */}
            {activeTab === 'specialization' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Career Specializations</h3>
                  <p className="text-xs text-subtle">Select target specializations to discover focused requisitions across companies.</p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={specSearch}
                    onChange={(e) => setSpecSearch(e.target.value)}
                    placeholder="Search specializations (e.g. Backend, Full-Stack, AI, QA)..."
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-transparent focus:border-brand rounded-xl text-xs outline-none transition-all placeholder:text-subtle"
                  />
                </div>

                <div className="space-y-4">
                  {ALL_SPECIALIZATION_GROUPS.map((group) => {
                    const isExpanded = expandedGroups[group.id] !== false;
                    const items = group.items.filter((item) =>
                      specSearch.trim() ? item.label.toLowerCase().includes(specSearch.toLowerCase().trim()) : true
                    );
                    if (items.length === 0) return null;

                    return (
                      <div key={group.id} className="border border-border/70 rounded-xl p-3 bg-surface/20">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-foreground hover:text-brand transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-brand" /> : <ChevronRight className="w-3.5 h-3.5 text-subtle" />}
                            <span>{group.label}</span>
                          </span>
                          <span className="text-[11px] text-subtle font-normal">{items.length} options</span>
                        </button>

                        {isExpanded && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
                            {items.map((item) => {
                              const isSelected = draftFilters.specializations.includes(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleSpecialization(item.id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                                    isSelected
                                      ? 'bg-primary/15 text-brand font-semibold border-primary/40 shadow-sm'
                                      : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground border-transparent'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-brand" />}
                                  <span>{item.label}</span>
                                  {item.countApprox && (
                                    <span className="text-[10px] text-subtle/80 font-normal">
                                      {item.countApprox}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Seniority & Experience</h3>
                  <p className="text-xs text-subtle">Filter positions by career level, from early career internships to staff & leadership.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDraftFilters((prev) => ({ ...prev, seniority: 'All' }))}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      draftFilters.seniority === 'All' || !draftFilters.seniority
                        ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                        : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                    }`}
                  >
                    <span>All Experience Levels</span>
                    {(draftFilters.seniority === 'All' || !draftFilters.seniority) && <Check className="w-4 h-4 text-brand" />}
                  </button>

                  {ALL_EXPERIENCE_LEVELS.map((lvl) => {
                    const isSelected = draftFilters.seniority === lvl.level || draftFilters.seniority === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, seniority: lvl.level }))}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-foreground">{lvl.label}</div>
                          <div className="text-[11px] text-subtle mt-0.5">{lvl.countApprox} roles available</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: POSTED DATE */}
            {activeTab === 'posted' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Posted Date</h3>
                  <p className="text-xs text-subtle">Discover freshest requisitions indexed directly from company ATS platforms.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POSTED_OPTIONS.map((opt) => {
                    const isSelected = (draftFilters.postedWithin || 'all') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, postedWithin: opt.id }))}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <span className="font-medium text-foreground">{opt.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: LOCATION */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Target Geographic Location</h3>
                  <p className="text-xs text-subtle">Verified openings mapped across global tech hubs and regional talent markets.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = (draftFilters.location || 'All') === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, location: loc.id }))}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-foreground">{loc.label}</div>
                          {loc.countApprox && <div className="text-[11px] text-subtle mt-0.5">{loc.countApprox} live positions</div>}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: WORKPLACE & EMPLOYMENT */}
            {activeTab === 'workplace' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Workplace Mode</h3>
                  <p className="text-xs text-subtle">Remote, hybrid, and in-person workplace arrangement filters.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WORKPLACE_MODES.map((wm) => {
                    const isSelected = (draftFilters.workplace || 'All').toLowerCase() === wm.id.toLowerCase();
                    return (
                      <button
                        key={wm.id}
                        type="button"
                        onClick={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            workplace: wm.id === 'all' ? 'All' : wm.label,
                          }))
                        }
                        className={`p-3 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        {wm.label}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-1">Employment Type</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    {EMPLOYMENT_TYPES.map((et) => {
                      const isSelected = (draftFilters.employmentType || 'all') === et.id;
                      return (
                        <button
                          key={et.id}
                          type="button"
                          onClick={() => setDraftFilters((prev) => ({ ...prev, employmentType: et.id }))}
                          className={`p-3 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                              : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                          }`}
                        >
                          {et.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Skills & Technologies</h3>
                  <p className="text-xs text-subtle">Select core technical competencies to prioritize roles requesting matching skills.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = draftFilters.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-primary/15 text-brand font-semibold border-primary/40 shadow-sm'
                            : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground border-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-brand" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: INDUSTRY & VC COLLECTIONS */}
            {activeTab === 'industry' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Industry Domains</h3>
                  <p className="text-xs text-subtle">Filter by market discipline, software domain, or vertical.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ALL_INDUSTRIES.map((ind) => {
                    const isSelected = draftFilters.industries.includes(ind.id);
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => toggleIndustry(ind.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-primary/15 text-brand font-semibold border-primary/40 shadow-sm'
                            : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground border-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-brand" />}
                        <span>{ind.label}</span>
                        {ind.countApprox && <span className="text-[10px] text-subtle/80">{ind.countApprox}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-1">VC Portfolios & Enterprise Collections</h3>
                  <p className="text-xs text-subtle">Browse companies funded by tier-1 venture capital firms and Fortune 500 enterprises.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {ALL_VC_COLLECTIONS.map((col) => {
                      const isSelected = draftFilters.collections.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => toggleCollection(col.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                              : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {col.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-bold text-brand border border-border">
                                {col.badge}
                              </span>
                            )}
                            <span className="font-medium text-foreground">{col.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {col.countApprox && <span className="text-[11px] text-subtle">{col.countApprox}</span>}
                            {isSelected && <Check className="w-4 h-4 text-brand" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SOURCE & ATS */}
            {activeTab === 'source' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">ATS & Direct Hiring Source Platforms</h3>
                  <p className="text-xs text-subtle">
                    Search across 55+ official corporate Applicant Tracking Systems (Workday, Oracle HCM, SAP, SmartRecruiters, Greenhouse, etc.) indexing over 4.89M+ verified requisitions.
                  </p>
                </div>

                {/* Source Type Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 p-1 bg-surface rounded-xl">
                    {(
                      [
                        { id: 'all', label: 'All Sources' },
                        { id: 'ats', label: 'Enterprise ATS' },
                        { id: 'company', label: 'Company Boards' },
                        { id: 'aggregator', label: 'Public & Regional' },
                        { id: 'social', label: 'Social' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, sourceType: st.id }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          draftFilters.sourceType === st.id
                            ? 'bg-card text-brand font-semibold shadow-sm'
                            : 'text-subtle hover:text-foreground'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllAtsSources}
                      className="px-2.5 py-1 text-[11px] font-medium text-brand hover:underline cursor-pointer"
                    >
                      Select all ATS
                    </button>
                    {draftFilters.sources.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllSources}
                        className="px-2.5 py-1 text-[11px] font-medium text-subtle hover:text-foreground cursor-pointer"
                      >
                        Clear sources ({draftFilters.sources.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Source Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    placeholder="Search 55+ hiring sources (e.g. Workday, Oracle, SAP, Greenhouse)..."
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-transparent focus:border-brand rounded-xl text-xs outline-none transition-all placeholder:text-subtle"
                  />
                </div>

                {/* Grid of Sources */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {visibleSources.map((source) => {
                    const isSelected = draftFilters.sources.includes(source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => toggleSource(source.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                              isSelected ? 'bg-brand border-brand text-white' : 'border-subtle/50 bg-card'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate font-medium text-foreground">{source.name}</span>
                        </div>
                        <span className="text-[10px] text-subtle shrink-0 font-normal">
                          {source.openJobsApprox}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: SALARY */}
            {activeTab === 'salary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Target Minimum Compensation</h3>
                  <p className="text-xs text-subtle">Filter roles by base salary or hourly equivalent rate.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Any salary', value: undefined },
                    { label: '$60,000+ / yr', value: 60000 },
                    { label: '$90,000+ / yr', value: 90000 },
                    { label: '$120,000+ / yr', value: 120000 },
                    { label: '$150,000+ / yr', value: 150000 },
                    { label: '$200,000+ / yr', value: 200000 },
                  ].map((s, idx) => {
                    const isSelected = draftFilters.minSalary === s.value;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, minSalary: s.value }))}
                        className={`p-3 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-surface/50 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-subtle hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer shadow-elevated"
          >
            <span>
              Show {activeCount > 0 ? 'filtered' : totalCatalogueJobs.toLocaleString()} matching roles
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
