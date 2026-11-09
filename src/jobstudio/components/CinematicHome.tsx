// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowRight, ArrowDown, Search, MapPin, Sparkles, CheckCircle2, XCircle, FileText, MessageSquare,
  Briefcase, Zap, ShieldCheck, ChevronDown, Target, Globe, Clock,
} from 'lucide-react';

/**
 * Cinematic landing story shown above the existing home content.
 * Everything here is ILLUSTRATIVE sample data (clearly labelled) — it never
 * reads or writes user data. CTAs only call the existing onNavigateToTab.
 */

gsap.registerPlugin(ScrollTrigger);

const JOBS = [
  { t: 'Senior Operations Analyst', c: 'Stripe', l: 'Dublin · Hybrid', s: 94 },
  { t: 'Fintech Operations & Payments Lead', c: 'Revolut', l: 'London · Remote', s: 91 },
  { t: 'Product Operations Specialist', c: 'Linear', l: 'Remote · EU', s: 87 },
  { t: 'Business Systems & Operations Lead', c: 'Notion', l: 'Remote · Global', s: 76 },
  { t: 'Global Merchant Operations Manager', c: 'Klarna', l: 'Stockholm · Remote', s: 62 },
];
const MATCH = ['SQL', 'Financial Modeling', 'Cross-Border Payments', 'SLA Operations', 'Process Automation', 'Looker'];
const MISS = ['Python (Data Pipelines)', 'Regulatory Compliance Auditing'];
const POSTED = ['2h ago', '5h ago', '1d ago', '2d ago'];
const QUESTIONS = [
  { k: 'Technical', q: 'How do you audit and reconcile anomalous payment settlement exceptions across multi-currency ledgers?' },
  { k: 'Behavioural', q: 'Describe a time you handled a critical payment gateway outage impacting high-volume merchants.' },
  { k: 'System Design', q: 'How would you partition automated dispute workflows to scale from 1,000 to 50,000 cases per week?' },
  { k: 'Role-specific', q: 'Which latency thresholds and reliability SLAs would you establish in your first 30 days?' },
];

function Window({ title, children, className = '' }) {
  return (
    <div className={`cine-window ${className}`}>
      <div className="cine-window-bar">
        <span className="cine-dot" /><span className="cine-dot" /><span className="cine-dot" />
        <span className="ml-3 text-[11px] font-mono text-subtle truncate">{title}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function SceneCopy({ idx, eyebrow, title, steps, cta, onCta }) {
  return (
    <div className="cine-copy">
      <div className="cine-eyebrow"><span className="font-mono">0{idx}</span> {eyebrow}</div>
      <h2 className="cine-h2">{title}</h2>
      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="cine-step" data-step={i}>
            <span className="cine-step-bar"><span className="cine-step-fill" /></span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <button onClick={onCta} className="cine-link mt-9">{cta} <ArrowRight className="w-4 h-4" /></button>
    </div>
  );
}

export const CinematicHome: React.FC<{ onNavigateToTab: (t: string) => void }> = ({ onNavigateToTab }) => {
  const root = useRef<HTMLDivElement>(null);
  const [showFloatingSkip, setShowFloatingSkip] = useState(false);
  const [activeChapter, setActiveChapter] = useState('');

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const handleScroll = () => {
      setShowFloatingSkip(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.classList.add('cine-static'); return; }

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.0,
      syncTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Top global scroll progress bar across the entire landing story
      gsap.to('.cine-progress-bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      });

      // Active chapter detector for floating HUD
      const chapters = [
        { sel: '.cine-s1', label: '01 Discover · Live Job Feed' },
        { sel: '.cine-s2', label: '02 Match · 82% Fit Score' },
        { sel: '.cine-s3', label: '03 Tailor · ATS Calibration' },
        { sel: '.cine-s4', label: '04 Prepare · STAR Intelligence' },
        { sel: '.cine-track', label: '05 Track · Pipeline Kanban' },
      ];

      chapters.forEach(({ sel, label }) => {
        ScrollTrigger.create({
          trigger: sel,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => setActiveChapter(label),
          onEnterBack: () => setActiveChapter(label),
        });
      });

      ScrollTrigger.create({
        trigger: '.cine-hero',
        start: 'top top',
        end: 'bottom 50%',
        onEnterBack: () => setActiveChapter(''),
      });

      // ---------- Hero entrance ----------
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from('.cine-hero-word', { yPercent: 110, opacity: 0, duration: 1.3, stagger: 0.06 })
        .from('.cine-hero-sub, .cine-hero-ctas', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.9')
        .from('.cine-hero-stage', { y: 80, opacity: 0, scale: 0.94, duration: 1.6 }, '-=0.9')
        .from('.cine-float', { y: 40, opacity: 0, duration: 1, stagger: 0.12 }, '-=1.1')
        .from('.cine-hero-row', { x: -16, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.8');

      // typing search
      const q = el.querySelector('.cine-typed');
      if (q) {
        const full = q.getAttribute('data-text');
        const o = { n: 0 };
        gsap.to(o, { n: full.length, duration: 1.6, delay: 1.1, ease: 'none', onUpdate: () => { q.textContent = full.slice(0, Math.round(o.n)); } });
      }

      // hero parallax out
      gsap.to('.cine-hero-stage', { yPercent: -12, scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.cine-hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.cine-hero-copy', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.cine-hero', start: 'top top', end: '60% top', scrub: true } });
      gsap.to('.cine-planet', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.cine-hero', start: 'top top', end: 'bottom top', scrub: true } });

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const pinStart = (trigger) => () => trigger.getBoundingClientRect().height > window.innerHeight ? 'bottom bottom' : 'top top';
        const scene = (sel, build, stepCount = 4) => {
          const trigger = el.querySelector(sel);
          // Human-readable scroll pacing: ~450px of scroll per step with reading plateaus
          const dynamicDistance = Math.max(1800, window.innerHeight * (stepCount * 0.55));
          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger,
              start: pinStart(trigger),
              end: () => `+=${dynamicDistance}`,
              scrub: 0.35,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          const steps = gsap.utils.toArray(`${sel} .cine-step`);
          build(tl, steps);
          return tl;
        };
        const lightStep = (tl, steps, i, at, hold = 1.0) => {
          tl.to(
            steps[i],
            {
              opacity: 1,
              duration: 0.35,
              onStart: () => {
                steps.forEach((s, idx) => {
                  if (idx === i) s.classList.add('is-active');
                  else s.classList.remove('is-active');
                });
              },
              onReverseComplete: () => {
                if (i > 0) {
                  steps[i].classList.remove('is-active');
                  steps[i - 1].classList.add('is-active');
                } else {
                  steps[i].classList.remove('is-active');
                }
              },
            },
            at
          ).fromTo(
            steps[i].querySelector('.cine-step-fill'),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5 + hold },
            at
          );
        };

        gsap.set(['.cine-s2 .cine-ring', '.cine-s4 .cine-prog-ring'], { strokeDashoffset: 100 });
        el.querySelector('.cine-s2 .cine-count').textContent = '0';
        el.querySelector('.cine-s4 .cine-prog').textContent = '0%';

        // Scene 1 — discover (4 steps)
        scene('.cine-s1', (tl, st) => {
          lightStep(tl, st, 0, 0, 1.0);
          tl.from('.cine-s1 .cine-chip', { y: 20, opacity: 0, stagger: 0.12, duration: 0.5 }, 0);

          lightStep(tl, st, 1, 1.6, 1.0);
          tl.from('.cine-s1 .cine-job', { y: 35, opacity: 0, stagger: 0.18, duration: 0.6 }, 1.6);

          lightStep(tl, st, 2, 3.2, 1.0);
          tl.to('.cine-s1 .cine-job.is-top', { borderColor: 'var(--brand)', backgroundColor: 'oklch(0.8 0.11 240 / 12%)', duration: 0.5 }, 3.2)
            .to('.cine-s1 .cine-job:not(.is-top)', { opacity: 0.35, duration: 0.5 }, 3.2);

          lightStep(tl, st, 3, 4.8, 1.2);
          tl.from('.cine-s1 .cine-bar-fill', { scaleX: 0, stagger: 0.1, duration: 0.6 }, 4.8)
            .from('.cine-s1 .cine-score', { opacity: 0, x: 10, stagger: 0.1, duration: 0.4 }, 5.0);
        }, 4);

        // Scene 2 — matching (5 steps)
        scene('.cine-s2', (tl, st) => {
          lightStep(tl, st, 0, 0, 0.9);
          tl.from('.cine-s2 .cine-resume-line', { opacity: 0, x: -18, stagger: 0.08, duration: 0.45 }, 0);

          lightStep(tl, st, 1, 1.4, 0.9);
          tl.from('.cine-s2 .cine-req', { opacity: 0, x: 18, stagger: 0.08, duration: 0.45 }, 1.4);

          lightStep(tl, st, 2, 2.8, 0.9);
          tl.to('.cine-s2 .cine-req.is-match', { backgroundColor: 'oklch(0.78 0.16 155 / 14%)', borderColor: 'var(--success)', color: 'var(--success)', stagger: 0.1, duration: 0.4 }, 2.8)
            .from('.cine-s2 .cine-req.is-match .cine-ic', { scale: 0, stagger: 0.1, duration: 0.4 }, 2.8);

          lightStep(tl, st, 3, 4.2, 0.9);
          tl.to('.cine-s2 .cine-req.is-miss', { backgroundColor: 'oklch(0.7 0.19 22 / 14%)', borderColor: 'var(--danger)', color: 'var(--danger)', duration: 0.4, stagger: 0.12 }, 4.2)
            .from('.cine-s2 .cine-req.is-miss .cine-ic', { scale: 0, duration: 0.4 }, 4.2);

          lightStep(tl, st, 4, 5.6, 1.4);
          const n = el.querySelector('.cine-s2 .cine-count'); const o = { v: 0 };
          tl.to('.cine-s2 .cine-ring', { strokeDashoffset: 100 - 82, duration: 1.0, ease: 'power3.out' }, 5.6)
            .to(o, { v: 82, duration: 1.0, ease: 'power3.out', onUpdate: () => { if (n) n.textContent = String(Math.round(o.v)); } }, 5.6)
            .from('.cine-s2 .cine-verdict', { opacity: 0, y: 10, duration: 0.4 }, 6.2);
        }, 5);

        // Scene 3 — resume transformation (4 steps)
        scene('.cine-s3', (tl, st) => {
          lightStep(tl, st, 0, 0, 1.0);
          tl.from('.cine-s3 .cine-doc', { opacity: 0, y: 35, rotate: -1.5, duration: 0.6 }, 0);

          lightStep(tl, st, 1, 1.6, 1.0);
          tl.to('.cine-s3 .cine-scan', { top: '100%', duration: 1.0, ease: 'none' }, 1.6)
            .from('.cine-s3 .cine-kw', { opacity: 0, scale: 0.8, stagger: 0.08, duration: 0.35 }, 1.8);

          lightStep(tl, st, 2, 3.2, 1.0);
          tl.from('.cine-s3 .cine-tip', { opacity: 0, x: 25, stagger: 0.12, duration: 0.5 }, 3.2);

          lightStep(tl, st, 3, 4.8, 1.3);
          tl.to('.cine-s3 .cine-old', { opacity: 0, y: -6, stagger: 0.08, duration: 0.35 }, 4.8)
            .fromTo('.cine-s3 .cine-new', { opacity: 0, y: 6 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.45 }, 4.9)
            .to('.cine-s3 .cine-ats-fill', { scaleX: 0.96, duration: 0.8, ease: 'power3.out' }, 5.0)
            .from('.cine-s3 .cine-ats-badge', { opacity: 0, scale: 0.8, duration: 0.35 }, 5.6);
        }, 4);

        // Scene 4 — interview prep (4 steps)
        scene('.cine-s4', (tl, st) => {
          lightStep(tl, st, 0, 0, 1.0);
          tl.from('.cine-s4 .cine-q', { opacity: 0, y: 35, rotateX: -20, stagger: 0.15, duration: 0.6, transformOrigin: 'top center' }, 0);

          lightStep(tl, st, 1, 1.6, 1.0);
          tl.from('.cine-s4 .cine-tag', { opacity: 0, scale: 0.7, stagger: 0.08, duration: 0.35 }, 1.6);

          lightStep(tl, st, 2, 3.2, 1.0);
          tl.from('.cine-s4 .cine-star-fill', { scaleX: 0, stagger: 0.15, duration: 0.5 }, 3.2);

          lightStep(tl, st, 3, 4.8, 1.2);
          const n = el.querySelector('.cine-s4 .cine-prog'); const o = { v: 0 };
          tl.to('.cine-s4 .cine-prog-ring', { strokeDashoffset: 100 - 75, duration: 0.9, ease: 'power3.out' }, 4.8)
            .to(o, { v: 75, duration: 0.9, onUpdate: () => { if (n) n.textContent = `${Math.round(o.v)}%`; } }, 4.8);
        }, 4);

        // Tracking — kanban cards slide across with scroll
        gsap.timeline({
          scrollTrigger: {
            trigger: '.cine-track',
            start: pinStart(el.querySelector('.cine-track')),
            end: () => `+=${Math.max(1200, window.innerHeight * 1.4)}`,
            scrub: 0.35,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
          .from('.cine-col', { opacity: 0, y: 40, stagger: 0.15, duration: 0.6 })
          .to('.cine-move-a', { x: () => { const cols = el.querySelectorAll('.cine-col'); return cols[1].getBoundingClientRect().left - cols[0].getBoundingClientRect().left; }, duration: 1 }, '+=0.4')
          .to('.cine-move-b', { x: () => { const cols = el.querySelectorAll('.cine-col'); return cols[2].getBoundingClientRect().left - cols[0].getBoundingClientRect().left; }, duration: 1.2 }, '<0.3')
          .to('.cine-move-b', { borderColor: 'var(--success)', duration: 0.3 });
      });

      // Section headline reveals (all sizes)
      gsap.utils.toArray('.cine-reveal').forEach((h) => {
        gsap.from(h, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
      });
    }, el);

    // subtle pointer parallax on hero layers
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      gsap.to('.cine-float', { x: x * 18, y: y * 14, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    };
    window.addEventListener('pointermove', onMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', onMove);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const handleScrollToPricing = () => {
    const pricingEl = document.getElementById('landing-pricing');
    if (pricingEl) {
      pricingEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigateToTab('pricing');
    }
  };

  const headline = ['Your', 'next', 'role,', 'found', 'and', 'scored', 'by', 'AI.'];

  return (
    <div ref={root} className="cine">
      {/* Top Global Scroll Progress Bar */}
      <div className="cine-progress-bar" aria-hidden />

      {/* Floating Story Chapter Indicator */}
      {activeChapter && (
        <div className="cine-chapter-hud animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="cine-chapter-dot" />
          <span>{activeChapter}</span>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="cine-hero">
        <div className="cine-planet" aria-hidden />
        <div className="cine-hero-copy relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="cine-eyebrow justify-center mb-6"><Sparkles className="w-3.5 h-3.5" /> LIVE RECRUITING INTELLIGENCE</div>
          <h1 className="cine-h1">
            {headline.map((w, i) => (
              <React.Fragment key={i}><span className="cine-mask"><span className={`cine-hero-word ${w === 'AI.' ? 'cine-grad' : ''}`}>{w}</span></span>{' '}</React.Fragment>
            ))}
          </h1>
          <p className="cine-hero-sub mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Job Studio searches live job boards, scores every role against your real experience, rewrites your resume for each one and gets you ready for the interview.
          </p>
          <div className="cine-hero-ctas mt-9 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => onNavigateToTab('auth')} className="cine-btn-primary">Start searching jobs <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Product composition */}
        <div className="cine-hero-stage relative z-10 mt-16 sm:mt-20 max-w-5xl mx-auto px-4">
          <Window title="jobstudio.app / evaluator">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <Search className="w-4 h-4 text-subtle" />
              <span className="text-sm text-foreground"><span className="cine-typed" data-text="Operations analyst · fintech · remote EU" /><span className="cine-caret" /></span>
              <span className="ml-auto hidden sm:inline text-[11px] font-mono text-subtle">Greenhouse · Lever · Ashby</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
              <div className="space-y-2">
                {JOBS.slice(0, 4).map((j, i) => (
                  <div key={i} className={`cine-hero-row flex items-center gap-3 rounded-xl border px-3.5 py-3 ${i === 0 ? 'border-brand/40 bg-brand/10' : 'border-border bg-surface/60'}`}>
                    <div className="w-8 h-8 rounded-lg bg-surface-2 grid place-items-center text-xs font-semibold">{j.c[0]}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{j.t}</div>
                      <div className="text-[11px] text-subtle">{j.c} · {j.l}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {i === 0 && <span className="text-[10px] font-medium text-success border border-success/30 rounded-full px-2 py-0.5">New</span>}
                      <span className="hidden sm:inline text-[11px] font-mono text-subtle">{POSTED[i]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:flex flex-col justify-center gap-4 rounded-xl border border-border bg-surface/60 p-4">
                <div>
                  <div className="text-2xl font-semibold">5 ATS</div>
                  <div className="text-[11px] uppercase tracking-widest text-subtle">Platforms searched</div>
                </div>
                <div className="h-px w-full bg-border" />
                <div>
                  <div className="text-2xl font-semibold">Live</div>
                  <div className="text-[11px] uppercase tracking-widest text-subtle">Fetched when you search</div>
                </div>
              </div>
            </div>
          </Window>
          <div className="cine-float cine-float-a hidden sm:flex"><Globe className="w-4 h-4 text-brand" /> Live from company job boards</div>
          <div className="cine-float cine-float-b hidden sm:flex"><ShieldCheck className="w-4 h-4 text-brand" /> AUTHENTIC RESUME GROUNDING</div>
        </div>
        <a href="#cine-story" className="cine-scroll-pill" aria-label="Scroll to explore interactive story">
          <span className="cine-scroll-mouse"><span className="cine-scroll-wheel" /></span>
          <span className="cine-scroll-label">Scroll to explore</span>
          <ChevronDown className="w-3.5 h-3.5 cine-scroll-arrow" />
        </a>
      </section>

      <div id="cine-story" className="cine-intro cine-reveal">
        <p className="cine-kicker">From search to signed offer</p>
        <h2 className="cine-display">One workspace. Four moves.<br /><span className="text-subtle">Watch it work.</span></h2>
      </div>

      {/* ================= SCENE 1 ================= */}
      <section className="cine-scene cine-s1">
        <SceneCopy idx={1} eyebrow="Discover" title="Every live role, read for you."
          steps={['Set what you want', 'Live jobs from company boards', 'The right ones rise to the top', 'Every role gets a match score']}
          cta="Open the Job Evaluator" onCta={() => onNavigateToTab('evaluator')} />
        <div className="relative">
          <div className="cine-ambient-glow cine-glow-blue" aria-hidden />
          <Window title="Live job search" className="cine-stage">
            <div className="flex flex-wrap gap-2">
              {[[Briefcase, 'Operations Analyst'], [MapPin, 'Remote · EU'], [Zap, 'Fintech'], [Target, 'Mid–Senior']].map(([I, t], i) => (
                <span key={i} className="cine-chip"><I className="w-3.5 h-3.5" />{t}</span>
              ))}
            </div>
            <div className="mt-5 space-y-2.5">
              {JOBS.map((j, i) => (
                <div key={i} className={`cine-job ${i < 2 ? 'is-top' : ''}`}>
                  <div className="w-9 h-9 rounded-lg bg-surface-2 grid place-items-center text-xs font-semibold">{j.c[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{j.t}</div>
                    <div className="text-[11px] text-subtle">{j.c} · {j.l}</div>
                  </div>
                  <div className="w-24 hidden sm:block"><div className="cine-bar"><div className="cine-bar-fill" style={{ width: `${j.s}%` }} /></div></div>
                  <div className={`cine-score w-10 text-right text-xs font-mono ${j.s > 80 ? 'text-success' : 'text-muted-foreground'}`}>{j.s}%</div>
                </div>
              ))}
            </div>
          </Window>
        </div>
      </section>

      {/* ================= SCENE 2 ================= */}
      <section className="cine-scene cine-s2">
        <SceneCopy idx={2} eyebrow="Match" title="Know if it's worth applying before you apply."
          steps={['Reads your real experience', 'Pulls out what the job needs', 'Shows the skills you have', 'Flags what you are missing', 'Gives a clear match score']}
          cta="Score a job now" onCta={() => onNavigateToTab('evaluator')} />
        <div className="relative">
          <div className="cine-ambient-glow cine-glow-emerald" aria-hidden />
          <Window title="Match analysis · Stripe · Senior Operations Analyst" className="cine-stage">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_150px] gap-4 items-start">
              <div>
                <div className="cine-label">Your resume</div>
                {['5+ years in fintech operations', 'Financial modeling & SQL analytics', 'Cross-border payment flows', 'Cross-functional stakeholder coordination', 'Incident & SLA management'].map((t, i) => (
                  <div key={i} className="cine-resume-line">{t}</div>
                ))}
              </div>
              <div>
                <div className="cine-label">Job needs</div>
                <div className="flex flex-wrap gap-2">
                  {MATCH.map((m) => <span key={m} className="cine-req is-match"><CheckCircle2 className="cine-ic w-3.5 h-3.5" />{m}</span>)}
                  {MISS.map((m) => <span key={m} className="cine-req is-miss"><XCircle className="cine-ic w-3.5 h-3.5" />{m}</span>)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" pathLength="100" className="cine-ring-bg" />
                    <circle cx="18" cy="18" r="15.9" pathLength="100" className="cine-ring-fg cine-ring" strokeDasharray="100" strokeDashoffset="18" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-3xl font-semibold"><span className="cine-count">82</span></div>
                </div>
                <div className="cine-verdict mt-3 text-xs text-success font-medium">Apply · close 2 gaps</div>
              </div>
            </div>
          </Window>
        </div>
      </section>

      {/* ================= SCENE 3 ================= */}
      <section className="cine-scene cine-s3">
        <SceneCopy idx={3} eyebrow="Tailor" title="Your resume, rewritten for this exact job."
          steps={['Starts from your real resume', 'Reads the job description', 'Suggests honest improvements', 'Builds a one-page resume ready for ATS checks']}
          cta="Tailor my resume" onCta={() => onNavigateToTab('resume')} />
        <div className="relative">
          <div className="cine-ambient-glow cine-glow-violet" aria-hidden />
          <div className="cine-stage grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-4">
            <div className="cine-doc paper relative overflow-hidden">
              <div className="cine-scan" aria-hidden />
              <div className="text-[13px] font-bold tracking-wide">ALEX RIVERA</div>
              <div className="text-[10px] opacity-60 mb-3">Senior Product &amp; Operations Lead · Fintech &amp; Payments</div>
              <div className="text-[10px] font-semibold tracking-widest opacity-70 mb-1.5">EXPERIENCE</div>
              {[
                ['Handled payment reconciliation and queries.', 'Reduced payment settlement reconciliation latency by 42% across EMEA cross-border corridors.'],
                ['Created operational dashboards in SQL.', 'Built automated Looker/SQL dashboards monitoring $120M+ monthly merchant volume and SLA adherence.'],
                ['Coordinated payment exception handling.', 'Redesigned cross-border dispute workflows, cutting chargeback resolution times from 5 days to 18 hours.'],
              ].map(([o, n], i) => (
                <div key={i} className="relative min-h-[34px] text-[11px] leading-snug mb-1.5 pl-3">
                  <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-current opacity-60" />
                  <span className="cine-old absolute inset-0 pl-3">{o}</span>
                  <span className="cine-new block opacity-0">{n}</span>
                </div>
              ))}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['SQL', 'Cross-Border Payments', 'Financial Modeling', 'SLA Operations', 'Process Automation'].map((k) => <span key={k} className="cine-kw">{k}</span>)}
              </div>
            </div>
            <div className="space-y-3">
              <div className="cine-window p-4">
                <div className="cine-label">ATS check</div>
                <div className="cine-bar h-2"><div className="cine-ats-fill" /></div>
                <div className="cine-ats-badge mt-3 inline-flex items-center gap-1.5 text-xs text-success"><ShieldCheck className="w-3.5 h-3.5" /> 98 / 100 · 1 page</div>
              </div>
              {['Quantify payment volume & scale', 'Highlight automated SLA workflows', 'Put operational impact first'].map((t, i) => (
                <div key={i} className="cine-tip"><Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCENE 4 ================= */}
      <section className="cine-scene cine-s4">
        <SceneCopy idx={4} eyebrow="Prepare" title="Walk in ready for every tough question."
          steps={['Targeted questions modeled on this role', 'Behavioural and technical scenarios, sorted', 'Answers laid out in STAR format', 'Track how ready you are']}
          cta="Practise interviews" onCta={() => onNavigateToTab('screening')} />
        <div className="relative">
          <div className="cine-ambient-glow cine-glow-amber" aria-hidden />
          <Window title="Interview prep · Stripe" className="cine-stage">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
              <div className="space-y-2.5 [perspective:800px]">
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="cine-q">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`cine-tag ${q.k === 'Technical' ? 'text-info border-info/30' : q.k === 'Role-specific' ? 'text-warning border-warning/30' : 'text-brand border-brand/30'}`}>{q.k}</span>
                      <MessageSquare className="w-3.5 h-3.5 text-subtle ml-auto" />
                    </div>
                    <div className="text-sm">{q.q}</div>
                    {i === 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {['Situation', 'Task', 'Action', 'Result'].map((s) => (
                          <div key={s}><div className="cine-bar h-1"><div className="cine-star-fill" /></div><div className="mt-1 text-[10px] text-subtle">{s}</div></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/60 p-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" pathLength="100" className="cine-ring-bg" />
                    <circle cx="18" cy="18" r="15.9" pathLength="100" className="cine-ring-fg cine-prog-ring" strokeDasharray="100" strokeDashoffset="25" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-lg font-semibold"><span className="cine-prog">75%</span></div>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-widest text-subtle">Ready</div>
              </div>
            </div>
          </Window>
        </div>
      </section>

      {/* ================= TRACKING ================= */}
      <section className="cine-track">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="cine-eyebrow justify-center"><span className="font-mono">05</span> Track</div>
          <h2 className="cine-h2 mt-3">Every application, always in view.</h2>
          <p className="mt-4 text-muted-foreground">See which resume went where, and move each job from applied to offer.</p>
        </div>
        <div className="relative max-w-5xl mx-auto mt-12 w-full">
          <div className="cine-ambient-glow cine-glow-emerald" aria-hidden />
          <div className="cine-window p-4 sm:p-5">
            <div className="relative grid grid-cols-3 gap-4">
              {['Applied', 'Interviewing', 'Offer'].map((c, ci) => (
                <div key={c} className="cine-col">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-widest text-subtle">{c}</span><span className="text-[11px] font-mono text-subtle">{[3, 1, 0][ci]}</span></div>
                  <div className="space-y-2 min-h-[150px]">
                    {ci === 0 && (<>
                      <div className="cine-kcard cine-move-b"><FileText className="w-3.5 h-3.5 text-brand" /> Stripe · Staff Backend Engineer</div>
                      <div className="cine-kcard cine-move-a"><FileText className="w-3.5 h-3.5 text-brand" /> Linear · Distributed Systems Engineer</div>
                      <div className="cine-kcard"><FileText className="w-3.5 h-3.5 text-subtle" /> Figma · Principal Platform Architect</div>
                    </>)}
                    {ci === 1 && <div className="cine-kcard"><FileText className="w-3.5 h-3.5 text-subtle" /> Notion · Lead Cloud Engineer</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 text-center"><button onClick={() => onNavigateToTab('applied')} className="cine-link">Open my applications <ArrowRight className="w-4 h-4" /></button></div>
      </section>

      {/* Floating Skip to Pricing Glass Button */}
      {showFloatingSkip && (
        <button
          type="button"
          onClick={handleScrollToPricing}
          className="fixed bottom-6 right-6 z-40 bg-card/90 hover:bg-card text-foreground backdrop-blur-xl border border-border/80 shadow-2xl rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all hover:border-brand/50 hover:text-brand cursor-pointer group animate-in fade-in slide-in-from-bottom-3 duration-200"
          title="Skip product demo to view pricing & plans"
          aria-label="Skip product demo to view pricing and plans"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Skip to Pricing</span>
          <ArrowDown className="w-3.5 h-3.5 text-subtle group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
