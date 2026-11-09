import { describe, expect, it } from 'vitest';
import { generatePlainTextResume, generateVectorResumePdf } from '@/jobstudio/utils/pdfExport';
import { MASTER_BASE_RESUME } from '@/jobstudio/data/defaultData';

const resume = {
  ...MASTER_BASE_RESUME,
  projects: [{
    name: 'LendLoop', role: 'Full-Stack Developer',
    target_alignment: 'Demonstrates Fluence take-home specification proficiency across Next.js, Clerk, Convex, and n8n.',
    description: 'Neighborhood tool-lending platform.',
    bullets: ['Built authenticated lending workflows using Next.js.'],
  }],
};

describe('resume project content', () => {
  it('exports factual project content without internal alignment commentary as text', () => {
    const text = generatePlainTextResume(resume);
    expect(text).toContain('LENDLOOP | Full-Stack Developer');
    expect(text).toContain('Built authenticated lending workflows using Next.js.');
    expect(text).not.toContain('Demonstrates Fluence');
  });
  it('excludes the same internal commentary from the PDF', () => {
    const pdf = generateVectorResumePdf(resume).output();
    expect(pdf).toContain('LendLoop');
    expect(pdf).not.toContain('Demonstrates Fluence');
  });

  it('supports comfortable, balanced, and compact density options on PDF export', () => {
    const singleRoleResume = {
      ...MASTER_BASE_RESUME,
      experiences: [
        {
          title: 'Piping Design Trainee',
          company: 'PIPER CADD',
          date_range: '2022 – 2023',
          location: 'Chennai, India',
          bullets: [
            'Executed P&ID creation and 3D piping routing in AutoCAD Plant 3D.',
            'Conducted clash detection and interference management using Navisworks Manage.',
          ],
        },
      ],
      projects: [],
    };

    const docComfort = generateVectorResumePdf(singleRoleResume, { density: 'comfortable' });
    expect(docComfort.internal.getNumberOfPages()).toBe(1);

    const docCompact = generateVectorResumePdf(singleRoleResume, { density: 'compact' });
    expect(docCompact.internal.getNumberOfPages()).toBe(1);

    const docBalanced = generateVectorResumePdf(singleRoleResume, { density: 'balanced' });
    expect(docBalanced.internal.getNumberOfPages()).toBe(1);
  });

  it('guarantees Education is never truncated on multi-role candidates in Full Page mode', () => {
    const multiRoleCandidate = {
      full_name: 'SHRI HARI S',
      email: 'shrihari07ks@gmail.com',
      phone: '+966 564470069',
      location: 'Al Khobar, Saudi Arabia',
      linkedin: 'linkedin.com/in/shrihari007',
      tailored_summary:
        'Corporate Travel Coordinator with 3+ years of international experience across Saudi Arabia, the UAE, and India supporting corporate travel operations, airline ticketing, hotel reservations, CRM administration, and travel policy compliance. Experienced in Galileo Travelport Smart point and GDS ticketing, with a strong track record of managing high booking volumes, coordinating end-to-end travel arrangements, resolving booking issues, and delivering cost-efficient travel solutions and customer-focused service.',
      skills: [
        'Galileo Travelport Smart point',
        'GDS Ticketing',
        'Airline Reservations',
        'Hotel Reservations',
        'Corporate Travel Coordination',
        'Business Travel',
        'Itinerary Planning & Travel Management',
        'Travel Policy Compliance',
        'CRM Systems',
        'Vendor Negotiation',
      ],
      experiences: [
        {
          title: 'Travel Coordinator',
          company: 'M.AL - Barghash Company Simplified Joint Stock',
          location: 'Al Khobar, Saudi Arabia',
          date_range: '29 September 2025 - Present',
          bullets: [
            'Manage 150+ international and domestic flight bookings monthly using Galileo Travelport Smart point while maintaining high booking accuracy.',
            'Coordinate end-to-end corporate travel arrangements, balancing traveler requirements, cost efficiency, and travel policy compliance.',
            'Liaise with airlines, vendors, and internal stakeholders to resolve booking issues promptly and maintain service continuity.',
            'Maintain accurate itineraries, invoices, travel records, and expense-related documentation to support operational control.',
          ],
        },
        {
          title: 'Executive - Client Relationship',
          company: 'Axis stay Private Limited',
          location: 'Bengaluru, Karnataka, India',
          date_range: '01 July 2025',
          bullets: [
            'Managed 120+ monthly hotel reservations for corporate employees traveling across Saudi Arabia, GCC destinations, North America, and Europe.',
            'Processed hotel reservations, amendments, cancellations, and confirmations while ensuring accurate fulfillment of client requirements.',
            'Recorded booking details, client requests, follow-ups, and service updates in CRM systems to improve operational visibility.',
            'Coordinated with clients and stakeholders to address service requirements and support smooth hospitality operations.',
          ],
        },
        {
          title: 'Marketing Representative - South India',
          company: 'Centurion Luxury Travels',
          location: 'Dubai, UAE (Remote / Contract)',
          date_range: '10 February 2025',
          bullets: [
            'Designed customized UAE travel itineraries based on client preferences, travel requirements, and budgets.',
            'Engaged clients to understand travel needs, recommended suitable travel solutions, and supported the conversion of enquiries into bookings.',
            'Utilized CRM software to manage client interactions, track leads, and maintain accurate sales records.',
            'Resolved client queries with a customer-focused approach while supporting sales performance and service quality.',
          ],
        },
        {
          title: 'Sales Executive - UAE Travel Packages',
          company: 'Rayna Tours Pvt. Ltd.',
          location: 'Pune, Maharashtra, India',
          date_range: '01 September 2023',
          bullets: [
            'Conducted market research and competitor analysis to identify emerging travel trends, market opportunities, and customer needs.',
            'Collaborated with the sales team to generate quality leads and strengthen brand visibility across the South India market.',
            'Supported the planning and execution of promotional events and marketing initiatives aligned with business objectives.',
            'Contributed to client engagement and lead-generation activities through market-focused communication and coordination.',
          ],
        },
        {
          title: 'Front Desk Operator',
          company: 'Hotel Sumi Yashshree',
          location: 'Darjeeling, West Bengal, India',
          date_range: '01 February 2020 - 02 March 2020',
          bullets: [
            'Managed front-desk operations including guest check-in, check-out, enquiries, and day-to-day customer service.',
            'Addressed guest requirements professionally and supported a positive, efficient hospitality experience.',
          ],
        },
      ],
      education: [
        {
          degree: 'Master of Tourism and Travel Management',
          institution: 'S.S. Dempo College of Commerce and Economics, Goa University',
          year: 'September 2021',
        },
        {
          degree: 'Bachelor of Travel and Tourism',
          institution: 'Sri Sri University, Cuttack, Odisha',
          year: 'June 2023',
        },
      ],
      certifications: [],
    };

    // Full Page mode (comfortable requested): must auto-calibrate density so 100% of data fits on 1 single page!
    const docFullPage = generateVectorResumePdf(multiRoleCandidate, { density: 'comfortable', forceSinglePage: true });
    expect(docFullPage.internal.getNumberOfPages()).toBe(1);

    const pdfOutput = docFullPage.output();
    expect(pdfOutput).toContain('EDUCATION');
    expect(pdfOutput).toContain('Master of Tourism and Travel Management');
    expect(pdfOutput).toContain('Bachelor of Travel and Tourism');
    expect(pdfOutput).toContain('Front Desk Operator');

    // Compact mode: also fits on 1 page and retains education
    const docCompact = generateVectorResumePdf(multiRoleCandidate, { density: 'compact', forceSinglePage: true });
    expect(docCompact.internal.getNumberOfPages()).toBe(1);
    expect(docCompact.output()).toContain('Master of Tourism and Travel Management');
  });

  it('safely page-breaks rather than dropping sections if content volume exceeds 1 page', () => {
    const hugeResume = {
      ...MASTER_BASE_RESUME,
      experiences: Array.from({ length: 12 }, (_, i) => ({
        title: `Senior Enterprise Executive Role ${i + 1}`,
        company: `Global Technology Solutions Corporation ${i + 1}`,
        date_range: `201${i} – 201${i + 1}`,
        location: 'Bengaluru, India',
        bullets: [
          'Spearheaded enterprise SaaS architecture scaling across multi-region infrastructure with 99.99% reliability SLAs across distributed production clusters.',
          'Negotiated high-value client contracts achieving 140% annual quota target and generating sustained recurring ARR across tier-1 fintech accounts.',
          'Mentored junior and mid-level engineers and instituted rigorous continuous integration pipelines and zero-downtime blue-green deployments.',
          'Partnered cross-functionally with executive leadership, product marketing, and customer success teams to accelerate time-to-market.',
        ],
      })),
      education: [
        {
          degree: 'Doctor of Philosophy in Computer Science',
          institution: 'National Institute of Technology',
          year: '2015',
        },
      ],
    };

    const doc = generateVectorResumePdf(hugeResume, { forceSinglePage: true });
    // When volume is physically impossible on 1 page, checkPageBreak creates page 2 to avoid drawing off-canvas
    expect(doc.internal.getNumberOfPages()).toBeGreaterThan(1);
    const pdfText = doc.output();
    expect(pdfText).toContain('Doctor of Philosophy in Computer Science');
  });
});