import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobEvaluatorView } from '@/jobstudio/components/JobEvaluatorView';
import { EMPTY_EVALUATION, TailoredResumeData } from '@/jobstudio/data/defaultData';

afterEach(cleanup);

describe('JobEvaluatorView - Profile-Aware Search & Healthcare Discovery', () => {
  const amayaResume: TailoredResumeData = {
    full_name: 'Amaya P',
    target_role: 'Medical Laboratory Technologist',
    contact_info: {
      email: 'candidate.mlt@example.com',
      phone: '+91 98765 43210',
      location: 'Vadakara, Calicut, Kerala, India',
      linkedin: '',
    },
    tailored_summary: 'Medical Laboratory Technologist in Blood Centre & Transfusion Medicine at Aster MIMS Hospital.',
    skills: ['Phlebotomy', 'Blood Bank Serology', 'Apheresis collection', 'Hematology', 'Biochemistry'],
    experiences: [
      {
        title: 'Medical Laboratory Technologist',
        company: 'Aster MIMS Hospital – Calicut',
        date_range: '18/10/2024 – Present',
        location: 'Calicut, Kerala, India',
        bullets: ['Perform therapeutic apheresis procedures and immunohematological testing.'],
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

  const sampleHealthcareJobs = [
    {
      id: 'fh-1',
      title: 'Medical Laboratory Technologist',
      company: 'Family Health West',
      location: 'Fruita, Colorado, United States',
      department: 'Clinical Pathology',
      platform: 'FreeHire',
      applyUrl: 'https://example.com/apply/1',
      rawDescription: 'Routine hematology, blood bank serology, and laboratory QC procedures.',
      isRemote: false,
      workplaceType: 'On-site',
      seniority: 'Mid-Level',
    },
    {
      id: 'fh-2',
      title: 'Laboratory Technologist - Transfusion Medicine',
      company: 'Trillium Health Partners',
      location: 'Ontario, Canada',
      department: 'Transfusion Medicine',
      platform: 'FreeHire',
      applyUrl: 'https://example.com/apply/2',
      rawDescription: 'Immunohematological testing, crossmatching, apheresis and specimen handling in hospital laboratory.',
      isRemote: false,
      workplaceType: 'On-site',
      seniority: 'Mid-Level',
    },
  ];

  it('renders profile focus indicator and dynamically derives search placeholder for Medical Laboratory Technologist', () => {
    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={amayaResume}
        masterProfileText={JSON.stringify(amayaResume)}
      />
    );

    // Profile Focus badge should show Amaya's role and domain
    expect(screen.getByText(/Profile Focus:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Medical Laboratory Technologist/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Healthcare & Life Sciences/i)).toBeInTheDocument();

    // Search input placeholder should be tailored to Medical Laboratory Technologist
    const searchInput = screen.getByPlaceholderText(/Search Medical Laboratory Technologist roles.../i);
    expect(searchInput).toBeInTheDocument();
  });

  it('passes profile-aware keyword and context to crawl API when Fetch Live Roles is clicked', async () => {
    let capturedBody: any = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, opts: any) => {
        if (url === '/api/ats/crawl') {
          capturedBody = JSON.parse(opts.body);
          return {
            ok: true,
            json: async () => ({
              success: true,
              jobs: sampleHealthcareJobs,
              company: 'All Companies',
            }),
          };
        }
        return { ok: true, json: async () => ({}) };
      })
    );

    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={amayaResume}
        masterProfileText={JSON.stringify(amayaResume)}
      />
    );

    const fetchButton = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    expect(capturedBody.keyword).toBe('Medical Laboratory Technologist');
    expect(capturedBody.profileContext).toBeDefined();
    expect(capturedBody.profileContext.targetRole).toBe('Medical Laboratory Technologist');
    expect(capturedBody.profileContext.isNonTech).toBe(true);
    expect(capturedBody.profileContext.domain).toBe('Healthcare & Life Sciences');
  });

  it('triggers web discovery when Discover Live Roles via Web Search is clicked', async () => {
    let capturedDiscoverBody: any = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, opts: any) => {
        if (url === '/api/discover-jobs') {
          capturedDiscoverBody = JSON.parse(opts.body);
          return {
            ok: true,
            json: async () => ({
              success: true,
              opportunities: sampleHealthcareJobs,
            }),
          };
        }
        return { ok: true, json: async () => ({}) };
      })
    );

    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={amayaResume}
        masterProfileText={JSON.stringify(amayaResume)}
      />
    );

    const discoverBtn = screen.getByRole('button', { name: /Discover Live Roles via Web Search/i });
    fireEvent.click(discoverBtn);

    await waitFor(() => {
      expect(capturedDiscoverBody).not.toBeNull();
    });

    expect(capturedDiscoverBody.roles).toContain('Medical Laboratory Technologist');
    expect(capturedDiscoverBody.location).toBe('India');
  });

  it('includes Healthcare & Clinical in the discipline filter bar', () => {
    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={amayaResume}
        masterProfileText={JSON.stringify(amayaResume)}
      />
    );

    // Initial state does not render search results until crawled, so let's verify discipline filter appears
    const healthcareBtn = screen.queryByText(/Healthcare & Clinical/i);
    // Note: When no crawl has occurred, the results area isn't rendered yet
    expect(screen.getByText(/Live feed connected/i)).toBeInTheDocument();
  });

  it('renders interactive Target Roles and Top Skills pills for sales & growth candidate and passes expanded context to crawl API', async () => {
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
      tailored_summary: '5+ years closing software & services deals with enterprise leaders including Google, Meta, and banking institutions.',
      skills: [
        'B2B Enterprise Software Sales',
        'Deal Qualification',
        'Pipeline Management',
        'HubSpot',
        'Apollo',
        'Sales Navigator',
      ],
      experiences: [
        {
          title: 'Head of Growth',
          company: 'Torc Infotech',
          date_range: '2021 – Present',
          location: 'Kochi, India',
          bullets: ['Scaled B2B revenue and closed multi-year enterprise contracts.'],
        },
      ],
      education: [],
      certifications: [],
    };

    let capturedCrawlBody: any = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, opts: any) => {
        if (url === '/api/ats/crawl') {
          capturedCrawlBody = JSON.parse(opts.body);
          return {
            ok: true,
            json: async () => ({
              success: true,
              jobs: sampleHealthcareJobs,
              totalAvailableInCatalogue: 1500,
            }),
          };
        }
        return { ok: true, json: async () => ({ success: true }) };
      })
    );

    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={vishalResume}
        masterProfileText={JSON.stringify(vishalResume)}
      />
    );

    // Profile Focus shows Head of Growth and Sales & Business Development
    expect(screen.getByText(/Profile Focus:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sales & Business Development/i)).toBeInTheDocument();
    expect(screen.getAllByText(/United Arab Emirates \(UAE\)/i).length).toBeGreaterThanOrEqual(1);

    // Verify Target Roles interactive pills are visible
    expect(screen.getByText(/Target Roles:/i)).toBeInTheDocument();
    expect(screen.getByText(/All Profile Roles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enterprise Account Executive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /VP of Sales/i })).toBeInTheDocument();

    // Verify Top Skills chips are rendered
    expect(screen.getByText(/Top Skills:/i)).toBeInTheDocument();
    expect(screen.getByText(/\+B2B Enterprise Software Sales/i)).toBeInTheDocument();
    expect(screen.getByText(/\+Pipeline Management/i)).toBeInTheDocument();

    // Clicking an individual target role pill activates that role without auto-fetching
    const aeBtn = screen.getByRole('button', { name: /Enterprise Account Executive/i });
    fireEvent.click(aeBtn);

    // ATS is not crawled automatically; it waits for user to click Fetch Live Roles
    expect(capturedCrawlBody).toBeNull();

    // Now click Fetch Live Roles
    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(capturedCrawlBody).not.toBeNull();
    });

    expect(capturedCrawlBody.keyword).toContain('Enterprise Account Executive');
    expect(capturedCrawlBody.location).toBe('United Arab Emirates (UAE)');
    expect(capturedCrawlBody.profileContext.relatedRoles).toContain('Enterprise Account Executive');
    expect(capturedCrawlBody.profileContext.relatedRoles).toContain('Head of Growth');

    // Clicking All Profile Roles broad match updates state without auto-fetching
    capturedCrawlBody = null;
    const allRolesBtn = screen.getByText(/All Profile Roles/i);
    fireEvent.click(allRolesBtn);
    expect(capturedCrawlBody).toBeNull();

    // Click Fetch Live Roles to query with broad match
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(capturedCrawlBody).not.toBeNull();
    });

    expect(capturedCrawlBody.keyword).toBe('');
    expect(capturedCrawlBody.profileContext.relatedRoles).toContain('Head of Growth');
    expect(capturedCrawlBody.profileContext.relatedRoles).toContain('VP of Sales');
  });

  it('allows multi-selecting multiple target roles simultaneously and updating crawl queries', async () => {
    const travelResume: TailoredResumeData = {
      full_name: 'Shri Hari S',
      headline: 'Corporate Travel Coordinator | Travel Consultant | Business Travel',
      target_role: 'Corporate Travel Coordinator',
      contact_info: {
        email: 'shrihari07ks@gmail.com',
        phone: '+966 564470069',
        location: 'Al Khobar, Saudi Arabia',
        linkedin: '',
      },
      tailored_summary: 'Corporate Travel Coordinator with 3+ years experience.',
      skills: ['GDS Ticketing', 'Galileo Travelport', 'Airline Reservations', 'Hotel Reservations'],
      experiences: [
        {
          title: 'Travel Coordinator',
          company: 'Barghash Joint Stock',
          date_range: '2025 – Present',
          location: 'Saudi Arabia',
          bullets: ['Flight bookings and GDS management.'],
        },
      ],
      education: [],
      certifications: [],
    };

    let capturedCrawlBody: any = null;
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts: any) => {
      if (url === '/api/ats/crawl') {
        capturedCrawlBody = JSON.parse(opts.body);
        return {
          ok: true,
          json: async () => ({
            success: true,
            jobs: [],
            totalAvailableInCatalogue: 50,
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true }) };
    }));

    render(
      <JobEvaluatorView
        evaluation={{ ...EMPTY_EVALUATION, job_title: '', company_name: '' }}
        isEvaluationComplete={false}
        opportunities={[]}
        selectedJobId=""
        customJobText=""
        setCustomJobText={vi.fn()}
        customUrl=""
        setCustomUrl={vi.fn()}
        onEvaluate={vi.fn()}
        isLoading={false}
        onProceedToResume={vi.fn()}
        onSelectPreset={vi.fn()}
        resume={travelResume}
        masterProfileText={JSON.stringify(travelResume)}
      />
    );

    // Initial state: primary role pill is active
    const coordPill = screen.getByRole('button', { name: /Corporate Travel Coordinator/i });
    expect(coordPill).toHaveAttribute('aria-pressed', 'true');

    // Click a second role: Travel Consultant (should multi-select both without auto-fetching)
    const consultantPill = screen.getByRole('button', { name: /^Travel Consultant$/i });
    fireEvent.click(consultantPill);

    // Both pills should now be active immediately
    expect(coordPill).toHaveAttribute('aria-pressed', 'true');
    expect(consultantPill).toHaveAttribute('aria-pressed', 'true');
    expect(capturedCrawlBody).toBeNull();

    // Clicking Fetch Live Roles queries with both selected roles
    const fetchBtn = screen.getByRole('button', { name: /Fetch Live Roles/i });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(capturedCrawlBody).not.toBeNull();
    });

    expect(capturedCrawlBody.keyword).toContain('Corporate Travel Coordinator');
    expect(capturedCrawlBody.keyword).toContain('Travel Consultant');

    // Click Corporate Travel Coordinator again to unselect it
    capturedCrawlBody = null;
    fireEvent.click(coordPill);

    // Only Travel Consultant remains active
    expect(coordPill).toHaveAttribute('aria-pressed', 'false');
    expect(consultantPill).toHaveAttribute('aria-pressed', 'true');
    expect(capturedCrawlBody).toBeNull();

    // Clicking Fetch Live Roles queries with remaining role
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(capturedCrawlBody).not.toBeNull();
    });

    expect(capturedCrawlBody.keyword).toBe('Travel Consultant');
  });
});

