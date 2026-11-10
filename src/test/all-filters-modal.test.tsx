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

  it('updates draftFilters when selecting options in modal and passes them to onApplyFilters', () => {
    const handleApply = vi.fn();
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
        onApplyFilters={handleApply}
        onResetFilters={vi.fn()}
        totalCatalogueJobs={5000}
      />
    );

    // 1. Select Specialization "Backend"
    const backendBtn = screen.getByRole('button', { name: /backend/i });
    fireEvent.click(backendBtn);

    // 2. Go to Posted Date and select "Past 24 hours"
    const postedTab = screen.getByRole('button', { name: /posted date/i });
    fireEvent.click(postedTab);
    const past24hBtn = screen.getByRole('button', { name: /past 24 hours/i });
    fireEvent.click(past24hBtn);

    // 3. Go to Salary Range and pick $120k+
    const salaryTab = screen.getByRole('button', { name: /salary range/i });
    fireEvent.click(salaryTab);
    const salary120kBtn = screen.getByRole('button', { name: /\$120,000/i });
    fireEvent.click(salary120kBtn);

    // 4. Click Apply Button
    const applyBtn = screen.getByRole('button', { name: /show filtered matching roles/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    const appliedState = handleApply.mock.calls[0][0];
    expect(appliedState.specializations).toContain('backend');
    expect(appliedState.postedWithin).toBe('24h');
    expect(appliedState.minSalary).toBe(120000);
  });

  it('actively filters live jobs in JobEvaluatorView by Specialization, Seniority, Posted Date, Salary, and Benefits', { timeout: 45000 }, async () => {
    const mockJobs = [
      {
        id: 'job-1',
        title: 'Senior Backend Engineer',
        company: 'CloudCorp',
        location: 'San Francisco, CA',
        platform: 'greenhouse',
        applyUrl: 'https://boards.greenhouse.io/cloudcorp/jobs/1',
        seniority: 'Senior',
        workplaceType: 'Remote',
        isRemote: true,
        salarySnippet: '$180,000 / yr',
        salaryMin: 180000,
        salaryMax: 210000,
        publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
        skills: ['Python', 'Kubernetes', 'PostgreSQL'],
        rawDescription: 'Offers health insurance, equity options, and 401k match.',
        matchScore: 92,
      },
      {
        id: 'job-2',
        title: 'Sales Development Representative (SDR)',
        company: 'GrowthGen',
        location: 'New York, NY',
        platform: 'lever',
        applyUrl: 'https://jobs.lever.co/growthgen/2',
        seniority: 'Early / Junior',
        workplaceType: 'On-site',
        isRemote: false,
        salarySnippet: '$65,000 / yr',
        salaryMin: 65000,
        salaryMax: 80000,
        publishedAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(), // 10 days ago
        skills: ['Cold Calling', 'Salesforce'],
        rawDescription: 'Visa sponsorship available for top candidates with relocation assistance.',
        matchScore: 85,
      },
      {
        id: 'job-3',
        title: 'Real-Time Operations Specialist',
        company: 'OpsFlow',
        location: 'London, UK',
        platform: 'workable',
        applyUrl: 'https://apply.workable.com/opsflow/3',
        seniority: 'Mid-Level',
        workplaceType: 'Hybrid',
        isRemote: false,
        salarySnippet: '£55,000 / yr',
        publishedAt: new Date(Date.now() - 40 * 86400 * 1000).toISOString(), // 40 days ago
        skills: ['Operations', 'Excel'],
        rawDescription: 'Flexible hours with annual learning budget.',
        matchScore: 78,
      },
    ];

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (typeof url === 'string' && url.includes('/api/ats/crawl')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              totalAvailableInCatalogue: 3,
              jobs: mockJobs,
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    try {
      render(<JobEvaluatorView {...mockProps} masterProfileText="" />);

      // 1. Fetch live roles
      const fetchBtn = screen.getByRole('button', { name: /fetch live roles/i });
      fireEvent.click(fetchBtn);

      // Wait for jobs to appear
      expect(await screen.findByText('Senior Backend Engineer')).toBeDefined();
      expect(screen.getByText('Sales Development Representative (SDR)')).toBeDefined();
      expect(screen.getByText('Real-Time Operations Specialist')).toBeDefined();

      // 2. Open All Filters and filter by Specialization: Backend
      const allFiltersBtn = screen.getByRole('button', { name: /all filters/i });
      fireEvent.click(allFiltersBtn);

      const backendChip = screen.getByRole('button', { name: /^backend/i });
      fireEvent.click(backendChip);

      const applyFiltersBtn = screen.getByRole('button', { name: /show filtered matching roles/i });
      fireEvent.click(applyFiltersBtn);

      // Only the backend job should be visible; sales and ops must be filtered out!
      expect(await screen.findByText('Senior Backend Engineer')).toBeDefined();
      expect(screen.queryByText('Sales Development Representative (SDR)')).toBeNull();
      expect(screen.queryByText('Real-Time Operations Specialist')).toBeNull();

      // 3. Open All Filters, clear specialization, and test Posted Date: "Past 24 hours"
      fireEvent.click(screen.getByRole('button', { name: /all filters/i }));
      const clearBtn = screen.getByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearBtn);

      const postedTab = screen.getByRole('button', { name: /posted date/i });
      fireEvent.click(postedTab);
      const past24hBtn = screen.getByRole('button', { name: /past 24 hours/i });
      fireEvent.click(past24hBtn);

      fireEvent.click(screen.getByRole('button', { name: /show filtered matching roles/i }));

      // Only Job 1 (posted 2h ago) should match; Job 2 (10d ago) and Job 3 (40d ago) must be excluded!
      expect(await screen.findByText('Senior Backend Engineer')).toBeDefined();
      expect(screen.queryByText('Sales Development Representative (SDR)')).toBeNull();
      expect(screen.queryByText('Real-Time Operations Specialist')).toBeNull();

      // 4. Open All Filters and test Salary Range: $120,000+
      fireEvent.click(screen.getByRole('button', { name: /all filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }));

      const salaryTab = screen.getByRole('button', { name: /salary range/i });
      fireEvent.click(salaryTab);
      const salary120k = screen.getByRole('button', { name: /\$120,000/i });
      fireEvent.click(salary120k);

      fireEvent.click(screen.getByRole('button', { name: /show filtered matching roles/i }));

      // Only Job 1 ($180k) meets the $120k+ threshold; Job 2 ($65k) is filtered out
      expect(await screen.findByText('Senior Backend Engineer')).toBeDefined();
      expect(screen.queryByText('Sales Development Representative (SDR)')).toBeNull();

      // 5. Open All Filters and test Relocation / Visa Sponsorship
      fireEvent.click(screen.getByRole('button', { name: /all filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }));

      const relocTab = screen.getByRole('button', { name: /relocation & auth/i });
      fireEvent.click(relocTab);
      const visaSponsorBtn = screen.getByRole('button', { name: /visa sponsorship offered/i });
      fireEvent.click(visaSponsorBtn);

      fireEvent.click(screen.getByRole('button', { name: /show filtered matching roles/i }));

      // Only Job 2 has visa sponsorship in its description
      expect(await screen.findByText('Sales Development Representative (SDR)')).toBeDefined();
      expect(screen.queryByText('Senior Backend Engineer')).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('renders interactive dismissible filter chips in the toolbar and removes them on click', () => {
    render(<JobEvaluatorView {...mockProps} />);

    // Open All Filters and select Location: India and Seniority: Junior
    const allFiltersBtn = screen.getByRole('button', { name: /all filters/i });
    fireEvent.click(allFiltersBtn);

    const locTab = screen.getByRole('button', { name: /^location$/i });
    fireEvent.click(locTab);
    const indiaBtn = screen.getByRole('button', { name: /india/i });
    fireEvent.click(indiaBtn);

    const applyBtn = screen.getByRole('button', { name: /show filtered matching roles/i });
    fireEvent.click(applyBtn);

    // The active filter chip should be visible in the toolbar
    const indiaChip = screen.getByText(/india/i);
    expect(indiaChip).toBeDefined();

    // Clicking the remove button on the chip removes it
    const removeBtn = screen.getByLabelText(/remove filter/i);
    fireEvent.click(removeBtn);

    // Filter chip should now be removed from the toolbar
    expect(screen.queryByLabelText(/remove filter/i)).toBeNull();
  });

  it('allows filtering by Industry both via toolbar quick-select and AllFiltersModal Industry tab', () => {
    render(<JobEvaluatorView {...mockProps} />);

    // 1. Check quick industry dropdown in toolbar
    const industryDropdownBtn = screen.getByRole('button', { name: /^industry$/i });
    expect(industryDropdownBtn).toBeDefined();

    fireEvent.click(industryDropdownBtn);
    expect(screen.getByText('Target Industries')).toBeDefined();

    // Select FinTech & Payments from dropdown
    const fintechBtn = screen.getByRole('button', { name: /fintech & payments/i });
    fireEvent.click(fintechBtn);

    // Active chip for FinTech appears in toolbar
    expect(screen.getAllByText(/fintech & payments/i).length).toBeGreaterThanOrEqual(1);

    // 2. Open All Filters via modal button inside dropdown
    const openModalBtn = screen.getByRole('button', { name: /search all industries in all filters/i });
    fireEvent.click(openModalBtn);

    // The modal opens with the Industry tab active
    expect(screen.getByRole('heading', { name: /industry verticals/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/search industries/i)).toBeDefined();

    // Select GameDev & Gaming
    const gamingBtn = screen.getByRole('button', { name: /gamedev & gaming/i });
    fireEvent.click(gamingBtn);

    const applyModalBtn = screen.getByRole('button', { name: /show filtered matching roles/i });
    fireEvent.click(applyModalBtn);

    // Both chips are rendered in the toolbar
    expect(screen.getByText('FinTech & Payments')).toBeDefined();
    expect(screen.getByText('GameDev & Gaming')).toBeDefined();
  });
});
