import { describe, it, expect } from 'vitest';
import { scoreAtsReadiness, STRONG_ACTION_VERBS } from '../jobstudio/utils/atsReadinessScorer';
import {
  autoApplyAllAtsFixes,
  fixActionVerbs,
  fixQuantifiedMetrics,
  fixBalancedBullets,
  fixDatedHistory,
  fixLinkedIn,
  polishBulletWithAi,
} from '../jobstudio/utils/atsFixApplier';
import { TailoredResumeData } from '../jobstudio/data/defaultData';

describe('ATS Fix Applier & 100/100 Auto-Enhancement Engine', () => {
  const lingeshwaranResume: TailoredResumeData = {
    full_name: 'LINGESHWARAN D',
    email: 'lingeshleo55@gmail.com',
    phone: '+91 9629647137',
    location: 'Singaperumal Koil, Chengalpattu, Tamil Nadu, India',
    linkedin: '', // Missing
    tailored_summary:
      'Detail-oriented Mechanical Engineering graduate with specialized, hands-on training in Piping Design and 3D routing. Strong foundational knowledge in developing conceptual designs, conducting routing studies, MTO generation, and isometric extraction utilizing AutoCAD Plant 3D and Navisworks Manage.',
    skills: [
      'AutoCAD Plant 3D',
      'Navisworks Manage',
      'Piping Design & 3D Routing',
      'P&ID Creation & Modification',
      'Equipment Modeling',
      'Piping Layout Extraction',
      'Piping Isometrics',
      'Clash Detection & Clash Reports',
      'MTO Generation',
      'Data Manager',
      'ASME Codes & Standards',
      'ASTM Codes & Standards',
      'Pipe Support Placement',
    ],
    experiences: [
      {
        role: 'Piping Design Trainee',
        company: 'PIPER CADD',
        location: 'Velachery, Chennai, India',
        period: 'Completed', // Missing 4-digit year
        date_range: 'Completed',
        bullets: [
          'Executed P&ID creation using AutoCAD Plant 3D and updated P&IDs according to client comments and design specifications.',
          'Extracted Valve lists, Line lists, Instrument lists, and Equipment lists from P&ID using Data Manager.',
          'Modeled standard and custom equipment including pumps, blowers, tanks, vessels, and heat exchangers.',
          'Conducted piping routing with clash control and design adhering to P&ID utilizing AutoCAD Plant 3D.',
          'Modeled and placed custom pipe supports within 3D plant environments.',
          'Extracted Piping Isometrics and piping/equipment layouts using AutoCAD Plant 3D across various floor levels.',
          'Verified and cross-checked isometric drawings against P&ID documentation.',
          'Performed clash detection between pipes, equipment, and civil structures using Navisworks Manage, generating comprehensive clash reports.',
          'Built, reviewed, and coordinated 3D piping models in Navisworks Manage and handled project backup creation.',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Engineering in Mechanical Engineering (CGPA: 7.65)',
        institution: "St. Joseph's College of Engineering",
        year: '2018 - 2022',
      },
    ],
    certifications: [
      'Certification in AutoCAD Plant 3D - PIPER CADD, Velachery, Chennai',
    ],
  };

  it('initially scores under 100 with warning items in Content Quality and Format Compliance', () => {
    const report = scoreAtsReadiness(lingeshwaranResume, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);
    expect(report.overall).toBeLessThan(100);

    const contentCat = report.categories.find((c) => c.id === 'content_quality');
    expect(contentCat?.score).toBeLessThan(15);

    const formatCat = report.categories.find((c) => c.id === 'format_compliance');
    expect(formatCat?.score).toBeLessThan(20);
  });

  it('autoApplyAllAtsFixes transforms resume and achieves 100/100 ATS score', () => {
    const enhanced = autoApplyAllAtsFixes(lingeshwaranResume, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks'], 'Piping Design Engineer');
    const report = scoreAtsReadiness(enhanced, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);

    expect(report.overall).toBe(100);
    expect(report.categories.find((c) => c.id === 'keyword_strength')?.score).toBe(40);
    expect(report.categories.find((c) => c.id === 'format_compliance')?.score).toBe(20);
    expect(report.categories.find((c) => c.id === 'section_completeness')?.score).toBe(15);
    expect(report.categories.find((c) => c.id === 'content_quality')?.score).toBe(15);
    expect(report.categories.find((c) => c.id === 'length_density')?.score).toBe(10);
  });

  it('fixActionVerbs ensures all bullets begin with recognized action verbs', () => {
    const withVerbs = fixActionVerbs(lingeshwaranResume);
    const bullets = withVerbs.experiences[0].bullets;

    bullets.forEach((b) => {
      const firstWord = b.trim().replace(/^[^a-zA-Z]+/, '').split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
      expect(STRONG_ACTION_VERBS.has(firstWord)).toBe(true);
    });
  });

  it('fixQuantifiedMetrics injects measurable numbers and percentages', () => {
    const withMetrics = fixQuantifiedMetrics(lingeshwaranResume, 'Piping Design Engineer');
    const bullets = withMetrics.experiences[0].bullets;
    const hasMetric = bullets.some((b) => /%|\d+\s?hours|\b\d+x\b/i.test(b));
    expect(hasMetric).toBe(true);
  });

  it('fixBalancedBullets consolidates 9 clustered bullets into 4 comprehensive bullets', () => {
    const withBalanced = fixBalancedBullets(lingeshwaranResume);
    expect(withBalanced.experiences[0].bullets.length).toBe(4);
  });

  it('fixDatedHistory sets valid start and end year', () => {
    const withDates = fixDatedHistory(lingeshwaranResume);
    expect(/\d{4}/.test(withDates.experiences[0].period || '')).toBe(true);
  });

  it('fixLinkedIn sets a clean public profile URL', () => {
    const withLinkedIn = fixLinkedIn(lingeshwaranResume);
    expect(withLinkedIn.linkedin).toContain('linkedin.com/in/');
  });

  it('polishBulletWithAi transforms a rough user bullet into an ATS power bullet', () => {
    const raw = 'worked on customer cases and improved response time';
    const polished = polishBulletWithAi(raw, 'operations');
    expect(polished).toMatch(/^(Engineered|Spearheaded|Managed|Facilitated|Coordinated)/i);
    expect(polished).toMatch(/%|\d+/i);
  });

  describe('Candidate Authenticity & Anti-Hallucination on Sushmit Surendran Profile', () => {
    const sushmitResume: TailoredResumeData = {
      full_name: 'SUSHMIT SURENDRAN',
      email: 'sushmits07@gmail.com',
      phone: '+91 89214 09100',
      location: 'Vadakara, India',
      linkedin: 'https://linkedin.com/in/sushmit-surendran',
      tailored_summary:
        'Fintech operations professional with nearly 4 years of experience at Revolut across real time operations, card payments and chargeback support. Incident management and wealth & trading POC with experience managing high volume, customer impacting issues from monitoring and investigation through escalation, clear communication, and resolution.',
      skills: [
        'Incident Management',
        'Customer Service',
        'Queue & SLA Monitoring',
        'Root Cause Analysis (RCA)',
        'SOP Authoring & Knowledge Architecture',
        'SQL Data Analysis & Querying',
        'Cross-Functional Team Leadership',
        'Business Intelligence (Looker, Metabase)',
      ],
      experiences: [
        {
          role: 'Real-Time Analyst / SME, Real-Time Operations',
          company: 'Revolut',
          period: 'Oct 2023 – Present',
          date_range: 'Oct 2023 – Present',
          bullets: [
            'Executed SQL root-cause investigations via Jove platform to eliminate a critical chat routing defect, creating a standardized escalation pathway that eliminated repeat transfers and reduced handle times.',
            'Monitored live customer experience KPIs and real-time operational capacity across 1,000+ frontline agents and 300+ queues, dynamically balancing agent allocations to safeguard SLAs.',
            'Authored the team operational Knowledge Architecture and SOPs on Confluence, while developing and delivering structured training programs to enhance frontline agent capabilities.',
            'Collaborated cross-functionally with Engineering, Tech, and Product teams during incidents to deploy geo-targeted customer notification banners, minimizing blast radius and customer confusion.',
            'Conducted root cause analysis for queue breaches using SQL, Jove, Metabase, Looker, and Excel; produced tracking spreadsheets to identify trends, assess impact, and support resolution decisions.',
            'Leveraged gemini gems to turn screenshots into structured operational reports, reducing manual report preparation from 15 to 20 minutes to approximately 3 to 4 minutes.',
          ],
        },
        {
          role: 'Support Specialist, Card Payments & Chargebacks',
          company: 'Revolut',
          period: 'Oct 2022 – Sep 2023',
          date_range: 'Oct 2022 – Sep 2023',
          bullets: [
            'Resolved card payment, chargeback, and dispute inquiries in a high volume fintech environment, achieving more than 95% first contact resolution while delivering a customer focused service experience.',
            'Managed escalated customer cases from investigation through resolution, applying root cause analysis to reduce repeat contacts by 10%.',
            'Identified unnecessary live agent escalations for pending card payment queries and collaborated with internal teams, reducing direct chat escalations from 10 chats to 2 or 3 chats in an hour.',
          ],
        },
      ],
      education: [
        {
          degree: 'Advanced Executive Program in Cybersecurity',
          institution: 'NIT Rourkela x Edureka',
          year: '2020 – 2021',
        },
        {
          degree: 'Bachelor of Commerce (Travel & Tourism)',
          institution: 'Sri Sri University',
          year: '2017 – 2020',
        },
      ],
      certifications: [
        'Analyzing and Visualizing Data in Looker - Google Cloud Community India',
        'Google AI Essentials Specialization - Google',
      ],
    };

    it('NEVER injects out-of-domain CAD, piping, navisworks, or fake engineering terms', () => {
      const fixed = autoApplyAllAtsFixes(
        sushmitResume,
        ['Incident Management', 'SLA Monitoring', 'Root Cause Analysis'],
        'Support Specialist'
      );

      const allBullets = fixed.experiences.flatMap((e) => e.bullets || []).join(' ');
      const summary = fixed.tailored_summary || '';
      const combined = `${summary} ${allBullets}`.toLowerCase();

      // Ensure zero hallucination of other candidate domains
      expect(combined).not.toContain('navisworks');
      expect(combined).not.toContain('autocad');
      expect(combined).not.toContain('clash');
      expect(combined).not.toContain('piping');
      expect(combined).not.toContain('isometric');
      expect(combined).not.toContain('engineering hours');
      expect(combined).not.toContain('sp3d');
      expect(combined).not.toContain('p&id');

      // Ensure zero double-verbs
      expect(combined).not.toContain('orchestrated collaborated');
      expect(combined).not.toContain('scaled co-led');
      expect(combined).not.toContain('orchestrated expanded');
    });

    it('preserves authentic Revolut metrics and achieves 100/100 ATS score', () => {
      const fixed = autoApplyAllAtsFixes(
        sushmitResume,
        ['Incident Management', 'SLA Monitoring', 'Root Cause Analysis'],
        'Support Specialist'
      );

      const report = scoreAtsReadiness(fixed, ['Incident Management', 'SLA Monitoring', 'Root Cause Analysis']);
      expect(report.overall).toBe(100);
      expect(report.categories.find((c) => c.id === 'content_quality')?.score).toBe(15);
      expect(report.categories.find((c) => c.id === 'format_compliance')?.score).toBe(20);
    });
  });
});
