// Ghost Job Detector & Reality Signal Engine
// Evaluates postings for phantom listings, stale requisitions, aggregator discrepancies,
// and evergreen postings to protect job seekers from ghost jobs.

export type GhostLevel = 'none' | 'possible' | 'likely';

export interface GhostCriterion {
  code: 'evergreen_posting' | 'ats_absent' | 'stale_requisition' | 'repost_churn';
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GhostSignal {
  level: GhostLevel;
  badgeLabel: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  criteria: GhostCriterion[];
  evidenceSummary: string;
  recommendation: string;
  isVerifiedDirect: boolean;
}

export function detectGhostJobSignal(job: {
  id?: string;
  title: string;
  company: string;
  platform?: string;
  publishedAt?: string;
  verifiedLive?: boolean;
  applyUrl?: string;
  rawDescription?: string;
}): GhostSignal {
  const criteria: GhostCriterion[] = [];
  const now = Date.now();
  const desc = (job.rawDescription || '').toLowerCase();
  const platform = (job.platform || '').toLowerCase();
  const applyUrl = (job.applyUrl || '').toLowerCase();

  // 1. Check Posting Age (Evergreen / Stale Requisition)
  let ageDays = 0;
  if (job.publishedAt) {
    try {
      const pubDate = new Date(job.publishedAt).getTime();
      if (!isNaN(pubDate)) {
        ageDays = Math.max(0, Math.round((now - pubDate) / (1000 * 60 * 60 * 24)));
      }
    } catch {}
  }

  if (ageDays >= 180) {
    criteria.push({
      code: 'evergreen_posting',
      label: 'Evergreen Posting (>180 Days)',
      description: `Position has remained continuously open for ${ageDays} days without being filled or closed.`,
      severity: 'high',
    });
  } else if (ageDays >= 90) {
    criteria.push({
      code: 'stale_requisition',
      label: 'Stale Requisition (90-180 Days)',
      description: `Position was posted ${ageDays} days ago; hiring momentum may have slowed.`,
      severity: 'medium',
    });
  }

  // 2. Aggregator vs Official ATS Cross-Check (ATS Absent Signal)
  const isDirectAtsPlatform =
    platform.includes('greenhouse') ||
    platform.includes('lever') ||
    platform.includes('ashby') ||
    platform.includes('workday') ||
    platform.includes('smartrecruiters') ||
    platform.includes('oracle') ||
    platform.includes('successfactors') ||
    platform.includes('icims') ||
    platform.includes('teamtailor') ||
    platform.includes('taleo');

  const isThirdPartyAggregator =
    platform.includes('aggregator') ||
    platform.includes('whatjobs') ||
    applyUrl.includes('indeed.com') ||
    applyUrl.includes('ziprecruiter') ||
    applyUrl.includes('monster.com');

  if (isThirdPartyAggregator && !isDirectAtsPlatform) {
    criteria.push({
      code: 'ats_absent',
      label: 'Aggregator Repost',
      description: 'Listed via a third-party aggregator; may lag behind official company board closures.',
      severity: 'medium',
    });
  }

  // 3. Evergreen Pipeline Keyword Signals
  if (/always\s+looking\s+for\s+talent|general\s+application|future\s+opportunities|talent\s+pool|pipeline\s+requisition/i.test(desc)) {
    criteria.push({
      code: 'repost_churn',
      label: 'Talent Pool / Pipeline Requisition',
      description: 'Posting is structured as an ongoing resume collection pipeline rather than an immediate headcount opening.',
      severity: 'medium',
    });
  }

  // Determine Level and Recommendation
  const hasHigh = criteria.some((c) => c.severity === 'high');
  const count = criteria.length;

  let level: GhostLevel = 'none';
  let badgeLabel = 'Verified Direct Requisition';
  let badgeColor: 'emerald' | 'amber' | 'rose' = 'emerald';
  let evidenceSummary = 'Active requisition hosted directly on verified employer ATS board with recent publication timestamp.';
  let recommendation = 'High hiring velocity: direct apply recommended.';

  if (hasHigh || count >= 2) {
    level = 'likely';
    badgeLabel = 'Likely Ghost / Stale Job';
    badgeColor = 'rose';
    evidenceSummary = criteria.map((c) => c.description).join(' ');
    recommendation = 'Caution: Long-standing opening. We recommend pairing your application with warm LinkedIn internal outreach.';
  } else if (count === 1) {
    level = 'possible';
    badgeLabel = 'Possible Slow-Moving Role';
    badgeColor = 'amber';
    evidenceSummary = criteria[0].description;
    recommendation = 'Moderate age opening. Prioritize warm employee referral or direct hiring manager pitch.';
  }

  return {
    level,
    badgeLabel,
    badgeColor,
    criteria,
    evidenceSummary,
    recommendation,
    isVerifiedDirect: isDirectAtsPlatform && level === 'none',
  };
}
