// Transferable Skill Adjacency Engine
// Bridges near-match technologies across Cloud, Databases, Frontend, Backend, EPC/Piping, and DevOps.
// Eliminates false ATS rejections by recognizing 85-95% transferable architectural equivalents.

export interface SkillAdjacencyDefinition {
  canonical: string;
  equivalents: string[];
  domain: string;
  transferabilityScore: number; // 0.80 to 0.98
  bridgingTemplate: (candidateSkill: string, targetSkill: string) => string;
}

export interface SkillAdjacencyMatch {
  targetSkill: string;
  candidateSkill: string;
  domain: string;
  transferabilityScore: number;
  bridgingStatement: string;
}

export const SKILL_ADJACENCY_GRAPH: SkillAdjacencyDefinition[] = [
  // Cloud & Infrastructure
  {
    canonical: 'gcp',
    equivalents: ['aws', 'azure', 'google cloud', 'amazon web services', 'microsoft azure', 'digitalocean', 'cloud architecture'],
    domain: 'Cloud Architecture & Infrastructure',
    transferabilityScore: 0.92,
    bridgingTemplate: (cand, target) =>
      `Demonstrated mastery in ${cand.toUpperCase()}, applying equivalent cloud architecture principles (IAM, compute provisioning, distributed storage, and VPC networking) directly to ${target.toUpperCase()}.`,
  },
  {
    canonical: 'aws',
    equivalents: ['gcp', 'azure', 'google cloud platform', 'microsoft azure', 'oracle cloud'],
    domain: 'Cloud Architecture & Infrastructure',
    transferabilityScore: 0.94,
    bridgingTemplate: (cand, target) =>
      `Extensive hands-on experience scaling distributed microservices on ${cand.toUpperCase()}, with 1:1 transferable architectural paradigms in ${target.toUpperCase()}.`,
  },
  {
    canonical: 'azure',
    equivalents: ['aws', 'gcp', 'google cloud', 'amazon web services'],
    domain: 'Cloud Architecture & Infrastructure',
    transferabilityScore: 0.90,
    bridgingTemplate: (cand, target) =>
      `Proven enterprise infrastructure background in ${cand.toUpperCase()}, transferring core identity, hybrid networking, and cluster orchestration to ${target.toUpperCase()}.`,
  },

  // Databases (RDBMS)
  {
    canonical: 'postgresql',
    equivalents: ['mysql', 'oracle db', 'oracle database', 'sql server', 'mssql', 'mariadb', 'relational databases'],
    domain: 'Relational Database Engineering',
    transferabilityScore: 0.95,
    bridgingTemplate: (cand, target) =>
      `Deep background in ACID transaction design, query indexing, and schema migrations on ${cand}, offering immediate proficiency in ${target}.`,
  },
  {
    canonical: 'mysql',
    equivalents: ['postgresql', 'sql server', 'oracle', 'mariadb'],
    domain: 'Relational Database Engineering',
    transferabilityScore: 0.93,
    bridgingTemplate: (cand, target) =>
      `Robust transactional SQL experience with ${cand}, transferring query execution planning and indexing fundamentals directly to ${target}.`,
  },

  // Databases (NoSQL / Distributed)
  {
    canonical: 'mongodb',
    equivalents: ['dynamodb', 'cassandra', 'couchbase', 'documentdb', 'firestore', 'nosql'],
    domain: 'NoSQL & Document Data Stores',
    transferabilityScore: 0.88,
    bridgingTemplate: (cand, target) =>
      `Proven experience with non-relational distributed modeling and high-throughput schema design on ${cand}, transferable to ${target}.`,
  },

  // Frontend Frameworks
  {
    canonical: 'react',
    equivalents: ['vue', 'vue.js', 'angular', 'svelte', 'solid.js', 'next.js', 'modern javascript'],
    domain: 'Component-Driven Frontend Engineering',
    transferabilityScore: 0.90,
    bridgingTemplate: (cand, target) =>
      `Architectural mastery of reactive state trees, component lifecycles, and unidirectional data flow in ${cand}, directly portable to ${target}.`,
  },
  {
    canonical: 'vue',
    equivalents: ['react', 'angular', 'svelte', 'next.js'],
    domain: 'Component-Driven Frontend Engineering',
    transferabilityScore: 0.90,
    bridgingTemplate: (cand, target) =>
      `Extensive reactive component development and state management in ${cand}, transferring immediately to ${target}.`,
  },

  // Backend Frameworks & Runtimes
  {
    canonical: 'fastapi',
    equivalents: ['django', 'flask', 'express', 'nest.js', 'gin', 'spring boot', 'go', 'python backend'],
    domain: 'Modern REST & Microservices Backend',
    transferabilityScore: 0.89,
    bridgingTemplate: (cand, target) =>
      `Strong asynchronous API architecture and microservice design in ${cand}, providing rapid ramp-up in ${target}.`,
  },
  {
    canonical: 'go',
    equivalents: ['python', 'c++', 'java', 'rust', 'c#', 'backend engineering'],
    domain: 'Systems & Microservices Engineering',
    transferabilityScore: 0.86,
    bridgingTemplate: (cand, target) =>
      `Deep concurrency, memory management, and network I/O background in ${cand}, translating to robust systems engineering in ${target}.`,
  },

  // Mechanical / Piping / EPC CAD
  {
    canonical: 'sp3d',
    equivalents: ['pdms', 'e3d', 'autocad plant 3d', 'pds', 'smartplant', 'cadmatic', 'plant layout design'],
    domain: '3D Plant Layout & Piping Modeling (EPC)',
    transferabilityScore: 0.96,
    bridgingTemplate: (cand, target) =>
      `Senior EPC plant layout expertise utilizing ${cand.toUpperCase()} for equipment modeling and piping routing, with direct 1:1 workflow transferability to ${target.toUpperCase()}.`,
  },
  {
    canonical: 'pdms',
    equivalents: ['sp3d', 'e3d', 'autocad plant 3d', 'pds', 'piping design'],
    domain: '3D Plant Layout & Piping Modeling (EPC)',
    transferabilityScore: 0.96,
    bridgingTemplate: (cand, target) =>
      `Extensive 3D modeling and clash resolution track record in ${cand.toUpperCase()}, fully portable to ${target.toUpperCase()} environments.`,
  },
  {
    canonical: 'caesar ii',
    equivalents: ['autopipe', 'ansys', 'piping stress analysis', 'fe-pipe', 'asme b31.3'],
    domain: 'Piping Stress & Flexibility Analysis',
    transferabilityScore: 0.95,
    bridgingTemplate: (cand, target) =>
      `Expert-level finite element stress calculation and thermal expansion analysis in ${cand}, directly applicable to ${target} per ASME B31.3.`,
  },

  // DevOps & Containers
  {
    canonical: 'kubernetes',
    equivalents: ['docker swarm', 'nomad', 'ecs', 'openshift', 'container orchestration', 'docker'],
    domain: 'Container Orchestration & Cloud Native',
    transferabilityScore: 0.92,
    bridgingTemplate: (cand, target) =>
      `Production containerization and service discovery experience in ${cand}, accelerating deployment and management in ${target}.`,
  },
  {
    canonical: 'github actions',
    equivalents: ['gitlab ci', 'jenkins', 'circleci', 'argo cd', 'ci/cd pipelines', 'teamcity'],
    domain: 'CI/CD Automation & Build Pipelines',
    transferabilityScore: 0.94,
    bridgingTemplate: (cand, target) =>
      `Hands-on pipeline automation and release engineering in ${cand}, transferring seamlessly to ${target}.`,
  },

  // Design & UI/UX
  {
    canonical: 'figma',
    equivalents: ['sketch', 'adobe xd', 'framer', 'invision', 'design systems'],
    domain: 'UI/UX & Design Systems',
    transferabilityScore: 0.97,
    bridgingTemplate: (cand, target) =>
      `Design system tokenization, responsive auto-layout, and interaction prototyping proficiency in ${cand}, completely transferable to ${target}.`,
  },
];

/**
 * Normalizes skill string for comparison (strips punctuation, extra spaces, lowercase)
 */
function normalizeSkill(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9+#]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a required skill has an adjacent counterpart in candidate's skill set
 */
export function findSkillAdjacency(
  targetSkill: string,
  candidateSkills: string[]
): SkillAdjacencyMatch | null {
  if (!targetSkill || !candidateSkills || candidateSkills.length === 0) return null;

  const targetNorm = normalizeSkill(targetSkill);

  // Exact match already satisfied — no adjacency needed
  if (candidateSkills.some((s) => normalizeSkill(s) === targetNorm)) {
    return null;
  }

  // Search adjacency graph
  for (const entry of SKILL_ADJACENCY_GRAPH) {
    const isTargetCanonical = normalizeSkill(entry.canonical) === targetNorm;
    const isTargetEquivalent = entry.equivalents.some((eq) => normalizeSkill(eq) === targetNorm);

    if (isTargetCanonical || isTargetEquivalent) {
      // Find candidate skills that match either canonical or equivalents
      for (const candSkill of candidateSkills) {
        const candNorm = normalizeSkill(candSkill);
        const matchesCanonical = normalizeSkill(entry.canonical) === candNorm;
        const matchesEquivalent = entry.equivalents.some((eq) => normalizeSkill(eq) === candNorm);

        if ((matchesCanonical || matchesEquivalent) && candNorm !== targetNorm) {
          return {
            targetSkill,
            candidateSkill: candSkill,
            domain: entry.domain,
            transferabilityScore: entry.transferabilityScore,
            bridgingStatement: entry.bridgingTemplate(candSkill, targetSkill),
          };
        }
      }
    }
  }

  return null;
}

/**
 * Evaluates an entire list of missing ATS competencies and identifies which ones
 * are easily bridged with candidate's existing adjacent skills.
 */
export function findAdjacenciesForMissingSkills(
  missingSkills: string[],
  candidateSkills: string[]
): SkillAdjacencyMatch[] {
  const matches: SkillAdjacencyMatch[] = [];

  for (const missing of missingSkills) {
    const match = findSkillAdjacency(missing, candidateSkills);
    if (match) {
      matches.push(match);
    }
  }

  return matches;
}
