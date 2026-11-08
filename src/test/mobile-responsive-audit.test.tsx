import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CandidateProfileModal } from '@/jobstudio/components/CandidateProfileModal';
import { MarketIntelligenceModal } from '@/jobstudio/components/MarketIntelligenceModal';
import { ReportBugModal } from '@/jobstudio/components/ReportBugModal';
import { CareerRoadmapsView } from '@/jobstudio/components/CareerRoadmapsView';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { EMPTY_EVALUATION } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('Mobile & Tablet Responsive Audit', () => {
  it('CandidateProfileModal renders with mobile-dialog-panel and responsive contact field grid', () => {
    const { container } = render(
      <CandidateProfileModal
        isOpen={true}
        onClose={vi.fn()}
        masterProfileText="Experience text"
        setMasterProfileText={vi.fn()}
        candidateInfo={{
          first_name: 'Alex',
          last_name: 'Rivera',
          email: 'alex@example.com',
          phone: '+1 555-0199',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/alexrivera',
        }}
        setCandidateInfo={vi.fn()}
      />
    );

    const dialogPanel = container.querySelector('.mobile-dialog-panel');
    expect(dialogPanel).toBeInTheDocument();

    const contactGrid = container.querySelector('.grid-cols-1.sm\\:grid-cols-2');
    expect(contactGrid).toBeInTheDocument();
  });

  it('MarketIntelligenceModal includes mobile-dialog-panel and horizontal scroll tabs', () => {
    const { container } = render(
      <MarketIntelligenceModal isOpen={true} onClose={vi.fn()} />
    );

    const dialogPanel = container.querySelector('.mobile-dialog-panel');
    expect(dialogPanel).toBeInTheDocument();

    const tabsContainer = container.querySelector('.overflow-x-auto');
    expect(tabsContainer).toBeInTheDocument();
  });

  it('ReportBugModal includes mobile-dialog-panel for mobile viewport constraint', () => {
    const { container } = render(
      <ReportBugModal isOpen={true} onClose={vi.fn()} />
    );

    const dialogPanel = container.querySelector('.mobile-dialog-panel');
    expect(dialogPanel).toBeInTheDocument();
  });

  it('CareerRoadmapsView experience level options stack on mobile and expand on sm screens', () => {
    const { container } = render(
      <CareerRoadmapsView
        savedRoles={[]}
        onSaveRole={vi.fn()}
        onSelectRole={vi.fn()}
        targetRole="Product Designer"
      />
    );

    // Click Quiz Trigger Banner
    const quizBanner = screen.getByText(/Not sure which role fits you/i);
    fireEvent.click(quizBanner);

    const levelGrid = container.querySelector('.grid-cols-1.sm\\:grid-cols-3');
    expect(levelGrid).toBeInTheDocument();
  });

  it('JobEvaluatorView uses balanced responsive column layout for panel reviews', () => {
    const { container } = render(
      <JobEvaluatorView
        evaluation={{
          ...EMPTY_EVALUATION,
          job_title: 'Staff Product Designer',
          company_name: 'Figma',
          match_score: 85,
        }}
        isEvaluationComplete={true}
        opportunities={[]}
        selectedJobId="figma-1"
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        masterProfileText="Senior Product Designer with Figma experience"
      />
    );

    const panelGrid = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-3');
    expect(panelGrid).toBeInTheDocument();
  });
});
