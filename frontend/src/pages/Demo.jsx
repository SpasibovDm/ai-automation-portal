import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Badge from "../components/Badge";
import ConfettiBurst from "../components/ConfettiBurst";
import RoleSelector from "../components/RoleSelector";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import {
  BotIcon,
  ClockIcon,
  MailIcon,
  MoonIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  UserPlusIcon,
} from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { demoRoleData } from "../data/demoData";

const roleHighlights = {
  Sales: ["leads_today", "ai_replies_sent"],
  Support: ["emails_processed", "pending_actions"],
  Founder: ["ai_replies_sent", "emails_processed_30d"],
};

const workspaceTabs = ["Inbox", "Leads", "AI Replies", "Analytics", "Settings"];

const roleDefaultTabs = {
  Sales: "Leads",
  Support: "Inbox",
  Founder: "Analytics",
};
const demoRoles = ["Sales", "Support", "Founder"];

const roleWorkspace = {
  Sales: {
    title: "Sales cockpit",
    subtitle: "Pipeline speed, high-intent buyers, and reply conversion",
    widgets: [
      "3 enterprise opportunities need tailored pricing follow-up",
      "AI flagged 12 buyers with procurement intent",
      "Forecast confidence increased by 8% in the last hour",
    ],
  },
  Support: {
    title: "Support cockpit",
    subtitle: "SLA health, escalation prevention, and response consistency",
    widgets: [
      "5 conversations are nearing SLA and already prioritized",
      "AI routed outage threads to priority queue in under 45s",
      "Escalation volume dropped 12% week-over-week",
    ],
  },
  Founder: {
    title: "Executive cockpit",
    subtitle: "Automation ROI, governance, and growth predictability",
    widgets: [
      "Board-ready KPI pack refreshed 22 minutes ago",
      "AI governance score remained above 95% this week",
      "Quarterly pipeline signal currently tracking at $2.4M",
    ],
  },
};

const onboardingFlow = [
  {
    title: "Click here to see AI reply",
    description: "Open AI Replies to inspect the generated response and confidence indicators.",
    action: "Open AI Replies",
    tab: "AI Replies",
  },
  {
    title: "Review explainability",
    description: "Check why the lead was prioritized and why the reply was suggested.",
    action: "Open Analytics",
    tab: "Analytics",
  },
  {
    title: "Tune settings",
    description: "Adjust automation rules, AI tone, and lead-scoring sensitivity.",
    action: "Open Settings",
    tab: "Settings",
  },
];

const Demo = () => {
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState("Sales");
  const [activeTab, setActiveTab] = useState(roleDefaultTabs[role] || workspaceTabs[0]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [aiThinking, setAiThinking] = useState(1);
  const aiReplyRef = useRef(null);

  useEffect(() => {
    setActiveTab(roleDefaultTabs[role] || workspaceTabs[0]);
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiThinking((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const roleData = demoRoleData[role] || demoRoleData.Sales;
  const workspaceData = roleWorkspace[role] || roleWorkspace.Sales;
  const { summary, leads, emails, activities, insights, aiPreview, settingsPreview } = roleData;
  const highlightKeys = roleHighlights[role] || [];
  const currentOnboarding = onboardingFlow[Math.min(onboardingStep - 1, onboardingFlow.length - 1)];
  const progressPercent = Math.min((onboardingStep / onboardingFlow.length) * 100, 100);

  const analyticsKpis = useMemo(
    () => [
      {
        label: "Automation coverage",
        value: Math.min(98, Math.round((summary.kpis.ai_replies_sent / summary.kpis.emails_processed) * 100)),
      },
      {
        label: "Lead quality signal",
        value: Math.min(96, Math.round((summary.kpis.leads_today / Math.max(summary.kpis.pending_actions, 1)) * 17)),
      },
      {
        label: "Response readiness",
        value: Math.min(99, Math.round((summary.kpis.ai_replies_sent_30d / summary.kpis.emails_processed_30d) * 100)),
      },
    ],
    [summary]
  );

  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 900);
  };

  const handleOnboardingAction = () => {
    setActiveTab(currentOnboarding.tab);
    if (currentOnboarding.tab === "AI Replies") {
      aiReplyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    triggerConfetti();
    setOnboardingStep((prev) => Math.min(prev + 1, onboardingFlow.length));
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-app)] text-slate-900 dark:text-slate-100 app-shell ${
        theme === "dark" ? "dark-shell" : ""
      }`}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="animate-glow flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AI Automation Portal
              </p>
              <p className="font-display text-base font-semibold text-slate-900 dark:text-white">Live Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleSelector roles={demoRoles} value={role} onChange={setRole} className="hidden lg:inline-flex" />
            <Link
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:inline-flex"
              to="/"
            >
              Back to home
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
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.28fr_0.72fr]">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <ConfettiBurst active={confetti} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="warning">Demo mode</Badge>
                  <p className="text-sm font-medium">
                    Explore the full product flow with mock inbox, leads, and analytics.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1 dark:border-amber-500/30 dark:bg-amber-500/20">
                    No data saving
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1 dark:border-amber-500/30 dark:bg-amber-500/20">
                    No settings persistence
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1 dark:border-amber-500/30 dark:bg-amber-500/20">
                    No external integrations
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium">No backend writes in this preview</p>
              <Link
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500"
                to="/register"
              >
                Get started free
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Onboarding</p>
                <h3 className="font-display mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Step {onboardingStep}/3 - {currentOnboarding.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentOnboarding.description}</p>
              </div>
              <button
                type="button"
                onClick={handleOnboardingAction}
                className="interactive-lift rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {currentOnboarding.action}
              </button>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                Inline tips enabled
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                Confetti success moments
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{workspaceData.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{workspaceData.subtitle}</p>
              </div>
              <RoleSelector roles={demoRoles} value={role} onChange={setRole} className="lg:hidden" />
            </div>

            <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              {workspaceTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {onboardingStep === 1 && (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Tip: Click the <span className="font-semibold">AI Replies</span> tab to see why the model picked its response.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Role-specific priority widgets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Different defaults for Sales, Support, and Founder</p>
            </div>
            <div className="mt-4 space-y-3">
              {workspaceData.widgets.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="New Leads Today"
            value={summary.kpis.leads_today}
            icon={<UserPlusIcon className="h-5 w-5" />}
            helper="High intent"
            trend={`${summary.kpis.total_leads} total`}
            highlight={highlightKeys.includes("leads_today")}
          />
          <StatCard
            label="Emails Processed"
            value={summary.kpis.emails_processed}
            icon={<MailIcon className="h-5 w-5" />}
            helper="Last 24 hours"
            trend={`${summary.kpis.emails_processed_30d} in 30 days`}
            highlight={highlightKeys.includes("emails_processed")}
          />
          <StatCard
            label="AI Replies Sent"
            value={summary.kpis.ai_replies_sent}
            icon={<BotIcon className="h-5 w-5" />}
            helper="Generated by AI"
            trend={`${summary.kpis.ai_replies_sent_30d} auto`}
            highlight={highlightKeys.includes("ai_replies_sent")}
          />
          <StatCard
            label="Pending Actions"
            value={summary.kpis.pending_actions}
            icon={<ClockIcon className="h-5 w-5" />}
            helper="Awaiting review"
            highlight={highlightKeys.includes("pending_actions")}
          />
        </section>

        <section ref={aiReplyRef} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/85">
          <div key={activeTab} className="tab-panel-enter">
            {activeTab === "Inbox" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Inbox preview</h3>
                  <Badge variant="info">Live mock data</Badge>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className="interactive-lift rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900 dark:text-white">{email.subject}</p>
                          <StatusBadge status={email.status} label={email.status} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">From {email.from}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge>{email.category}</Badge>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {new Date(email.received_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Live activity stream</h4>
                    <div className="mt-4 space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.description}</p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Leads" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserPlusIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lead board</h3>
                  <Badge variant="info">Prioritized by AI</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="interactive-lift rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={lead.status} />
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Score {lead.score}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{lead.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "AI Replies" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI reply studio</h3>
                  <Badge variant="info">Explainable AI</Badge>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <div className="flex items-center gap-2 uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    <span>AI thinking</span>
                    <span className="typing-dot" />
                    <span className="typing-dot animation-delay-150" />
                    <span className="typing-dot animation-delay-300" />
                    <span className="ml-1 text-[11px] normal-case tracking-normal">phase {aiThinking}/3</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Drafted reply: "{aiPreview.reply}"</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    Why this lead is high priority: {aiPreview.whyLead}
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                    Why this reply was suggested: {aiPreview.whyReply}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {aiPreview.confidence.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {analyticsKpis.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                    >
                      <p>{item.label}</p>
                      <p className="font-display mt-1 text-lg font-semibold text-slate-900 dark:text-white">{item.value}%</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lead momentum</h3>
                    <div className="mt-4 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={summary.lead_trend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              borderColor: "#e2e8f0",
                              fontSize: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="leads"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ fill: "#4f46e5", r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Email mix</h3>
                    <div className="mt-4 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summary.email_category_breakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              borderColor: "#e2e8f0",
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Settings preview</h3>
                  <Badge variant="info">Governance controls</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Automation rules</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{settingsPreview.automationRule}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                      <span className="status-dot bg-emerald-500" />
                      Enabled
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">AI tone configuration</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                        style={{ width: `${settingsPreview.tone}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {settingsPreview.tone}% professional | {100 - settingsPreview.tone}% friendly
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Working hours</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {settingsPreview.workingHours.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Lead scoring sensitivity</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: `${settingsPreview.sensitivity}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Balanced for quality + volume</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Role insights</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Narrative summary for {role.toLowerCase()} teams</p>
            </div>
            <Badge variant="info">Role-aware</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {insights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Demo;
