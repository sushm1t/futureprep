// Deterministic Hard-Constraint Blocker Engine
// Evaluates strict requirements (Work Auth, Experience Floor, Degree, Certifications, Language, Location/Work Mode)
// and calculates mathematically enforced score ceilings to eliminate AI match hallucinations.

export type BlockerCategory =
  | 'work_auth'
  | 'certification'
  | 'education'
  | 'experience_years'
  | 'language'
  | 'location_workmode';

export type BlockerSeverity = 'hard' | 'medium' | 'soft';

export interface BlockerRule {
  severity: BlockerSeverity;
  scoreCap: number; // Highest match score permitted if this blocker is unmet
}

export const BLOCKER_RULES: Record<BlockerCategory, BlockerRule> = {
  work_auth: { severity: 'hard', scoreCap: 50 },
  certification: { severity: 'hard', scoreCap: 60 },
  education: { severity: 'medium', scoreCap: 65 },
  experience_years: { severity: 'medium', scoreCap: 65 },
  language: { severity: 'soft', scoreCap: 70 },
  location_workmode: { severity: 'soft', scoreCap: 75 },
};

export interface HardConstraintItem {
  id: string;
  category: BlockerCategory;
  title: string;
  requirement: string;
  candidateEvidence: string;
  isMet: boolean;
  severity: BlockerSeverity;
  scoreCap: number;
  explanation: string;
}

export interface HardConstraintReport {
  overallEligible: boolean;
  scoreCeiling: number; // Lowest scoreCap among unmet blockers (or 100 if none)
  totalEvaluated: number;
  unmetCount: number;
  items: HardConstraintItem[];
  criticalBlocker?: HardConstraintItem;
}

// Helper: estimate total years of experience from profile or text
export function extractCandidateTotalYears(profileText: string): number {
  if (!profileText) return 0;
  // Look for explicit mentions: "X years of experience", "X+ years", "X yrs"
  const m = profileText.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|working|in\b)/i);
  if (m) {
    const y = parseInt(m[1], 10);
    if (y > 0 && y <= 40) return y;
  }
  // Count distinct date ranges e.g. 2018 - 2022
  const yearsFound = Array.from(profileText.matchAll(/\b(20[0-2][0-9]|199[0-9])\b/g)).map((match) =>
    parseInt(match[1], 10)
  );
  if (yearsFound.length >= 2) {
    const minYear = Math.min(...yearsFound);
    const maxYear = Math.max(...yearsFound, new Date().getFullYear());
    const span = maxYear - minYear;
    if (span >= 1 && span <= 35) return span;
  }
  return 3; // sensible default
}

// Helper: extract minimum required years from JD
export function extractRequiredYearsFromJD(text: string): number | null {
  if (!text) return null;
  const m = text.match(/(\d{1,2})\+?\s*(?:-\s*\d{1,2})?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|relevant\s+experience|track\s+record|in\b)/i);
  if (m) {
    const y = parseInt(m[1], 10);
    if (y > 0 && y <= 20) return y;
  }
  return null;
}

// Helper: check if education degree is optional in JD
export function isDegreeOptionalInJD(text: string): boolean {
  if (!text) return false;
  return /or\s+equivalent\s+(?:practical\s+)?experience|degree\s+optional|no\s+degree\s+required|equivalent\s+(?:work\s+)?experience/i.test(text);
}

export function evaluateHardConstraints(
  job: {
    title: string;
    company: string;
    location?: string;
    rawDescription?: string;
    descriptionSnippet?: string;
    workplaceType?: string;
  },
  candidate: {
    masterProfileText?: string;
    location?: string;
    certifications?: string[];
    educationDegrees?: string[];
  }
): HardConstraintReport {
  const jdText = `${job.title} ${job.company} ${job.location || ''} ${job.descriptionSnippet || ''} ${job.rawDescription || ''}`.toLowerCase();
  const profileText = (candidate.masterProfileText || '').toLowerCase();
  const candidateLoc = (candidate.location || '').toLowerCase();
  const items: HardConstraintItem[] = [];

  // 1. Work Authorization & Sponsorship Constraint
  const requiresCitizenshipOrNoSponsorship =
    /us\s+citizen|u\.s\.\s+citizen|security\s+clearance|must\s+be\s+a\s+citizen|no\s+visa\s+sponsorship|unable\s+to\s+sponsor|cannot\s+sponsor\s+visas?|lawful\s+permanent\s+resident/i.test(jdText);

  if (requiresCitizenshipOrNoSponsorship) {
    // Check if candidate matches US/Citizen context or has domestic presence
    const candidateHasUSPresence =
      candidateLoc.includes('united states') ||
      candidateLoc.includes('usa') ||
      candidateLoc === 'us' ||
      /us\s+citizen|permanent\s+resident|green\s+card|authorized\s+to\s+work\s+in\s+the\s+u/i.test(profileText);

    const isJobUS = /united states|usa|\bus\b|san francisco|new york|austin|seattle|chicago|remote us/i.test(job.location || '') || jdText.includes('united states');

    if (isJobUS && !candidateHasUSPresence && candidateLoc && !candidateLoc.includes('united states')) {
      items.push({
        id: 'work_auth',
        category: 'work_auth',
        title: 'Work Authorization & Clearance',
        requirement: 'Position mandates existing US work authorization or security clearance; no visa sponsorship provided.',
        candidateEvidence: candidate.location ? `Candidate located in: ${candidate.location}` : 'No domestic work authorization verified in profile.',
        isMet: false,
        severity: BLOCKER_RULES.work_auth.severity,
        scoreCap: BLOCKER_RULES.work_auth.scoreCap,
        explanation: 'Applying without authorized status risks immediate ATS automated rejection.',
      });
    } else {
      items.push({
        id: 'work_auth',
        category: 'work_auth',
        title: 'Work Authorization & Clearance',
        requirement: 'Position mandates valid regional work authorization.',
        candidateEvidence: candidate.location ? `Matching location context: ${candidate.location}` : 'Eligible authorization profile.',
        isMet: true,
        severity: BLOCKER_RULES.work_auth.severity,
        scoreCap: BLOCKER_RULES.work_auth.scoreCap,
        explanation: 'Work authorization criteria satisfied based on profile location context.',
      });
    }
  }

  // 2. Experience Minimum Years Floor Constraint
  const reqYears = extractRequiredYearsFromJD(jdText);
  if (reqYears && reqYears >= 2) {
    const candYears = extractCandidateTotalYears(candidate.masterProfileText || '');
    const isMet = candYears >= reqYears;

    items.push({
      id: 'experience_years',
      category: 'experience_years',
      title: 'Experience Minimum Floor',
      requirement: `Requires minimum ${reqYears}+ years of documented professional experience.`,
      candidateEvidence: `Profile demonstrates approximately ${candYears} years of cumulative experience.`,
      isMet,
      severity: BLOCKER_RULES.experience_years.severity,
      scoreCap: BLOCKER_RULES.experience_years.scoreCap,
      explanation: isMet
        ? `Surpasses experience floor (${candYears} yrs $\\ge$ ${reqYears} yrs requirement).`
        : `Below requested minimum floor (${candYears} yrs vs ${reqYears} yrs required). Match capped at ${BLOCKER_RULES.experience_years.scoreCap}%.`,
    });
  }

  // 3. Education / Degree Level Constraint
  const mentionsDegree = /\b(bachelor'?s?|master'?s?|ph\.?d|doctorate|degree\s+in\s+computer|b\.s\.|m\.s\.)\b/i.test(jdText);
  if (mentionsDegree) {
    const degreeOptional = isDegreeOptionalInJD(jdText);
    const candidateHasDegree =
      Boolean(candidate.educationDegrees && candidate.educationDegrees.length > 0) ||
      /\b(bachelor|master|phd|b\.s\.|m\.s\.|b\.tech|b\.e\.|m\.tech|degree|university|college|institute\s+of\s+technology)\b/i.test(profileText);

    const isMet = candidateHasDegree || degreeOptional;

    items.push({
      id: 'education',
      category: 'education',
      title: 'Education Degree Requirement',
      requirement: degreeOptional
        ? 'University degree requested or equivalent practical career experience.'
        : 'Bachelor’s or Master’s degree in related technical/business discipline.',
      candidateEvidence: candidateHasDegree
        ? 'Documented university degree credentials in candidate profile.'
        : degreeOptional
        ? 'Degree bypassed: posting accepts equivalent practical career experience.'
        : 'No university degree credential declared in profile.',
      isMet,
      severity: BLOCKER_RULES.education.severity,
      scoreCap: BLOCKER_RULES.education.scoreCap,
      explanation: isMet
        ? 'Degree requirement satisfied through credentials or equivalent industry experience.'
        : `Lacks explicit degree requirement without waiver clause. Match capped at ${BLOCKER_RULES.education.scoreCap}%.`,
    });
  }

  // 4. Mandatory Certifications Constraint
  const mandatoryCerts = [];
  if (/\b(cpa|chartered\s+accountant)\b/i.test(jdText) && !/\b(cpa|chartered\s+accountant)\b/i.test(profileText)) {
    mandatoryCerts.push('CPA / Chartered Accountant');
  }
  if (/\b(pmp|project\s+management\s+professional)\b/i.test(jdText) && !/\b(pmp)\b/i.test(profileText)) {
    mandatoryCerts.push('PMP Certification');
  }
  if (/\b(cissp|certified\s+information\s+systems\s+security)\b/i.test(jdText) && !/\b(cissp)\b/i.test(profileText)) {
    mandatoryCerts.push('CISSP Cybersecurity License');
  }
  if (/\b(aws\s+certified\s+solutions\s+architect)\b/i.test(jdText) && !/aws\s+certified/i.test(profileText)) {
    mandatoryCerts.push('AWS Certified Solutions Architect');
  }

  if (mandatoryCerts.length > 0) {
    items.push({
      id: 'certification',
      category: 'certification',
      title: 'Mandatory Certifications / Licenses',
      requirement: `Requires official licensure: ${mandatoryCerts.join(', ')}.`,
      candidateEvidence: 'License missing from candidate profile certifications list.',
      isMet: false,
      severity: BLOCKER_RULES.certification.severity,
      scoreCap: BLOCKER_RULES.certification.scoreCap,
      explanation: `Specific licensure required by regulatory or compliance standards. Match capped at ${BLOCKER_RULES.certification.scoreCap}%.`,
    });
  }

  // 5. Language Requirements Constraint
  const requiresGerman = /\b(fluent\s+german|german\s+(?:c1|c2|native)|deutsch\s+(?:c1|verhandlungssicher))\b/i.test(jdText);
  const requiresFrench = /\b(fluent\s+french|french\s+(?:c1|c2|native)|français\s+courant)\b/i.test(jdText);

  if (requiresGerman && !/german|deutsch/i.test(profileText)) {
    items.push({
      id: 'language_german',
      category: 'language',
      title: 'Language Proficiency (German)',
      requirement: 'Requires fluent or business-level German language proficiency (C1/C2).',
      candidateEvidence: 'German proficiency not listed in profile language competencies.',
      isMet: false,
      severity: BLOCKER_RULES.language.severity,
      scoreCap: BLOCKER_RULES.language.scoreCap,
      explanation: 'Role requires local client or business German communication.',
    });
  } else if (requiresFrench && !/french|français/i.test(profileText)) {
    items.push({
      id: 'language_french',
      category: 'language',
      title: 'Language Proficiency (French)',
      requirement: 'Requires fluent or business-level French language proficiency (C1/C2).',
      candidateEvidence: 'French proficiency not listed in profile language competencies.',
      isMet: false,
      severity: BLOCKER_RULES.language.severity,
      scoreCap: BLOCKER_RULES.language.scoreCap,
      explanation: 'Role requires local client or business French communication.',
    });
  }

  // 6. Location & Workplace Mode Constraint
  const isStrictOnsite =
    job.workplaceType === 'On-site' ||
    /must\s+work\s+on-?site|in-?office\s+5\s+days|no\s+remote\s+option|100%\s+on-?site/i.test(jdText);

  if (isStrictOnsite && job.location && candidateLoc && !job.location.toLowerCase().includes(candidateLoc)) {
    const isDifferentCountry =
      (job.location.includes('United States') && !candidateLoc.includes('united states')) ||
      (job.location.includes('United Kingdom') && !candidateLoc.includes('united kingdom')) ||
      (job.location.includes('Germany') && !candidateLoc.includes('germany')) ||
      (job.location.includes('UAE') && !candidateLoc.includes('uae') && !candidateLoc.includes('emirates'));

    if (isDifferentCountry) {
      items.push({
        id: 'location_workmode',
        category: 'location_workmode',
        title: 'On-site Location Feasibility',
        requirement: `Strict in-person on-site role in ${job.location}.`,
        candidateEvidence: `Candidate profile indicates residence in ${candidate.location || 'different territory'}.`,
        isMet: false,
        severity: BLOCKER_RULES.location_workmode.severity,
        scoreCap: BLOCKER_RULES.location_workmode.scoreCap,
        explanation: 'On-site presence required without remote accommodation.',
      });
    }
  }

  // Calculate overall eligibility and lowest score ceiling
  const unmet = items.filter((i) => !i.isMet);
  const scoreCeiling = unmet.length > 0 ? Math.min(...unmet.map((i) => i.scoreCap)) : 100;
  const critical = unmet.find((i) => i.severity === 'hard') || unmet[0];

  return {
    overallEligible: unmet.length === 0,
    scoreCeiling,
    totalEvaluated: items.length,
    unmetCount: unmet.length,
    items,
    criticalBlocker: critical,
  };
}
