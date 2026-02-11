import React, { useMemo, useState } from "react";

import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { ClockIcon } from "../components/Icons";
import { useWorkspace } from "../context/WorkspaceContext";

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

const mockAuditRows = [
  {
    id: "audit-1",
    actor: "AI Assistant",
    actorType: "ai",
    actionType: "ai_suggested_reply",
    actionLabel: "AI suggested reply",
    detail: "Drafted a response for pricing inquiry from taylor@northwindhealth.com.",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-2",
    actor: "Lea Fischer",
    actorType: "manual",
    actionType: "human_edited_reply",
    actionLabel: "Human edited reply",
    detail: "Updated tone from balanced to formal before send.",
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-3",
    actor: "AI Assistant",
    actorType: "ai",
    actionType: "ai_scored_lead",
    actionLabel: "AI scored lead",
    detail: "Lead score set to 88 based on urgency and procurement intent.",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-4",
    actor: "Daniel Weber",
    actorType: "manual",
    actionType: "status_changed",
    actionLabel: "Status changed",
    detail: "Moved lead from contacted to qualified.",
    timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-5",
    actor: "AI Assistant",
    actorType: "ai",
    actionType: "classification",
    actionLabel: "AI classified email",
    detail: "Classified message as Security review with medium urgency.",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

const AuditLogs = () => {
  const { workspace, userRole, scopeCollection } = useWorkspace();
  const [actorFilter, setActorFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const rows = useMemo(() => scopeCollection(mockAuditRows, { min: 4 }), [scopeCollection, workspace.id]);

  const actionTypes = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((row) => row.actionType)))],
    [rows]
  );

  const filteredRows = useMemo(
    () =>
      rows
        .filter((row) => (actorFilter === "all" ? true : row.actorType === actorFilter))
        .filter((row) => (actionFilter === "all" ? true : row.actionType === actionFilter))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [actionFilter, actorFilter, rows]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Audit logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Read-only event trail for AI and human actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
          <Badge variant="warning">Read-only</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Transparency feed
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Who did what, when, and whether the action came from AI or a human.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={actorFilter}
              onChange={(event) => setActorFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All actors</option>
              <option value="ai">AI actions</option>
              <option value="manual">Manual actions</option>
            </select>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All events" : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRows.length ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Actor</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{row.actor}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{row.detail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.actionLabel}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.actorType === "ai" ? "info" : "warning"}>
                        {row.actorType === "ai" ? "AI" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {relativeTime(row.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No audit events for filters"
              description="Adjust filters to inspect AI and manual activity in this workspace."
              impact="Audit visibility is key for GDPR accountability and trust reviews."
              icon={<ClockIcon className="h-6 w-6" />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
