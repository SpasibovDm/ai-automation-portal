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
import PitchCallout from "../components/PitchCallout";
import PitchMetricStrip from "../components/PitchMetricStrip";
import RoleSelector from "../components/RoleSelector";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { useWorkspace } from "../context/WorkspaceContext";
import { useRolePreference } from "../hooks/useRolePreference";
import { getDashboardSummary } from "../services/api";
import { getErrorMessage } from "../utils/httpError";

const roleHighlights = {
  Sales: ["leads_today", "ai_replies_sent"],
  Support: ["emails_processed", "pending_actions"],
  Founder: ["ai_replies_sent", "emails_processed_30d"],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { workspace, adjustMetric, scopeCollection, pitchMode } = useWorkspace();
  const { role, setRole, roles } = useRolePreference();
  const onboardingStorageKey = `automation-onboarding-step-${workspace.id}`;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }
    return Number(localStorage.getItem(onboardingStorageKey) || 1);
  });
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setOnboardingStep(Number(localStorage.getItem(onboardingStorageKey) || 1));
  }, [onboardingStorageKey]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary();
        const scopedSummary = {
          ...data,
          kpis: {
            ...data.kpis,
            leads_today: adjustMetric(data?.kpis?.leads_today || 0, { min: 0 }),
            total_leads: adjustMetric(data?.kpis?.total_leads || 0, { min: 0 }),
            emails_processed: adjustMetric(data?.kpis?.emails_processed || 0, { min: 0 }),
            emails_processed_30d: adjustMetric(data?.kpis?.emails_processed_30d || 0, { min: 0 }),
            ai_replies_sent: adjustMetric(data?.kpis?.ai_replies_sent || 0, { min: 0 }),
            ai_replies_sent_30d: adjustMetric(data?.kpis?.ai_replies_sent_30d || 0, { min: 0 }),
            pending_actions: adjustMetric(data?.kpis?.pending_actions || 0, { min: 0 }),
            leads_generated_30d: adjustMetric(data?.kpis?.leads_generated_30d || 0, { min: 0 }),
          },
          charts: {
            ...data.charts,
            lead_trend: scopeCollection(data?.charts?.lead_trend || [], { min: 4 }).map((point) => ({
              ...point,
              count: adjustMetric(point.count || 0, { min: 0 }),
            })),
            email_category_breakdown: scopeCollection(data?.charts?.email_category_breakdown || [], {
              min: 3,
            }).map((item) => ({
              ...item,
              count: adjustMetric(item.count || 0, { min: 0 }),
            })),
            lead_status_funnel: scopeCollection(data?.charts?.lead_status_funnel || [], { min: 3 }).map(
              (stage) => ({
                ...stage,
                count: adjustMetric(stage.count || 0, { min: 0 }),
              })
            ),
          },
          recent_activity: scopeCollection(data?.recent_activity || [], { min: 5 }),
        };
        setSummary(scopedSummary);
        setLastUpdated(new Date());
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load dashboard summary."));
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [adjustMetric, scopeCollection, workspace.id]);

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

  const roleWorkspace = useMemo(() => {
    const configs = {
      Sales: {
        title: "Sales default widgets",
        subtitle: "Pipeline velocity, intent score, and next-best actions",
        widgets: [
          {
            label: "High-intent queue",
            value: "12 leads",
            detail: "Ready for same-day follow-up",
          },
          {
            label: "Pricing requests",
            value: "7 threads",
            detail: "Auto-routed to account executives",
          },
          {
            label: "Reply acceptance",
            value: "93%",
            detail: "AI drafts accepted without edits",
          },
        ],
      },
      Support: {
        title: "Support default widgets",
        subtitle: "SLA risk, escalations, and response readiness",
        widgets: [
          {
            label: "SLA risk queue",
            value: "5 tickets",
            detail: "Prioritized by urgency and account tier",
          },
          {
            label: "Escalation lane",
            value: "3 active",
            detail: "Critical conversations under live watch",
          },
          {
            label: "Auto-resolution",
            value: "28%",
            detail: "Resolved through guided AI responses",
          },
        ],
      },
      Founder: {
        title: "Founder default widgets",
        subtitle: "Executive KPIs, governance, and growth signal",
        widgets: [
          {
            label: "Pipeline forecast",
            value: "$2.4M",
            detail: "Projected qualified pipeline this quarter",
          },
          {
            label: "AI governance",
            value: "95%",
            detail: "Policy-safe replies across teams",
          },
          {
            label: "NRR signal",
            value: "118%",
            detail: "Expansion and retention trend",
          },
        ],
      },
    };
    return configs[role] || configs.Sales;
  }, [role]);

  const pitchMetrics = useMemo(() => {
    const aiReplies30d = summary?.kpis?.ai_replies_sent_30d || 186;
    const leads30d = summary?.kpis?.leads_generated_30d || 64;
    const hoursSaved = adjustMetric((aiReplies30d * 4.1) / 60, { min: 74 });
    const revenueInfluenced = adjustMetric(leads30d * 7200, { min: 180000 });
    const conversionUplift = Math.max(8, Math.min(27, Math.round((aiReplies30d / 12) * 0.9)));
    const burnReduction = Math.max(5, Math.min(21, Math.round((hoursSaved * 78) / 1000)));

    return [
      {
        label: "Hours saved",
        value: `${hoursSaved}h`,
        detail: "Automated triage and reply drafting this cycle.",
      },
      {
        label: "Revenue influenced",
        value: `$${revenueInfluenced.toLocaleString()}`,
        detail: "Pipeline value touched by scored and replied conversations.",
      },
      {
        label: "Conversion uplift",
        value: `+${conversionUplift}%`,
        detail: "Lead-to-opportunity movement after AI-first response.",
      },
      {
        label: "Burn reduction",
        value: `-${burnReduction}%`,
        detail: "Lower manual ops load across sales and support.",
      },
    ];
  }, [adjustMetric, summary?.kpis?.ai_replies_sent_30d, summary?.kpis?.leads_generated_30d]);

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
        actionLabel: "Click here to see AI reply",
        action: () => navigate("/app/inbox"),
      },
      {
        title: "Create your templates",
        description: "Align tone, intent, and escalation rules.",
        actionLabel: "Open templates",
        action: () => navigate("/app/ai-templates"),
      },
    ],
    [navigate]
  );

  const currentOnboarding = onboardingSteps[Math.min(onboardingStep - 1, onboardingSteps.length - 1)];
  const progressPercent = Math.min((onboardingStep / onboardingSteps.length) * 100, 100);

  const handleOnboardingAction = () => {
    const nextStep = Math.min(onboardingStep + 1, onboardingSteps.length);
    setOnboardingStep(nextStep);
    localStorage.setItem(onboardingStorageKey, String(nextStep));
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
              Step {onboardingStep}/3 - {currentOnboarding.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {currentOnboarding.description}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOnboardingAction}
            className={`rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 ${
              onboardingStep === 2 ? "animate-slow-pulse" : ""
            }`}
          >
            {currentOnboarding.actionLabel}
          </button>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {onboardingStep === 2
            ? "Tip: Click here to see AI reply and review confidence indicators."
            : "Tip: Invite your team once AI replies feel on-brand."}
        </div>
      </div>

      {pitchMode ? (
        <PitchMetricStrip metrics={pitchMetrics} />
      ) : null}

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
          impact="Dashboard confidence depends on timely AI and pipeline telemetry."
          icon={<SparklesIcon className="h-6 w-6" />}
          actionLabel="Open system status"
          actionTo="/app/status"
        />
      ) : (
        <div className="space-y-4">
          {pitchMode ? (
            <PitchCallout
              feature="KPI tiles surface where AI creates immediate operational leverage."
              problem="Teams struggle to prioritize without a clear read on demand velocity."
              kpi="Leads/day, first-response capacity, and AI reply throughput."
              impact="Execs can quantify momentum in under 30 seconds."
            />
          ) : null}
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
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          {pitchMode ? (
            <PitchCallout
              className="mb-4"
              feature="Lead trend predicts upcoming quota risk and staffing pressure."
              problem="Manual reporting reveals pipeline shifts too late."
              kpi="Pipeline velocity and forecast confidence."
              impact="Teams react earlier and reduce missed pipeline targets."
            />
          ) : null}
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
                description="Connect inbound channels to populate lead momentum automatically."
                impact="Lead trend tracking helps allocate team bandwidth before pipeline bottlenecks."
                icon={<UserPlusIcon className="h-6 w-6" />}
                actionLabel="Open settings"
                actionTo="/app/settings"
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
                description="Connect inbox providers to classify conversations by category."
                impact="Category visibility helps route sales and support requests accurately."
                icon={<MailIcon className="h-6 w-6" />}
                actionLabel="Connect inbox"
                actionTo="/app/settings"
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
                description="Lead stages appear after AI scoring and status updates are active."
                impact="Pipeline health is needed for forecasting and board reporting."
                icon={<SparklesIcon className="h-6 w-6" />}
                actionLabel="Open leads"
                actionTo="/app/leads"
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
                description="Team and AI actions will stream here after leads are processed."
                impact="Transparent activity history improves trust and accountability."
                icon={<SparklesIcon className="h-6 w-6" />}
                actionLabel="View inbox"
                actionTo="/app/inbox"
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
                {roleWorkspace.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {roleWorkspace.subtitle}
              </p>
            </div>
            <Badge variant="info">Role aware</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {roleWorkspace.widgets.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                <p className="uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                <p className="mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">{roleFocus.title}</p>
            <p className="mt-1">{roleFocus.items[0]}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          {pitchMode ? (
            <PitchCallout
              className="mb-4"
              feature="Explainability blocks remove black-box risk in buyer conversations."
              problem="Leadership cannot trust AI decisions without visible reasoning."
              kpi="Reply acceptance rate and policy-safe automation coverage."
              impact="Higher AI adoption with lower review overhead."
            />
          ) : null}
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
