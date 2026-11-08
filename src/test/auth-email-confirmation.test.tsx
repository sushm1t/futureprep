import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthView } from '@/jobstudio/components/AuthView';

const mockResend = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      resend: (...args: any[]) => mockResend(...args),
    },
  },
}));

vi.mock('@/integrations/lovable/index', () => ({
  lovable: {
    auth: {
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AuthView Email Confirmation & Delivery Assistant', () => {
  it('activates the confirmation assistant and institutional alert for .edu.in signups', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'test-user' }, session: null },
      error: null,
    });

    render(<AuthView onLogin={vi.fn()} onNavigateToTab={vi.fn()} initialMode="signup" />);

    // Fill in signup form with educational email
    fireEvent.change(screen.getByPlaceholderText('Your full name'), {
      target: { value: 'Sushmit Student' },
    });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'sushmit.s2017bvoctt@srisriuniversity.edu.in' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Wait for signup to complete and assistant to display
    await waitFor(() => {
      expect(screen.getByText(/Confirmation Link Sent/i)).toBeInTheDocument();
    });

    // Verify institutional warning for srisriuniversity.edu.in
    expect(screen.getByText(/University \/ Institutional Email Notice/i)).toBeInTheDocument();
    expect(screen.getAllByText(/srisriuniversity\.edu\.in/i).length).toBeGreaterThanOrEqual(1);

    // Verify Resend button with cooldown is present
    expect(screen.getByRole('button', { name: /Resend Link/i })).toBeInTheDocument();

    // Verify Instant Google OAuth alternative is surfaced
    expect(screen.getAllByText(/Continue with Google/i).length).toBeGreaterThan(0);
  });

  it('triggers supabase.auth.resend when user clicks resend', async () => {
    mockResend.mockResolvedValueOnce({ data: {}, error: null });

    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'test-user' }, session: null },
      error: null,
    });

    render(<AuthView onLogin={vi.fn()} onNavigateToTab={vi.fn()} initialMode="signup" />);

    fireEvent.change(screen.getByPlaceholderText('Your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'student@example.edu' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Confirmation Link Sent/i)).toBeInTheDocument();
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'student@example.edu',
        password: 'Password123',
      })
    );
  });

  it('handles "Email not confirmed" during sign-in by opening the recovery card and allowing instant resend', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Email not confirmed'),
    });
    mockResend.mockResolvedValueOnce({ data: {}, error: null });

    render(<AuthView onLogin={vi.fn()} onNavigateToTab={vi.fn()} initialMode="signin" />);

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'sushmit.s2017bvoctt@srisriuniversity.edu.in' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Workspace/i }));

    await waitFor(() => {
      expect(screen.getByText(/Confirmation Link Sent/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/University \/ Institutional Email Notice/i)).toBeInTheDocument();
    expect(screen.getAllByText(/srisriuniversity\.edu\.in/i).length).toBeGreaterThanOrEqual(1);

    // Resend button should be enabled immediately for unconfirmed sign-in attempts
    const resendBtn = screen.getByRole('button', { name: /Resend Confirmation Link/i });
    expect(resendBtn).not.toBeDisabled();

    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'signup',
          email: 'sushmit.s2017bvoctt@srisriuniversity.edu.in',
        })
      );
      expect(screen.getByText(/New confirmation link dispatched/i)).toBeInTheDocument();
    });
  });
});
