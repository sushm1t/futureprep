import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WelcomeScreen } from '@/jobstudio/components/onboarding/WelcomeScreen';

afterEach(cleanup);

describe('Next-Level Onboarding Journey & Interactive Graphics', () => {
  it('renders interactive visual cockpit and switches between phases on click', () => {
    const onStartTour = vi.fn();
    const onSkip = vi.fn();
    const onNavigateToTab = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        onStartTour={onStartTour}
        onSkip={onSkip}
        onNavigateToTab={onNavigateToTab}
      />
    );

    // Initial Phase 1: Build your master profile
    expect(screen.getByText(/PHASE 01 · Profile Vault/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile-Backed Baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Fact Enforced/i)).toBeInTheDocument();

    // Click on Phase 2: Evaluate target jobs
    const phase2Tab = screen.getByText('Evaluate target jobs');
    fireEvent.click(phase2Tab);

    expect(screen.getByText(/PHASE 02 · Live ATS Radar & Match Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Multi-ATS Crawl/i)).toBeInTheDocument();
    expect(screen.getByText(/Transferable Skill Adjacency/i)).toBeInTheDocument();
    expect(screen.getByText(/2.4x Optimal Window: Tue 9:30 AM/i)).toBeInTheDocument();

    // Click Next Phase button to advance to Phase 3: Application Studio
    const nextBtn = screen.getByRole('button', { name: /Next Phase/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/PHASE 03 · Application Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/1-Page ATS Vector Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/6-Sec Roast \(88\/100\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Recruiter Radar Active/i)).toBeInTheDocument();

    // Advance to Phase 4: Post-Apply Copilot
    fireEvent.click(screen.getByRole('button', { name: /Next Phase/i }));

    expect(screen.getByText(/PHASE 04 · Post-Apply Copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/1-Click ATS Application Dossier/i)).toBeInTheDocument();
    expect(screen.getByText(/Application Pipeline Kanban/i)).toBeInTheDocument();
  });

  it('allows direct feature launch via onNavigateToTab', () => {
    const onNavigateToTab = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        onStartTour={vi.fn()}
        onSkip={vi.fn()}
        onNavigateToTab={onNavigateToTab}
      />
    );

    // Click "Open Profile Vault now" in the graphic footer
    const launchBtn = screen.getByRole('button', { name: /Open Profile Vault now/i });
    fireEvent.click(launchBtn);

    expect(onNavigateToTab).toHaveBeenCalledWith('profile');

    // Click bottom primary CTA
    const primaryCta = screen.getByRole('button', { name: /🚀 Start Step 1: Build My Master Profile/i });
    fireEvent.click(primaryCta);

    expect(onNavigateToTab).toHaveBeenCalledWith('profile');
  });

  it('provides quick jump to Job Evaluator for returning users with existing profile', () => {
    const onNavigateToTab = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        onStartTour={vi.fn()}
        onSkip={vi.fn()}
        onNavigateToTab={onNavigateToTab}
      />
    );

    const jumpBtn = screen.getByText(/Jump straight to Job Evaluator →/i);
    fireEvent.click(jumpBtn);

    expect(onNavigateToTab).toHaveBeenCalledWith('evaluator');
  });
});
