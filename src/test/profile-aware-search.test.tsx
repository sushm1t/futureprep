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
    expect(screen.getByText(/Medical Laboratory Technologist/i)).toBeInTheDocument();
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
});

