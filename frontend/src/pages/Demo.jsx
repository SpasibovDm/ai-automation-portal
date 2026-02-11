import React, { useRef, useState } from "react";
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
  SparklesIcon,
  SunIcon,
  UserPlusIcon,
} from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { demoRoleData } from "../data/demoData";
import { useRolePreference } from "../hooks/useRolePreference";

const roleHighlights = {
  Sales: ["leads_today", "ai_replies_sent"],
  Support: ["emails_processed", "pending_actions"],
  Founder: ["ai_replies_sent", "emails_processed_30d"],
};

const Demo = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, setRole, roles } = useRolePreference();
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const aiReplyRef = useRef(null);

  const roleData = demoRoleData[role] || demoRoleData.Sales;
  const { summary, leads, emails, activities, insights } = roleData;
  const highlightKeys = roleHighlights[role] || [];

  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 900);
  };

  const handleOnboardingAction = () => {
    setOnboardingStep(2);
    aiReplyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    triggerConfetti();
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-app)] text-slate-900 dark:text-slate-100 app-shell ${
        theme === "dark" ? "dark-shell" : ""
      }`}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AI Automation Portal
              </p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Demo Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleSelector roles={roles} value={role} onChange={setRole} className="hidden lg:inline-flex" />
            <Link
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:inline-flex"
              to="/"
            >
              Back to home
            </Link>
            <Link
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
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

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <ConfettiBurst active={confetti} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="warning">Demo mode</Badge>
                <p className="text-sm font-medium">
                  Demo mode — connect your email to activate full features
                </p>
              </div>
              <Link
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500"
                to="/register"
              >
                Connect email
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Onboarding
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Step {onboardingStep}/3 — See the AI reply
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This demo shows how AI drafts replies with confidence, intent, and tone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOnboardingAction}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Click here to see AI reply
              </button>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 w-1/3 rounded-full bg-indigo-500" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                Inline tips enabled
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                Magic link onboarding
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Role view: {role}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Widgets and KPIs shift based on your responsibilities.
            </p>
          </div>
          <RoleSelector roles={roles} value={role} onChange={setRole} className="lg:hidden" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Lead momentum
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  New lead volume over the last 7 days
                </p>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-300">
                {summary.kpis.leads_generated_30d} leads in 30 days
              </span>
            </div>
            <div className="mt-6 h-64">
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
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Role insights
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focused updates for {role.toLowerCase()} teams
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {insights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              Read-only demo. Connect your inbox to unlock automation.
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sample leads</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prioritized by AI scoring and intent
                </p>
              </div>
              <Badge variant="info">Read-only</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{lead.summary}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={lead.status} />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Score {lead.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Inbox preview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI-labeled inbound emails
                </p>
              </div>
              <Badge variant="info">Read-only</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  <div className="flex items-center justify-between">
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
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Email mix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categories auto-detected by AI
              </p>
            </div>
            <div className="mt-6 h-56">
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
          <div
            ref={aiReplyRef}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                AI reply studio
              </h3>
              <Badge variant="info">Live AI</Badge>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.28em] text-slate-400">AI thinking</span>
                <span className="typing-dot" />
                <span className="typing-dot animation-delay-150" />
                <span className="typing-dot animation-delay-300" />
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                Drafted reply: “Thanks for the pricing request. Based on your 50-seat team, the Growth
                plan fits best. I can share a tailored proposal and ROI summary.”
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                Why this reply was suggested: matches pricing inquiry + high intent keywords.
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Why this lead is high priority: 200+ seats, enterprise domain, urgent timeline.
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Tone 92%
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Intent 88%
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Urgency Medium
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
