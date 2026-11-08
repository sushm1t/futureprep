// @ts-nocheck -- ported with Job Studio design conventions
import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  CheckCircle2,
  Download,
  MessageSquareQuote,
  Send,
  Sparkles,
  User,
  Briefcase,
  Building2,
  Link2,
  Users,
  RotateCcw,
  Lightbulb,
  Share2,
  ExternalLink,
  GraduationCap,
  FileText,
  Linkedin,
  Target,
} from 'lucide-react';

export type ReferralRelationship = 'colleague' | 'linkedin' | 'alumni' | 'manager';

export interface ReferralMessageViewProps {
  candidateName?: string;
  companyName?: string;
  jobTitle?: string;
  candidateSkills?: string[];
  candidateSummary?: string;
  keyFactors?: string[];
  masterProfileText?: string;
  jobReqUrl?: string;
  onNavigateToEvaluator?: () => void;
}

interface RelationshipPreset {
  id: ReferralRelationship;
  label: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RELATIONSHIP_PRESETS: RelationshipPreset[] = [
  {
    id: 'colleague',
    label: 'Former Colleague / Friend',
    subtitle: 'Warm, direct, and high-trust',
    badge: 'Warm Outreach',
    icon: Users,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn / 2nd Degree',
    subtitle: 'Polite, professional & low-pressure',
    badge: 'Cold / 2nd Degree',
    icon: Briefcase,
  },
  {
    id: 'alumni',
    label: 'School / Alumni Network',
    subtitle: 'Shared alma mater or affinity group',
    badge: 'Affinity Match',
    icon: GraduationCap,
  },
  {
    id: 'manager',
    label: 'Hiring Manager Pitch',
    subtitle: 'Direct, value-first elevator pitch',
    badge: 'Direct Pitch',
    icon: Send,
  },
];

export const ReferralMessageView: React.FC<ReferralMessageViewProps> = ({
  candidateName = '',
  companyName = '',
  jobTitle = '',
  candidateSkills = [],
  candidateSummary = '',
  keyFactors = [],
  masterProfileText = '',
  jobReqUrl = '',
  onNavigateToEvaluator,
}) => {
  const [relationship, setRelationship] = useState<ReferralRelationship>('colleague');
  const [recipientName, setRecipientName] = useState<string>('Alex');
  const [targetCompany, setTargetCompany] = useState<string>(companyName || '');
  const [targetRole, setTargetRole] = useState<string>(jobTitle || '');
  const [reqUrl, setReqUrl] = useState<string>(jobReqUrl || '');
  const [sharedAffiliation, setSharedAffiliation] = useState<string>('our university alumni network');
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [copiedBlurb, setCopiedBlurb] = useState<boolean>(false);

  // Sync when props update from evaluation
  useEffect(() => {
    if (companyName) setTargetCompany(companyName);
  }, [companyName]);

  useEffect(() => {
    if (jobTitle) setTargetRole(jobTitle);
  }, [jobTitle]);

  useEffect(() => {
    if (jobReqUrl) setReqUrl(jobReqUrl);
  }, [jobReqUrl]);

  // Derive candidate name fallback
  const resolvedCandidateName = useMemo(() => {
    if (candidateName && candidateName.trim()) return candidateName.trim();
    // Try extract from masterProfileText
    const match = masterProfileText.match(/(?:### CANDIDATE:\s*|Name:\s*)([^\n]+)/i);
    if (match && match[1]) return match[1].trim();
    return 'Candidate';
  }, [candidateName, masterProfileText]);

  // Extract top highlights
  const topSkills = useMemo(() => {
    if (candidateSkills && candidateSkills.length > 0) {
      return candidateSkills.slice(0, 3);
    }
    if (keyFactors && keyFactors.length > 0) {
      return keyFactors.slice(0, 2);
    }
    return ['strategic execution', 'domain problem-solving', 'cross-functional collaboration'];
  }, [candidateSkills, keyFactors]);

  const skillsText = useMemo(() => {
    if (topSkills.length === 1) return topSkills[0];
    if (topSkills.length === 2) return `${topSkills[0]} and ${topSkills[1]}`;
    return `${topSkills.slice(0, -1).join(', ')}, and ${topSkills[topSkills.length - 1]}`;
  }, [topSkills]);

  const activeComp = targetCompany || 'the company';
  const activeRole = targetRole || 'the open position';
  const activeReq = reqUrl.trim() ? reqUrl.trim() : 'link in job posting';

  // Extract education / school from master profile if available
  const extractedSchool = useMemo(() => {
    if (!masterProfileText) return '';
    const match = masterProfileText.match(/(?:###\s*EDUCATION|EDUCATION:?)[^\n]*\n+([^\n]+)/i);
    if (!match || !match[1]) return '';
    const line = match[1];
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length >= 2) {
      return parts[1];
    }
    return line.replace(/^[-*•]\s*/, '').trim();
  }, [masterProfileText]);

  useEffect(() => {
    if (extractedSchool && sharedAffiliation === 'our university alumni network') {
      setSharedAffiliation(extractedSchool);
    }
  }, [extractedSchool]);

  // One-Click LinkedIn Deep Links
  const linkedinMutualsUrl = useMemo(() => {
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(activeComp)}&network=%5B%22S%22%5D`;
  }, [activeComp]);

  const linkedinAlumniUrl = useMemo(() => {
    const query = sharedAffiliation.trim() ? `${activeComp} ${sharedAffiliation.trim()}` : activeComp;
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
  }, [activeComp, sharedAffiliation]);

  const linkedinPeersUrl = useMemo(() => {
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(activeComp + ' ' + activeRole)}`;
  }, [activeComp, activeRole]);

  const linkedinRecruitersUrl = useMemo(() => {
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(activeComp + ' Recruiter OR Talent Acquisition')}`;
  }, [activeComp]);

  // Generate the forwardable blurb
  const forwardableBlurb = useMemo(() => {
    return [
      `Forwardable Referral Blurb for ${activeComp}:`,
      `• Candidate: ${resolvedCandidateName}`,
      `• Target Role: ${activeRole} at ${activeComp}`,
      reqUrl.trim() ? `• Job Link/Req: ${reqUrl.trim()}` : null,
      `• Background: Experienced professional specializing in ${skillsText}. Track record of driving high-impact deliverables and operational excellence.`,
      `• Resume: Tailored resume attached / available on request.`,
    ]
      .filter(Boolean)
      .join('\n');
  }, [activeComp, activeRole, resolvedCandidateName, reqUrl, skillsText]);

  // Generate template message
  const generatedTemplate = useMemo(() => {
    const contact = recipientName.trim() || 'Alex';

    if (relationship === 'colleague') {
      return {
        subject: `Quick question / ${activeRole} role at ${activeComp}!`,
        body: `Hey ${contact},

Hope you've been doing well! I saw that you're at ${activeComp} now — huge congratulations on everything the team has been shipping.

I'm actually applying for the ${activeRole} opening at ${activeComp} (${activeReq}). Given my recent work with ${skillsText}, I felt my background aligns closely with what the team is looking for.

Would you be open to submitting an internal referral for me?

To make it completely zero-effort on your end, I've put together a short forwardable blurb below that you can directly copy-paste into your internal referral portal (or forward to the hiring manager), along with my tailored resume:

----------------------------------------
${forwardableBlurb}
----------------------------------------

No pressure whatsoever if you're not able to refer directly, but either way I'd love to catch up soon!

Best,
${resolvedCandidateName}`,
      };
    }

    if (relationship === 'linkedin') {
      return {
        subject: `Re: ${activeRole} opening at ${activeComp} / Quick connection`,
        body: `Hi ${contact},

I hope your week is off to a great start! I came across your profile while researching the ${activeRole} role at ${activeComp} and was really impressed by the work your team is doing.

I have spent the past several years focusing on ${skillsText}, delivering measurable outcomes and scaling core initiatives. I am actively preparing an application for the ${activeRole} position (${activeReq}).

Would you be comfortable passing my resume along for an internal referral, or perhaps sharing a brief perspective on the team culture?

I've included a ready-to-forward summary below to make an internal submission as seamless and quick as possible:

----------------------------------------
${forwardableBlurb}
----------------------------------------

Thank you very much for your time and guidance!

Best regards,
${resolvedCandidateName}`,
      };
    }

    if (relationship === 'alumni') {
      return {
        subject: `Fellow ${sharedAffiliation} alum reaching out / ${activeRole} at ${activeComp}`,
        body: `Hi ${contact},

I hope you're doing well! I'm reaching out as a fellow member of ${sharedAffiliation} — it's always great to see alumni doing impactful work at ${activeComp}.

I am currently applying for the ${activeRole} position at ${activeComp} (${activeReq}). My background centers on ${skillsText}, and I'm very excited about the problems your team is solving.

If you have 5 minutes sometime this week, I'd greatly appreciate any advice you might have about the hiring process, or if you'd be open to submitting an internal referral. I've prepared a forwardable snapshot below to keep it quick and easy:

----------------------------------------
${forwardableBlurb}
----------------------------------------

Either way, thank you so much for your time and best wishes with your current projects!

Warmly,
${resolvedCandidateName}`,
      };
    }

    // Default: manager
    return {
      subject: `${activeRole} opening — ${resolvedCandidateName}'s background & impact`,
      body: `Hi ${contact},

I came across the ${activeRole} opening on your team at ${activeComp} (${activeReq}) and wanted to reach out directly.

With a strong focus on ${skillsText}, I've consistently helped teams accelerate roadmaps, optimize workflows, and deliver high-impact results. I reviewed the role priorities and believe I can step in and immediately add value.

I've tailored my application specifically for this opening and would love 10 minutes to discuss how my skill set can support your upcoming milestones.

Are you open to a brief chat sometime this week?

Best regards,
${resolvedCandidateName}

----------------------------------------
${forwardableBlurb}
----------------------------------------`,
    };
  }, [
    relationship,
    recipientName,
    activeComp,
    activeRole,
    activeReq,
    skillsText,
    forwardableBlurb,
    resolvedCandidateName,
    sharedAffiliation,
  ]);

  // Current display text (either custom user edits or freshly generated template)
  const currentMessageText = customMessage !== null ? customMessage : `${generatedTemplate.subject}\n\n${generatedTemplate.body}`;

  const wordCount = useMemo(() => {
    return currentMessageText.trim().split(/\s+/).filter(Boolean).length;
  }, [currentMessageText]);

  const charCount = currentMessageText.length;

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(currentMessageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyBlurbOnly = () => {
    navigator.clipboard.writeText(forwardableBlurb);
    setCopiedBlurb(true);
    setTimeout(() => setCopiedBlurb(false), 2000);
  };

  const handleDownloadTxt = () => {
    const filename = `Referral_Request_${(activeComp || 'Company').replace(/\s+/g, '_')}_${relationship}.txt`;
    const blob = new Blob([currentMessageText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetToTemplate = () => {
    setCustomMessage(null);
  };

  return (
    <div className="workspace-referral space-y-6 max-w-4xl mx-auto">
      {/* Landing-Inspired Action Header Card (Clean Context Banner) */}
      <div
        className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-elevated"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-brand/10 text-brand text-[11px] font-bold rounded-full px-3 py-0.5 uppercase tracking-widest flex items-center gap-1.5 font-mono border border-brand/20 shadow-2xs">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              REFERRAL REQUEST
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Internal Referral Outreach
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Targeting <strong className="text-foreground">{activeRole}</strong> at{' '}
            <strong className="text-foreground">{activeComp}</strong>. Referrals receive up to 4x higher interview rates than direct cold applications.
          </p>
        </div>
      </div>

      {/* UNIFIED OUTREACH SCENARIO & ONE-CLICK LINKEDIN FINDER */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs" data-testid="linkedin-finder-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center shrink-0">
              <Linkedin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  One-Click LinkedIn Connection Finder
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold">
                  Zero Scraping · 100% Safe
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select your outreach scenario below to calibrate message tone, and click any card to find targeted contacts at <strong className="text-foreground">{activeComp}</strong> inside your actual network.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Former Colleague / Friend */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              relationship === 'colleague'
                ? 'bg-surface-2/80 border-brand shadow-xs ring-1 ring-brand/40'
                : 'bg-surface hover:bg-surface-2 border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRelationship('colleague');
                setCustomMessage(null);
              }}
              className="text-left w-full cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  relationship === 'colleague' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                  relationship === 'colleague' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  Warm Outreach
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Former Colleague / Friend</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  Warm, direct, and high-trust
                </p>
              </div>
            </button>
            <div className="pt-2 border-t border-border/60">
              <a
                href={linkedinMutualsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="linkedin-search-mutuals"
                className="inline-flex items-center justify-between w-full text-[11px] font-semibold text-brand hover:text-[#0077B5] transition-colors group cursor-pointer"
                title={`Find 2nd-degree mutual connections at ${activeComp} on LinkedIn`}
              >
                <span>Find Mutuals on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-[#0077B5] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 2: LinkedIn / 2nd Degree */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              relationship === 'linkedin'
                ? 'bg-surface-2/80 border-brand shadow-xs ring-1 ring-brand/40'
                : 'bg-surface hover:bg-surface-2 border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRelationship('linkedin');
                setCustomMessage(null);
              }}
              className="text-left w-full cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  relationship === 'linkedin' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                  relationship === 'linkedin' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  Cold / 2nd Degree
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">LinkedIn / 2nd Degree</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  Polite, professional &amp; low-pressure
                </p>
              </div>
            </button>
            <div className="pt-2 border-t border-border/60">
              <a
                href={linkedinMutualsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full text-[11px] font-semibold text-brand hover:text-[#0077B5] transition-colors group cursor-pointer"
                title={`Find 2nd-degree connections at ${activeComp} on LinkedIn`}
              >
                <span>Find 2nd-Degree Network</span>
                <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-[#0077B5] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 3: School / Alumni Network */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              relationship === 'alumni'
                ? 'bg-surface-2/80 border-brand shadow-xs ring-1 ring-brand/40'
                : 'bg-surface hover:bg-surface-2 border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRelationship('alumni');
                setCustomMessage(null);
              }}
              className="text-left w-full cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  relationship === 'alumni' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                  relationship === 'alumni' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  Affinity Match
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">School / Alumni Network</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  Shared alma mater or affinity group
                </p>
              </div>
            </button>
            <div className="pt-2 border-t border-border/60">
              <a
                href={linkedinAlumniUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="linkedin-search-alumni"
                className="inline-flex items-center justify-between w-full text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition-colors group cursor-pointer"
                title={`Find alumni at ${activeComp} on LinkedIn`}
              >
                <span className="truncate">School Alumni at {activeComp}</span>
                <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>
          </div>

          {/* Card 4: Hiring Manager Pitch */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              relationship === 'manager'
                ? 'bg-surface-2/80 border-brand shadow-xs ring-1 ring-brand/40'
                : 'bg-surface hover:bg-surface-2 border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRelationship('manager');
                setCustomMessage(null);
              }}
              className="text-left w-full cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  relationship === 'manager' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                  relationship === 'manager' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-subtle'
                }`}>
                  Direct Pitch
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Hiring Manager Pitch</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  Direct, value-first elevator pitch
                </p>
              </div>
            </button>
            <div className="pt-2 border-t border-border/60 space-y-1">
              <a
                href={linkedinPeersUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="linkedin-search-peers"
                className="inline-flex items-center justify-between w-full text-[11px] font-semibold text-brand hover:text-[#0077B5] transition-colors group cursor-pointer"
                title={`Find ${activeRole} peers and team leads at ${activeComp} on LinkedIn`}
              >
                <span className="truncate">{activeRole} Peers &amp; Leads</span>
                <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-[#0077B5] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
              <a
                href={linkedinRecruitersUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="linkedin-search-recruiters"
                className="inline-flex items-center justify-between w-full text-[10px] font-semibold text-purple-400 hover:text-purple-300 transition-colors group cursor-pointer"
                title={`Find recruiters and talent partners at ${activeComp} on LinkedIn`}
              >
                <span className="truncate">Recruiters &amp; Talent Partners</span>
                <ExternalLink className="w-3 h-3 text-subtle group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Bar: Recipient Name, Company, Job Link */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
          Message Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-subtle block mb-1">
              Recipient Name:
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  setCustomMessage(null);
                }}
                placeholder="e.g. Alex"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border focus:border-brand rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-subtle block mb-1">
              Company Name:
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => {
                  setTargetCompany(e.target.value);
                  setCustomMessage(null);
                }}
                placeholder="e.g. Figma"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border focus:border-brand rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-subtle block mb-1">
              Job Req # or Link (Optional):
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={reqUrl}
                onChange={(e) => {
                  setReqUrl(e.target.value);
                  setCustomMessage(null);
                }}
                placeholder="e.g. #REQ-4521 or career URL"
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border focus:border-brand rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {relationship === 'alumni' && (
          <div className="pt-2 border-t border-border">
            <label className="text-[11px] font-medium text-subtle block mb-1">
              Shared University, BootCamp, or Community:
            </label>
            <input
              type="text"
              value={sharedAffiliation}
              onChange={(e) => {
                setSharedAffiliation(e.target.value);
                setCustomMessage(null);
              }}
              placeholder="e.g. Stanford University or UCLA Design Alumni"
              className="w-full px-3 py-2 bg-surface border border-border focus:border-brand rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Forwardable Blurb Card (High-Utility Feature) */}
      <div className="p-4 sm:p-5 bg-brand/5 border border-brand/20 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-brand" />
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              One-Click Forwardable Referral Blurb
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyBlurbOnly}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-full transition-all cursor-pointer self-start sm:self-auto"
          >
            {copiedBlurb ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Blurb Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Blurb Only</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Employees are busy. Providing this ready-to-paste blurb means your referrer doesn&apos;t have to write a single sentence to submit you into Workday, Greenhouse, or Slack.
        </p>
        <div className="p-3 bg-card border border-border rounded-xl text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap selection:bg-brand/20">
          {forwardableBlurb}
        </div>
      </div>

      {/* Message Editor / Preview Area */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
              Message Preview &amp; Editor
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-subtle">
            <span>
              {wordCount} words · {charCount} chars
            </span>
            {customMessage !== null && (
              <button
                type="button"
                onClick={handleResetToTemplate}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline cursor-pointer"
                title="Reset edits to generated template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to template</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          value={currentMessageText}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={14}
          className="w-full p-4 bg-surface focus:bg-card border border-border focus:border-brand rounded-xl text-xs sm:text-sm text-foreground font-mono leading-relaxed focus:outline-none transition-all resize-y"
          placeholder="Your referral outreach message..."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Tip: Send this via LinkedIn Message, InMail, or direct corporate email.
          </span>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyFullMessage}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-medium text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full transition-all cursor-pointer text-xs"
              title="Copy entire message to clipboard"
            >
              {copiedMessage ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span className="text-success font-semibold">Copied Message</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-subtle" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all cursor-pointer text-xs shadow-xs"
              title="Export as text file"
            >
              <Download className="w-3.5 h-3.5 text-primary-foreground" />
              <span>Export .txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Best-Practice Referral Guidelines */}
      <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border space-y-3">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-brand" />
          Referral Best Practices for Maximum Response Rate
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="space-y-1 p-3 bg-card rounded-xl border border-border/80">
            <strong className="text-foreground block font-medium">1. Zero-Effort Forwarding</strong>
            <p className="text-[11px] leading-relaxed">
              Always provide the job requisition ID/URL and the 2-sentence blurb so they can refer you with a single click.
            </p>
          </div>
          <div className="space-y-1 p-3 bg-card rounded-xl border border-border/80">
            <strong className="text-foreground block font-medium">2. Give Them an Easy Out</strong>
            <p className="text-[11px] leading-relaxed">
              Phrases like &ldquo;No worries at all if you can&rsquo;t refer directly&rdquo; reduce social friction and actually increase reply rates.
            </p>
          </div>
          <div className="space-y-1 p-3 bg-card rounded-xl border border-border/80">
            <strong className="text-foreground block font-medium">3. Best Send Timing</strong>
            <p className="text-[11px] leading-relaxed">
              Outreach sent on Tuesday or Wednesday mornings (9:00 AM – 10:30 AM recipient time) gets 2.5x more responses than weekends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

