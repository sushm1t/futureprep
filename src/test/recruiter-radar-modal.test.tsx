import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecruiterRadarModal } from '@/jobstudio/components/RecruiterRadarModal';
import { transformUrlToTracer } from '@/jobstudio/utils/tracerLinks';

afterEach(cleanup);

describe('RecruiterRadarModal Component & Tracer Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed sample tracer link
    localStorage.setItem(
      'jobstudio_tracer_links_default',
      JSON.stringify([
        {
          id: 'tl_test_1',
          token: 'tr_sample_token',
          targetUrl: 'https://linkedin.com/in/test-candidate',
          linkLabel: 'linkedin',
          companyName: 'Arcadis',
          jobTitle: 'Senior Piping Designer',
          clickCount: 2,
          createdAt: new Date().toISOString(),
          lastClickedAt: new Date().toISOString(),
          lastVisitorNetwork: 'Arcadis Corporate Network',
        },
      ])
    );
  });

  it('renders modal with active link tracking stats', () => {
    render(
      <RecruiterRadarModal
        isOpen={true}
        onClose={vi.fn()}
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        companyName="Arcadis"
        jobTitle="Senior Piping Designer"
        targetLinkedInUrl="https://linkedin.com/in/test-candidate"
      />
    );

    expect(screen.getByText('Recruiter Radar: CV Link Tracking')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE (ON)')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // total clicks
    expect(screen.getByText(/Arcadis Corporate Network/i)).toBeInTheDocument();
  });

  it('calls onToggleEnabled when clicking turn OFF / ON button', () => {
    const onToggle = vi.fn();
    render(
      <RecruiterRadarModal
        isOpen={true}
        onClose={vi.fn()}
        isEnabled={true}
        onToggleEnabled={onToggle}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /turn off/i });
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('triggers test click and increments counter', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <RecruiterRadarModal
        isOpen={true}
        onClose={vi.fn()}
        isEnabled={true}
        onToggleEnabled={vi.fn()}
      />
    );

    const testBtn = screen.getByTitle('Simulate a recruiter clicking this link');
    fireEvent.click(testBtn);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://linkedin.com/in/test-candidate', '_blank', 'noopener,noreferrer');
    expect(screen.getByText(/Test click recorded!/i)).toBeInTheDocument();

    windowOpenSpy.mockRestore();
  });

  it('polymorphic transformUrlToTracer works with options object without crashing', () => {
    const res = transformUrlToTracer({
      url: 'https://linkedin.com/in/test-candidate',
      label: 'linkedin',
      companyName: 'Arcadis',
      jobTitle: 'Senior Piping Designer',
    });

    expect(res).toContain('/r/tr_');
  });

  it('polymorphic transformUrlToTracer works with positional arguments', () => {
    const res = transformUrlToTracer(
      'https://github.com/test-candidate',
      'github',
      { companyName: 'Stripe' }
    );

    expect(res).toContain('/r/tr_');
  });
});
