// Comprehensive Filter Definitions and Freehire 440+ Source Registry
// Derived from Freehire's catalog and ATS network

export interface JobSourceEntry {
  id: string;
  name: string;
  kind: 'ats' | 'company' | 'aggregator' | 'social';
  openJobsApprox: string;
  popular?: boolean;
}

export const ALL_JOB_SOURCES: JobSourceEntry[] = [
  // Enterprise Applicant Tracking Systems (ATS)
  { id: 'oracle', name: 'Oracle HCM / Cloud', kind: 'ats', openJobsApprox: '1.3M+', popular: true },
  { id: 'workday', name: 'Workday', kind: 'ats', openJobsApprox: '1.2M+', popular: true },
  { id: 'successfactors', name: 'SAP SuccessFactors', kind: 'ats', openJobsApprox: '480k+', popular: true },
  { id: 'smartrecruiters', name: 'SmartRecruiters', kind: 'ats', openJobsApprox: '400k+', popular: true },
  { id: 'adp', name: 'ADP Workforce Now', kind: 'ats', openJobsApprox: '560k+', popular: true },
  { id: 'greenhouse', name: 'Greenhouse', kind: 'ats', openJobsApprox: '240k+', popular: true },
  { id: 'ukg', name: 'UKG (Ultimate Kronos)', kind: 'ats', openJobsApprox: '330k+', popular: true },
  { id: 'paycom', name: 'Paycom', kind: 'ats', openJobsApprox: '210k+', popular: true },
  { id: 'manatal', name: 'Manatal', kind: 'ats', openJobsApprox: '210k+', popular: true },
  { id: 'phenom', name: 'Phenom People', kind: 'ats', openJobsApprox: '175k+', popular: true },
  { id: 'paylocity', name: 'Paylocity', kind: 'ats', openJobsApprox: '175k+', popular: true },
  { id: 'icims', name: 'iCIMS', kind: 'ats', openJobsApprox: '170k+', popular: true },
  { id: 'teamtailor', name: 'Teamtailor', kind: 'ats', openJobsApprox: '170k+', popular: true },
  { id: 'dayforce', name: 'Dayforce (Ceridian)', kind: 'ats', openJobsApprox: '140k+', popular: true },
  { id: 'taleo', name: 'Taleo Enterprise', kind: 'ats', openJobsApprox: '110k+', popular: true },
  { id: 'coveto', name: 'coveto', kind: 'ats', openJobsApprox: '105k+', popular: true },
  { id: 'workable', name: 'Workable', kind: 'ats', openJobsApprox: '100k+', popular: true },
  { id: 'jazzhr', name: 'JazzHR', kind: 'ats', openJobsApprox: '98k+' },
  { id: 'zohorecruit', name: 'Zoho Recruit', kind: 'ats', openJobsApprox: '90k+', popular: true },
  { id: 'lever', name: 'Lever', kind: 'ats', openJobsApprox: '82k+', popular: true },
  { id: 'recruitee', name: 'Recruitee', kind: 'ats', openJobsApprox: '80k+', popular: true },
  { id: 'bamboohr', name: 'BambooHR', kind: 'ats', openJobsApprox: '79k+', popular: true },
  { id: 'ashby', name: 'Ashby', kind: 'ats', openJobsApprox: '76k+', popular: true },
  { id: 'paycor', name: 'Paycor', kind: 'ats', openJobsApprox: '71k+' },
  { id: 'softgarden', name: 'Softgarden', kind: 'ats', openJobsApprox: '65k+' },
  { id: 'hireology', name: 'Hireology', kind: 'ats', openJobsApprox: '62k+' },
  { id: 'eightfold', name: 'Eightfold AI', kind: 'ats', openJobsApprox: '52k+' },
  { id: 'personio', name: 'Personio', kind: 'ats', openJobsApprox: '49k+', popular: true },
  { id: 'breezy', name: 'Breezy HR', kind: 'ats', openJobsApprox: '49k+' },
  { id: 'darwinbox', name: 'Darwinbox', kind: 'ats', openJobsApprox: '45k+' },
  { id: 'cornerstone', name: 'Cornerstone OnDemand', kind: 'ats', openJobsApprox: '6k+' },
  { id: 'rexx', name: 'rexx systems', kind: 'ats', openJobsApprox: '14k+' },
  { id: 'digitalrecruiters', name: 'DigitalRecruiters', kind: 'ats', openJobsApprox: '12k+' },
  { id: 'talentsoft', name: 'Talentsoft', kind: 'ats', openJobsApprox: '7k+' },

  // Official Regional & Public Job Boards / Aggregators
  { id: 'francetravail', name: 'France Travail (Pôle Emploi)', kind: 'aggregator', openJobsApprox: '155k+', popular: true },
  { id: 'whatjobs', name: 'WhatJobs', kind: 'aggregator', openJobsApprox: '41k+' },
  { id: 'eures', name: 'EURES European Job Mobility', kind: 'aggregator', openJobsApprox: '37k+', popular: true },
  { id: 'join', name: 'Join.com', kind: 'aggregator', openJobsApprox: '21k+' },
  { id: 'xing', name: 'XING', kind: 'social', openJobsApprox: '18k+' },
  { id: 'welcometothejungle', name: 'Welcome to the Jungle', kind: 'company', openJobsApprox: '17k+', popular: true },
  { id: 'netempregos', name: 'Net-Empregos', kind: 'aggregator', openJobsApprox: '14k+' },
  { id: 'jobsch', name: 'jobs.ch (Switzerland)', kind: 'aggregator', openJobsApprox: '13k+' },
  { id: 'pracagovpl', name: 'Praca.gov.pl (CBOP Poland)', kind: 'aggregator', openJobsApprox: '12k+' },
  { id: 'jobnet', name: 'Jobnet (Denmark)', kind: 'aggregator', openJobsApprox: '10k+' },
  { id: 'helixjobs', name: 'helixjobs', kind: 'aggregator', openJobsApprox: '10k+' },
  { id: 'jobindex', name: 'Jobindex', kind: 'aggregator', openJobsApprox: '8k+' },
  { id: 'sapoemprego', name: 'SAPO Emprego', kind: 'aggregator', openJobsApprox: '7k+' },
  { id: 'hzz', name: 'HZZ (Burza rada Croatia)', kind: 'aggregator', openJobsApprox: '7k+' },
  { id: 'choisirleservicepublic', name: 'Choisir le service public', kind: 'company', openJobsApprox: '7k+' },
  { id: 'spainjobs', name: 'SpainJobs.io', kind: 'aggregator', openJobsApprox: '6k+' },
  { id: 'freework', name: 'Free-Work', kind: 'aggregator', openJobsApprox: '6k+' },
  { id: 'infoempleo', name: 'Infoempleo', kind: 'aggregator', openJobsApprox: '5k+' },
  { id: 'infojobs', name: 'InfoJobs', kind: 'aggregator', openJobsApprox: '5k+' },
  { id: 'jobtech', name: 'Jobtech (Sweden)', kind: 'aggregator', openJobsApprox: '5k+' },
];

export const ALL_JOB_SOURCE_IDS = new Set(ALL_JOB_SOURCES.map((s) => s.id));

export interface SpecializationGroup {
  id: string;
  label: string;
  items: Array<{ id: string; label: string; countApprox?: string }>;
}

export const ALL_SPECIALIZATION_GROUPS: SpecializationGroup[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    items: [
      { id: 'software_engineering', label: 'Software Engineering', countApprox: '35,609' },
      { id: 'backend', label: 'Backend', countApprox: '8,299' },
      { id: 'frontend', label: 'Frontend', countApprox: '3,334' },
      { id: 'fullstack', label: 'Full-Stack', countApprox: '13,149' },
      { id: 'mobile', label: 'Mobile', countApprox: '2,156' },
      { id: 'devops', label: 'DevOps', countApprox: '28,355' },
      { id: 'sre', label: 'SRE', countApprox: '1,028' },
      { id: 'network_engineering', label: 'Network Engineering', countApprox: '2,459' },
      { id: 'it_support', label: 'IT Support / Help Desk', countApprox: '8,280' },
      { id: 'hardware', label: 'Hardware', countApprox: '2,713' },
      { id: 'embedded', label: 'Embedded', countApprox: '2,749' },
      { id: 'blockchain', label: 'Blockchain', countApprox: '98' },
      { id: 'architecture', label: 'Architecture', countApprox: '10,381' },
      { id: 'industrial_engineering', label: 'Industrial Engineering', countApprox: '21,862' },
      { id: 'science_lab', label: 'Science & Lab', countApprox: '3,174' },
    ],
  },
  {
    id: 'data_ai',
    label: 'Data & AI',
    items: [
      { id: 'data_engineering', label: 'Data Engineering', countApprox: '18,459' },
      { id: 'data_science', label: 'Data Science', countApprox: '3,436' },
      { id: 'data_analytics', label: 'Data Analytics', countApprox: '4,644' },
      { id: 'ml_ai', label: 'ML / AI', countApprox: '2,158' },
      { id: 'ai_engineering', label: 'AI Engineering', countApprox: '4,440' },
    ],
  },
  {
    id: 'ai_specialization',
    label: 'AI Specialization',
    items: [
      { id: 'rag_builder', label: 'RAG Application Builder', countApprox: '321' },
      { id: 'agent_builder', label: 'Agent Builder', countApprox: '271' },
      { id: 'cloud_ml_platform', label: 'Cloud/ML Platform Engineer', countApprox: '161' },
      { id: 'ml_trainer', label: 'ML Trainer/Researcher', countApprox: '888' },
      { id: 'fullstack_ai', label: 'Full-Stack AI Engineer', countApprox: '255' },
      { id: 'devops_ai_infra', label: 'DevOps/Infra Engineer', countApprox: '83' },
    ],
  },
  {
    id: 'quality_security',
    label: 'Quality & Security',
    items: [
      { id: 'qa', label: 'QA', countApprox: '7,132' },
      { id: 'security', label: 'Security', countApprox: '10,567' },
      { id: 'hse', label: 'Health & Safety (HSE)', countApprox: '4,491' },
    ],
  },
  {
    id: 'design_creative',
    label: 'Design & Creative',
    items: [
      { id: 'design', label: 'Design', countApprox: '9,336' },
      { id: 'creative', label: 'Creative & Media', countApprox: '971' },
      { id: 'engineering_design', label: 'Engineering Design', countApprox: '8,356' },
    ],
  },
  {
    id: 'product_management',
    label: 'Product & Management',
    items: [
      { id: 'product_manager', label: 'Product Manager', countApprox: '14,200' },
      { id: 'program_manager', label: 'Program Manager', countApprox: '16,500' },
      { id: 'product_operations', label: 'Product Operations', countApprox: '3,800' },
      { id: 'scrum_master', label: 'Scrum / Agile Coach', countApprox: '2,400' },
    ],
  },
  {
    id: 'gtm_support',
    label: 'Go-to-market & Support',
    items: [
      { id: 'sales_rep', label: 'Account Executive / Sales', countApprox: '28,000' },
      { id: 'customer_success', label: 'Customer Success', countApprox: '12,500' },
      { id: 'solutions_engineer', label: 'Solutions Architect / Presales', countApprox: '7,400' },
      { id: 'customer_support', label: 'Customer Support', countApprox: '15,000' },
      { id: 'marketing', label: 'Growth & Product Marketing', countApprox: '11,200' },
    ],
  },
  {
    id: 'people_hr',
    label: 'People',
    items: [
      { id: 'recruiter', label: 'Recruiter & Talent Partner', countApprox: '8,600' },
      { id: 'hr_business_partner', label: 'HR Business Partner', countApprox: '7,200' },
      { id: 'people_ops', label: 'People Operations', countApprox: '4,900' },
    ],
  },
  {
    id: 'business_legal',
    label: 'Business & Legal',
    items: [
      { id: 'finance_accounting', label: 'Finance & Accounting', countApprox: '18,300' },
      { id: 'legal_counsel', label: 'Legal Counsel & Compliance', countApprox: '6,400' },
      { id: 'operations_sme', label: 'Real-Time / Business Operations', countApprox: '24,500' },
      { id: 'strategy_bizops', label: 'Strategy & BizOps', countApprox: '5,100' },
    ],
  },
  {
    id: 'consumer_services',
    label: 'Consumer & Services',
    items: [
      { id: 'healthcare_clinical', label: 'Healthcare & Clinical', countApprox: '14,000' },
      { id: 'logistics_transport', label: 'Logistics, Transport & Supply', countApprox: '16,000' },
      { id: 'hospitality', label: 'Hospitality & Services', countApprox: '9,500' },
      { id: 'skilled_trades', label: 'Skilled Trades & Construction', countApprox: '12,200' },
    ],
  },
];

export interface IndustryItem {
  id: string;
  label: string;
  countApprox?: string;
}

export const ALL_INDUSTRIES: IndustryItem[] = [
  { id: 'fintech', label: 'FinTech & Payments', countApprox: '45k+' },
  { id: 'ai', label: 'Artificial Intelligence', countApprox: '18k+' },
  { id: 'healthcare', label: 'Healthcare & HealthTech', countApprox: '15k+' },
  { id: 'ecommerce', label: 'E-Commerce & Retail', countApprox: '12k+' },
  { id: 'devtools', label: 'DevTools & Cloud Infra', countApprox: '10k+' },
  { id: 'cybersecurity', label: 'Cybersecurity', countApprox: '8k+' },
  { id: 'logistics', label: 'Logistics, Supply & Freight', countApprox: '9k+' },
  { id: 'travel', label: 'Travel, Hospitality & Tourism', countApprox: '5k+' },
  { id: 'climatetech', label: 'ClimateTech & Green Energy', countApprox: '6k+' },
  { id: 'edtech', label: 'EdTech & Education', countApprox: '4k+' },
  { id: 'govtech', label: 'GovTech & Public Sector', countApprox: '6k+' },
  { id: 'crypto', label: 'Crypto & Digital Assets', countApprox: '2k+' },
  { id: 'gamedev', label: 'Gaming & Interactive Media', countApprox: '3k+' },
  { id: 'media', label: 'Media, Streaming & Content', countApprox: '4k+' },
  { id: 'hrtech', label: 'HRTech & Work Platforms', countApprox: '4k+' },
  { id: 'adtech', label: 'AdTech & Marketing Tech', countApprox: '3k+' },
  { id: 'proptech', label: 'PropTech & Real Estate', countApprox: '2k+' },
  { id: 'mobility', label: 'Mobility, Automotive & EV', countApprox: '5k+' },
];

export interface CollectionItem {
  id: string;
  label: string;
  badge?: string;
  countApprox?: string;
}

export const ALL_VC_COLLECTIONS: CollectionItem[] = [
  { id: 'y_combinator', label: 'Y Combinator Backed', badge: 'YC', countApprox: '2.3k+' },
  { id: 'sequoia', label: 'Sequoia Capital', badge: 'SQ', countApprox: '3.0k+' },
  { id: 'a16z-portfolio', label: 'Andreessen Horowitz (a16z)', badge: 'a16z', countApprox: '1.5k+' },
  { id: 'accel', label: 'Accel Partners', badge: 'ACC', countApprox: '2.2k+' },
  { id: 'greylock', label: 'Greylock Partners', badge: 'GREY', countApprox: '600+' },
  { id: 'techstars', label: 'Techstars Alumni', badge: 'TS', countApprox: '750+' },
  { id: 'bond', label: 'BOND Capital', badge: 'BOND', countApprox: '700+' },
  { id: 'ai-native', label: 'AI-Native Startups', badge: 'AI', countApprox: '4.5k+' },
  { id: 'fortune500', label: 'Fortune 500 Enterprises', badge: 'F500', countApprox: '85k+' },
];

export interface SeniorityOption {
  id: string;
  label: string;
  countApprox?: string;
  level: string;
}

export const ALL_EXPERIENCE_LEVELS: SeniorityOption[] = [
  { id: 'student', label: 'Student / Apprentice', countApprox: '12k+', level: 'Early / Junior' },
  { id: 'intern', label: 'Internship', countApprox: '18k+', level: 'Early / Junior' },
  { id: 'junior', label: 'Entry-Level / Junior (0-2 yrs)', countApprox: '84k+', level: 'Early / Junior' },
  { id: 'middle', label: 'Mid-Level (2-5 yrs)', countApprox: '240k+', level: 'Mid-Level' },
  { id: 'senior', label: 'Senior Specialist (5-8 yrs)', countApprox: '310k+', level: 'Senior' },
  { id: 'lead', label: 'Lead / Tech Lead (8+ yrs)', countApprox: '92k+', level: 'Lead / Staff / Director' },
  { id: 'staff', label: 'Staff / Principal Engineer', countApprox: '45k+', level: 'Lead / Staff / Director' },
  { id: 'manager', label: 'Manager / Engineering Manager', countApprox: '68k+', level: 'Lead / Staff / Director' },
  { id: 'executive', label: 'Director / VP / C-Level', countApprox: '25k+', level: 'Lead / Staff / Director' },
];

export const POSTED_OPTIONS = [
  { id: 'all', label: 'Any time' },
  { id: '24h', label: 'Past 24 hours' },
  { id: '3d', label: 'Past 3 days' },
  { id: '7d', label: 'Past week' },
  { id: '14d', label: 'Past 2 weeks' },
  { id: '30d', label: 'Past month' },
];

export const WORKPLACE_MODES = [
  { id: 'all', label: 'Any workplace' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'On-site' },
];

export const EMPLOYMENT_TYPES = [
  { id: 'all', label: 'Any type' },
  { id: 'full_time', label: 'Full-time' },
  { id: 'part_time', label: 'Part-time' },
  { id: 'contract', label: 'Contract / Freelance' },
  { id: 'internship', label: 'Internship' },
];

export const POPULAR_LOCATIONS = [
  { id: 'all', label: 'Worldwide (All Locations)' },
  { id: 'remote', label: '🌍 Global Remote' },
  { id: 'United States', label: '🇺🇸 United States', countApprox: '3.1M+' },
  { id: 'United Kingdom', label: '🇬🇧 United Kingdom', countApprox: '720k+' },
  { id: 'India', label: '🇮🇳 India', countApprox: '143k+' },
  { id: 'Germany', label: '🇩🇪 Germany', countApprox: '580k+' },
  { id: 'Canada', label: '🇨🇦 Canada', countApprox: '640k+' },
  { id: 'Australia', label: '🇦🇺 Australia', countApprox: '460k+' },
  { id: 'Netherlands', label: '🇳🇱 Netherlands', countApprox: '310k+' },
  { id: 'Switzerland', label: '🇨🇭 Switzerland', countApprox: '190k+' },
  { id: 'Singapore', label: '🇸🇬 Singapore', countApprox: '210k+' },
  { id: 'UAE', label: '🇦🇪 United Arab Emirates (UAE)', countApprox: '340k+' },
  { id: 'France', label: '🇫🇷 France', countApprox: '380k+' },
  { id: 'Ireland', label: '🇮🇪 Ireland', countApprox: '180k+' },
  { id: 'Qatar', label: '🇶🇦 Qatar', countApprox: '95k+' },
  { id: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia', countApprox: '220k+' },
  { id: 'Europe', label: '🇪🇺 Europe (All)', countApprox: '1.8M+' },
];

export const POPULAR_SKILLS = [
  'Python', 'React', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes',
  'Node.js', 'Go', 'Java', 'Next.js', 'PyTorch', 'C++', 'Rust', 'GraphQL',
  'PostgreSQL', 'TailwindCSS', 'FastAPI', 'GCP', 'Linux', 'Terraform',
  'CI/CD', 'Product Strategy', 'Figma', 'System Design', 'Agile'
];
