"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Code2,
  Languages,
  Lightbulb,
  GitBranch,
  ArrowRight,
  Github,
  Linkedin,
  Heart,
  ExternalLink,
  Sparkles,
  Target,
  CheckCircle2,
  Home,
  ListChecks,
  Mail,
  Terminal,
  Braces,
  Cpu,
  Play,
  BookOpen,
  MessageSquare,
  Trophy,
  Zap,
  Users,
} from "lucide-react";

/* ── Helpers ── */

function useMouseParallax(strength = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setOffset({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [strength]);
  return offset;
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FloatingIcon({ icon: Icon, className, style }: { icon: React.ElementType; className: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={style}>
      <Icon className="h-5 w-5 text-brand-400/20" />
    </div>
  );
}

/* ── Live Code Demo ── */

const DEMO_CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i`;

const DEMO_OUTPUT_LINES = [
  { text: "$ Running two_sum([2, 7, 11, 15], 9)...", type: "cmd" as const },
  { text: "", type: "blank" as const },
  { text: "  Test 1: two_sum([2,7,11,15], 9)", type: "info" as const },
  { text: "  Expected: [0, 1]", type: "info" as const },
  { text: "  Got:      [0, 1]  ✓ Passed", type: "pass" as const },
  { text: "", type: "blank" as const },
  { text: "  Test 2: two_sum([3,2,4], 6)", type: "info" as const },
  { text: "  Expected: [1, 2]", type: "info" as const },
  { text: "  Got:      [1, 2]  ✓ Passed", type: "pass" as const },
  { text: "", type: "blank" as const },
  { text: "  All tests passed! (2/2)", type: "result" as const },
];

function CodeDemo() {
  const [typed, setTyped] = useState("");
  const [outputLines, setOutputLines] = useState<typeof DEMO_OUTPUT_LINES>([]);
  const [phase, setPhase] = useState<"typing" | "running" | "done">("typing");
  const [startDemo, setStartDemo] = useState(false);
  const { ref, visible } = useScrollReveal(0.3);

  useEffect(() => {
    if (visible && !startDemo) setStartDemo(true);
  }, [visible, startDemo]);

  useEffect(() => {
    if (!startDemo) return;
    let charIdx = 0;
    const typeInterval = setInterval(() => {
      charIdx++;
      setTyped(DEMO_CODE.slice(0, charIdx));
      if (charIdx >= DEMO_CODE.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhase("running");
          let lineIdx = 0;
          const outputInterval = setInterval(() => {
            lineIdx++;
            setOutputLines(DEMO_OUTPUT_LINES.slice(0, lineIdx));
            if (lineIdx >= DEMO_OUTPUT_LINES.length) {
              clearInterval(outputInterval);
              setPhase("done");
            }
          }, 200);
        }, 600);
      }
    }, 25);
    return () => clearInterval(typeInterval);
  }, [startDemo]);

  const lineColor = (type: string) => {
    if (type === "cmd") return "text-gray-500";
    if (type === "pass") return "text-emerald-400";
    if (type === "result") return "text-brand-400 font-semibold";
    return "text-gray-400";
  };

  return (
    <div ref={ref} className="rounded-2xl border border-gray-800 bg-[#0d0f15] overflow-hidden shadow-2xl shadow-brand-500/5">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-gray-800 bg-[#161821] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-amber-500/60" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="ml-2 text-xs text-gray-500 font-mono">two_sum.py</span>
        <div className="ml-auto flex items-center gap-1.5">
          {phase === "running" && <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
          {phase === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          <span className="text-[10px] text-gray-500 font-mono">Python</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-gray-800">
        {/* Code editor pane */}
        <div className="p-4 font-mono text-sm leading-relaxed min-h-[240px]">
          <pre className="text-gray-300 whitespace-pre-wrap">
            {typed.split("\n").map((line, i) => (
              <div key={i} className="flex">
                <span className="w-6 text-right text-gray-600 text-xs mr-3 select-none shrink-0 pt-0.5">{i + 1}</span>
                <span>{colorize(line)}</span>
              </div>
            ))}
            {phase === "typing" && <span className="inline-block w-2 h-4 bg-brand-400 animate-pulse ml-0.5" />}
          </pre>
        </div>

        {/* Output pane */}
        <div className="p-4 font-mono text-xs leading-relaxed min-h-[240px] bg-[#0a0c12]">
          <div className="flex items-center gap-1.5 mb-3 text-gray-500">
            <Terminal className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Output</span>
          </div>
          {outputLines.map((line, i) => (
            <div key={i} className={`${lineColor(line.type)} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
              {line.text || "\u00A0"}
            </div>
          ))}
          {phase === "typing" && <span className="text-gray-600">Waiting for code...</span>}
          {phase === "running" && outputLines.length === 0 && <span className="text-amber-400">Running...</span>}
        </div>
      </div>
    </div>
  );
}

function colorize(line: string) {
  return line
    .replace(/(def |return |for |in |if )/g, '\x01$1\x02')
    .replace(/(enumerate)/g, '\x03$1\x04')
    .split(/(\x01.*?\x02|\x03.*?\x04)/)
    .map((part, i) => {
      if (part.startsWith('\x01')) return <span key={i} className="text-violet-400">{part.slice(1, -1)}</span>;
      if (part.startsWith('\x03')) return <span key={i} className="text-amber-300">{part.slice(1, -1)}</span>;
      return <span key={i}>{part}</span>;
    });
}

/* ── Feature Card ── */

function FeatureCard({ icon: Icon, title, color, bg, border, glow, index }: {
  icon: React.ElementType; title: string; color: string; bg: string; border: string; glow: string; index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTilt({ x: ((e.clientY - rect.top) / rect.height - 0.5) * -8, y: ((e.clientX - rect.left) / rect.width - 0.5) * 8 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovering(false); }}
      className={`card-glow group flex items-center gap-4 rounded-xl border ${border} bg-[#161821] px-5 py-4 transition-all duration-300 cursor-default h-full`}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovering ? "translateY(-2px)" : ""}`,
        boxShadow: hovering ? `0 16px 32px -8px ${glow}` : "none",
      }}
    >
      <div className={`shrink-0 rounded-xl ${bg} p-3 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <span className="text-sm font-semibold text-gray-100">{title}</span>
    </div>
  );
}

/* ── Stats counter ── */

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Main Page ── */

const features = [
  { icon: Brain, title: "AI Coding Coach", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20", glow: "rgba(96,165,250,0.15)" },
  { icon: Code2, title: "Syntax Trainer", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "rgba(52,211,153,0.15)" },
  { icon: Target, title: "Algorithm Practice", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "rgba(251,191,36,0.15)" },
  { icon: Languages, title: "9 Languages", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "rgba(167,139,250,0.15)" },
  { icon: Lightbulb, title: "Interview Guidance", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "rgba(251,113,133,0.15)" },
  { icon: MessageSquare, title: "AI Code Review", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "rgba(34,211,238,0.15)" },
];

const stats = [
  { value: 100, suffix: "+", label: "Problems", icon: Target },
  { value: 9, suffix: "", label: "Languages", icon: Languages },
  { value: 50, suffix: "+", label: "Syntax Lessons", icon: BookOpen },
  { value: 20, suffix: "+", label: "Topics", icon: Zap },
];

const howItWorks = [
  { icon: BookOpen, title: "Learn", desc: "Master syntax & patterns", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Code2, title: "Solve", desc: "Practice real problems", color: "text-brand-400", bg: "bg-brand-500/10" },
  { icon: Brain, title: "Ask AI", desc: "Get hints when stuck", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: MessageSquare, title: "Review", desc: "AI code analysis", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Trophy, title: "Grow", desc: "Build confidence", color: "text-rose-400", bg: "bg-rose-500/10" },
];

export default function HomePage() {
  const mouse = useMouseParallax(0.015);
  const heroReveal = useScrollReveal();

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117]">
      {/* Sticky header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#161821]/80 backdrop-blur-md px-4 py-2 flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 mr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 text-white">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight"><span className="text-brand-400">AI Interview</span> Coach</span>
          </Link>
          <nav className="flex items-center gap-1">
            <span className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-brand-600 text-white"><Home className="h-3.5 w-3.5" />Home</span>
            <Link href="/practice" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"><ListChecks className="h-3.5 w-3.5" />Practice</Link>
            <span className="mx-1 h-4 w-px bg-gray-700" />
            <Link href="/contact" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"><Mail className="h-3.5 w-3.5" />Contact</Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth">

        {/* ══════════ HERO ══════════ */}
        <section className="relative overflow-hidden border-b border-gray-800 bg-grid-pattern">
          <div className="absolute top-[-120px] left-[10%] h-[400px] w-[400px] rounded-full bg-brand-600/20 animate-glow-pulse" style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)` }} />
          <div className="absolute bottom-[-80px] right-[15%] h-[300px] w-[300px] rounded-full bg-violet-600/15 animate-glow-pulse" style={{ animationDelay: "2s", transform: `translate(${mouse.x * -1.5}px, ${mouse.y * -1.5}px)` }} />
          <div className="absolute top-[40%] left-[55%] h-[200px] w-[200px] rounded-full bg-emerald-500/10 animate-glow-pulse" style={{ animationDelay: "3.5s", transform: `translate(${mouse.x}px, ${mouse.y}px)` }} />

          <div style={{ transform: `translate(${mouse.x * 0.8}px, ${mouse.y * 0.8}px)` }}>
            <FloatingIcon icon={Terminal} className="top-[15%] left-[8%] animate-float-slow" />
            <FloatingIcon icon={Braces} className="top-[25%] right-[12%] animate-float-medium" />
            <FloatingIcon icon={Cpu} className="bottom-[20%] left-[15%] animate-float-fast" />
            <FloatingIcon icon={Code2} className="top-[60%] right-[8%] animate-float-slow" style={{ animationDelay: "1s" }} />
            <FloatingIcon icon={Brain} className="top-[10%] right-[30%] animate-float-medium" style={{ animationDelay: "2s" }} />
            <FloatingIcon icon={Sparkles} className="bottom-[15%] right-[25%] animate-float-fast" style={{ animationDelay: "0.5s" }} />
          </div>

          <div ref={heroReveal.ref} className={`relative mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center transition-all duration-1000 ease-out ${heroReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Open Source Interview Prep Platform
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl animate-text-shimmer bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #fff 0%, #60a5fa 25%, #fff 50%, #a78bfa 75%, #fff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              A New Way to<br />Ace Interviews
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg text-gray-400">
              Practice algorithms, train syntax, and get AI coaching — all in one platform.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Developed by{" "}
              <a href="https://www.linkedin.com/in/anvarbaltakhojayev/" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                Anvar Baltakhojayev
              </a>
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/practice" className="btn-glow group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all duration-300 hover:scale-[1.03]">
                Start Practicing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="https://github.com/open-interview-ai/ai-interview-coach" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-7 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all duration-300 hover:scale-[1.03] backdrop-blur-sm">
                <Github className="h-4 w-4" />
                View GitHub
              </a>
            </div>
          </div>
        </section>

        {/* ══════════ STATS BAR ══════════ */}
        <section className="border-b border-gray-800 bg-[#161821]/50">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 100}>
                  <div className="text-center group">
                    <s.icon className="mx-auto mb-2 h-5 w-5 text-gray-600 group-hover:text-brand-400 transition-colors" />
                    <div className="text-3xl font-extrabold text-white">
                      <AnimatedNumber target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES (compact) ══════════ */}
        <section className="border-b border-gray-800">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <Reveal>
              <h2 className="text-center text-2xl font-bold text-white mb-8">Everything You Need</h2>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <FeatureCard {...f} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ LIVE CODE DEMO ══════════ */}
        <section className="border-b border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.02] via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-6 py-16">
            <Reveal>
              <div className="text-center mb-10">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                  <Play className="h-3 w-3" />
                  Live Preview
                </div>
                <h2 className="text-2xl font-bold text-white">Write Code. Run Tests. Get Feedback.</h2>
                <p className="mt-2 text-gray-400">See how the platform works — code execution with real-time test results.</p>
              </div>
            </Reveal>
            <Reveal>
              <CodeDemo />
            </Reveal>
            <Reveal>
              <div className="mt-6 text-center">
                <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
                  Try it yourself with 100+ problems
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS (horizontal) ══════════ */}
        <section className="border-b border-gray-800">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <Reveal>
              <h2 className="text-center text-2xl font-bold text-white mb-10">How It Works</h2>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-3">
              {howItWorks.map((s, i) => (
                <Reveal key={s.title} delay={i * 80}>
                  <div className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-[#161821] px-5 py-3.5 transition-all duration-300 hover:border-gray-700 hover:bg-[#1a1d2a]">
                    {i > 0 && <div className="hidden sm:block absolute -left-3 text-gray-700">→</div>}
                    <div className={`shrink-0 rounded-lg ${s.bg} p-2 transition-transform duration-300 group-hover:scale-110`}>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-100">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ OPEN SOURCE ══════════ */}
        <section className="border-b border-gray-800">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <Reveal>
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 transition-transform duration-300 hover:scale-110">
                <GitBranch className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Open Source & Free</h2>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Free forever</span>
                <span className="text-gray-700">&middot;</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Open source</span>
                <span className="text-gray-700">&middot;</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Community driven</span>
              </div>
              <a href="https://github.com/open-interview-ai/ai-interview-coach" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 hover:scale-[1.03]">
                <Github className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="bg-[#161821]">
          <div className="mx-auto max-w-4xl px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Built with <Heart className="inline h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by
            </p>
            <a href="https://www.linkedin.com/in/anvarbaltakhojayev/" target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-base font-semibold text-white hover:text-brand-400 transition-colors">
              Anvar Baltakhojayev <Linkedin className="h-4 w-4 text-brand-400" />
            </a>
            <p className="mt-0.5 text-xs text-gray-500">Full Stack AI Engineer</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link href="/practice" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Practice</Link>
              <span className="text-gray-700">&middot;</span>
              <Link href="/contact" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Contact</Link>
              <span className="text-gray-700">&middot;</span>
              <a href="https://github.com/open-interview-ai/ai-interview-coach" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
