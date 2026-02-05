import React, { useEffect, useMemo, useRef, useState } from "react";

import { BotIcon, LineChartIcon, MailIcon, SparklesIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { getAnalyticsOverview } from "../services/api";

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const leadChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const leadChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getAnalyticsOverview();
        setOverview(data);
      } catch (err) {
        setError("Unable to load analytics overview.");
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  const autoReplyRate = useMemo(() => {
    if (!overview?.emails_processed) {
      return 0;
    }
    return Math.round((overview.emails_auto_replied / overview.emails_processed) * 100);
  }, [overview]);

  const leadTrend = useMemo(() => {
    if (!overview?.lead_trend) {
      return { labels: [], values: [] };
    }
    return {
      labels: overview.lead_trend.map((point) =>
        new Date(point.date).toLocaleDateString(undefined, { weekday: "short" })
      ),
      values: overview.lead_trend.map((point) => point.count),
    };
  }, [overview]);

  const emailCategories = useMemo(() => {
    if (!overview?.email_category_breakdown) {
      return { labels: [], values: [] };
    }
    return {
      labels: overview.email_category_breakdown.map((item) => item.category),
      values: overview.email_category_breakdown.map((item) => item.count),
    };
  }, [overview]);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !leadChartRef.current) {
      return undefined;
    }
    if (leadChartInstance.current) {
      leadChartInstance.current.destroy();
    }
    leadChartInstance.current = new Chart(leadChartRef.current, {
      type: "line",
      data: {
        labels: leadTrend.labels,
        datasets: [
          {
            label: "Leads",
            data: leadTrend.values,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
    return () => leadChartInstance.current?.destroy();
  }, [leadTrend]);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !categoryChartRef.current) {
      return undefined;
    }
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }
    categoryChartInstance.current = new Chart(categoryChartRef.current, {
      type: "bar",
      data: {
        labels: emailCategories.labels,
        datasets: [
          {
            label: "Emails",
            data: emailCategories.values,
            backgroundColor: "#60a5fa",
            borderRadius: 10,
            barThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
    return () => categoryChartInstance.current?.destroy();
  }, [emailCategories]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">
          Deep insights into email performance and lead conversion.
        </p>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`analytics-skeleton-${index}`} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Emails processed"
              value={overview?.emails_processed || 0}
              icon={<MailIcon className="h-5 w-5" />}
              helper="Last 30 days"
              trend={`${autoReplyRate}% auto-replied`}
            />
            <StatCard
              label="Leads generated"
              value={overview?.leads_generated || 0}
              icon={<LineChartIcon className="h-5 w-5" />}
              helper="Lead volume"
              trend={`${leadTrend.values.reduce((a, b) => a + b, 0)} in 7 days`}
            />
            <StatCard
              label="AI accuracy"
              value={`${Math.round((overview?.ai_accuracy || 0) * 100)}%`}
              icon={<SparklesIcon className="h-5 w-5" />}
              helper="Edited vs sent as-is"
              trend={`${Math.round((overview?.edited_rate || 0) * 100)}% edited`}
            />
            <StatCard
              label="Time saved"
              value={`${overview?.time_saved_hours || 0} hrs`}
              icon={<BotIcon className="h-5 w-5" />}
              helper="Estimated productivity"
              trend="AI time reclaimed"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Leads trend</h3>
                  <p className="text-xs text-slate-500">Last 7 days volume</p>
                </div>
                <span className="text-xs text-emerald-600">
                  {overview?.leads_generated || 0} leads this month
                </span>
              </div>
              <div className="mt-6 h-56">
                {leadTrend.values.length ? (
                  <canvas ref={leadChartRef} />
                ) : (
                  <Skeleton className="h-56" />
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Email categories</h3>
                  <p className="text-xs text-slate-500">Inbound breakdown</p>
                </div>
                <span className="text-xs text-slate-500">
                  {overview?.emails_processed || 0} emails
                </span>
              </div>
              <div className="mt-6 h-56">
                {emailCategories.values.length ? (
                  <canvas ref={categoryChartRef} />
                ) : (
                  <Skeleton className="h-56" />
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
