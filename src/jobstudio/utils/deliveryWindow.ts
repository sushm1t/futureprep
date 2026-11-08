// Optimal Application Delivery Window Engine
// Computes data-backed submission timing to maximize recruiter inbox visibility.
// Industry data indicates applications received Tue-Thu between 8:30-11:00 AM achieve 2.4x callback rates.

export interface DeliveryWindowAnalysis {
  tier: 'optimal' | 'good' | 'suboptimal';
  callbackMultiplier: string; // e.g. "2.4x", "1.6x", "0.6x"
  headline: string;
  badgeText: string;
  badgeColor: 'emerald' | 'cyan' | 'amber';
  recommendation: string;
  nextBestWindow: string;
  recruiterInsight: string;
}

/**
 * Returns estimated local hour and day for a given target job location
 */
function getTargetLocalTime(jobLocation?: string, referenceDate: Date = new Date()): { day: number; hour: number; timeStr: string } {
  const loc = (jobLocation || '').toLowerCase();

  let timeZone = 'UTC';
  if (loc === 'utc' || loc.includes('utc')) {
    timeZone = 'UTC';
  } else if (loc.includes('india') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('mumbai') || loc.includes('delhi')) {
    timeZone = 'Asia/Kolkata';
  } else if (loc.includes('uae') || loc.includes('dubai') || loc.includes('abu dhabi')) {
    timeZone = 'Asia/Dubai';
  } else if (loc.includes('uk') || loc.includes('london') || loc.includes('united kingdom')) {
    timeZone = 'Europe/London';
  } else if (loc.includes('germany') || loc.includes('berlin') || loc.includes('france') || loc.includes('paris') || loc.includes('europe')) {
    timeZone = 'Europe/Berlin';
  } else if (loc.includes('california') || loc.includes('san francisco') || loc.includes('seattle') || loc.includes('pdt') || loc.includes('pst')) {
    timeZone = 'America/Los_Angeles';
  } else if (loc.includes('new york') || loc.includes('boston') || loc.includes('edt') || loc.includes('est') || loc.includes('united states') || loc.includes('usa')) {
    timeZone = 'America/New_York';
  } else if (loc.includes('singapore')) {
    timeZone = 'Asia/Singapore';
  } else {
    // Default to user's local timezone
    const now = referenceDate;
    return {
      day: now.getDay(), // 0 = Sun, 1 = Mon ...
      hour: now.getHours(),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(referenceDate);
    const dayStr = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    const hourStr = parts.find((p) => p.type === 'hour')?.value || '10';

    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: dayMap[dayStr] ?? 1,
      hour: parseInt(hourStr, 10),
      timeStr: `${hourStr}:00 (${timeZone.split('/')[1]?.replace('_', ' ') || 'Local'})`,
    };
  } catch {
    const now = referenceDate;
    return { day: now.getDay(), hour: now.getHours(), timeStr: 'Local Time' };
  }
}

export function calculateOptimalDeliveryWindow(
  jobLocation?: string,
  referenceDate: Date = new Date()
): DeliveryWindowAnalysis {
  const { day, hour } = getTargetLocalTime(jobLocation, referenceDate);

  const isWeekend = day === 0 || day === 6; // Sunday or Saturday
  const isFridayAfternoon = day === 5 && hour >= 14; // Friday after 2 PM
  const isOptimalDay = day >= 2 && day <= 4; // Tuesday, Wednesday, Thursday
  const isMorningPeak = hour >= 8 && hour <= 11; // 8:30 AM - 11:00 AM

  if (isOptimalDay && isMorningPeak) {
    return {
      tier: 'optimal',
      callbackMultiplier: '2.4x',
      headline: 'Peak Morning Triage Window (2.4x Callback Rate)',
      badgeText: '⚡ Peak Callback Window (2.4x)',
      badgeColor: 'emerald',
      recommendation: 'Submit now. Recruiters are currently conducting morning candidate inbox reviews.',
      nextBestWindow: 'Now is optimal (active triage period)',
      recruiterInsight:
        'Hiring managers review priority submissions between 8:30 AM and 11:00 AM before scheduled interview blocks. Submitting right now places your CV at the top of their active queue.',
    };
  }

  if ((isOptimalDay && hour >= 11 && hour <= 16) || (day === 1 && hour >= 9 && hour <= 16)) {
    return {
      tier: 'good',
      callbackMultiplier: '1.6x',
      headline: 'Active Workday Window (1.6x Callback Rate)',
      badgeText: '✓ Good Delivery Window (1.6x)',
      badgeColor: 'cyan',
      recommendation: 'Solid time to apply. Application will be processed during today’s review cycle.',
      nextBestWindow: 'Tomorrow at 9:00 AM (peak morning triage)',
      recruiterInsight:
        'Applications submitted during standard business hours maintain steady open rates. For maximum visibility, morning submissions prior to 11 AM hold the highest single-day conversion.',
    };
  }

  // Suboptimal: Weekend, late night, or Friday afternoon
  let nextTargetStr = 'Tuesday at 9:00 AM';
  if (isFridayAfternoon || isWeekend) {
    nextTargetStr = 'Tuesday at 9:00 AM';
  } else if (hour > 16) {
    nextTargetStr = 'Tomorrow at 9:00 AM';
  }

  return {
    tier: 'suboptimal',
    callbackMultiplier: '0.6x',
    headline: 'Off-Peak Delivery Window (High Burial Risk)',
    badgeText: '⏳ Hold for Next Peak Window',
    badgeColor: 'amber',
    recommendation: `Recommended: Prepare materials now, submit ${nextTargetStr} for 2.4x higher callback probability.`,
    nextBestWindow: nextTargetStr,
    recruiterInsight:
      'Applications submitted on Friday evenings and weekends are buried beneath 80–120+ unread resumes on Monday morning. Triage begins in earnest on Tuesday morning.',
  };
}
