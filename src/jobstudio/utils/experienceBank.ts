// Experience Bank & Anti-Hallucination Provenance Guard
// Manages atomic candidate career evidence with strict provenance tracking ('user_asserted' vs 'model_inferred').
// Enforces that AI resume tailoring cannot inject unbacked career claims without explicit candidate awareness.

export type ProvenanceType = 'user_asserted' | 'model_inferred';

export interface EvidenceAtom {
  id: string;
  category: 'metric' | 'skill_claim' | 'achievement' | 'leadership' | 'responsibility';
  roleTitle?: string;
  companyName?: string;
  claimText: string;
  keywords: string[];
  provenance: ProvenanceType;
  verified: boolean;
  createdAt: string;
}

export interface BulletVerificationResult {
  bulletText: string;
  isBackedByBank: boolean;
  matchedAtom?: EvidenceAtom;
  provenance: ProvenanceType;
  confidence: number;
}

const STORAGE_KEY = 'jobstudio_experience_bank';

// Deconstruct profile text into atomic evidence statements
export function extractEvidenceAtoms(profileText: string, provenance: ProvenanceType = 'user_asserted'): EvidenceAtom[] {
  if (!profileText) return [];

  const lines = profileText.split('\n').map((l) => l.trim()).filter((l) => l.length >= 15);
  const atoms: EvidenceAtom[] = [];

  let currentCompany = '';
  let currentRole = '';

  for (const line of lines) {
    // Check if line looks like a header e.g. "Senior Engineer at Acme" or "### Experience"
    if (line.includes(' at ') || line.includes(' | ') || line.startsWith('###')) {
      const parts = line.replace(/^[#\-*•\s]+/, '').split(/\s*(?:at|\||–|—)\s*/i);
      if (parts.length >= 2) {
        currentRole = parts[0].trim();
        currentCompany = parts[1].trim();
      }
      continue;
    }

    // Skip generic section headings
    if (/^(skills|education|certifications|summary|experience|projects)$/i.test(line)) continue;

    const clean = line.replace(/^[#\-*•\s]+/, '').trim();
    if (clean.length < 20) continue;

    // Detect category
    let category: EvidenceAtom['category'] = 'responsibility';
    if (/\d+[%kKmMbB]?|\$\d+|\b(increased|reduced|boosted|grew|accelerated|cut|scaled|delivered)\b/i.test(clean)) {
      category = 'metric';
    } else if (/\b(architected|engineered|built|implemented|deployed|refactored|designed)\b/i.test(clean)) {
      category = 'achievement';
    } else if (/\b(led|mentored|managed|directed|coordinated|spearheaded|hired)\b/i.test(clean)) {
      category = 'leadership';
    }

    // Extract key tokens
    const tokens = clean
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 3);

    atoms.push({
      id: `atom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category,
      roleTitle: currentRole || undefined,
      companyName: currentCompany || undefined,
      claimText: clean,
      keywords: Array.from(new Set(tokens)),
      provenance,
      verified: provenance === 'user_asserted',
      createdAt: new Date().toISOString(),
    });
  }

  return atoms;
}

// Client persistence
export function getSavedExperienceBank(userId: string = 'default'): EvidenceAtom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExperienceBank(atoms: EvidenceAtom[], userId: string = 'default'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(atoms));
  } catch {}
}

// Verify a tailored bullet against candidate's experience bank
export function verifyBulletAgainstBank(bulletText: string, bank: EvidenceAtom[]): BulletVerificationResult {
  if (!bulletText || bank.length === 0) {
    return {
      bulletText,
      isBackedByBank: false,
      provenance: 'model_inferred',
      confidence: 0,
    };
  }

  const bulletTokens = bulletText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 3);

  let bestMatch: EvidenceAtom | undefined;
  let highestOverlap = 0;

  for (const atom of bank) {
    if (!atom.keywords.length) continue;
    const common = atom.keywords.filter((k) => bulletTokens.includes(k));
    const score = common.length / Math.min(atom.keywords.length, bulletTokens.length || 1);
    if (score > highestOverlap) {
      highestOverlap = score;
      bestMatch = atom;
    }
  }

  // Threshold: at least 35% keyword overlap with an atom in the bank
  const isBacked = highestOverlap >= 0.35 && Boolean(bestMatch);

  return {
    bulletText,
    isBackedByBank: isBacked,
    matchedAtom: isBacked ? bestMatch : undefined,
    provenance: isBacked ? (bestMatch?.provenance || 'user_asserted') : 'model_inferred',
    confidence: Math.round(highestOverlap * 100),
  };
}
