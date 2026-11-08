// Recruiter 6-Second Roast Engine
// Evaluates resumes against real recruiter eye-tracking patterns (Ladders / eye-tracking research).
// Measures Signal-to-Fluff scoring and generates unvarnished, high-impact critique.

import { TailoredResumeData } from '../data/defaultData';

export interface RecruiterRoastAnalysis {
  signalToFluffScore: number; // 0 - 100
  verdict: 'Elite (Top 5%)' | 'Solid Contender' | 'Fluff Heavy' | 'Instant Rejection Risk';
  verdictBadgeColor: 'emerald' | 'cyan' | 'amber' | 'rose';
  eyeTrackingScanSummary: {
    anchor1Title: string;
    anchor2FirstImpression: string;
    anchor3TechStackReadout: string;
  };
  fluffWordsDetected: string[];
  metricCount: number;
  unvarnishedRoast: string[];
  actionableUpgrades: {
    fluffPhrase: string;
    highSignalReplacement: string;
    rationale: string;
  }[];
}

const COMMON_FLUFF_PATTERNS = [
  'results-oriented',
  'results driven',
  'hard-working',
  'hard worker',
  'passionate',
  'team player',
  'go-getter',
  'spearheaded',
  'synergy',
  'detail-oriented',
  'proven track record',
  'out of the box',
  'strategic thinker',
  'self-starter',
  'thought leader',
  'dynamic professional',
  'strong work ethic',
  'responsible for',
  'assisted with',
  'worked on',
  'participated in',
];

export function generateRecruiterRoast(
  resume: TailoredResumeData,
  targetRole: string = 'Target Role'
): RecruiterRoastAnalysis {
  const allText = [
    resume.tailored_summary,
    ...(resume.experiences || []).flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...(resume.skills || []),
  ].join(' ').toLowerCase();

  // 1. Detect Fluff Words
  const foundFluff: string[] = [];
  for (const fluff of COMMON_FLUFF_PATTERNS) {
    if (allText.includes(fluff)) {
      foundFluff.push(fluff);
    }
  }

  // 2. Count Quantified Metrics ($, %, numbers + metric words)
  const metricMatches = allText.match(/\b\d+(\.\d+)?(%|\$|k|m|b|\+)?\b/gi) || [];
  const metricCount = metricMatches.length;

  // 3. Compute Signal-to-Fluff Ratio
  // Healthy baseline: high metrics + low fluff
  const baseSignal = Math.min(100, Math.max(20, (metricCount * 5) - (foundFluff.length * 8) + 50));
  const signalToFluffScore = Math.round(baseSignal);

  let verdict: RecruiterRoastAnalysis['verdict'] = 'Solid Contender';
  let verdictBadgeColor: RecruiterRoastAnalysis['verdictBadgeColor'] = 'cyan';

  if (signalToFluffScore >= 85) {
    verdict = 'Elite (Top 5%)';
    verdictBadgeColor = 'emerald';
  } else if (signalToFluffScore >= 65) {
    verdict = 'Solid Contender';
    verdictBadgeColor = 'cyan';
  } else if (signalToFluffScore >= 45) {
    verdict = 'Fluff Heavy';
    verdictBadgeColor = 'amber';
  } else {
    verdict = 'Instant Rejection Risk';
    verdictBadgeColor = 'rose';
  }

  // 4. Eye-Tracking Anchors
  const firstExp = resume.experiences?.[0];
  const eyeTrackingScanSummary = {
    anchor1Title: `${firstExp?.role || 'Current Title'} at ${firstExp?.company || 'Company'} (${firstExp?.period || 'Present'})`,
    anchor2FirstImpression: firstExp?.bullets?.[0]
      ? `"${firstExp.bullets[0].slice(0, 110)}..."`
      : 'No leading bullet found in first position.',
    anchor3TechStackReadout: (resume.skills || []).slice(0, 6).join(', ') || 'General competencies',
  };

  // 5. Unvarnished Recruiter Roast Comments
  const unvarnishedRoast: string[] = [];

  if (foundFluff.length > 0) {
    unvarnishedRoast.push(
      `Your CV contains phrases like "${foundFluff.slice(0, 2).join('", "')}". Recruiters read 50 resumes an hour; generic buzzwords trigger immediate eye-glaze. Delete them and state what you shipped.`
    );
  }

  if (metricCount < 4) {
    unvarnishedRoast.push(
      `Scarcity of hard numbers: You only have ${metricCount} quantified metrics across your work history. Did your projects save hours, reduce budget, or increase throughput? If it didn't have numbers, recruiters assume it wasn't impactful.`
    );
  } else {
    unvarnishedRoast.push(
      `Strong metric density: Found ${metricCount} quantified metrics ($/%/scale). This immediately grounds your seniority and proves measurable ROI.`
    );
  }

  if (resume.tailored_summary && resume.tailored_summary.length > 350) {
    unvarnishedRoast.push(
      `Your professional summary is a wall of text (${resume.tailored_summary.length} characters). In the 6-second scan, long paragraphs are skipped entirely. Cut to 2 punchy lines.`
    );
  } else {
    unvarnishedRoast.push(
      `Lean summary layout: concise enough to survive the initial 6-second recruiter triage.`
    );
  }

  // 6. Actionable Upgrades
  const actionableUpgrades: RecruiterRoastAnalysis['actionableUpgrades'] = [];

  if (allText.includes('responsible for')) {
    actionableUpgrades.push({
      fluffPhrase: 'Responsible for managing day-to-day operations and team tasks',
      highSignalReplacement: 'Spearheaded end-to-end delivery of core operational workflows, improving SLA adherence by 24%',
      rationale: '"Responsible for" describes a job description, not an accomplishment. Own the outcome.',
    });
  }

  if (allText.includes('team player') || allText.includes('results-oriented')) {
    actionableUpgrades.push({
      fluffPhrase: 'Results-oriented team player with strong communication',
      highSignalReplacement: 'Coordinated cross-functional stakeholder communication across 8 key partners, accelerating resolution cycles by 25%',
      rationale: 'Demonstrate communication through cross-functional speed and stakeholder coordination.',
    });
  }

  if (actionableUpgrades.length === 0) {
    actionableUpgrades.push({
      fluffPhrase: 'General duties and day-to-day contributions',
      highSignalReplacement: 'Delivered measurable operational enhancements and high-impact resolutions, achieving 98%+ SLA performance',
      rationale: 'Always lead with recognized power action verbs and quantified impact metrics.',
    });
  }

  return {
    signalToFluffScore,
    verdict,
    verdictBadgeColor,
    eyeTrackingScanSummary,
    fluffWordsDetected: foundFluff,
    metricCount,
    unvarnishedRoast,
    actionableUpgrades,
  };
}
