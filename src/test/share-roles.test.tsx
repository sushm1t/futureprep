import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { EMPTY_EVALUATION } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('JobEvaluatorView - Share Fetched Roles Feature', () => {
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
    masterProfileText: 'Software Engineer with experience in React and TypeScript.',
  };

  const sampleJobs = [
    {
      id: 'gh-1',
      title: 'Customer Operations Lead',
      company: 'Anthropic',
      location: 'San Francisco, CA',
      department: 'Operations',
      platform: 'Greenhouse',
      applyUrl: 'https://boards.greenhouse.io/anthropic/jobs/1',
      rawDescription: 'Manage frontline enterprise support operations and client escalation SLAs.',
      isRemote: false,
      workplaceType: 'Hybrid',
      seniority: 'Mid-Level',
    },
    {
      id: 'gh-2',
      title: 'Staff Software Engineer, Distributed Systems',
      company: 'Anthropic',
      location: 'San Francisco, CA',
      department: 'Engineering',
      platform: 'Greenhouse',
      applyUrl: 'https://boards.greenhouse.io/anthropic/jobs/2',
      rawDescription: 'Build distributed systems with Go, Kubernetes, and PostgreSQL at scale.',
      isRemote: false,
      workplaceType: 'Hybrid',
      seniority: 'Lead / Staff / Director',
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        company: 'Anthropic',
        slug: 'anthropic',
        ats: 'Greenhouse',
        jobs: sampleJobs,
        totalAvailableInCatalogue: 120000,
      }),
    })));

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders Share Roles button and Copy Link button when roles are loaded', async () => {
    render(<JobEvaluatorView {...mockProps} masterProfileText="Staff Software Engineer with deep expertise in Go, Kubernetes, PostgreSQL, TypeScript, and distributed systems." />);

    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText('Staff Software Engineer, Distributed Systems')).toBeInTheDocument();
    });

    // Share Roles button and Copy Link button should be visible in results header
    const shareBtn = screen.getByRole('button', { name: /Share fetched roles/i });
    expect(shareBtn).toBeInTheDocument();
    expect(shareBtn).toHaveTextContent('Share Roles');

    const copyBtn = screen.getByRole('button', { name: /Copy direct share link/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it('clicking direct Copy Link copies share URL to clipboard with evaluator tab parameter', async () => {
    render(<JobEvaluatorView {...mockProps} masterProfileText="Staff Software Engineer with deep expertise in Go, Kubernetes, PostgreSQL, TypeScript, and distributed systems." />);

    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText('Staff Software Engineer, Distributed Systems')).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy direct share link/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedUrl = (navigator.clipboard.writeText as any).mock.calls[0][0];
    expect(copiedUrl).toContain('tab=evaluator');

    // UI displays "Copied!" feedback
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('clicking Share Roles opens modal with direct share link and copy list action', async () => {
    render(<JobEvaluatorView {...mockProps} masterProfileText="Staff Software Engineer with deep expertise in Go, Kubernetes, PostgreSQL, TypeScript, and distributed systems." />);

    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText('Staff Software Engineer, Distributed Systems')).toBeInTheDocument();
    });

    // Open share modal
    const shareBtn = screen.getByRole('button', { name: /Share fetched roles/i });
    fireEvent.click(shareBtn);

    // Modal elements
    expect(screen.getByRole('dialog', { name: /Share Fetched Roles/i })).toBeInTheDocument();
    expect(screen.getByText(/Share \d+ live positions/i)).toBeInTheDocument();

    // Copy List button
    const copyListBtn = screen.getByRole('button', { name: /Copy List.*WhatsApp.*Slack/i });
    expect(copyListBtn).toBeInTheDocument();

    fireEvent.click(copyListBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const listText = (navigator.clipboard.writeText as any).mock.calls.at(-1)[0];
    expect(listText).toContain('Staff Software Engineer, Distributed Systems — Anthropic');
    expect(listText).toContain('https://boards.greenhouse.io/anthropic/jobs/2');

    // Close modal
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('copies all roles without capping at 25 when candidate has 55 matching positions', async () => {
    // Generate 55 mock positions at Anthropic matching software engineer profile
    const fiftyFiveJobs = Array.from({ length: 55 }, (_, i) => ({
      id: `gh-${i + 1}`,
      title: `Staff Software Engineer Role ${i + 1}`,
      company: 'Anthropic',
      location: 'San Francisco, CA',
      department: 'Engineering',
      platform: 'Greenhouse',
      applyUrl: `https://boards.greenhouse.io/anthropic/jobs/${i + 1}`,
      rawDescription: `Build distributed systems with React, TypeScript, and Go at scale for role ${i + 1}.`,
      isRemote: false,
      workplaceType: 'Hybrid',
      seniority: 'Lead / Staff / Director',
    }));

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        company: 'Anthropic',
        slug: 'anthropic',
        ats: 'Greenhouse',
        jobs: fiftyFiveJobs,
        totalAvailableInCatalogue: 120000,
      }),
    })));

    render(
      <JobEvaluatorView
        {...mockProps}
        masterProfileText="Staff Software Engineer with deep expertise in React, TypeScript, and distributed systems."
      />
    );

    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText('Staff Software Engineer Role 1')).toBeInTheDocument();
    });

    // Open share modal
    const shareBtn = screen.getByRole('button', { name: /Share fetched roles/i });
    fireEvent.click(shareBtn);

    // Verify modal displays 55 positions
    expect(screen.getByRole('dialog', { name: /Share Fetched Roles/i })).toBeInTheDocument();
    expect(screen.getByText(/Positions Included \(55\)/i)).toBeInTheDocument();

    // Click Copy List
    const copyListBtn = screen.getByRole('button', { name: /Copy List.*55.*roles/i });
    fireEvent.click(copyListBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedText = (navigator.clipboard.writeText as any).mock.calls.at(-1)[0];

    // Assert that role 1, role 25, role 26, AND role 55 are all in the copied text
    expect(copiedText).toContain('1. Staff Software Engineer Role 1');
    expect(copiedText).toContain('25. Staff Software Engineer Role 25');
    expect(copiedText).toContain('26. Staff Software Engineer Role 26');
    expect(copiedText).toContain('55. Staff Software Engineer Role 55');
    expect(copiedText).toContain('🎯 Live Roles on JobStudio (55 positions)');
  });

  it('automatically triggers ATS crawl with shared parameters when URL search params are present', async () => {
    // Simulate opening with shared URL
    delete (window as any).location;
    (window as any).location = new URL('http://localhost:5173/?tab=evaluator&keyword=Staff+Software+Engineer&location=San+Francisco&company=Anthropic');

    render(
      <JobEvaluatorView
        {...mockProps}
        masterProfileText="Staff Software Engineer with deep expertise in Go, Kubernetes, PostgreSQL, TypeScript, and distributed systems."
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Staff Software Engineer, Distributed Systems')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/ats/crawl',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Staff Software Engineer'),
      })
    );
  });
});
