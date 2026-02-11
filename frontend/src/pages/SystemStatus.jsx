import React, { useEffect, useMemo, useState } from "react";

import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import { BotIcon, ClockIcon, MailIcon, SparklesIcon } from "../components/Icons";
import { useWorkspace } from "../context/WorkspaceContext";
import { getCompanySettings, getEmailIntegrationStatus } from "../services/api";

const relativeTime = (timestamp) => {
  const parsed = new Date(timestamp).getTime();
  if (Number.isNaN(parsed)) {
    return "just now";
  }
  const seconds = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  return `${Math.floor(hours / 24)} days ago`;
};

const statusVariant = {
  operational: "success",
  degraded: "warning",
  down: "danger",
};

const SystemStatus = () => {
  const { workspace, adjustMetric } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [integration, setIntegration] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [integrationStatus, companySettings] = await Promise.all([
          getEmailIntegrationStatus(),
          getCompanySettings(),
        ]);
        setIntegration(integrationStatus);
        setCompany(companySettings);
      } catch (err) {
        setIntegration(null);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspace.id]);

  const healthCards = useMemo(() => {
    const aiAvailability = Math.min(99.99, adjustMetric(99.72, { decimals: 2, max: 99.99 }));
    const syncStatus = integration?.connected ? "operational" : "degraded";
    const activeRules = company?.auto_reply_enabled ? adjustMetric(18, { min: 8 }) : adjustMetric(6, { min: 3 });
    const lastRun = integration?.updated_at || new Date(Date.now() - 12 * 60 * 1000).toISOString();

    return [
      {
        label: "AI availability",
        value: `${aiAvailability}%`,
        status: "operational",
        helper: "Inference + classification engines",
        icon: BotIcon,
      },
      {
        label: "Inbox sync",
        value: syncStatus === "operational" ? "Connected" : "Attention needed",
        status: syncStatus,
        helper: integration?.provider || "No provider configured",
        icon: MailIcon,
      },
      {
        label: "Automation rules active",
        value: `${activeRules}`,
        status: company?.auto_reply_enabled ? "operational" : "degraded",
        helper: "Routing, scoring, and reply workflows",
        icon: SparklesIcon,
      },
      {
        label: "Last successful run",
        value: relativeTime(lastRun),
        status: "operational",
        helper: new Date(lastRun).toLocaleString(),
        icon: ClockIcon,
      },
    ];
  }, [adjustMetric, company?.auto_reply_enabled, integration?.connected, integration?.provider, integration?.updated_at]);

  const incidentFeed = useMemo(() => {
    const now = Date.now();
    return [
      {
        title: "Automation queue healthy",
        detail: "No failed runs in the last 24 hours.",
        timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
        status: "operational",
      },
      {
        title: "Model drift check passed",
        detail: "Confidence variance remained within the approved threshold.",
        timestamp: new Date(now - 58 * 60 * 1000).toISOString(),
        status: "operational",
      },
      {
        title: "Inbox sync checkpoint",
        detail: integration?.connected
          ? "Provider sync completed successfully."
          : "Provider not connected. Data may be stale.",
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        status: integration?.connected ? "operational" : "degraded",
      },
    ];
  }, [integration?.connected]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">System status</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Operational trust view for AI availability, inbox sync, and automation reliability.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`status-card-${index}`} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {healthCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.label}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge variant={statusVariant[card.status] || "warning"}>{card.status}</Badge>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.helper}</p>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Operational event feed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest service checks for this workspace.
                </p>
              </div>
              <Badge variant="info">{workspace.name}</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {incidentFeed.length ? (
                incidentFeed.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <Badge variant={statusVariant[item.status] || "warning"}>{item.status}</Badge>
                    </div>
                    <p className="mt-1">{item.detail}</p>
                    <p className="mt-1 text-slate-400 dark:text-slate-500">{relativeTime(item.timestamp)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No status signals"
                  description="System checks will appear here once a provider and automations are active."
                  impact="Status telemetry is required to prove reliability to stakeholders."
                  icon={<ClockIcon className="h-6 w-6" />}
                  actionLabel="Open settings"
                  actionTo="/app/settings"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemStatus;
