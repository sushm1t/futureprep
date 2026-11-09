// @ts-nocheck -- ported verbatim from the original project
export interface WorkExperience {
  title: string;
  company: string;
  date_range: string;
  location: string;
  bullets: string[];
}

export interface CandidateInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio?: string;
}

export interface ProjectExperience {
  name: string;
  role?: string;
  target_alignment?: string;
  description: string;
  bullets: string[];
}

export interface TailoredResumeData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio?: string;
  tailored_summary: string;
  skills: string[];
  core_competencies?: string[];
  selected_achievements?: string[];
  experiences: WorkExperience[];
  projects?: ProjectExperience[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  match_report?: {
    overall_score: number;
    category_scores?: Record<string, number>;
    summary?: string;
  };
  keyword_analysis?: {
    matched: string[];
    partial: string[];
    missing: string[];
    excluded_unsupported: string[];
  };
  gap_analysis?: {
    missing_capabilities: string[];
    missing_experience: string[];
    missing_certifications: string[];
    improvement_areas: string[];
  };
  qa_validation?: {
    factual_integrity_passed: boolean;
    job_alignment_passed: boolean;
    ats_compatibility_passed: boolean;
    human_readability_passed: boolean;
    issues?: string[];
  };
  recommendations?: string[];
}

export interface SkillRoadmapStep {
  skill: string;
  action_plan: string;
  recommended_certification: string;
  certification_provider?: string;
  timeline?: string;
  importance?: 'CRITICAL' | 'RECOMMENDED' | 'NICE_TO_HAVE' | string;
  practical_project?: string;
}

export interface RecommendedCertification {
  name: string;
  issuer: string;
  target_skill: string;
  estimated_time: string;
  why_it_helps: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
}

export interface QualificationGap {
  missing: string;
  where_to_work: string;
  severity?: 'CRITICAL' | 'MODERATE' | 'NICE_TO_HAVE' | string;
}

export interface JobEvaluationData {
  job_title: string;
  company_name: string;
  match_score: number;
  should_apply: boolean;
  verdict: 'STRONG_APPLY' | 'APPLY' | 'CONSIDER' | 'SKIP' | string;
  key_matching_factors: string[];
  missing_critical_skills: string[];
  gaps?: QualificationGap[];
  tailoring_recommendations: string[];
  location_info?: string;
  executive_summary?: string;
  skill_roadmap?: SkillRoadmapStep[];
  recommended_certifications?: RecommendedCertification[];
  dimension_scores?: Record<string, { weight: number; score: number; notes?: string }>;
  mandatory_gates?: Array<{ id: string; requirement: string; status: 'PASSED' | 'FAILED' | 'UNCERTAIN'; reason?: string }>;
  is_gated?: boolean;
  gate_reason?: string;
  job_family?: string;
  seniority_level?: string;
}

export interface CoverLetterData {
  recipient: string;
  subject: string;
  body_paragraphs: string[];
  signoff: string;
}

export interface ScreeningAnswer {
  question: string;
  suggested_answer: string;
  category?: string;
  keywords?: string[];
  key_points?: string[];
  word_count?: number;
}

export interface InterviewPrepQuestion {
  question: string;
  category: 'Portal Reported' | 'Technical & Operational' | 'Behavioral (STAR)' | 'Situational Case' | string;
  source: string; // e.g. "Glassdoor Candidate Report", "AmbitionBox", "Role Competency Model"
  isFromPortal?: boolean;
  why_asked: string;
  key_talking_points: string[];
  suggested_answer: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Interviewing'
  | 'Offer Received'
  | 'Rejected'
  | 'Archived';

export interface ResumeVersionSnapshot {
  id: string;
  label: string; // "v1", "v2", ...
  saved_at: number;
  match_score?: number;
  resume: TailoredResumeData;
}

export interface ApplicationEvent {
  id: string;
  at: number;
  type: 'created' | 'status_changed' | 'details_updated' | 'resume_version_saved';
  from_status?: ApplicationStatus;
  to_status?: ApplicationStatus;
  detail: string;
}

export interface AppliedJobRecord {
  id: string;
  job_title: string;
  company_name: string;
  location?: string;
  platform?: string;
  apply_url?: string;
  applied_date: string; // YYYY-MM-DD or formatted date
  match_score?: number;
  status: ApplicationStatus;
  salary?: string;
  notes?: string;
  interview_date?: string;
  followed_up_at?: string;
  resume_versions?: ResumeVersionSnapshot[];
  events?: ApplicationEvent[];
  tailored_resume_summary?: string;
  created_at: number;
}

export type ATSPlatform = 'Greenhouse' | 'Lever' | 'Ashby' | 'SmartRecruiters' | 'Workable' | 'Oracle Cloud HCM' | 'Direct Portal';

export type SeniorityFilter = 'All' | 'Early / Junior' | 'Mid-Level' | 'Senior' | 'Lead / Staff / Director';
export type WorkplaceFilter = 'All' | 'Remote' | 'Hybrid' | 'On-site';

export interface ATSJobListing {
  id: string;
  originalId?: string;
  slug?: string;
  title: string;
  company: string;
  location: string;
  department?: string;
  platform: ATSPlatform | string;
  applyUrl: string;
  publishedAt?: string;
  descriptionSnippet?: string;
  rawDescription?: string;
  isRemote?: boolean;
  workplaceType?: 'Remote' | 'Hybrid' | 'On-site';
  seniority?: 'Early / Junior' | 'Mid-Level' | 'Senior' | 'Lead / Staff / Director';
  salarySnippet?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  matchScore?: number;
  matchHighlight?: string;
  verifiedLive?: boolean;
  verifiedAt?: string;
}

export interface ATSCompanyEntry {
  name: string;
  slug: string;
  ats: 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters' | 'workable';
  category: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: 'Greenhouse' | 'Lever' | 'LinkedIn' | 'Ashby' | 'UltiPro' | 'Workable' | string;
  applyUrl: string;
  category: 'Resource & Capacity Planning' | 'Real-Time Operations & WFM' | 'Incident & Service Ops' | 'Business Operations & Analytics' | 'Implementation Operations' | string;
  matchScore: number;
  matchHighlight: string;
  description: string;
  isLive?: boolean;
}

export const PRESET_JOBS: JobOpportunity[] = [
  {
    id: 'weaver-senior-associate',
    title: 'Senior Associate – Resource Management',
    company: 'Weaver (Weaver and Tidwell, LLP)',
    location: 'Kochi (Cyber Green) / Bengaluru / Hyderabad / Remote Hybrid',
    platform: 'UltiPro',
    category: 'Resource & Capacity Planning',
    matchScore: 92,
    matchHighlight: 'Direct match for workforce scheduling, utilization variance tracking, and US-India engagement coordination.',
    applyUrl:
      'https://recruiting2.ultipro.com/WEA1003WEAV/JobBoard/c4b626ed-a455-433e-9e34-c877b04aedb4/OpportunityDetail?opportunityId=bb20800c-9524-4e3a-be6d-4dd86a8b83e4&source=LinkedIn',
    description: `Company: Weaver (Weaver and Tidwell, LLP)
Requisition: SENIO003186
Role: Senior Associate - Resource Management
Locations: Kochi (Kerala), Bengaluru, Chennai, Hyderabad, Coimbatore (India)

Position Summary:
The Senior Associate in Resource Management will support operational workforce planning, scheduling, capacity analysis, and resource balancing for Weaver's India Tax team in close coordination with US Tax practice leaders.

Key Responsibilities:
- Facilitate resource scheduling, allocations, and workload balancing across a team of 100+ tax and accounting professionals.
- Track, audit, and analyze staff capacity, utilization benchmarks, and scheduling variances using advanced spreadsheet models and workforce tools.
- Coordinate with US engagement managers and India leadership to identify staffing shortages, reallocate resources during peak tax seasons, and mitigate project delays.
- Support onboarding, team roster maintenance, skills inventory, and tracking of planned time off (PTO) and training schedules.
- Generate weekly and monthly utilization and operational metrics reports for executive leadership.
- Participate in workflow process improvement initiatives and system data hygiene audits.

Required Qualifications:
- Bachelor's degree in Business, Human Resources, Operations, or related field.
- 2-4 years of experience in resource management, workforce management, capacity planning, or operations coordination.
- Strong proficiency in Microsoft Excel (Pivot tables, VLOOKUP/XLOOKUP, formulas) and reporting tools.
- Excellent communication and cross-functional stakeholder coordination skills across US and India time zones.`,
    isLive: true,
  },
  {
    id: 'honeywell-integrity-compliance',
    title: 'Integrity & Compliance Specialist II',
    company: 'Honeywell Aerospace',
    location: 'India / Bengaluru / Remote Hybrid',
    platform: 'Oracle Cloud HCM',
    category: 'Incident & Service Ops',
    matchScore: 94,
    matchHighlight:
      'Direct match for third-party compliance reviews (pre-L1/L1), regulatory screenings, data analytics (SQL/Looker), and IAM compliance controls.',
    applyUrl:
      'https://icfcjb.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/Aerospace/job/99122261?utm_medium=jobboard&utm_source=linkedin',
    description: `Company: Honeywell Aerospace
Requisition ID: 99122261
Role: Integrity & Compliance Specialist II
Location: India (Bengaluru / Hybrid)
Platform: Oracle Cloud HCM

Role Description:
As an Integrity & Compliance Specialist II at Honeywell Aerospace, you will conduct due diligence investigations on third parties with whom Honeywell Aerospace does business, ensuring that all operations and transactions are conducted in accordance with legal and ethical standards. You will contribute to our efforts to drive data analytics and integration in our compliance operations. Additionally, you will develop training programs to educate employees on integrity and compliance, promoting a strong culture of ethics and compliance throughout the organization.

Key Responsibilities:
- Conduct pre-L1 and L1 reviews on third parties during compliance screenings.
- Coordinate escalations and partner with other compliance professionals as appropriate.
- Ensure compliance with all applicable laws, regulations, and company policies.
- Develop training programs to educate employees on integrity and compliance.
- Monitor and assess the effectiveness of our screening systems and recommend improvements.
- Collaborate with cross-functional teams to ensure integrity and compliance in business operations.
- Drive data analytics and insights for the Third Party Risk & Digital Compliance Team.

Qualifications & Requirements:
- 2+ years of experience in compliance, operational risk, or regulatory screening.
- Knowledge of laws, regulations, and industry standards related to integrity and compliance.
- Proven experience operating within integrity and compliance programs.
- Strong analytical skills, attention to detail, and problem-solving abilities.`,
    isLive: true,
  },
];

// Initial empty / plain evaluation for reload state
export const EMPTY_EVALUATION: JobEvaluationData = {
  job_title: '',
  company_name: '',
  match_score: 0,
  should_apply: false,
  verdict: 'PENDING',
  location_info: '',
  executive_summary: '',
  key_matching_factors: [],
  missing_critical_skills: [],
  gaps: [],
  tailoring_recommendations: [],
  skill_roadmap: [],
  recommended_certifications: [],
};

// Initial empty cover letter
export const EMPTY_COVER_LETTER: CoverLetterData = {
  recipient: '',
  subject: '',
  body_paragraphs: [],
  signoff: '',
};

// Empty defaults: candidate facts must come from the account's saved profile.
export const MASTER_BASE_RESUME: TailoredResumeData = {
  full_name: '', email: '', phone: '', location: '', linkedin: '',
  tailored_summary: '', skills: [], experiences: [], projects: [], education: [], certifications: [],
};
export const EMPTY_CANDIDATE_INFO: CandidateInfo = {
  first_name: '', last_name: '', email: '', phone: '', location: '', linkedin: '',
};
