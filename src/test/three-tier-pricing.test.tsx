import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PricingView } from '@/jobstudio/components/PricingView';
import { FREE_TAILOR_LIMIT, PLUS_TAILOR_LIMIT, PRO_TAILOR_LIMIT, getPlanLimit } from '@/server/api-guard';

afterEach(cleanup);

describe('3-Tier Pricing System (Free, Plus, Pro)', () => {
  it('correctly maps server-side plan limits', () => {
    expect(FREE_TAILOR_LIMIT).toBe(2);
    expect(PLUS_TAILOR_LIMIT).toBe(50);
    expect(PRO_TAILOR_LIMIT).toBe(200);

    expect(getPlanLimit('free')).toBe(2);
    expect(getPlanLimit('plus')).toBe(50);
    expect(getPlanLimit('pro')).toBe(200);
  });

  it('renders all three tiers with correct names, prices, and monthly quotas', () => {
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={vi.fn()}
        onDowngradeToFree={vi.fn()}
        tailoredCount={1}
        onNavigateToTab={vi.fn()}
      />
    );

    // Three tier headers
    expect(screen.getByRole('heading', { name: /^Free$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Plus$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Pro$/i })).toBeInTheDocument();

    // Prices
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$4.99')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();

    // Badges & Quotas
    expect(screen.getByText(/MOST POPULAR/i)).toBeInTheDocument();
    expect(screen.getByText(/BEST VALUE/i)).toBeInTheDocument();
    expect(screen.getByText(/50 Tailored Resumes \/ Month/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Limits on Tailoring & Preparation/i)).toBeInTheDocument();
  });

  it('toggles between monthly and annual billing with 20% discount', () => {
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={vi.fn()}
        onDowngradeToFree={vi.fn()}
        tailoredCount={0}
        onNavigateToTab={vi.fn()}
      />
    );

    // Initial monthly prices
    expect(screen.getByText('$4.99')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();

    // Toggle to Annual
    const annualBtn = screen.getByRole('button', { name: /Annual/i });
    fireEvent.click(annualBtn);

    // Discounted monthly equivalents
    expect(screen.getByText('$3.99')).toBeInTheDocument();
    expect(screen.getByText('$7.99')).toBeInTheDocument();
  });

  it('opens checkout modal for Plus and calls onUpgradeToPlan with plus', () => {
    const onUpgradeToPlan = vi.fn();
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={onUpgradeToPlan}
        onDowngradeToFree={vi.fn()}
        tailoredCount={0}
        onNavigateToTab={vi.fn()}
      />
    );

    const upgradePlusBtn = screen.getByRole('button', { name: /Upgrade to Plus/i });
    fireEvent.click(upgradePlusBtn);

    // Modal opens
    expect(screen.getByRole('heading', { name: /Confirm Plus Subscription/i })).toBeInTheDocument();
    expect(screen.getByText(/50 tailored resumes\/month/i)).toBeInTheDocument();

    // Confirm upgrade
    const confirmBtn = screen.getByRole('button', { name: /Activate Plus Now/i });
    fireEvent.click(confirmBtn);

    expect(onUpgradeToPlan).toHaveBeenCalledWith('plus');
  });

  it('opens checkout modal for Pro and calls onUpgradeToPlan with pro', () => {
    const onUpgradeToPlan = vi.fn();
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={onUpgradeToPlan}
        onDowngradeToFree={vi.fn()}
        tailoredCount={0}
        onNavigateToTab={vi.fn()}
      />
    );

    const upgradeProBtn = screen.getByRole('button', { name: /Upgrade to Pro/i });
    fireEvent.click(upgradeProBtn);

    // Modal opens
    expect(screen.getByRole('heading', { name: /Confirm Pro Subscription/i })).toBeInTheDocument();
    expect(screen.getAllByText(/unlimited tailored resumes/i).length).toBeGreaterThanOrEqual(1);

    // Confirm upgrade
    const confirmBtn = screen.getByRole('button', { name: /Activate Pro Now/i });
    fireEvent.click(confirmBtn);

    expect(onUpgradeToPlan).toHaveBeenCalledWith('pro');
  });

  it('displays the detailed plan comparison table across all 3 tiers', () => {
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={vi.fn()}
        onDowngradeToFree={vi.fn()}
        tailoredCount={0}
        onNavigateToTab={vi.fn()}
      />
    );

    expect(screen.getByText(/Detailed Plan Comparison/i)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Free \(\$0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Plus \(\$4\.99\/mo\)/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Pro \(\$9\.99\/mo\)/i })).toBeInTheDocument();
  });

  it('shows processing spinner then celebration screen on confirming upgrade', () => {
    vi.useFakeTimers();
    const onNavigateToTab = vi.fn();
    render(
      <PricingView
        userPlan="free"
        isProUser={false}
        onUpgradeToPro={vi.fn()}
        onUpgradeToPlan={vi.fn()}
        onDowngradeToFree={vi.fn()}
        tailoredCount={0}
        onNavigateToTab={onNavigateToTab}
      />
    );

    const upgradePlusBtn = screen.getByRole('button', { name: /Upgrade to Plus/i });
    fireEvent.click(upgradePlusBtn);

    const confirmBtn = screen.getByRole('button', { name: /Activate Plus Now/i });
    fireEvent.click(confirmBtn);

    // Shows processing state
    expect(screen.getByText(/Activating Plus Subscription/i)).toBeInTheDocument();

    // Advance timer past 1.2s inside act
    act(() => {
      vi.advanceTimersByTime(1300);
    });

    // Shows celebration screen
    expect(screen.getByText(/Welcome to Job Studio Plus!/i)).toBeInTheDocument();
    expect(screen.getByText(/Your increased tailoring quota and advanced copilot features are now active/i)).toBeInTheDocument();

    const evaluatorBtn = screen.getByRole('button', { name: /Go to Job Evaluator/i });
    fireEvent.click(evaluatorBtn);

    expect(onNavigateToTab).toHaveBeenCalledWith('evaluator');
    expect(screen.queryByText(/Welcome to Job Studio Plus!/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
