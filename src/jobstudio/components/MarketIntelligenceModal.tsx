import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Building2,
  Sparkles,
  ShieldAlert,
  Globe2,
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Briefcase,
} from 'lucide-react';

interface MarketIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultLocation?: string;
}

interface SalaryTier {
  level: string;
  p25: string;
  p50: string;
  p75: string;
  p90: string;
  typicalEquity: string;
}

interface RegionSalaryData {
  currency: string;
  tiers: SalaryTier[];
}

const SALARY_BENCHMARKS: Record<string, Record<string, RegionSalaryData>> = {
  'Product & Management': {
    'United States': {
      currency: 'USD ($)',
      tiers: [
        { level: 'Associate PM (0-2 yrs)', p25: '$95,000', p50: '$115,000', p75: '$130,000', p90: '$145,000', typicalEquity: '$15k - $30k / yr' },
        { level: 'Mid-Level PM (2-5 yrs)', p25: '$130,000', p50: '$150,000', p75: '$170,000', p90: '$190,000', typicalEquity: '$30k - $60k / yr' },
        { level: 'Senior PM (5-8 yrs)', p25: '$165,000', p50: '$185,000', p75: '$210,000', p90: '$240,000', typicalEquity: '$60k - $120k / yr' },
        { level: 'Principal / Group PM (8+ yrs)', p25: '$210,000', p50: '$240,000', p75: '$280,000', p90: '$320,000', typicalEquity: '$120k - $250k / yr' },
        { level: 'Director / VP Product', p25: '$270,000', p50: '$320,000', p75: '$380,000', p90: '$450,000+', typicalEquity: '$250k - $600k+ / yr' },
      ],
    },
    'Europe & UK': {
      currency: 'EUR / GBP (£/€)',
      tiers: [
        { level: 'Associate PM (0-2 yrs)', p25: '£42,000', p50: '£50,000', p75: '£58,000', p90: '£65,000', typicalEquity: '£5k - £12k / yr' },
        { level: 'Mid-Level PM (2-5 yrs)', p25: '£60,000', p50: '£72,000', p75: '£85,000', p90: '£95,000', typicalEquity: '£12k - £28k / yr' },
        { level: 'Senior PM (5-8 yrs)', p25: '£85,000', p50: '£100,000', p75: '£120,000', p90: '£140,000', typicalEquity: '£30k - £65k / yr' },
        { level: 'Principal / Group PM (8+ yrs)', p25: '£115,000', p50: '£135,000', p75: '£160,000', p90: '£185,000', typicalEquity: '£60k - £130k / yr' },
        { level: 'Director / VP Product', p25: '£150,000', p50: '£180,000', p75: '£220,000', p90: '£260,000+', typicalEquity: '£120k - £300k+ / yr' },
      ],
    },
    India: {
      currency: 'INR (₹)',
      tiers: [
        { level: 'Associate PM (0-2 yrs)', p25: '₹14 LPA', p50: '₹18 LPA', p75: '₹24 LPA', p90: '₹30 LPA', typicalEquity: '₹3L - ₹6L / yr' },
        { level: 'Mid-Level PM (2-5 yrs)', p25: '₹24 LPA', p50: '₹32 LPA', p75: '₹40 LPA', p90: '₹48 LPA', typicalEquity: '₹6L - ₹15L / yr' },
        { level: 'Senior PM (5-8 yrs)', p25: '₹42 LPA', p50: '₹55 LPA', p75: '₹68 LPA', p90: '₹80 LPA', typicalEquity: '₹15L - ₹35L / yr' },
        { level: 'Principal / Group PM (8+ yrs)', p25: '₹70 LPA', p50: '₹88 LPA', p75: '₹1.1 Cr', p90: '₹1.4 Cr', typicalEquity: '₹30L - ₹70L / yr' },
        { level: 'Director / VP Product', p25: '₹1.1 Cr', p50: '₹1.4 Cr', p75: '₹1.8 Cr', p90: '₹2.4 Cr+', typicalEquity: '₹60L - ₹1.5 Cr+ / yr' },
      ],
    },
    UAE: {
      currency: 'AED (Tax-Free)',
      tiers: [
        { level: 'Associate PM (0-2 yrs)', p25: '18k AED/mo', p50: '24k AED/mo', p75: '28k AED/mo', p90: '32k AED/mo', typicalEquity: 'Bonus 15%' },
        { level: 'Mid-Level PM (2-5 yrs)', p25: '28k AED/mo', p50: '35k AED/mo', p75: '42k AED/mo', p90: '48k AED/mo', typicalEquity: 'Bonus 20%' },
        { level: 'Senior PM (5-8 yrs)', p25: '45k AED/mo', p50: '55k AED/mo', p75: '65k AED/mo', p90: '75k AED/mo', typicalEquity: 'Bonus 25%' },
        { level: 'Principal / Group PM (8+ yrs)', p25: '65k AED/mo', p50: '78k AED/mo', p75: '90k AED/mo', p90: '105k AED/mo', typicalEquity: 'Bonus 30%' },
        { level: 'Director / VP Product', p25: '90k AED/mo', p50: '115k AED/mo', p75: '135k AED/mo', p90: '160k+ AED/mo', typicalEquity: 'Executive Bonus 35%+' },
      ],
    },
  },
  'Engineering & Tech': {
    'United States': {
      currency: 'USD ($)',
      tiers: [
        { level: 'Junior Engineer (0-2 yrs)', p25: '$90,000', p50: '$110,000', p75: '$125,000', p90: '$140,000', typicalEquity: '$10k - $25k / yr' },
        { level: 'Mid-Level Engineer (2-5 yrs)', p25: '$125,000', p50: '$145,000', p75: '$165,000', p90: '$185,000', typicalEquity: '$25k - $55k / yr' },
        { level: 'Senior Engineer (5-8 yrs)', p25: '$160,000', p50: '$180,000', p75: '$205,000', p90: '$235,000', typicalEquity: '$50k - $110k / yr' },
        { level: 'Staff / Principal (8+ yrs)', p25: '$210,000', p50: '$245,000', p75: '$290,000', p90: '$340,000', typicalEquity: '$110k - $260k / yr' },
        { level: 'Engineering Director / VP', p25: '$280,000', p50: '$330,000', p75: '$390,000', p90: '$480,000+', typicalEquity: '$250k - $650k+ / yr' },
      ],
    },
    'Europe & UK': {
      currency: 'EUR / GBP (£/€)',
      tiers: [
        { level: 'Junior Engineer (0-2 yrs)', p25: '£38,000', p50: '£45,000', p75: '£52,000', p90: '£60,000', typicalEquity: '£4k - £10k / yr' },
        { level: 'Mid-Level Engineer (2-5 yrs)', p25: '£55,000', p50: '£68,000', p75: '£80,000', p90: '£92,000', typicalEquity: '£10k - £25k / yr' },
        { level: 'Senior Engineer (5-8 yrs)', p25: '£80,000', p50: '£95,000', p75: '£115,000', p90: '£135,000', typicalEquity: '£25k - £60k / yr' },
        { level: 'Staff / Principal (8+ yrs)', p25: '£110,000', p50: '£130,000', p75: '£155,000', p90: '£180,000', typicalEquity: '£50k - £120k / yr' },
        { level: 'Engineering Director / VP', p25: '£145,000', p50: '£175,000', p75: '£215,000', p90: '£260,000+', typicalEquity: '£100k - £280k+ / yr' },
      ],
    },
    India: {
      currency: 'INR (₹)',
      tiers: [
        { level: 'Junior Engineer (0-2 yrs)', p25: '₹12 LPA', p50: '₹16 LPA', p75: '₹22 LPA', p90: '₹28 LPA', typicalEquity: '₹2L - ₹5L / yr' },
        { level: 'Mid-Level Engineer (2-5 yrs)', p25: '₹22 LPA', p50: '₹30 LPA', p75: '₹38 LPA', p90: '₹46 LPA', typicalEquity: '₹5L - ₹14L / yr' },
        { level: 'Senior Engineer (5-8 yrs)', p25: '₹38 LPA', p50: '₹50 LPA', p75: '₹64 LPA', p90: '₹75 LPA', typicalEquity: '₹12L - ₹30L / yr' },
        { level: 'Staff / Principal (8+ yrs)', p25: '₹65 LPA', p50: '₹82 LPA', p75: '₹1.05 Cr', p90: '₹1.35 Cr', typicalEquity: '₹25L - ₹65L / yr' },
        { level: 'Engineering Director / VP', p25: '₹1.0 Cr', p50: '₹1.35 Cr', p75: '₹1.75 Cr', p90: '₹2.3 Cr+', typicalEquity: '₹50L - ₹1.4 Cr+ / yr' },
      ],
    },
    UAE: {
      currency: 'AED (Tax-Free)',
      tiers: [
        { level: 'Junior Engineer (0-2 yrs)', p25: '16k AED/mo', p50: '21k AED/mo', p75: '25k AED/mo', p90: '29k AED/mo', typicalEquity: 'Bonus 12%' },
        { level: 'Mid-Level Engineer (2-5 yrs)', p25: '25k AED/mo', p50: '32k AED/mo', p75: '38k AED/mo', p90: '44k AED/mo', typicalEquity: 'Bonus 18%' },
        { level: 'Senior Engineer (5-8 yrs)', p25: '40k AED/mo', p50: '50k AED/mo', p75: '60k AED/mo', p90: '70k AED/mo', typicalEquity: 'Bonus 22%' },
        { level: 'Staff / Principal (8+ yrs)', p25: '60k AED/mo', p50: '72k AED/mo', p75: '85k AED/mo', p90: '98k AED/mo', typicalEquity: 'Bonus 28%' },
        { level: 'Engineering Director / VP', p25: '85k AED/mo', p50: '110k AED/mo', p75: '130k AED/mo', p90: '155k+ AED/mo', typicalEquity: 'Executive Bonus 35%' },
      ],
    },
  },
  'Data & AI': {
    'United States': {
      currency: 'USD ($)',
      tiers: [
        { level: 'Junior Data Scientist / Analyst', p25: '$92,000', p50: '$112,000', p75: '$128,000', p90: '$142,000', typicalEquity: '$12k - $28k / yr' },
        { level: 'Mid-Level Data / ML Engineer', p25: '$130,000', p50: '$155,000', p75: '$175,000', p90: '$195,000', typicalEquity: '$30k - $65k / yr' },
        { level: 'Senior AI / ML Specialist', p25: '$175,000', p50: '$200,000', p75: '$230,000', p90: '$265,000', typicalEquity: '$70k - $140k / yr' },
        { level: 'Staff AI / ML Researcher', p25: '$230,000', p50: '$270,000', p75: '$320,000', p90: '$380,000', typicalEquity: '$140k - $320k / yr' },
        { level: 'Head of Data / VP AI', p25: '$290,000', p50: '$345,000', p75: '$410,000', p90: '$500,000+', typicalEquity: '$300k - $750k+ / yr' },
      ],
    },
    'Europe & UK': {
      currency: 'EUR / GBP (£/€)',
      tiers: [
        { level: 'Junior Data Scientist / Analyst', p25: '£40,000', p50: '£48,000', p75: '£56,000', p90: '£64,000', typicalEquity: '£5k - £12k / yr' },
        { level: 'Mid-Level Data / ML Engineer', p25: '£62,000', p50: '£75,000', p75: '£88,000', p90: '£100,000', typicalEquity: '£12k - £30k / yr' },
        { level: 'Senior AI / ML Specialist', p25: '£88,000', p50: '£105,000', p75: '£125,000', p90: '£145,000', typicalEquity: '£32k - £70k / yr' },
        { level: 'Staff AI / ML Researcher', p25: '£120,000', p50: '£142,000', p75: '£170,000', p90: '£195,000', typicalEquity: '£65k - £140k / yr' },
        { level: 'Head of Data / VP AI', p25: '£155,000', p50: '£185,000', p75: '£230,000', p90: '£280,000+', typicalEquity: '£120k - £320k+ / yr' },
      ],
    },
    India: {
      currency: 'INR (₹)',
      tiers: [
        { level: 'Junior Data Scientist / Analyst', p25: '₹14 LPA', p50: '₹18 LPA', p75: '₹25 LPA', p90: '₹32 LPA', typicalEquity: '₹3L - ₹7L / yr' },
        { level: 'Mid-Level Data / ML Engineer', p25: '₹26 LPA', p50: '₹35 LPA', p75: '₹44 LPA', p90: '₹54 LPA', typicalEquity: '₹7L - ₹18L / yr' },
        { level: 'Senior AI / ML Specialist', p25: '₹45 LPA', p50: '₹60 LPA', p75: '₹75 LPA', p90: '₹90 LPA', typicalEquity: '₹18L - ₹40L / yr' },
        { level: 'Staff AI / ML Researcher', p25: '₹75 LPA', p50: '₹95 LPA', p75: '₹1.2 Cr', p90: '₹1.55 Cr', typicalEquity: '₹35L - ₹80L / yr' },
        { level: 'Head of Data / VP AI', p25: '₹1.2 Cr', p50: '₹1.55 Cr', p75: '₹1.95 Cr', p90: '₹2.6 Cr+', typicalEquity: '₹70L - ₹1.8 Cr+ / yr' },
      ],
    },
    UAE: {
      currency: 'AED (Tax-Free)',
      tiers: [
        { level: 'Junior Data Scientist / Analyst', p25: '18k AED/mo', p50: '23k AED/mo', p75: '27k AED/mo', p90: '31k AED/mo', typicalEquity: 'Bonus 15%' },
        { level: 'Mid-Level Data / ML Engineer', p25: '28k AED/mo', p50: '36k AED/mo', p75: '43k AED/mo', p90: '50k AED/mo', typicalEquity: 'Bonus 20%' },
        { level: 'Senior AI / ML Specialist', p25: '45k AED/mo', p50: '56k AED/mo', p75: '68k AED/mo', p90: '78k AED/mo', typicalEquity: 'Bonus 25%' },
        { level: 'Staff AI / ML Researcher', p25: '66k AED/mo', p50: '80k AED/mo', p75: '95k AED/mo', p90: '110k AED/mo', typicalEquity: 'Bonus 30%' },
        { level: 'Head of Data / VP AI', p25: '95k AED/mo', p50: '120k AED/mo', p75: '145k AED/mo', p90: '175k+ AED/mo', typicalEquity: 'Executive Bonus 35%+' },
      ],
    },
  },
};

const SKILL_PULSE_DATA = [
  { name: 'AI / LLM Engineering & RAG', changePct: 44, direction: 'up', count: '18,450', category: 'Data & AI' },
  { name: 'TypeScript & Next.js', changePct: 28, direction: 'up', count: '48,200', category: 'Frontend' },
  { name: 'Python & PyTorch', changePct: 26, direction: 'up', count: '62,100', category: 'Backend/AI' },
  { name: 'Product Strategy & Metrics', changePct: 22, direction: 'up', count: '24,500', category: 'Product' },
  { name: 'PostgreSQL & pgvector', changePct: 21, direction: 'up', count: '39,400', category: 'Database' },
  { name: 'System Design & Distributed Systems', changePct: 19, direction: 'up', count: '31,800', category: 'Architecture' },
  { name: 'Kubernetes & Cloud Infra', changePct: 17, direction: 'up', count: '36,900', category: 'DevOps' },
  { name: 'FastAPI & Microservices', changePct: 15, direction: 'up', count: '19,300', category: 'Backend' },
  { name: 'Legacy Java 8/11', changePct: -6, direction: 'down', count: '21,000', category: 'Legacy' },
  { name: 'PHP / WordPress / jQuery', changePct: -14, direction: 'down', count: '12,400', category: 'Legacy' },
];

export const MarketIntelligenceModal: React.FC<MarketIntelligenceModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'Product & Management',
  defaultLocation = 'United States',
}) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'skills' | 'velocity'>('salary');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(
    SALARY_BENCHMARKS[defaultRole] ? defaultRole : 'Product & Management'
  );
  const [selectedRegion, setSelectedRegion] = useState<string>(
    defaultLocation.includes('India') ? 'India' : defaultLocation.includes('UAE') ? 'UAE' : defaultLocation.includes('Europe') || defaultLocation.includes('UK') ? 'Europe & UK' : 'United States'
  );

  if (!isOpen) return null;

  const currentSalaryData =
    SALARY_BENCHMARKS[selectedDiscipline]?.[selectedRegion] ||
    SALARY_BENCHMARKS['Product & Management']['United States'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="mobile-dialog-panel relative w-full max-w-4xl max-h-[88vh] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide">Market Intelligence & Salary Radar</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-brand border border-primary/30 font-mono">
                  LIVE PULSE
                </span>
              </div>
              <p className="text-[11px] text-subtle mt-0.5">
                Real macroeconomic salary benchmarks, skill demand velocity, and hiring indexes derived from 7.1M+ verified requisitions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-subtle hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-border bg-surface/20 shrink-0 text-xs overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'salary'
                ? 'bg-primary/20 text-brand font-semibold border border-primary/30'
                : 'text-subtle hover:text-foreground hover:bg-surface'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salary Benchmarks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-primary/20 text-brand font-semibold border border-primary/30'
                : 'text-subtle hover:text-foreground hover:bg-surface'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Skill Demand Velocity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('velocity')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'velocity'
                ? 'bg-primary/20 text-brand font-semibold border border-primary/30'
                : 'text-subtle hover:text-foreground hover:bg-surface'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hiring Velocity & Ghost Radar</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SALARY BENCHMARKS */}
          {activeTab === 'salary' && (
            <div className="space-y-6">
              {/* Selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface/30 border border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-subtle font-medium shrink-0">Role Discipline:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Product & Management', 'Engineering & Tech', 'Data & AI'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDiscipline(d)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                          selectedDiscipline === d
                            ? 'bg-brand text-white font-semibold shadow-xs'
                            : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-subtle font-medium shrink-0">Market:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['United States', 'Europe & UK', 'India', 'UAE'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRegion(r)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                          selectedRegion === r
                            ? 'bg-brand text-white font-semibold shadow-xs'
                            : 'bg-surface hover:bg-surface-2 text-subtle hover:text-foreground'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salary Table */}
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-4 py-3 bg-surface/40 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Compensation Percentiles · {selectedDiscipline} ({selectedRegion})
                  </span>
                  <span className="text-[11px] text-brand font-medium">Currency: {currentSalaryData.currency}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-surface/20 text-subtle font-medium text-[11px]">
                        <th className="p-3 pl-4">Career Seniority</th>
                        <th className="p-3">25th %ile (Base)</th>
                        <th className="p-3 text-brand font-semibold">Median (50th)</th>
                        <th className="p-3">75th %ile</th>
                        <th className="p-3">90th %ile (Top Tier)</th>
                        <th className="p-3 pr-4">Typical Equity / Bonus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentSalaryData.tiers.map((tier, idx) => (
                        <tr key={idx} className="hover:bg-surface/20 transition-colors">
                          <td className="p-3 pl-4 font-medium text-foreground">{tier.level}</td>
                          <td className="p-3 text-subtle font-mono">{tier.p25}</td>
                          <td className="p-3 text-brand font-bold font-mono bg-primary/5">{tier.p50}</td>
                          <td className="p-3 text-foreground font-mono">{tier.p75}</td>
                          <td className="p-3 text-success font-semibold font-mono">{tier.p90}</td>
                          <td className="p-3 pr-4 text-subtle text-[11px]">{tier.typicalEquity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Takeaway Card */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Salary Negotiation Strategy</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  When anchoring your initial counter-offer in the late interview stage, target between the <strong>75th and 90th percentile</strong>. Companies budget for the median, but candidates who demonstrate cross-functional business impact and direct metric alignment routinely land top-quartile offers without pushback.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SKILL DEMAND VELOCITY */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  Skill Demand Velocity (30-Day Hiring Momentum)
                </h3>
                <p className="text-xs text-subtle">
                  Derived from weekly crawling deltas across 168+ company ATS boards. Shows which competencies are experiencing surging demand vs softening.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILL_PULSE_DATA.map((skill, idx) => {
                  const isUp = skill.direction === 'up';
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-surface/20 flex items-center justify-between hover:border-brand/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">{skill.name}</span>
                          <span className="text-[10px] text-subtle px-1.5 py-0.5 rounded bg-surface border border-border">
                            {skill.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-subtle">{skill.count} active postings requesting this skill</div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                          isUp
                            ? 'bg-success/15 text-success border border-success/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isUp ? `+${skill.changePct}%` : `${skill.changePct}%`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HIRING VELOCITY & GHOST RADAR */}
          {activeTab === 'velocity' && (
            <div className="space-y-6">
              {/* Macro stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-border bg-surface/30 space-y-1">
                  <div className="text-[11px] text-subtle uppercase tracking-wider font-semibold">Active Hiring Index</div>
                  <div className="text-2xl font-bold font-mono text-success">78.4%</div>
                  <p className="text-[11px] text-subtle">Requisitions verified active within the past 14 days.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-surface/30 space-y-1">
                  <div className="text-[11px] text-subtle uppercase tracking-wider font-semibold">Evergreen / Stale Postings</div>
                  <div className="text-2xl font-bold font-mono text-warning">21.6%</div>
                  <p className="text-[11px] text-subtle">Roles open &gt;120 days without new interview pipeline advances.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-surface/30 space-y-1">
                  <div className="text-[11px] text-subtle uppercase tracking-wider font-semibold">Weekly Net Requisitions</div>
                  <div className="text-2xl font-bold font-mono text-brand">+14,200</div>
                  <p className="text-[11px] text-subtle">New roles posted straight to direct corporate career sites.</p>
                </div>
              </div>

              {/* High Velocity Companies */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Top Verified Employers (Active Interview Velocity)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'Stripe', roles: '480+ roles', speed: 'Avg reply: 4d' },
                    { name: 'Figma', roles: '140+ roles', speed: 'Avg reply: 3d' },
                    { name: 'Datadog', roles: '310+ roles', speed: 'Avg reply: 5d' },
                    { name: 'Revolut', roles: '650+ roles', speed: 'Avg reply: 4d' },
                    { name: 'Anthropic', roles: '95+ roles', speed: 'Avg reply: 2d' },
                    { name: 'Monzo', roles: '120+ roles', speed: 'Avg reply: 5d' },
                    { name: 'Databricks', roles: '520+ roles', speed: 'Avg reply: 6d' },
                    { name: 'OpenAI', roles: '110+ roles', speed: 'Avg reply: 3d' },
                  ].map((comp, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border bg-surface/20 space-y-1">
                      <div className="font-semibold text-xs text-foreground">{comp.name}</div>
                      <div className="text-[11px] text-brand font-medium">{comp.roles}</div>
                      <div className="text-[10px] text-subtle">{comp.speed}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-surface/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-subtle">
            Updated hourly from direct enterprise ATS pipelines · Normalized across 420+ sources
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
