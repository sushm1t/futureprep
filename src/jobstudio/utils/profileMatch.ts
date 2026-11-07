// Scores fetched job listings against the user's Master Profile text using keyword overlap.
const STOP = new Set(
  'a an and the of to in for on with at by from or as is are be was were this that it its your our you we they their i my me us will can using use used via per into over across within role team work job jobs company experience years year new more all any other such also including based level strong ability skills skill etc'.split(' ')
);

const tokenize = (text: string): string[] =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, ' ')
    .split(/[\s/,-]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t.length > 1 && !STOP.has(t) && !/^\d+$/.test(t));

export const buildProfileTerms = (profileText: string): Set<string> => new Set(tokenize(profileText));

export interface MatchableJob {
  title: string;
  department?: string;
  skills?: string[];
  descriptionSnippet?: string;
  rawDescription?: string;
}

// Seniority, hierarchy, and regional modifiers in job titles that do not constitute functional discipline
const TITLE_MODIFIERS = new Set([
  'senior', 'sr', 'junior', 'jr', 'lead', 'principal', 'staff', 'head', 'director', 'vp',
  'manager', 'management', 'specialist', 'consultant', 'analyst', 'coordinator', 'officer',
  'associate', 'assistant', 'intern', 'trainee', 'incharge', 'executive', 'supervisor',
  'remote', 'hybrid', 'onsite', 'on-site', 'india', 'us', 'usa', 'global', 'apac', 'emea',
  'latam', 'regional', 'area', 'country', 'north', 'south', 'east', 'west', 'central',
  'group', 'team', 'practice', 'general', 'entry', 'mid'
]);

// 1. Sales & Business Development Gate:
// Non-sales candidates must never match sales roles (e.g. Sales Manager, Account Executive, BDR, SDR).
// Merely having "sales" in a dealer or company name (e.g. "Kadoor Sales Corporation") is NOT a sales background.
const isSalesRole = (title: string): boolean =>
  /\b(sales\s+(manager|representative|executive|lead|director|development|associate|agent)|account\s+executive|business\s+development\s+(manager|representative|lead|specialist)|sdr|bdr|inside\s+sales|commercial\s+sales|head\s+of\s+sales)\b/i.test(title);

const hasSalesBackground = (terms: Set<string>): boolean => {
  const salesCompetencies = [
    'quota', 'pipeline', 'prospecting', 'cold', 'outbound', 'closing', 'leads', 'prospects',
    'deal', 'deals', 'b2b', 'b2c', 'funnel', 'quota-carrying', 'crm', 'salesforce', 'hubspot',
    'bookings', 'client acquisition'
  ];
  const hasDirectRole = terms.has('sdr') || terms.has('bdr') || terms.has('closing') || (terms.has('business') && terms.has('development'));
  const hasSalesKeyword = terms.has('sales') || terms.has('selling') || terms.has('commercial');
  const matchingCompetencies = salesCompetencies.filter((c) => terms.has(c)).length;
  return hasDirectRole || (hasSalesKeyword && matchingCompetencies >= 1);
};

// 2. SAP & ERP Specialist Gate:
const isSapRole = (title: string): boolean =>
  /\b(sap|abap|s4hana|s\/4hana|sap-fiori|sap-sd|sap-mm|sap-fi|sap-co|sap-pp|sap-basis)\b/i.test(title);

// 3. Software / Cloud / Web Developer Gate (vs Physical / Mechanical / Civil Engineering):
// Candidates with engineering degrees (Mechanical, Civil, Industrial, Mining, Chemical) who have no software
// coding skills must not match software development, web engineering, backend, or AI coding roles.
const isSoftwareDevRole = (title: string): boolean =>
  /\b(software|front[- ]?end|back[- ]?end|full[- ]?stack|web\s+developer|developer|programmer|devops|site\s+reliability|cloud\s+(architect|engineer)|mobile\s+developer|ios\s+developer|android\s+developer|react\s+developer|python\s+developer|java\s+developer|golang\s+developer|data\s+engineer|machine\s+learning\s+engineer|ai\s+engineer|systems\s+software)\b/i.test(title);

const hasSoftwareDevBackground = (terms: Set<string>): boolean => {
  const codeTerms = [
    'software', 'development', 'developer', 'programmer', 'coding', 'code', 'react', 'python',
    'javascript', 'typescript', 'java', 'c++', 'c#', 'golang', 'rust', 'kubernetes', 'docker',
    'aws', 'cloud', 'sql', 'git', 'api', 'graphql', 'node', 'django', 'fastapi', 'devops',
    'ci/cd', 'frontend', 'backend', 'fullstack', 'database', 'html', 'css', 'ai', 'algorithm',
    'machine learning'
  ];
  return codeTerms.filter((t) => terms.has(t)).length >= 2;
};

// 4. Healthcare / Clinical Gate:
const isClinicalRole = (title: string): boolean =>
  /\b(nurse|nursing|physician|doctor|pharmacist|pharmacy|phlebotom|medical\s+laboratory|patholog|radiolog|dentist|paramedic|clinical\s+specialist|histotechnolog)\b/i.test(title);

const hasClinicalBackground = (terms: Set<string>): boolean =>
  ['clinical', 'medical', 'hospital', 'nurse', 'nursing', 'phlebotomy', 'laboratory', 'pathology', 'biochemistry', 'hematology', 'patient', 'doctor', 'physician', 'pharmacist'].some((t) => terms.has(t));

// 5. Data Analyst / BI Gate:
const isDataAnalystRole = (title: string): boolean =>
  /\b(data\s+analyst|bi\s+analyst|business\s+intelligence\s+analyst|analytics\s+engineer)\b/i.test(title);

const hasDataAnalystBackground = (terms: Set<string>): boolean => {
  const analyticsTerms = ['sql', 'python', 'tableau', 'powerbi', 'looker', 'excel', 'pandas', 'statistics', 'dashboard', 'bi', 'analytics'];
  return analyticsTerms.filter((t) => terms.has(t)).length >= 2;
};

// 6. HR / Benefits / Payroll Gate:
const isHrBenefitsRole = (title: string): boolean =>
  /\b(benefits\s+analyst|payroll|hr\s+generalist|human\s+resources|people\s+operations|talent\s+acquisition|recruiter)\b/i.test(title);

const hasHrBenefitsBackground = (terms: Set<string>): boolean =>
  ['hr', 'human resources', 'benefits', 'payroll', 'recruiting', 'talent', 'onboarding', 'people'].some((t) => terms.has(t));

// 7. Call Centre / Customer Support Agent Gate:
const isCallCentreRole = (title: string): boolean =>
  /\b(call\s+centre|customer\s+support\s+operations\s+analyst|contact\s+centre|teleperformance|bpo)\b/i.test(title);

const hasCallCentreBackground = (terms: Set<string>): boolean =>
  ['call centre', 'contact centre', 'zendesk', 'freshdesk', 'teleperformance', 'bpo', 'telephony'].some((t) => terms.has(t));

// Engineering roles need evidence of engineering background, not shared business vocabulary.
const hasEngineeringBackground = (terms: Set<string>): boolean => {
  if (['engineer', 'engineering', 'developer', 'programmer'].some((term) => terms.has(term))) return true;
  const technicalSkills = ['python', 'javascript', 'typescript', 'java', 'c++', 'pytorch', 'tensorflow', 'react', 'kubernetes', 'solidworks', 'autocad', 'cad', 'ansys', 'matlab', 'catia'];
  return technicalSkills.filter((term) => terms.has(term)).length >= 2;
};

export const MIN_DESCRIPTION_FOR_CONFIDENT_FIT = 400;

/** Returns a quick 0-85 estimate; requirements weigh more than title overlap. */
export const scoreJobAgainstProfile = (job: MatchableJob, profileTerms: Set<string>): number => {
  if (profileTerms.size === 0) return 0;

  // Domain Disqualification Gates:
  if (isSalesRole(job.title) && !hasSalesBackground(profileTerms)) return 0;
  if (isSapRole(job.title) && !profileTerms.has('sap') && !profileTerms.has('abap')) return 0;
  if (isSoftwareDevRole(job.title) && !hasSoftwareDevBackground(profileTerms)) return 0;
  if (isClinicalRole(job.title) && !hasClinicalBackground(profileTerms)) return 0;
  if (isDataAnalystRole(job.title) && !hasDataAnalystBackground(profileTerms)) return 0;
  if (isHrBenefitsRole(job.title) && !hasHrBenefitsBackground(profileTerms)) return 0;
  if (isCallCentreRole(job.title) && !hasCallCentreBackground(profileTerms)) return 0;
  if (/\b(engineer|engineering|developer|programmer)\b/i.test(job.title) && !hasEngineeringBackground(profileTerms)) return 0;

  const titleTerms = [...new Set(tokenize(job.title))];
  if (titleTerms.length === 0) return 0;

  // Check functional discipline terms (excluding modifiers like Senior, Manager, Remote, India)
  const disciplineTerms = titleTerms.filter((t) => !TITLE_MODIFIERS.has(t));
  if (disciplineTerms.length > 0) {
    const disciplineHits = disciplineTerms.filter((t) => profileTerms.has(t)).length;
    if (disciplineHits === 0) {
      return 0;
    }
  }

  const titleHits = titleTerms.filter((t) => profileTerms.has(t)).length;
  const titleRatio = titleHits / titleTerms.length;

  // Use the posting's most repeated terms (plus listed skills) so long full descriptions
  // are judged on their key requirements instead of every word they contain.
  const counts = new Map<string, number>();
  for (const t of tokenize(`${job.department || ''} ${job.rawDescription || job.descriptionSnippet || ''}`)) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  const keyTerms = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t);
  const extra = [...new Set([...tokenize((job.skills || []).join(' ')), ...keyTerms])];
  const extraRatio = extra.length ? extra.filter((t) => profileTerms.has(t)).length / extra.length : titleRatio;

  // Requirements weigh more than the title, and a quick keyword estimate is capped at 85
  // so it never looks like a near-perfect match before the full AI check runs.
  const score = Math.round(Math.min(0.85, titleRatio * 0.35 + extraRatio * 0.65) * 100);
  // Without a real job description there is too little evidence for "Strong" or "Good" fit:
  // a matching title alone often hides requirements the full check later finds missing.
  const descLength = (job.rawDescription || job.descriptionSnippet || '').trim().length;
  return descLength < MIN_DESCRIPTION_FOR_CONFIDENT_FIT ? Math.min(score, 45) : score;
};

export const PROFILE_MATCH_THRESHOLD = 40;

export type QuickFitTier = { label: string; tone: 'strong' | 'good' | 'possible' | 'low' };

/** Word-only label for a quick estimate; numeric scores appear only after the full assessment. */
export const quickFitTier = (score: number): QuickFitTier => {
  if (score >= 65) return { label: 'Strong fit', tone: 'strong' };
  if (score >= 52) return { label: 'Good fit', tone: 'good' };
  if (score >= PROFILE_MATCH_THRESHOLD) return { label: 'Possible fit', tone: 'possible' };
  return { label: 'Low fit', tone: 'low' };
};
