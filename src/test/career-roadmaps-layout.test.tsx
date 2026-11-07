import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CareerRoadmapsView } from '@/jobstudio/components/CareerRoadmapsView';
import { CAREER_ROADMAPS } from '@/jobstudio/data/roadmapData';

afterEach(cleanup);

describe('CareerRoadmapsView Layout and Filtering', () => {
  it('renders all domain category pills with full names and un-truncated text', () => {
    render(<CareerRoadmapsView />);

    // Header and search bar
    expect(screen.getByText('Learning Paths for 2026 Careers')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search roles, skills, or tech/i)).toBeInTheDocument();

    // All categories exist with full labels
    expect(screen.getByRole('button', { name: /^All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^AI & Data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cloud & DevOps/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Operations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Product & Project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Solutions & GTM/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Business & Finance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Travel & Hospitality/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Creative & Design/i })).toBeInTheDocument();
  });

  it('filters by category and allows resetting filters', () => {
    render(<CareerRoadmapsView />);

    // Click on Operations category
    const opsButton = screen.getByRole('button', { name: /^Operations/i });
    fireEvent.click(opsButton);

    // Should filter to Operations roadmaps
    expect(screen.getByText('Operations & Workforce Management (WFM)')).toBeInTheDocument();

    // Click Reset Filters
    const resetBtn = screen.getByRole('button', { name: /Reset filters/i });
    fireEvent.click(resetBtn);

    // All roadmaps should be visible again
    expect(screen.getByText('New Grad SWE')).toBeInTheDocument();
  });

  it('displays a friendly empty state when no roadmaps match search', () => {
    render(<CareerRoadmapsView />);

    const searchInput = screen.getByPlaceholderText(/Search roles, skills, or tech/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentrole12345' } });

    expect(screen.getByText('No learning paths found')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: 'Reset Filters' });
    fireEvent.click(resetBtn);

    expect(screen.getByText('New Grad SWE')).toBeInTheDocument();
  });

  it('validates 2026 data integrity across all career roadmaps', () => {
    expect(CAREER_ROADMAPS.length).toBeGreaterThanOrEqual(31);

    for (const roadmap of CAREER_ROADMAPS) {
      // 1. Exact count parity
      const actualStages = roadmap.stages.length;
      const actualSkills = roadmap.stages.reduce((acc, s) => acc + s.skills.length, 0);
      const actualResources = roadmap.stages.reduce(
        (acc, s) => acc + s.skills.reduce((sum, k) => sum + k.resources.length, 0),
        0
      );

      expect(roadmap.stagesCount).toBe(actualStages);
      expect(roadmap.skillsCount).toBe(actualSkills);
      expect(roadmap.resourcesCount).toBe(actualResources);
      expect(roadmap.skillsCount).toBeGreaterThan(0);
      expect(roadmap.resourcesCount).toBeGreaterThan(0);

      // 2. Resource validation (no dead links, no bare root placeholders)
      for (const stage of roadmap.stages) {
        for (const skill of stage.skills) {
          for (const res of skill.resources) {
            expect(res.url).toMatch(/^https:\/\//);
            expect(res.url).not.toContain('learndigital.withgoogle.com');
            expect(res.url).not.toBe('https://www.coursera.org');
            expect(res.url).not.toBe('https://academy.hubspot.com');
            expect(res.url).not.toBe('https://skillshop.withgoogle.com');
            expect(res.title.trim().length).toBeGreaterThan(0);
            expect(res.provider.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }

    // 3. Verify specific 2026 essentials injected
    const swe = CAREER_ROADMAPS.find((r) => r.id === 'new-grad-swe');
    expect(swe).toBeDefined();
    const sweAiSkill = swe?.stages.flatMap((s) => s.skills).find((k) => k.id === 'swe-ai-toolchain');
    expect(sweAiSkill).toBeDefined();
    expect(sweAiSkill?.name).toContain('AI-Assisted Development');

    const sales = CAREER_ROADMAPS.find((r) => r.id === 'b2b-sales-sdr-ae');
    expect(sales).toBeDefined();
    const deliverabilitySkill = sales?.stages.flatMap((s) => s.skills).find((k) => k.name.includes('deliverability'));
    expect(deliverabilitySkill).toBeDefined();

    const marketing = CAREER_ROADMAPS.find((r) => r.id === 'growth-performance-marketing');
    expect(marketing).toBeDefined();
    const serverSideSkill = marketing?.stages.flatMap((s) => s.skills).find((k) => k.name.includes('Server-Side'));
    expect(serverSideSkill).toBeDefined();
  });
});
