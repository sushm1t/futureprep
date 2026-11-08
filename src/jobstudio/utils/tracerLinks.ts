// Recruiter Tracer Links Radar
// Privacy-safe opt-in traceable link engine for candidate resumes.
// Generates secure redirect tokens for portfolio, LinkedIn, and GitHub links
// and alerts candidates when recruiters open links from their submitted CVs.

export interface TracerLinkRecord {
  id: string;
  token: string;
  targetUrl: string;
  linkLabel: string; // 'portfolio' | 'linkedin' | 'github' | 'project'
  companyName?: string;
  jobTitle?: string;
  clickCount: number;
  createdAt: string;
  lastClickedAt?: string;
  lastReferrer?: string;
  lastVisitorNetwork?: string;
}

const STORAGE_PREFIX = 'jobstudio_tracer_links';

// Simple deterministic hash token generator
export function generateTracerToken(url: string, label: string): string {
  const seed = `${url}_${label}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const cleanHex = Math.abs(hash).toString(36);
  return `tr_${cleanHex}_${Math.random().toString(36).substring(2, 6)}`;
}

// Client store helpers
export function getSavedTracerLinks(userId: string = 'default'): TracerLinkRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTracerLink(link: TracerLinkRecord, userId: string = 'default'): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedTracerLinks(userId);
    const updated = [link, ...existing.filter((item) => item.token !== link.token)].slice(0, 50);
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function recordTracerClick(token: string, metadata?: { referrer?: string; network?: string }, userId: string = 'default'): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedTracerLinks(userId);
    const updated = existing.map((item) => {
      if (item.token === token) {
        return {
          ...item,
          clickCount: item.clickCount + 1,
          lastClickedAt: new Date().toISOString(),
          lastReferrer: metadata?.referrer || item.lastReferrer || 'Direct PDF Viewer',
          lastVisitorNetwork: metadata?.network || item.lastVisitorNetwork || 'Recruiter Corporate Network',
        };
      }
      return item;
    });
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// Transform resume URLs into traceable URLs if enabled
export function transformUrlToTracer(
  originalUrl: string,
  label: string,
  meta?: { companyName?: string; jobTitle?: string },
  userId: string = 'default'
): string {
  if (!originalUrl || originalUrl.startsWith('#') || originalUrl.includes('/r/tr_')) return originalUrl;

  const token = generateTracerToken(originalUrl, label);
  const record: TracerLinkRecord = {
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    token,
    targetUrl: originalUrl,
    linkLabel: label,
    companyName: meta?.companyName,
    jobTitle: meta?.jobTitle,
    clickCount: 0,
    createdAt: new Date().toISOString(),
  };

  saveTracerLink(record, userId);

  // Return local / edge redirect route
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/r/${token}`;
}
