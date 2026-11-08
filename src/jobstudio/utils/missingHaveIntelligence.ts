// "Missing-Have" Intelligence Engine
// Cross-references missing job requirements against the candidate's Master Profile.
// Identifies skills verified in candidate history that were accidentally omitted from the tailored draft.

import { TailoredResumeData } from '../data/defaultData';

export interface MissingHaveItem {
  skill: string;
  evidenceQuote: string; // The specific sentence or line from the master profile proving competence
  confidence: number; // 0.85 to 1.0
  recommendedAction: 'inject_into_skills' | 'inject_into_summary' | 'inject_bullet';
  suggestedBullet: string;
}

/**
 * Scans candidate master profile text for mentions of missing ATS competencies.
 */
export function detectMissingHaveSkills(
  missingSkills: string[],
  masterProfileText: string,
  currentDraftSkills: string[] = []
): MissingHaveItem[] {
  if (!missingSkills || missingSkills.length === 0 || !masterProfileText) return [];

  const draftSkillsLower = new Set(currentDraftSkills.map((s) => s.toLowerCase().trim()));
  const masterLines = masterProfileText.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);

  const results: MissingHaveItem[] = [];

  for (const missing of missingSkills) {
    const missingLower = missing.toLowerCase().trim();
    if (draftSkillsLower.has(missingLower)) continue; // Already in draft

    // Look for occurrences in master profile
    const regex = new RegExp(`\\b${escapeRegExp(missingLower)}\\b`, 'i');
    const matchedLine = masterLines.find((line) => regex.test(line));

    if (matchedLine) {
      results.push({
        skill: missing,
        evidenceQuote: matchedLine.slice(0, 180),
        confidence: 0.95,
        recommendedAction: 'inject_into_skills',
        suggestedBullet: matchedLine.startsWith('-') || matchedLine.startsWith('•')
          ? matchedLine.replace(/^[-•*]\s*/, '')
          : `Demonstrated professional execution with ${missing} in complex production environments.`,
      });
    }
  }

  return results;
}

/**
 * 1-Click Injection Helper:
 * Seamlessly adds a verified missing-have skill to the current resume draft.
 */
export function injectMissingHaveSkill(
  currentResume: TailoredResumeData,
  item: MissingHaveItem
): TailoredResumeData {
  const existingSkills = currentResume.skills || [];
  const normalizedNew = item.skill.toLowerCase().trim();

  // Avoid duplicates
  const alreadyHas = existingSkills.some((s) => s.toLowerCase().trim() === normalizedNew);
  const updatedSkills = alreadyHas ? existingSkills : [item.skill, ...existingSkills];

  // If bullet is provided and experiences exist, optionally enrich the top work experience
  let updatedExperiences = [...currentResume.experiences];
  if (updatedExperiences.length > 0 && item.suggestedBullet) {
    const firstExp = updatedExperiences[0];
    const bulletExists = firstExp.bullets.some((b) => b.toLowerCase().includes(normalizedNew));
    if (!bulletExists) {
      updatedExperiences[0] = {
        ...firstExp,
        bullets: [item.suggestedBullet, ...firstExp.bullets],
      };
    }
  }

  return {
    ...currentResume,
    skills: updatedSkills,
    experiences: updatedExperiences,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
