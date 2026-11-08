import { describe, it, expect } from 'vitest';
import {
  evaluateHardConstraints,
  extractCandidateTotalYears,
  extractRequiredYearsFromJD,
  isDegreeOptionalInJD,
  BLOCKER_RULES,
} from '../jobstudio/utils/hardConstraints';

describe('Deterministic Hard-Constraint Blocker Engine', () => {
  it('extracts candidate years accurately from profile text', () => {
    expect(extractCandidateTotalYears('Fintech professional with 6 years of experience in payment operations')).toBe(6);
    expect(extractCandidateTotalYears('Senior Software Engineer with 8+ years experience')).toBe(8);
  });

  it('extracts required years accurately from job description', () => {
    expect(extractRequiredYearsFromJD('Requires 5+ years of experience in distributed systems')).toBe(5);
    expect(extractRequiredYearsFromJD('3-5 years experience leading cross-functional teams')).toBe(3);
    expect(extractRequiredYearsFromJD('No mention of timeline')).toBeNull();
  });

  it('detects degree optional clauses', () => {
    expect(isDegreeOptionalInJD("Bachelor's degree in Computer Science or equivalent practical experience")).toBe(true);
    expect(isDegreeOptionalInJD('Degree optional for candidates with strong portfolio')).toBe(true);
    expect(isDegreeOptionalInJD("Mandatory Master's degree required")).toBe(false);
  });

  it('enforces score ceiling of 50% when work authorization / citizenship is unmet', () => {
    const job = {
      title: 'Senior Systems Engineer',
      company: 'Lockheed Martin',
      location: 'United States',
      rawDescription: 'Must be a US Citizen and able to obtain a security clearance. No visa sponsorship provided.',
      workplaceType: 'On-site',
    };

    const candidate = {
      masterProfileText: 'Senior Software Engineer with 10 years experience in cloud infrastructure.',
      location: 'India',
    };

    const report = evaluateHardConstraints(job, candidate);
    expect(report.overallEligible).toBe(false);
    expect(report.scoreCeiling).toBe(BLOCKER_RULES.work_auth.scoreCap); // 50%
    expect(report.unmetCount).toBeGreaterThanOrEqual(1);
    expect(report.items.some((i) => i.category === 'work_auth' && !i.isMet)).toBe(true);
  });

  it('enforces score ceiling of 65% when experience floor is not met', () => {
    const job = {
      title: 'Staff Data Engineer',
      company: 'Stripe',
      location: 'Remote',
      rawDescription: 'Requires 8+ years of experience in data platform architecture.',
      workplaceType: 'Remote',
    };

    const candidate = {
      masterProfileText: 'Data Engineer with 3 years of experience building pipelines.',
      location: 'Remote',
    };

    const report = evaluateHardConstraints(job, candidate);
    expect(report.overallEligible).toBe(false);
    expect(report.scoreCeiling).toBeLessThanOrEqual(BLOCKER_RULES.experience_years.scoreCap); // 65%
    expect(report.items.some((i) => i.category === 'experience_years' && !i.isMet)).toBe(true);
  });

  it('passes when candidate satisfies all requirements', () => {
    const job = {
      title: 'Senior Operations Analyst',
      company: 'Revolut',
      location: 'India',
      rawDescription: "Requires 4+ years experience in payment disputes. Bachelor's degree or equivalent experience.",
      workplaceType: 'Hybrid',
    };

    const candidate = {
      masterProfileText: 'Operations professional with 6 years experience across disputes and chargebacks. Bachelor of Commerce.',
      location: 'India',
    };

    const report = evaluateHardConstraints(job, candidate);
    expect(report.overallEligible).toBe(true);
    expect(report.scoreCeiling).toBe(100);
    expect(report.unmetCount).toBe(0);
    expect(report.items.every((i) => i.isMet)).toBe(true);
  });
});
