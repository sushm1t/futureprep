// Fake Freshness & True Age Sentinel
// Detects bumped posting dates on aged ATS requisitions (Workday, Greenhouse, Ashby, Taleo).
// Prevents candidates from wasting hours on dormant evergreen listings that appear "Posted 1 day ago".

export interface FreshnessSentinelReport {
  isBumped: boolean;
  freshnessCategory: 'genuinely_fresh' | 'normal_open' | 'bumped_repost' | 'dormant_requisition';
  estimatedDaysOpen: number;
  badgeLabel: string;
  badgeVariant: 'fresh' | 'neutral' | 'warning' | 'danger';
  diagnosticExplanation: string;
}

export function analyzeTrueRequisitionAge(job: {
  id?: string;
  title?: string;
  company?: string;
  publishedAt?: string;
  rawDescription?: string;
  applyUrl?: string;
}): FreshnessSentinelReport {
  const publishedDate = job.publishedAt ? new Date(job.publishedAt) : new Date();
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)));

  const textToScan = `${job.title || ''} ${job.rawDescription || ''} ${job.id || ''} ${job.applyUrl || ''}`.toLowerCase();

  // 1. Detect Stale Year Markers inside the job description
  const staleYearMatch = textToScan.match(/\b(2021|2022|2023)\b/);
  const hasStaleDeadline = /deadline.*202[1-3]|start date.*202[1-3]|internship.*202[1-3]|spring 202[1-3]|fall 202[1-3]/i.test(textToScan);

  // 2. Detect Requisition ID year encoding (e.g. req-22-xxxx, req-2023-xxxx, r-230xxx)
  const reqYearMatch = textToScan.match(/req[-_]?(202[1-3]|2[1-3])[-_]?\d+/i) || textToScan.match(/jr[-_]?(202[1-3]|2[1-3])\d+/i);

  // 3. Detect Evergreen Requisition Keywords
  const isEvergreen = /talent pool|pipeline requisition|general application|future opportunities|expression of interest/i.test(textToScan);

  // If claimed to be fresh (< 7 days) but contains ancient year markers or old requisition IDs:
  if (diffDays <= 14 && (Boolean(staleYearMatch) || Boolean(reqYearMatch) || hasStaleDeadline)) {
    const detectedYear = (reqYearMatch ? (reqYearMatch[1].length === 2 ? `20${reqYearMatch[1]}` : reqYearMatch[1]) : staleYearMatch?.[0]) || '2023';
    const estimatedAgedDays = Math.max(180, (now.getFullYear() - parseInt(detectedYear, 10)) * 365);

    return {
      isBumped: true,
      freshnessCategory: 'bumped_repost',
      estimatedDaysOpen: estimatedAgedDays,
      badgeLabel: `⚠️ Bumped Requisition (~${detectedYear})`,
      badgeVariant: 'warning',
      diagnosticExplanation: `Appears newly posted, but internal requisition code or text indicates this position was originally opened in ${detectedYear}. Often an automated repost for an evergreen pipeline rather than an urgent open headcount.`,
    };
  }

  // If open for > 90 days naturally:
  if (diffDays > 90 || isEvergreen) {
    return {
      isBumped: false,
      freshnessCategory: 'dormant_requisition',
      estimatedDaysOpen: diffDays || 120,
      badgeLabel: `⏳ Aged Requisition (${diffDays || 120}+ days)`,
      badgeVariant: 'danger',
      diagnosticExplanation: `Role has been listed for over 90 days without being filled. Higher risk of ghost requisition or low hiring velocity.`,
    };
  }

  // Normal open (< 30 days)
  if (diffDays <= 5) {
    return {
      isBumped: false,
      freshnessCategory: 'genuinely_fresh',
      estimatedDaysOpen: diffDays,
      badgeLabel: `⚡ Verified Fresh (${diffDays === 0 ? 'Today' : `${diffDays}d ago`})`,
      badgeVariant: 'fresh',
      diagnosticExplanation: `Requisition verified as newly published. Fast application yields peak recruiter visibility.`,
    };
  }

  return {
    isBumped: false,
    freshnessCategory: 'normal_open',
    estimatedDaysOpen: diffDays,
    badgeLabel: `Listed ${diffDays} days ago`,
    badgeVariant: 'neutral',
    diagnosticExplanation: `Standard active requisition timeline.`,
  };
}
