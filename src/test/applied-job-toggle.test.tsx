import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { ScreeningAnswersView } from '@/jobstudio/components/ScreeningAnswersView';
import { ResumeDocument } from '@/jobstudio/components/ResumeDocument';
import { EMPTY_EVALUATION, type AppliedJobRecord, type CandidateInfo, type TailoredResumeData } from '@/jobstudio/data/defaultData';
import { applyJobUpdate, withCreatedEvent } from '@/jobstudio/data/applicationHistory';

afterEach(cleanup);

describe('Two-Way Application Tracking Toggle & Direct "Apply now" Link', () => {
  const sampleOpportunity = {
    id: 'linear-support-spec',
    title: 'Product Support Specialist',
    company: 'Linear',
    location: 'Remote-first within Australia or Singapore',
    platform: 'Ashby',
    applyUrl: 'https://jobs.ashbyhq.com/linear/product-support-specialist',
    category: 'Incident & Service Ops',
    matchScore: 42,
    matchHighlight: 'Transferable cross-functional escalation and SQL investigation experience.',
    description: 'Provide high-quality technical support to Linear users.',
    isLive: true,
  };

  const sampleEvaluation = {
    ...EMPTY_EVALUATION,
    job_title: 'Product Support Specialist',
    company_name: 'Linear',
    location_info: 'Remote-first within Australia or Singapore',
    match_score: 42,
    executive_summary: 'While candidate brings transferable cross-functional escalation...',
  };

  it('renders "Apply now" button directly to the left of "Mark as Applied" in JobEvaluatorView', () => {
    const onTrackMock = vi.fn();

    render(
      <JobEvaluatorView
        evaluation={sampleEvaluation}
        isEvaluationComplete={true}
        opportunities={[sampleOpportunity]}
        selectedJobId="linear-support-spec"
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        onTrackApplication={onTrackMock}
        isTracked={false}
      />
    );

    // Verify "Apply now" button is present and links directly to official Ashby portal
    const applyNowLink = screen.getByRole('link', { name: /apply now/i });
    expect(applyNowLink).toBeInTheDocument();
    expect(applyNowLink).toHaveAttribute('href', 'https://jobs.ashbyhq.com/linear/product-support-specialist');
    expect(applyNowLink).toHaveAttribute('target', '_blank');

    // Verify "Mark as Applied" button is present
    const trackButton = screen.getByRole('button', { name: /mark as applied/i });
    expect(trackButton).toBeInTheDocument();

    // Verify DOM ordering: "Apply now" is to the left of (precedes) "Mark as Applied"
    expect(applyNowLink.compareDocumentPosition(trackButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Clicking "Mark as Applied" triggers callback with effective portal link
    fireEvent.click(trackButton);
    expect(onTrackMock).toHaveBeenCalledTimes(1);
    expect(onTrackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        company_name: 'Linear',
        job_title: 'Product Support Specialist',
        apply_url: 'https://jobs.ashbyhq.com/linear/product-support-specialist',
      })
    );
  });

  it('displays "Tracked as Applied" when isTracked is true, and clicking it untracks the job', () => {
    const onTrackMock = vi.fn();

    render(
      <JobEvaluatorView
        evaluation={sampleEvaluation}
        isEvaluationComplete={true}
        opportunities={[sampleOpportunity]}
        selectedJobId="linear-support-spec"
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        onTrackApplication={onTrackMock}
        isTracked={true}
      />
    );

    const trackedButton = screen.getByRole('button', { name: /tracked as applied/i });
    expect(trackedButton).toBeInTheDocument();

    fireEvent.click(trackedButton);
    expect(onTrackMock).toHaveBeenCalledTimes(1);
  });

  it('renders "Apply now" to the left of "Mark as Applied" in ScreeningAnswersView', () => {
    const onTrackMock = vi.fn();

    render(
      <ScreeningAnswersView
        screeningAnswers={[]}
        candidateInfo={{
          first_name: 'Alex',
          last_name: 'Morgan',
          email: 'alex.morgan@example.com',
          phone: '',
          location: 'San Francisco, CA',
          linkedin: '',
        }}
        applyUrl="https://jobs.ashbyhq.com/linear/product-support-specialist"
        companyName="Linear"
        jobTitle="Product Support Specialist"
        jobDescription="Job description"
        masterProfileText="Master profile text"
        onTrackApplication={onTrackMock}
        isTracked={false}
        onAddScreeningAnswer={vi.fn()}
        onRemoveScreeningAnswer={vi.fn()}
      />
    );

    const applyNowLink = screen.getByRole('link', { name: /apply now/i });
    expect(applyNowLink).toBeInTheDocument();
    expect(applyNowLink).toHaveAttribute('href', 'https://jobs.ashbyhq.com/linear/product-support-specialist');

    const markAppliedBtn = screen.getByRole('button', { name: /mark as applied/i });
    expect(markAppliedBtn).toBeInTheDocument();

    // Verify ordering: "Apply now" is to the left of "Mark as Applied"
    expect(applyNowLink.compareDocumentPosition(markAppliedBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('two-way toggle logic: tracking adds job to appliedJobs, and second click removes/deletes it', () => {
    let appliedJobs: AppliedJobRecord[] = [];

    const handleTrackToggle = (company: string, title: string, applyUrl?: string) => {
      const existingIndex = appliedJobs.findIndex(
        (j) =>
          j.company_name.toLowerCase() === company.toLowerCase() &&
          j.job_title.toLowerCase() === title.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Toggle OFF: remove from appliedJobs
        appliedJobs = appliedJobs.filter((_, idx) => idx !== existingIndex);
      } else {
        // Toggle ON: add to appliedJobs
        const newRecord: AppliedJobRecord = withCreatedEvent({
          id: `app-${Date.now()}`,
          company_name: company,
          job_title: title,
          location: 'Remote',
          platform: 'Ashby',
          apply_url: applyUrl || '',
          applied_date: '2026-11-07',
          match_score: 95,
          status: 'Applied',
          created_at: Date.now(),
        });
        appliedJobs = [newRecord, ...appliedJobs];
      }
    };

    // 1. Initial click: Mark as applied
    handleTrackToggle('Linear', 'Product Support Specialist', 'https://jobs.ashbyhq.com/linear/product-support-specialist');
    expect(appliedJobs).toHaveLength(1);
    expect(appliedJobs[0]?.company_name).toBe('Linear');
    expect(appliedJobs[0]?.job_title).toBe('Product Support Specialist');

    // 2. Second click: Tracked as applied -> untracks and removes from appliedJobs
    handleTrackToggle('Linear', 'Product Support Specialist');
    expect(appliedJobs).toHaveLength(0);

    // 3. Third click: Can re-mark as applied seamlessly
    handleTrackToggle('Linear', 'Product Support Specialist', 'https://jobs.ashbyhq.com/linear/product-support-specialist');
    expect(appliedJobs).toHaveLength(1);
    expect(appliedJobs[0]?.company_name).toBe('Linear');
  });

  it('does NOT render "Mark as Applied" in ResumeDocument when no role is selected (Master Career Resume)', () => {
    const sampleResume: TailoredResumeData = {
      full_name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '',
      location: '',
      linkedin: '',
      tailored_summary: 'Master baseline summary',
      skills: ['Figma'],
      experiences: [],
      education: [],
      certifications: [],
    };

    // 1. Untailored baseline (no role selected)
    const { rerender } = render(
      <ResumeDocument
        resume={sampleResume}
        setResume={vi.fn()}
        jobTitle=""
        companyName=""
        isTracked={false}
        onTrackApplication={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /mark as applied|tracked as applied/i })).toBeNull();
    expect(screen.getByText(/Master Career Resume/i)).toBeInTheDocument();

    // 2. Tailored to an active role: button appears
    rerender(
      <ResumeDocument
        resume={sampleResume}
        setResume={vi.fn()}
        jobTitle="Senior Product Designer"
        companyName="Figma"
        isTracked={false}
        onTrackApplication={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /mark as applied/i })).toBeInTheDocument();
  });
});
