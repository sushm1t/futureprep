import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { AllFiltersModal } from '@/jobstudio/components/AllFiltersModal';
import { EMPTY_EVALUATION } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('AllFiltersModal trigger in JobEvaluatorView', () => {
  const mockProps = {
    evaluation: {
      ...EMPTY_EVALUATION,
      job_title: '',
      company_name: '',
    },
    isEvaluationComplete: false,
    opportunities: [],
    selectedJobId: '',
    customJobText: '',
    setCustomJobText: vi.fn(),
    customUrl: '',
    setCustomUrl: vi.fn(),
    onEvaluate: vi.fn(),
    isLoading: false,
    onProceedToResume: vi.fn(),
    onSelectPreset: vi.fn(),
    masterProfileText: 'Staff Software Engineer with deep expertise in Go, Kubernetes, PostgreSQL, TypeScript.',
  };

  it('renders AllFiltersModal directly without crashing', () => {
    const filters = {
      sources: [],
      sourceType: 'all' as const,
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
      strictness: 'any' as const,
    };

    render(
      <AllFiltersModal
        isOpen={true}
        onClose={vi.fn()}
        filters={filters}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        totalCatalogueJobs={5000}
      />
    );

    expect(screen.getByRole('heading', { name: /all filters/i })).toBeDefined();
  });

  it('opens AllFiltersModal when clicking All Filters button in JobEvaluatorView, interacts with tabs, and closes cleanly', () => {
    render(<JobEvaluatorView {...mockProps} />);
    const allFiltersBtn = screen.getByRole('button', { name: /all filters/i });
    fireEvent.click(allFiltersBtn);
    expect(screen.getByRole('heading', { name: /all filters/i })).toBeDefined();

    // Click on Experience tab
    const experienceTab = screen.getByRole('button', { name: /^experience$/i });
    fireEvent.click(experienceTab);
    expect(screen.getByText(/years of experience/i)).toBeDefined();

    // Click on Skills tab
    const skillsTab = screen.getByRole('button', { name: /skills & tech/i });
    fireEvent.click(skillsTab);
    expect(screen.getByPlaceholderText(/add custom skill/i)).toBeDefined();

    // Close the modal
    const closeBtn = screen.getByLabelText(/close filters/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('heading', { name: /all filters/i })).toBeNull();
  });
});
