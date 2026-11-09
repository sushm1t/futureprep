/**
 * Role Title Normalization & Intelligent Keyword Expansion Engine
 * 
 * Solves the "Seniority Trap" in ATS job boards:
 * Employers frequently post core titles ("Pipeline Engineer", "Piping Designer")
 * and define seniority in the description rather than putting "Sr." in the headline.
 * 
 * This engine:
 * 1. Normalizes titles by isolating core domains from seniority prefixes.
 * 2. Generates parallel search queries so searching "Sr. Piping Designer" fetches 50+ roles.
 * 3. Provides intelligent related role suggestion chips for 1-click exploration.
 */

export interface NormalizedRole {
  raw: string;
  baseTitle: string;
  seniorityPrefix?: string;
  hasSeniorityPrefix: boolean;
}

export interface RoleExpansions {
  baseTitle: string;
  searchQueries: string[];
  suggestionChips: string[];
  isExpanded: boolean;
  hasSeniorityPrefix?: boolean;
}

const SENIORITY_PREFIX_REGEX = /^(?:sr\.?|senior|lead|staff|principal|chief|head\s+of|jr\.?|junior|associate|mid-?level|entry-?level)\s+/i;
const SENIORITY_SUFFIX_REGEX = /\s+(?:sr\.?|senior|lead|staff|principal|chief|jr\.?|junior|associate|mid-?level|entry-?level|\(sr\.?\)|\(senior\)|\(lead\))$/i;

/**
 * Strips seniority prefixes and suffixes to extract the core functional title.
 * e.g. "Sr. Piping Designer" -> "Piping Designer"
 * e.g. "Senior Pipeline Engineer" -> "Pipeline Engineer"
 * e.g. "Lead Product Designer" -> "Product Designer"
 */
export function normalizeRoleTitle(raw: string = ''): NormalizedRole {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { raw: '', baseTitle: '', hasSeniorityPrefix: false };
  }

  let baseTitle = trimmed;
  let seniorityPrefix: string | undefined;

  const prefixMatch = baseTitle.match(SENIORITY_PREFIX_REGEX);
  if (prefixMatch) {
    seniorityPrefix = prefixMatch[0].trim();
    baseTitle = baseTitle.replace(SENIORITY_PREFIX_REGEX, '').trim();
  }

  const suffixMatch = baseTitle.match(SENIORITY_SUFFIX_REGEX);
  if (suffixMatch) {
    if (!seniorityPrefix) seniorityPrefix = suffixMatch[0].trim();
    baseTitle = baseTitle.replace(SENIORITY_SUFFIX_REGEX, '').trim();
  }

  // Clean trailing punctuation or delimiters e.g. " - ", " / "
  baseTitle = baseTitle.replace(/^[\s/|–—•-]+|[\s/|–—•-]+$/g, '').trim();

  return {
    raw: trimmed,
    baseTitle: baseTitle || trimmed,
    seniorityPrefix,
    hasSeniorityPrefix: Boolean(seniorityPrefix),
  };
}

/**
 * Domain-specific related role suggestions dictionary.
 * Maps base keywords to high-yield adjacent titles commonly used by recruiters and ATS boards.
 */
const RELATED_ROLE_MAP: Record<string, string[]> = {
  // Mechanical, Piping & Plant Engineering
  'piping designer': [
    'Pipeline Engineer',
    'Piping Design Engineer',
    'Mechanical Piping Designer',
    'Plant Layout Designer',
    'CAD Piping Designer',
    'Piping Engineer',
  ],
  'pipeline engineer': [
    'Piping Designer',
    'Piping Engineer',
    'Pipeline Integrity Engineer',
    'Mechanical Pipeline Engineer',
    'Subsea Pipeline Engineer',
    'Process Piping Engineer',
  ],
  'piping engineer': [
    'Piping Designer',
    'Pipeline Engineer',
    'Piping Stress Engineer',
    'Mechanical Piping Engineer',
    'Plant Layout Engineer',
  ],
  'mechanical engineer': [
    'Piping Designer',
    'Pipeline Engineer',
    'Equipment Engineer',
    'Maintenance Engineer',
    'HVAC Design Engineer',
    'Field Service Engineer',
  ],
  // Software & Cloud Engineering
  'software engineer': [
    'Full Stack Engineer',
    'Backend Engineer',
    'Frontend Engineer',
    'Systems Engineer',
    'DevOps Engineer',
  ],
  'backend engineer': [
    'Software Engineer',
    'API Engineer',
    'Distributed Systems Engineer',
    'Golang Engineer',
    'Python Developer',
  ],
  'frontend engineer': [
    'UI Engineer',
    'Full Stack Developer',
    'React Developer',
    'Web Application Engineer',
  ],
  'full stack engineer': [
    'Software Engineer',
    'Backend Engineer',
    'Frontend Engineer',
    'Web Developer',
  ],
  'devops engineer': [
    'Site Reliability Engineer (SRE)',
    'Cloud Platform Engineer',
    'Infrastructure Engineer',
    'Kubernetes Engineer',
  ],
  'data engineer': [
    'Analytics Engineer',
    'ETL Developer',
    'Big Data Engineer',
    'Data Platform Engineer',
  ],
  // Product & Design
  'product designer': [
    'UI/UX Designer',
    'Product Design Lead',
    'UX Researcher',
    'Interaction Designer',
    'Design Systems Lead',
  ],
  'product manager': [
    'Technical Product Manager (TPM)',
    'Group Product Manager',
    'AI Product Manager',
    'Product Lead',
  ],
  // Fintech & Operations
  'payment operations': [
    'Fintech Operations',
    'Card Disputes Specialist',
    'Real-Time Analyst',
    'Risk & Fraud Specialist',
    'Settlement Analyst',
  ],
  'real-time analyst': [
    'Payment Operations Specialist',
    'Workforce Management Analyst',
    'Operations Analyst',
    'Incident Coordinator',
  ],
  // Healthcare & Clinical
  'medical laboratory technologist': [
    'Medical Laboratory Technician',
    'Clinical Laboratory Scientist',
    'Medical Technologist',
    'Pathology Technologist',
  ],
  // Sales, Growth & Go-To-Market (B2B, Enterprise, Revenue)
  'head of growth': [
    'Enterprise Account Executive',
    'VP of Sales',
    'Director of Sales',
    'Head of Business Development',
    'Go-To-Market (GTM) Lead',
    'B2B Sales Lead',
  ],
  'growth': [
    'Head of Growth',
    'Enterprise Account Executive',
    'VP of Sales',
    'Head of Business Development',
    'Go-To-Market Lead',
    'Growth Lead',
  ],
  'sales': [
    'Enterprise Account Executive',
    'VP of Sales',
    'Director of Sales',
    'Head of Business Development',
    'Head of Growth',
    'Sales Lead',
  ],
  'enterprise sales': [
    'Enterprise Account Executive',
    'VP of Sales',
    'Head of Growth',
    'Head of Business Development',
    'Director of Sales',
    'Strategic Account Lead',
  ],
  'account executive': [
    'Enterprise Account Executive',
    'Senior Account Executive',
    'Head of Growth',
    'VP of Sales',
    'Strategic Account Lead',
  ],
  'business development': [
    'Head of Business Development',
    'Director of Business Development',
    'Enterprise Sales Lead',
    'Strategic Partnerships Lead',
    'Head of Growth',
  ],
  'gtm': [
    'Go-To-Market Lead',
    'Head of Growth',
    'VP of Sales',
    'Enterprise Account Executive',
    'Head of Business Development',
  ],
  'revops': [
    'Revenue Operations Manager',
    'Sales Operations Lead',
    'Head of Business Development',
    'Go-To-Market Lead',
  ],
};

/**
 * Computes targeted queries and smart suggestion chips for any role or keyword.
 */
export function getRoleKeywordExpansions(rawKeyword: string = '', domain?: string): RoleExpansions {
  const norm = normalizeRoleTitle(rawKeyword);
  const baseTitle = norm.baseTitle;
  const lowerBase = baseTitle.toLowerCase();

  const searchQueries: string[] = [];
  const suggestionChips: string[] = [];

  if (!rawKeyword.trim()) {
    return {
      baseTitle: '',
      searchQueries: [],
      suggestionChips: [],
      isExpanded: false,
      hasSeniorityPrefix: false,
    };
  }

  // Always include the exact raw keyword first
  searchQueries.push(rawKeyword.trim());

  // If seniority prefix was detected, include the base title (e.g. "Piping Designer")
  // and standard expanded variations (e.g. "Senior Piping Designer")
  if (norm.hasSeniorityPrefix && baseTitle && baseTitle.toLowerCase() !== rawKeyword.toLowerCase()) {
    searchQueries.push(baseTitle);
    searchQueries.push(`Senior ${baseTitle}`);
    searchQueries.push(`Sr ${baseTitle}`);
  }

  // Check dictionary for curated role expansions
  let matchedSuggestions: string[] = [];
  for (const [key, suggestions] of Object.entries(RELATED_ROLE_MAP)) {
    if (lowerBase.includes(key) || key.includes(lowerBase)) {
      matchedSuggestions = suggestions;
      break;
    }
  }

  // Fallback domain-based expansions if not found in exact dictionary
  if (matchedSuggestions.length === 0) {
    if (/pipe|pipeline|piping/i.test(lowerBase)) {
      matchedSuggestions = ['Piping Designer', 'Pipeline Engineer', 'Piping Design Engineer', 'Plant Layout Designer'];
    } else if (/mechanic|plant|machin/i.test(lowerBase)) {
      matchedSuggestions = ['Mechanical Engineer', 'Maintenance Engineer', 'Plant Operations Engineer', 'Field Service Engineer'];
    } else if (/developer|engineer|software/i.test(lowerBase)) {
      matchedSuggestions = ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Systems Engineer'];
    } else if (/design|ux|ui/i.test(lowerBase)) {
      matchedSuggestions = ['Product Designer', 'UI/UX Designer', 'UX Researcher', 'Interaction Designer'];
    } else if (/product|pm/i.test(lowerBase)) {
      matchedSuggestions = ['Product Manager', 'Technical Product Manager', 'Product Operations', 'Associate PM'];
    } else if (/sales|growth|closer|account\s+exec|business\s+dev|gtm/i.test(lowerBase) || domain === 'Sales & Business Development') {
      matchedSuggestions = ['Head of Growth', 'Enterprise Account Executive', 'VP of Sales', 'Head of Business Development', 'Go-To-Market Lead'];
    }
  }

  for (const s of matchedSuggestions) {
    if (s.toLowerCase() !== rawKeyword.toLowerCase() && !suggestionChips.includes(s)) {
      suggestionChips.push(s);
    }
    // Also add to multi-query expansion pool for robust search
    if (searchQueries.length < 5 && !searchQueries.some((q) => q.toLowerCase() === s.toLowerCase())) {
      searchQueries.push(s);
    }
  }

  return {
    baseTitle,
    searchQueries: [...new Set(searchQueries)],
    suggestionChips: suggestionChips.slice(0, 5),
    isExpanded: norm.hasSeniorityPrefix || searchQueries.length > 1,
    hasSeniorityPrefix: norm.hasSeniorityPrefix,
  };
}

