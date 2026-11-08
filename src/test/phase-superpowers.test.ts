import { describe, it, expect } from 'vitest';
import { findSkillAdjacency, findAdjacenciesForMissingSkills } from '../jobstudio/utils/skillAdjacency';
import { detectMissingHaveSkills, injectMissingHaveSkill } from '../jobstudio/utils/missingHaveIntelligence';
import { calculateOptimalDeliveryWindow } from '../jobstudio/utils/deliveryWindow';
import { analyzeTrueRequisitionAge } from '../jobstudio/utils/freshnessSentinel';
import { generateRecruiterRoast } from '../jobstudio/utils/recruiterRoast';
import { TailoredResumeData } from '../jobstudio/data/defaultData';

describe('Phase 1 to 5 Superpowers Suite', () => {
  describe('Phase 1: Transferable Skill Adjacency Engine', () => {
    it('detects adjacent cloud equivalent when candidate has AWS and job asks for GCP', () => {
      const match = findSkillAdjacency('GCP', ['AWS', 'Docker', 'Python']);
      expect(match).not.toBeNull();
      expect(match?.candidateSkill).toBe('AWS');
      expect(match?.transferabilityScore).toBeGreaterThanOrEqual(0.9);
      expect(match?.bridgingStatement).toContain('AWS');
      expect(match?.bridgingStatement).toContain('GCP');
    });

    it('detects piping CAD equivalent (PDMS -> SP3D)', () => {
      const match = findSkillAdjacency('SP3D', ['PDMS', 'AutoCAD', 'Navisworks']);
      expect(match).not.toBeNull();
      expect(match?.candidateSkill).toBe('PDMS');
      expect(match?.transferabilityScore).toBeGreaterThanOrEqual(0.95);
      expect(match?.bridgingStatement).toContain('PDMS');
      expect(match?.bridgingStatement).toContain('SP3D');
    });

    it('returns null if candidate already has the exact skill', () => {
      const match = findSkillAdjacency('PostgreSQL', ['PostgreSQL', 'Docker']);
      expect(match).toBeNull();
    });

    it('finds adjacencies for a list of missing requirements', () => {
      const missing = ['GCP', 'Vue.js', 'Figma'];
      const candidate = ['AWS', 'React', 'Sketch'];
      const matches = findAdjacenciesForMissingSkills(missing, candidate);
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Phase 2: Missing-Have Intelligence', () => {
    const sampleMaster = `
Senior Piping Designer with 12+ years experience.
Proficient in SP3D, CAESAR II, ASME B31.3, and Navisworks.
Led clash detection across $80M petrochemical refinery project using Navisworks.
Deep knowledge of stress analysis and piping supports.
    `;

    it('detects skills present in Master Profile but omitted from draft skills', () => {
      const missingFromJob = ['SP3D', 'Kubernetes', 'Navisworks'];
      const draftSkills = ['AutoCAD', 'Piping Layout'];

      const missingHaves = detectMissingHaveSkills(missingFromJob, sampleMaster, draftSkills);
      const detectedNames = missingHaves.map((m) => m.skill);

      expect(detectedNames).toContain('SP3D');
      expect(detectedNames).toContain('Navisworks');
      expect(detectedNames).not.toContain('Kubernetes'); // Not in master
    });

    it('1-click injects verified missing-have skill into draft resume', () => {
      const mockResume: TailoredResumeData = {
        full_name: 'Test Engineer',
        email: 'test@example.com',
        phone: '1234567890',
        location: 'Houston, TX',
        linkedin: 'linkedin.com/in/test',
        tailored_summary: 'Experienced designer.',
        skills: ['AutoCAD'],
        experiences: [
          {
            company: 'EPC Corp',
            role: 'Piping Designer',
            period: '2020 - Present',
            location: 'Houston, TX',
            bullets: ['Developed equipment layout designs.'],
          },
        ],
        education: [],
        certifications: [],
      };

      const item = {
        skill: 'SP3D',
        evidenceQuote: 'Proficient in SP3D, CAESAR II, ASME B31.3',
        confidence: 0.95,
        recommendedAction: 'inject_into_skills' as const,
        suggestedBullet: 'Engineered complex plant piping routes in SP3D.',
      };

      const updated = injectMissingHaveSkill(mockResume, item);
      expect(updated.skills).toContain('SP3D');
      expect(updated.experiences[0].bullets[0]).toContain('SP3D');
    });
  });

  describe('Phase 3: Optimal Application Delivery Window', () => {
    it('rates Tuesday 9:30 AM as optimal window with 2.4x callback multiplier', () => {
      // 2026-11-10 is a Tuesday (10:00 AM)
      const tuesdayMorning = new Date('2026-11-10T10:00:00Z');
      const analysis = calculateOptimalDeliveryWindow('UTC', tuesdayMorning);

      expect(analysis.tier).toBe('optimal');
      expect(analysis.callbackMultiplier).toBe('2.4x');
      expect(analysis.badgeText).toContain('2.4x');
    });

    it('rates Friday evening as suboptimal window with high burial risk', () => {
      // 2026-11-13 is a Friday (18:00 = 6 PM)
      const fridayEvening = new Date('2026-11-13T18:00:00Z');
      const analysis = calculateOptimalDeliveryWindow('UTC', fridayEvening);

      expect(analysis.tier).toBe('suboptimal');
      expect(analysis.nextBestWindow).toContain('Tuesday');
    });
  });

  describe('Phase 4: Fake Freshness & True Age Sentinel', () => {
    it('detects bumped requisition when JD contains stale year deadline but says 1 day ago', () => {
      const report = analyzeTrueRequisitionAge({
        id: 'job-fresh-1',
        title: 'Senior Piping Engineer',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        rawDescription: 'Leading offshore projects. Applications close in October 2022. Contact HR.',
      });

      expect(report.isBumped).toBe(true);
      expect(report.freshnessCategory).toBe('bumped_repost');
      expect(report.badgeLabel).toContain('Bumped Requisition');
    });

    it('detects old requisition from REQ code year', () => {
      const report = analyzeTrueRequisitionAge({
        id: 'req-2022-8941',
        title: 'Backend Developer',
        publishedAt: new Date().toISOString(),
        rawDescription: 'Join our payments team. Competitive salary.',
      });

      expect(report.isBumped).toBe(true);
      expect(report.badgeLabel).toContain('2022');
    });

    it('flags verified fresh listings under 5 days old', () => {
      const report = analyzeTrueRequisitionAge({
        id: 'req-2026-001',
        title: 'Cloud Architect',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rawDescription: 'Brand new position opened for Q4 2026 roadmap.',
      });

      expect(report.isBumped).toBe(false);
      expect(report.freshnessCategory).toBe('genuinely_fresh');
      expect(report.badgeLabel).toContain('Verified Fresh');
    });
  });

  describe('Phase 5: Recruiter 6-Second Roast Mode', () => {
    it('identifies passive fluff words and generates unvarnished roast', () => {
      const fluffResume: TailoredResumeData = {
        full_name: 'Fluff Candidate',
        email: 'fluff@test.com',
        phone: '123',
        location: 'Remote',
        linkedin: 'linkedin.com/in/fluff',
        tailored_summary: 'Results-oriented hard-working professional and team player with dynamic communication.',
        skills: ['Communication', 'Teamwork', 'Piping'],
        experiences: [
          {
            company: 'Tech Corp',
            role: 'Designer',
            period: '2021 - Present',
            location: 'Remote',
            bullets: ['Responsible for working on engineering tasks with great synergy.'],
          },
        ],
        education: [],
        certifications: [],
      };

      const roast = generateRecruiterRoast(fluffResume, 'Senior Piping Designer');

      expect(roast.fluffWordsDetected.length).toBeGreaterThanOrEqual(3);
      expect(roast.unvarnishedRoast.some((r) => r.includes('buzzwords') || r.includes('generic'))).toBe(true);
      expect(roast.actionableUpgrades.length).toBeGreaterThan(0);
      expect(roast.signalToFluffScore).toBeLessThan(75);
    });

    it('scores high signal-to-fluff for metric-dense resume', () => {
      const highSignalResume: TailoredResumeData = {
        full_name: 'High Signal Engineer',
        email: 'high@test.com',
        phone: '123',
        location: 'Bangalore',
        linkedin: 'linkedin.com/in/signal',
        tailored_summary: 'Senior Piping Designer delivering 14 EPC refinery packages on SP3D across $120M projects.',
        skills: ['SP3D', 'PDMS', 'CAESAR II', 'ASME B31.3', 'Navisworks'],
        experiences: [
          {
            company: 'Arcadis',
            role: 'Lead Piping Designer',
            period: '2019 - Present',
            location: 'Bangalore',
            bullets: [
              'Routed 4,500m of high-pressure piping across 6 refinery units, reducing clash rework by 28%.',
              'Directed 8 junior designers on SP3D, saving $340k in fabrication redesign costs.',
            ],
          },
        ],
        education: [],
        certifications: [],
      };

      const roast = generateRecruiterRoast(highSignalResume, 'Senior Piping Designer');

      expect(roast.metricCount).toBeGreaterThanOrEqual(4);
      expect(roast.signalToFluffScore).toBeGreaterThanOrEqual(80);
      expect(roast.verdict).toBe('Elite (Top 5%)');
    });
  });
});
