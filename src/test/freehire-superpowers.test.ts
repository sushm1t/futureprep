import { describe, it, expect } from 'vitest';
import { detectGhostJobSignal } from '../jobstudio/utils/ghostJobDetector';
import { extractEvidenceAtoms, verifyBulletAgainstBank } from '../jobstudio/utils/experienceBank';
import { classifyRecruiterEmail } from '../jobstudio/utils/recruiterEmailClassifier';
import { generateAtsApplicationDossier } from '../jobstudio/utils/screeningAnswerBank';
import { generateTracerToken } from '../jobstudio/utils/tracerLinks';
import { scoreAtsReadiness } from '../jobstudio/utils/atsReadinessScorer';
import { TailoredResumeData } from '../jobstudio/data/defaultData';

describe('10x Freehire Superpowers Integration Suite', () => {
  describe('Ghost Job Detector', () => {
    it('detects evergreen jobs open for more than 180 days', () => {
      const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
      const signal = detectGhostJobSignal({
        title: 'Backend Engineer',
        company: 'Stripe',
        publishedAt: oldDate,
        platform: 'Greenhouse',
      });

      expect(signal.level).toBe('likely');
      expect(signal.badgeColor).toBe('rose');
      expect(signal.criteria.some((c) => c.code === 'evergreen_posting')).toBe(true);
    });

    it('identifies fresh direct requisitions as verified direct', () => {
      const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const signal = detectGhostJobSignal({
        title: 'Frontend Engineer',
        company: 'Figma',
        publishedAt: recentDate,
        platform: 'Greenhouse',
      });

      expect(signal.level).toBe('none');
      expect(signal.isVerifiedDirect).toBe(true);
      expect(signal.badgeColor).toBe('emerald');
    });
  });

  describe('Experience Bank & Provenance Guard', () => {
    it('extracts atomic evidence statements and detects metrics', () => {
      const profile = `
Senior Operations Specialist at Revolut
- Scaled disputes resolution pipeline from 200 to 1,200 daily transactions.
- Architected automated reconciliation scripts in Python reducing discrepancies by 45%.
      `;
      const atoms = extractEvidenceAtoms(profile, 'user_asserted');
      expect(atoms.length).toBeGreaterThanOrEqual(2);
      expect(atoms.some((a) => a.category === 'metric')).toBe(true);
      expect(atoms.every((a) => a.provenance === 'user_asserted')).toBe(true);
    });

    it('verifies tailored bullet against experience bank', () => {
      const profile = `Managed international wire payment operations processing $20M daily.`;
      const bank = extractEvidenceAtoms(profile, 'user_asserted');

      const matchingBullet = 'Led international wire payment operations processing high-volume daily transactions.';
      const result = verifyBulletAgainstBank(matchingBullet, bank);
      expect(result.isBackedByBank).toBe(true);
      expect(result.provenance).toBe('user_asserted');

      const fabricatedBullet = 'Published 3 peer-reviewed quantum computing research papers in Nature.';
      const fabricatedResult = verifyBulletAgainstBank(fabricatedBullet, bank);
      expect(fabricatedResult.isBackedByBank).toBe(false);
      expect(fabricatedResult.provenance).toBe('model_inferred');
    });
  });

  describe('Recruiter Email Classifier', () => {
    it('classifies interview invitations and extracts scheduling link', () => {
      const email = `
Hi Alex,
Thanks for your patience. The team was impressed by your background and we would like to invite you to Round 1 Technical Interview.
Please select a convenient time slot on my Calendly: https://calendly.com/recruiter-figma/30min
      `;
      const result = classifyRecruiterEmail(email, 'Invitation to Interview - Figma');
      expect(result.signal).toBe('interview_invitation');
      expect(result.recommendedStage).toBe('Interviewing');
      expect(result.schedulingLink).toContain('calendly.com/recruiter-figma');
    });

    it('classifies rejection emails accurately', () => {
      const email = `Thank you for your interest in our company. After careful consideration, we have decided to pursue other candidates whose qualifications more closely align with our current needs. We will keep your resume on file.`;
      const result = classifyRecruiterEmail(email, 'Update on your application');
      expect(result.signal).toBe('rejection');
      expect(result.recommendedStage).toBe('Archived');
    });

    it('classifies job offers accurately', () => {
      const email = `We are pleased to offer you the position of Senior Operations Manager with an annual compensation package detailed in the attached formal offer letter. Congratulations!`;
      const result = classifyRecruiterEmail(email, 'Official Job Offer');
      expect(result.signal).toBe('offer');
      expect(result.recommendedStage).toBe('Offer');
    });
  });

  describe('Screening Answer Bank & Tracer Links', () => {
    it('generates formatted 1-click ATS application dossier', () => {
      const answers = [
        {
          id: '1',
          topic: 'salary' as const,
          questionLabel: 'Desired Salary',
          answerText: '$135,000 / year',
          source: 'user_defined' as const,
          updatedAt: new Date().toISOString(),
        },
      ];
      const dossier = generateAtsApplicationDossier(answers, {
        candidateName: 'Alex Rivera',
        email: 'alex@example.com',
      });
      expect(dossier).toContain('ATS ONE-CLICK APPLICATION DOSSIER');
      expect(dossier).toContain('Applicant: Alex Rivera');
      expect(dossier).toContain('$135,000 / year');
    });

    it('generates secure tracer tokens', () => {
      const token = generateTracerToken('https://portfolio.alex.dev', 'portfolio');
      expect(token).toMatch(/^tr_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe('Candidate-Centric Filtration & Eligibility Logic', () => {
    const sampleJobs = [
      {
        id: 'job-1',
        title: 'Senior Product Manager - Payments',
        company: 'Stripe',
        descriptionSnippet: 'Leading payment disputes product. 5+ years experience required. Comprehensive health insurance, 401(k) match, and generous equity. English fluent. Visa sponsorship available.',
        skills: ['Product Strategy', 'SQL', 'FinTech'],
      },
      {
        id: 'job-2',
        title: 'Backend Engineer (Go)',
        company: 'Monzo',
        descriptionSnippet: 'Distributed banking systems. 3+ years experience. Remote stipend, unlimited PTO, and flexible hours. English and German preferred. Local work authorization required.',
        skills: ['Go', 'Kubernetes', 'PostgreSQL'],
      },
      {
        id: 'job-3',
        title: 'Engineering Manager - Core Platform',
        company: 'Figma',
        descriptionSnippet: 'People manager leading 8 senior engineers. 8+ years experience. Relocation assistance package provided, full health coverage and stock options.',
        skills: ['System Design', 'People Management', 'TypeScript'],
      },
    ];

    it('filters by candidate product specialization accurately', () => {
      const isProductManager = (j: typeof sampleJobs[0]) =>
        /product\s*manag|group\s*pm|\bpm\b/i.test(`${j.title} ${j.descriptionSnippet}`);

      const matching = sampleJobs.filter(isProductManager);
      expect(matching.length).toBe(1);
      expect(matching[0].company).toBe('Stripe');
    });

    it('filters by People Manager role type', () => {
      const isPeopleManager = (j: typeof sampleJobs[0]) =>
        /manager|director|lead/i.test(j.title);

      const matching = sampleJobs.filter(isPeopleManager);
      expect(matching.length).toBe(2); // Senior Product Manager, Engineering Manager
      expect(matching.some((j) => j.title.includes('Engineering Manager'))).toBe(true);
    });

    it('evaluates benefits and perks in flexible vs mandatory strictness mode', () => {
      const checkBenefits = (j: typeof sampleJobs[0], requiredBenefits: string[], isStrict: boolean) => {
        const text = `${j.title} ${j.descriptionSnippet}`.toLowerCase();
        const testBenefit = (b: string) => {
          if (b === 'health_insurance') return /health|medical|insurance/i.test(text);
          if (b === 'equity_stock') return /equity|stock/i.test(text);
          if (b === 'remote_stipend') return /remote\s*stipend|wfh/i.test(text);
          return false;
        };

        return isStrict
          ? requiredBenefits.every(testBenefit)
          : requiredBenefits.some(testBenefit);
      };

      // In flexible (any) mode: matches if job has health OR equity OR remote stipend
      const flexible = sampleJobs.filter((j) => checkBenefits(j, ['health_insurance', 'remote_stipend'], false));
      expect(flexible.length).toBe(3); // All 3 have either health or remote stipend

      // In mandatory (all) mode: must have BOTH health AND equity
      const mandatory = sampleJobs.filter((j) => checkBenefits(j, ['health_insurance', 'equity_stock'], true));
      expect(mandatory.length).toBe(2); // Stripe and Figma have both; Monzo doesn't
      expect(mandatory.map((j) => j.company)).toEqual(['Stripe', 'Figma']);
    });

    it('evaluates language requirements and visa sponsorship eligibility', () => {
      const checkEligibility = (j: typeof sampleJobs[0], lang: string, visaNeeded: boolean) => {
        const text = `${j.title} ${j.descriptionSnippet}`.toLowerCase();
        const hasLang = text.includes(lang.toLowerCase());
        const hasVisa = !visaNeeded || /visa\s*sponsor/i.test(text);
        return hasLang && hasVisa;
      };

      const germanJobs = sampleJobs.filter((j) => checkEligibility(j, 'German', false));
      expect(germanJobs.length).toBe(1);
      expect(germanJobs[0].company).toBe('Monzo');

      const visaSponsorJobs = sampleJobs.filter((j) => checkEligibility(j, 'English', true));
      expect(visaSponsorJobs.length).toBe(1);
      expect(visaSponsorJobs[0].company).toBe('Stripe');
    });
  });

  describe('Freehire-Style ATS Readiness Scorer (atscheck)', () => {
    const sampleResume: TailoredResumeData = {
      full_name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/alexrivera-ops',
      tailored_summary: 'Senior Fintech Operations Specialist with 7 years of experience scaling dispute pipelines, cross-border payments, and risk workflows across high-velocity platforms.',
      skills: ['Payment Operations', 'Dispute Resolution', 'SQL', 'Python', 'Chargebacks', 'Fraud Prevention', 'Cross-Border Settlements'],
      experiences: [
        {
          role: 'Senior Operations Lead',
          company: 'Revolut',
          period: '2023 – Present',
          location: 'London / Remote',
          bullets: [
            'Built automated payment disputes triage system processing 1,400 daily cases with 99.4% accuracy.',
            'Scaled international settlement reconciliation scripts in Python reducing month-end variance by 45%.',
            'Led cross-functional team of 6 analysts resolving chargebacks under 24-hour SLA.',
          ],
        },
        {
          role: 'Operations Analyst',
          company: 'Stripe',
          period: '2020 – 2023',
          location: 'San Francisco, CA',
          bullets: [
            'Optimized card processing fraud alert pipelines saving $2.4M annually in illegitimate refunds.',
            'Architected internal reporting dashboards in SQL tracking settlement throughput across 14 currencies.',
            'Delivered quarterly compliance audits with zero regulatory exceptions.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.S. in Economics',
          institution: 'UC Berkeley',
          year: '2020',
        },
      ],
      certifications: ['Certified Payments Professional (CPP)'],
    };

    it('evaluates five categories with maximum points summing to 100', () => {
      const targetKeywords = ['Payment Operations', 'Dispute Resolution', 'SQL', 'Python', 'Reconciliation', 'Kafka', 'Go'];
      const report = scoreAtsReadiness(sampleResume, targetKeywords);

      expect(report.categories.length).toBe(5);
      const totalMax = report.categories.reduce((acc, c) => acc + c.max, 0);
      expect(totalMax).toBe(100);

      const [keyword, format, sections, content, length] = report.categories;
      expect(keyword.max).toBe(40);
      expect(format.max).toBe(20);
      expect(sections.max).toBe(15);
      expect(content.max).toBe(15);
      expect(length.max).toBe(10);
    });

    it('identifies strong vs missing keywords and awards proportional score', () => {
      const targetKeywords = ['Payment Operations', 'Dispute Resolution', 'SQL', 'Kubernetes', 'Go'];
      const report = scoreAtsReadiness(sampleResume, targetKeywords);

      expect(report.strongKeywords).toContain('Payment Operations');
      expect(report.strongKeywords).toContain('Dispute Resolution');
      expect(report.strongKeywords).toContain('SQL');
      expect(report.recommendedKeywords).toContain('Kubernetes');
      expect(report.recommendedKeywords).toContain('Go');

      // 3 of 5 matched = 60% of 40 = 24 points
      const keywordCategory = report.categories.find((c) => c.id === 'keyword_strength');
      expect(keywordCategory?.score).toBe(24);
    });

    it('verifies format compliance checks (machine-readable, contact info, reverse-chronological)', () => {
      const report = scoreAtsReadiness(sampleResume);
      const formatCategory = report.categories.find((c) => c.id === 'format_compliance');

      expect(formatCategory?.score).toBe(20); // Passes all format checks
      expect(formatCategory?.items.every((it) => it.status === 'pass')).toBe(true);
    });

    it('detects strong action verbs and quantified metrics in bullet points', () => {
      const report = scoreAtsReadiness(sampleResume);

      expect(report.actionVerbCount).toBeGreaterThanOrEqual(4); // Built, Scaled, Led, Optimized, Architected, Delivered
      expect(report.quantifiedMetricsCount).toBeGreaterThanOrEqual(3); // 99.4%, 45%, $2.4M

      const contentCategory = report.categories.find((c) => c.id === 'content_quality');
      expect(contentCategory?.score).toBe(15); // Max points
    });

    it('computes overall and potential recoverable points correctly', () => {
      // Resume missing a few target keywords
      const targetKeywords = ['Payment Operations', 'Dispute Resolution', 'Kubernetes', 'Go', 'Rust', 'Kafka'];
      const report = scoreAtsReadiness(sampleResume, targetKeywords);

      expect(report.overall).toBeGreaterThanOrEqual(70);
      expect(report.potential).toBeGreaterThanOrEqual(report.overall);
      expect(report.potential).toBeLessThanOrEqual(100);
      expect(report.topFixes.length).toBeGreaterThan(0);
    });
  });
});
