// Screening Answer Bank & Fast ATS Application Copilot
// Manages canonical candidate responses to standard ATS questions across Greenhouse, Lever, and Workday.

export interface ScreeningAnswerEntry {
  id: string;
  topic: 'salary' | 'notice_period' | 'work_authorization' | 'relocation' | 'links' | 'custom_qna';
  questionLabel: string;
  answerText: string;
  source: 'user_defined' | 'profile_derived';
  updatedAt: string;
}

const STORAGE_KEY = 'jobstudio_screening_answer_bank';

export const DEFAULT_SCREENING_QUESTIONS: Omit<ScreeningAnswerEntry, 'id' | 'updatedAt'>[] = [
  {
    topic: 'salary',
    questionLabel: 'Desired Base Compensation / Salary Expectation',
    answerText: 'Market competitive based on scope and responsibilities; open to discussing within the approved band.',
    source: 'profile_derived',
  },
  {
    topic: 'notice_period',
    questionLabel: 'Notice Period / Earliest Start Date',
    answerText: 'Standard 2 weeks notice; available immediately upon signed offer.',
    source: 'profile_derived',
  },
  {
    topic: 'work_authorization',
    questionLabel: 'Work Authorization & Visa Sponsorship Status',
    answerText: 'Authorized to work lawfully in target region; do not require visa sponsorship.',
    source: 'profile_derived',
  },
  {
    topic: 'relocation',
    questionLabel: 'Willingness to Relocate / Work Arrangement Preference',
    answerText: 'Open to hybrid, remote, or relocation for the right strategic opportunity.',
    source: 'profile_derived',
  },
  {
    topic: 'custom_qna',
    questionLabel: 'Why are you interested in this company and role?',
    answerText: 'Your product trajectory and commitment to engineering excellence closely mirror my professional background and operational standards.',
    source: 'profile_derived',
  },
];

export function getSavedScreeningAnswers(userId: string = 'default'): ScreeningAnswerEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Fallback defaults
  return DEFAULT_SCREENING_QUESTIONS.map((q, idx) => ({
    ...q,
    id: `ans_${idx}_${Date.now()}`,
    updatedAt: new Date().toISOString(),
  }));
}

export function saveScreeningAnswers(answers: ScreeningAnswerEntry[], userId: string = 'default'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(answers));
  } catch {}
}

export interface AtsDossierMeta {
  candidateName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  targetRole?: string;
  targetCompany?: string;
  skills?: string[];
  summary?: string;
}

// Generate formatted ATS Dossier for instant 1-click clipboard copy
export function generateAtsApplicationDossier(
  answers: ScreeningAnswerEntry[],
  meta?: AtsDossierMeta
): string {
  const lines: string[] = [
    `📋 ATS ONE-CLICK APPLICATION DOSSIER`,
    `=====================================`,
  ];

  if (meta?.targetRole || meta?.targetCompany) {
    if (meta.targetRole) lines.push(`Target Role: ${meta.targetRole}`);
    if (meta.targetCompany) lines.push(`Company: ${meta.targetCompany}`);
    if (meta.location) lines.push(`Location: ${meta.location}`);
    lines.push(`=====================================`);
  }

  lines.push(
    `Applicant: ${meta?.candidateName || 'Candidate'}`,
    `Email: ${meta?.email || 'N/A'}`,
    `Phone: ${meta?.phone || 'N/A'}`,
    `LinkedIn: ${meta?.linkedin || 'N/A'}`
  );
  if (meta?.portfolio) lines.push(`Portfolio: ${meta.portfolio}`);
  lines.push(``);

  lines.push(`--- STANDARD APPLICATION ANSWERS ---`);
  answers.forEach((ans) => {
    lines.push(`Q: ${ans.questionLabel}`);
    lines.push(`A: ${ans.answerText}`);
    lines.push(``);
  });

  if (meta?.summary) {
    lines.push(`--- TAILORED SUMMARY / ELEVATOR PITCH ---`);
    lines.push(meta.summary);
    lines.push(``);
  }

  if (meta?.skills && meta.skills.length > 0) {
    lines.push(`--- ATS KEYWORDS & CORE COMPETENCIES ---`);
    lines.push(meta.skills.join(', '));
    lines.push(``);
  }

  return lines.filter((l) => l !== undefined).join('\n');
}

/**
 * Robust clipboard copy function with fallback to document.execCommand('copy').
 * Ensures copy works across modern browsers, HTTPS, HTTP, and iframe environments.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Try modern Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for non-HTTPS, unfocused windows, or restrictive iframes
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Boolean(success);
  } catch {
    return false;
  }
}
