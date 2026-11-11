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
      { id: 'technical_pm', label: 'Technical Product Manager (TPM)', countApprox: '6,400' },
      { id: 'growth_pm', label: 'Growth Product Manager', countApprox: '4,100' },
      { id: 'ai_pm', label: 'AI Product Manager', countApprox: '3,200' },
      { id: 'senior_pm', label: 'Senior Product Manager', countApprox: '9,800' },
      { id: 'group_pm', label: 'Group / Director of Product', countApprox: '2,900' },
      { id: 'associate_pm', label: 'Associate PM (APM)', countApprox: '1,800' },
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
  { id: 'fintech', label: 'FinTech & Payments', countApprox: '13,734' },
  { id: 'crypto', label: 'Crypto & Digital Assets', countApprox: '703' },
  { id: 'ecommerce', label: 'E-Commerce & Retail', countApprox: '3,680' },
  { id: 'gambling', label: 'Gambling & iGaming', countApprox: '901' },
  { id: 'gamedev', label: 'GameDev & Gaming', countApprox: '1,349' },
  { id: 'media', label: 'Media, Content & Streaming', countApprox: '1,984' },
  { id: 'travel', label: 'Travel & Hospitality', countApprox: '1,236' },
  { id: 'healthcare', label: 'Healthcare & HealthTech', countApprox: '5,993' },
  { id: 'edtech', label: 'EdTech & Education', countApprox: '1,154' },
  { id: 'govtech', label: 'GovTech & Defense', countApprox: '5,352' },
  { id: 'devtools', label: 'DevTools & Cloud Infra', countApprox: '5,910' },
  { id: 'cybersecurity', label: 'Cybersecurity', countApprox: '2,849' },
  { id: 'ai', label: 'AI & Machine Learning', countApprox: '4,647' },
  { id: 'hrtech', label: 'HRTech & Work', countApprox: '2,201' },
  { id: 'adtech', label: 'AdTech & Marketing', countApprox: '1,388' },
  { id: 'proptech', label: 'PropTech & Real Estate', countApprox: '1,140' },
  { id: 'logistics', label: 'Logistics, Supply & Freight', countApprox: '2,519' },
  { id: 'mobility', label: 'Mobility & Automotive', countApprox: '2,652' },
  { id: 'climatetech', label: 'ClimateTech & Clean Energy', countApprox: '2,864' },
  { id: 'other', label: 'Other Disciplines', countApprox: '24,738' },
];

export interface CompanyTypeItem {
  id: string;
  label: string;
  countApprox?: string;
}

export const ALL_COMPANY_TYPES: CompanyTypeItem[] = [
  { id: 'product', label: 'Product', countApprox: '36,833' },
  { id: 'startup', label: 'Startup', countApprox: '3,733' },
  { id: 'outsource', label: 'Outsource', countApprox: '15,803' },
  { id: 'outstaff', label: 'Outstaff', countApprox: '9,362' },
  { id: 'agency', label: 'Agency', countApprox: '2,142' },
  { id: 'inhouse', label: 'In-house', countApprox: '13,043' },
  { id: 'government', label: 'Government', countApprox: '2,923' },
];

export interface CollectionItem {
  id: string;
  label: string;
  badge?: string;
  countApprox?: string;
}

export const ALL_VC_COLLECTIONS: CollectionItem[] = [
  { id: 'y_combinator', label: 'Y Combinator', badge: 'YC', countApprox: '2,305' },
  { id: 'techstars', label: 'Techstars', badge: 'TS', countApprox: '754' },
  { id: 'a16z-portfolio', label: 'a16z', badge: 'a16z', countApprox: '1,564' },
  { id: 'a16z-speedrun', label: 'a16z Speedrun', badge: 'SR', countApprox: '49' },
  { id: 'sequoia', label: 'Sequoia Capital', badge: 'SQ', countApprox: '3,008' },
  { id: 'accel', label: 'Accel', badge: 'ACC', countApprox: '2,274' },
  { id: 'greylock', label: 'Greylock', badge: 'GREY', countApprox: '598' },
  { id: 'usv', label: 'Union Square Ventures', badge: 'USV', countApprox: '464' },
  { id: 'bond', label: 'BOND', badge: 'BOND', countApprox: '690' },
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

export interface CityOption {
  id: string;
  label: string;
  shortLabel?: string;
}

export const POPULAR_CITIES_BY_COUNTRY: Record<string, CityOption[]> = {
  India: [
    { id: 'India', label: 'Entire India (All Cities)', shortLabel: 'All India' },
    { id: 'Bengaluru', label: 'Bengaluru / Bangalore', shortLabel: 'Bengaluru' },
    { id: 'Hyderabad', label: 'Hyderabad', shortLabel: 'Hyderabad' },
    { id: 'Mumbai', label: 'Mumbai / MMR', shortLabel: 'Mumbai' },
    { id: 'Delhi NCR', label: 'Delhi NCR (Gurgaon / Noida / Delhi)', shortLabel: 'Delhi NCR' },
    { id: 'Chennai', label: 'Chennai', shortLabel: 'Chennai' },
    { id: 'Pune', label: 'Pune', shortLabel: 'Pune' },
    { id: 'Kolkata', label: 'Kolkata', shortLabel: 'Kolkata' },
    { id: 'Ahmedabad', label: 'Ahmedabad', shortLabel: 'Ahmedabad' },
  ],
  'United States': [
    { id: 'United States', label: 'Entire United States', shortLabel: 'All US' },
    { id: 'San Francisco Bay Area', label: 'SF Bay Area / Silicon Valley', shortLabel: 'SF Bay Area' },
    { id: 'New York', label: 'New York City Metro', shortLabel: 'NYC' },
    { id: 'Seattle', label: 'Seattle Metro', shortLabel: 'Seattle' },
    { id: 'Austin', label: 'Austin', shortLabel: 'Austin' },
    { id: 'Boston', label: 'Boston', shortLabel: 'Boston' },
  ],
  UAE: [
    { id: 'UAE', label: 'Entire UAE', shortLabel: 'All UAE' },
    { id: 'Dubai', label: 'Dubai', shortLabel: 'Dubai' },
    { id: 'Abu Dhabi', label: 'Abu Dhabi', shortLabel: 'Abu Dhabi' },
  ],
  'United Kingdom': [
    { id: 'United Kingdom', label: 'Entire United Kingdom', shortLabel: 'All UK' },
    { id: 'London', label: 'London Metro', shortLabel: 'London' },
    { id: 'Manchester', label: 'Manchester', shortLabel: 'Manchester' },
  ],
};

export const INDIA_CITIES = POPULAR_CITIES_BY_COUNTRY['India'];

export function getCountryForLocation(locId?: string): string | null {
  if (!locId || locId === 'All' || locId === 'all' || locId === 'remote') return null;
  for (const [country, cities] of Object.entries(POPULAR_CITIES_BY_COUNTRY)) {
    if (locId === country) return country;
    if (cities.some((c) => c.id === locId)) return country;
  }
  return null;
}

export function getLocationDisplayLabel(locId?: string): string {
  if (!locId || locId === 'All' || locId === 'all') return 'All Locations';
  if (locId === 'remote') return '🌍 Global Remote';
  for (const [country, cities] of Object.entries(POPULAR_CITIES_BY_COUNTRY)) {
    const city = cities.find((c) => c.id === locId);
    if (city) {
      const flag =
        country === 'India' ? '🇮🇳' :
        country === 'United States' ? '🇺🇸' :
        country === 'UAE' ? '🇦🇪' :
        country === 'United Kingdom' ? '🇬🇧' : '';
      if (city.id === country) return `${flag ? flag + ' ' : ''}${country}`;
      return `${flag ? flag + ' ' : ''}${city.shortLabel || city.label}, ${country}`;
    }
  }
  return locId;
}

export const POPULAR_SKILLS = [
  'Python', 'React', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes',
  'Node.js', 'Go', 'Java', 'Next.js', 'PyTorch', 'C++', 'Rust', 'GraphQL',
  'PostgreSQL', 'TailwindCSS', 'FastAPI', 'GCP', 'Linux', 'Terraform',
  'CI/CD', 'Product Strategy', 'Figma', 'System Design', 'Agile'
];

export interface BenefitPerkItem {
  id: string;
  label: string;
  category: 'Health & Wellness' | 'Financial & Equity' | 'Work-Life & Family' | 'Remote & Office' | 'Growth & Learning';
  popular?: boolean;
}

export const ALL_BENEFITS_PERKS: BenefitPerkItem[] = [
  // Health & Wellness
  { id: 'health_insurance', label: 'Health Insurance (Medical, Dental, Vision)', category: 'Health & Wellness', popular: true },
  { id: 'mental_health', label: 'Mental Health / Therapy Allowance', category: 'Health & Wellness' },
  { id: 'gym_wellness', label: 'Gym / Fitness Membership Stipend', category: 'Health & Wellness' },

  // Financial & Equity
  { id: 'equity_stock', label: 'Equity / Stock Options / RSUs', category: 'Financial & Equity', popular: true },
  { id: 'retirement_401k', label: '401(k) / Pension Match', category: 'Financial & Equity', popular: true },
  { id: 'annual_bonus', label: 'Annual Bonus / Performance Incentive', category: 'Financial & Equity' },

  // Work-Life & Family
  { id: 'parental_leave', label: 'Paid Parental Leave (12+ weeks)', category: 'Work-Life & Family', popular: true },
  { id: 'flexible_hours', label: 'Flexible Working Hours / Core Hours', category: 'Work-Life & Family', popular: true },
  { id: 'unlimited_pto', label: 'Generous / Unlimited Paid Time Off', category: 'Work-Life & Family', popular: true },
  { id: 'four_day_week', label: '4-Day Work Week / Summer Hours', category: 'Work-Life & Family' },

  // Remote & Office
  { id: 'remote_stipend', label: 'Home Office / WFH Equipment Stipend', category: 'Remote & Office', popular: true },
  { id: 'hardware_choice', label: 'Hardware of Choice (MacBook Pro / Displays)', category: 'Remote & Office' },
  { id: 'coworking_allowance', label: 'Coworking Space Pass / WeWork', category: 'Remote & Office' },

  // Growth & Learning
  { id: 'learning_budget', label: 'Annual Learning & L&D Budget ($1,500+)', category: 'Growth & Learning', popular: true },
  { id: 'conference_stipend', label: 'Conference Travel & Attendance Budget', category: 'Growth & Learning' },
];

export interface LanguageItem {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
  popular?: boolean;
}

export const ALL_LANGUAGES: LanguageItem[] = [
  { id: 'english', label: 'English', nativeLabel: 'English', flag: '🇬🇧', popular: true },
  { id: 'german', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', popular: true },
  { id: 'french', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', popular: true },
  { id: 'spanish', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', popular: true },
  { id: 'japanese', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { id: 'arabic', label: 'Arabic', nativeLabel: 'العربية', flag: '🇦🇪', popular: true },
  { id: 'mandarin', label: 'Mandarin Chinese', nativeLabel: '中文', flag: '🇨🇳' },
  { id: 'portuguese', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
  { id: 'italian', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { id: 'dutch', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱' },
  { id: 'swedish', label: 'Swedish', nativeLabel: 'Svenska', flag: '🇸🇪' },
  { id: 'polish', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱' },
  { id: 'hindi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
];

export interface RelocationOption {
  id: string;
  label: string;
  description: string;
  badge: string;
}

export const RELOCATION_OPTIONS: RelocationOption[] = [
  {
    id: 'relocation_assistance',
    label: 'Relocation Assistance Package',
    description: 'Employer covers relocation expenses, flights, or temporary living allowance.',
    badge: 'Relocation Help',
  },
  {
    id: 'visa_sponsorship',
    label: 'Visa Sponsorship Offered',
    description: 'Employer is able to sponsor work visas (H-1B, EU Blue Card, UK Skilled Worker, etc.).',
    badge: 'Visa Sponsor',
  },
  {
    id: 'work_authorization',
    label: 'Must Have Local Work Authorization',
    description: 'Applicant must already possess legal authorization to work in the country.',
    badge: 'Local Auth',
  },
  {
    id: 'worldwide_remote',
    label: 'Worldwide / Anywhere Remote',
    description: 'Employer hires globally through an Employer of Record (EoR) with no local residency requirement.',
    badge: 'Hire Anywhere',
  },
];
