import React, { useEffect, useMemo, useState } from "react";

import { BotIcon, LineChartIcon, MailIcon, SparklesIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { getAnalyticsOverview } from "../services/api";

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fallbackOverview = useMemo(
    () => ({
      emails_processed: 1240,
      emails_auto_replied: 860,
      leads_generated: 216,
      ai_accuracy: 0.82,
      time_saved_hours: 96,
      edited_rate: 0.18,
    }),
    []
  );

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getAnalyticsOverview();
        setOverview(data);
      } catch (err) {
        setError("Unable to load analytics overview.");
        setOverview(fallbackOverview);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [fallbackOverview]);

  const resolvedOverview = overview || fallbackOverview;

  const autoReplyRate = resolvedOverview.emails_processed
    ? Math.round((resolvedOverview.emails_auto_replied / resolvedOverview.emails_processed) * 100)
    : 0;

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
              value={resolvedOverview.emails_processed}
              icon={<MailIcon className="h-5 w-5" />}
              helper="Last 30 days"
              trend={`+${autoReplyRate}% auto-replied`}
            />
            <StatCard
              label="Leads generated"
              value={resolvedOverview.leads_generated}
              icon={<LineChartIcon className="h-5 w-5" />}
              helper="Email-to-lead pipeline"
              trend="+14% conversion"
            />
            <StatCard
              label="AI accuracy"
              value={`${Math.round((resolvedOverview.ai_accuracy || 0) * 100)}%`}
              icon={<SparklesIcon className="h-5 w-5" />}
              helper="Edited vs sent as-is"
              trend={`${Math.round((resolvedOverview.edited_rate || 0) * 100)}% edited`}
            />
            <StatCard
              label="Time saved"
              value={`${resolvedOverview.time_saved_hours} hrs`}
              icon={<BotIcon className="h-5 w-5" />}
              helper="Estimated productivity"
              trend="+9% this month"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Emails processed vs auto-replied
                  </h3>
                  <p className="text-xs text-slate-500">Automation throughput</p>
                </div>
                <span className="text-xs text-emerald-600">{autoReplyRate}% auto</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-400">Processed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {resolvedOverview.emails_processed}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">All inbound conversations</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-400">Auto-replied</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {resolvedOverview.emails_auto_replied}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">AI approved sends</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold text-slate-900">Value metrics</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Leads generated from emails</span>
                  <span className="font-semibold text-slate-800">
                    {resolvedOverview.leads_generated}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>AI accuracy (edited vs sent)</span>
                  <span className="font-semibold text-slate-800">
                    {Math.round((resolvedOverview.ai_accuracy || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Estimated time saved</span>
                  <span className="font-semibold text-slate-800">
                    {resolvedOverview.time_saved_hours} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
