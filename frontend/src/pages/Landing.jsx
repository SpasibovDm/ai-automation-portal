import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  BotIcon,
  ClockIcon,
  LineChartIcon,
  MailIcon,
  MoonIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  UserPlusIcon,
} from "../components/Icons";
import ChatWidget from "../components/ChatWidget";
import Reveal from "../components/Reveal";
import RoleSelector from "../components/RoleSelector";
import { useTheme } from "../context/ThemeContext";
import { useRolePreference } from "../hooks/useRolePreference";

const previewTabs = ["Inbox", "Leads", "AI Replies", "Analytics", "Settings"];

const roleTabDefaults = {
  Sales: "Leads",
  Support: "Inbox",
  Founder: "Analytics",
};

const roleExperience = {
  Sales: {
    spotlight: "Pipeline acceleration",
    promise: "Capture intent fast, send on-brand pricing replies, and close before competitors respond.",
    pulseFeed: [
      "Enterprise lead scored at 92 and routed to AE.",
      "Pricing draft approved with 96% tone confidence.",
      "Board intro moved to qualified in 4 minutes.",
      "Renewal expansion opportunity tagged as urgent.",
    ],
    inbox: [
      {
        subject: "Pricing for 200-seat rollout",
        from: "taylor@northwindhealth.com",
        status: "High intent",
        tag: "Sales",
      },
      {
        subject: "Need SOC2 documents before Friday",
        from: "security@opensignal.io",
        status: "Compliance",
        tag: "Enterprise",
      },
      {
        subject: "Can we consolidate support + sales?",
        from: "sofia@atlascorp.com",
        status: "Expansion",
        tag: "Founder intro",
      },
    ],
    leads: [
      {
        name: "Taylor Bennett",
        company: "Northwind Health",
        score: 92,
        reason: "200 seats | urgent timeline | enterprise domain",
      },
      {
        name: "Sofia Reyes",
        company: "Atlas Corp",
        score: 85,
        reason: "Board intro | cross-team consolidation",
      },
      {
        name: "Jordan Lee",
        company: "OpenSignal",
        score: 80,
        reason: "Security review + procurement intent",
      },
    ],
    ai: {
      reply:
        "Thanks for the rollout details. For a 200-seat team, the Growth plan is the best fit. I can send a tailored proposal with implementation timeline and ROI model in the next hour.",
      whyLead: "Seat count, enterprise procurement language, and urgent onboarding deadline.",
      whyReply: "Intent model detected pricing + implementation questions with high conversion probability.",
      confidence: [
        { label: "Tone", value: 94 },
        { label: "Intent", value: 91 },
        { label: "Urgency", value: 78 },
      ],
    },
    analytics: [
      { label: "Conversations automated", value: 94, trend: "+11%" },
      { label: "Lead scoring precision", value: 89, trend: "+7%" },
      { label: "Reply acceptance rate", value: 93, trend: "+9%" },
    ],
    settings: {
      rules: "Route enterprise + pricing threads directly to account executives.",
      tone: 76,
      hours: ["Mon-Fri", "9:00-18:00", "Sales timezone sync"],
      sensitivity: 71,
    },
    roleKPIs: [
      { label: "Win-rate uplift", value: "+18%" },
      { label: "Avg first reply", value: "4m 12s" },
      { label: "Qualified this week", value: "64" },
    ],
  },
  Support: {
    spotlight: "SLA protection",
    promise: "Route urgent issues instantly, keep replies consistent, and reduce escalations before churn risk appears.",
    pulseFeed: [
      "API downtime alert routed to senior support in 30 seconds.",
      "Billing escalation auto-tagged with medium urgency.",
      "Onboarding checklist reply accepted by support lead.",
      "SLA-risk thread moved into fast-lane queue.",
    ],
    inbox: [
      {
        subject: "Urgent: API downtime noticed",
        from: "ops@brightline.ai",
        status: "Escalation",
        tag: "Support",
      },
      {
        subject: "Billing question about extra seats",
        from: "finance@harborhq.co",
        status: "Queued",
        tag: "Billing",
      },
      {
        subject: "Need onboarding migration checklist",
        from: "cs@orbitstack.com",
        status: "In progress",
        tag: "Onboarding",
      },
    ],
    leads: [
      {
        name: "Avery Miles",
        company: "Brightline",
        score: 86,
        reason: "Escalated outage + multi-team impact",
      },
      {
        name: "Nia Singh",
        company: "Vertex Labs",
        score: 78,
        reason: "Renewal risk + response delay signals",
      },
      {
        name: "Rafael Ortega",
        company: "Skydock",
        score: 65,
        reason: "Migration request with onboarding dependency",
      },
    ],
    ai: {
      reply:
        "Thanks for flagging this. We have activated the incident workflow and prioritized your account. I'll share status updates every 15 minutes until full recovery is confirmed.",
      whyLead: "Operational downtime language + account tier + renewal proximity.",
      whyReply: "Support model selected incident response template with high reassurance tone.",
      confidence: [
        { label: "Tone", value: 90 },
        { label: "Intent", value: 95 },
        { label: "Urgency", value: 96 },
      ],
    },
    analytics: [
      { label: "SLA coverage", value: 96, trend: "+6%" },
      { label: "Escalations prevented", value: 82, trend: "+14%" },
      { label: "Auto-resolution rate", value: 74, trend: "+10%" },
    ],
    settings: {
      rules: "Route outage, billing, and security to priority support lane.",
      tone: 68,
      hours: ["24/7 queue", "Escalation handoff", "Pager alerts"],
      sensitivity: 84,
    },
    roleKPIs: [
      { label: "SLA breaches", value: "-31%" },
      { label: "Avg triage time", value: "1m 48s" },
      { label: "Escalations today", value: "5" },
    ],
  },
  Founder: {
    spotlight: "Executive control",
    promise: "See automation ROI clearly, verify AI quality, and steer revenue and support from one command surface.",
    pulseFeed: [
      "Board pack updated with automation ROI projections.",
      "AI coverage reached 74% across all inbound channels.",
      "Security review reply approved with policy compliance.",
      "Expansion pipeline forecast refreshed for leadership sync.",
    ],
    inbox: [
      {
        subject: "Executive briefing on automation ROI",
        from: "board@atlascorp.com",
        status: "Priority",
        tag: "Executive",
      },
      {
        subject: "Security posture review requested",
        from: "security@emberware.io",
        status: "Compliance",
        tag: "Security",
      },
      {
        subject: "Expansion roadmap and timeline",
        from: "strategy@meridianhealth.org",
        status: "Planning",
        tag: "Expansion",
      },
    ],
    leads: [
      {
        name: "Morgan Yu",
        company: "Emberware",
        score: 90,
        reason: "Multi-year contract + SLA addendum",
      },
      {
        name: "Sofia Reyes",
        company: "Atlas Corp",
        score: 85,
        reason: "Executive sponsorship + consolidation intent",
      },
      {
        name: "Daniel Hart",
        company: "Meridian Health",
        score: 72,
        reason: "Strategic roadmap review",
      },
    ],
    ai: {
      reply:
        "Appreciate the leadership request. Attached is the executive summary with automation ROI, response-time gains, and governance controls. Happy to walk your team through assumptions live.",
      whyLead: "Executive sender domain, strategic language, and expansion opportunity score.",
      whyReply: "Founder model selected board-ready summary template with governance framing.",
      confidence: [
        { label: "Tone", value: 93 },
        { label: "Intent", value: 89 },
        { label: "Urgency", value: 73 },
      ],
    },
    analytics: [
      { label: "Automation ROI confidence", value: 92, trend: "+8%" },
      { label: "Net retention signal", value: 88, trend: "+5%" },
      { label: "Reply governance score", value: 95, trend: "+4%" },
    ],
    settings: {
      rules: "Enforce approval for legal, board, and policy-sensitive replies.",
      tone: 82,
      hours: ["Global coverage", "Exec alerts", "Board reporting"],
      sensitivity: 63,
    },
    roleKPIs: [
      { label: "Pipeline forecast", value: "$2.4M" },
      { label: "AI governance", value: "95%" },
      { label: "NRR signal", value: "118%" },
    ],
  },
};

const storySteps = [
  {
    title: "Connect channels",
    description: "Securely connect Gmail or Microsoft 365 and map owners in minutes.",
  },
  {
    title: "AI prioritizes and drafts",
    description: "Lead intent, urgency, and next best reply are generated in real time.",
  },
  {
    title: "Track outcomes",
    description: "Role-aware dashboards surface automation ROI, SLA health, and pipeline impact.",
  },
];

const trustSignals = [
  "SOC2-ready controls",
  "Audit logs + role-based access",
  "99.9% automation uptime",
  "Governed AI tone and policy checks",
  "Human approval rules for sensitive threads",
  "Production-grade retry and fallback flows",
];

const featureCards = [
  {
    title: "Inbox automation",
    description: "Capture, classify, and route conversations without manual triage.",
    icon: MailIcon,
  },
  {
    title: "Leads pipeline",
    description: "Score, prioritize, and assign high-intent leads in real time.",
    icon: UserPlusIcon,
  },
  {
    title: "AI replies",
    description: "Generate explainable drafts with confidence and urgency indicators.",
    icon: SparklesIcon,
  },
  {
    title: "Analytics",
    description: "Track response speed, conversion impact, and automation reliability.",
    icon: LineChartIcon,
  },
];

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, setRole, roles } = useRolePreference();
  const [activeTab, setActiveTab] = useState(roleTabDefaults[role] || previewTabs[0]);
  const [feedIndex, setFeedIndex] = useState(0);
  const [highlightMetric, setHighlightMetric] = useState("conversations");
  const [metrics, setMetrics] = useState({
    conversations: 42,
    leads: 18,
    uptime: 99.9,
    coverage: 92,
  });

  useEffect(() => {
    setActiveTab(roleTabDefaults[role] || previewTabs[0]);
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      const keys = ["conversations", "leads", "uptime", "coverage"];
      const metricKey = keys[Math.floor(Math.random() * keys.length)];

      setMetrics((prev) => ({
        conversations: Math.min(prev.conversations + Math.ceil(Math.random() * 3), 182),
        leads: Math.min(prev.leads + Math.ceil(Math.random() * 2), 86),
        uptime: Math.min(99.95, Math.max(99.6, prev.uptime + (Math.random() - 0.45) * 0.08)),
        coverage: Math.min(98, Math.max(90, prev.coverage + (Math.random() > 0.55 ? 1 : 0))),
      }));

      setHighlightMetric(metricKey);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex((prev) => prev + 1);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  const roleData = roleExperience[role] || roleExperience.Sales;

  const feedRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 3; i += 1) {
      rows.push(roleData.pulseFeed[(feedIndex + i) % roleData.pulseFeed.length]);
    }
    return rows;
  }, [feedIndex, roleData]);

  const analyticsMax = useMemo(
    () => Math.max(...roleData.analytics.map((item) => item.value), 100),
    [roleData.analytics]
  );

  const metricCards = [
    {
      key: "conversations",
      value: `${metrics.conversations}`,
      suffix: " automated today",
      helper: "Conversation routing + triage in live mode",
    },
    {
      key: "leads",
      value: `${metrics.leads}`,
      suffix: " leads scored in last hour",
      helper: "Intent, urgency, and account tier combined",
    },
    {
      key: "uptime",
      value: `${metrics.uptime.toFixed(2)}%`,
      suffix: " automation uptime",
      helper: "Production reliability with policy-safe fallback",
    },
    {
      key: "coverage",
      value: `${metrics.coverage}%`,
      suffix: " AI reply coverage",
      helper: "On-brand replies with confidence visibility",
    },
  ];

  return (
    <div className="landing-shell relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-45">
        <div className="grid-overlay h-full w-full" />
      </div>
      <div className="pointer-events-none absolute -top-36 right-10 h-96 w-96 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-500/20" />
      <div className="pointer-events-none absolute bottom-[-220px] left-[-120px] h-[480px] w-[480px] rounded-full bg-indigo-200/70 blur-3xl dark:bg-indigo-500/20" />

      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="animate-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/35">
              <BotIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AI Automation Portal
              </p>
              <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                Intelligent revenue orchestration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="hidden rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 md:inline-flex"
              to="/demo"
            >
              Try demo
            </Link>
            <Link
              className="hidden rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 md:inline-flex"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="interactive-lift rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              to="/register"
            >
              Get started free
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 bg-white/90 p-2 text-slate-600 shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 pb-20">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-6 pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pt-12">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
              AI-native workspace for sales, support, and founders
            </p>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
              Automate inbox, manage leads, and reply with AI — in one dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
              AI Automation Portal helps sales and support teams convert faster with explainable automation, live inbox intelligence, and role-aware operations.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                className="interactive-lift inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                to="/register"
              >
                Get started free
              </Link>
              <Link
                className="interactive-lift inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                to="/demo"
              >
                Try demo
              </Link>
              <Link
                className="interactive-lift inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                to="/login"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Try demo works instantly with no sign-up.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Preview role</p>
              <RoleSelector roles={roles} value={role} onChange={setRole} />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {metricCards.map((metric) => (
                <div
                  key={metric.key}
                  className={`glass-panel interactive-lift rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300 ${
                    highlightMetric === metric.key ? "metric-highlight" : ""
                  }`}
                >
                  <p className="font-display text-[15px] font-semibold text-slate-900 dark:text-white">
                    {metric.value}
                    {metric.suffix}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel-strong relative overflow-hidden rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    Live automation pulse
                  </p>
                  <h2 className="font-display mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {roleData.spotlight}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{roleData.promise}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span className="status-dot bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {feedRows.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="interactive-lift rounded-2xl border border-slate-100 bg-white/85 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 animate-orbit items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                        <SparklesIcon className="h-3.5 w-3.5" />
                      </span>
                      <p>{item}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {roleData.roleKPIs.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    <p className="uppercase tracking-[0.18em]">{item.label}</p>
                    <p className="font-display mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Features
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
                Premium workflow surface for modern B2B teams
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article
                      key={feature.title}
                      className="interactive-lift rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-premium-strong backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                    Live product preview
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
                    Feels like you are already using the product
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Click tabs to inspect inbox, leads, AI replies, analytics, and settings without backend calls.
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
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

              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                <div key={activeTab} className="tab-panel-enter">
                  {activeTab === "Inbox" && (
                    <div className="space-y-3">
                      {roleData.inbox.map((item) => (
                        <div
                          key={item.subject}
                          className="interactive-lift rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{item.from}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                {item.status}
                              </span>
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                                {item.tag}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Leads" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {roleData.leads.map((lead) => (
                        <article
                          key={lead.name}
                          className="interactive-lift rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                        >
                          <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Lead score</span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                              {lead.score}
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{lead.reason}</p>
                        </article>
                      ))}
                    </div>
                  )}

                  {activeTab === "AI Replies" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                          <span>AI thinking</span>
                          <span className="typing-dot" />
                          <span className="typing-dot animation-delay-150" />
                          <span className="typing-dot animation-delay-300" />
                        </div>
                        <p className="shimmer-line mt-3 text-sm text-slate-700 dark:text-slate-200">
                          {roleData.ai.reply}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                          <p className="font-semibold">Why this lead is high priority</p>
                          <p className="mt-1">{roleData.ai.whyLead}</p>
                        </div>
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                          <p className="font-semibold">Why this reply was suggested</p>
                          <p className="mt-1">{roleData.ai.whyReply}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {roleData.ai.confidence.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70"
                          >
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "Analytics" && (
                    <div className="space-y-4">
                      {roleData.analytics.map((item) => (
                        <div
                          key={item.label}
                          className="interactive-lift rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{item.label}</span>
                            <span>
                              {item.value}% <span className="text-emerald-600 dark:text-emerald-300">{item.trend}</span>
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                              style={{ width: `${(item.value / analyticsMax) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "Settings" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <SettingsIcon className="h-4 w-4" />
                          <p className="font-semibold">Automation rules</p>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{roleData.settings.rules}</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                          <span className="status-dot bg-emerald-500" />
                          Enabled
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <SparklesIcon className="h-4 w-4" />
                          <p className="font-semibold">AI tone configuration</p>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                            style={{ width: `${roleData.settings.tone}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {roleData.settings.tone}% professional | {100 - roleData.settings.tone}% friendly
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Working hours</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {roleData.settings.hours.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-800"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Lead scoring sensitivity</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            style={{ width: `${roleData.settings.sensitivity}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Balanced for quality + volume</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">How it works</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
                Three steps to calm inbox chaos
              </h2>
              <div className="relative mt-6 space-y-4">
                {storySteps.map((step, index) => (
                  <div key={step.title} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-start gap-3">
                      <span className="font-display flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium dark:border-slate-700">
              <p className="text-xs uppercase tracking-[0.28em] text-indigo-200">Security & Trust</p>
              <h3 className="font-display mt-2 text-2xl font-semibold">Built for teams that cannot miss signal</h3>
              <p className="mt-2 text-sm text-indigo-100">
                Every action is explainable, every workflow is governable, and every stakeholder sees role-specific outcomes.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {trustSignals.map((signal) => (
                  <div key={signal} className="rounded-2xl bg-white/10 p-3 text-xs text-indigo-100">
                    {signal}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Inbox", value: `${metrics.conversations}/day`, icon: MailIcon },
                  { label: "Leads", value: `${metrics.leads}/hr`, icon: UserPlusIcon },
                  { label: "Uptime", value: `${metrics.uptime.toFixed(2)}%`, icon: ClockIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/10 p-3 text-xs text-indigo-100">
                      <Icon className="h-4 w-4" />
                      <p className="mt-2 uppercase tracking-[0.17em]">{item.label}</p>
                      <p className="font-display mt-1 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/75 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">AI-native differentiation</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Explainable AI, not black-box automation
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Teams can inspect reasoning, confidence, and urgency before sending. That builds trust and protects brand voice.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                    <p className="font-semibold">Why this lead is high priority</p>
                    <p className="mt-1">{roleData.ai.whyLead}</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                    <p className="font-semibold">Why this reply was suggested</p>
                    <p className="mt-1">{roleData.ai.whyReply}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Confidence indicators</p>
                </div>
                <div className="mt-4 space-y-3">
                  {roleData.ai.confidence.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  AI thinking stream remains visible before send to preserve human control.
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Ready to launch your workspace?
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Try demo, validate AI decisions, and launch your team in production.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="interactive-lift inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  to="/demo"
                >
                  Try demo
                </Link>
                <Link
                  className="interactive-lift inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                  to="/register"
                >
                  Get started free
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <ChatWidget />
    </div>
  );
};

export default Landing;
