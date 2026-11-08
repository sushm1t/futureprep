import { describe, it, expect } from 'vitest';
import { extractProfileSearchContext } from '../jobstudio/utils/profileSearchContext';
import { TailoredResumeData } from '../jobstudio/data/defaultData';

describe('extractProfileSearchContext', () => {
  it('correctly extracts Medical Laboratory Technologist role, India location, and Healthcare domain', () => {
    const medicalResume: TailoredResumeData = {
      full_name: 'Amaya P',
      target_role: 'Medical Laboratory Technologist',
      contact_info: {
        email: 'candidate.mlt@example.com',
        phone: '+91 98765 43210',
        location: 'Vadakara, Calicut, Kerala, India',
        linkedin: '',
      },
      tailored_summary: 'Experienced MLT in Blood Centre & Transfusion Medicine at Aster MIMS Hospital.',
      skills: ['Phlebotomy', 'Blood Bank Serology', 'Apheresis collection', 'Hematology', 'Biochemistry'],
      experiences: [
        {
          title: 'Medical Laboratory Technologist',
          company: 'Aster MIMS Hospital – Calicut',
          date_range: '18/10/2024 – Present',
          location: 'Calicut, Kerala, India',
          bullets: ['Perform therapeutic and donor apheresis procedures.'],
        },
      ],
      education: [
        {
          degree: 'BSc. Medical Laboratory Technology',
          institution: 'Kerala University of Health Sciences',
          year: '2022',
        },
      ],
      certifications: ['Stem Cell Apheresis & Cryopreservation'],
    };

    const ctx = extractProfileSearchContext(medicalResume);
    expect(ctx.targetRole).toBe('Medical Laboratory Technologist');
    expect(ctx.location).toBe('India');
    expect(ctx.domain).toBe('Healthcare & Life Sciences');
    expect(ctx.isNonTech).toBe(true);
    expect(ctx.searchQueries).toContain('Medical Laboratory Technologist');
    expect(ctx.searchQueries).toContain('Medical Laboratory Technician');
    expect(ctx.searchQueries).toContain('Medical Technologist');
  });

  it('falls back to experiences[0].title when target_role is generic placeholder', () => {
    const resumeWithPlaceholderTarget: TailoredResumeData = {
      full_name: 'Alex Rivera',
      target_role: 'Target Role',
      contact_info: {
        email: 'alex@example.com',
        phone: '',
        location: 'San Francisco, CA',
        linkedin: '',
      },
      tailored_summary: 'Senior software engineer.',
      skills: ['TypeScript', 'React', 'Node.js'],
      experiences: [
        {
          title: 'Staff Systems Engineer',
          company: 'Cloud Corp',
          date_range: '2021 – Present',
          location: 'San Francisco, CA',
          bullets: ['Scaled Kubernetes microservices.'],
        },
      ],
      education: [],
      certifications: [],
    };

    const ctx = extractProfileSearchContext(resumeWithPlaceholderTarget);
    expect(ctx.targetRole).toBe('Staff Systems Engineer');
    expect(ctx.location).toBe('United States');
    expect(ctx.domain).toBe('Technology & Software');
    expect(ctx.isNonTech).toBe(false);
  });

  it('extracts role from raw masterProfileText if resume is empty', () => {
    const rawText = `
### CANDIDATE: Amaya P
**Headline:** Medical Laboratory Technologist
**Location:** Calicut, Kerala, India
### EXPERIENCES
- **Title:** Medical Laboratory Technologist
  **Company:** Aster MIMS Hospital
    `;

    const ctx = extractProfileSearchContext(null, rawText);
    expect(ctx.targetRole).toBe('Medical Laboratory Technologist');
    expect(ctx.location).toBe('India');
    expect(ctx.domain).toBe('Healthcare & Life Sciences');
    expect(ctx.isNonTech).toBe(true);
  });

  it('correctly extracts Payment Operations role, India location, and Fintech domain for Sushmit profile', () => {
    const sushmitResume: TailoredResumeData = {
      full_name: 'Sushmit S',
      target_role: 'Payment Operations',
      contact_info: {
        email: 'candidate.ops@example.com',
        phone: '+91 98765 43211',
        location: 'Vadakara, Kerala, India (Open to Remote / Relocation)',
        linkedin: 'linkedin.com/in/sample-profile',
      },
      tailored_summary: 'Fintech operations professional with 6 years of experience across payment disputes, chargebacks, and real-time operations at Revolut.',
      skills: ['Card payments', 'Visa and Mastercard disputes', 'chargebacks', 'transaction investigations', 'SQL', 'Looker', 'Metabase'],
      experiences: [
        {
          title: 'Real-Time Analyst / SME – Real-Time Operations',
          company: 'Revolut Technologies India Pvt. Ltd.',
          date_range: 'October 2023 – Present',
          location: 'Bengaluru, India',
          bullets: ['Monitor live service operations across 1,000+ frontline agents and 300+ queues.'],
        },
      ],
      education: [],
      certifications: ['SQL for Data Science'],
    };

    const ctx = extractProfileSearchContext(sushmitResume);
    expect(ctx.targetRole).toBe('Payment Operations');
    expect(ctx.location).toBe('India');
    expect(ctx.domain).toBe('Fintech & Payment Operations');
    expect(ctx.isNonTech).toBe(false);
    expect(ctx.searchQueries).toContain('Payment Operations');
    expect(ctx.searchQueries).toContain('Fintech Operations');
    expect(ctx.searchQueries).toContain('Card Disputes Specialist');
    expect(ctx.searchQueries).toContain('Real-Time Analyst');
  });

  it('correctly extracts Mechanical Engineer role, India location, and Mechanical domain for Amarjith profile', () => {
    const amarjithResume: TailoredResumeData = {
      full_name: 'Amarjith P',
      target_role: 'Mechanical Engineer',
      contact_info: {
        email: 'candidate.mech@example.com',
        phone: '+91 98765 43212',
        location: 'Vadakara, Calicut, Kerala, India (Pin: 673104)',
        linkedin: '',
      },
      tailored_summary: 'Passionate Mechanical Engineer with proven leadership in heavy machinery maintenance, JCB equipment troubleshooting, and production engineering.',
      skills: ['Public Relations', 'Teamwork', 'Time Management', 'Leadership', 'Effective Communication', 'Critical Thinking'],
      experiences: [
        {
          title: 'Service Manager',
          company: 'Autoscan India Pvt Ltd (JCB INDIA LTD)',
          date_range: 'Sep 2025 – Present',
          location: 'Kerala, India',
          bullets: ['Troubleshooting of JCB Excavators, Mini Excavators and Wheel Loaders.', 'Making detailed failure reports of machines.'],
        },
        {
          title: 'Area Service Manager',
          company: 'Shrivenkatesha Heavy Equipments (HYUNDAI HEAVY MACHINERY DEALER, KERALA)',
          date_range: 'Sep 2024 – Sep 2025',
          location: 'Kerala, India',
          bullets: ['Ensure quality service and resolve customer issues and complaints.'],
        },
        {
          title: 'Production Engineer',
          company: 'Creative Engineers (MINING MACHINERY MANUFACTURER, BANGALORE)',
          date_range: 'Jan 2014 – Mar 2017',
          location: 'Bangalore, India',
          bullets: ['Experienced in Erection and Commissioning of Mining Machineries.'],
        },
      ],
      education: [
        {
          degree: 'BE Mechanical',
          institution: 'Annamalai University',
          year: '2008-2012',
        },
      ],
      certifications: [],
    };

    const ctx = extractProfileSearchContext(amarjithResume);
    expect(ctx.targetRole).toBe('Mechanical Engineer');
    expect(ctx.location).toBe('India');
    expect(ctx.domain).toBe('Mechanical & Industrial Engineering');
    expect(ctx.isNonTech).toBe(true);
    expect(ctx.searchQueries).toContain('Mechanical Engineer');
    expect(ctx.searchQueries).toContain('Service Engineer Heavy Machinery');
    expect(ctx.searchQueries).toContain('Maintenance Engineer');
    expect(ctx.searchQueries).toContain('Production Engineer');
  });
});

