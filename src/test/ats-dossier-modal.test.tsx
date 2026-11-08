import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AtsDossierModal } from '@/jobstudio/components/AtsDossierModal';
import { ScreeningAnswerEntry } from '@/jobstudio/utils/screeningAnswerBank';

afterEach(cleanup);

describe('AtsDossierModal Component', () => {
  const sampleAnswers: ScreeningAnswerEntry[] = [
    {
      id: 'ans_1',
      topic: 'salary',
      questionLabel: 'Desired Base Compensation',
      answerText: '$140,000 / year base, negotiable based on total package',
      source: 'user_defined',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ans_2',
      topic: 'notice_period',
      questionLabel: 'Notice Period',
      answerText: '2 weeks standard notice period',
      source: 'user_defined',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ans_3',
      topic: 'work_authorization',
      questionLabel: 'Work Authorization',
      answerText: 'Authorized to work lawfully; do not require sponsorship',
      source: 'user_defined',
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    targetRole: 'Senior Piping Designer',
    targetCompany: 'Arcadis',
    targetLocation: 'Bangalore, India',
    candidateName: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'https://linkedin.com/in/rohan-sharma-piping',
    summary: 'Senior Piping Designer with 10+ years in EPC refinery and offshore plant engineering.',
    skills: ['SP3D', 'PDMS', 'AutoCAD Plant 3D', 'Piping Stress Analysis', 'ASME B31.3'],
    screeningAnswers: sampleAnswers,
    onNavigateToScreening: vi.fn(),
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders modal with target role, company, candidate details, and answers', () => {
    render(<AtsDossierModal {...defaultProps} />);

    expect(screen.getByText('ATS Application Dossier')).toBeInTheDocument();
    expect(screen.getAllByText(/Senior Piping Designer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Arcadis/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Rohan Sharma')).toBeInTheDocument();
    expect(screen.getByText('rohan.sharma@example.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('$140,000 / year base, negotiable based on total package')).toBeInTheDocument();
    expect(screen.getByText('2 weeks standard notice period')).toBeInTheDocument();
  });

  it('copies full dossier to clipboard on clicking Copy Full Dossier', async () => {
    render(<AtsDossierModal {...defaultProps} />);

    const copyAllBtn = screen.getByRole('button', { name: /copy full dossier/i });
    fireEvent.click(copyAllBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];
    expect(copiedText).toContain('ATS ONE-CLICK APPLICATION DOSSIER');
    expect(copiedText).toContain('Senior Piping Designer');
    expect(copiedText).toContain('Arcadis');
    expect(copiedText).toContain('Rohan Sharma');
    expect(copiedText).toContain('$140,000 / year base');
  });

  it('copies individual field to clipboard when clicking field copy button', async () => {
    render(<AtsDossierModal {...defaultProps} />);

    const emailCopyBtn = screen.getByTitle('Copy Email Address');
    fireEvent.click(emailCopyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('rohan.sharma@example.com');
  });

  it('triggers onClose when clicking close button or pressing Escape', () => {
    const onClose = vi.fn();
    render(<AtsDossierModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByLabelText(/close ats dossier modal/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('navigates to Interview Prep tab when clicking customize link', () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<AtsDossierModal {...defaultProps} onNavigateToScreening={onNavigate} onClose={onClose} />);

    const navBtn = screen.getByText(/customize answers in interview prep tab/i);
    fireEvent.click(navBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalled();
  });
});
