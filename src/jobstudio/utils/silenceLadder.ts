// Silence Ladder & Strategic Follow-Up Copilot
// Inspired by Freehire's internal/job/silence & internal/engage/nudge
// Guides candidates when to follow up and generates tactical outreach battlecards.

export type SilenceStatus = 'active' | 'warning' | 'silence_exceeded';

export interface SilenceEvaluation {
  status: SilenceStatus;
  daysQuiet: number;
  stageThresholdDays: number;
  badgeLabel: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  isFollowUpRecommended: boolean;
}

const STAGE_SILENCE_THRESHOLDS: Record<string, { warningDays: number; overdueDays: number }> = {
  Applied: { warningDays: 5, overdueDays: 10 },
  'Under Review': { warningDays: 5, overdueDays: 10 },
  Interviewing: { warningDays: 4, overdueDays: 7 },
  'Offer Received': { warningDays: 3, overdueDays: 5 },
  Rejected: { warningDays: 999, overdueDays: 999 },
  Archived: { warningDays: 999, overdueDays: 999 },
};

export function evaluateApplicationSilence(
  appliedDateStr?: string,
  lastInteractionDateStr?: string,
  currentStage: string = 'Applied'
): SilenceEvaluation {
  const referenceDateStr = lastInteractionDateStr || appliedDateStr;
  if (!referenceDateStr) {
    return {
      status: 'active',
      daysQuiet: 0,
      stageThresholdDays: 14,
      badgeLabel: 'Active Pipeline',
      badgeColor: 'emerald',
      isFollowUpRecommended: false,
    };
  }

  const refDate = new Date(referenceDateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - refDate.getTime());
  const daysQuiet = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const thresholds = STAGE_SILENCE_THRESHOLDS[currentStage] || { warningDays: 7, overdueDays: 14 };

  if (currentStage === 'Rejected' || currentStage === 'Archived') {
    return {
      status: 'active',
      daysQuiet,
      stageThresholdDays: 999,
      badgeLabel: 'Settled',
      badgeColor: 'emerald',
      isFollowUpRecommended: false,
    };
  }

  if (daysQuiet >= thresholds.overdueDays) {
    return {
      status: 'silence_exceeded',
      daysQuiet,
      stageThresholdDays: thresholds.overdueDays,
      badgeLabel: `⚡ Follow-Up Due (${daysQuiet}d quiet)`,
      badgeColor: 'amber',
      isFollowUpRecommended: true,
    };
  }

  if (daysQuiet >= thresholds.warningDays) {
    return {
      status: 'warning',
      daysQuiet,
      stageThresholdDays: thresholds.warningDays,
      badgeLabel: `Waiting Response (${daysQuiet}d)`,
      badgeColor: 'amber',
      isFollowUpRecommended: true,
    };
  }

  return {
    status: 'active',
    daysQuiet,
    stageThresholdDays: thresholds.overdueDays,
    badgeLabel: `Active (${daysQuiet}d)`,
    badgeColor: 'emerald',
    isFollowUpRecommended: false,
  };
}

export type FollowUpAngle = 'polite_checkin' | 'value_add' | 'competing_deadline';

export interface FollowUpTemplate {
  angle: FollowUpAngle;
  title: string;
  subtitle: string;
  subject: string;
  body: string;
}

export function generateFollowUpTemplates(params: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  daysQuiet: number;
  stage: string;
}): FollowUpTemplate[] {
  const { candidateName = 'Applicant', companyName = 'the team', jobTitle = 'the role', daysQuiet = 7 } = params;

  return [
    {
      angle: 'polite_checkin',
      title: 'Polite Status Check & Continued Excitement',
      subtitle: 'Low-pressure, high-warmth check-in that surfaces your enthusiasm',
      subject: `Following up on application for ${jobTitle} – ${candidateName}`,
      body: `Hi ${companyName} Recruiting Team,

I hope you're having a productive week!

I wanted to follow up briefly regarding my recent application for the ${jobTitle} position submitted about ${daysQuiet} days ago. 

I remain very excited about ${companyName}'s mission and feel my background aligns closely with the team's goals. I would welcome the opportunity to connect and discuss how my experience can deliver immediate value.

Please let me know if there are any additional materials or details I can provide to assist in your review. Thank you for your time and consideration!

Warm regards,
${candidateName}`,
    },
    {
      angle: 'value_add',
      title: 'Value-Add Project / Metric Update',
      subtitle: 'Shares a relevant milestone or portfolio artifact to re-hook recruiter attention',
      subject: `Quick update regarding ${jobTitle} – ${candidateName}`,
      body: `Hi ${companyName} Team,

I hope all is well!

Since submitting my application for ${jobTitle}, I recently completed an initiative directly relevant to the challenges ${companyName} is tackling. Specifically, I led a project that improved key operational metrics and automated workflows to increase throughput.

I wanted to share this relevant data point as it highlights how I would approach scaling ${jobTitle} at ${companyName}.

I'm eager to connect whenever the team is ready for the next round of discussions. Thanks again for your time!

Best regards,
${candidateName}`,
    },
    {
      angle: 'competing_deadline',
      title: 'Decision Timeline & Priority Consideration',
      subtitle: 'Diplomatically signals momentum with other processes without sounding aggressive',
      subject: `Timeline update on ${jobTitle} interview process – ${candidateName}`,
      body: `Hi ${companyName} Recruiting Team,

I hope you're having a great week!

I'm writing to share a quick scheduling update regarding my candidacy for the ${jobTitle} role. I'm currently advancing to late-stage discussions with another organization, but because ${companyName} remains my top choice, I wanted to check in on your timeline before making any commitments.

I'd love to connect for the next stage if there is mutual alignment on moving forward. Please let me know what works best for your calendar.

Thank you very much,
${candidateName}`,
    },
  ];
}
