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
      const firstWord = b.trim().replace(/^[^a-zA-Z]+/, '').split(/\s+/)[0].toLowerCase();
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
    const raw = 'worked on piping and checked clashes';
    const polished = polishBulletWithAi(raw, 'engineering');
    expect(polished).toMatch(/^(Engineered|Spearheaded|Architected|Designed|Optimized)/i);
    expect(polished).toMatch(/%|\d+\s?(?:hours|deliverables|clashes|projects)/i);
  });
});
