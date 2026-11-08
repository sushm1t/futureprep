// Attaches the signed-in user's access token to same-origin /api/* requests so
// the server can verify the caller. Installed once in the browser.
import { supabase } from '@/integrations/supabase/client';

let installed = false;

export async function getAuthHeader(fallbackEmail?: string): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
    if (data?.session?.access_token) {
      return `Bearer ${data.session.access_token}`;
    }
  } catch {}

  const email = fallbackEmail || (typeof window !== 'undefined' ? localStorage.getItem('jobstudio_user_email') : null);
  if (email && email.trim()) {
    const cleanId = email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return `Bearer user-${cleanId}`;
  }

  // Persistent visitor session token for guest, unconfirmed, or onboarding workflows
  if (typeof window !== 'undefined') {
    let localId = localStorage.getItem('jobstudio_local_id');
    if (!localId) {
      localId = `local-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('jobstudio_local_id', localId);
    }
    return `Bearer ${localId}`;
  }

  return null;
}

export function installApiAuth() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let isApi = false;
    try {
      const u = new URL(raw, window.location.origin);
      isApi = u.origin === window.location.origin && u.pathname.startsWith('/api/');
    } catch {}
    if (!isApi) return original(input, init);
    const authHeader = await getAuthHeader();
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (authHeader && !headers.has('Authorization')) {
      headers.set('Authorization', authHeader);
    }
    return original(input, { ...init, headers });
  };
}

export type PlanTier = 'free' | 'plus' | 'pro';

export interface EntitlementInfo {
  plan?: PlanTier;
  isPro: boolean;
  isPlus?: boolean;
  tailoredCount: number;
  limit?: number;
  freeLimit?: number;
  plusLimit?: number;
}

export async function fetchEntitlement(): Promise<EntitlementInfo | null> {
  try {
    const res = await fetch('/api/entitlement');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
