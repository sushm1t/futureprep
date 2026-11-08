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

// Generate formatted ATS Dossier for instant 1-click clipboard copy
export function generateAtsApplicationDossier(
  answers: ScreeningAnswerEntry[],
  meta?: { candidateName?: string; email?: string; phone?: string; linkedin?: string; portfolio?: string }
): string {
  const lines: string[] = [
    `📋 ATS ONE-CLICK APPLICATION DOSSIER`,
    `=====================================`,
    `Applicant: ${meta?.candidateName || 'Candidate'}`,
    `Email: ${meta?.email || 'N/A'}`,
    `Phone: ${meta?.phone || 'N/A'}`,
    `LinkedIn: ${meta?.linkedin || 'N/A'}`,
    meta?.portfolio ? `Portfolio: ${meta.portfolio}` : '',
    ``,
    `--- STANDARD APPLICATION ANSWERS ---`,
  ];

  answers.forEach((ans) => {
    lines.push(`Q: ${ans.questionLabel}`);
    lines.push(`A: ${ans.answerText}`);
    lines.push(``);
  });

  return lines.filter(Boolean).join('\n');
}
