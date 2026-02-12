import React, { useEffect, useMemo, useState } from "react";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { BotIcon, ClockIcon, LineChartIcon, MailIcon, SparklesIcon, UsersIcon } from "../components/Icons";
import StatCard from "../components/StatCard";
import { useToast } from "../components/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";

const autonomyLabels = [
  {
    value: 0,
    label: "Suggest only",
    detail: "AI recommends. Human decides every action.",
  },
  {
    value: 1,
    label: "Draft",
    detail: "AI drafts content and plans actions for review.",
  },
  {
    value: 2,
    label: "Act with approval",
    detail: "AI can prepare and queue actions, then asks for approval.",
  },
  {
    value: 3,
    label: "Fully autonomous",
    detail: "AI can execute in scope with logs and rollback safeguards.",
  },
];

const agentBlueprints = [
  {
    id: "inbox",
    name: "Inbox Agent",
    icon: MailIcon,
    description:
      "Monitors inbound conversations, tags priority, and routes to the right queue before SLA risk grows.",
    scope: ["Classify intent and urgency", "Route by role/team", "Flag SLA and compliance risk"],
    limits: [
      "Cannot send outbound replies in Suggest or Draft mode",
      "Cannot edit legal policy rules",
      "All actions are logged and traceable",
    ],
  },
  {
    id: "qualification",
    name: "Qualification Agent",
    icon: BotIcon,
    description:
      "Scores leads, explains qualification rationale, and recommends next-best pipeline action.",
    scope: ["Lead scoring", "Priority classification", "Qualification summaries"],
    limits: [
      "Cannot close-won deals autonomously",
      "Cannot alter CRM ownership policies",
      "Low-confidence decisions are flagged for review",
    ],
  },
  {
    id: "followup",
    name: "Follow-up Agent",
    icon: UsersIcon,
    description:
      "Schedules and drafts timely follow-ups to reduce drop-off and recover stalled opportunities.",
    scope: ["Follow-up sequencing", "Reminder orchestration", "No-response recovery nudges"],
    limits: [
      "Respects quiet hours and compliance windows",
      "Cannot override manual pause",
      "Escalates risky tone/content to human approvers",
    ],
  },
];

const baseAgentMetrics = {
  inbox: { accuracy: 93, helpfulness: 88, overrides: 11 },
  qualification: { accuracy: 90, helpfulness: 91, overrides: 9 },
  followup: { accuracy: 89, helpfulness: 86, overrides: 14 },
};

const actionTemplates = {
  inbox: {
    title: "Route and prioritize new inbox demand",
    summary: "Tag high-intent messages, route SLA-risk threads, and sync queue ownership.",
    plannedActions: [
      "Tag 6 new messages as Pricing intent",
      "Escalate 2 SLA-risk threads to Support lane",
      "Assign 3 enterprise conversations to Account Executive queue",
    ],
    kpiImpact: "Estimated 24 minutes saved in first-response triage.",
  },
  qualification: {
    title: "Refresh qualification scores",
    summary: "Re-score active leads using latest intent signals and update qualification suggestions.",
    plannedActions: [
      "Upgrade 4 leads from contacted to qualified candidates",
      "Flag 2 low-confidence scores for manual review",
      "Add rationale snippets to lead timeline",
    ],
    kpiImpact: "Expected +6% lift in lead-to-opportunity conversion speed.",
  },
  followup: {
    title: "Launch follow-up sequence",
    summary: "Queue follow-up drafts for stalled leads and prepare reminder cadence.",
    plannedActions: [
      "Draft 5 no-response follow-up emails",
      "Queue 3 calendar nudges for qualified leads",
      "Pause 2 sequences due to compliance quiet window",
    ],
    kpiImpact: "Potential recovery of 3 stalled opportunities this week.",
  },
};

const defaultAutonomy = {
  inbox: 1,
  qualification: 2,
  followup: 1,
};

const autonomyStoragePrefix = "automation-agent-autonomy";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const describeConfirmation = (level) => {
  if (level === 3) {
    return "No confirmation required in this mode. Action executes autonomously within scope.";
  }
  if (level === 2) {
    return "Confirmation required before execution. AI prepares and waits for approval.";
  }
  if (level === 1) {
    return "Confirmation required. AI only drafts and proposes actions.";
  }
  return "Confirmation required. AI only suggests next steps.";
};

const AIAgents = () => {
  const { workspace, userRole, roleProfile, enterpriseMode, adjustMetric } = useWorkspace();
  const { addToast } = useToast();

  const [autonomyByAgent, setAutonomyByAgent] = useState(defaultAutonomy);
  const [previewAction, setPreviewAction] = useState(null);
  const [executionLog, setExecutionLog] = useState([]);

  const canConfigure = userRole === "Owner" || userRole === "Admin";
  const canExecute = userRole !== "Viewer";
  const maxAllowedAutonomy = userRole === "Agent" ? 2 : 3;

  useEffect(() => {
    const key = `${autonomyStoragePrefix}-${workspace.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      setAutonomyByAgent(defaultAutonomy);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setAutonomyByAgent({ ...defaultAutonomy, ...parsed });
    } catch (err) {
      setAutonomyByAgent(defaultAutonomy);
    }
  }, [workspace.id]);

  useEffect(() => {
    const key = `${autonomyStoragePrefix}-${workspace.id}`;
    localStorage.setItem(key, JSON.stringify(autonomyByAgent));
  }, [autonomyByAgent, workspace.id]);

  const plannedActions = useMemo(
    () =>
      agentBlueprints.map((agent) => {
        const mode = autonomyByAgent[agent.id] ?? 0;
        const template = actionTemplates[agent.id];
        return {
          id: `${agent.id}-plan`,
          agentId: agent.id,
          agentName: agent.name,
          title: template.title,
          summary: template.summary,
          plannedActions: template.plannedActions,
          kpiImpact: template.kpiImpact,
          autonomyLevel: mode,
          requiresConfirmation: mode !== 3,
        };
      }),
    [autonomyByAgent]
  );

  const perAgentPerformance = useMemo(() => {
    return agentBlueprints.map((agent) => {
      const base = baseAgentMetrics[agent.id];
      const level = autonomyByAgent[agent.id] ?? 0;
      const executed = executionLog.filter((entry) => entry.agentId === agent.id && entry.status === "executed").length;
      const rolledBack = executionLog.filter((entry) => entry.agentId === agent.id && entry.status === "rolled_back").length;

      const accuracy = clamp(base.accuracy - Math.max(0, level - 1) * 2 + Math.min(3, executed * 0.4), 75, 98);
      const helpfulness = clamp(base.helpfulness + Math.min(5, level * 1.4), 70, 99);
      const overrideRate = clamp(base.overrides + rolledBack * 6 + Math.max(0, level - 2) * 3, 4, 48);
      const trustScore = Math.round(accuracy * 0.44 + helpfulness * 0.36 + (100 - overrideRate) * 0.2);

      return {
        agentId: agent.id,
        name: agent.name,
        accuracy,
        helpfulness,
        overrideRate,
        trustScore,
      };
    });
  }, [autonomyByAgent, executionLog]);

  const performanceOverview = useMemo(() => {
    const total = perAgentPerformance.length || 1;
    const accuracy = Math.round(perAgentPerformance.reduce((sum, item) => sum + item.accuracy, 0) / total);
    const helpfulness = Math.round(
      perAgentPerformance.reduce((sum, item) => sum + item.helpfulness, 0) / total
    );
    const overrideRate = Math.round(
      perAgentPerformance.reduce((sum, item) => sum + item.overrideRate, 0) / total
    );
    const trustScore = Math.round(perAgentPerformance.reduce((sum, item) => sum + item.trustScore, 0) / total);

    return {
      accuracy,
      helpfulness,
      overrideRate,
      trustScore,
      adjustedTrust: adjustMetric(trustScore, { min: 0, max: 99 }),
    };
  }, [adjustMetric, perAgentPerformance]);

  const handleAutonomyChange = (agentId, nextLevel) => {
    if (!canConfigure && userRole !== "Agent") {
      return;
    }
    const safeLevel = Math.min(Number(nextLevel), maxAllowedAutonomy);
    if (safeLevel !== Number(nextLevel)) {
      addToast({
        title: "Autonomy capped",
        description: "Your role cannot set Fully autonomous mode.",
        variant: "error",
      });
    }
    setAutonomyByAgent((prev) => ({ ...prev, [agentId]: safeLevel }));
  };

  const openPreview = (action) => {
    setPreviewAction(action);
  };

  const executePlannedAction = () => {
    if (!previewAction) {
      return;
    }
    const record = {
      id: `${previewAction.agentId}-${Date.now()}`,
      agentId: previewAction.agentId,
      agentName: previewAction.agentName,
      title: previewAction.title,
      at: new Date().toISOString(),
      status: "executed",
      autonomyLevel: previewAction.autonomyLevel,
      requiresConfirmation: previewAction.requiresConfirmation,
    };
    setExecutionLog((prev) => [record, ...prev].slice(0, 12));
    setPreviewAction(null);
    addToast({
      title: "Agent action executed",
      description: `${record.agentName} completed: ${record.title}`,
    });
  };

  const rollbackAction = (logId) => {
    setExecutionLog((prev) =>
      prev.map((entry) => (entry.id === logId ? { ...entry, status: "rolled_back" } : entry))
    );
    addToast({
      title: "Rollback applied",
      description: "The last agent action was rolled back and marked for review.",
      variant: "error",
    });
  };

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
    return `${hours} hr ago`;
  };

  return (
    <div className={enterpriseMode ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">AI agents</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Autonomous assistants with explicit scope, limits, and human control.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            AI works for you, not instead of you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
          <Badge variant={userRole === "Viewer" ? "warning" : "success"}>{roleProfile.scope}</Badge>
          {enterpriseMode ? <Badge variant="default">Enterprise UI</Badge> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Control principle</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          AI works for your team with clear boundaries: scope-limited actions, confirmation rules, and rollback safety.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Accuracy"
          value={`${performanceOverview.accuracy}%`}
          icon={<LineChartIcon className="h-5 w-5" />}
          helper="Decision precision"
          trend="Across all agents"
        />
        <StatCard
          label="Helpfulness"
          value={`${performanceOverview.helpfulness}%`}
          icon={<SparklesIcon className="h-5 w-5" />}
          helper="Human-rated utility"
          trend="Measured from accepted actions"
        />
        <StatCard
          label="Human overrides"
          value={`${performanceOverview.overrideRate}%`}
          icon={<UsersIcon className="h-5 w-5" />}
          helper="Actions adjusted by humans"
          trend="Lower is better"
        />
        <StatCard
          label="Trust score"
          value={`${performanceOverview.adjustedTrust}`}
          icon={<BotIcon className="h-5 w-5" />}
          helper="Composite trust metric"
          trend="Transparent + controllable"
          highlight
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {agentBlueprints.map((agent) => {
          const Icon = agent.icon;
          const level = autonomyByAgent[agent.id] ?? 0;
          const currentMode = autonomyLabels[level] || autonomyLabels[0];
          const action = plannedActions.find((item) => item.agentId === agent.id);

          return (
            <article
              key={agent.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{agent.description}</p>
                  </div>
                </div>
                <Badge variant={level >= 2 ? "success" : "warning"}>{currentMode.label}</Badge>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Scope</p>
                  <ul className="mt-1 space-y-1">
                    {agent.scope.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Limits</p>
                  <ul className="mt-1 space-y-1">
                    {agent.limits.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Autonomy level</span>
                  <span>{currentMode.label}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={level}
                  disabled={userRole === "Viewer"}
                  onChange={(event) => handleAutonomyChange(agent.id, event.target.value)}
                  className="mt-2 w-full accent-indigo-600 disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{currentMode.detail}</p>
                {userRole === "Agent" ? (
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    Agent role can set up to "Act with approval".
                  </p>
                ) : null}
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950/70">
                <p className="font-semibold text-slate-900 dark:text-white">Planned next action</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{action?.title}</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{action?.kpiImpact}</p>
                <Button
                  variant="subtle"
                  className="mt-3 px-3 py-1.5 text-xs"
                  onClick={() => openPreview(action)}
                  disabled={!canExecute}
                >
                  Preview action
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Agent performance details</h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Agent</th>
                  <th className="px-4 py-2 text-left font-medium">Accuracy</th>
                  <th className="px-4 py-2 text-left font-medium">Helpfulness</th>
                  <th className="px-4 py-2 text-left font-medium">Overrides</th>
                  <th className="px-4 py-2 text-left font-medium">Trust</th>
                </tr>
              </thead>
              <tbody>
                {perAgentPerformance.map((row) => (
                  <tr key={row.agentId} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.accuracy}%</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.helpfulness}%</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.overrideRate}%</td>
                    <td className="px-4 py-2">
                      <Badge variant={row.trustScore >= 85 ? "success" : "warning"}>{row.trustScore}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Execution timeline</h3>
            <ClockIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-4 space-y-3">
            {executionLog.length ? (
              executionLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{entry.agentName}</p>
                      <p className="text-slate-500 dark:text-slate-400">{entry.title}</p>
                      <p className="mt-1 text-slate-400 dark:text-slate-500">{relativeTime(entry.at)}</p>
                    </div>
                    <Badge variant={entry.status === "executed" ? "success" : "danger"}>
                      {entry.status === "executed" ? "Executed" : "Rolled back"}
                    </Badge>
                  </div>
                  {entry.status === "executed" ? (
                    <Button
                      variant="danger"
                      className="mt-2 px-3 py-1.5 text-xs"
                      onClick={() => rollbackAction(entry.id)}
                      disabled={!canExecute}
                    >
                      Rollback
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No agent executions yet. Preview and run an action to build timeline history.
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={Boolean(previewAction)} onClose={() => setPreviewAction(null)} title="AI action preview">
        {previewAction ? (
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold text-slate-900 dark:text-white">{previewAction.agentName}</p>
              <p className="mt-1">{previewAction.summary}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Planned actions</p>
              <ul className="mt-2 space-y-1 text-xs">
                {previewAction.plannedActions.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              <p className="font-semibold">Confirmation policy</p>
              <p className="mt-1">{describeConfirmation(previewAction.autonomyLevel)}</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <p className="font-semibold">Projected KPI impact</p>
              <p className="mt-1">{previewAction.kpiImpact}</p>
              <p className="mt-1">Rollback is available immediately after execution.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPreviewAction(null)}>
                Cancel
              </Button>
              <Button
                onClick={executePlannedAction}
                disabled={!canExecute || (previewAction.requiresConfirmation && userRole === "Viewer")}
              >
                {previewAction.requiresConfirmation ? "Confirm action" : "Allow autonomous run"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AIAgents;
