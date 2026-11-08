import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WelcomeScreen } from '@/jobstudio/components/onboarding/WelcomeScreen';

afterEach(cleanup);

describe('Clean, Low-Cognitive-Load Onboarding Journey', () => {
  it('renders the friendly 4-step onboarding flow with zero jargon', () => {
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

    // Warm, welcoming header
    expect(screen.getByRole('heading', { name: "Hi Alex, let's get you set up." })).toBeInTheDocument();
    expect(screen.getByText(/WELCOME TO JOB STUDIO/i)).toBeInTheDocument();

    // 4 simple, human-readable steps
    expect(screen.getByText('Build your master profile')).toBeInTheDocument();
    expect(screen.getByText(/Upload your existing resume PDF once/i)).toBeInTheDocument();

    expect(screen.getByText('Evaluate target jobs')).toBeInTheDocument();
    expect(screen.getByText(/Search live jobs or paste any job link/i)).toBeInTheDocument();

    expect(screen.getByText('Tailor documents')).toBeInTheDocument();
    expect(screen.getByText(/Click "Tailor Application" for any job/i)).toBeInTheDocument();

    expect(screen.getByText('Interview prep & tracking')).toBeInTheDocument();
    expect(screen.getByText(/Copy pre-filled answers and track your status/i)).toBeInTheDocument();

    // The single, primary clear call to action
    expect(screen.getByRole('button', { name: /🚀 Start Step 1: Build My Master Profile/i })).toBeInTheDocument();

    // The single tour trigger
    expect(screen.getByRole('button', { name: /Take the 2-minute tour/i })).toBeInTheDocument();
  });

  it('allows clicking any step card to open that feature directly', () => {
    const onNavigateToTab = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        onStartTour={vi.fn()}
        onSkip={vi.fn()}
        onNavigateToTab={onNavigateToTab}
      />
    );

    // Click step 1 card
    fireEvent.click(screen.getByText('Build your master profile'));
    expect(onNavigateToTab).toHaveBeenCalledWith('profile');

    // Click step 2 card
    fireEvent.click(screen.getByText('Evaluate target jobs'));
    expect(onNavigateToTab).toHaveBeenCalledWith('evaluator');

    // Click step 3 card
    fireEvent.click(screen.getByText('Tailor documents'));
    expect(onNavigateToTab).toHaveBeenCalledWith('resume');

    // Click step 4 card
    fireEvent.click(screen.getByText('Interview prep & tracking'));
    expect(onNavigateToTab).toHaveBeenCalledWith('screening');
  });

  it('provides quick jump to Job Evaluator for returning users', () => {
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

  it('launches tour when user clicks tour button', () => {
    const onStartTour = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        onStartTour={onStartTour}
        onSkip={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Take the 2-minute tour/i }));
    expect(onStartTour).toHaveBeenCalledOnce();
  });

  it('renders top brand bar and allows user to sign out from onboarding', () => {
    const onLogout = vi.fn();

    render(
      <WelcomeScreen
        userName="Alex Rivera"
        userEmail="alex@example.com"
        onLogout={onLogout}
        onStartTour={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Job Studio brand logo
    expect(screen.getByText('Job Studio')).toBeInTheDocument();
    // User email
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();

    // Click Sign out
    const signOutBtn = screen.getByRole('button', { name: /Sign out/i });
    fireEvent.click(signOutBtn);
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
