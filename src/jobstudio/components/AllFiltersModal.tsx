import React, { useState, useMemo, useEffect } from 'react';
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
  HeartHandshake,
  Languages,
  Plane,
  UserCheck,
  Sliders,
} from 'lucide-react';
import {
  ALL_SPECIALIZATION_GROUPS,
  ALL_INDUSTRIES,
  ALL_COMPANY_TYPES,
  ALL_VC_COLLECTIONS,
  ALL_EXPERIENCE_LEVELS,
  POSTED_OPTIONS,
  WORKPLACE_MODES,
  EMPLOYMENT_TYPES,
  POPULAR_LOCATIONS,
  POPULAR_CITIES_BY_COUNTRY,
  getCountryForLocation,
  getLocationDisplayLabel,
  POPULAR_SKILLS,
  ALL_BENEFITS_PERKS,
  ALL_LANGUAGES,
  RELOCATION_OPTIONS,
} from '../data/jobFiltersData';

export interface FilterState {
  sources: string[];
  sourceType: 'all' | 'ats' | 'company' | 'aggregator' | 'social';
  specializations: string[];
  seniority: string;
  minExperienceYears?: number;
  peopleManagerOnly?: boolean;
  includeNoLevelStated?: boolean;
  includeNoExperienceStated?: boolean;
  applyLimitOnlyNoLevel?: boolean;
  workplace: string;
  employmentType: string;
  location: string;
  postedWithin: string;
  industries: string[];
  companyTypes: string[];
  collections: string[];
  skills: string[];
  minSalary?: number;
  benefits: string[];
  languages: string[];
  relocation: string[];
  strictness?: 'any' | 'all';
}

interface AllFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalCatalogueJobs?: number;
  initialTab?: TabKey;
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
  | 'salary'
  | 'benefits'
  | 'language'
  | 'relocation';

export const AllFiltersModal: React.FC<AllFiltersModalProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  onResetFilters,
  totalCatalogueJobs,
  initialTab,
  candidateProfileContext,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    ...initialFilters,
    industries: initialFilters.industries || [],
    companyTypes: initialFilters.companyTypes || [],
    benefits: initialFilters.benefits || [],
    languages: initialFilters.languages || [],
    relocation: initialFilters.relocation || [],
    strictness: initialFilters.strictness || 'any',
    includeNoLevelStated: initialFilters.includeNoLevelStated !== false,
    includeNoExperienceStated: initialFilters.includeNoExperienceStated !== false,
  });
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab || 'specialization');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [specSearch, setSpecSearch] = useState<string>('');
  const [industrySearch, setIndustrySearch] = useState<string>('');
  const [benefitSearch, setBenefitSearch] = useState<string>('');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    engineering: true,
    data_ai: true,
    ai_specialization: true,
    product_management: true,
  });

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return ALL_INDUSTRIES;
    const q = industrySearch.toLowerCase().trim();
    return ALL_INDUSTRIES.filter(
      (ind) => ind.label.toLowerCase().includes(q) || ind.id.toLowerCase().includes(q)
    );
  }, [industrySearch]);

  // Keep draftFilters synchronized whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setDraftFilters({
        ...initialFilters,
        industries: initialFilters.industries || [],
        companyTypes: initialFilters.companyTypes || [],
        benefits: initialFilters.benefits || [],
        languages: initialFilters.languages || [],
        relocation: initialFilters.relocation || [],
        strictness: initialFilters.strictness || 'any',
        includeNoLevelStated: initialFilters.includeNoLevelStated !== false,
        includeNoExperienceStated: initialFilters.includeNoExperienceStated !== false,
      });
    }
  }, [isOpen, initialFilters, initialTab]);

  // Toggle helpers
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

  const toggleCompanyType = (ctId: string) => {
    setDraftFilters((prev) => {
      const current = prev.companyTypes || [];
      const exists = current.includes(ctId);
      const updated = exists ? current.filter((c) => c !== ctId) : [...current, ctId];
      return { ...prev, companyTypes: updated };
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

  const toggleBenefit = (benefitId: string) => {
    setDraftFilters((prev) => {
      const current = prev.benefits || [];
      const exists = current.includes(benefitId);
      const updated = exists ? current.filter((b) => b !== benefitId) : [...current, benefitId];
      return { ...prev, benefits: updated };
    });
  };

  const toggleLanguage = (langId: string) => {
    setDraftFilters((prev) => {
      const current = prev.languages || [];
      const exists = current.includes(langId);
      const updated = exists ? current.filter((l) => l !== langId) : [...current, langId];
      return { ...prev, languages: updated };
    });
  };

  const toggleRelocation = (relocId: string) => {
    setDraftFilters((prev) => {
      const current = prev.relocation || [];
      const exists = current.includes(relocId);
      const updated = exists ? current.filter((r) => r !== relocId) : [...current, relocId];
      return { ...prev, relocation: updated };
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!draftFilters.skills.includes(trimmed)) {
      setDraftFilters((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setCustomSkillInput('');
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
    if (draftFilters.specializations.length > 0) count += draftFilters.specializations.length;
    if (draftFilters.seniority && draftFilters.seniority !== 'All' && draftFilters.seniority !== 'all') count += 1;
    if (draftFilters.minExperienceYears !== undefined && draftFilters.minExperienceYears > 0) count += 1;
    if (draftFilters.peopleManagerOnly) count += 1;
    if (draftFilters.workplace && draftFilters.workplace !== 'All' && draftFilters.workplace !== 'all') count += 1;
    if (draftFilters.employmentType && draftFilters.employmentType !== 'all') count += 1;
    if (draftFilters.location && draftFilters.location !== 'All' && draftFilters.location !== 'all') count += 1;
    if (draftFilters.postedWithin && draftFilters.postedWithin !== 'all') count += 1;
    if (draftFilters.industries.length > 0) count += draftFilters.industries.length;
    if ((draftFilters.companyTypes || []).length > 0) count += draftFilters.companyTypes.length;
    if (draftFilters.collections.length > 0) count += draftFilters.collections.length;
    if (draftFilters.skills.length > 0) count += draftFilters.skills.length;
    if (draftFilters.minSalary) count += 1;
    if ((draftFilters.benefits || []).length > 0) count += draftFilters.benefits.length;
    if ((draftFilters.languages || []).length > 0) count += draftFilters.languages.length;
    if ((draftFilters.relocation || []).length > 0) count += draftFilters.relocation.length;
    return count;
  }, [draftFilters]);

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
    setDraftFilters(empty);
    onResetFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="mobile-dialog-panel relative w-full max-w-5xl h-[92vh] md:h-[88vh] max-h-[840px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden text-foreground">
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
                placeholder="Search filters (e.g. Benefits, Language, Seniority)..."
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface/30 overflow-x-auto md:overflow-y-auto py-2 md:py-3 px-2 text-xs flex md:flex-col gap-1 items-center md:items-stretch whitespace-nowrap">
            {/* SAVED */}
            <div className="hidden md:block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-subtle">Saved</div>
            <button
              type="button"
              onClick={() => setActiveTab('specialization')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'specialization' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>My Profile Focus</span>
              </span>
            </button>

            {/* ROLE */}
            <div className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">Role</div>
            <button
              type="button"
              onClick={() => setActiveTab('specialization')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
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
              onClick={() => setActiveTab('industry')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'industry' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Industry</span>
              </span>
              {draftFilters.industries.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {draftFilters.industries.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'experience' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Experience</span>
              </span>
              {(draftFilters.seniority && draftFilters.seniority !== 'All' && draftFilters.seniority !== 'all') ||
              (draftFilters.minExperienceYears !== undefined && draftFilters.minExperienceYears > 0) ||
              draftFilters.peopleManagerOnly ? (
                <span className="w-2 h-2 rounded-full bg-brand" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('posted')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'posted' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Posted Date</span>
              </span>
              {draftFilters.postedWithin && draftFilters.postedWithin !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'location' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </span>
              {draftFilters.location && draftFilters.location !== 'All' && draftFilters.location !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workplace')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'workplace' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Workplace & Type</span>
              </span>
              {((draftFilters.workplace && draftFilters.workplace !== 'All' && draftFilters.workplace !== 'all') ||
                (draftFilters.employmentType && draftFilters.employmentType !== 'all')) && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>

            {/* COMPENSATION & TECH */}
            <div className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">More Filters</div>
            <button
              type="button"
              onClick={() => setActiveTab('salary')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'salary' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Salary Range</span>
              </span>
              {draftFilters.minSalary ? <span className="w-2 h-2 rounded-full bg-brand" /> : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
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
              onClick={() => setActiveTab('relocation')}
              className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'relocation' ? 'bg-primary/15 text-brand font-semibold' : 'text-subtle hover:text-foreground hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plane className="w-3.5 h-3.5" />
                <span>Relocation & Auth</span>
              </span>
              {(draftFilters.relocation || []).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {(draftFilters.relocation || []).length}
                </span>
              )}
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
                    placeholder="Search specializations (e.g. Product Manager, Backend, AI, Data Science)..."
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

                {/* Seniority Badges */}
                <div>
                  <div className="text-xs font-semibold text-foreground mb-2.5">Seniority Level</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftFilters((prev) => ({ ...prev, seniority: 'All' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                        draftFilters.seniority === 'All' || !draftFilters.seniority
                          ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                          : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                      }`}
                    >
                      <span>All Levels</span>
                    </button>
                    {ALL_EXPERIENCE_LEVELS.map((lvl) => {
                      const isSelected = draftFilters.seniority === lvl.level || draftFilters.seniority === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setDraftFilters((prev) => ({ ...prev, seniority: isSelected ? 'All' : lvl.level }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                              : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-brand" />}
                          <span>{lvl.label.split(' (')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role Type */}
                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-semibold text-foreground mb-2">Role Type</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftFilters((prev) => ({ ...prev, peopleManagerOnly: !prev.peopleManagerOnly }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                        draftFilters.peopleManagerOnly
                          ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                          : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                      }`}
                    >
                      {draftFilters.peopleManagerOnly && <Check className="w-3 h-3 text-brand" />}
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>People Manager</span>
                    </button>
                  </div>
                </div>

                {/* Years of Experience Slider */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Years of Experience</span>
                    <span className="text-brand font-bold">
                      {draftFilters.minExperienceYears && draftFilters.minExperienceYears > 0
                        ? `${draftFilters.minExperienceYears}+ years`
                        : 'Any'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={draftFilters.minExperienceYears || 0}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        minExperienceYears: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-brand cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-subtle">
                    <span>Any</span>
                    <span>3 yrs</span>
                    <span>5 yrs</span>
                    <span>8 yrs</span>
                    <span>10 yrs</span>
                    <span>15+ yrs</span>
                  </div>
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
            {activeTab === 'location' && (() => {
              const selectedCountry = getCountryForLocation(draftFilters.location);
              const availableCities = selectedCountry ? POPULAR_CITIES_BY_COUNTRY[selectedCountry] : null;

              return (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Target Geographic Location</h3>
                    <p className="text-xs text-subtle">Verified openings mapped across global tech hubs and regional talent markets.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {POPULAR_LOCATIONS.map((loc) => {
                      const isCountryActive =
                        (draftFilters.location || 'All') === loc.id ||
                        selectedCountry === loc.id;

                      // Check if a specific city under this country is active
                      const activeCity =
                        selectedCountry === loc.id && draftFilters.location !== loc.id
                          ? POPULAR_CITIES_BY_COUNTRY[loc.id]?.find((c) => c.id === draftFilters.location)
                          : null;

                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            if (loc.id === 'all' || loc.id === 'remote') {
                              setDraftFilters((prev) => ({ ...prev, location: loc.id }));
                            } else {
                              // If already in this country with a city, or clicking new country, select the country
                              setDraftFilters((prev) => ({ ...prev, location: loc.id }));
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isCountryActive
                              ? 'bg-primary/15 border-primary/40 text-brand font-semibold shadow-xs'
                              : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                          }`}
                        >
                          <div className="font-medium text-foreground flex items-center gap-1.5 flex-wrap">
                            <span>{loc.label}</span>
                            {activeCity && (
                              <span className="text-[11px] font-normal text-brand bg-primary/20 px-2 py-0.5 rounded-md">
                                {activeCity.shortLabel || activeCity.label}
                              </span>
                            )}
                          </div>
                          {isCountryActive && <Check className="w-4 h-4 text-brand shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-City Selector when a country with cities (like India) is chosen */}
                  {selectedCountry && availableCities && availableCities.length > 0 && (
                    <div className="mt-5 p-4 rounded-2xl bg-surface/90 border border-primary/30 space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span>{selectedCountry === 'India' ? '🇮🇳' : selectedCountry === 'United States' ? '🇺🇸' : selectedCountry === 'UAE' ? '🇦🇪' : '🇬🇧'}</span>
                            <span>Cities in {selectedCountry}</span>
                          </h4>
                          <p className="text-[11px] text-subtle mt-0.5">
                            Select a specific metropolitan tech hub or search across entire {selectedCountry}.
                          </p>
                        </div>
                        {draftFilters.location !== selectedCountry && (
                          <button
                            type="button"
                            onClick={() => setDraftFilters((prev) => ({ ...prev, location: selectedCountry }))}
                            className="text-[11px] text-brand hover:underline font-medium cursor-pointer"
                          >
                            Reset to Entire {selectedCountry}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {availableCities.map((city) => {
                          const isCityActive =
                            city.id === selectedCountry
                              ? draftFilters.location === selectedCountry
                              : draftFilters.location === city.id;

                          return (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => setDraftFilters((prev) => ({ ...prev, location: city.id }))}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                                isCityActive
                                  ? 'bg-primary/20 border-primary text-brand font-semibold shadow-xs'
                                  : 'bg-surface-2 hover:bg-surface border-border/40 text-foreground hover:border-border'
                              }`}
                            >
                              <span className="truncate">{city.label}</span>
                              {isCityActive && <Check className="w-3.5 h-3.5 text-brand shrink-0 ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
                  <p className="text-xs text-subtle">Select core technical competencies or enter custom frameworks to prioritize matching roles.</p>
                </div>

                <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      placeholder="Add custom skill or technology (e.g. Kotlin, LangChain, Kafka)..."
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-transparent focus:border-brand rounded-xl text-xs outline-none transition-all placeholder:text-subtle"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </form>

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
                  {draftFilters.skills
                    .filter((s) => !POPULAR_SKILLS.includes(s))
                    .map((customSkill) => (
                      <button
                        key={customSkill}
                        type="button"
                        onClick={() => toggleSkill(customSkill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border bg-primary/15 text-brand font-semibold border-primary/40 shadow-sm"
                      >
                        <Check className="w-3 h-3 text-brand" />
                        <span>{customSkill}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* TAB: INDUSTRY & VC COLLECTIONS */}
            {activeTab === 'industry' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Industry Verticals</h3>
                    <p className="text-xs text-subtle">
                      Filter roles by market vertical or sector (e.g. FinTech, Crypto, Gaming, AI, Healthcare).
                    </p>
                  </div>
                  {draftFilters.industries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDraftFilters((prev) => ({ ...prev, industries: [] }))}
                      className="text-xs text-brand hover:underline cursor-pointer self-start sm:self-auto font-medium"
                    >
                      Clear industries ({draftFilters.industries.length})
                    </button>
                  )}
                </div>

                {/* Search input for industries */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    type="text"
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    placeholder="Search industries (e.g. FinTech, Crypto, Gaming, AI, Healthcare)..."
                    className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-subtle focus:outline-none focus:border-primary/50"
                  />
                  {industrySearch && (
                    <button
                      type="button"
                      onClick={() => setIndustrySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-foreground cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {filteredIndustries.map((ind) => {
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
                      </button>
                    );
                  })}
                  {filteredIndustries.length === 0 && (
                    <div className="py-4 text-xs text-subtle">
                      No industries match "{industrySearch}".
                    </div>
                  )}
                </div>

                {/* Company Type */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-1">Company Type</h3>
                  <p className="text-xs text-subtle mb-3">Product companies, high-growth startups, agencies, or government contractors.</p>

                  <div className="flex flex-wrap gap-2">
                    {ALL_COMPANY_TYPES.map((ct) => {
                      const isSelected = (draftFilters.companyTypes || []).includes(ct.id);
                      return (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => toggleCompanyType(ct.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-primary/15 text-brand font-semibold border-primary/40 shadow-sm'
                              : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground border-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-brand" />}
                          <span>{ct.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Collections */}
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
                          {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
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
                    { label: '$40,000+ / yr', value: 40000 },
                    { label: '$60,000+ / yr', value: 60000 },
                    { label: '$80,000+ / yr', value: 80000 },
                    { label: '$100,000+ / yr', value: 100000 },
                    { label: '$120,000+ / yr', value: 120000 },
                    { label: '$150,000+ / yr', value: 150000 },
                    { label: '$200,000+ / yr', value: 200000 },
                    { label: '$250,000+ / yr', value: 250000 },
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

            {/* TAB: BENEFITS & PERKS */}
            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Benefits, Perks & Total Rewards</h3>
                  <p className="text-xs text-subtle">Prioritize positions offering health coverage, equity grants, remote allowances, and generous time off.</p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={benefitSearch}
                    onChange={(e) => setBenefitSearch(e.target.value)}
                    placeholder="Search benefits (e.g. 401k, Equity, Parental Leave, WFH)..."
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-transparent focus:border-brand rounded-xl text-xs outline-none transition-all placeholder:text-subtle"
                  />
                </div>

                <div className="space-y-5">
                  {['Health & Wellness', 'Financial & Equity', 'Work-Life & Family', 'Remote & Office', 'Growth & Learning'].map(
                    (category) => {
                      const items = ALL_BENEFITS_PERKS.filter(
                        (b) =>
                          b.category === category &&
                          (benefitSearch.trim() ? b.label.toLowerCase().includes(benefitSearch.toLowerCase().trim()) : true)
                      );
                      if (items.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-semibold text-subtle uppercase tracking-wider">{category}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map((benefit) => {
                              const isSelected = (draftFilters.benefits || []).includes(benefit.id);
                              return (
                                <button
                                  key={benefit.id}
                                  type="button"
                                  onClick={() => toggleBenefit(benefit.id)}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                                      : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                                  }`}
                                >
                                  <span className="font-medium text-foreground">{benefit.label}</span>
                                  {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* TAB: LANGUAGE */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Language Requirements</h3>
                  <p className="text-xs text-subtle">Filter positions by required working or native languages.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_LANGUAGES.map((lang) => {
                    const isSelected = (draftFilters.languages || []).includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => toggleLanguage(lang.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <div>
                            <div className="font-medium text-foreground">{lang.label}</div>
                            <div className="text-[10px] text-subtle">{lang.nativeLabel}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: RELOCATION & WORK AUTH */}
            {activeTab === 'relocation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Relocation & Work Authorization</h3>
                  <p className="text-xs text-subtle">Narrow positions by visa sponsorship, relocation allowances, and global hiring readiness.</p>
                </div>

                <div className="space-y-3">
                  {RELOCATION_OPTIONS.map((opt) => {
                    const isSelected = (draftFilters.relocation || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleRelocation(opt.id)}
                        className={`w-full flex items-start justify-between p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-brand font-semibold'
                            : 'bg-surface hover:bg-surface-2 border-transparent text-subtle hover:text-foreground'
                        }`}
                      >
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{opt.label}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-bold text-brand border border-border">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-subtle font-normal">{opt.description}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Strictness Mode + Clear All + Show Matching Roles */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-border bg-surface/50 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-subtle hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>

            {/* Strictness Mode Switch */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border text-[11px]">
              <span className="text-subtle px-1.5">Filter Strictness:</span>
              <button
                type="button"
                onClick={() => setDraftFilters((prev) => ({ ...prev, strictness: 'any' }))}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  draftFilters.strictness !== 'all' ? 'bg-primary/20 text-brand font-semibold' : 'text-subtle hover:text-foreground'
                }`}
              >
                Flexible (Any)
              </button>
              <button
                type="button"
                onClick={() => setDraftFilters((prev) => ({ ...prev, strictness: 'all' }))}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  draftFilters.strictness === 'all' ? 'bg-primary/20 text-brand font-semibold' : 'text-subtle hover:text-foreground'
                }`}
              >
                Mandatory (All)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer shadow-elevated"
          >
            <span>
              {activeCount > 0 ? 'Show filtered matching roles' : 'Show matching roles'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
