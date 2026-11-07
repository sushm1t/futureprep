import { TailoredResumeData } from '../data/defaultData';

export interface ProfileSearchContext {
  targetRole: string;
  location: string;
  searchQueries: string[];
  domain: string;
  isNonTech: boolean;
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
  let location = '';

  // 1. Extract Target Role from Resume Data
  if (resume) {
    const rawTarget = cleanText(resume.target_role || '');
    const isPlaceholder = !rawTarget || /^(role|target role|candidate|specialist|professional)$/i.test(rawTarget);
    if (!isPlaceholder) {
      targetRole = rawTarget;
    } else if (resume.experiences && resume.experiences.length > 0 && resume.experiences[0].title) {
      targetRole = cleanText(resume.experiences[0].title);
    }
  }

  // 2. Fallback to Master Profile Text parsing if resume has no target
  if (!targetRole && masterProfileText) {
    // Look for explicit Headline or Target Role lines
    const headlineMatch = masterProfileText.match(/(?:headline|target role|desired role|position):\s*([^\n\r]+)/i);
    if (headlineMatch && headlineMatch[1]) {
      targetRole = cleanText(headlineMatch[1]);
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
            /technologist|technician|engineer|manager|specialist|developer|analyst|coordinator|director|officer|lead|nurse|consultant|operations|support|associate/i.test(
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

  // 3. Extract Location
  const rawLoc = cleanText(resume?.contact_info?.location || '');
  if (rawLoc) {
    location = rawLoc;
  } else if (masterProfileText) {
    const locMatch = masterProfileText.match(/(?:location|address):\s*([^\n\r]+)/i);
    if (locMatch && locMatch[1]) {
      location = cleanText(locMatch[1]);
    }
  }

  // Normalize Location to standard search hubs if detectable
  let normalizedLocation = '';
  const lowLoc = location.toLowerCase();
  if (lowLoc.includes('india') || lowLoc.includes('kerala') || lowLoc.includes('calicut') || lowLoc.includes('bengaluru') || lowLoc.includes('mumbai') || lowLoc.includes('delhi')) {
    normalizedLocation = 'India';
  } else if (lowLoc.includes('united states') || lowLoc.includes('usa') || lowLoc.includes(', us') || /\b(ca|ny|tx|fl|wa|il|ma|co|nc|ga)\b/.test(lowLoc)) {
    normalizedLocation = 'United States';
  } else if (lowLoc.includes('europe') || lowLoc.includes('uk') || lowLoc.includes('london') || lowLoc.includes('germany') || lowLoc.includes('france')) {
    normalizedLocation = 'Europe';
  } else if (lowLoc.includes('remote')) {
    normalizedLocation = 'Remote';
  }

  // 4. Determine if Non-Tech Domain
  const checkText = `${targetRole} ${resume?.skills?.join(' ') || ''} ${masterProfileText.slice(0, 2000)}`.toLowerCase();
  const isNonTech = NON_TECH_KEYWORDS.some((kw) => checkText.includes(kw));

  // Determine Domain string
  let domain = 'Technology & Software';
  if (/medical|laboratory|pathology|hospital|nurse|phlebotomy|clinical|biochemistry|hematology|health/i.test(checkText)) {
    domain = 'Healthcare & Life Sciences';
  } else if (/mechanical|heavy\s+(machinery|equipment)|automotive|mining\s+machiner|production\s+engineer|plant\s+(engineer|maintenance)|jcb|excavator|erection\s+and\s+commissioning/i.test(checkText)) {
    domain = 'Mechanical & Industrial Engineering';
  } else if (/fintech|payment|dispute|chargeback|card operation|reconciliation|billing|merchant/i.test(checkText)) {
    domain = 'Fintech & Payment Operations';
  } else if (/finance|accounting|audit|banking|tax|payroll/i.test(checkText)) {
    domain = 'Finance & Banking';
  } else if (/design|ux|ui|graphic|visual|product design/i.test(checkText)) {
    domain = 'Product & Design';
  } else if (/supply chain|logistics|warehouse|operations|procurement/i.test(checkText)) {
    domain = 'Operations & Logistics';
  }

  // 5. Generate Targeted Search Queries
  const searchQueries: string[] = [];
  if (targetRole) {
    searchQueries.push(targetRole);

    // Add common variants for specialized roles
    if (/payment|fintech|dispute|chargeback|card operation|reconciliation/i.test(targetRole)) {
      searchQueries.push(
        'Payment Operations',
        'Fintech Operations',
        'Card Disputes Specialist',
        'Real-Time Analyst',
        'Incident Coordinator',
        'Operations Analyst',
        'Customer Operations'
      );
    } else if (domain === 'Mechanical & Industrial Engineering' || /mechanical|heavy\s+(machinery|equipment)|plant\s+(maintenance|engineer)|production\s+engineer|jcb|excavator/i.test(checkText)) {
      const mechanicalVariants = [
        'Mechanical Engineer',
        'Service Engineer Heavy Machinery',
        'Service Manager Heavy Equipment',
        'Maintenance Engineer',
        'Production Engineer',
        'Field Service Engineer',
        'Plant Operations Engineer',
      ];
      for (const v of mechanicalVariants) {
        if (!searchQueries.includes(v)) {
          searchQueries.push(v);
        }
      }
    } else if (/medical laboratory technologist/i.test(targetRole)) {
      searchQueries.push('Medical Laboratory Technician', 'Medical Technologist', 'Laboratory Technologist');
    } else if (/medical laboratory technician/i.test(targetRole)) {
      searchQueries.push('Medical Laboratory Technologist', 'Medical Technologist', 'Laboratory Technician');
    } else if (/laboratory technologist/i.test(targetRole)) {
      searchQueries.push('Medical Laboratory Technologist', 'Laboratory Technician');
    } else if (/registered nurse/i.test(targetRole)) {
      searchQueries.push('Staff Nurse', 'Clinical Nurse', 'Nurse');
    } else if (/quality manager/i.test(targetRole)) {
      searchQueries.push('Quality Assurance Manager', 'QA Specialist', 'Quality Engineer');
    }
  }

  return {
    targetRole,
    location: normalizedLocation,
    searchQueries,
    domain,
    isNonTech,
  };
}
