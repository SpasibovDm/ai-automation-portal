import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  BotIcon,
  ClockIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  UserPlusIcon,
} from "../components/Icons";
import Reveal from "../components/Reveal";
import { useTheme } from "../context/ThemeContext";

const previewTabs = ["Inbox", "Leads", "AI Replies", "Analytics"];

const previewData = {
  Inbox: [
    {
      subject: "Pricing for 200-seat rollout",
      from: "taylor@northwindhealth.com",
      status: "High intent",
      badge: "Sales",
    },
    {
      subject: "Urgent: onboarding SLA question",
      from: "ops@brightline.ai",
      status: "Escalation",
      badge: "Support",
    },
    {
      subject: "Security questionnaire attached",
      from: "security@opensignal.io",
      status: "AI triaged",
      badge: "Compliance",
    },
  ],
  Leads: [
    {
      name: "Taylor Bennett",
      company: "Northwind Health",
      score: 92,
      reason: "Enterprise domain · urgent timeline",
    },
    {
      name: "Jordan Lee",
      company: "OpenSignal",
      score: 80,
      reason: "Security docs requested",
    },
    {
      name: "Priya Kapoor",
      company: "Juniper Labs",
      score: 67,
      reason: "Multi-team rollout",
    },
  ],
  "AI Replies": {
    reply:
      "Thanks for the pricing request. Based on your 200-seat rollout, the Growth plan fits best. I can share a tailored proposal and ROI summary today.",
    whyLead: "Enterprise domain, high seat count, urgent timeline",
    whyReply: "Matches pricing inquiry + high intent keywords",
    confidence: [
      { label: "Tone", value: "92%" },
      { label: "Intent", value: "88%" },
      { label: "Urgency", value: "Medium" },
    ],
  },
  Analytics: [
    { label: "Inbox automation", value: 92 },
    { label: "Lead scoring coverage", value: 88 },
    { label: "AI reply accuracy", value: 93 },
  ],
};

const storySteps = [
  {
    title: "Connect your inbox",
    description: "Sync Gmail or Microsoft 365 in minutes.",
  },
  {
    title: "AI prioritizes everything",
    description: "Leads are scored, tagged, and routed instantly.",
  },
  {
    title: "Reply with confidence",
    description: "AI drafts replies with explainability + tone checks.",
  },
];

const trustSignals = [
  "SOC2-ready controls",
  "Audit logs and role-based access",
  "99.9% automation uptime",
  "On-brand AI reply governance",
];

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(previewTabs[0]);
  const [metrics, setMetrics] = useState({
    conversations: 42,
    leads: 18,
    uptime: 99.9,
    coverage: 92,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        conversations: Math.min(prev.conversations + Math.ceil(Math.random() * 3), 148),
        leads: Math.min(prev.leads + Math.floor(Math.random() * 2), 64),
        uptime: 99.6 + Math.random() * 0.35,
        coverage: Math.min(prev.coverage + (Math.random() > 0.5 ? 1 : 0), 98),
      }));
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const analyticsMax = useMemo(
    () => Math.max(...previewData.Analytics.map((item) => item.value)),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AI Automation Portal
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Premium revenue OS</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300" to="/demo">
              Try demo
            </Link>
            <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300" to="/login">
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              to="/register"
            >
              Get started free
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              AI Automation Portal
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Automate inbox, manage leads, and reply with AI — in one dashboard.
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Turn chaotic inbound conversations into automated revenue. AI Automation Portal scores leads, drafts replies, and tracks outcomes so nothing slips through.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                to="/demo"
              >
                Try demo
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500"
                to="/register"
              >
                Get started free
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">{metrics.conversations} conversations automated today</p>
                <p className="mt-1">AI triage keeps high-intent leads at the top.</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">{metrics.leads} leads scored in the last hour</p>
                <p className="mt-1">Priority signals + pipeline automation in real time.</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {metrics.uptime.toFixed(2)}% automation uptime
                </p>
                <p className="mt-1">Enterprise-grade reliability for revenue teams.</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {metrics.coverage}% AI reply coverage
                </p>
                <p className="mt-1">Drafts are on-brand with guardrails.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-8 top-6 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/20" />
            <div className="glass-panel relative rounded-3xl p-6 shadow-premium animate-float">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Live automation pulse</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {metrics.uptime.toFixed(2)}% uptime
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  {
                    label: "Inbox",
                    title: `${metrics.conversations} conversations triaged`,
                    description: "AI grouped high-intent buyers and support escalations.",
                  },
                  {
                    label: "Leads",
                    title: `${metrics.leads} leads scored today`,
                    description: "Auto-assigning to the right rep and playbook.",
                  },
                  {
                    label: "AI Replies",
                    title: "96 responses ready",
                    description: "Personalized drafts for sales, support, and partners.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-xs">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Problem</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                Your inbox is chaos. High-value leads get lost.
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Revenue teams juggle sales, support, and partner threads across disconnected tools. The result is slow response times, missed opportunities, and low AI confidence.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Missed high-intent leads", "Manual prioritization", "Inconsistent AI replies", "No clear ownership"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium dark:border-slate-800">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Solution</p>
              <h2 className="mt-3 text-2xl font-semibold">AI Automation Portal prioritizes, replies, and tracks.</h2>
              <p className="mt-2 text-sm text-indigo-100">
                Every inbound signal is classified, routed, and drafted by AI with explainability and confidence indicators.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "AI-native prioritization",
                    description: "Automatically surface high-intent and high-risk conversations.",
                  },
                  {
                    title: "On-brand AI replies",
                    description: "Confidence checks ensure tone, intent, and urgency stay aligned.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-indigo-100">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Live product preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  You are already inside the product
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Click through the dashboard tabs to feel the AI-native workflow.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
                {previewTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
              <div key={activeTab} className="animate-fade-in">
                {activeTab === "Inbox" && (
                  <div className="space-y-4">
                    {previewData.Inbox.map((item) => (
                      <div
                        key={item.subject}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.from}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {item.status}
                          </span>
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "Leads" && (
                  <div className="space-y-4">
                    {previewData.Leads.map((lead) => (
                      <div
                        key={lead.name}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                            Score {lead.score}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {lead.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "AI Replies" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">AI thinking</span>
                        <span className="typing-dot" />
                        <span className="typing-dot animation-delay-150" />
                        <span className="typing-dot animation-delay-300" />
                      </div>
                      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                        {previewData["AI Replies"].reply}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                        Why this lead is high priority: {previewData["AI Replies"].whyLead}
                      </div>
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                        Why this reply was suggested: {previewData["AI Replies"].whyReply}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {previewData["AI Replies"].confidence.map((item) => (
                        <span
                          key={item.label}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {item.label} {item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "Analytics" && (
                  <div className="space-y-4">
                    {previewData.Analytics.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                            style={{ width: `${(item.value / analyticsMax) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Three steps to automated revenue
            </h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {storySteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-premium transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Proof</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                Trusted automation with visible results
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Real-time metrics and role-based dashboards keep every stakeholder aligned.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {trustSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    {signal}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Leads scored", value: `${metrics.leads}/hr`, icon: UserPlusIcon },
                  { label: "Automation uptime", value: `${metrics.uptime.toFixed(2)}%`, icon: ClockIcon },
                  { label: "AI coverage", value: `${metrics.coverage}%`, icon: SparklesIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium dark:border-slate-800">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Role-based intelligence</p>
              <h3 className="mt-3 text-2xl font-semibold">Different roles, different priorities</h3>
              <p className="mt-2 text-sm text-indigo-100">
                Sales, Support, and Founder views adapt in real time to surface the right KPIs.
              </p>
              <div className="mt-6 grid gap-4">
                {[
                  { title: "Sales", detail: "Pipeline velocity + high intent signals" },
                  { title: "Support", detail: "SLA risk + escalation visibility" },
                  { title: "Founder", detail: "Executive KPIs + AI coverage" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-indigo-100">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Settings preview
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  This is a serious tool
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Control automation rules, AI tone, and lead scoring with governance-grade settings.
                </p>
                <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Automation rules</p>
                      <p className="text-xs">Auto-route VIP and renewal requests</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      Enabled
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-white">AI tone configuration</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-2 w-3/4 rounded-full bg-indigo-500" />
                    </div>
                    <p className="mt-2 text-xs">75% professional · 25% friendly</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-white">Working hours</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {"Mon–Fri 9:00–18:00".split(" ").map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-white">Lead scoring sensitivity</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-2 w-2/3 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-2 text-xs">Balanced for quality + volume</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium dark:border-slate-800">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">AI-native</p>
                <h3 className="mt-3 text-2xl font-semibold">Explainable automation, not a black box</h3>
                <p className="mt-2 text-sm text-indigo-100">
                  Every AI decision is transparent, with confidence indicators and supporting signals.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Why this lead is high priority</p>
                    <p className="text-xs text-indigo-100">Enterprise domain · 200+ seats · urgent timeline</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Why this reply was suggested</p>
                    <p className="text-xs text-indigo-100">Detected pricing inquiry + high-intent keywords</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["Tone 92%", "Intent 88%", "Urgency Medium"].map((item) => (
                      <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-indigo-50">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ready to automate your revenue inbox?
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Try the demo now, then activate your workspace when you are ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  to="/demo"
                >
                  Try demo
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                  to="/register"
                >
                  Activate workspace
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  );
};

export default Landing;
