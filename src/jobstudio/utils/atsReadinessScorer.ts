// ATS-Readiness Scorer & Screening Intelligence Engine
// Inspired by Freehire's internal/candidate/atscheck deterministic 0–100 scoring model
// Evaluates plain-text & structured resume layers against 5 weighted categories summing to 100:
// 1. Keyword Strength (40)
// 2. Format Compliance (20)
// 3. Section Completeness (15)
// 4. Content Quality (15)
// 5. Length & Density (10)

import { TailoredResumeData, WorkExperience } from '../data/defaultData';

export type AtsCheckStatus = 'pass' | 'warn' | 'fail';

export interface AtsLineItem {
  id: string;
  points: number;
  maxPoints: number;
  label: string;
  description: string;
  status: AtsCheckStatus;
  fixRecommendation?: string;
}

export interface AtsScoreCategory {
  id: 'keyword_strength' | 'format_compliance' | 'section_completeness' | 'content_quality' | 'length_density';
  label: string;
  score: number;
  max: number;
  items: AtsLineItem[];
}

export interface AtsReadinessReport {
  overall: number; // 0-100 sum of category scores
  potential: number; // overall + recoverable points, capped at 100
  categories: AtsScoreCategory[];
  strongKeywords: string[];
  recommendedKeywords: string[];
  topFixes: string[];
  wordCount: number;
  actionVerbCount: number;
  quantifiedMetricsCount: number;
}

// Action verbs recognized by modern ATS engines (Taleo, Greenhouse, Workday, Lever)
export const STRONG_ACTION_VERBS = new Set([
  'built', 'led', 'shipped', 'designed', 'developed', 'improved', 'reduced',
  'scaled', 'launched', 'migrated', 'architected', 'delivered', 'increased',
  'decreased', 'cut', 'drove', 'owned', 'created', 'implemented', 'optimized',
  'automated', 'established', 'spearheaded', 'managed', 'mentored', 'introduced',
  'rebuilt', 'streamlined', 'accelerated', 'orchestrated', 'engineered', 'formulated',
  'executed', 'negotiated', 'resolved', 'standardized', 'transformed', 'pioneered',
  'championed', 'deployed', 'overhauled', 'boosted', 'generated', 'minimized',
  'modeled', 'conducted', 'extracted', 'verified', 'coordinated', 'analyzed',
  'authored', 'administered', 'programmed', 'integrated', 'configured', 'supervised',
  'directed', 'synthesized', 'inspected', 'produced', 'facilitated', 'aligned',
  'structured', 'monitored', 'maintained', 'trained'
]);

// Quantifiable metrics regex (%, $, x multipliers, numbers with units)
const QUANTIFIABLE_REGEX = /(?:\d+(?:\.\d+)?\s?%|\$\s?\d+(?:,\d{3})*(?:\.\d+)?(?:k|m|b)?|\b\d+x\b|\b\d+\s?(?:k|m|ms|seconds|minutes|hours|days|weeks|fte|headcount|cases|transactions|users|customers|basis points)\b)/i;

/**
 * Extracts plain text from a TailoredResumeData object to simulate what an ATS parser extracts.
 */
export function extractPlainTextFromResume(resume: TailoredResumeData): string {
  const parts: string[] = [];

  parts.push(resume.full_name || '');
  parts.push([resume.email, resume.phone, resume.location, resume.linkedin, resume.portfolio].filter(Boolean).join(' | '));

  if (resume.tailored_summary) {
    parts.push('PROFESSIONAL SUMMARY');
    parts.push(resume.tailored_summary);
  }

  if (resume.skills && resume.skills.length > 0) {
    parts.push('SKILLS & CORE COMPETENCIES');
    parts.push(resume.skills.join(', '));
  }

  if (resume.experiences && resume.experiences.length > 0) {
    parts.push('WORK EXPERIENCE');
    for (const exp of resume.experiences) {
      parts.push(`${exp.role || (exp as any).title || ''} at ${exp.company || ''} (${exp.period || (exp as any).date_range || ''})`);
      if (exp.bullets && exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          parts.push(`• ${b}`);
        }
      }
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    parts.push('PROJECTS');
    for (const proj of resume.projects) {
      parts.push(`${proj.name}: ${proj.description || ''}`);
      if (proj.bullets) {
        for (const b of proj.bullets) {
          parts.push(`• ${b}`);
        }
      }
    }
  }

  if (resume.education && resume.education.length > 0) {
    parts.push('EDUCATION');
    for (const edu of resume.education) {
      parts.push(`${edu.degree} – ${edu.institution} (${edu.year})`);
    }
  }

  if (resume.certifications && resume.certifications.length > 0) {
    parts.push('CERTIFICATIONS');
    parts.push(resume.certifications.join(', '));
  }

  return parts.join('\n\n');
}

/**
 * Computes deterministic 0-100 ATS-readiness report for a resume against target role context.
 */
export function scoreAtsReadiness(
  resume: TailoredResumeData,
  targetRoleKeywords: string[] = []
): AtsReadinessReport {
  const plainText = extractPlainTextFromResume(resume);
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Collect all bullet points across experiences and projects
  const allBullets: string[] = [];
  if (resume.experiences) {
    for (const exp of resume.experiences) {
      if (exp.bullets) allBullets.push(...exp.bullets);
    }
  }
  if (resume.projects) {
    for (const proj of resume.projects) {
      if (proj.bullets) allBullets.push(...proj.bullets);
    }
  }

  // Count strong action verbs at start of bullets
  let actionVerbCount = 0;
  for (const bullet of allBullets) {
    const firstWord = bullet.trim().replace(/^[^a-zA-Z]+/, '').split(/\s+/)[0]?.toLowerCase() || '';
    if (STRONG_ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }
  }

  // Count quantified metrics in bullets
  let quantifiedMetricsCount = 0;
  for (const bullet of allBullets) {
    if (QUANTIFIABLE_REGEX.test(bullet)) {
      quantifiedMetricsCount++;
    }
  }

  // 1. Keyword Strength Category (Max: 40)
  const strongKeywords: string[] = [];
  const recommendedKeywords: string[] = [];
  const resumeTextLower = plainText.toLowerCase();

  // Normalize target role keywords
  const cleanRoleKeywords = [...new Set(targetRoleKeywords.map((k) => k.trim()).filter(Boolean))];

  if (cleanRoleKeywords.length > 0) {
    for (const kw of cleanRoleKeywords) {
      const kwLower = kw.toLowerCase();
      if (resumeTextLower.includes(kwLower)) {
        strongKeywords.push(kw);
      } else {
        recommendedKeywords.push(kw);
      }
    }
  }

  const keywordCategoryItems: AtsLineItem[] = [];
  let keywordScore = 0;

  if (cleanRoleKeywords.length === 0) {
    // If no specific role keywords supplied, evaluate internal skills breadth
    const skillsCount = (resume.skills?.length || 0) + (resume.core_competencies?.length || 0);
    keywordScore = Math.min(40, Math.round((skillsCount / 8) * 40));
    keywordCategoryItems.push({
      id: 'general_skills_coverage',
      points: keywordScore,
      maxPoints: 40,
      label: 'Core Competency Coverage',
      description: `${skillsCount} skills and technical competencies listed`,
      status: keywordScore >= 30 ? 'pass' : 'warn',
      fixRecommendation: keywordScore < 30 ? 'Add at least 8 relevant technical and domain skills to match standard requisitions' : undefined,
    });
  } else {
    keywordScore = Math.min(40, Math.round((strongKeywords.length / cleanRoleKeywords.length) * 40));
    keywordCategoryItems.push({
      id: 'target_keywords_match',
      points: keywordScore,
      maxPoints: 40,
      label: 'Target Vacancy Keyword Coverage',
      description: `${strongKeywords.length} of ${cleanRoleKeywords.length} essential role keywords matched`,
      status: keywordScore >= 28 ? 'pass' : keywordScore >= 16 ? 'warn' : 'fail',
      fixRecommendation: recommendedKeywords.length > 0
        ? `Incorporate missing keywords (${recommendedKeywords.slice(0, 5).join(', ')}) where you have hands-on experience`
        : undefined,
    });
  }

  // 2. Format Compliance Category (Max: 20)
  const formatItems: AtsLineItem[] = [];

  // Machine-readable text (8 pts)
  const isReadable = wordCount >= 30;
  formatItems.push({
    id: 'machine_readable',
    points: isReadable ? 8 : 0,
    maxPoints: 8,
    label: 'Text is Machine-Readable',
    description: isReadable ? `${wordCount} words extractable by standard ATS parsers` : 'Text layer empty or scan-only',
    status: isReadable ? 'pass' : 'fail',
    fixRecommendation: !isReadable ? 'Ensure resume is rendered as vector text rather than a rasterized image or scan' : undefined,
  });

  // Contact info (4 pts)
  const hasContact = Boolean(resume.email && resume.phone);
  formatItems.push({
    id: 'contact_info',
    points: hasContact ? 4 : 0,
    maxPoints: 4,
    label: 'Contact Info Present',
    description: hasContact ? 'Both email and phone number clearly parseable' : 'Missing email or phone number',
    status: hasContact ? 'pass' : 'warn',
    fixRecommendation: !hasContact ? 'Add both email address and phone number in header' : undefined,
  });

  // Bulleted structure (2 pts)
  const hasBullets = allBullets.length >= 2;
  formatItems.push({
    id: 'bulleted_structure',
    points: hasBullets ? 2 : 0,
    maxPoints: 2,
    label: 'Bulleted Achievements',
    description: hasBullets ? `${allBullets.length} bullet points structured for quick scanner indexing` : 'Few or no bullet points',
    status: hasBullets ? 'pass' : 'warn',
    fixRecommendation: !hasBullets ? 'Break dense paragraphs into structured bullet points' : undefined,
  });

  // Dated work history (2 pts)
  const hasDatedHistory = Boolean(
    resume.experiences && resume.experiences.some((exp) => {
      const p = exp.period || (exp as any).date_range;
      return Boolean(p && /\d{4}/.test(p));
    })
  );
  formatItems.push({
    id: 'dated_history',
    points: hasDatedHistory ? 2 : 0,
    maxPoints: 2,
    label: 'Dated Work History',
    description: hasDatedHistory ? 'Role tenures and start/end years are clearly stated' : 'Missing dates on work experiences',
    status: hasDatedHistory ? 'pass' : 'warn',
    fixRecommendation: !hasDatedHistory ? 'Include clear start and end dates (e.g., 2022 – Present) for each position' : undefined,
  });

  // LinkedIn linked (2 pts)
  const hasLinkedin = Boolean(resume.linkedin && resume.linkedin.toLowerCase().includes('linkedin.com'));
  formatItems.push({
    id: 'linkedin_linked',
    points: hasLinkedin ? 2 : 0,
    maxPoints: 2,
    label: 'LinkedIn Profile Linked',
    description: hasLinkedin ? 'LinkedIn profile URL verified in header' : 'No LinkedIn URL detected',
    status: hasLinkedin ? 'pass' : 'warn',
    fixRecommendation: !hasLinkedin ? 'Add your LinkedIn public profile URL to the header' : undefined,
  });

  // Reverse chronological order (2 pts)
  let isReverseChronological = true;
  if (resume.experiences && resume.experiences.length >= 2) {
    const years: number[] = [];
    for (const exp of resume.experiences) {
      const match = (exp.period || (exp as any).date_range || '').match(/(?:19|20)\d{2}/);
      if (match) years.push(parseInt(match[0], 10));
    }
    for (let i = 1; i < years.length; i++) {
      if (years[i] > years[i - 1]) {
        isReverseChronological = false;
        break;
      }
    }
  }
  formatItems.push({
    id: 'reverse_chronology',
    points: isReverseChronological ? 2 : 0,
    maxPoints: 2,
    label: 'Reverse-Chronological Ordering',
    description: isReverseChronological ? 'Positions listed starting with the most recent role' : 'Roles appear out of chronological sequence',
    status: isReverseChronological ? 'pass' : 'warn',
    fixRecommendation: !isReverseChronological ? 'List positions starting from current/most recent backward to earlier roles' : undefined,
  });

  // 3. Section Completeness Category (Max: 15)
  const sectionItems: AtsLineItem[] = [];

  const hasExp = Boolean(resume.experiences && resume.experiences.length > 0);
  sectionItems.push({
    id: 'experience_section',
    points: hasExp ? 4 : 0,
    maxPoints: 4,
    label: 'Experience Section',
    description: hasExp ? `${resume.experiences.length} verified work roles recorded` : 'No experience section',
    status: hasExp ? 'pass' : 'warn',
    fixRecommendation: !hasExp ? 'Add a standard Work Experience section' : undefined,
  });

  const hasSkills = Boolean(resume.skills && resume.skills.length >= 3);
  sectionItems.push({
    id: 'skills_section',
    points: hasSkills ? 3 : 0,
    maxPoints: 3,
    label: 'Skills Section',
    description: hasSkills ? 'Skills section clearly tagged and categorized' : 'Missing or sparse skills list',
    status: hasSkills ? 'pass' : 'warn',
    fixRecommendation: !hasSkills ? 'Add a dedicated Skills & Core Competencies section' : undefined,
  });

  const hasEdu = Boolean(resume.education && resume.education.length > 0);
  sectionItems.push({
    id: 'education_section',
    points: hasEdu ? 3 : 0,
    maxPoints: 3,
    label: 'Education Section',
    description: hasEdu ? 'Degree and academic institution recorded' : 'No education entries found',
    status: hasEdu ? 'pass' : 'warn',
    fixRecommendation: !hasEdu ? 'Include education degree and institution' : undefined,
  });

  const hasSummary = Boolean(resume.tailored_summary && resume.tailored_summary.trim().length > 20);
  sectionItems.push({
    id: 'summary_section',
    points: hasSummary ? 2 : 0,
    maxPoints: 2,
    label: 'Professional Summary',
    description: hasSummary ? 'Executive summary present at top' : 'No professional summary found',
    status: hasSummary ? 'pass' : 'warn',
    fixRecommendation: !hasSummary ? 'Add a 2-3 sentence professional summary highlighting your core value' : undefined,
  });

  // Summary keyword density (2 pts)
  const summaryLower = (resume.tailored_summary || '').toLowerCase();
  const summarySkillCount = (resume.skills || []).filter((s) => summaryLower.includes(s.toLowerCase())).length;
  const hasDenseSummary = summarySkillCount >= 2;
  sectionItems.push({
    id: 'summary_keywords',
    points: hasDenseSummary ? 2 : 0,
    maxPoints: 2,
    label: 'Summary Carries Role Keywords',
    description: hasDenseSummary ? 'Executive summary embeds concrete domain keywords' : 'Summary lacks concrete domain keywords',
    status: hasDenseSummary ? 'pass' : 'warn',
    fixRecommendation: !hasDenseSummary ? 'Weave at least 2 key technical/functional skills into your summary' : undefined,
  });

  // Summary concise <= 70 words (1 pt)
  const summaryWordCount = (resume.tailored_summary || '').trim().split(/\s+/).filter(Boolean).length;
  const isSummaryConcise = summaryWordCount > 0 && summaryWordCount <= 75;
  sectionItems.push({
    id: 'summary_conciseness',
    points: isSummaryConcise ? 1 : 0,
    maxPoints: 1,
    label: 'Summary is Concise (≤75 words)',
    description: isSummaryConcise ? `Summary is ${summaryWordCount} words (~6 second scan)` : `Summary is ${summaryWordCount} words (aim for ≤75)`,
    status: isSummaryConcise ? 'pass' : 'warn',
    fixRecommendation: !isSummaryConcise ? 'Trim summary to under 75 words so recruiters scan it in one glance' : undefined,
  });

  // 4. Content Quality Category (Max: 15)
  const contentItems: AtsLineItem[] = [];

  // Action verbs (6 pts)
  const hasEnoughActionVerbs = actionVerbCount >= 3;
  contentItems.push({
    id: 'action_verbs',
    points: hasEnoughActionVerbs ? 6 : Math.min(6, actionVerbCount * 2),
    maxPoints: 6,
    label: 'Bullets Lead with Strong Action Verbs',
    description: hasEnoughActionVerbs
      ? `${actionVerbCount} bullet points start with power action verbs (Built, Led, Scaled...)`
      : `Only ${actionVerbCount} bullets start with recognized action verbs (recommend ≥3)`,
    status: hasEnoughActionVerbs ? 'pass' : 'warn',
    fixRecommendation: !hasEnoughActionVerbs ? 'Begin each bullet with a strong action verb (Built, Shipped, Scaled, Led, Optimized)' : undefined,
  });

  // Quantified metrics (6 pts)
  const hasEnoughMetrics = quantifiedMetricsCount >= 2;
  contentItems.push({
    id: 'quantified_metrics',
    points: hasEnoughMetrics ? 6 : Math.min(6, quantifiedMetricsCount * 3),
    maxPoints: 6,
    label: 'Quantified, Measurable Results',
    description: hasEnoughMetrics
      ? `${quantifiedMetricsCount} bullet points contain quantified metrics (%, $, scale, velocity)`
      : `Only ${quantifiedMetricsCount} bullets contain numbers or percentages (aim for ≥2)`,
    status: hasEnoughMetrics ? 'pass' : 'warn',
    fixRecommendation: !hasEnoughMetrics ? 'Include concrete metrics (e.g. reduced latency by 35%, managed $10M budget)' : undefined,
  });

  // 3-5 bullets per role (3 pts)
  let bulletsPerRoleOk = true;
  if (resume.experiences && resume.experiences.length > 0) {
    for (const exp of resume.experiences) {
      const count = exp.bullets?.length || 0;
      if (count < 2 || count > 6) {
        bulletsPerRoleOk = false;
        break;
      }
    }
  } else {
    bulletsPerRoleOk = false;
  }
  contentItems.push({
    id: 'bullets_per_role',
    points: bulletsPerRoleOk ? 3 : 1,
    maxPoints: 3,
    label: 'Balanced Bullets per Role (3–5)',
    description: bulletsPerRoleOk ? 'Roles carry balanced bullet count without overwhelming recruiters' : 'Some roles have fewer than 2 or more than 6 bullets',
    status: bulletsPerRoleOk ? 'pass' : 'warn',
    fixRecommendation: !bulletsPerRoleOk ? 'Provide 3 to 5 strong bullets per recent role for optimal readability' : undefined,
  });

  // 5. Length & Density Category (Max: 10)
  const lengthItems: AtsLineItem[] = [];

  // Healthy word count band (150 - 1200 words) (5 pts)
  const isHealthyLength = wordCount >= 150 && wordCount <= 1200;
  lengthItems.push({
    id: 'healthy_length',
    points: isHealthyLength ? 5 : wordCount > 0 ? 2 : 0,
    maxPoints: 5,
    label: 'Healthy Resume Length',
    description: isHealthyLength ? `${wordCount} words (ideal 1–2 page target)` : `${wordCount} words (ideal band: 250–900 words)`,
    status: isHealthyLength ? 'pass' : 'warn',
    fixRecommendation: !isHealthyLength ? (wordCount < 150 ? 'Expand bullet descriptions to reach at least 250 words' : 'Trim non-essential details to stay under 900 words') : undefined,
  });

  // Good keyword density (5 pts)
  const uniqueSkillsCount = new Set(resume.skills || []).size;
  const hasGoodDensity = uniqueSkillsCount >= 5;
  lengthItems.push({
    id: 'skill_density',
    points: hasGoodDensity ? 5 : Math.min(5, uniqueSkillsCount),
    maxPoints: 5,
    label: 'Skill & Domain Density',
    description: hasGoodDensity ? `${uniqueSkillsCount} distinct technical & domain capabilities indexed` : `${uniqueSkillsCount} skills indexed (recommend ≥5)`,
    status: hasGoodDensity ? 'pass' : 'warn',
    fixRecommendation: !hasGoodDensity ? 'List at least 5 distinct competencies and tools' : undefined,
  });

  // Aggregate categories
  const categories: AtsScoreCategory[] = [
    {
      id: 'keyword_strength',
      label: 'Keyword Strength',
      score: keywordCategoryItems.reduce((acc, it) => acc + it.points, 0),
      max: 40,
      items: keywordCategoryItems,
    },
    {
      id: 'format_compliance',
      label: 'Format Compliance',
      score: formatItems.reduce((acc, it) => acc + it.points, 0),
      max: 20,
      items: formatItems,
    },
    {
      id: 'section_completeness',
      label: 'Section Completeness',
      score: sectionItems.reduce((acc, it) => acc + it.points, 0),
      max: 15,
      items: sectionItems,
    },
    {
      id: 'content_quality',
      label: 'Content Quality',
      score: contentItems.reduce((acc, it) => acc + it.points, 0),
      max: 15,
      items: contentItems,
    },
    {
      id: 'length_density',
      label: 'Length & Density',
      score: lengthItems.reduce((acc, it) => acc + it.points, 0),
      max: 10,
      items: lengthItems,
    },
  ];

  const overall = Math.min(100, categories.reduce((acc, cat) => acc + cat.score, 0));

  // Compute recoverable points for potential score
  let recoverable = 0;
  const topFixes: string[] = [];

  for (const cat of categories) {
    for (const it of cat.items) {
      if (it.status !== 'pass') {
        const gap = it.maxPoints - it.points;
        recoverable += gap;
        if (it.fixRecommendation) {
          topFixes.push(`+${gap} pts: ${it.fixRecommendation}`);
        }
      }
    }
  }

  const potential = Math.min(100, overall + recoverable);

  return {
    overall,
    potential,
    categories,
    strongKeywords: strongKeywords.slice(0, 15),
    recommendedKeywords: recommendedKeywords.slice(0, 15),
    topFixes: topFixes.slice(0, 5),
    wordCount,
    actionVerbCount,
    quantifiedMetricsCount,
  };
}
