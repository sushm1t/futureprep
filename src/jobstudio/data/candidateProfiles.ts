// @ts-nocheck -- ported verbatim from the original project
import { CandidateInfo, TailoredResumeData } from './defaultData';
import { sortExperiencesReverseChronological } from '../utils/chronology';

export interface CandidateProfileRecord {
  id: string;
  isPreset?: boolean;
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experiences: Array<{
    title: string;
    company: string;
    date_range: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
  projects?: Array<{
    name: string;
    role?: string;
    description: string;
    bullets?: string[];
    url?: string;
  }>;
  masterProfileText: string;
  createdAt: number;
  updatedAt: number;
}

export const STORAGE_KEY_PROFILES = 'jobstudio_candidate_profiles_v1';
export const STORAGE_KEY_ACTIVE_ID = 'jobstudio_active_profile_id_v1';
export const STORAGE_KEY_USER_PROFILE = 'jobstudio_master_profile';

/** Curated, production-grade sample profile for sandbox exploration and testing */
export const SAMPLE_CANDIDATE_PROFILE: CandidateProfileRecord = {
  id: 'sample-profile-alex-rivera',
  isPreset: true,
  name: 'Alex Rivera',
  headline: 'Senior Full-Stack & Systems Engineer',
  email: 'alex.rivera@example.com',
  phone: '(555) 234-5678',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alex-rivera',
  summary: 'Full-stack software and systems engineer with 5+ years of experience architecting high-throughput distributed microservices and responsive web applications. Expert in TypeScript, React, Node.js, PostgreSQL, and AWS.',
  skills: [
    'TypeScript',
    'JavaScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'AWS Lambda',
    'Docker',
    'GraphQL',
    'REST APIs',
    'CI/CD',
    'System Architecture',
  ],
  experiences: [
    {
      title: 'Senior Software Engineer',
      company: 'CloudFlow Inc.',
      date_range: '2021 – Present',
      location: 'Remote · San Francisco, CA',
      bullets: [
        'Architected 12 event-driven microservices on AWS Lambda and DynamoDB, cutting infrastructure latency by 35% and supporting 45k req/sec.',
        'Engineered real-time analytics web dashboard in Next.js and TypeScript with sub-second queries over 10M+ daily events.',
        'Mentored 6 engineers and instituted automated end-to-end integration testing in CI/CD pipelines.',
      ],
    },
    {
      title: 'Full-Stack Software Engineer',
      company: 'DevPulse Systems',
      date_range: '2019 – 2021',
      location: 'San Francisco, CA',
      bullets: [
        'Developed high-availability Node.js RESTful APIs serving 2M+ active daily requests at 99.98% uptime.',
        'Optimized PostgreSQL query execution plans and caching layer, reducing p99 response times from 450ms to 95ms.',
      ],
    },
  ],
  projects: [
    {
      name: 'PulseFlow Observability',
      role: 'Lead Architect',
      description: 'Open-source distributed tracing agent for microservices with OpenTelemetry.',
      bullets: ['Deployed across 40+ engineering teams with zero performance overhead.'],
      url: 'https://github.com/example/pulseflow',
    },
  ],
  education: [
    {
      degree: 'B.S. in Computer Science',
      institution: 'San Jose State University',
      year: '2015 – 2019',
    },
  ],
  certifications: ['AWS Certified Solutions Architect – Associate'],
  masterProfileText: `### CANDIDATE: Alex Rivera
**Headline:** Senior Full-Stack & Systems Engineer
**Email:** alex.rivera@example.com | **Phone:** (555) 234-5678 | **Location:** San Francisco, CA
**LinkedIn:** linkedin.com/in/alex-rivera

#### EXECUTIVE SUMMARY
Full-stack software and systems engineer with 5+ years of experience architecting high-throughput distributed microservices and responsive web applications. Expert in TypeScript, React, Node.js, PostgreSQL, and AWS.

#### CORE COMPETENCIES & TECHNICAL SKILLS
TypeScript, JavaScript, React, Node.js, PostgreSQL, AWS Lambda, Docker, GraphQL, REST APIs, CI/CD, System Architecture

#### PROFESSIONAL EXPERIENCE
**Senior Software Engineer** | CloudFlow Inc. | 2021 – Present | Remote · San Francisco, CA
- Architected 12 event-driven microservices on AWS Lambda and DynamoDB, cutting infrastructure latency by 35% and supporting 45k req/sec.
- Engineered real-time analytics web dashboard in Next.js and TypeScript with sub-second queries over 10M+ daily events.
- Mentored 6 engineers and instituted automated end-to-end integration testing in CI/CD pipelines.

**Full-Stack Software Engineer** | DevPulse Systems | 2019 – 2021 | San Francisco, CA
- Developed high-availability Node.js RESTful APIs serving 2M+ active daily requests at 99.98% uptime.
- Optimized PostgreSQL query execution plans and caching layer, reducing p99 response times from 450ms to 95ms.

#### EDUCATION & CERTIFICATIONS
- B.S. in Computer Science | San Jose State University | 2015 – 2019
- AWS Certified Solutions Architect – Associate`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Storage key helper for 1 User = 1 Master Profile isolation.
 * Every user account has its own isolated profile stored under `jobstudio_master_profile_<clean_email>`.
 */
export function getUserProfileKey(email?: string): string {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return 'jobstudio_master_profile_demo';
  return `jobstudio_master_profile_${cleanEmail}`;
}

/**
 * Creates a pristine, unpopulated master profile for a newly registered user account.
 * Awaiting their authentic resume PDF upload or manual entry.
 */
export function createFreshUserProfile(email: string, name?: string): CandidateProfileRecord {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name && name.trim()) ? name.trim() : (cleanEmail.split('@')[0] || 'Candidate');
  return {
    id: `profile-${cleanEmail}-${Date.now()}`,
    isPreset: false,
    name: cleanName,
    headline: '',
    email: cleanEmail,
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    skills: [],
    experiences: [],
    projects: [],
    education: [],
    certifications: [],
    masterProfileText: `### CANDIDATE: ${cleanName}\n**Email:** ${cleanEmail}\n\nNo resume uploaded yet. Upload your resume PDF or paste your work history to auto-populate your authentic Master Profile.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Single-User Master Profile: 1 User Account = 1 Master Profile
 * Strictly isolated per user email to eliminate cross-account profile contamination.
 */
export function getUserMasterProfile(email?: string, name?: string): CandidateProfileRecord {
  if (typeof window === 'undefined') return createFreshUserProfile('', 'Candidate');
  try {
    const userEmail = (email || localStorage.getItem('jobstudio_user_email') || '').toLowerCase().trim();
    const storedName = (name || localStorage.getItem('jobstudio_user_name') || '').trim();

    // 1. If not logged in and no email provided, return fresh blank guest profile (never leak demo or other user)
    if (!userEmail) {
      return createFreshUserProfile('', storedName || 'Candidate');
    }

    // 3. User Account: strictly keyed by userEmail
    const specificKey = getUserProfileKey(userEmail);
    const raw = localStorage.getItem(specificKey);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);

        return parsed;
      } catch (err) {
        console.error('Failed to parse stored profile JSON', err);
        localStorage.removeItem(specificKey);
      }
    }

    // Purge legacy unscoped keys if they still exist so they never leak into any account
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
    localStorage.removeItem('jobstudio_candidate_profiles_v1');

    // 3. Provision a clean, fresh profile specifically for this user
    const fresh = createFreshUserProfile(userEmail, storedName);
    saveUserMasterProfile(fresh, userEmail);
    return fresh;
  } catch (e) {
    console.error('Failed to read user master profile from localStorage', e);
    return createFreshUserProfile(email || '', name || 'Candidate');
  }
}

export function saveUserMasterProfile(profile: CandidateProfileRecord, email?: string) {
  if (typeof window === 'undefined') return false;
  try {
    const userEmail = (email || profile.email || localStorage.getItem('jobstudio_user_email') || '').toLowerCase().trim();
    if (!userEmail) return false;

    const specificKey = getUserProfileKey(userEmail);
    if (Array.isArray(profile.experiences)) {
      profile.experiences = sortExperiencesReverseChronological(profile.experiences);
    }
    const json = JSON.stringify(profile);
    localStorage.setItem(specificKey, json);

    // Clean up any unscoped legacy key
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
    return true;
  } catch (e) {
    console.error('Failed to save master profile to localStorage', e);
    return false;
  }
}

/** Persist an empty replacement so reload/cloud hydration cannot restore a demo or old resume. */
export function resetUserMasterProfile(email: string): CandidateProfileRecord {
  const profile = {
    ...createFreshUserProfile(email, 'Candidate'),
    name: '',
    headline: '',
    email: '',
    masterProfileText: '',
  };
  if (!saveUserMasterProfile(profile, email)) {
    throw new Error('Your profile could not be deleted. Please try again.');
  }
  return profile;
}

export function getStoredProfiles(): CandidateProfileRecord[] {
  return [getUserMasterProfile()];
}

export function saveStoredProfiles(profiles: CandidateProfileRecord[]) {
  if (profiles.length > 0) {
    saveUserMasterProfile(profiles[0]);
  }
}

export function getActiveProfileId(): string {
  return getUserMasterProfile().id;
}

export function setActiveProfileId(id: string) {
  // Single profile mode: active profile is always current user profile
}

export function profileRecordToResume(profile: CandidateProfileRecord): TailoredResumeData {
  return {
    full_name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedin: profile.linkedin,
    tailored_summary: profile.summary,
    skills: profile.skills,
    experiences: sortExperiencesReverseChronological(profile.experiences || []),
    projects: profile.projects || [],
    education: profile.education,
    certifications: profile.certifications,
  };
}

export function profileRecordToCandidateInfo(profile: CandidateProfileRecord): CandidateInfo {
  const parts = profile.name.trim().split(' ');
  const firstName = parts[0] || 'Candidate';
  const lastName = parts.slice(1).join(' ') || '';
  return {
    first_name: firstName,
    last_name: lastName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedin: profile.linkedin,
  };
}

