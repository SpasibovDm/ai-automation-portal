import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BotIcon, LineChartIcon, MailIcon, SparklesIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
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
  const [overview, setOverview] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await getEmails();
        setEmails(data);
      } catch (err) {
        setEmails([]);
      } finally {
        setEmailLoading(false);
      }
    };
    loadEmails();
  }, []);

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
    const counts = days.map((date) => {
      const dayKey = date.toDateString();
      const count = emails.filter((email) =>
        new Date(email.received_at).toDateString() === dayKey
      ).length;
      return {
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        emails: count,
      };
    });
    return counts;
  }, [emails]);

  const autoReplyRate = useMemo(() => {
    if (!overview?.emails_processed) {
      return 0;
    }
    return Math.round((overview.emails_auto_replied / overview.emails_processed) * 100);
  }, [overview]);

  const replyRateData = useMemo(
    () => [
      { name: "Auto", value: autoReplyRate },
      { name: "Manual", value: 100 - autoReplyRate },
    ],
    [autoReplyRate]
  );

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
              trend={`${leadTrend.reduce((sum, item) => sum + item.leads, 0)} in 7 days`}
            />
            <StatCard
              label="AI accuracy"
              value={`${Math.round((overview?.ai_accuracy || 0) * 100)}%`}
              icon={<SparklesIcon className="h-5 w-5" />}
              helper="Edited vs sent"
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
                  <h3 className="text-sm font-semibold text-slate-900">Leads per week</h3>
                  <p className="text-xs text-slate-500">Last 7 days volume</p>
                </div>
                <span className="text-xs text-emerald-600">
                  {overview?.leads_generated || 0} leads this month
                </span>
              </div>
              <div className="mt-6 h-56">
                {leadTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadTrend}>
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
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: "#2563eb", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-56" />
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">AI reply rate</h3>
                  <p className="text-xs text-slate-500">Automation adoption</p>
                </div>
                <span className="text-xs text-slate-400">{autoReplyRate}%</span>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={replyRateData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {replyRateData.map((entry, index) => (
                        <Cell
                          key={`slice-${entry.name}`}
                          fill={index === 0 ? "#4f46e5" : "#e2e8f0"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-sm text-slate-600">
                  {autoReplyRate}% of replies sent automatically
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Email volume trend</h3>
                <p className="text-xs text-slate-500">Last 7 days inbound volume</p>
              </div>
              <span className="text-xs text-slate-400">
                {overview?.emails_processed || 0} emails this month
              </span>
            </div>
            <div className="mt-6 h-56">
              {emailLoading ? (
                <Skeleton className="h-56" />
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
        </>
      )}
    </div>
  );
};

export default Analytics;
