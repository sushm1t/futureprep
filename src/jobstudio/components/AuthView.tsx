// @ts-nocheck -- ported verbatim from the original project
import React, { useState, useEffect } from 'react';
import { BusyIndicator } from './BusyIndicator';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  RefreshCw,
  School,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { oauthReturnPath } from '@/lib/oauth-return-path';

interface AuthViewProps {
  onLogin: (name: string, email: string) => void;
  onNavigateToTab: (tab: string) => void;
  initialMode?: 'signin' | 'signup';
  next?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onNavigateToTab,
  initialMode = 'signup',
  next,
}) => {
  const returnPath = oauthReturnPath(next);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email confirmation delivery & institutional assistance
  const [confirmationPendingEmail, setConfirmationPendingEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cooldown timer for resend email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isInstitutionalEmail = (emailStr: string): boolean => {
    const clean = (emailStr || '').trim().toLowerCase();
    if (!clean.includes('@')) return false;
    const domain = clean.split('@')[1] || '';
    return (
      /\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2}|ernet\.in|res\.in)$/i.test(domain) ||
      domain.includes('university') ||
      domain.includes('college') ||
      domain.includes('campus') ||
      domain.includes('school') ||
      domain.includes('institute')
    );
  };

  const handleResendConfirmation = async (targetEmail?: string) => {
    const mailToUse = (targetEmail || confirmationPendingEmail || email).trim();
    if (!mailToUse) {
      setError('Please provide your email address to resend the confirmation link.');
      return;
    }
    if (resendCooldown > 0) return;

    setIsResending(true);
    setResendStatus(null);
    setError(null);

    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: mailToUse,
        options: {
          emailRedirectTo: new URL(returnPath, window.location.origin).href,
        },
      });

      if (resendErr) {
        if (/rate limit/i.test(resendErr.message)) {
          setResendStatus({
            type: 'error',
            text: 'Email rate limit reached for this project. Please wait a minute or use Continue with Google for instant access.',
          });
        } else {
          setResendStatus({
            type: 'error',
            text: resendErr.message || 'Could not resend email. Please verify your address.',
          });
        }
      } else {
        setResendStatus({
          type: 'success',
          text: `New confirmation link dispatched to ${mailToUse}! Please check your Inbox and Spam/Junk folder.`,
        });
        setResendCooldown(60);
      }
    } catch (err: any) {
      setResendStatus({
        type: 'error',
        text: err?.message || 'Failed to resend confirmation email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResendStatus(null);

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: new URL(returnPath, window.location.origin).href,
            data: { full_name: fullName.trim(), target_role: targetRole.trim() },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setConfirmationPendingEmail(email.trim());
          setResendCooldown(60);
          setMode('signin');
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      }
      setSuccessMessage('Signed in. Opening your workspace...');
      if (returnPath !== '/') { window.location.assign(returnPath); return; }
      setTimeout(() => onNavigateToTab('profile'), 600);
    } catch (err: any) {
      const rawMsg = err?.message || 'Something went wrong. Please try again.';
      if (/not confirmed/i.test(rawMsg)) {
        setConfirmationPendingEmail(email.trim());
        setError('Email not confirmed');
      } else if (/user already registered/i.test(rawMsg)) {
        setConfirmationPendingEmail(email.trim());
        setError('User already registered');
      } else {
        setError(rawMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    // Remember that the visitor came from the sign-in screen so the app can
    // open the workspace as soon as the OAuth redirect returns.
    if (returnPath === '/') {
      try { sessionStorage.setItem('jobstudio_auth_intent', 'workspace'); } catch { /* ignore */ }
    }
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: new URL(returnPath, window.location.origin).href });
    if (result.error) {
      try { sessionStorage.removeItem('jobstudio_auth_intent'); } catch { /* ignore */ }
      setError(result.error.message || 'Google sign-in failed.');
      return;
    }
    if (result.redirected) return;
    if (returnPath !== '/') { window.location.assign(returnPath); return; }
    onNavigateToTab('profile');
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-14 px-4 animate-fade-in text-foreground">
      <BusyIndicator active={isSubmitting} label={mode === 'signup' ? 'Creating your account' : 'Signing in'} />
      {/* Brand & Eyebrow */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wider uppercase font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>AUTONOMOUS CAREER WORKSPACE</span>
        </div>
        <h1
          className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          style={{ letterSpacing: '-0.03em' }}
        >
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {mode === 'signup'
            ? 'Sign up to build your Master Profile. Upload your resume PDF once to tailor it to any role you choose.'
            : 'Sign in to access your Master Profile, tailored resumes, and live ATS applications.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-3xl border border-border shadow-elevated p-6 sm:p-9 space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-surface rounded-full text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-center font-semibold ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-elevated'
                : 'text-subtle hover:text-foreground'
            }`}
          >
            Create Free Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-center font-semibold ${
              mode === 'signin'
                ? 'bg-card text-foreground shadow-elevated'
                : 'text-subtle hover:text-foreground'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Interactive Confirmation / Resend Assistant */}
        {confirmationPendingEmail && (
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-brand/30 shadow-elevated space-y-3.5 animate-fade-in text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">
                    Confirmation Link Sent
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand font-mono text-[10px] uppercase font-bold">
                    Action Required
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  We dispatched a verification link to <strong className="text-foreground font-mono">{confirmationPendingEmail}</strong>. Click the link in your email to activate your account.
                </p>
              </div>
            </div>

            {/* University / Institutional Domain Advisory */}
            {isInstitutionalEmail(confirmationPendingEmail) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-[11px] text-amber-200">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span>University / Institutional Email Notice</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed text-[10px] sm:text-[11px]">
                  Campus mail firewalls (such as <strong>@{confirmationPendingEmail.split('@')[1]}</strong>) frequently quarantine automated transactional messages. Please check your <strong>Spam / Junk</strong> folder or security quarantine portal.
                </p>
              </div>
            )}

            {/* Feedback from resending */}
            {resendStatus && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                resendStatus.type === 'success'
                  ? 'bg-success/10 border-success/25 text-success'
                  : resendStatus.type === 'error'
                  ? 'bg-danger/10 border-danger/25 text-danger'
                  : 'bg-surface border-border text-foreground'
              }`}>
                {resendStatus.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{resendStatus.text}</span>
              </div>
            )}

            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResendConfirmation(confirmationPendingEmail)}
                  disabled={isResending || resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface border border-border text-foreground font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {isResending
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend Link (${resendCooldown}s)`
                      : 'Resend Confirmation Link'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmationPendingEmail(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] text-subtle hover:text-foreground transition-colors cursor-pointer px-2 py-1"
                >
                  Dismiss
                </button>
              </div>

              {/* Instant Google OAuth Alternative */}
              <button
                type="button"
                onClick={handleGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-semibold text-xs transition-all cursor-pointer"
                title="Sign in with your Google account (institutional or personal) without waiting for email verification"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Continue with Google (Instant)</span>
              </button>
            </div>
          </div>
        )}

        {/* Other Notifications */}
        {error && error !== 'Email not confirmed' && (
          <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && !confirmationPendingEmail && (
          <div className="p-3.5 rounded-2xl bg-success/10 border border-success/20 text-xs text-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-subtle"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-subtle"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-subtle"
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand" />
                <span>Target Role / Headline (Optional)</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Operations Specialist, Staff Engineer, Product Manager"
                className="w-full px-4 py-3 bg-surface border border-transparent focus:border-brand focus:bg-card rounded-2xl text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-subtle"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:opacity-60 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-elevated transition-all cursor-pointer flex items-center justify-center gap-2 group text-xs sm:text-sm mt-3"
          >
            <span>
              {isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create Account & Build Master Profile' : 'Sign In to Workspace'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-3 border-t border-border text-center space-y-2">
            <span className="text-[11px] text-subtle">or</span>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3 bg-surface hover:bg-surface-2 text-foreground font-medium rounded-full transition-all cursor-pointer border border-border flex items-center justify-center gap-2 text-xs group shadow-sm hover:border-brand/40"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-semibold">Continue with Google</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-brand/10 text-brand font-mono font-medium">
                ⚡ Instant • No wait
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground/80">
              Recommended for university &amp; corporate accounts to bypass SMTP spam filters
            </p>
          </div>
        </form>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="space-y-1 p-3 rounded-2xl bg-surface/80">
            <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Private &amp; Secure</span>
            </div>
            <p className="text-[10px] text-subtle leading-tight">
              Your master career data is private, encrypted, and isolated to your account.
            </p>
          </div>

          <div className="space-y-1 p-3 rounded-2xl bg-surface/80">
            <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand" />
              <span>PDF Auto-Extract</span>
            </div>
            <p className="text-[10px] text-subtle leading-tight">
              Upload your PDF resume once to populate experiences and skills.
            </p>
          </div>

          <div className="space-y-1 p-3 rounded-2xl bg-surface/80">
            <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Instant Tailoring</span>
            </div>
            <p className="text-[10px] text-subtle leading-tight">
              Tailor ATS-friendly resumes to live job posts in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

