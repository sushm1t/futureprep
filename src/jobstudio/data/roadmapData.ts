// @ts-nocheck -- ported verbatim from the original project
import { EXPANDED_ROADMAPS } from './expandedRoadmaps';
import { MORE_ROADMAPS } from './moreRoadmaps';

export interface ResourceLink {
  type: 'COURSE' | 'DOCS' | 'PRACTICE' | 'VIDEO' | 'PROJECT';
  title: string;
  provider: string;
  url: string;
  isFree: boolean;
}

export interface RoadmapSkill {
  id: string;
  name: string;
  level: 'ESSENTIAL' | 'RECOMMENDED' | 'ADVANCED';
  description: string;
  whyItMatters: string;
  resources: ResourceLink[];
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  stageLabel: string;
  title: string;
  description: string;
  skills: RoadmapSkill[];
}

export interface CareerRoadmap {
  id: string;
  slug: string;
  title: string;
  category: 'Engineering' | 'Operations' | 'AI & Data' | 'Cloud & DevOps' | 'Product & Project' | 'Solutions & GTM' | 'Business & Finance' | 'Travel & Hospitality' | 'Creative & Design';
  badge?: string;
  subtitle: string;
  description: string;
  coreStack: Array<{ name: string; tag: string; bg?: string; text?: string }>;
  stagesCount: number;
  skillsCount: number;
  resourcesCount: number;
  stages: RoadmapStage[];
}

const RAW_CAREER_ROADMAPS: CareerRoadmap[] = [
  // 1. NEW GRAD SWE
  {
    id: 'new-grad-swe',
    slug: 'new-grad-swe',
    title: 'New Grad SWE',
    category: 'Engineering',
    badge: 'START HERE',
    subtitle: 'Foundational / Junior Software Engineer',
    description:
      'A 2026 path from absolute beginner to a hireable new-grad/junior software engineer, organized around what engineering hiring teams actually screen for.',
    coreStack: [
      { name: 'Python', tag: 'PY', bg: 'bg-[#3776AB]/20', text: 'text-brand' },
      { name: 'Git', tag: 'GIT', bg: 'bg-[#F05032]/20', text: 'text-[#F05032]' },
      { name: 'GitHub', tag: 'GH', bg: 'bg-card/10', text: 'text-primary-foreground' },
      { name: 'Linux', tag: 'LNX', bg: 'bg-[#FCC624]/20', text: 'text-[#FCC624]' },
      { name: 'C / C++', tag: 'C', bg: 'bg-[#00599C]/20', text: 'text-[#00599C]' },
    ],
    stagesCount: 7,
    skillsCount: 26,
    resourcesCount: 52,
    stages: [
      {
        id: 'swe-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Program fluently in one language',
        description:
          "Write, run, and debug real programs in a single language until syntax is no longer what slows you down. Choose Python (great for fundamentals, scripting, data/AI) or TypeScript/JavaScript. Resist learning two at once.",
        skills: [
          {
            id: 'swe-core-prog',
            name: 'Core programming (variables, control flow, functions, error handling)',
            level: 'ESSENTIAL',
            description:
              'Core programming covers fundamental constructs: storing values in variables, branching logic with conditionals and loops, modularizing code into functions, and handling failures gracefully with structured exception mechanisms.',
            whyItMatters:
              'Every downstream skill assumes muscle-memory fluency. Interviewers expect zero hesitation on basic syntax and flow control during live coding.',
            resources: [
              {
                type: 'COURSE',
                title: "CS50x 2026: Harvard's Introduction to Computer Science",
                provider: 'Harvard University / edX',
                url: 'https://cs50.harvard.edu/x/',
                isFree: true,
              },
              {
                type: 'COURSE',
                title: 'Certified Full Stack Developer Curriculum',
                provider: 'freeCodeCamp',
                url: 'https://www.freecodecamp.org/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'The Modern JavaScript Tutorial',
                provider: 'javascript.info',
                url: 'https://javascript.info/',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-docs',
            name: 'Reading official documentation & standard libraries',
            level: 'ESSENTIAL',
            description:
              'Learn to navigate MDN, Python docs, and language specifications directly rather than relying solely on AI chatbots or video tutorials.',
            whyItMatters:
              'Production engineering requires using third-party APIs and libraries whose breaking changes are documented only in markdown or official reference docs.',
            resources: [
              {
                type: 'DOCS',
                title: 'Python 3 Standard Library Documentation',
                provider: 'Python Software Foundation',
                url: 'https://docs.python.org/3/library/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'MDN Web Docs: JavaScript Reference',
                provider: 'Mozilla',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-debug',
            name: 'Debugging (stack traces, debuggers, isolating failures)',
            level: 'ESSENTIAL',
            description:
              'Develop systematic troubleshooting skills: deciphering stack traces, setting breakpoints with VS Code debugger / pdb, and reproducing edge case defects with minimal test cases.',
            whyItMatters:
              'Junior engineers spend 60% of their day reading and debugging other people’s code rather than writing greenfield features.',
            resources: [
              {
                type: 'VIDEO',
                title: 'Systematic Debugging in VS Code & DevTools',
                provider: 'MIT Missing Semester',
                url: 'https://missing.csail.mit.edu/2020/debugging-profiling/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Debugging Python Programs with pdb & VS Code',
                provider: 'Real Python',
                url: 'https://realpython.com/python-debugging-pdb/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, The professional toolchain (Terminal, Git, Environments)',
        description:
          'Pick up the day-one workflow of an industry software engineer: Linux command line, shell scripting, Git branching strategies, and reproducible virtual environments.',
        skills: [
          {
            id: 'swe-cli',
            name: 'Unix Shell & Command Line Mastery (Bash/Zsh, Pipes, SSH)',
            level: 'ESSENTIAL',
            description:
              'Comfort with terminal navigation, file redirection, grep/find/xargs, package management, and basic bash scripting.',
            whyItMatters:
              'Server deployment, Docker containers, remote VMs, and cloud instances are managed almost exclusively via the terminal.',
            resources: [
              {
                type: 'COURSE',
                title: 'The Missing Semester of Your CS Education',
                provider: 'MIT CSAIL',
                url: 'https://missing.csail.mit.edu/',
                isFree: true,
              },
              {
                type: 'PRACTICE',
                title: 'OverTheWire: Bandit Wargame (Linux CLI)',
                provider: 'OverTheWire',
                url: 'https://overthewire.org/wargames/bandit/',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-git',
            name: 'Git Version Control (Branching, Merge Conflicts, Rebase, PRs)',
            level: 'ESSENTIAL',
            description:
              'Master staging, commits, feature branches, rebasing onto main, resolving merge conflicts, and writing clean pull requests with CI checks.',
            whyItMatters:
              'Git hygiene is the #1 team-work skill evaluated in technical onboardings and code review rounds.',
            resources: [
              {
                type: 'PRACTICE',
                title: 'Learn Git Branching (Interactive Visualizer)',
                provider: 'LearnGitBranching',
                url: 'https://learngitbranching.js.org/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Pro Git Book (Complete Official Reference)',
                provider: 'Git SCM',
                url: 'https://git-scm.com/book/en/v2',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-env',
            name: 'Virtual Environments & Package Dependency Isolation',
            level: 'RECOMMENDED',
            description:
              'Using poetry, venv, or npm/pnpm to lock dependency trees and prevent local environment contamination.',
            whyItMatters:
              'Broken dependency versions represent 40% of junior onboarding friction. Teams enforce lockfile reproducibility.',
            resources: [
              {
                type: 'DOCS',
                title: 'Python Virtual Environments Primer',
                provider: 'Real Python',
                url: 'https://realpython.com/python-virtual-environments-a-primer/',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-ai-toolchain',
            name: 'AI-Assisted Development & Code Verification (Copilot, Cursor, Claude)',
            level: 'ESSENTIAL',
            description:
              'Using AI code assistants effectively: prompt scaffolding, inline completion, automated test generation, and critically auditing AI-generated code for security vulnerabilities, hallucinations, and performance regressions.',
            whyItMatters:
              'In 2026, engineering teams expect engineers to use AI tools for 3x velocity, but strictly screen candidates on whether they understand, verify, and debug what the model generates rather than blindly pasting.',
            resources: [
              {
                type: 'DOCS',
                title: 'GitHub Copilot Documentation & Best Practices',
                provider: 'GitHub',
                url: 'https://docs.github.com/en/copilot',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Prompt Engineering for Code Generation',
                provider: 'Anthropic Docs',
                url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Data Structures, Algorithms & LeetCode Patterns',
        description:
          'Understand time and space complexity (Big-O) and internalize common data structure patterns tested in technical coding rounds.',
        skills: [
          {
            id: 'swe-dsa-patterns',
            name: 'Core DSA: Arrays, HashMaps, Two Pointers, Sliding Window',
            level: 'ESSENTIAL',
            description:
              'Master high-frequency algorithmic patterns: hash table lookups (O(1)), two-pointer subarray traversal, sliding window, and binary search.',
            whyItMatters:
              '85% of technical phone screens and online assessments (HackerRank, Karat, Codesignal) focus on these exact patterns.',
            resources: [
              {
                type: 'COURSE',
                title: 'NeetCode 150 - Curated Algorithm Roadmap',
                provider: 'NeetCode.io',
                url: 'https://neetcode.io/roadmap',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Visualgo: Visualizing Algorithms & Data Structures',
                provider: 'National University of Singapore',
                url: 'https://visualgo.net/en',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-trees-graphs',
            name: 'Trees, Graphs, BFS & DFS Traversals',
            level: 'ESSENTIAL',
            description:
              'Binary search trees, level-order traversal (BFS), recursion (DFS), and topological sort for dependency graphs.',
            whyItMatters:
              'Hierarchical data structures model file systems, DOM trees, organizational hierarchies, and dependency resolution.',
            resources: [
              {
                type: 'PRACTICE',
                title: 'LeetCode Explore: Binary Tree & Graph Cards',
                provider: 'LeetCode',
                url: 'https://leetcode.com/explore/',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-dp',
            name: 'Dynamic Programming & Memoization Patterns',
            level: 'ADVANCED',
            description:
              'Recognizing overlapping subproblems, top-down memoization, and 1D/2D bottom-up tabulation.',
            whyItMatters:
              'Tier-1 tech companies (FAANG/Big Tech) frequently test DP during final on-site coding rounds.',
            resources: [
              {
                type: 'VIDEO',
                title: 'Dynamic Programming - Learn to Solve 50 Problems',
                provider: 'freeCodeCamp / Alvin Zablan',
                url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Object-Oriented Design & Clean Architecture',
        description:
          'Write modular, testable, and maintainable software utilizing OOP principles, SOLID guidelines, and automated unit testing.',
        skills: [
          {
            id: 'swe-oop-solid',
            name: 'SOLID Principles & Clean Code Hygiene',
            level: 'ESSENTIAL',
            description:
              'Single responsibility, Open/Closed, Liskov substitution, Interface segregation, and Dependency inversion.',
            whyItMatters:
              'Senior engineers evaluate code readability and modularity far more strictly than whether you used esoteric language features.',
            resources: [
              {
                type: 'DOCS',
                title: 'Refactoring Guru: Design Patterns & SOLID',
                provider: 'Refactoring.Guru',
                url: 'https://refactoring.guru/design-patterns',
                isFree: true,
              },
            ],
          },
          {
            id: 'swe-unit-testing',
            name: 'Unit Testing & Test-Driven Development (TDD)',
            level: 'ESSENTIAL',
            description:
              'Writing automated tests with pytest or Jest: assertions, mocking external API calls, test fixtures, and coverage reports.',
            whyItMatters:
              'Hiring managers look for test suites in portfolio projects as proof of professional development discipline.',
            resources: [
              {
                type: 'COURSE',
                title: 'Modern Unit Testing with Pytest',
                provider: 'TestDriven.io',
                url: 'https://testdriven.io/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Relational Database Modeling & SQL Basics',
        description:
          'Design 3NF relational schemas, write multi-table joins and aggregations, and understand basic index performance.',
        skills: [
          {
            id: 'swe-sql-crud',
            name: 'Relational Schemas, Primary Keys & SQL Joins',
            level: 'ESSENTIAL',
            description:
              'Table design, foreign key constraints, INNER/LEFT joins, GROUP BY aggregations, and transactions (ACID).',
            whyItMatters:
              'Almost all software persists state in databases. Every backend, full-stack, and analytics role screens SQL.',
            resources: [
              {
                type: 'PRACTICE',
                title: 'SQLZoo Interactive Tutorials',
                provider: 'SQLZoo',
                url: 'https://sqlzoo.net/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Web Fundamentals & Client-Server Protocols',
        description:
          'Understand how the internet works: DNS resolution, TCP/IP, HTTP/HTTPS request-response cycles, and RESTful API endpoints.',
        skills: [
          {
            id: 'swe-http-networking',
            name: 'HTTP/HTTPS, REST APIs & JSON Serialization',
            level: 'ESSENTIAL',
            description:
              'HTTP methods (GET, POST, PUT, DELETE), response status codes (2xx, 4xx, 5xx), request headers, and JSON serialization.',
            whyItMatters:
              'Standard question in entry-level interviews: "Explain what happens when you type google.com into your browser."',
            resources: [
              {
                type: 'DOCS',
                title: 'MDN: An Overview of HTTP',
                provider: 'Mozilla',
                url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'swe-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, Capstone Production Project & System Design',
        description:
          'Ship an end-to-end full-stack application deployed on the cloud with CI/CD and learn basic scaling principles (caching, load balancers).',
        skills: [
          {
            id: 'swe-capstone-deploy',
            name: 'Production Full-Stack Deployment with CI/CD',
            level: 'ESSENTIAL',
            description:
              'Deploy a working app with Docker, GitHub Actions, and cloud hosting (Render / Vercel / Railway) with custom domain and HTTPS.',
            whyItMatters:
              'A live URL with GitHub source code separates top 5% candidates from resume-spammers who only have tutorial clones.',
            resources: [
              {
                type: 'PROJECT',
                title: 'Full Stack Open - Modern Web Development',
                provider: 'University of Helsinki',
                url: 'https://fullstackopen.com/en/',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 2. FRONTEND ENGINEER
  {
    id: 'frontend',
    slug: 'frontend',
    title: 'Frontend Engineer',
    category: 'Engineering',
    subtitle: 'Modern Web & Client-Side Systems',
    description:
      'Frontend hiring in 2026 rewards three things: a genuine command of the web platform (semantic HTML, modern CSS, DOM APIs), typed React, and web performance.',
    coreStack: [
      { name: 'React', tag: 'RCT', bg: 'bg-[#61DAFB]/20', text: 'text-[#61DAFB]' },
      { name: 'TypeScript', tag: 'TS', bg: 'bg-[#3178C6]/20', text: 'text-[#3178C6]' },
      { name: 'Tailwind CSS', tag: 'TW', bg: 'bg-[#38BDF8]/20', text: 'text-[#38BDF8]' },
      { name: 'Next.js', tag: 'NXT', bg: 'bg-card/10', text: 'text-primary-foreground' },
      { name: 'Vite', tag: 'VIT', bg: 'bg-[#646CFF]/20', text: 'text-[#BD34FE]' },
    ],
    stagesCount: 8,
    skillsCount: 31,
    resourcesCount: 65,
    stages: [
      {
        id: 'fe-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Deep Web Platform Fundamentals',
        description:
          'Before touching UI frameworks, master semantic HTML5, accessible markup (ARIA), modern CSS layout engines (Flexbox & Grid), and vanilla DOM events.',
        skills: [
          {
            id: 'fe-semantic-html',
            name: 'Semantic HTML & Web Accessibility (WCAG 2.2 / ARIA)',
            level: 'ESSENTIAL',
            description:
              'Correct use of header, main, nav, section, dialog, buttons vs anchors, ARIA live regions, keyboard navigation focus rings, and screen-reader accessibility.',
            whyItMatters:
              'Enterprise tech companies in the US and Europe face legal compliance mandates for a11y, making accessibility a frequent senior interview screening topic.',
            resources: [
              {
                type: 'COURSE',
                title: 'Learn Accessibility by web.dev',
                provider: 'Google Chrome Team',
                url: 'https://web.dev/learn/accessibility',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'W3C WAI-ARIA Authoring Practices Guide',
                provider: 'W3C',
                url: 'https://www.w3.org/WAI/ARIA/apg/',
                isFree: true,
              },
            ],
          },
          {
            id: 'fe-css-layout',
            name: 'Modern CSS: Flexbox, Grid, Container Queries & Design Tokens',
            level: 'ESSENTIAL',
            description:
              'Building fluid responsive interfaces without layout shifts. Subgrid, container queries, CSS custom properties, and Tailwind utility systems.',
            whyItMatters:
              'Engineers who cannot construct clean, breakpoint-responsive layouts without copy-pasting struggle in frontend take-homes and UI pair programming.',
            resources: [
              {
                type: 'PRACTICE',
                title: 'Flexbox Froggy & Grid Garden',
                provider: 'Codepip',
                url: 'https://flexboxfroggy.com/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Every Layout: Reclusive Modular CSS',
                provider: 'Heydon Pickering & Andy Bell',
                url: 'https://every-layout.dev/',
                isFree: true,
              },
            ],
          },
          {
            id: 'fe-js-async',
            name: 'JavaScript Runtime, Event Loop & Promises',
            level: 'ESSENTIAL',
            description:
              'Microtask vs macrotask queues, async/await, closures, prototypical inheritance, and memory leak prevention in client runtimes.',
            whyItMatters:
              'Frontend tech screens frequently drill asynchronous event loop mechanics and concurrency race conditions.',
            resources: [
              {
                type: 'VIDEO',
                title: 'What the heck is the event loop anyway?',
                provider: 'Philip Roberts / JSConf EU',
                url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Strict TypeScript & React Architecture',
        description:
          'Component composition, controlled states, custom hooks, React 19 server components, and rigorous TypeScript type generation.',
        skills: [
          {
            id: 'fe-typed-react',
            name: 'React 19 & TypeScript: Component Architecture & Hooks',
            level: 'ESSENTIAL',
            description:
              'Functional components with explicit props, generics, discriminating unions, useEffect cleanup, useMemo / useCallback profiling, and Context APIs.',
            whyItMatters:
              'TypeScript is the industry default for production web applications. Codebases rejecting `any` catch 80% of runtime errors before QA.',
            resources: [
              {
                type: 'DOCS',
                title: 'React Official Documentation (react.dev)',
                provider: 'Meta Open Source',
                url: 'https://react.dev/',
                isFree: true,
              },
              {
                type: 'COURSE',
                title: 'Total TypeScript: Beginner to Pro Essentials',
                provider: 'Matt Pocock',
                url: 'https://www.totaltypescript.com/tutorials',
                isFree: true,
              },
            ],
          },
          {
            id: 'fe-state-data',
            name: 'Server State & Async Data Fetching (TanStack Query / SWR)',
            level: 'ESSENTIAL',
            description:
              'Decoupling client UI state from server cache: optimistic updates, query invalidation, caching strategies, and infinite scrolling pagination.',
            whyItMatters:
              'Writing manual fetch calls inside `useEffect` causes race conditions and stale renders. Industry teams mandate TanStack Query or RTK Query.',
            resources: [
              {
                type: 'DOCS',
                title: 'TanStack Query (React Query) Official Guides',
                provider: 'TanStack',
                url: 'https://tanstack.com/query/latest',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Component Systems & Design Tokens',
        description:
          'Building reusable design systems using headless primitives (Radix UI / Shadcn UI), tokens, and Storybook documentation.',
        skills: [
          {
            id: 'fe-design-systems',
            name: 'Headless UI Primitives & Design Systems (Radix / Shadcn)',
            level: 'ESSENTIAL',
            description:
              'Composing accessible dropdowns, modals, tabs, and popovers with unstyled headless primitives and Tailwind styling.',
            whyItMatters:
              'Top companies no longer build modal dialogs from scratch; they compose battle-tested headless libraries.',
            resources: [
              {
                type: 'DOCS',
                title: 'Radix UI Primitives Documentation',
                provider: 'WorkOS',
                url: 'https://www.radix-ui.com/primitives',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Full-Stack Frameworks & Routing (Next.js)',
        description:
          'Master Next.js App Router, React Server Components (RSC), Server Actions, metadata SEO, and dynamic streaming.',
        skills: [
          {
            id: 'fe-nextjs-rsc',
            name: 'Next.js App Router, RSC & Server Actions',
            level: 'ESSENTIAL',
            description:
              'Understanding server vs client boundaries, streaming with Suspense, nested layouts, and secure server-side data mutations.',
            whyItMatters:
              'Next.js is the most requested full-stack React framework in enterprise job requisitions.',
            resources: [
              {
                type: 'COURSE',
                title: 'Learn Next.js Interactive Course',
                provider: 'Vercel',
                url: 'https://nextjs.org/learn',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Client State & Offline Persistence',
        description:
          'Managing global application state with lightweight stores (Zustand) and offline persistence with IndexedDB.',
        skills: [
          {
            id: 'fe-client-state',
            name: 'Global State Management with Zustand & Local Persistence',
            level: 'ESSENTIAL',
            description:
              'Store slicing, middleware persistence, selectors, and synchronizing state across browser tabs with BroadcastChannel.',
            whyItMatters:
              'Lightweight stores like Zustand have overtaken heavy Redux boilerplate in modern React codebases.',
            resources: [
              {
                type: 'DOCS',
                title: 'Zustand Official Documentation',
                provider: 'Poimandres',
                url: 'https://zustand.docs.pmnd.rs/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Web Performance & Core Web Vitals',
        description:
          'Optimize LCP, INP, and CLS, analyze JavaScript bundle sizes, implement image responsive srcsets, and eliminate render-blocking scripts.',
        skills: [
          {
            id: 'fe-web-vitals',
            name: 'Core Web Vitals Optimization (LCP, INP, CLS)',
            level: 'ESSENTIAL',
            description:
              'Chrome DevTools Performance profiling, avoiding layout thrashing, code splitting, dynamic imports, and modern WebP/AVIF formats.',
            whyItMatters:
              'E-commerce and SaaS platforms link every 100ms improvement in page speed directly to conversion revenue.',
            resources: [
              {
                type: 'DOCS',
                title: 'web.dev: Learn Core Web Vitals',
                provider: 'Google Chrome',
                url: 'https://web.dev/vitals/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, Automated Testing (Vitest & Playwright)',
        description:
          'Unit test UI components with Vitest & React Testing Library, and automate critical user flows with Playwright end-to-end tests.',
        skills: [
          {
            id: 'fe-testing-playwright',
            name: 'E2E Testing with Playwright & Component Testing with RTL',
            level: 'ESSENTIAL',
            description:
              'Testing user interactions from the user perspective (by role, text), mocking API network responses, and running headless CI tests.',
            whyItMatters:
              'Senior frontend engineers maintain rigorous test suites to prevent regressions during fast-paced continuous deployment.',
            resources: [
              {
                type: 'DOCS',
                title: 'Playwright Fast & Reliable End-to-End Testing',
                provider: 'Microsoft',
                url: 'https://playwright.dev/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'fe-s8',
        stageNumber: 8,
        stageLabel: 'STAGE 08',
        title: 'Stage 8, Client Security & Real User Monitoring (RUM)',
        description:
          'Protect applications against XSS, clickjacking, and CSRF; set Content Security Policies (CSP); and configure Sentry error telemetry.',
        skills: [
          {
            id: 'fe-security-monitoring',
            name: 'Client Security (CSP, XSS Mitigation) & Sentry Observability',
            level: 'RECOMMENDED',
            description:
              'Sanitizing user-generated HTML (DOMPurify), setting strict CSP headers, and tracking uncaught client-side JavaScript crashes with Sentry.',
            whyItMatters:
              'Frontend security is the first line of defense protecting authentication cookies and session tokens from malicious script injection.',
            resources: [
              {
                type: 'DOCS',
                title: 'OWASP Cross-Site Scripting (XSS) Prevention Cheat Sheet',
                provider: 'OWASP',
                url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 3. BACKEND ENGINEER
  {
    id: 'backend',
    slug: 'backend',
    title: 'Backend Engineer',
    category: 'Engineering',
    subtitle: 'High-Throughput APIs, Distributed Data & Cloud Services',
    description:
      'A backend engineer builds the resilient server-side systems behind modern digital products: REST/gRPC APIs, relational data stores, caching layers, and asynchronous event queues.',
    coreStack: [
      { name: 'Go', tag: 'GO', bg: 'bg-[#00ADD8]/20', text: 'text-[#00ADD8]' },
      { name: 'Node.js', tag: 'NODE', bg: 'bg-[#5FA04E]/20', text: 'text-[#5FA04E]' },
      { name: 'PostgreSQL', tag: 'PG', bg: 'bg-[#4169E1]/20', text: 'text-[#4169E1]' },
      { name: 'Redis', tag: 'RDS', bg: 'bg-[#DC382D]/20', text: 'text-[#DC382D]' },
      { name: 'Docker', tag: 'DCK', bg: 'bg-[#2496ED]/20', text: 'text-[#2496ED]' },
    ],
    stagesCount: 9,
    skillsCount: 32,
    resourcesCount: 77,
    stages: [
      {
        id: 'be-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Systems Language Mastery (Go or Node.js)',
        description:
          'Deep fluency in backend runtimes: Go goroutines & channels, or Node.js asynchronous event loop, streams, and buffer manipulation.',
        skills: [
          {
            id: 'be-concurrency',
            name: 'Concurrency Models & Memory Safety (Goroutines / Async I/O)',
            level: 'ESSENTIAL',
            description:
              'Handling concurrent web requests, race conditions, mutex locks, worker thread pools, and non-blocking I/O operations.',
            whyItMatters:
              'High-throughput backend microservices must handle thousands of simultaneous connections without memory leaks or deadlocks.',
            resources: [
              {
                type: 'COURSE',
                title: 'Go by Example (Interactive Concurrency)',
                provider: 'Mark McGranaghan',
                url: 'https://gobyexample.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Relational Database Modeling & SQL Mastery',
        description:
          'Design 3NF relational schemas, write complex joins and window functions, optimize indexes (B-Tree, GIN), and manage migrations safely in production.',
        skills: [
          {
            id: 'be-sql-indexing',
            name: 'PostgreSQL Schemas, Indexes & Query Optimization',
            level: 'ESSENTIAL',
            description:
              'Normal forms, foreign keys with ON DELETE policies, transactions (ACID), EXPLAIN ANALYZE execution plan breakdown, and index tuning.',
            whyItMatters:
              '90% of backend outages and performance bottlenecks originate from unindexed queries or deadlocks in the primary relational database.',
            resources: [
              {
                type: 'COURSE',
                title: 'Use The Index, Luke! - A Guide to Database Performance',
                provider: 'Markus Winand',
                url: 'https://use-the-index-luke.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, API Architecture, Protocols & Schemas',
        description:
          'Build RESTful APIs with OpenAPI specs, high-throughput gRPC microservices with Protocol Buffers, and GraphQL data layers.',
        skills: [
          {
            id: 'be-grpc-rest',
            name: 'gRPC, Protobuf & RESTful API Architecture',
            level: 'ESSENTIAL',
            description:
              'Binary wire formats with Protocol Buffers, bidirectional HTTP/2 streaming, idempotency keys, and versioning strategies.',
            whyItMatters:
              'Internal microservices communicate over gRPC for 10x lower latency and type-safe client contract generation.',
            resources: [
              {
                type: 'DOCS',
                title: 'gRPC Official Documentation & Quickstart',
                provider: 'Linux Foundation',
                url: 'https://grpc.io/docs/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Authentication, Authorization & Security',
        description:
          'Stateless JWT vs Redis sessions, refresh token rotation, OAuth2/OIDC flows, RBAC authorization, and API rate limiting.',
        skills: [
          {
            id: 'be-auth-rbac',
            name: 'Authentication, Authorization (RBAC) & Session Hygiene',
            level: 'ESSENTIAL',
            description:
              'HMAC/RSA token signatures, bcrypt password hashing, token revocation lists, CORS policies, and role-based middleware guards.',
            whyItMatters:
              'Security vulnerabilities in auth endpoints lead directly to data breaches and compliance fines.',
            resources: [
              {
                type: 'DOCS',
                title: 'OWASP Top 10 API Security Risks',
                provider: 'OWASP Foundation',
                url: 'https://owasp.org/www-project-api-security/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Caching & In-Memory Data Stores (Redis)',
        description:
          'Implement Cache-Aside, Write-Through, and TTL eviction; distributed locking; rate limiting with token buckets; and Redis sorted sets.',
        skills: [
          {
            id: 'be-redis-caching',
            name: 'Redis In-Memory Caching & Distributed Locks (Redlock)',
            level: 'ESSENTIAL',
            description:
              'Mitigating cache stampedes, dogpiling, and cache penetration; leveraging Redis Hashes, Sets, and Sorted Sets for leaderboards.',
            whyItMatters:
              'Redis relieves database load by up to 90%, transforming 200ms database reads into 2ms in-memory responses.',
            resources: [
              {
                type: 'COURSE',
                title: 'Redis University: Redis for Developers',
                provider: 'Redis Labs',
                url: 'https://university.redis.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Message Queues & Event-Driven Architecture',
        description:
          'Decouple heavy tasks with asynchronous job queues (Kafka / RabbitMQ / SQS) and process webhooks and transactional emails reliably.',
        skills: [
          {
            id: 'be-message-queues',
            name: 'Event-Driven Systems with Kafka / RabbitMQ & BullMQ',
            level: 'ESSENTIAL',
            description:
              'Producer-consumer patterns, consumer group partitions, exponential backoff retries, and dead-letter queues (DLQ).',
            whyItMatters:
              'Never perform slow operations (PDF generation, email sending, payment calls) synchronously in a web request handler.',
            resources: [
              {
                type: 'DOCS',
                title: 'Apache Kafka Quickstart & Architecture',
                provider: 'Apache Foundation',
                url: 'https://kafka.apache.org/quickstart',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, High-Scale Distributed Systems Design',
        description:
          'Horizontal scaling, database sharding, read replicas, load balancer algorithms, circuit breakers, and CAP theorem trade-offs.',
        skills: [
          {
            id: 'be-system-design',
            name: 'High-Scale System Design (Sharding, Load Balancing, CAP)',
            level: 'ESSENTIAL',
            description:
              'Designing URL shorteners, news feeds, and real-time chat; consistent hashing; and database partition keys.',
            whyItMatters:
              'System design is the primary differentiator for Mid and Senior engineering compensation bands.',
            resources: [
              {
                type: 'DOCS',
                title: 'The System Design Primer',
                provider: 'Donne Martin / GitHub',
                url: 'https://github.com/donnemartin/system-design-primer',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s8',
        stageNumber: 8,
        stageLabel: 'STAGE 08',
        title: 'Stage 8, Containerization & Infrastructure (Docker)',
        description:
          'Package backend microservices into lean, non-root Docker images, write Docker Compose configs, and deploy to AWS ECS / Cloud Run.',
        skills: [
          {
            id: 'be-docker-deploy',
            name: 'Production Docker Containers & Cloud Run / ECS Deployments',
            level: 'ESSENTIAL',
            description:
              'Multi-stage builds, environment secret injection, health check endpoints, and container orchestrator deployment.',
            whyItMatters:
              'Modern backend teams deploy stateless containerized images automatically through CI/CD upon pull request approval.',
            resources: [
              {
                type: 'DOCS',
                title: 'Docker Official Documentation & Guides',
                provider: 'Docker',
                url: 'https://docs.docker.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'be-s9',
        stageNumber: 9,
        stageLabel: 'STAGE 09',
        title: 'Stage 9, Observability, Telemetry & Distributed Tracing',
        description:
          'Instrument backend services with OpenTelemetry, collect metrics with Prometheus, visualize latency in Grafana, and draft SLOs.',
        skills: [
          {
            id: 'be-observability-otel',
            name: 'OpenTelemetry, Distributed Tracing & Prometheus Metrics',
            level: 'RECOMMENDED',
            description:
              'Correlating request IDs across microservice hops, tracking p95/p99 latency, and setting proactive alerts before customers notice bugs.',
            whyItMatters:
              'When an API latency spikes from 50ms to 2000ms, distributed tracing pinpoints the exact slow database query or downstream microservice.',
            resources: [
              {
                type: 'DOCS',
                title: 'OpenTelemetry Concepts & Instrumentation',
                provider: 'CNCF',
                url: 'https://opentelemetry.io/docs/concepts/',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 4. OPERATIONS & WORKFORCE MANAGEMENT (WFM)
  {
    id: 'operations-wfm',
    slug: 'operations-wfm',
    title: 'Operations & Workforce Management (WFM)',
    category: 'Operations',
    badge: 'POPULAR',
    subtitle: 'Real-Time Operations, Capacity Planning & Incident Response',
    description:
      'Master high-velocity operational delivery: real-time intraday monitoring, queue load balancing, Erlang-C staffing calculations, incident triage, and cross-functional SLA governance.',
    coreStack: [
      { name: 'SQL', tag: 'SQL', bg: 'bg-warning/20', text: 'text-warning' },
      { name: 'Excel / Sheets', tag: 'XLS', bg: 'bg-[#1D6F42]/20', text: 'text-[#1D6F42]' },
      { name: 'Looker / Metabase', tag: 'BI', bg: 'bg-[#4285F4]/20', text: 'text-[#4285F4]' },
      { name: 'Jira / Confluence', tag: 'SOP', bg: 'bg-[#0052CC]/20', text: 'text-[#0052CC]' },
      { name: 'Erlang-C / WFM', tag: 'WFM', bg: 'bg-info/20', text: 'text-info' },
    ],
    stagesCount: 7,
    skillsCount: 24,
    resourcesCount: 48,
    stages: [
      {
        id: 'ops-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Real-Time Monitoring & Intraday Queue Balancing',
        description:
          'Monitor live operational queues, spot backlog spikes in minutes, reallocate team members across channels (chat, email, voice), and protect response-time SLAs.',
        skills: [
          {
            id: 'ops-queue-sla',
            name: 'Intraday SLA Monitoring & Dynamic Load Balancing',
            level: 'ESSENTIAL',
            description:
              'Tracking Service Level Agreements (e.g. 95% answered in < 60s), Average Handle Time (AHT), occupancy rates, and executing intraday mitigation workflows when volume surges.',
            whyItMatters:
              'At scale-ups like Revolut, Stripe, and Uber, failing SLAs results in millions in contractual penalties and customer churn.',
            resources: [
              {
                type: 'COURSE',
                title: 'Contact Center Operations & WFM Essentials',
                provider: 'Call Centre Helper Academy',
                url: 'https://www.callcentrehelper.com/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Erlang-C Staffing Formula Calculator & Guide',
                provider: 'WFM Formula Hub',
                url: 'https://www.callcentrehelper.com/erlang-c-calculator-2473.htm',
                isFree: true,
              },
            ],
          },
          {
            id: 'ops-incident-triage',
            name: 'Major Incident Triage, Severity Classification & Escalation',
            level: 'ESSENTIAL',
            description:
              'Triaging Sev-1/Sev-2 incidents, running war rooms, notifying stakeholders, logging timeline events, and drafting Root Cause Analysis (RCA) post-mortems in Confluence.',
            whyItMatters:
              'Operations leaders need calm, structured escalation protocols when payment gateways or internal workflows degrade.',
            resources: [
              {
                type: 'DOCS',
                title: 'Atlassian Incident Management Handbook',
                provider: 'Atlassian',
                url: 'https://www.atlassian.com/incident-management',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'PagerDuty Post-Mortem Best Practices',
                provider: 'PagerDuty',
                url: 'https://postmortems.pagerduty.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Operational Analytics with SQL & Business Intelligence',
        description:
          'Pull raw ticket and operational logs directly with SQL queries, build executive health dashboards in Looker/Metabase, and run cohort attrition analyses.',
        skills: [
          {
            id: 'ops-sql-analytics',
            name: 'SQL for Operations: Cohorts, Funnels, Window Functions',
            level: 'ESSENTIAL',
            description:
              'Writing CTEs, window functions (ROW_NUMBER, LAG, LEAD), timestamp difference calculations, and cohort grouping to analyze resolution times and throughput.',
            whyItMatters:
              'Modern operations analysts who can self-serve data without waiting on data engineering teams get promoted 2x faster.',
            resources: [
              {
                type: 'COURSE',
                title: 'Mode Analytics: Advanced SQL for Data Analysis',
                provider: 'Mode',
                url: 'https://mode.com/sql-tutorial/',
                isFree: true,
              },
            ],
          },
          {
            id: 'ops-sop-hygiene',
            name: 'Standard Operating Procedure (SOP) Knowledge Architecture',
            level: 'RECOMMENDED',
            description:
              'Authoring unambiguous, step-by-step troubleshooting SOPs in Confluence, maintaining audit trails, and reducing onboarding ramp-up time for new hires.',
            whyItMatters:
              'Well-documented operational procedures eliminate tribal knowledge and allow distributed global teams to operate seamlessly 24/7.',
            resources: [
              {
                type: 'DOCS',
                title: 'Standard Operating Procedures Architecture Guide',
                provider: 'Process Street Hub',
                url: 'https://www.process.st/standard-operating-procedure/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Workforce Planning, Erlang-C & Forecasting',
        description:
          'Calculate exact headcount requirements using Erlang-C queuing models, factor in shrinkage and seasonality, and optimize shift schedules.',
        skills: [
          {
            id: 'ops-erlang-forecasting',
            name: 'Erlang-C Queuing Math, Shrinkage & Headcount Modeling',
            level: 'ESSENTIAL',
            description:
              'Calculating required agent headcount based on arrival volume, Average Handle Time (AHT), target service level, and shrinkage adjustments (breaks, PTO, training).',
            whyItMatters:
              'Accurate forecasting prevents understaffing (which damages customer experience) and overstaffing (which wastes millions in company payroll).',
            resources: [
              {
                type: 'DOCS',
                title: 'Society of Workforce Planning Professionals (SWPP) Primer',
                provider: 'SWPP',
                url: 'https://swpp.org/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Incident War Rooms & Blameless Post-Mortems',
        description:
          'Chair live emergency bridge calls, manage cross-functional triage between engineering and operations, and run blameless post-mortems.',
        skills: [
          {
            id: 'ops-war-rooms',
            name: 'Incident Commander Operations & Blameless RCAs',
            level: 'ESSENTIAL',
            description:
              'Facilitating 5-Whys root cause analysis, assigning corrective action owners, and publishing transparent executive incident summaries.',
            whyItMatters:
              'Fintech and mission-critical SaaS companies value operational leaders who maintain calm command during high-stress customer-impacting outages.',
            resources: [
              {
                type: 'DOCS',
                title: 'Google SRE Book: Being Incident Commander',
                provider: 'Google SRE',
                url: 'https://sre.google/sre-book/incident-management/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Process Optimization & Lean Operations',
        description:
          'Apply Lean Six Sigma, value stream mapping, and continuous Kaizen improvements to eliminate redundant steps and bottlenecks.',
        skills: [
          {
            id: 'ops-lean-kaizen',
            name: 'Lean Process Mapping & Waste (Muda) Reduction',
            level: 'RECOMMENDED',
            description:
              'Mapping operational ticket workflows from creation to resolution, identifying handover delays, and measuring cycle time vs lead time.',
            whyItMatters:
              'Streamlined operational workflows can reduce customer ticket resolution turnaround by 40% without hiring additional staff.',
            resources: [
              {
                type: 'DOCS',
                title: 'Lean Enterprise Institute: Process Mapping Basics',
                provider: 'LEI',
                url: 'https://www.lean.org/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Workflow Automation & Low-Code Integrations',
        description:
          'Automate repetitive operational tasks using webhook triggers, Zapier / Make / n8n, Slack alerting bots, and Python scripts.',
        skills: [
          {
            id: 'ops-workflow-automation',
            name: 'Automated Ticket Routing & Incident Alerting Bots',
            level: 'ESSENTIAL',
            description:
              'Building automated routing rules based on ticket categorization, integrating Slack webhooks for SLA warnings, and eliminating manual copy-pasting.',
            whyItMatters:
              'Operations professionals with automation skills replace manual clerical work with automated systems that scale effortlessly.',
            resources: [
              {
                type: 'DOCS',
                title: 'n8n: Workflow Automation for Operations Teams',
                provider: 'n8n Open Source',
                url: 'https://docs.n8n.io/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ops-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, BPO Vendor Governance & Operational Leadership',
        description:
          'Manage external Business Process Outsourcing (BPO) partners, set strict contractual KPIs, conduct quarterly business reviews (QBRs), and manage unit economics.',
        skills: [
          {
            id: 'ops-bpo-governance',
            name: 'BPO Vendor Governance, KPI Audits & Unit Economics',
            level: 'RECOMMENDED',
            description:
              'Reviewing contractor billable hours, monitoring QA accuracy scorecards, negotiating service tier agreements, and managing operational OPEX budgets.',
            whyItMatters:
              'Global operations leaders oversee hybrid teams spanning internal operations and offshore partners across different time zones.',
            resources: [
              {
                type: 'DOCS',
                title: 'Harvard Business Review: Managing Strategic Vendor Partners',
                provider: 'HBR',
                url: 'https://hbr.org/',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 5. AI & MACHINE LEARNING ENGINEER
  {
    id: 'ai-ml',
    slug: 'ai-ml',
    title: 'AI & Machine Learning Engineer',
    category: 'AI & Data',
    badge: 'HIGH DEMAND',
    subtitle: 'LLM Orchestration, RAG Architectures & GenAI Systems',
    description:
      'Transition from traditional software to production generative AI: embeddings, vector databases, LangChain/LlamaIndex agents, fine-tuning, and prompt evaluation pipelines.',
    coreStack: [
      { name: 'Python', tag: 'PY', bg: 'bg-[#3776AB]/20', text: 'text-brand' },
      { name: 'PyTorch', tag: 'TORCH', bg: 'bg-[#EE4C2C]/20', text: 'text-[#EE4C2C]' },
      { name: 'Gemini / OpenAI API', tag: 'LLM', bg: 'bg-info/20', text: 'text-info' },
      { name: 'Vector DB (Pinecone/Chroma)', tag: 'VEC', bg: 'bg-[#10B981]/20', text: 'text-[#10B981]' },
      { name: 'LangChain / LlamaIndex', tag: 'RAG', bg: 'bg-[#00D2FF]/20', text: 'text-[#00D2FF]' },
    ],
    stagesCount: 8,
    skillsCount: 28,
    resourcesCount: 60,
    stages: [
      {
        id: 'ai-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Python for Data Science & Vector Math',
        description:
          'NumPy array manipulation, Pandas data cleansing, matrix transformations, cosine similarity, and high-dimensional vector embeddings.',
        skills: [
          {
            id: 'ai-numpy-embeddings',
            name: 'Vector Embeddings, Cosine Similarity & Matrix Math',
            level: 'ESSENTIAL',
            description:
              'Understanding tokenization, text embeddings, semantic search distance metrics (dot product, Euclidean, cosine), and chunking strategies.',
            whyItMatters:
              'Retrieval-Augmented Generation (RAG) performance depends entirely on chunking hygiene and embedding space precision.',
            resources: [
              {
                type: 'COURSE',
                title: 'Fast.ai: Practical Deep Learning for Coders',
                provider: 'fast.ai',
                url: 'https://course.fast.ai/',
                isFree: true,
              },
              {
                type: 'COURSE',
                title: 'DeepLearning.AI: Prompt Engineering & Vector DBs',
                provider: 'DeepLearning.AI',
                url: 'https://www.deeplearning.ai/short-courses/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Machine Learning Foundations & Evaluation',
        description:
          'Supervised regression/classification algorithms, unsupervised clustering, feature engineering, and model validation metrics (F1, ROC-AUC).',
        skills: [
          {
            id: 'ai-classical-ml',
            name: 'Scikit-Learn Modeling & Validation Metrics',
            level: 'ESSENTIAL',
            description:
              'Training random forests, gradient boosting (XGBoost/LightGBM), hyperparameter tuning, and cross-validation techniques.',
            whyItMatters:
              'Tabular and structured business data is still best solved by gradient boosting rather than expensive LLMs.',
            resources: [
              {
                type: 'COURSE',
                title: 'Coursera: Machine Learning Specialization by Andrew Ng',
                provider: 'DeepLearning.AI / Stanford',
                url: 'https://www.coursera.org/specializations/machine-learning-introduction',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Deep Learning & PyTorch Essentials',
        description:
          'Understand feedforward neural networks, backpropagation, loss functions, PyTorch autograd, custom Dataset loaders, and GPU training.',
        skills: [
          {
            id: 'ai-pytorch-training',
            name: 'PyTorch Tensors, Autograd & Custom Training Loops',
            level: 'ESSENTIAL',
            description:
              'Building neural layers with torch.nn, calculating gradients, learning rate schedulers, and managing CUDA memory on GPUs.',
            whyItMatters:
              'PyTorch is the undisputed framework used by AI research labs and production generative AI teams.',
            resources: [
              {
                type: 'COURSE',
                title: 'PyTorch Official 60-Minute Blitz & Tutorials',
                provider: 'PyTorch.org',
                url: 'https://pytorch.org/tutorials/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Transformers & Natural Language Processing (NLP)',
        description:
          'Self-attention mechanisms, encoder-decoder architectures, tokenization (BPE/WordPiece), and Hugging Face model pipelines.',
        skills: [
          {
            id: 'ai-transformers-huggingface',
            name: 'Self-Attention Mechanisms & Hugging Face Hub Pipelines',
            level: 'ESSENTIAL',
            description:
              'How Query, Key, and Value matrices compute contextual token attention; loading and running open weights (Mistral, LLaMA) with Hugging Face transformers.',
            whyItMatters:
              'Every modern LLM (GPT-4, Claude 3, Gemini 1.5, LLaMA 3) is built upon the transformer attention architecture.',
            resources: [
              {
                type: 'COURSE',
                title: 'Hugging Face NLP Course (Free & Interactive)',
                provider: 'Hugging Face',
                url: 'https://huggingface.co/learn/nlp-course',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Production RAG & Hybrid Retrieval',
        description:
          'Dense vector retrieval + sparse BM25 keyword matching, cross-encoder rerankers, contextual compression, and vector database tuning.',
        skills: [
          {
            id: 'ai-production-rag',
            name: 'Hybrid Search (Dense + BM25) & Cohere Reranking',
            level: 'ESSENTIAL',
            description:
              'Connecting Chroma / Pinecone / pgvector with document parsers, implementing semantic re-ranking, and citing exact document sources.',
            whyItMatters:
              'Basic vector search fails on exact product SKUs, names, or numbers. Production enterprise RAG mandates hybrid keyword + vector retrieval.',
            resources: [
              {
                type: 'DOCS',
                title: 'LlamaIndex Production RAG Guide',
                provider: 'LlamaIndex',
                url: 'https://docs.llamaindex.ai/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Fine-Tuning with LoRA & Evaluation Frameworks',
        description:
          'Parameter-Efficient Fine-Tuning (LoRA / QLoRA), instruction tuning datasets, and automated LLM-as-a-judge evaluation (Ragas / LangSmith).',
        skills: [
          {
            id: 'ai-lora-eval',
            name: 'QLoRA Fine-Tuning & Automated Benchmarking (Ragas)',
            level: 'ADVANCED',
            description:
              'Quantizing base models to 4-bit, training low-rank adaptation adapters on consumer GPUs, and measuring hallucination rates with synthetic test sets.',
            whyItMatters:
              'Fine-tuning models on domain-specific data gives companies proprietary advantages that generic API prompts cannot match.',
            resources: [
              {
                type: 'DOCS',
                title: 'Axolotl / Unsloth Fast LLM Fine-Tuning Guide',
                provider: 'Unsloth AI',
                url: 'https://github.com/unslothai/unsloth',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, Autonomous Multi-Agent Orchestration',
        description:
          'Tool-calling agent loops (ReAct), multi-agent collaboration (LangGraph / CrewAI), structured output validation, and state machines.',
        skills: [
          {
            id: 'ai-agents-langgraph',
            name: 'Multi-Agent Tool Use with LangGraph & Pydantic Validation',
            level: 'ESSENTIAL',
            description:
              'Equipping models with function-calling capabilities, routing sub-tasks between specialist agents, and enforcing type-safe JSON schemas.',
            whyItMatters:
              'Agentic workflows that autonomously search, reason, and take action represent the biggest growth sector in 2026 AI engineering.',
            resources: [
              {
                type: 'DOCS',
                title: 'LangGraph Concepts: Building Stateful Multi-Agent Applications',
                provider: 'LangChain',
                url: 'https://langchain-ai.github.io/langgraph/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'ai-s8',
        stageNumber: 8,
        stageLabel: 'STAGE 08',
        title: 'Stage 8, MLOps, High-Throughput Serving & Guardrails',
        description:
          'Deploying models with vLLM, continuous batching, streaming token responses, and enforcing guardrails against prompt injection.',
        skills: [
          {
            id: 'ai-mlops-vllm',
            name: 'vLLM Serving, Streaming APIs & Security Guardrails',
            level: 'ESSENTIAL',
            description:
              'PagedAttention memory management, running inference servers behind FastAPI, and validating inputs with NeMo Guardrails.',
            whyItMatters:
              'vLLM delivers 5x higher token throughput per dollar compared to naive PyTorch inference servers in production.',
            resources: [
              {
                type: 'DOCS',
                title: 'vLLM: Easy, Fast, and Cheap LLM Serving',
                provider: 'vLLM Project / UC Berkeley',
                url: 'https://docs.vllm.ai/',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 6. DEVOPS / SRE
  {
    id: 'devops-sre',
    slug: 'devops-sre',
    title: 'DevOps / SRE',
    category: 'Cloud & DevOps',
    subtitle: 'Infrastructure as Code, CI/CD, Containers & Observability',
    description:
      'DevOps, Platform Engineering, and SRE are three views of one job: shipping and operating software reliably, scalably, and automatically with zero downtime.',
    coreStack: [
      { name: 'Docker', tag: 'DCK', bg: 'bg-[#2496ED]/20', text: 'text-[#2496ED]' },
      { name: 'Kubernetes', tag: 'K8S', bg: 'bg-[#326CE5]/20', text: 'text-[#326CE5]' },
      { name: 'Terraform', tag: 'TF', bg: 'bg-[#7B42BC]/20', text: 'text-[#7B42BC]' },
      { name: 'Prometheus / Grafana', tag: 'OBS', bg: 'bg-[#F46800]/20', text: 'text-[#F46800]' },
      { name: 'GitHub Actions', tag: 'CI', bg: 'bg-[#2088FF]/20', text: 'text-[#2088FF]' },
    ],
    stagesCount: 7,
    skillsCount: 29,
    resourcesCount: 73,
    stages: [
      {
        id: 'devops-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Linux Administration, Networking & Shell',
        description:
          'Master Linux system internals: systemd services, process signals, user permissions, networking (DNS, routing, iptables), and Bash automation.',
        skills: [
          {
            id: 'devops-linux-admin',
            name: 'Linux System Administration & Networking Diagnostics',
            level: 'ESSENTIAL',
            description:
              'Diagnosing system resource contention (CPU load, memory swap, disk I/O with iostat/vmstat), inspecting network ports with netstat/ss, and configuring systemd daemons.',
            whyItMatters:
              'Cloud servers run Linux. When an outage strikes, SREs troubleshoot directly in terminal sessions.',
            resources: [
              {
                type: 'COURSE',
                title: 'Linux Journey: Free Learning for Sysadmins',
                provider: 'Linux Journey',
                url: 'https://linuxjourney.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Containerization with Docker & Multi-Stage Builds',
        description:
          'Containerize polyglot applications, write secure non-root Dockerfiles, leverage multi-stage builds to shrink image footprints, and orchestrate with Docker Compose.',
        skills: [
          {
            id: 'devops-docker-containers',
            name: 'Production Dockerfile Architecture & Container Security',
            level: 'ESSENTIAL',
            description:
              'Linux namespaces, cgroups, image caching layers, minimizing attack vectors with Alpine/Distroless bases, and healthcheck configurations.',
            whyItMatters:
              'Containers are the standard unit of software deployment across AWS ECS, Google Cloud Run, and Kubernetes clusters.',
            resources: [
              {
                type: 'COURSE',
                title: 'Docker for Beginners by KodeKloud',
                provider: 'KodeKloud',
                url: 'https://kodekloud.com/',
                isFree: true,
              },
              {
                type: 'DOCS',
                title: 'Best Practices for Writing Dockerfiles',
                provider: 'Docker Docs',
                url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Infrastructure as Code (IaC) with Terraform',
        description:
          'Model cloud resources declaratively using HashiCorp Terraform: state locking, reusable modules, variables, and automated drift detection.',
        skills: [
          {
            id: 'devops-terraform-iac',
            name: 'Terraform State Management, Modules & Cloud Provisioning',
            level: 'ESSENTIAL',
            description:
              'Writing modular HCL to provision VPCs, subnets, managed databases (RDS), and Kubernetes clusters with S3/GCS remote state backends.',
            whyItMatters:
              'Clicking buttons in the AWS/GCP web console causes configuration drift and human errors. Enterprise infrastructure is 100% codified.',
            resources: [
              {
                type: 'COURSE',
                title: 'HashiCorp Learn: Terraform Associates Tutorials',
                provider: 'HashiCorp',
                url: 'https://developer.hashicorp.com/terraform/tutorials',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Automated CI/CD Pipelines (GitHub Actions)',
        description:
          'Build end-to-end continuous integration and deployment workflows: linting, automated testing, container image registry push, and automated deployment.',
        skills: [
          {
            id: 'devops-cicd-pipelines',
            name: 'GitHub Actions CI/CD & Automated Container Security',
            level: 'ESSENTIAL',
            description:
              'Creating matrix test jobs, caching node_modules/pip wheels, signing container images, and running vulnerability scans with Trivy.',
            whyItMatters:
              'Automated pipelines give developers confidence to ship software multiple times per day without manual intervention.',
            resources: [
              {
                type: 'DOCS',
                title: 'GitHub Actions Documentation & Quickstart',
                provider: 'GitHub',
                url: 'https://docs.github.com/en/actions',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Kubernetes Cluster Orchestration',
        description:
          'Deploy, scale, and manage applications on Kubernetes: Pods, Deployments, Services, Ingress controllers, Helm charts, and ConfigMaps.',
        skills: [
          {
            id: 'devops-k8s-orchestration',
            name: 'Kubernetes Workloads, Helm Packaging & Ingress Routing',
            level: 'ESSENTIAL',
            description:
              'Configuring readiness/liveness probes, rolling update strategies, resource requests and limits (preventing OOMKills), and cert-manager SSL/TLS.',
            whyItMatters:
              'Kubernetes is the standard operating system for cloud-native container workloads across all major tech enterprises.',
            resources: [
              {
                type: 'COURSE',
                title: 'Kubernetes the Hard Way by Kelsey Hightower',
                provider: 'GitHub',
                url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Observability, Telemetry & SRE Error Budgets',
        description:
          'Prometheus metrics, PromQL alerting rules, Grafana visualization, centralized logging (Loki), and defining SLIs/SLOs.',
        skills: [
          {
            id: 'devops-sre-monitoring',
            name: 'Prometheus, Grafana & SRE Error Budget Governance',
            level: 'ESSENTIAL',
            description:
              'Scraping metric endpoints, drafting PromQL queries for 99th percentile response times, and routing alerts to PagerDuty/OpsGenie.',
            whyItMatters:
              'Site Reliability Engineering requires mathematical error budgets: if SLOs are violated, feature releases halt until reliability improves.',
            resources: [
              {
                type: 'DOCS',
                title: 'Google SRE Book (Complete Online Edition)',
                provider: 'Google SRE',
                url: 'https://sre.google/books/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'devops-s7',
        stageNumber: 7,
        stageLabel: 'STAGE 07',
        title: 'Stage 7, Cloud Security & Secrets Governance',
        description:
          'Enforce least-privilege IAM roles, manage application secrets with HashiCorp Vault / AWS Secrets Manager, and run chaos experiments.',
        skills: [
          {
            id: 'devops-secrets-vault',
            name: 'HashiCorp Vault & Cloud IAM Least Privilege Architecture',
            level: 'RECOMMENDED',
            description:
              'Eliminating plaintext API keys from git repositories, dynamic short-lived database credential generation, and automated certificate renewal.',
            whyItMatters:
              'Hardcoded credentials in source code are the leading root cause of enterprise security breaches.',
            resources: [
              {
                type: 'DOCS',
                title: 'HashiCorp Vault Developer Tutorials',
                provider: 'HashiCorp',
                url: 'https://developer.hashicorp.com/vault/tutorials',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // 7. PRODUCT OPERATIONS & STRATEGY
  {
    id: 'product-ops',
    slug: 'product-ops',
    title: 'Product Operations & Strategy',
    category: 'Operations',
    subtitle: 'Connecting Product Development with Frontline Operations',
    description:
      'Bridge product management, software engineering, and frontline customer operations with automated feedback loops, release ops, metric tracking, and experimentation.',
    coreStack: [
      { name: 'SQL', tag: 'SQL', bg: 'bg-warning/20', text: 'text-warning' },
      { name: 'Product Analytics', tag: 'MIX', bg: 'bg-[#7856FF]/20', text: 'text-[#7856FF]' },
      { name: 'Jira / Linear', tag: 'LIN', bg: 'bg-[#5E6AD2]/20', text: 'text-[#5E6AD2]' },
      { name: 'Notion / Coda', tag: 'DOC', bg: 'bg-card/10', text: 'text-primary-foreground' },
      { name: 'Figma', tag: 'FIG', bg: 'bg-[#F24E1E]/20', text: 'text-[#F24E1E]' },
    ],
    stagesCount: 6,
    skillsCount: 22,
    resourcesCount: 45,
    stages: [
      {
        id: 'prodops-s1',
        stageNumber: 1,
        stageLabel: 'STAGE 01',
        title: 'Stage 1, Voice of Customer Telemetry & Bug Triaging',
        description:
          'Aggregate frontline feedback, cluster bug reports by user impact, prioritize P0 regressions with engineering, and establish clear release communication.',
        skills: [
          {
            id: 'prodops-telemetry',
            name: 'Telemetry Aggregation & Bug Escalation Frameworks',
            level: 'ESSENTIAL',
            description:
              'Translating messy qualitative customer support complaints into crisp, reproducible bug tickets with steps, logs, user IDs, and estimated business impact.',
            whyItMatters:
              'Product managers lack the time to sift through thousands of tickets. Product Ops synthesizes signal from the noise.',
            resources: [
              {
                type: 'DOCS',
                title: 'The Rise of Product Operations',
                provider: 'Mind the Product',
                url: 'https://www.mindtheproduct.com/what-is-product-operations/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'prodops-s2',
        stageNumber: 2,
        stageLabel: 'STAGE 02',
        title: 'Stage 2, Quantitative Product Analytics & Funnels',
        description:
          'Track user journeys, conversion funnels, and retention curves in Mixpanel, Amplitude, or PostHog to validate whether new features succeed.',
        skills: [
          {
            id: 'prodops-funnels-analytics',
            name: 'Product Analytics (Mixpanel / Amplitude) & Funnel Analysis',
            level: 'ESSENTIAL',
            description:
              'Setting up event tracking taxonomies, analyzing drop-off rates across checkout/onboarding steps, and segmenting power users vs churned cohorts.',
            whyItMatters:
              'Decisions grounded in data prevent product teams from building features that nobody uses.',
            resources: [
              {
                type: 'COURSE',
                title: 'Amplitude Academy: Product Analytics Certification',
                provider: 'Amplitude',
                url: 'https://academy.amplitude.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'prodops-s3',
        stageNumber: 3,
        stageLabel: 'STAGE 03',
        title: 'Stage 3, Experimentation & Feature Flag Rollouts',
        description:
          'Manage gradual feature rollouts (canary/percentage rollout), configure feature flags (LaunchDarkly / Statsig), and analyze A/B test results.',
        skills: [
          {
            id: 'prodops-feature-flags',
            name: 'Feature Flag Architecture & A/B Experimentation',
            level: 'ESSENTIAL',
            description:
              'Coordinating phased rollouts (1% -> 5% -> 25% -> 100%), tracking kill-switch safety protocols, and verifying statistical significance in experiment results.',
            whyItMatters:
              'Feature flags decouple code deployment from feature release, allowing instant rollbacks if bugs appear without redeploying code.',
            resources: [
              {
                type: 'DOCS',
                title: 'LaunchDarkly: The Guide to Feature Flags',
                provider: 'LaunchDarkly',
                url: 'https://launchdarkly.com/guide/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'prodops-s4',
        stageNumber: 4,
        stageLabel: 'STAGE 04',
        title: 'Stage 4, Cross-Functional Launch Enablement & Training',
        description:
          'Create internal enablement materials: help center documentation, sales engineer training, and customer success release notes before product launches.',
        skills: [
          {
            id: 'prodops-enablement',
            name: 'Go-to-Market Readiness & Internal Enablement Architecture',
            level: 'ESSENTIAL',
            description:
              'Creating cheat-sheets for sales, updating frontline response templates, conducting internal demo walkthroughs, and running beta tester communities.',
            whyItMatters:
              'If frontline customer support and account managers are unprepared for new releases, customers receive bad answers and get frustrated.',
            resources: [
              {
                type: 'DOCS',
                title: 'Product Marketing Alliance: Launch Readiness Guide',
                provider: 'PMA',
                url: 'https://www.productmarketingalliance.com/',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'prodops-s5',
        stageNumber: 5,
        stageLabel: 'STAGE 05',
        title: 'Stage 5, Operational Tooling & Knowledge Hygiene',
        description:
          'Standardize product documentation templates, build automated feedback loops between Linear/Jira and Slack, and eliminate organizational silos.',
        skills: [
          {
            id: 'prodops-tooling-hygiene',
            name: 'Linear / Jira Project Management & Feedback Loops',
            level: 'RECOMMENDED',
            description:
              'Structuring issue triage boards, maintaining roadmap transparency in Notion, and automating status syncs across department channels.',
            whyItMatters:
              'Product Ops acts as the operational nervous system keeping distributed engineering, design, and business teams in sync.',
            resources: [
              {
                type: 'DOCS',
                title: 'Linear Method: Practices for High-Performance Teams',
                provider: 'Linear',
                url: 'https://linear.app/method',
                isFree: true,
              },
            ],
          },
        ],
      },
      {
        id: 'prodops-s6',
        stageNumber: 6,
        stageLabel: 'STAGE 06',
        title: 'Stage 6, Executive Strategic Planning & Roadmap Synthesis',
        description:
          'Translate qualitative frontline feedback into quantitative ROI models to help VP of Product and CPO prioritize the quarterly product roadmap.',
        skills: [
          {
            id: 'prodops-roadmap-strategy',
            name: 'Roadmap Prioritization & Executive Business Case Modeling',
            level: 'RECOMMENDED',
            description:
              'Calculating customer impact scores (RICE framework: Reach, Impact, Confidence, Effort) and presenting strategic prioritization decks to leadership.',
            whyItMatters:
              'Product Operations leaders sit at the decision-making table helping leadership allocate engineering resources toward high-impact revenue drivers.',
            resources: [
              {
                type: 'DOCS',
                title: 'Intercom on Product Management: The RICE Framework',
                provider: 'Intercom',
                url: 'https://www.intercom.com/books/product-management',
                isFree: true,
              },
            ],
          },
        ],
      },
    ],
  },
  ...EXPANDED_ROADMAPS,
  ...MORE_ROADMAPS,
];

export const CAREER_ROADMAPS: CareerRoadmap[] = RAW_CAREER_ROADMAPS.map((roadmap) => {
  const stagesCount = roadmap.stages.length;
  const skillsCount = roadmap.stages.reduce((acc, stage) => acc + stage.skills.length, 0);
  const resourcesCount = roadmap.stages.reduce(
    (acc, stage) => acc + stage.skills.reduce((sum, skill) => sum + skill.resources.length, 0),
    0
  );
  return {
    ...roadmap,
    stagesCount,
    skillsCount,
    resourcesCount,
  };
});
