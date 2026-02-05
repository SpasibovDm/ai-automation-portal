import React, { useEffect, useMemo, useRef, useState } from "react";

import EmptyState from "../components/EmptyState";
import {
  BotIcon,
  ClockIcon,
  MailIcon,
  SparklesIcon,
  UserPlusIcon,
} from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import {
  getAnalyticsOverview,
  getDashboardActivity,
  getDashboardStats,
  getDashboardUrgent,
} from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    leads_today: 0,
    emails_today: 0,
    replies_sent: 0,
  });
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [activityFeed, setActivityFeed] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [urgentLoading, setUrgentLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [urgentError, setUrgentError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineInstance = useRef(null);
  const barInstance = useRef(null);

  const leadTrendData = useMemo(() => {
    if (!overview?.lead_trend) {
      return { labels: [], values: [] };
    }
    const labels = overview.lead_trend.map((point) =>
      new Date(point.date).toLocaleDateString(undefined, { weekday: "short" })
    );
    const values = overview.lead_trend.map((point) => point.count);
    return { labels, values };
  }, [overview]);

  const emailCategoryData = useMemo(() => {
    if (!overview?.email_category_breakdown) {
      return { labels: [], values: [] };
    }
    return {
      labels: overview.email_category_breakdown.map((item) => item.category),
      values: overview.email_category_breakdown.map((item) => item.count),
    };
  }, [overview]);

  const pendingActions = useMemo(
    () => Math.max(stats.total_leads - stats.replies_sent, 0),
    [stats]
  );

  const autoReplyRate = useMemo(() => {
    if (!overview?.emails_processed) {
      return 0;
    }
    return Math.round((overview.emails_auto_replied / overview.emails_processed) * 100);
  }, [overview]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError("Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getAnalyticsOverview();
        setOverview(data);
      } catch (err) {
        setOverviewError("Unable to load performance trends.");
      } finally {
        setOverviewLoading(false);
      }
    };
    loadOverview();
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const data = await getDashboardActivity();
        setActivityFeed(data.ai_activity || []);
        setRecentActivity(data.recent_activity || []);
      } catch (err) {
        setActivityError("Unable to load AI activity.");
      } finally {
        setActivityLoading(false);
      }
    };
    loadActivity();
  }, []);

  useEffect(() => {
    const loadUrgent = async () => {
      try {
        const data = await getDashboardUrgent();
        setUrgentItems(data.items || []);
      } catch (err) {
        setUrgentError("Unable to load urgent items.");
      } finally {
        setUrgentLoading(false);
      }
    };
    loadUrgent();
  }, []);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !lineChartRef.current) {
      return undefined;
    }
    if (lineInstance.current) {
      lineInstance.current.destroy();
    }
    lineInstance.current = new Chart(lineChartRef.current, {
      type: "line",
      data: {
        labels: leadTrendData.labels,
        datasets: [
          {
            label: "Leads",
            data: leadTrendData.values,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 12 } },
          },
          y: {
            ticks: { color: "#94a3b8", font: { size: 12 } },
            grid: { color: "#e2e8f0" },
          },
        },
      },
    });
    return () => lineInstance.current?.destroy();
  }, [leadTrendData]);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !barChartRef.current) {
      return undefined;
    }
    if (barInstance.current) {
      barInstance.current.destroy();
    }
    barInstance.current = new Chart(barChartRef.current, {
      type: "bar",
      data: {
        labels: emailCategoryData.labels,
        datasets: [
          {
            label: "Emails",
            data: emailCategoryData.values,
            backgroundColor: "#818cf8",
            borderRadius: 10,
            barThickness: 22,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 12 } },
          },
          y: {
            ticks: { color: "#94a3b8", font: { size: 12 } },
            grid: { color: "#e2e8f0" },
          },
        },
      },
    });
    return () => barInstance.current?.destroy();
  }, [emailCategoryData]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Snapshot of incoming business activity.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 md:flex">
          <ClockIcon className="h-4 w-4" />
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Syncing data"}
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
            value={stats.leads_today}
            icon={<UserPlusIcon className="h-5 w-5" />}
            helper="High intent contacts"
            trend={`${stats.total_leads} total`}
          />
          <StatCard
            label="Emails Processed"
            value={stats.emails_today}
            icon={<MailIcon className="h-5 w-5" />}
            helper="Last 24 hours"
            trend={`${overview?.emails_processed || 0} in 30 days`}
          />
          <StatCard
            label="AI Replies Sent"
            value={stats.replies_sent}
            icon={<BotIcon className="h-5 w-5" />}
            helper="Generated by AI"
            trend={`${autoReplyRate}% auto-replied`}
          />
          <StatCard
            label="Pending Actions"
            value={pendingActions}
            icon={<ClockIcon className="h-5 w-5" />}
            helper="Awaiting review"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Leads per day</h3>
              <p className="text-xs text-slate-500">Last 7 days conversion funnel</p>
            </div>
            <span className="text-xs text-emerald-600">
              {overview?.leads_generated || 0} leads in 30 days
            </span>
          </div>
          <div className="mt-6 h-64">
            {overviewLoading ? (
              <Skeleton className="h-64" />
            ) : leadTrendData.values.length ? (
              <canvas ref={lineChartRef} />
            ) : (
              <EmptyState
                title="No lead activity"
                description="Leads will appear once inbound traffic starts."
                icon={<UserPlusIcon className="h-6 w-6" />}
              />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Emails by category</h3>
            <p className="text-xs text-slate-500">Distribution of inbound conversations</p>
          </div>
          <div className="mt-6 h-64">
            {overviewLoading ? (
              <Skeleton className="h-64" />
            ) : emailCategoryData.values.length ? (
              <canvas ref={barChartRef} />
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">AI Activity Feed</h3>
              <p className="text-xs text-slate-500">Real-time automation events</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
            >
              View all
            </button>
          </div>
          {activityLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`activity-skeleton-${index}`} className="h-14" />
              ))}
            </div>
          ) : activityError && !activityFeed.length ? (
            <div className="mt-6 text-xs text-rose-500">{activityError}</div>
          ) : activityFeed.length ? (
            <div className="mt-6 space-y-4">
              {activityFeed.map((activity) => (
                <div
                  key={`${activity.title}-${activity.id}`}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(activity.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No AI activity yet"
                description="AI events will show up as soon as automation kicks in."
                icon={<SparklesIcon className="h-6 w-6" />}
              />
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Urgent Items</h3>
              <p className="text-xs text-slate-500">Items needing human review</p>
            </div>
          </div>
          {urgentLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`urgent-skeleton-${index}`} className="h-14" />
              ))}
            </div>
          ) : urgentError && !urgentItems.length ? (
            <div className="mt-6 text-xs text-rose-500">{urgentError}</div>
          ) : urgentItems.length ? (
            <div className="mt-6 space-y-3">
              {urgentItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <StatusBadge status={item.level} label={item.level} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="All clear"
                description="No urgent items are waiting for review."
                icon={<SparklesIcon className="h-6 w-6" />}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
              <p className="text-xs text-slate-500">Latest system events</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
            >
              View all
            </button>
          </div>
          {activityLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`recent-skeleton-${index}`} className="h-14" />
              ))}
            </div>
          ) : recentActivity.length ? (
            <div className="mt-6 space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.title}-${activity.id}`}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
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
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Automation pulse</h3>
              <p className="text-xs text-slate-500">AI performance highlights</p>
            </div>
          </div>
          {overviewLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`pulse-skeleton-${index}`} className="h-12" />
              ))}
            </div>
          ) : overview ? (
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span>AI accuracy</span>
                <span className="font-semibold text-slate-800">
                  {Math.round((overview.ai_accuracy || 0) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span>Time saved</span>
                <span className="font-semibold text-slate-800">
                  {overview.time_saved_hours} hrs
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span>Auto-reply rate</span>
                <span className="font-semibold text-slate-800">{autoReplyRate}%</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-xs text-rose-500">{overviewError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
