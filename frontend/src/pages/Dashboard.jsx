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
import { getDashboardActivity, getDashboardStats, getDashboardUrgent } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    leads_today: 0,
    emails_today: 0,
    replies_sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityFeed, setActivityFeed] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [urgentLoading, setUrgentLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [urgentError, setUrgentError] = useState("");
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineInstance = useRef(null);
  const barInstance = useRef(null);

  const leadTrendData = useMemo(
    () => ({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [14, 20, 18, 25, 31, 27, 22],
    }),
    []
  );

  const emailCategoryData = useMemo(
    () => ({
      labels: ["Lead", "Support", "Billing", "Other"],
      values: [34, 21, 12, 8],
    }),
    []
  );

  const recentActivity = useMemo(
    () => [
      {
        title: "AI replied to a new lead",
        detail: "Pricing inquiry from HubSpot form",
        time: "2 min ago",
      },
      {
        title: "New email received",
        detail: "Support request · onboarding@acme.io",
        time: "25 min ago",
      },
      {
        title: "Template updated",
        detail: "New lead follow-up v2",
        time: "1 hour ago",
      },
    ],
    []
  );

  const aiActivity = useMemo(
    () => [
      { message: "AI classified 5 emails", time: "Today, 9:42 AM" },
      { message: "AI generated 3 replies", time: "Today, 10:15 AM" },
      { message: "AI suggested 2 follow-ups", time: "Today, 12:30 PM" },
    ],
    []
  );

  const fallbackActivityFeed = useMemo(
    () => [
      { title: "AI classified email", detail: "Lead inquiry · /sales", time: "Just now" },
      { title: "AI generated reply", detail: "Follow-up to trial request", time: "12 min ago" },
      { title: "New lead detected", detail: "Inbound chat widget", time: "35 min ago" },
    ],
    []
  );

  const fallbackUrgentItems = useMemo(
    () => [
      {
        title: "Emails waiting for approval",
        detail: "5 replies queued · 2 high priority",
        level: "high",
      },
      {
        title: "Leads without reply > 24h",
        detail: "3 leads need a follow-up sequence",
        level: "medium",
      },
      {
        title: "Low confidence AI replies",
        detail: "2 drafts below 70% confidence",
        level: "low",
      },
    ],
    []
  );

  const pendingActions = useMemo(
    () => Math.max(stats.total_leads - stats.replies_sent, 0),
    [stats]
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const data = await getDashboardActivity();
        setActivityFeed(data);
      } catch (err) {
        setActivityError("Unable to load AI activity.");
        setActivityFeed(fallbackActivityFeed);
      } finally {
        setActivityLoading(false);
      }
    };
    loadActivity();
  }, [fallbackActivityFeed]);

  useEffect(() => {
    const loadUrgent = async () => {
      try {
        const data = await getDashboardUrgent();
        setUrgentItems(data);
      } catch (err) {
        setUrgentError("Unable to load urgent items.");
        setUrgentItems(fallbackUrgentItems);
      } finally {
        setUrgentLoading(false);
      }
    };
    loadUrgent();
  }, [fallbackUrgentItems]);

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
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            fill: true,
            tension: 0.4,
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
            borderRadius: 8,
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
          Updated just now
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
            trend="+18%"
          />
          <StatCard
            label="Emails Processed"
            value={stats.emails_today}
            icon={<MailIcon className="h-5 w-5" />}
            helper="Last 24 hours"
            trend="+12%"
          />
          <StatCard
            label="AI Replies Sent"
            value={stats.replies_sent}
            icon={<BotIcon className="h-5 w-5" />}
            helper="Quality score 94%"
            trend="+6%"
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
            <span className="text-xs text-emerald-600">+8.4% vs last week</span>
          </div>
          <div className="mt-6 h-64">
            <canvas ref={lineChartRef} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Emails by category</h3>
            <p className="text-xs text-slate-500">Distribution of inbound conversations</p>
          </div>
          <div className="mt-6 h-64">
            <canvas ref={barChartRef} />
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
          ) : (
            <div className="mt-6 space-y-4">
              {activityFeed.map((activity) => (
                <div
                  key={`${activity.title}-${activity.time}`}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
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
          ) : (
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
          <div className="mt-6 space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.title}
                className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">AI activity</h3>
              <p className="text-xs text-slate-500">Automation visibility</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {aiActivity.map((activity) => (
              <div
                key={activity.message}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span role="img" aria-label="robot">
                    🤖
                  </span>
                  {activity.message}
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
