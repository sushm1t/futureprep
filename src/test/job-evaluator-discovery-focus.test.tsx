import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { EMPTY_EVALUATION } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('JobEvaluatorView Two-Stage Architecture', () => {
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
  };

  it('renders Stage 2A Discovery Search Mode by default when no role is active', () => {
    render(<JobEvaluatorView {...mockProps} />);

    // Default search inputs & fetch button
    expect(screen.getByPlaceholderText(/Company or URL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Title or keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fetch Live Roles/i })).toBeInTheDocument();

    // Subtle edge-case accordion toggles
    expect(screen.getByText(/Or paste a custom job description/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse curated company boards/i)).toBeInTheDocument();

    // Empty state when no role is active
    expect(screen.getByText(/Your match analysis starts here/i)).toBeInTheDocument();
  });

  it('renders Stage 2B Collapsed Summary Bar and Focus Mode when a role is active', () => {
    const activeProps = {
      ...mockProps,
      selectedJobId: 'job-1',
      evaluation: {
        ...EMPTY_EVALUATION,
        job_title: 'Senior Product Designer',
        company_name: 'Figma',
        location_info: 'San Francisco, CA',
        match_score: 88,
      },
      isEvaluationComplete: true,
    };

    render(<JobEvaluatorView {...activeProps} />);

    // Search is collapsed into summary bar
    expect(screen.getByText(/Searching Senior Product Designer roles/i)).toBeInTheDocument();
    const changeBtn = screen.getByRole('button', { name: /Change/i });
    expect(changeBtn).toBeInTheDocument();

    // Center stage displays the active role
    expect(screen.getByText('Senior Product Designer')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();

    // Center stage dedicated Hiring Committee Feedback card
    expect(screen.getByText(/Hiring Committee Feedback/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lead Recruiter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hiring Manager/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Domain Lead/i).length).toBeGreaterThan(0);

    // Center stage action row provides single canonical review CTA
    expect(screen.getByRole('button', { name: /Review Tailored Application/i })).toBeInTheDocument();

    // Clicking 'Change' opens the search card
    fireEvent.click(changeBtn);
    expect(screen.getByPlaceholderText(/Company or URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to active role/i })).toBeInTheDocument();

    // Clicking 'Back to active role' re-collapses search
    fireEvent.click(screen.getByRole('button', { name: /Back to active role/i }));
    expect(screen.getByText(/Searching Senior Product Designer roles/i)).toBeInTheDocument();
  });

  it('does NOT auto-fetch when selecting location filter, but fetches when clicking Fetch Live Roles', async () => {
    const fetchMock = vi.fn(async (_url: string, _opts: { body: string }) => ({
      ok: true,
      json: async () => ({ success: true, jobs: [], totalAvailableInCatalogue: 100 }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<JobEvaluatorView {...mockProps} />);

    // Find the location select dropdown
    const locationSelect = screen.getByDisplayValue(/All Locations/i);
    expect(locationSelect).toBeInTheDocument();

    // Select India
    fireEvent.change(locationSelect, { target: { value: 'India' } });

    // Ensure fetch was NOT automatically called just by changing location
    expect(fetchMock).not.toHaveBeenCalled();

    // Now explicitly click Fetch Live Roles
    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    // Verify fetch was called with location: 'India'
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body || '{}');
    expect(body.location).toBe('India');
  });

  it('allows expanding and using custom job description accordion on the left side', () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    render(<JobEvaluatorView {...mockProps} />);

    const accordion = document.getElementById('custom-jd-accordion');
    expect(accordion).toBeInTheDocument();
    expect(accordion).not.toHaveAttribute('open');

    const summary = screen.getByText(/Or paste a custom job description/i);
    fireEvent.click(summary);

    expect(accordion).toHaveAttribute('open');
  });
});
