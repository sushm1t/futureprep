import { TailoredResumeData } from '../data/defaultData';

export interface ProfileSearchContext {
  targetRole: string;
  relatedRoles: string[];
  topSkillKeywords: string[];
  searchQueries: string[];
  domain: string;
  location: string;
  targetRelocation?: string;
  isNonTech: boolean;
  headline?: string;
}

const NON_TECH_KEYWORDS = [
  'medical',
  'laboratory',
  'technologist',
  'technician',
  'nurse',
  'nursing',
  'phlebotomy',
  'clinical',
  'hospital',
  'pathology',
  'biochemistry',
  'hematology',
  'doctor',
  'physician',
  'pharmacist',
  'pharmacy',
  'healthcare',
  'radiology',
  'dentist',
  'paramedic',
  'legal',
  'attorney',
  'lawyer',
  'paralegal',
  'civil engineer',
  'mechanical',
  'mechanical engineer',
  'heavy equipment',
  'heavy machinery',
  'machinery',
  'excavator',
  'jcb',
  'automotive',
  'production engineer',
  'maintenance engineer',
  'plant maintenance',
  'plant engineer',
  'erection',
  'commissioning',
  'mining machinery',
  'hvac',
  'piping',
  'welding',
  'fabrication',
  'teacher',
  'educator',
  'hospitality',
  'culinary',
  'chef',
];

const GENERIC_SKILLS_SET = new Set([
  'communication',
  'effective communication',
  'teamwork',
  'leadership',
  'time management',
  'public relations',
  'critical thinking',
  'problem solving',
  'adaptability',
  'interpersonal skills',
  'work ethic',
  'multitasking',
  'organizational skills',
  'collaboration',
  'detail-oriented',
  'detail oriented',
]);

const cleanText = (val: string): string =>
  (val || '').replace(/^[#*•\s_-]+|[#*•\s_-]+$/g, '').trim();

/**
 * Extracts a candidate's target job title, location, domain, and targeted ATS search queries
 * directly from their active resume or Master Profile text.
 */
export function extractProfileSearchContext(
  resume?: TailoredResumeData | null,
  masterProfileText: string = ''
): ProfileSearchContext {
  let targetRole = '';
  let headline = '';
  let location = '';

  // 1. Extract Target Role from Resume Data
  if (resume) {
    headline = cleanText(resume.headline || '');
    const rawTarget = cleanText(resume.target_role || '');
    const isPlaceholder = !rawTarget || /^(role|target role|candidate|specialist|professional)$/i.test(rawTarget);
    if (!isPlaceholder) {
      targetRole = rawTarget;
    } else if (headline && !/^(candidate|professional|headline)$/i.test(headline)) {
      const firstSeg = headline.split(/[|/•,]/)[0].trim();
      targetRole = cleanText(firstSeg);
    } else if (resume.experiences && resume.experiences.length > 0 && resume.experiences[0].title) {
      targetRole = cleanText(resume.experiences[0].title);
    }
  }

  // 2. Fallback to Master Profile Text parsing if resume has no target
  if (!targetRole && masterProfileText) {
    // Look for explicit Headline or Target Role lines
    const headlineMatch = masterProfileText.match(/(?:headline|target role|desired role|position):\s*([^\n\r]+)/i);
    if (headlineMatch && headlineMatch[1]) {
      const fullHead = cleanText(headlineMatch[1]);
      headline = fullHead;
      const firstSeg = fullHead.split(/[|/•,]/)[0].trim();
      targetRole = cleanText(firstSeg);
    } else {
      // Look for first title under experiences
      const titleMatch = masterProfileText.match(/(?:###|\*\*|•)?\s*(?:title|position|role):\s*([^\n\r]+)/i);
      if (titleMatch && titleMatch[1]) {
        targetRole = cleanText(titleMatch[1]);
      } else {
        // Look for common header title pattern e.g. "AMAYA P\nMEDICAL LABORATORY TECHNOLOGIST" or "PAYMENT OPERATIONS | FINTECH OPERATIONS"
        const lines = masterProfileText.split('\n').map((l) => l.trim()).filter(Boolean);
        for (let i = 0; i < Math.min(lines.length, 8); i++) {
          const line = lines[i];
          if (
            /technologist|technician|engineer|manager|specialist|developer|analyst|coordinator|director|officer|lead|nurse|consultant|operations|support|associate|sales|closer|executive/i.test(
              line
            ) &&
            !/candidate|email|phone|address|summary|experience|skills|education/i.test(line) &&
            line.length < 80
          ) {
            const firstSeg = line.split(/[|/•,]/)[0].trim();
            targetRole = cleanText(firstSeg || line);
            break;
          }
        }
      }
    }
  }

  // If targetRole contains "Co-Founder & Head of Growth", simplify primary title to "Head of Growth" if desired
  if (/co-?founder\s*&\s*head\s+of\s+growth/i.test(targetRole)) {
    targetRole = 'Head of Growth';
  }

  // 3. Extract Location & Relocation Intent
  const rawLoc = cleanText(resume?.contact_info?.location || '');
  if (rawLoc) {
    location = rawLoc;
  } else if (masterProfileText) {
    const locMatch = masterProfileText.match(/(?:location|address):\s*([^\n\r]+)/i);
    if (locMatch && locMatch[1]) {
      location = cleanText(locMatch[1]);
    }
  }

  let targetRelocation = '';
  if (/relocat(?:ing|ion)\s+to\s+([^\n\r()]+)/i.test(location)) {
    const relocMatch = location.match(/relocat(?:ing|ion)\s+to\s+([^\n\r()]+)/i);
    if (relocMatch && relocMatch[1]) {
      const rawReloc = cleanText(relocMatch[1]);
      if (/dubai|uae|united arab emirates|abu dhabi|sharjah/i.test(rawReloc)) {
        targetRelocation = 'United Arab Emirates (UAE)';
      } else {
        targetRelocation = rawReloc;
      }
    }
  }

  // Normalize Location to standard search hubs if detectable
  let normalizedLocation = '';
  const lowLoc = location.toLowerCase();
  if (targetRelocation === 'United Arab Emirates (UAE)' || lowLoc.includes('dubai') || lowLoc.includes('uae') || lowLoc.includes('united arab emirates') || lowLoc.includes('abu dhabi') || lowLoc.includes('sharjah')) {
    normalizedLocation = 'United Arab Emirates (UAE)';
    if (!targetRelocation) targetRelocation = 'United Arab Emirates (UAE)';
  } else if (lowLoc.includes('india') || lowLoc.includes('kerala') || lowLoc.includes('calicut') || lowLoc.includes('bengaluru') || lowLoc.includes('mumbai') || lowLoc.includes('delhi')) {
    normalizedLocation = 'India';
  } else if (lowLoc.includes('united states') || lowLoc.includes('usa') || lowLoc.includes(', us') || /\b(ca|ny|tx|fl|wa|il|ma|co|nc|ga)\b/.test(lowLoc)) {
    normalizedLocation = 'United States';
  } else if (lowLoc.includes('europe') || lowLoc.includes('uk') || lowLoc.includes('london') || lowLoc.includes('germany') || lowLoc.includes('france')) {
    normalizedLocation = 'Europe';
  } else if (lowLoc.includes('remote')) {
    normalizedLocation = 'Remote';
  }

  // 4. Determine Domain string & Non-Tech status
  const checkText = `${targetRole} ${headline} ${resume?.skills?.join(' ') || ''} ${resume?.tailored_summary || ''} ${masterProfileText.slice(0, 3000)}`.toLowerCase();
  const isNonTech = NON_TECH_KEYWORDS.some((kw) => checkText.includes(kw));

  let domain = 'Technology & Software';
  if (/medical|laboratory|pathology|hospital|nurse|phlebotomy|clinical|biochemistry|hematology|health/i.test(checkText)) {
    domain = 'Healthcare & Life Sciences';
  } else if (/mechanical|heavy\s+(machinery|equipment)|automotive|mining\s+machiner|production\s+engineer|plant\s+(engineer|maintenance)|jcb|excavator|erection\s+and\s+commissioning/i.test(checkText)) {
    domain = 'Mechanical & Industrial Engineering';
  } else if (
    /sales|account\s+executive|business\s+development|\bcloser\b|pipeline\s+management|deal\s+closing|b2b\s+sales|deal\s+qualification|outbound\s+prospecting|solution\s+selling|sales\s+director|vp\s+of\s+sales|quota|revops/i.test(
      checkText
    ) ||
    (/growth/i.test(targetRole) && /sales|b2b|deal|closing|lead|crm/i.test(checkText))
  ) {
    domain = 'Sales & Business Development';
  } else if (/fintech|payment|dispute|chargeback|card operation|reconciliation|billing|merchant/i.test(checkText)) {
    domain = 'Fintech & Payment Operations';
  } else if (/finance|accounting|audit|banking|tax|payroll/i.test(checkText)) {
    domain = 'Finance & Banking';
  } else if (/\b(ux|ui|ux\/ui|product designer|visual design|graphic design|figma|interaction design|design systems|ux researcher)\b/i.test(checkText)) {
    domain = 'Product & Design';
  } else if (/supply chain|logistics|warehouse|operations|procurement/i.test(checkText)) {
    domain = 'Operations & Logistics';
  }

  // 5. Synthesize Alternative & Related Roles from Entire Profile
  const candidateRolesSet = new Set<string>();
  if (targetRole) {
    candidateRolesSet.add(targetRole);
  }

  // Extract from headline segments (e.g. "B2B Enterprise Sales | AI-Driven Selling | Full-Cycle Closer")
  const rawHeadline = headline || resume?.headline || '';
  if (rawHeadline) {
    const headSegments = rawHeadline.split(/[|/•,–—]/).map((s) => s.trim()).filter((s) => s.length >= 3 && s.length <= 40);
    for (const seg of headSegments) {
      if (
        /sales\s+lead|sales\s+executive|sales\s+manager|account\s+executive|closer|growth\s+lead|head\s+of|engineer|developer|manager|specialist|lead|director|analyst/i.test(
          seg
        ) &&
        !/selling|driven|proven|years|stack|skills/i.test(seg)
      ) {
        if (/closer/i.test(seg) && !candidateRolesSet.has('Enterprise Account Executive')) {
          candidateRolesSet.add('Enterprise Account Executive');
        } else if (!candidateRolesSet.has(seg)) {
          candidateRolesSet.add(seg);
        }
      }
    }
  }

  // Extract from experiences titles
  if (Array.isArray(resume?.experiences)) {
    for (const exp of resume.experiences) {
      if (exp.title) {
        let cleanExpTitle = cleanText(exp.title).replace(/\s+(?:at|@)\s+.*$/i, '').trim();
        cleanExpTitle = cleanExpTitle.replace(/^co-?founder\s*&\s*/i, '');
        if (cleanExpTitle && cleanExpTitle.length >= 3 && cleanExpTitle.length <= 50) {
          candidateRolesSet.add(cleanExpTitle);
        }
      }
    }
  }

  // Domain-level curated role cluster injection
  if (domain === 'Sales & Business Development') {
    const salesCluster = [
      'Head of Growth',
      'Enterprise Account Executive',
      'VP of Sales',
      'Director of Sales',
      'Head of Business Development',
      'Go-To-Market (GTM) Lead',
      'B2B Software Sales Lead',
      'Strategic Account Executive',
    ];
    for (const r of salesCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  } else if (domain === 'Mechanical & Industrial Engineering' || /mechanical|heavy\s+(machinery|equipment)|plant\s+(maintenance|engineer)|production\s+engineer|jcb|excavator/i.test(checkText)) {
    const mechanicalCluster = [
      'Mechanical Engineer',
      'Service Engineer Heavy Machinery',
      'Service Manager Heavy Equipment',
      'Maintenance Engineer',
      'Production Engineer',
      'Field Service Engineer',
      'Plant Operations Engineer',
    ];
    for (const r of mechanicalCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  } else if (domain === 'Fintech & Payment Operations' || /payment|fintech|dispute|chargeback|card operation|reconciliation/i.test(targetRole)) {
    const fintechCluster = [
      'Payment Operations',
      'Fintech Operations',
      'Card Disputes Specialist',
      'Real-Time Analyst',
      'Incident Coordinator',
      'Operations Analyst',
      'Customer Operations',
    ];
    for (const r of fintechCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  } else if (domain === 'Healthcare & Life Sciences' || /medical laboratory/i.test(targetRole)) {
    const healthcareCluster = [
      'Medical Laboratory Technologist',
      'Medical Laboratory Technician',
      'Clinical Laboratory Scientist',
      'Medical Technologist',
      'Laboratory Technologist',
    ];
    for (const r of healthcareCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  } else if (/pipe|pipeline|piping/i.test(targetRole)) {
    const pipingCluster = [
      'Piping Designer',
      'Pipeline Engineer',
      'Piping Design Engineer',
      'Piping Engineer',
      'Senior Piping Designer',
      'Mechanical Piping Designer',
      'Plant Layout Designer',
    ];
    for (const r of pipingCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  } else if (domain === 'Product & Design') {
    const designCluster = [
      'Product Designer',
      'UI/UX Designer',
      'Product Design Lead',
      'UX Researcher',
      'Interaction Designer',
      'Design Systems Lead',
    ];
    for (const r of designCluster) {
      if (!candidateRolesSet.has(r)) {
        candidateRolesSet.add(r);
      }
    }
  }

  // Ensure targetRole is first in the list
  const relatedRoles: string[] = [targetRole];
  for (const r of candidateRolesSet) {
    if (r && r.toLowerCase() !== targetRole.toLowerCase() && !relatedRoles.includes(r)) {
      relatedRoles.push(r);
    }
  }

  // 6. Extract Top High-Signal Skills Keywords
  const topSkillKeywords: string[] = [];
  const rawSkills = Array.isArray(resume?.skills) ? resume.skills : [];
  for (const s of rawSkills) {
    const clean = cleanText(s);
    if (!clean || clean.length < 2) continue;
    if (GENERIC_SKILLS_SET.has(clean.toLowerCase())) continue;
    if (!topSkillKeywords.includes(clean)) {
      topSkillKeywords.push(clean);
    }
  }

  // 7. Generate Targeted Multi-Query Search Strings
  const searchQueries: string[] = [];
  if (targetRole) {
    searchQueries.push(targetRole);
  }
  for (const role of relatedRoles) {
    if (!searchQueries.includes(role)) {
      searchQueries.push(role);
    }
  }

  return {
    targetRole,
    relatedRoles: relatedRoles.slice(0, 10),
    topSkillKeywords: topSkillKeywords.slice(0, 10),
    searchQueries,
    domain,
    location: normalizedLocation,
    targetRelocation,
    isNonTech,
    headline,
  };
}
