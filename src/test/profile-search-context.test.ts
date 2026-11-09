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

  it('correctly extracts Sales & Business Development domain, Dubai/UAE relocation, related roles, and top skills for Vishal Jayaprakash profile', () => {
    const vishalResume: TailoredResumeData = {
      full_name: 'Vishal Jayaprakash',
      headline: 'B2B Enterprise Sales | AI-Driven Selling | Full-Cycle Closer',
      target_role: 'Head of Growth',
      contact_info: {
        email: 'vishal@example.com',
        phone: '+91 98765 00000',
        location: 'Kochi, Kerala, India (Relocating to Dubai / UAE)',
        linkedin: 'linkedin.com/in/vishal',
      },
      tailored_summary: '5+ years closing software & services deals with enterprise leaders including Google, Meta, and banking institutions. Proven track record in pipeline generation, outbound systems, and AI-driven selling.',
      skills: [
        'B2B Enterprise Software Sales',
        'Deal Qualification',
        'Pipeline Management',
        'HubSpot',
        'Apollo',
        'Clay',
        'Sales Navigator',
        'AI SDR',
        'Outbound Prospecting',
        'Contract Negotiation',
        'Solution Selling',
        'Communication',
        'Teamwork',
      ],
      experiences: [
        {
          title: 'Co-Founder & Head of Growth',
          company: 'Torc Infotech',
          date_range: '2021 – Present',
          location: 'Kochi, India',
          bullets: ['Scaled B2B revenue and managed full-cycle enterprise sales.'],
        },
      ],
      education: [],
      certifications: [],
    };

    const ctx = extractProfileSearchContext(vishalResume);
    expect(ctx.targetRole).toBe('Head of Growth');
    expect(ctx.domain).toBe('Sales & Business Development');
    expect(ctx.location).toBe('United Arab Emirates (UAE)');
    expect(ctx.targetRelocation).toBe('United Arab Emirates (UAE)');
    expect(ctx.isNonTech).toBe(false);

    // Verify rich related roles are synthesized
    expect(ctx.relatedRoles).toContain('Head of Growth');
    expect(ctx.relatedRoles).toContain('Enterprise Account Executive');
    expect(ctx.relatedRoles).toContain('VP of Sales');
    expect(ctx.relatedRoles).toContain('Head of Business Development');
    expect(ctx.relatedRoles).toContain('Go-To-Market (GTM) Lead');
    expect(ctx.relatedRoles).toContain('B2B Software Sales Lead');

    // Verify generic skills are filtered out while high-signal skills are retained
    expect(ctx.topSkillKeywords).toContain('B2B Enterprise Software Sales');
    expect(ctx.topSkillKeywords).toContain('Deal Qualification');
    expect(ctx.topSkillKeywords).toContain('Pipeline Management');
    expect(ctx.topSkillKeywords).toContain('HubSpot');
    expect(ctx.topSkillKeywords).not.toContain('Communication');
    expect(ctx.topSkillKeywords).not.toContain('Teamwork');

    // Verify searchQueries include the expanded cluster
    expect(ctx.searchQueries).toContain('Head of Growth');
    expect(ctx.searchQueries).toContain('Enterprise Account Executive');
    expect(ctx.searchQueries).toContain('VP of Sales');
  });

  it('correctly extracts Corporate Travel & Hospitality Operations domain and isolates non-executive candidate from VP/Director roles for Shri Hari S profile', () => {
    const shriHariResume: TailoredResumeData = {
      full_name: 'Shri Hari S',
      headline: 'Corporate Travel Coordinator | Travel Consultant | Business Travel',
      target_role: 'Corporate Travel Coordinator',
      contact_info: {
        email: 'shrihari07ks@gmail.com',
        phone: '+966 564470069',
        location: 'Al Khobar, Saudi Arabia',
        linkedin: 'linkedin.com/in/shrihari007',
      },
      tailored_summary: 'Corporate Travel Coordinator with 3+ years of international experience across Saudi Arabia, the UAE, and India supporting corporate travel operations, airline ticketing, hotel reservations, vendor coordination, CRM administration, and travel policy compliance.',
      skills: [
        'Vendor Negotiation',
        'Business Travel',
        'GDS Ticketing',
        'Travel Policy Compliance',
        'Galileo Travelport Smart point',
        'CRM',
        'Airline Reservations',
        'Vendor Management',
        'Hotel Reservations',
        'Cost Optimization',
        'Itinerary Planning & Travel Management',
        'Problem Solving',
        'Customer Relationship Management',
        'Client Service',
      ],
      experiences: [
        {
          title: 'Travel Coordinator',
          company: 'M.AL – Barghash Company Simplified Joint Stock',
          date_range: '29 September 2025 – Present',
          location: 'Al Khobar, Saudi Arabia',
          bullets: ['Manage 150+ international and domestic flight bookings monthly using Galileo Travelport Smart point.'],
        },
        {
          title: 'Executive – Client Relationship',
          company: 'Axis stay Private Limited',
          date_range: '01 July 2025',
          location: 'Bengaluru, Karnataka, India',
          bullets: ['Managed 120+ monthly hotel reservations for corporate employees.'],
        },
        {
          title: 'Marketing Representative – South India',
          company: 'Centurion Luxury Travels',
          date_range: '10 February 2025',
          location: 'Dubai, UAE',
          bullets: ['Designed customized UAE travel itineraries based on client preferences.'],
        },
        {
          title: 'Sales Executive – UAE Travel Packages',
          company: 'Rayna Tours Pvt. Ltd.',
          date_range: '01 September 2023',
          location: 'Pune, Maharashtra, India',
          bullets: ['Conducted market research and competitor analysis to identify emerging travel trends.'],
        },
        {
          title: 'Front Desk Operator',
          company: 'Hotel Sumi Yashshree',
          date_range: '01 February – 02 March 2020',
          location: 'Darjeeling, West Bengal, India',
          bullets: ['Managed front-desk operations including guest check-in and check-out.'],
        },
      ],
      education: [
        {
          degree: 'Master of Tourism and Travel Management',
          institution: 'Goa University',
          year: '2021',
        },
        {
          degree: 'Bachelor of Travel and Tourism',
          institution: 'Sri Sri University',
          year: '2023',
        },
      ],
      certifications: [],
    };

    const ctx = extractProfileSearchContext(shriHariResume);
    expect(ctx.targetRole).toBe('Corporate Travel Coordinator');
    expect(ctx.domain).toBe('Corporate Travel & Hospitality Operations');
    expect(ctx.location).toBe('Saudi Arabia');
    expect(ctx.isNonTech).toBe(true);

    // Verify relevant corporate travel and hospitality roles are present
    expect(ctx.relatedRoles).toContain('Corporate Travel Coordinator');
    expect(ctx.relatedRoles).toContain('Travel Coordinator');
    expect(ctx.relatedRoles).toContain('Travel Consultant');
    expect(ctx.relatedRoles).toContain('Business Travel Consultant');
    expect(ctx.relatedRoles).toContain('Corporate Travel Desk Executive');
    expect(ctx.relatedRoles).toContain('Travel Operations Specialist');

    // Strict seniority isolation: junior/mid non-executive candidate must NEVER have VP or Director roles
    expect(ctx.relatedRoles).not.toContain('VP of Sales');
    expect(ctx.relatedRoles).not.toContain('Director of Sales');
    expect(ctx.relatedRoles).not.toContain('Head of Growth');

    // Verify skills
    expect(ctx.topSkillKeywords).toContain('GDS Ticketing');
    expect(ctx.topSkillKeywords).toContain('Travel Policy Compliance');
    expect(ctx.topSkillKeywords).toContain('Galileo Travelport Smart point');
    expect(ctx.topSkillKeywords).toContain('Airline Reservations');
  });

  it('prevents junior sales development representatives from receiving executive VP and Director roles', () => {
    const sdrResume: TailoredResumeData = {
      full_name: 'Rahul Sharma',
      headline: 'Sales Development Representative | Outbound Prospecting',
      target_role: 'Sales Development Representative',
      contact_info: {
        email: 'rahul@example.com',
        phone: '+91 98765 11111',
        location: 'Bengaluru, Karnataka, India',
        linkedin: '',
      },
      tailored_summary: 'Energetic SDR with 1.5 years experience in outbound cold calling, email sequencing, and booking qualified sales discovery meetings.',
      skills: ['Cold Calling', 'Outbound Prospecting', 'SalesLoft', 'ZoomInfo', 'CRM', 'Lead Qualification'],
      experiences: [
        {
          title: 'Sales Development Representative',
          company: 'SaaSify Inc',
          date_range: '2024 – Present',
          location: 'Bengaluru, India',
          bullets: ['Booked 25+ SQLs per month via multi-touch outreach.'],
        },
      ],
      education: [],
      certifications: [],
    };

    const ctx = extractProfileSearchContext(sdrResume);
    expect(ctx.targetRole).toBe('Sales Development Representative');
    expect(ctx.domain).toBe('Sales & Business Development');

    // SDR should receive peer and progression roles, NOT VP/Director
    expect(ctx.relatedRoles).toContain('Sales Development Representative');
    expect(ctx.relatedRoles).toContain('Business Development Representative');
    expect(ctx.relatedRoles).toContain('Account Executive');
    expect(ctx.relatedRoles).not.toContain('VP of Sales');
    expect(ctx.relatedRoles).not.toContain('Director of Sales');
    expect(ctx.relatedRoles).not.toContain('Head of Growth');
  });
});

