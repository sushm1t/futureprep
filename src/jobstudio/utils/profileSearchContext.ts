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

  // If targetRole contains pipe or slash delimiters (e.g. from a raw headline), isolate the primary title
  if (targetRole.includes('|') || targetRole.includes('/')) {
    const segs = targetRole.split(/[|/•,]/).map((s) => cleanText(s)).filter(Boolean);
    if (segs.length > 0) {
      targetRole = segs[0];
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

  // 4. Determine Domain based strictly on the candidate's authentic titles, headline, and core skills
  // (NEVER from arbitrary words in long body text or bullet points where client industries like "hospitals" appear)
  const titlesText = `${targetRole} ${headline} ${resume?.experiences?.map((e) => e.title).join(' ') || ''}`.toLowerCase();
  const skillsText = `${resume?.skills?.join(' ') || ''}`.toLowerCase();
  const rawBodyText = masterProfileText.slice(0, 3000).toLowerCase();

  let domain = 'Technology & Software';

  // 1. Sales & Business Development (highest priority when titles indicate commercial/revenue role)
  if (
    /sales|account\s+executive|business\s+development|\bcloser\b|pipeline|growth|quota|outbound\s+prospecting|revops|bdr|sdr|deal\s+closing/i.test(
      titlesText
    ) ||
    (/b2b\s+sales|pipeline\s+management|deal\s+qualification|solution\s+selling|closing\s+deals/i.test(skillsText) &&
      !/technologist|technician|nurse|physician|piping/i.test(titlesText))
  ) {
    domain = 'Sales & Business Development';
  }
  // 2. Healthcare & Clinical (MUST have clinical/medical titles or specialized clinical lab skills, NEVER from stray words like "hospitals")
  else if (
    /\b(medical\s+laboratory|laboratory\s+technol|pathology\s+technol|phlebotom|nurse|nursing|physician|doctor|pharmacist|clinical\s+specialist|radiolog|surgeon|dentist|paramedic|histotechnol)\b/i.test(
      titlesText
    ) ||
    (/\b(phlebotomy|blood\s+bank|apheresis|hematology|biochemistry|transfusion\s+medicine)\b/i.test(skillsText) &&
      !/software|developer|sales|marketing/i.test(titlesText))
  ) {
    domain = 'Healthcare & Life Sciences';
  }
  // 3. Mechanical & Industrial Engineering
  else if (
    /\b(mechanical\s+engineer|piping\s+designer|pipeline\s+engineer|production\s+engineer|maintenance\s+engineer|heavy\s+(?:machinery|equipment)|service\s+manager\s+heavy|jcb|excavator|plant\s+engineer)\b/i.test(
      titlesText
    ) ||
    (/\b(jcb|excavator|heavy\s+machinery|plant\s+maintenance|piping\s+design)\b/i.test(skillsText) &&
      !/software|developer/i.test(titlesText))
  ) {
    domain = 'Mechanical & Industrial Engineering';
  }
  // 4. Fintech & Payment Operations
  else if (
    /\b(payment\s+operations|fintech\s+operations|card\s+disputes|real[- ]time\s+analyst|dispute\s+specialist|chargeback)\b/i.test(
      titlesText
    ) ||
    /\b(card\s+payments|visa\s+and\s+mastercard\s+disputes|chargebacks|payment\s+operations)\b/i.test(skillsText)
  ) {
    domain = 'Fintech & Payment Operations';
  }
  // 5. Product & Design
  else if (
    /\b(product\s+designer|ui\/ux|ux\s+designer|ux\s+researcher|visual\s+designer|interaction\s+designer|design\s+systems\s+lead)\b/i.test(
      titlesText
    )
  ) {
    domain = 'Product & Design';
  }
  // 6. Product Management
  else if (
    /\b(product\s+manager|technical\s+pm|group\s+pm|product\s+lead|\btpm\b)\b/i.test(titlesText)
  ) {
    domain = 'Product Management';
  }
  // 7. Finance & Banking
  else if (
    /\b(financial\s+analyst|accounting|auditor|investment\s+banker|tax\s+specialist|payroll)\b/i.test(
      titlesText
    )
  ) {
    domain = 'Finance & Banking';
  }
  // 8. Operations & Logistics
  else if (
    /\b(operations\s+manager|supply\s+chain|logistics\s+coordinator|procurement\s+manager|warehouse\s+manager)\b/i.test(
      titlesText
    )
  ) {
    domain = 'Operations & Logistics';
  }
  // 9. Fallback if titles were sparse, inspect raw body text with strict domain phrases
  else if (/\bmedical\s+laboratory\s+technologist\b|\bphlebotomy\s+specialist\b/i.test(rawBodyText)) {
    domain = 'Healthcare & Life Sciences';
  } else if (/\bmechanical\s+engineering\b|\bheavy\s+machinery\s+maintenance\b/i.test(rawBodyText)) {
    domain = 'Mechanical & Industrial Engineering';
  } else if (/\bcard\s+disputes\b|\bpayment\s+operations\b/i.test(rawBodyText)) {
    domain = 'Fintech & Payment Operations';
  }

  const isNonTech = domain === 'Healthcare & Life Sciences' || domain === 'Mechanical & Industrial Engineering' || domain === 'Operations & Logistics';

  // Discipline Isolation Guard: rejects any title belonging to an alien/incompatible discipline
  const isCompatibleWithCandidateDomain = (roleTitle: string): boolean => {
    const r = (roleTitle || '').toLowerCase().trim();
    if (!r) return false;
    if (domain === 'Sales & Business Development') {
      return !/medical|laboratory|technologist|technician|nurse|doctor|phlebotom|piping|mechanical|excavator|cad\s+designer/i.test(r);
    }
    if (domain === 'Healthcare & Life Sciences') {
      return !/sales|growth|closer|account\s+executive|piping|mechanical|software/i.test(r);
    }
    if (domain === 'Mechanical & Industrial Engineering') {
      return !/medical|laboratory|nurse|doctor|sales|closer|fintech/i.test(r);
    }
    if (domain === 'Fintech & Payment Operations') {
      return !/medical|laboratory|nurse|piping|mechanical|heavy\s+equipment/i.test(r);
    }
    if (domain === 'Technology & Software') {
      return !/medical|laboratory|nurse|heavy\s+machinery|excavator/i.test(r);
    }
    return true;
  };

  // 5. Synthesize Alternative & Related Roles strictly from the candidate's authentic profile
  const candidateRolesSet = new Set<string>();
  if (targetRole && isCompatibleWithCandidateDomain(targetRole)) {
    candidateRolesSet.add(targetRole);
  }

  // Extract authentic title segments from headline (e.g. "B2B Enterprise Sales | AI-Driven Selling | Full-Cycle Closer")
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

  // Extract authentic past job titles from candidate experiences
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

  // Domain-specific adjacent ATS titles matching the candidate's authentic discipline
  if (domain === 'Sales & Business Development') {
    const salesCluster = [
      'Enterprise Account Executive',
      'Head of Growth',
      'VP of Sales',
      'Director of Sales',
      'Head of Business Development',
      'Go-To-Market (GTM) Lead',
      'B2B Software Sales Lead',
      'Strategic Account Executive',
    ];
    for (const r of salesCluster) {
      if (!candidateRolesSet.has(r)) candidateRolesSet.add(r);
    }
  } else if (domain === 'Healthcare & Life Sciences' && /medical\s+laboratory|laboratory\s+technol|patholog/i.test(titlesText + ' ' + skillsText)) {
    const labCluster = [
      'Medical Laboratory Technologist',
      'Medical Laboratory Technician',
      'Clinical Laboratory Scientist',
      'Medical Technologist',
      'Laboratory Technologist',
    ];
    for (const r of labCluster) {
      if (!candidateRolesSet.has(r)) candidateRolesSet.add(r);
    }
  } else if (domain === 'Mechanical & Industrial Engineering') {
    const mechContext = `${titlesText} ${skillsText} ${resume?.experiences?.map((e) => `${e.title} ${e.company}`).join(' ') || ''} ${resume?.tailored_summary || ''}`.toLowerCase();
    if (/heavy|machin|jcb|excavator/i.test(mechContext)) {
      [
        'Service Engineer Heavy Machinery',
        'Service Manager Heavy Equipment',
        'Maintenance Engineer',
        'Production Engineer',
        'Mechanical Engineer',
      ].forEach((r) => candidateRolesSet.add(r));
    } else if (/pipe|pipeline|piping/i.test(mechContext)) {
      ['Piping Designer', 'Pipeline Engineer', 'Piping Design Engineer', 'Mechanical Piping Designer'].forEach((r) =>
        candidateRolesSet.add(r)
      );
    } else {
      ['Mechanical Engineer', 'Maintenance Engineer', 'Production Engineer', 'Field Service Engineer'].forEach((r) =>
        candidateRolesSet.add(r)
      );
    }
  } else if (domain === 'Fintech & Payment Operations') {
    ['Payment Operations', 'Fintech Operations', 'Card Disputes Specialist', 'Real-Time Analyst', 'Operations Analyst'].forEach(
      (r) => candidateRolesSet.add(r)
    );
  } else if (domain === 'Product & Design') {
    ['Product Designer', 'UI/UX Designer', 'Product Design Lead', 'UX Researcher', 'Interaction Designer'].forEach((r) =>
      candidateRolesSet.add(r)
    );
  }

  // Filter and sort: candidate targetRole first, followed strictly by compatible roles
  const relatedRoles: string[] = [];
  if (targetRole && isCompatibleWithCandidateDomain(targetRole)) {
    relatedRoles.push(targetRole);
  }
  for (const r of candidateRolesSet) {
    if (r && isCompatibleWithCandidateDomain(r) && !relatedRoles.some((existing) => existing.toLowerCase() === r.toLowerCase())) {
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
