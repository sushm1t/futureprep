import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { EMPTY_EVALUATION, type JobOpportunity } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('Task 7: JobEvaluatorView Modern 2-Pane Master-Detail Cockpit', () => {
  const mockOpportunities: JobOpportunity[] = [
    {
      id: 'job-figma-lead',
      title: 'Lead Product Designer',
      company: 'Figma',
      location: 'San Francisco, CA',
      platform: 'Ashby',
      applyUrl: 'https://jobs.ashbyhq.com/figma/lead-designer',
      category: 'Product & Design',
      matchScore: 94,
      matchHighlight: 'Exceptional systems thinking',
      description: 'Design systems lead role',
    },
    {
      id: 'job-stripe-ops',
      title: 'Operations Analyst',
      company: 'Stripe',
      location: 'Seattle, WA',
      platform: 'Greenhouse',
      applyUrl: 'https://boards.greenhouse.io/stripe/jobs/1',
      category: 'Operations',
      matchScore: 82,
      matchHighlight: 'Payments reconciliation focus',
      description: 'Fintech ops role',
    },
  ];

  const baseProps = {
    evaluation: {
      ...EMPTY_EVALUATION,
      job_title: '',
      company_name: '',
    },
    isEvaluationComplete: false,
    opportunities: mockOpportunities,
    selectedJobId: '',
    customJobText: '',
    setCustomJobText: vi.fn(),
    customUrl: '',
    setCustomUrl: vi.fn(),
    onEvaluate: vi.fn(),
    isLoading: false,
    onProceedToResume: vi.fn(),
    onSelectPreset: vi.fn(),
  };

  it('renders desktop 2-pane master-detail cockpit layout with 5/7 grid columns', () => {
    const { container } = render(<JobEvaluatorView {...baseProps} />);

    // Grid container
    const gridContainer = container.querySelector('.lg\\:grid-cols-12');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-12', 'gap-6');

    // Left pane (Discovery Feed)
    const leftPane = container.querySelector('#discovery-feed-pane');
    expect(leftPane).toBeInTheDocument();
    expect(leftPane).toHaveClass('lg:col-span-5');

    // Right pane (Action Dossier)
    const rightPane = container.querySelector('#role-action-dossier');
    expect(rightPane).toBeInTheDocument();
    expect(rightPane).toHaveClass('lg:col-span-7', 'lg:sticky', 'lg:top-6');
  });

  it('displays empty state in the right pane when no role is active', () => {
    render(<JobEvaluatorView {...baseProps} />);

    expect(screen.getByText(/Your match analysis starts here/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Select a position from the live feed or import your custom job description/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/What you'll see upon selecting a role/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Import a job description/i })).not.toBeInTheDocument();
  });

  it('renders Action Dossier in the right pane with sticky positioning and mobile back button when a role is active', () => {
    const activeProps = {
      ...baseProps,
      selectedJobId: 'job-figma-lead',
      evaluation: {
        ...EMPTY_EVALUATION,
        job_title: 'Lead Product Designer',
        company_name: 'Figma',
        location_info: 'San Francisco, CA',
        match_score: 94,
        should_apply: true,
        verdict: 'STRONG_MATCH',
        executive_summary: 'Superb portfolio alignment with design system architecture.',
        key_matching_factors: [
          'Mastery of token architecture and multibrand themes',
          'Track record mentoring senior product designers',
        ],
        tailoring_recommendations: [
          'Spotlight measurable latency and token adoption metrics',
        ],
      },
      isEvaluationComplete: true,
    };

    const { container } = render(<JobEvaluatorView {...activeProps} />);

    // Dossier is rendered in right pane
    const rightPane = container.querySelector('#role-action-dossier');
    expect(rightPane).toBeInTheDocument();
    expect(rightPane).toHaveClass('lg:sticky', 'lg:top-6');

    // Score gauge, title, company in dossier
    expect(rightPane?.querySelector('h2')?.textContent).toBe('Lead Product Designer');
    expect(screen.getAllByText('Figma').length).toBeGreaterThan(0);
    expect(screen.getByText('94%')).toBeInTheDocument();

    // Mobile back button is present with lg:hidden
    const backBtn = screen.getByRole('button', { name: /Back to search results/i });
    expect(backBtn).toBeInTheDocument();
    expect(backBtn.closest('.lg\\:hidden')).toBeInTheDocument();

    // Key matching factors with checkmarks
    expect(screen.getByText('Mastery of token architecture and multibrand themes')).toBeInTheDocument();

    // Primary action CTAs
    expect(screen.getByRole('button', { name: /Review Tailored Application/i })).toBeInTheDocument();
  });

  it('selecting a role from the left feed triggers onSelectPreset to focus the dossier', () => {
    const onSelectPreset = vi.fn();
    render(<JobEvaluatorView {...baseProps} onSelectPreset={onSelectPreset} />);

    // Click Figma role card in the saved opportunities feed
    const figmaCard = screen.getByText('Lead Product Designer').closest('[data-saved-job-id="job-figma-lead"]')!;
    expect(figmaCard).toBeInTheDocument();

    fireEvent.click(figmaCard);
    expect(onSelectPreset).toHaveBeenCalledWith('job-figma-lead');
  });
});
