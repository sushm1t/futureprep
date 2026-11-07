// Additional 2026 career roadmaps beyond engineering. All linked resources are free.
import type { CareerRoadmap, RoadmapSkill, RoadmapStage, ResourceLink } from './roadmapData';

type R = [ResourceLink['type'], string, string, string];
type S = [string, RoadmapSkill['level'], string, string, R[]];
type St = [string, string, S[]];

function build(
  id: string,
  title: string,
  category: CareerRoadmap['category'],
  subtitle: string,
  description: string,
  coreStack: Array<[string, string]>,
  stages: St[],
  badge?: string,
): CareerRoadmap {
  const builtStages: RoadmapStage[] = stages.map(([stTitle, stDesc, skills], i) => ({
    id: `${id}-s${i + 1}`,
    stageNumber: i + 1,
    stageLabel: `STAGE ${String(i + 1).padStart(2, '0')}`,
    title: `Stage ${i + 1}, ${stTitle}`,
    description: stDesc,
    skills: skills.map(([name, level, desc, why, res], j) => ({
      id: `${id}-s${i + 1}-k${j + 1}`,
      name,
      level,
      description: desc,
      whyItMatters: why,
      resources: res.map(([type, t, provider, url]) => ({ type, title: t, provider, url, isFree: true })),
    })),
  }));
  const skillsCount = builtStages.reduce((n, s) => n + s.skills.length, 0);
  const resourcesCount = builtStages.reduce((n, s) => n + s.skills.reduce((m, k) => m + k.resources.length, 0), 0);
  return {
    id,
    slug: id,
    title,
    category,
    ...(badge ? { badge } : {}),
    subtitle,
    description,
    coreStack: coreStack.map(([name, tag]) => ({ name, tag })),
    stagesCount: builtStages.length,
    skillsCount,
    resourcesCount,
    stages: builtStages,
  };
}

const GOOGLE_SKILLSHOP_ADS = 'https://skillshop.exceedlms.com/student/catalog/browse?category_ids=2844-google-ads';
const GOOGLE_SKILLSHOP_GA4 = 'https://skillshop.exceedlms.com/student/catalog/browse?category_ids=6431-google-analytics-4';
const HUBSPOT_INBOUND_SALES = 'https://academy.hubspot.com/courses/inbound-sales';
const HUBSPOT_DIGITAL_MARKETING = 'https://academy.hubspot.com/courses/digital-marketing';
const HUBSPOT_PRODUCT_MARKETING = 'https://academy.hubspot.com/courses/product-marketing';
const HUBSPOT_CUSTOMER_SERVICE = 'https://academy.hubspot.com/courses/customer-service-training';
const COURSERA_SUPPLY_CHAIN = 'https://www.coursera.org/specializations/supply-chain-management';
const COURSERA_PEOPLE_ANALYTICS = 'https://www.coursera.org/learn/wharton-people-analytics';
const COURSERA_SIX_SIGMA = 'https://www.coursera.org/learn/six-sigma-principles';
const COURSERA_EXCEL = 'https://www.coursera.org/specializations/excel';
const COURSERA_NEGOTIATION = 'https://www.coursera.org/learn/negotiation-skills';
const COURSERA_SUSTAINABLE_TOURISM = 'https://www.coursera.org/learn/sustainable-tourism';
const COURSERA_HOTEL_MGMT = 'https://www.coursera.org/specializations/hotel-management';
const KHAN_FINANCE = 'https://www.khanacademy.org/economics-finance-domain/core-finance';

export const MORE_ROADMAPS: CareerRoadmap[] = [
  build(
    'llm-genai-builder',
    'LLM & Generative AI Builder',
    'AI & Data',
    'Prompting, RAG, Agents & Evaluation',
    'Build useful applications on large language models: prompt design, retrieval-augmented generation, tool-using agents, evaluation and responsible deployment.',
    [['Python', 'CODE'], ['OpenAI / Gemini APIs', 'LLM'], ['Vector DBs', 'RAG'], ['LangGraph', 'AGENTS'], ['Evals', 'QUALITY']],
    [
      ['Foundations of LLMs', 'Understand how language models work, their limits, and how to talk to them reliably.', [
        ['How LLMs work (tokens, context, sampling)', 'ESSENTIAL', 'Tokens, context windows, temperature, embeddings and why models hallucinate.', 'Knowing the mechanics lets you predict failures instead of guessing.', [
          ['VIDEO', 'Intro to Large Language Models', 'Andrej Karpathy (YouTube)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'],
          ['COURSE', 'LLM Course', 'Hugging Face', 'https://huggingface.co/learn/llm-course'],
        ]],
        ['Prompt engineering', 'ESSENTIAL', 'Clear instructions, examples, structured output and step-by-step reasoning.', 'Most quality gains in real products come from better prompts and structure.', [
          ['DOCS', 'Prompt Engineering Guide', 'DAIR.AI', 'https://www.promptingguide.ai'],
          ['DOCS', 'Prompt engineering overview', 'Anthropic Docs', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview'],
        ]],
      ]],
      ['Building with APIs & RAG', 'Connect models to your own data and ship a working app.', [
        ['Calling model APIs & structured outputs', 'ESSENTIAL', 'Chat APIs, streaming, JSON/function calling and error handling.', 'Every LLM product is built on these primitives.', [
          ['COURSE', 'Short courses on building with LLMs', 'DeepLearning.AI', 'https://www.deeplearning.ai/short-courses/'],
          ['DOCS', 'Gemini API docs', 'Google AI for Developers', 'https://ai.google.dev/gemini-api/docs'],
        ]],
        ['Retrieval-augmented generation (RAG)', 'ESSENTIAL', 'Chunking, embeddings, vector search and grounding answers in sources.', 'RAG is the standard way companies use LLMs on private knowledge.', [
          ['DOCS', 'RAG tutorial', 'LangChain Docs', 'https://python.langchain.com/docs/tutorials/rag/'],
          ['COURSE', 'Open-source AI Cookbook', 'Hugging Face', 'https://huggingface.co/learn/cookbook'],
        ]],
      ]],
      ['Agents & Tools', 'Let models take multi-step actions safely.', [
        ['Tool use & agent workflows', 'RECOMMENDED', 'Function calling, planning loops, memory and human-in-the-loop checks.', 'Agentic automation is one of the fastest-growing areas of AI work in 2026.', [
          ['COURSE', 'AI Agents Course', 'Hugging Face', 'https://huggingface.co/learn/agents-course'],
          ['DOCS', 'LangGraph documentation', 'LangChain', 'https://langchain-ai.github.io/langgraph/'],
        ]],
        ['Model Context Protocol (MCP)', 'RECOMMENDED', 'Standard way to expose tools and data sources to AI assistants.', 'Widely adopted for connecting assistants to real systems.', [
          ['DOCS', 'MCP introduction', 'modelcontextprotocol.io', 'https://modelcontextprotocol.io/introduction'],
        ]],
      ]],
      ['Evaluation, Safety & Shipping', 'Measure quality, control cost and deploy responsibly.', [
        ['LLM evaluation', 'ADVANCED', 'Test sets, LLM-as-judge, regression checks and tracing.', 'Without evals you cannot tell whether a change made things better or worse.', [
          ['DOCS', 'Evaluation best practices', 'OpenAI Docs', 'https://platform.openai.com/docs/guides/evals'],
          ['COURSE', 'Evaluating AI agents', 'DeepLearning.AI', 'https://www.deeplearning.ai/short-courses/'],
        ]],
        ['Responsible AI & portfolio project', 'ESSENTIAL', 'Bias, privacy, prompt injection, and a public end-to-end demo.', 'A deployed project with clear limits is the strongest proof of skill.', [
          ['DOCS', 'OWASP Top 10 for LLM Applications', 'OWASP', 'https://genai.owasp.org'],
          ['PROJECT', 'Deploy a free demo with Spaces', 'Hugging Face', 'https://huggingface.co/spaces'],
        ]],
      ]],
    ],
    'TRENDING 2026',
  ),

  build(
    'b2b-sales-sdr-ae',
    'B2B Sales (SDR to Account Executive)',
    'Solutions & GTM',
    'Prospecting, Discovery & Closing',
    'From outbound prospecting as an SDR to running discovery, demos, negotiation and forecasting as an Account Executive.',
    [['CRM', 'HUBSPOT'], ['LinkedIn', 'PROSPECT'], ['MEDDICC', 'QUALIFY'], ['Email', 'OUTBOUND']],
    [
      ['Sales Foundations', 'Learn the sales process and the tools reps use daily.', [
        ['Sales process & CRM hygiene', 'ESSENTIAL', 'Pipeline stages, logging activity and managing deals in a CRM.', 'Clean pipeline data is how managers trust your forecast.', [
          ['COURSE', 'Inbound Sales / Sales Software courses', 'HubSpot Academy', HUBSPOT_INBOUND_SALES],
          ['DOCS', 'Sales blog & guides', 'HubSpot', 'https://blog.hubspot.com/sales'],
        ]],
        ['Buyer research', 'ESSENTIAL', 'Ideal customer profile, personas and trigger events.', 'Relevance is what gets replies from busy buyers.', [
          ['COURSE', 'LinkedIn Learning free sales resources', 'LinkedIn Sales Solutions', 'https://business.linkedin.com/sales-solutions/resources'],
        ]],
      ]],
      ['Prospecting (SDR)', 'Book qualified meetings through calls, email and social.', [
        ['Cold email & calling', 'ESSENTIAL', 'Short personalised messages, call openers and objection handling.', 'Meetings booked is the core SDR metric.', [
          ['DOCS', 'Sales resources & blog', 'Gong Labs', 'https://www.gong.io/blog/'],
          ['VIDEO', 'Sales training videos', '30 Minutes to President\'s Club (YouTube)', 'https://www.youtube.com/@30MPC'],
        ]],
        ['Signal-based outbound & deliverability', 'ESSENTIAL', 'DMARC, DKIM, SPF compliance, domain warmup, and signal-based triggers (hiring, funding, tech stack).', 'Mass email blasts hit spam folders in 2026; deliverability infrastructure and intent signals are mandatory to reach inboxes.', [
          ['DOCS', 'Email sender guidelines & compliance', 'Google Workspace Admin', 'https://support.google.com/a/answer/81126'],
          ['DOCS', 'B2B signal-based outbound guide', 'Clay University', 'https://www.clay.com/university'],
        ]],
      ]],
      ['Discovery & Demos (AE)', 'Run conversations that uncover real business pain.', [
        ['Discovery & qualification (MEDDICC/BANT)', 'ESSENTIAL', 'Metrics, decision process, champions and pain.', 'Strong qualification avoids wasting quarters on deals that never close.', [
          ['DOCS', 'MEDDICC overview', 'meddicc.com', 'https://meddicc.com/meddpicc-sales-methodology-and-process'],
        ]],
        ['Value-led demos', 'RECOMMENDED', 'Tailoring demos to the buyer\'s problem rather than feature tours.', 'Buyers remember outcomes, not features.', [
          ['DOCS', 'Demo best practices', 'Gong Labs', 'https://www.gong.io/blog/'],
        ]],
      ]],
      ['Closing & Forecasting', 'Negotiate, close and predict revenue.', [
        ['Negotiation', 'ADVANCED', 'Anchoring, trade-offs, procurement and mutual action plans.', 'Protects deal value and shortens sales cycles.', [
          ['COURSE', 'Successful Negotiation (audit free)', 'University of Michigan / Coursera', COURSERA_NEGOTIATION],
        ]],
      ]],
    ],
    'HIGH DEMAND',
  ),

  build(
    'growth-performance-marketing',
    'Growth & Performance Marketing',
    'Solutions & GTM',
    'Paid, SEO, Lifecycle & Analytics',
    'Acquire and retain customers through SEO, paid ads, email lifecycle and experimentation, measured with analytics.',
    [['GA4', 'ANALYTICS'], ['Google Ads', 'PAID'], ['Meta Ads', 'PAID'], ['SEO', 'ORGANIC'], ['Email', 'LIFECYCLE']],
    [
      ['Marketing Fundamentals', 'Funnels, positioning and customer journeys.', [
        ['Digital marketing basics', 'ESSENTIAL', 'Funnels, channels, CAC, LTV and conversion rates.', 'Every growth decision maps back to these numbers.', [
          ['COURSE', 'Digital Marketing certification', 'HubSpot Academy', HUBSPOT_DIGITAL_MARKETING],
          ['COURSE', 'Google Digital Marketing & E-commerce', 'Google on Coursera', 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce'],
        ]],
      ]],
      ['Organic Growth', 'Content and search that compound over time.', [
        ['SEO', 'ESSENTIAL', 'Keyword research, on-page, technical SEO and content quality.', 'Organic search remains one of the cheapest long-term channels.', [
          ['DOCS', 'SEO Starter Guide', 'Google Search Central', 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'],
          ['COURSE', 'Beginner\'s Guide to SEO', 'Moz', 'https://moz.com/beginners-guide-to-seo'],
        ]],
      ]],
      ['Paid Acquisition', 'Run profitable ad campaigns.', [
        ['Search & social ads', 'ESSENTIAL', 'Campaign structure, bidding, creatives and audiences.', 'Paid channels give fast, measurable growth when managed well.', [
          ['COURSE', 'Google Ads certifications', 'Google Skillshop', GOOGLE_SKILLSHOP_ADS],
          ['COURSE', 'Meta Blueprint free courses', 'Meta', 'https://www.facebook.com/business/learn'],
        ]],
      ]],
      ['Analytics & Experimentation', 'Measure and improve every step.', [
        ['GA4 & A/B testing', 'RECOMMENDED', 'Event tracking, attribution, experiments and statistical significance.', 'Growth teams win by running more good experiments.', [
          ['COURSE', 'Google Analytics certification', 'Google Skillshop', GOOGLE_SKILLSHOP_GA4],
          ['DOCS', 'Experimentation guides', 'Optimizely', 'https://www.optimizely.com/optimization-glossary/ab-testing/'],
        ]],
        ['Server-Side Tracking & First-Party Data', 'ESSENTIAL', 'Meta Conversions API (CAPI), Server-Side Google Tag Manager (sGTM), and first-party identity resolution.', 'Third-party cookie deprecation and browser tracking restrictions make server-side event tracking required for accurate ROAS and ad attribution in 2026.', [
          ['DOCS', 'Conversions API (CAPI) Overview', 'Meta for Developers', 'https://developers.facebook.com/docs/marketing-api/conversions-api'],
          ['DOCS', 'Server-Side Tagging Guide', 'Google Tag Manager', 'https://developers.google.com/tag-platform/tag-manager/server-side'],
        ]],
      ]],
    ],
  ),

  build(
    'product-marketing-gtm',
    'Product Marketing & GTM Strategy',
    'Solutions & GTM',
    'Positioning, Launches & Enablement',
    'Own positioning, messaging, product launches, competitive intelligence and sales enablement.',
    [['Positioning', 'STRATEGY'], ['Launch plans', 'GTM'], ['Battlecards', 'ENABLE'], ['Customer research', 'INSIGHT']],
    [
      ['Market & Customer Understanding', 'Know who buys and why.', [
        ['Customer research & personas', 'ESSENTIAL', 'Interviews, win/loss analysis and segmentation.', 'Messaging built on real buyer language converts better.', [
          ['DOCS', 'Product Marketing resources', 'Product Marketing Alliance', 'https://www.productmarketingalliance.com/resources/'],
        ]],
      ]],
      ['Positioning & Messaging', 'Make the product easy to understand and choose.', [
        ['Positioning frameworks', 'ESSENTIAL', 'Competitive alternatives, unique value and target segments.', 'Clear positioning lifts every channel at once.', [
          ['DOCS', 'Positioning articles', 'April Dunford', 'https://www.aprildunford.com/blog'],
        ]],
      ]],
      ['Launches & Enablement', 'Bring products to market and arm sales teams.', [
        ['Go-to-market launch planning', 'RECOMMENDED', 'Launch tiers, timelines, assets and success metrics.', 'Coordinated launches create momentum instead of noise.', [
          ['COURSE', 'Product Marketing courses', 'HubSpot Academy', HUBSPOT_PRODUCT_MARKETING],
          ['DOCS', 'Lenny\'s Newsletter free posts', 'Lenny Rachitsky', 'https://www.lennysnewsletter.com'],
        ]],
      ]],
    ],
  ),

  build(
    'customer-success',
    'Customer Success Manager',
    'Solutions & GTM',
    'Onboarding, Retention & Expansion',
    'Help customers reach outcomes with the product, reduce churn and grow accounts.',
    [['CRM', 'ACCOUNTS'], ['Health scores', 'RETENTION'], ['QBRs', 'REVIEWS'], ['Zendesk', 'SUPPORT']],
    [
      ['Support & Onboarding', 'Get new customers live and successful quickly.', [
        ['Customer onboarding & communication', 'ESSENTIAL', 'Kickoff calls, success plans and clear written updates.', 'Early value is the strongest predictor of renewal.', [
          ['COURSE', 'Customer Service fundamentals', 'HubSpot Academy', HUBSPOT_CUSTOMER_SERVICE],
          ['DOCS', 'Customer success resources', 'Gainsight', 'https://www.gainsight.com/resources/'],
        ]],
      ]],
      ['Retention Metrics', 'Spot risk and act early.', [
        ['Health scores, churn & NRR', 'ESSENTIAL', 'Usage signals, renewal forecasting and net revenue retention.', 'Retention economics drive SaaS valuation.', [
          ['DOCS', 'SaaS Metrics 2.0', 'For Entrepreneurs', 'https://www.forentrepreneurs.com/saas-metrics-2/'],
        ]],
      ]],
      ['Expansion & Advocacy', 'Grow accounts and create champions.', [
        ['Business reviews & upsell', 'RECOMMENDED', 'Quarterly business reviews, ROI stories and expansion plays.', 'Expansion revenue is often cheaper than new logos.', [
          ['DOCS', 'Customer Success blog', 'Gainsight', 'https://www.gainsight.com/blog/'],
        ]],
      ]],
    ],
  ),

  build(
    'business-revenue-operations',
    'Business & Revenue Operations',
    'Operations',
    'RevOps, BizOps & Process Automation',
    'Run the systems, data and processes behind sales, marketing and finance teams, increasingly with automation and AI.',
    [['Excel / Sheets', 'MODEL'], ['SQL', 'DATA'], ['Salesforce', 'CRM'], ['Zapier / n8n', 'AUTOMATE']],
    [
      ['Spreadsheet & Data Skills', 'The everyday toolkit of operations.', [
        ['Advanced spreadsheets', 'ESSENTIAL', 'Lookups, pivot tables, charts and simple models.', 'Most operational decisions start in a spreadsheet.', [
          ['COURSE', 'Excel Skills for Business (audit free)', 'Macquarie University / Coursera', COURSERA_EXCEL],
          ['DOCS', 'Google Sheets training', 'Google Workspace', 'https://support.google.com/a/users/answer/9282959'],
        ]],
        ['SQL for operations', 'RECOMMENDED', 'Querying, joining and aggregating business data.', 'Removes dependency on analysts for routine questions.', [
          ['PRACTICE', 'SQL tutorial', 'SQLBolt', 'https://sqlbolt.com'],
        ]],
      ]],
      ['CRM & Funnel Operations', 'Own the go-to-market systems.', [
        ['CRM administration', 'ESSENTIAL', 'Objects, fields, reports, dashboards and data quality.', 'RevOps is the owner of the revenue source of truth.', [
          ['COURSE', 'Trailhead (Salesforce)', 'Salesforce', 'https://trailhead.salesforce.com'],
        ]],
      ]],
      ['Automation & AI Workflows', 'Remove manual work across teams.', [
        ['No-code automation', 'RECOMMENDED', 'Triggers, actions, integrations and AI steps in workflows.', 'Automation is one of the most valued ops skills in 2026.', [
          ['COURSE', 'Zapier Learn', 'Zapier', 'https://zapier.com/learn'],
          ['DOCS', 'n8n courses', 'n8n', 'https://docs.n8n.io/courses/'],
        ]],
      ]],
    ],
  ),

  build(
    'supply-chain-logistics',
    'Supply Chain & Logistics',
    'Operations',
    'Procurement, Inventory & Fulfilment',
    'Plan, source, move and store goods efficiently, with data-driven forecasting and vendor management.',
    [['Excel', 'PLANNING'], ['ERP', 'SYSTEMS'], ['Lean / Six Sigma', 'PROCESS'], ['Forecasting', 'DEMAND']],
    [
      ['Supply Chain Basics', 'How goods flow from supplier to customer.', [
        ['End-to-end supply chain', 'ESSENTIAL', 'Plan, source, make, deliver and return.', 'Every specialist role sits inside this flow.', [
          ['COURSE', 'Supply Chain Management Specialization (audit free)', 'Rutgers / Coursera', COURSERA_SUPPLY_CHAIN],
          ['COURSE', 'MITx Supply Chain courses (audit free)', 'edX', 'https://www.edx.org/micromasters/mitx-supply-chain-management'],
        ]],
      ]],
      ['Inventory & Procurement', 'Balance stock, cost and service levels.', [
        ['Inventory planning & procurement', 'ESSENTIAL', 'Safety stock, reorder points, sourcing and supplier scorecards.', 'Inventory is often a company\'s largest controllable cost.', [
          ['DOCS', 'Supply chain resources', 'ASCM', 'https://www.ascm.org/learning-development/'],
        ]],
      ]],
      ['Process Improvement', 'Make operations faster and more reliable.', [
        ['Lean & Six Sigma basics', 'RECOMMENDED', 'Waste reduction, root cause analysis and process mapping.', 'A widely recognised skill set across operations roles.', [
          ['COURSE', 'Six Sigma Yellow Belt (audit free)', 'Coursera', COURSERA_SIX_SIGMA],
        ]],
      ]],
    ],
  ),

  build(
    'finance-fpa',
    'Finance & FP&A Analyst',
    'Business & Finance',
    'Accounting, Modelling & Business Partnering',
    'Understand financial statements, build forecasts and budgets, and advise teams on decisions.',
    [['Excel', 'MODEL'], ['Accounting', 'BASICS'], ['Power BI', 'REPORT'], ['Valuation', 'ANALYSIS']],
    [
      ['Accounting Foundations', 'Read the language of business.', [
        ['Financial statements', 'ESSENTIAL', 'Income statement, balance sheet and cash flow.', 'Every finance role depends on reading these fluently.', [
          ['COURSE', 'Accounting and financial statements', 'Khan Academy', KHAN_FINANCE],
          ['COURSE', 'Free finance courses', 'Corporate Finance Institute', 'https://corporatefinanceinstitute.com/collections/free-courses/'],
        ]],
      ]],
      ['Modelling & Forecasting', 'Turn assumptions into plans.', [
        ['Financial modelling in Excel', 'ESSENTIAL', 'Three-statement models, budgets and scenario analysis.', 'Forecasts guide hiring, spending and strategy.', [
          ['COURSE', 'Free finance courses', 'Corporate Finance Institute', 'https://corporatefinanceinstitute.com/collections/free-courses/'],
        ]],
      ]],
      ['Business Partnering', 'Influence decisions with numbers.', [
        ['Variance analysis & reporting', 'RECOMMENDED', 'Budget vs actuals, dashboards and executive summaries.', 'Clear explanations turn data into decisions.', [
          ['COURSE', 'Power BI learning paths', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi'],
        ]],
      ]],
    ],
  ),

  build(
    'hr-talent-acquisition',
    'HR & Talent Acquisition',
    'Business & Finance',
    'Recruiting, People Ops & HR Analytics',
    'Hire, onboard and support people, using structured interviews, HR systems and people data.',
    [['ATS', 'RECRUIT'], ['LinkedIn', 'SOURCING'], ['HRIS', 'SYSTEMS'], ['People data', 'ANALYTICS']],
    [
      ['Recruiting Fundamentals', 'Find and attract the right candidates.', [
        ['Sourcing & structured interviews', 'ESSENTIAL', 'Boolean search, job descriptions, scorecards and fair interviewing.', 'Structured hiring is more predictive and fair.', [
          ['DOCS', 'Hiring guides (re:Work)', 'Google', 'https://rework.withgoogle.com/subjects/hiring/'],
          ['DOCS', 'Talent blog', 'LinkedIn Talent Solutions', 'https://www.linkedin.com/business/talent/blog'],
        ]],
      ]],
      ['People Operations', 'Run the employee lifecycle.', [
        ['Onboarding, policies & employment law basics', 'ESSENTIAL', 'Onboarding plans, policies and compliance awareness.', 'Good people ops protects both employees and the company.', [
          ['DOCS', 'HR toolkits & articles', 'SHRM', 'https://www.shrm.org/topics-tools'],
        ]],
      ]],
      ['HR Analytics', 'Use data to improve hiring and retention.', [
        ['People analytics', 'RECOMMENDED', 'Time-to-hire, attrition, engagement surveys and dashboards.', 'Data-driven HR earns a seat in business decisions.', [
          ['COURSE', 'People Analytics (audit free)', 'Wharton / Coursera', COURSERA_PEOPLE_ANALYTICS],
        ]],
      ]],
    ],
  ),

  build(
    'travel-tourism-operations',
    'Travel & Tourism Operations',
    'Travel & Hospitality',
    'Tour Ops, Travel Tech & Destination Management',
    'Plan and operate trips, tours and travel products, from booking systems and supplier contracts to customer experience and travel-tech tools.',
    [['GDS (Amadeus)', 'BOOKING'], ['Excel', 'PLANNING'], ['CRM', 'GUESTS'], ['Revenue mgmt', 'PRICING']],
    [
      ['Industry Foundations', 'How the travel ecosystem fits together.', [
        ['Travel & tourism ecosystem', 'ESSENTIAL', 'Airlines, OTAs, DMCs, tour operators and sustainable tourism.', 'Understanding the value chain helps you work across partners.', [
          ['DOCS', 'Tourism resources & data', 'UN Tourism (UNWTO)', 'https://www.unwto.org'],
          ['COURSE', 'Sustainable Tourism (audit free)', 'University of Copenhagen / Coursera', COURSERA_SUSTAINABLE_TOURISM],
        ]],
      ]],
      ['Booking Systems & Itinerary Planning', 'Tools used every day in travel operations.', [
        ['GDS & reservation systems', 'ESSENTIAL', 'Fares, PNRs, hotel and tour inventory in booking platforms.', 'Core technical skill for agencies and tour operators.', [
          ['DOCS', 'Amadeus learning resources', 'Amadeus', 'https://amadeus.com/en/learning'],
        ]],
        ['Itinerary design & vendor management', 'RECOMMENDED', 'Costing, contracts with hotels/transport and contingency planning.', 'Margins and guest satisfaction depend on supplier relationships.', [
          ['COURSE', 'Excel Skills for Business (audit free)', 'Coursera', COURSERA_EXCEL],
        ]],
      ]],
      ['Customer Experience & Growth', 'Deliver memorable trips and grow the business.', [
        ['Guest experience & digital marketing', 'RECOMMENDED', 'Service recovery, reviews, social media and online distribution.', 'Reviews and repeat travellers drive tourism revenue.', [
          ['COURSE', 'Digital Marketing Certification', 'HubSpot Academy', HUBSPOT_DIGITAL_MARKETING],
        ]],
      ]],
    ],
  ),

  build(
    'hospitality-management',
    'Hospitality & Hotel Management',
    'Travel & Hospitality',
    'Front Office, F&B & Revenue Management',
    'Run hotel and hospitality operations: guest service, front office, food and beverage, and revenue management.',
    [['PMS', 'OPERATIONS'], ['Revenue mgmt', 'PRICING'], ['F&B', 'SERVICE'], ['Guest reviews', 'CX']],
    [
      ['Service Foundations', 'The standards behind great hospitality.', [
        ['Guest service & front office', 'ESSENTIAL', 'Check-in flow, complaint handling and service standards.', 'Service quality is the product in hospitality.', [
          ['COURSE', 'Hospitality courses (audit free)', 'Coursera', COURSERA_HOTEL_MGMT],
          ['DOCS', 'Hospitality Net articles', 'Hospitality Net', 'https://www.hospitalitynet.org'],
        ]],
      ]],
      ['Operations', 'Keep departments running smoothly.', [
        ['Property management systems & F&B ops', 'ESSENTIAL', 'Room inventory, housekeeping, food cost and staffing.', 'Operational control drives both profit and guest experience.', [
          ['DOCS', 'Hotel Tech Report guides', 'Hotel Tech Report', 'https://hoteltechreport.com/news'],
        ]],
      ]],
      ['Revenue Management', 'Price rooms and services well.', [
        ['Revenue management basics', 'ADVANCED', 'ADR, RevPAR, occupancy forecasting and channel mix.', 'Revenue managers are among the best-paid hospitality specialists.', [
          ['DOCS', 'Revenue management guides', 'Hospitality Net', 'https://www.hospitalitynet.org'],
        ]],
      ]],
    ],
  ),

  build(
    'ux-ui-design',
    'UX / UI & Product Design',
    'Creative & Design',
    'Research, Interaction & Visual Design',
    'Design digital products people can use: research, wireframes, prototypes, visual systems and accessibility.',
    [['Figma', 'DESIGN'], ['User research', 'UX'], ['Design systems', 'UI'], ['Accessibility', 'A11Y']],
    [
      ['Design Foundations', 'Principles of usable and attractive interfaces.', [
        ['UX principles & visual design', 'ESSENTIAL', 'Hierarchy, layout, typography, colour and usability heuristics.', 'Strong fundamentals make every design decision easier.', [
          ['DOCS', 'UX articles', 'Nielsen Norman Group', 'https://www.nngroup.com/articles/'],
          ['COURSE', 'Laws of UX', 'Jon Yablonski', 'https://lawsofux.com'],
        ]],
      ]],
      ['Tools & Prototyping', 'Turn ideas into testable designs.', [
        ['Figma & prototyping', 'ESSENTIAL', 'Components, auto layout, variants and interactive prototypes.', 'Figma is the industry standard design tool.', [
          ['COURSE', 'Figma Learn', 'Figma', 'https://help.figma.com/hc/en-us/categories/360002051613'],
        ]],
      ]],
      ['Research & Portfolio', 'Validate designs and show your process.', [
        ['Usability testing & case studies', 'RECOMMENDED', 'Test plans, synthesis and portfolio case studies.', 'Hiring managers judge designers by their process, not just visuals.', [
          ['DOCS', 'Usability testing 101', 'Nielsen Norman Group', 'https://www.nngroup.com/articles/usability-testing-101/'],
          ['DOCS', 'Web accessibility intro', 'W3C WAI', 'https://www.w3.org/WAI/fundamentals/accessibility-intro/'],
        ]],
      ]],
    ],
  ),

  build(
    'digital-artist-illustrator',
    'Digital Artist & Illustrator',
    'Creative & Design',
    'Drawing, Digital Painting & Freelance Business',
    'Grow from drawing fundamentals to digital illustration, 3D and a sustainable freelance or studio art career.',
    [['Krita', 'PAINT'], ['Blender', '3D'], ['Procreate', 'TABLET'], ['Portfolio', 'BUSINESS']],
    [
      ['Art Fundamentals', 'The skills every artist builds on.', [
        ['Drawing, perspective & anatomy', 'ESSENTIAL', 'Line, form, perspective, gesture and figure drawing.', 'Fundamentals separate professional work from hobby work.', [
          ['COURSE', 'Drawabox (free lessons)', 'Drawabox', 'https://drawabox.com'],
          ['PRACTICE', 'Gesture drawing practice', 'Line of Action', 'https://line-of-action.com'],
        ]],
        ['Colour & light', 'ESSENTIAL', 'Value, colour theory, lighting and composition.', 'Colour and light set the mood of every piece.', [
          ['VIDEO', 'Art tutorials', 'Marco Bucci (YouTube)', 'https://www.youtube.com/@marcobucci'],
        ]],
      ]],
      ['Digital Tools', 'Paint and model digitally.', [
        ['Digital painting', 'ESSENTIAL', 'Brushes, layers and workflows in free software.', 'Most commercial illustration is digital.', [
          ['DOCS', 'Krita manual & tutorials', 'Krita', 'https://docs.krita.org/en/'],
        ]],
        ['3D basics', 'RECOMMENDED', 'Modelling, materials and rendering for concept art and games.', '3D skills open roles in games, animation and product visuals.', [
          ['VIDEO', 'Blender tutorials', 'Blender Foundation', 'https://www.blender.org/support/tutorials/'],
        ]],
      ]],
      ['Career & Business', 'Turn art into income.', [
        ['Generative AI Concepting & Creator Ethics', 'RECOMMENDED', 'Prompt-assisted ideation (Midjourney, Flux) for moodboards and thumbnailing with human craft and IP hygiene.', 'Studios in 2026 value artists who accelerate ideation with AI while maintaining authentic authorship and copyright compliance.', [
          ['DOCS', 'Copyright Office Guidance on AI Works', 'U.S. Copyright Office', 'https://www.copyright.gov/ai/'],
          ['DOCS', 'Concept Art Ideation Workflows', 'ArtStation Magazine', 'https://magazine.artstation.com'],
        ]],
        ['Portfolio, clients & licensing', 'ESSENTIAL', 'Portfolio curation, freelance pricing, contracts, client communication, and commercial licensing.', 'Business acumen determines whether an art career is sustainable long-term.', [
          ['PROJECT', 'Build a portfolio on ArtStation', 'ArtStation', 'https://www.artstation.com'],
          ['DOCS', 'Copyright basics', 'U.S. Copyright Office', 'https://www.copyright.gov/what-is-copyright/'],
        ]],
      ]],
    ],
  ),

  build(
    'content-creator-video',
    'Content Creator & Video Producer',
    'Creative & Design',
    'Storytelling, Editing & Audience Growth',
    'Create video and written content for brands or your own channel: scripting, filming, editing, and growing an audience.',
    [['DaVinci Resolve', 'EDIT'], ['Canva', 'DESIGN'], ['YouTube', 'PLATFORM'], ['Analytics', 'GROWTH']],
    [
      ['Storytelling & Scripting', 'Make content worth watching.', [
        ['Hooks, structure & scripting', 'ESSENTIAL', 'Openings, pacing and clear storytelling for short and long video.', 'Retention depends on the first seconds and the structure.', [
          ['COURSE', 'YouTube Creator Academy / Creators', 'YouTube', 'https://www.youtube.com/creators/'],
        ]],
      ]],
      ['Production & Editing', 'Shoot and edit professionally with free tools.', [
        ['Video editing', 'ESSENTIAL', 'Cuts, colour, audio cleanup and captions.', 'Editing quality drives watch time.', [
          ['COURSE', 'DaVinci Resolve free training', 'Blackmagic Design', 'https://www.blackmagicdesign.com/products/davinciresolve/training'],
          ['COURSE', 'Canva Design School', 'Canva', 'https://www.canva.com/designschool/'],
        ]],
        ['AI-Assisted Video Tools & Workflow', 'RECOMMENDED', 'Leveraging DaVinci Neural Engine, Runway Gen-3 B-roll synthesis, auto-captions, and AI audio noise removal.', 'Modern video editors in 2026 ship 3x faster by automating captions, rotoscoping, and b-roll ideation.', [
          ['DOCS', 'DaVinci Resolve Neural Engine Features', 'Blackmagic Design', 'https://www.blackmagicdesign.com/products/davinciresolve'],
          ['DOCS', 'AI Video Generation & Prompting Guide', 'Runway Academy', 'https://academy.runwayml.com/'],
        ]],
      ]],
      ['Audience & Monetisation', 'Grow and earn sustainably.', [
        ['Analytics & brand partnerships', 'RECOMMENDED', 'Reading analytics, consistency, sponsorship pitches and disclosure rules.', 'Creators who understand data and business last longer.', [
          ['DOCS', 'Endorsement disclosure guide', 'U.S. FTC', 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers'],
        ]],
      ]],
    ],
  ),
];
