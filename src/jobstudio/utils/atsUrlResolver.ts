// ATS URL Auto-Resolver & Board Detector
// Inspired by Freehire's internal/ingest/boardresolve & atsboard
// Recognizes 10+ major ATS engines from raw vacancy links or careers page URLs

export interface ResolvedAtsBoard {
  ats:
    | 'greenhouse'
    | 'lever'
    | 'ashby'
    | 'workday'
    | 'smartrecruiters'
    | 'bamboohr'
    | 'personio'
    | 'teamtailor'
    | 'recruitee'
    | 'workable'
    | 'breezy'
    | 'custom';
  companySlug: string;
  jobId?: string;
  canonicalUrl: string;
  sourceLabel: string;
  isDirectBoard: boolean;
}

export function resolveAtsFromUrl(rawUrl: string): ResolvedAtsBoard | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // 1. Greenhouse
    if (host.includes('greenhouse.io')) {
      const match = pathname.match(/(?:embed\/job_board\/js\?for=)?\/?([^/?#]+)(?:\/jobs\/([0-9a-zA-Z_-]+))?/);
      if (match && match[1] && match[1] !== 'embed') {
        return {
          ats: 'greenhouse',
          companySlug: match[1],
          jobId: match[2],
          canonicalUrl: urlObj.origin + pathname,
          sourceLabel: 'Greenhouse ATS',
          isDirectBoard: true,
        };
      }
    }

    // Greenhouse embedded query param (e.g. company.com/careers?gh_jid=12345)
    if (urlObj.searchParams.has('gh_jid')) {
      const jid = urlObj.searchParams.get('gh_jid') || '';
      const domainCompany = host.replace(/^www\./, '').split('.')[0];
      return {
        ats: 'greenhouse',
        companySlug: domainCompany,
        jobId: jid,
        canonicalUrl: trimmed,
        sourceLabel: 'Greenhouse (Embedded)',
        isDirectBoard: false,
      };
    }

    // 2. Lever
    if (host.includes('jobs.lever.co')) {
      const match = pathname.match(/^\/([^/?#]+)(?:\/([0-9a-fA-F-]+))?/);
      if (match && match[1]) {
        return {
          ats: 'lever',
          companySlug: match[1],
          jobId: match[2],
          canonicalUrl: urlObj.origin + pathname,
          sourceLabel: 'Lever ATS',
          isDirectBoard: true,
        };
      }
    }

    // 3. Ashby
    if (host.includes('jobs.ashbyhq.com')) {
      const match = pathname.match(/^\/([^/?#]+)(?:\/([0-9a-fA-F-]+))?/);
      if (match && match[1]) {
        return {
          ats: 'ashby',
          companySlug: match[1],
          jobId: match[2],
          canonicalUrl: urlObj.origin + pathname,
          sourceLabel: 'Ashby ATS',
          isDirectBoard: true,
        };
      }
    }

    // 4. Workday
    if (host.includes('myworkdayjobs.com')) {
      const tenantMatch = host.match(/^([a-z0-9_-]+)\.(?:wd\d+\.)?myworkdayjobs\.com/i);
      const companySlug = tenantMatch ? tenantMatch[1] : host.split('.')[0];
      const jobMatch = pathname.match(/\/job\/([^/?#]+)/i);
      return {
        ats: 'workday',
        companySlug,
        jobId: jobMatch ? jobMatch[1] : undefined,
        canonicalUrl: urlObj.origin + pathname,
        sourceLabel: 'Workday HCM',
        isDirectBoard: true,
      };
    }

    // 5. SmartRecruiters
    if (host.includes('smartrecruiters.com')) {
      const match = pathname.match(/^\/([^/?#]+)(?:\/([0-9a-zA-Z_-]+))?/);
      if (match && match[1]) {
        return {
          ats: 'smartrecruiters',
          companySlug: match[1],
          jobId: match[2],
          canonicalUrl: urlObj.origin + pathname,
          sourceLabel: 'SmartRecruiters',
          isDirectBoard: true,
        };
      }
    }

    // 6. BambooHR
    if (host.includes('bamboohr.com')) {
      const companySlug = host.split('.')[0];
      const match = pathname.match(/\/jobs\/view\.php\?id=(\d+)/) || pathname.match(/\/careers\/(\d+)/);
      return {
        ats: 'bamboohr',
        companySlug,
        jobId: match ? match[1] : undefined,
        canonicalUrl: trimmed,
        sourceLabel: 'BambooHR',
        isDirectBoard: true,
      };
    }

    // 7. Personio
    if (host.includes('personio.de') || host.includes('personio.com')) {
      const companySlug = host.split('.')[0];
      const match = pathname.match(/\/job\/(\d+)/);
      return {
        ats: 'personio',
        companySlug,
        jobId: match ? match[1] : undefined,
        canonicalUrl: trimmed,
        sourceLabel: 'Personio',
        isDirectBoard: true,
      };
    }

    // 8. Teamtailor
    if (host.includes('teamtailor.com')) {
      const companySlug = host.split('.')[0];
      const match = pathname.match(/\/jobs\/(\d+)/);
      return {
        ats: 'teamtailor',
        companySlug,
        jobId: match ? match[1] : undefined,
        canonicalUrl: trimmed,
        sourceLabel: 'Teamtailor',
        isDirectBoard: true,
      };
    }

    // 9. Workable
    if (host.includes('apply.workable.com')) {
      const match = pathname.match(/^\/([^/?#]+)(?:\/j\/([0-9a-zA-Z_-]+))?/);
      if (match && match[1]) {
        return {
          ats: 'workable',
          companySlug: match[1],
          jobId: match[2],
          canonicalUrl: urlObj.origin + pathname,
          sourceLabel: 'Workable',
          isDirectBoard: true,
        };
      }
    }

    // 10. Generic Corporate Careers page
    const domainParts = host.replace(/^www\./, '').split('.');
    const company = domainParts[0] || 'Company';
    return {
      ats: 'custom',
      companySlug: company,
      canonicalUrl: trimmed,
      sourceLabel: 'Direct Corporate Career Site',
      isDirectBoard: false,
    };
  } catch {
    return null;
  }
}
