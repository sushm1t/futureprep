// Recruiter Email Classifier & Kanban Auto-Advance Engine
// Deterministically classifies inbound recruiter correspondence to automatically
// advance application board cards, eliminate manual status updates, and recommend next actions.

export type EmailSignalType =
  | 'acknowledgement'
  | 'screening'
  | 'interview_invitation'
  | 'assessment'
  | 'offer'
  | 'rejection'
  | 'info_request'
  | 'other';

export interface EmailClassificationResult {
  signal: EmailSignalType;
  label: string;
  badgeColor: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';
  recommendedStage: 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Archived';
  detectedCompany?: string;
  schedulingLink?: string;
  actionableSummary: string;
  suggestedAction: string;
  confidence: number;
}

export function classifyRecruiterEmail(emailText: string, subjectLine: string = ''): EmailClassificationResult {
  const combined = `${subjectLine}\n${emailText}`.toLowerCase();

  // 1. Check Offer
  if (
    /pleased\s+to\s+offer|congratulations.*offer|offer\s+of\s+employment|official\s+offer\s+letter|formal\s+offer|compensation\s+package/i.test(combined)
  ) {
    return {
      signal: 'offer',
      label: 'Formal Job Offer Received! 🎉',
      badgeColor: 'emerald',
      recommendedStage: 'Offer',
      actionableSummary: 'Official offer letter or compensation package extended by employer.',
      suggestedAction: 'Review compensation package and prepare strategic salary negotiation battlecards.',
      confidence: 96,
    };
  }

  // 2. Check Interview Invitation
  if (
    /interview\s+invitation|invite\s+you\s+to\s+interview|schedule\s+your\s+interview|round\s+(?:1|2|3|one|two)|technical\s+interview|panel\s+interview|virtual\s+onsite/i.test(combined)
  ) {
    // Extract scheduling link if present
    const linkMatch = emailText.match(/https?:\/\/(?:calendly\.com|goodtime\.io|greenhouse\.io|lever\.co)[^\s"'>]+/i);
    return {
      signal: 'interview_invitation',
      label: 'Interview Round Invitation',
      badgeColor: 'purple',
      recommendedStage: 'Interviewing',
      schedulingLink: linkMatch ? linkMatch[0] : undefined,
      actionableSummary: 'Candidate invited to formal interview stage or technical panel.',
      suggestedAction: 'Pick interview slot immediately and run targeted behavioral STAR preparation.',
      confidence: 94,
    };
  }

  // 3. Check Assessment / Coding Challenge
  if (
    /coding\s+challenge|online\s+assessment|hackerrank|codesignal|codility|take-?home\s+(?:task|project|assignment)/i.test(combined)
  ) {
    return {
      signal: 'assessment',
      label: 'Technical Assessment / Take-Home',
      badgeColor: 'blue',
      recommendedStage: 'Interviewing',
      actionableSummary: 'Take-home assignment or timed coding assessment requested.',
      suggestedAction: 'Review problem domains and allocate focused time block to complete test.',
      confidence: 92,
    };
  }

  // 4. Check Recruiter Screen
  if (
    /phone\s+screen|introductory\s+call|quick\s+chat|connect\s+for\s+15-?20\s+minutes|talent\s+acquisition.*chat|chat\s+about\s+your\s+background/i.test(combined)
  ) {
    const linkMatch = emailText.match(/https?:\/\/(?:calendly\.com|goodtime\.io)[^\s"'>]+/i);
    return {
      signal: 'screening',
      label: 'Recruiter Screening Call',
      badgeColor: 'blue',
      recommendedStage: 'Screening',
      schedulingLink: linkMatch ? linkMatch[0] : undefined,
      actionableSummary: 'Recruiter requested initial background & fit exploratory screen.',
      suggestedAction: 'Confirm call time and review elevator pitch and salary expectations.',
      confidence: 90,
    };
  }

  // 5. Check Rejection
  if (
    /unfortunately|after\s+careful\s+consideration|decided\s+to\s+pursue\s+other|not\s+moving\s+forward|filled\s+with\s+another\s+candidate|keep\s+your\s+resume\s+on\s+file|wish\s+you\s+the\s+best\s+in\s+your\s+search/i.test(combined)
  ) {
    return {
      signal: 'rejection',
      label: 'Application Not Moving Forward',
      badgeColor: 'rose',
      recommendedStage: 'Archived',
      actionableSummary: 'Standard non-advancement notice received from hiring team.',
      suggestedAction: 'Archive application to keep pipeline focused on active opportunities.',
      confidence: 95,
    };
  }

  // 6. Check Acknowledgement
  if (
    /thank\s+you\s+for\s+applying|received\s+your\s+application|application\s+received|confirming\s+receipt/i.test(combined)
  ) {
    return {
      signal: 'acknowledgement',
      label: 'Application Acknowledged',
      badgeColor: 'slate',
      recommendedStage: 'Applied',
      actionableSummary: 'Automated confirmation that application successfully landed in ATS.',
      suggestedAction: 'Allow 5-7 business days for screening review; explore warm referrals.',
      confidence: 88,
    };
  }

  // 7. Check Info Request
  if (
    /please\s+(?:provide|send|confirm)\s+your|availability\s+for|portfolio\s+link|reference\s+check/i.test(combined)
  ) {
    return {
      signal: 'info_request',
      label: 'Additional Information Requested',
      badgeColor: 'amber',
      recommendedStage: 'Screening',
      actionableSummary: 'Recruiter requested follow-up clarification, portfolio, or references.',
      suggestedAction: 'Reply promptly within 24 hours to maintain candidate velocity.',
      confidence: 85,
    };
  }

  return {
    signal: 'other',
    label: 'General Correspondence',
    badgeColor: 'slate',
    recommendedStage: 'Applied',
    actionableSummary: 'Unclassified correspondence from hiring team or automated mailer.',
    suggestedAction: 'Review message contents manually to determine required next step.',
    confidence: 60,
  };
}
