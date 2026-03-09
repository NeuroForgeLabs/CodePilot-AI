import Link from "next/link";
import {
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
  Home,
  ListChecks,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — AI Interview Coach",
  description:
    "Get in touch with the AI Interview Coach team. Questions, feedback, or contributions welcome.",
};

const contacts = [
  {
    icon: Mail,
    label: "Email",
    value: "xadja35@gmail.com",
    href: "mailto:xadja35@gmail.com",
    external: false,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    description: "Send an email directly — for questions, feedback, or collaboration.",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Anvar Baltakhojayev",
    href: "https://www.linkedin.com/in/anvarbaltakhojayev/",
    external: true,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    hoverBorder: "hover:border-brand-500/40",
    description: "Connect on LinkedIn for professional inquiries and updates.",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "Dante9988",
    href: "https://github.com/Dante9988",
    external: true,
    color: "text-gray-300",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    hoverBorder: "hover:border-gray-500/40",
    description: "View my GitHub profile, projects, and contributions.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117]">
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#161821] px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 mr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 text-white">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
                <line x1="14" y1="4" x2="10" y2="20" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              <span className="text-brand-400">AI Interview</span> Coach
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link
              href="/practice"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <ListChecks className="h-3.5 w-3.5" />
              Practice
            </Link>
            <span className="mx-1 h-4 w-px bg-gray-700" />
            <span className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-brand-600 text-white">
              <Mail className="h-3.5 w-3.5" />
              Contact
            </span>
          </nav>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>

          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-lg bg-brand-500/10 p-3">
              <MessageCircle className="h-6 w-6 text-brand-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Contact Us
            </h2>
            <p className="mt-3 text-gray-400 leading-relaxed">
              Have questions, feedback, or want to contribute? Reach out anytime.
            </p>
          </div>

          <div className="space-y-4">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`group flex items-start gap-4 rounded-xl border ${c.border} ${c.hoverBorder} bg-[#161821] p-5 transition-all hover:bg-[#1a1d2a]`}
              >
                <div className={`flex-shrink-0 rounded-lg ${c.bg} p-2.5`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {c.label}
                    </span>
                    {c.external && (
                      <ExternalLink className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <p className="mt-0.5 font-medium text-gray-100 group-hover:text-white transition-colors">
                    {c.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {c.description}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-gray-800 bg-[#161821] p-6 text-center">
            <h3 className="font-semibold text-gray-100">Want to contribute?</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              AI Interview Coach is open source. Whether it&apos;s fixing a bug, adding a new problem, or improving the AI — every contribution matters.
            </p>
            <a
              href="https://github.com/open-interview-ai/ai-interview-coach"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              Open on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <footer className="border-t border-gray-800 bg-[#161821]">
          <div className="mx-auto max-w-4xl px-6 py-8 text-center">
            <div className="flex items-center justify-center gap-4">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Home
              </Link>
              <span className="text-gray-700">&middot;</span>
              <Link href="/practice" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Practice
              </Link>
              <span className="text-gray-700">&middot;</span>
              <a
                href="https://github.com/open-interview-ai/ai-interview-coach"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                GitHub
              </a>
            </div>
            <p className="mt-3 text-xs text-gray-600">
              AI Interview Coach — Built by Anvar Baltakhojayev
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
