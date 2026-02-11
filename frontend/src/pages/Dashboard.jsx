import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import EmptyState from "../components/EmptyState";
import { BotIcon, ClockIcon, MailIcon, SparklesIcon, UserPlusIcon } from "../components/Icons";
import RoleSelector from "../components/RoleSelector";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { useRolePreference } from "../hooks/useRolePreference";
import { getDashboardSummary } from "../services/api";

const roleHighlights = {
  Sales: ["leads_today", "ai_replies_sent"],
  Support: ["emails_processed", "pending_actions"],
  Founder: ["ai_replies_sent", "emails_processed_30d"],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { role, setRole, roles } = useRolePreference();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    return Number(localStorage.getItem("automation-onboarding-step") || 1);
  });
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError("Unable to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const leadTrendData = useMemo(() => {
    if (!summary?.charts?.lead_trend) {
      return [];
    }
    return summary.charts.lead_trend.map((point) => ({
      day: new Date(point.date).toLocaleDateString(undefined, { weekday: "short" }),
      leads: point.count,
    }));
  }, [summary]);

  const emailCategoryData = useMemo(() => {
    if (!summary?.charts?.email_category_breakdown) {
      return [];
    }
    return summary.charts.email_category_breakdown.map((item) => ({
      category: item.category,
      count: item.count,
    }));
  }, [summary]);

  const statusFunnel = useMemo(
    () => summary?.charts?.lead_status_funnel || [],
    [summary]
  );

  const recentActivity = useMemo(
    () => summary?.recent_activity?.slice(0, 10) || [],
    [summary]
  );

  const highlightKeys = roleHighlights[role] || [];
  const roleFocus = useMemo(() => {
    const configs = {
      Sales: {
        title: "Deal focus",
        items: [
          "3 enterprise leads require follow-up today",
          "AI flagged 12 high-intent buyers",
          "Pipeline coverage at 92%",
        ],
      },
      Support: {
        title: "Support focus",
        items: [
          "5 tickets are nearing SLA",
          "AI resolved 28% of inbound requests",
          "Escalations down 12% this week",
        ],
      },
      Founder: {
        title: "Executive focus",
        items: [
          "AI handled 74% of inbound volume",
          "Net revenue retention projected at 118%",
          "Average response time is 6 min",
        ],
      },
    };
    return configs[role] || configs.Sales;
  }, [role]);

  const onboardingSteps = useMemo(
    () => [
      {
        title: "Connect your inbox",
        description: "Link Gmail or Microsoft 365 to unlock AI routing.",
        actionLabel: "Open settings",
        action: () => navigate("/app/settings"),
      },
      {
        title: "Review an AI reply",
        description: "See the reply studio personalize your next response.",
        actionLabel: "View AI replies",
        action: () => navigate("/app/emails"),
      },
      {
        title: "Create your templates",
        description: "Align tone, intent, and escalation rules.",
        actionLabel: "Open templates",
        action: () => navigate("/app/templates"),
      },
    ],
    [navigate]
  );

  const currentOnboarding = onboardingSteps[Math.min(onboardingStep - 1, onboardingSteps.length - 1)];
  const progressPercent = Math.min((onboardingStep / onboardingSteps.length) * 100, 100);

  const handleOnboardingAction = () => {
    const nextStep = Math.min(onboardingStep + 1, onboardingSteps.length);
    setOnboardingStep(nextStep);
    localStorage.setItem("automation-onboarding-step", String(nextStep));
    setConfetti(true);
    setTimeout(() => setConfetti(false), 900);
    currentOnboarding.action();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Revenue command center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live view of lead flow, inbox automation, and AI coverage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RoleSelector roles={roles} value={role} onChange={setRole} />
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <ClockIcon className="h-4 w-4" />
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Syncing data"}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
        <ConfettiBurst active={confetti} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Quick start
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              Step {onboardingStep}/3 — {currentOnboarding.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {currentOnboarding.description}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOnboardingAction}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {currentOnboarding.actionLabel}
          </button>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Tip: Invite your team once AI replies feel on-brand.
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`metric-${index}`} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Unable to load metrics"
          description={error}
          icon={<SparklesIcon className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="New Leads Today"
            value={summary?.kpis?.leads_today || 0}
            icon={<UserPlusIcon className="h-5 w-5" />}
            helper="High intent contacts"
            trend={`${summary?.kpis?.total_leads || 0} total`}
            highlight={highlightKeys.includes("leads_today")}
          />
          <StatCard
            label="Emails Processed"
            value={summary?.kpis?.emails_processed || 0}
            icon={<MailIcon className="h-5 w-5" />}
            helper="Last 24 hours"
            trend={`${summary?.kpis?.emails_processed_30d || 0} in 30 days`}
            highlight={highlightKeys.includes("emails_processed")}
          />
          <StatCard
            label="AI Replies Sent"
            value={summary?.kpis?.ai_replies_sent || 0}
            icon={<BotIcon className="h-5 w-5" />}
            helper="Generated by AI"
            trend={`${summary?.kpis?.ai_replies_sent_30d || 0} auto`}
            highlight={highlightKeys.includes("ai_replies_sent")}
          />
          <StatCard
            label="Pending Actions"
            value={summary?.kpis?.pending_actions || 0}
            icon={<ClockIcon className="h-5 w-5" />}
            helper="Awaiting review"
            highlight={highlightKeys.includes("pending_actions")}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Leads over time
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New lead volume over the last 7 days
              </p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-300">
              {summary?.kpis?.leads_generated_30d || 0} leads in 30 days
            </span>
          </div>
          <div className="mt-6 h-64">
            {loading ? (
              <Skeleton className="h-64" />
            ) : leadTrendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadTrendData}>
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
            ) : (
              <EmptyState
                title="No lead activity"
                description="Leads will appear once inbound traffic starts."
                icon={<UserPlusIcon className="h-6 w-6" />}
              />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Emails by category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of inbound conversations
            </p>
          </div>
          <div className="mt-6 h-64">
            {loading ? (
              <Skeleton className="h-64" />
            ) : emailCategoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailCategoryData}>
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
                  <Bar dataKey="count" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No emails yet"
                description="Once an inbox is connected, categories will populate here."
                icon={<MailIcon className="h-6 w-6" />}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Lead status funnel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pipeline distribution across active stages
              </p>
            </div>
            <Badge variant="info">Pipeline health</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`funnel-${index}`} className="h-10" />
                ))}
              </div>
            ) : statusFunnel.length ? (
              statusFunnel.map((stage, index) => (
                <div key={`${stage.status}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span className="capitalize">{stage.status.replace("_", " ")}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stage.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{
                        width: `${Math.max(stage.percentage || 0, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No pipeline data"
                description="Lead stages will appear as you classify inbound requests."
                icon={<SparklesIcon className="h-6 w-6" />}
              />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 10 system events
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {recentActivity.length} events
            </span>
          </div>
          {loading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`recent-${index}`} className="h-12" />
              ))}
            </div>
          ) : recentActivity.length ? (
            <div className="mt-6 space-y-4">
              {recentActivity.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    {index !== recentActivity.length - 1 ? (
                      <span className="mt-1 h-full w-px bg-slate-200 dark:bg-slate-700" />
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {entry.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entry.detail || "No additional details"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No events yet"
                description="New activity will appear as the team engages leads."
                icon={<SparklesIcon className="h-6 w-6" />}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {roleFocus.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized for the {role.toLowerCase()} role
              </p>
            </div>
            <Badge variant="info">Role aware</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {roleFocus.items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI explainability
            </h3>
          </div>
          <div className="mt-5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              Why this lead is high priority: enterprise domain, 200+ seats, urgent timeline.
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              Why this reply was suggested: matches pricing inquiry + high intent keywords.
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                Tone 92%
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                Intent 88%
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                Urgency Medium
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
