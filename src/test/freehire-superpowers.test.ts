import { describe, it, expect } from 'vitest';
import { detectGhostJobSignal } from '../jobstudio/utils/ghostJobDetector';
import { extractEvidenceAtoms, verifyBulletAgainstBank } from '../jobstudio/utils/experienceBank';
import { classifyRecruiterEmail } from '../jobstudio/utils/recruiterEmailClassifier';
import { generateAtsApplicationDossier } from '../jobstudio/utils/screeningAnswerBank';
import { generateTracerToken } from '../jobstudio/utils/tracerLinks';

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
});
