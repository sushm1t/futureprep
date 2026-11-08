import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtsReadinessDrawer } from '../jobstudio/components/AtsReadinessDrawer';
import { scoreAtsReadiness } from '../jobstudio/utils/atsReadinessScorer';
import { TailoredResumeData } from '../jobstudio/data/defaultData';

describe('AtsReadinessDrawer Live Feedback & 1-Click Fixes', () => {
  const initialResume: TailoredResumeData = {
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
    ],
    experiences: [
      {
        role: 'Piping Design Trainee',
        company: 'PIPER CADD',
        location: 'Velachery, Chennai, India',
        period: 'Completed', // Needs date
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

  it('renders ATS Screening Intelligence drawer with score and 1-click Auto-Fix button', () => {
    const report = scoreAtsReadiness(initialResume, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);
    const handleUpdate = vi.fn();

    render(
      <AtsReadinessDrawer
        isOpen={true}
        onClose={vi.fn()}
        report={report}
        targetRole="Piping Design Engineer"
        resume={initialResume}
        onUpdateResume={handleUpdate}
      />
    );

    expect(screen.getByText(/ATS Screening Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Apply All ATS Fixes/i)).toBeInTheDocument();
  });

  it('clicking Auto-Apply All ATS Fixes triggers onUpdateResume with a 100/100 resume', () => {
    const report = scoreAtsReadiness(initialResume, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);
    let updatedResume: TailoredResumeData | null = null;
    const handleUpdate = vi.fn((res: TailoredResumeData) => {
      updatedResume = res;
    });

    render(
      <AtsReadinessDrawer
        isOpen={true}
        onClose={vi.fn()}
        report={report}
        targetRole="Piping Design Engineer"
        resume={initialResume}
        onUpdateResume={handleUpdate}
      />
    );

    const boostButton = screen.getByText(/Auto-Apply All ATS Fixes/i);
    fireEvent.click(boostButton);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(updatedResume).not.toBeNull();

    // Verify the updated resume immediately achieves 100/100
    const finalReport = scoreAtsReadiness(updatedResume!, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);
    expect(finalReport.overall).toBe(100);
  });

  it('allows polishing a custom bullet with AI action verb and metrics', () => {
    const report = scoreAtsReadiness(initialResume, ['Piping Design', 'AutoCAD Plant 3D', 'Navisworks']);
    const handleUpdate = vi.fn();

    render(
      <AtsReadinessDrawer
        isOpen={true}
        onClose={vi.fn()}
        report={report}
        targetRole="Piping Design Engineer"
        resume={initialResume}
        onUpdateResume={handleUpdate}
      />
    );

    // Open bullet crafter
    const openCrafterBtn = screen.getByText(/Open Crafter/i);
    fireEvent.click(openCrafterBtn);

    const textarea = screen.getByPlaceholderText(/e\.g\. created P&ID drawings/i);
    fireEvent.change(textarea, { target: { value: 'created piping models and checked clashes' } });

    const polishBtn = screen.getByText(/Polish with Action Verb & Metric/i);
    fireEvent.click(polishBtn);

    // Shows preview
    expect(screen.getByText(/ATS-Optimized Preview/i)).toBeInTheDocument();
    const applyToResumeBtn = screen.getByText(/Apply Directly to Resume/i);
    fireEvent.click(applyToResumeBtn);

    expect(handleUpdate).toHaveBeenCalled();
  });
});
