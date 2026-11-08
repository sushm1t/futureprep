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
});