import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
import EmptyState from "../components/EmptyState";
import { BotIcon, ClockIcon, LineChartIcon, MailIcon, SparklesIcon, UserPlusIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { useWorkspace } from "../context/WorkspaceContext";
import { getAnalyticsOverview, getEmails } from "../services/api";

const getLast7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }
  return days;
};

const Analytics = () => {
  const { workspace, userRole, adjustMetric, scopeCollection } = useWorkspace();
  const [overview, setOverview] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const data = await getAnalyticsOverview();
        setOverview({
          ...data,
          emails_processed: adjustMetric(data?.emails_processed || 0, { min: 0 }),
          leads_generated: adjustMetric(data?.leads_generated || 0, { min: 0 }),
          emails_auto_replied: adjustMetric(data?.emails_auto_replied || 0, { min: 0 }),
          time_saved_hours: adjustMetric(data?.time_saved_hours || 0, { min: 0 }),
          ai_accuracy: Math.min(0.99, Number(data?.ai_accuracy || 0.72) * (workspace.metricMultiplier * 0.95)),
          edited_rate: Math.min(0.7, Number(data?.edited_rate || 0.18) * (2 - workspace.metricMultiplier)),
          lead_trend: scopeCollection(data?.lead_trend || [], { min: 4 }).map((point) => ({
            ...point,
            count: adjustMetric(point.count || 0, { min: 0 }),
          })),
        });
      } catch (err) {
        setError("Unable to load analytics overview.");
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [adjustMetric, scopeCollection, workspace.id, workspace.metricMultiplier]);

  useEffect(() => {
    const loadEmails = async () => {
      setEmailLoading(true);
      try {
        const data = await getEmails();
        setEmails(scopeCollection(data, { min: 2 }));
      } catch (err) {
        setEmails([]);
      } finally {
        setEmailLoading(false);
      }
    };
    loadEmails();
  }, [scopeCollection, workspace.id]);

  const leadTrend = useMemo(() => {
    if (!overview?.lead_trend) {
      return [];
    }
    return overview.lead_trend.map((point) => ({
      day: new Date(point.date).toLocaleDateString(undefined, { weekday: "short" }),
      leads: point.count,
    }));
  }, [overview]);

  const emailVolume = useMemo(() => {
    const days = getLast7Days();
    return days.map((date) => {
      const dayKey = date.toDateString();
      const count = emails.filter((email) => new Date(email.received_at).toDateString() === dayKey).length;
      return {
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        emails: adjustMetric(count, { min: 0 }),
      };
    });
  }, [adjustMetric, emails]);

  const businessMetrics = useMemo(() => {
    const leadsGenerated = overview?.leads_generated || 0;
    const emailsProcessed = overview?.emails_processed || 0;
    const timeSavedHours = overview?.time_saved_hours || 0;

    const revenueInfluenced = adjustMetric(leadsGenerated * 4200, { min: 0 });
    const responseMinutesSaved = adjustMetric(timeSavedHours * 60, { min: 0 });
    const leadsRecovered = adjustMetric(Math.round(leadsGenerated * 0.28), { min: 0 });
    const missedPrevented = adjustMetric(Math.round(emailsProcessed * 0.14), { min: 0 });

    return {
      revenueInfluenced,
      responseMinutesSaved,
      leadsRecovered,
      missedPrevented,
    };
  }, [adjustMetric, overview?.emails_processed, overview?.leads_generated, overview?.time_saved_hours]);

  const impactTrend = useMemo(() => {
    const base = businessMetrics.revenueInfluenced || 0;
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    return months.map((month, index) => ({
      month,
      revenue: Math.round(base * (0.62 + index * 0.08)),
      recovered: Math.round((businessMetrics.leadsRecovered || 0) * (0.55 + index * 0.09)),
    }));
  }, [businessMetrics.leadsRecovered, businessMetrics.revenueInfluenced]);

  const responseImpact = useMemo(() => {
    const base = businessMetrics.responseMinutesSaved || 0;
    return [
      { label: "AI drafting", value: Math.round(base * 0.38) },
      { label: "Auto-routing", value: Math.round(base * 0.29) },
      { label: "Smart scoring", value: Math.round(base * 0.21) },
      { label: "Template reuse", value: Math.round(base * 0.12) },
    ];
  }, [businessMetrics.responseMinutesSaved]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Business analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Metrics tied to revenue, speed, and opportunities protected by automation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`analytics-skeleton-${index}`} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          {error ? (
            <EmptyState
              title="Analytics unavailable"
              description={error}
              impact="Revenue impact cannot be measured until analytics pipelines recover."
              icon={<LineChartIcon className="h-6 w-6" />}
              actionLabel="Open system status"
              actionTo="/app/status"
            />
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue influenced by AI"
              value={`$${businessMetrics.revenueInfluenced.toLocaleString()}`}
              icon={<LineChartIcon className="h-5 w-5" />}
              helper="Pipeline value touched by automation"
              trend="Tracked from scored and replied leads"
            />
            <StatCard
              label="Response time saved"
              value={`${businessMetrics.responseMinutesSaved.toLocaleString()} min`}
              icon={<ClockIcon className="h-5 w-5" />}
              helper="Minutes reclaimed in this period"
              trend="AI drafting + routing + templates"
            />
            <StatCard
              label="Leads recovered"
              value={businessMetrics.leadsRecovered}
              icon={<UserPlusIcon className="h-5 w-5" />}
              helper="Recovered before churn or drop-off"
              trend="Recovered via automation nudges"
            />
            <StatCard
              label="Missed opportunities prevented"
              value={businessMetrics.missedPrevented}
              icon={<SparklesIcon className="h-5 w-5" />}
              helper="High-risk threads intercepted"
              trend="Escalation alerts + SLA routing"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue and recovery trend</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Business impact over the last six periods
                  </p>
                </div>
                <Badge variant="success">AI influence</Badge>
              </div>
              <div className="mt-6 h-56">
                {impactTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={impactTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
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
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: "#2563eb", r: 3 }}
                        name="Revenue influenced"
                      />
                      <Line
                        type="monotone"
                        dataKey="recovered"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ fill: "#0ea5e9", r: 3 }}
                        name="Leads recovered"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-56" />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Where time was saved</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Minutes by automation function</p>
                </div>
                <BotIcon className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseImpact}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lead flow velocity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daily lead volume in current workspace</p>
                </div>
                <Badge variant="info">Scored leads</Badge>
              </div>
              <div className="mt-6 h-52">
                {leadTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={leadTrend}>
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
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="#14b8a6"
                        fill="rgba(20, 184, 166, 0.22)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    title="No lead flow yet"
                    description="Connect channels to start measuring revenue pipeline velocity."
                    impact="Lead trend visibility is critical for capacity and forecasting."
                    icon={<UserPlusIcon className="h-6 w-6" />}
                    actionLabel="Open settings"
                    actionTo="/app/settings"
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Inbox throughput</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Inbound email volume over the last seven days</p>
                </div>
                <MailIcon className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-6 h-52">
                {emailLoading ? (
                  <Skeleton className="h-52" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emailVolume}>
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
                      <Area
                        type="monotone"
                        dataKey="emails"
                        stroke="#0ea5e9"
                        fill="rgba(14, 165, 233, 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
