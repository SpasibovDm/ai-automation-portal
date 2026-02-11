import React, { useMemo, useState } from "react";

import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { BotIcon, MailIcon, SendIcon, SparklesIcon, UsersIcon } from "../components/Icons";
import { useToast } from "../components/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";

const defaultStages = [
  {
    id: "inbox",
    title: "Inbox",
    subtitle: "Capture + classify",
    color: "border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10",
    blocks: [
      { id: "inbox-routing", label: "Route by channel", detail: "Email, form, and API inputs" },
      { id: "inbox-dedupe", label: "Duplicate guard", detail: "Merge repeat lead records" },
    ],
  },
  {
    id: "ai",
    title: "AI",
    subtitle: "Score + draft",
    color: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10",
    blocks: [
      { id: "ai-score", label: "Intent + urgency score", detail: "Confidence-weighted priority" },
      { id: "ai-draft", label: "Reply drafting", detail: "Policy-safe first response" },
    ],
  },
  {
    id: "human",
    title: "Human",
    subtitle: "Review + override",
    color: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
    blocks: [
      { id: "human-approval", label: "Approval gate", detail: "Review high-risk conversations" },
    ],
  },
  {
    id: "send",
    title: "Send",
    subtitle: "Deliver + track",
    color: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    blocks: [
      { id: "send-dispatch", label: "Send response", detail: "Deliver via selected channel" },
      { id: "send-log", label: "Audit event log", detail: "Track AI vs manual actions" },
    ],
  },
];

const blockLibrary = [
  {
    id: "lib-compliance",
    label: "Compliance keyword gate",
    detail: "Hold messages with legal-sensitive language",
    stageId: "human",
  },
  {
    id: "lib-priority",
    label: "Enterprise account boost",
    detail: "Increase priority for strategic accounts",
    stageId: "ai",
  },
  {
    id: "lib-sla",
    label: "SLA escalation alert",
    detail: "Escalate when response windows are at risk",
    stageId: "inbox",
  },
];

const stageIcon = {
  inbox: MailIcon,
  ai: BotIcon,
  human: UsersIcon,
  send: SendIcon,
};

const WorkflowBuilder = () => {
  const { workspace, userRole, can, roleProfile, enterpriseMode } = useWorkspace();
  const { addToast } = useToast();
  const [workflowName, setWorkflowName] = useState("Enterprise Revenue Workflow");
  const [stages, setStages] = useState(defaultStages);
  const [dragState, setDragState] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);

  const canManageWorkflow = can("manage_settings");
  const canTuneWorkflow = canManageWorkflow || userRole === "Agent";
  const readOnly = userRole === "Viewer";

  const workflowSummary = useMemo(() => {
    const totalBlocks = stages.reduce((sum, stage) => sum + stage.blocks.length, 0);
    return {
      totalBlocks,
      approvals: stages.find((stage) => stage.id === "human")?.blocks.length || 0,
      aiNodes: stages.find((stage) => stage.id === "ai")?.blocks.length || 0,
    };
  }, [stages]);

  const moveBlock = (fromStageId, blockId, toStageId) => {
    if (fromStageId === toStageId) {
      return;
    }

    setStages((prev) => {
      const source = prev.find((stage) => stage.id === fromStageId);
      const target = prev.find((stage) => stage.id === toStageId);
      if (!source || !target) {
        return prev;
      }

      const block = source.blocks.find((item) => item.id === blockId);
      if (!block) {
        return prev;
      }

      return prev.map((stage) => {
        if (stage.id === fromStageId) {
          return {
            ...stage,
            blocks: stage.blocks.filter((item) => item.id !== blockId),
          };
        }
        if (stage.id === toStageId) {
          return {
            ...stage,
            blocks: [...stage.blocks, block],
          };
        }
        return stage;
      });
    });
  };

  const handleDrop = (targetStageId) => {
    if (!dragState || !canTuneWorkflow) {
      setDragState(null);
      setActiveStage(null);
      return;
    }
    moveBlock(dragState.stageId, dragState.blockId, targetStageId);
    setDragState(null);
    setActiveStage(null);
  };

  const handleAddLibraryBlock = (libraryItem) => {
    if (!canManageWorkflow) {
      return;
    }

    setStages((prev) =>
      prev.map((stage) =>
        stage.id === libraryItem.stageId
          ? {
              ...stage,
              blocks: [
                ...stage.blocks,
                {
                  id: `${libraryItem.id}-${Date.now()}`,
                  label: libraryItem.label,
                  detail: libraryItem.detail,
                },
              ],
            }
          : stage
      )
    );

    addToast({
      title: "Block added",
      description: `${libraryItem.label} added to ${libraryItem.stageId.toUpperCase()} stage.`,
    });
  };

  const handleSave = () => {
    addToast({
      title: "Workflow draft saved",
      description: "Mock save complete. This is a frontend-only workflow builder preview.",
    });
  };

  const handlePublish = () => {
    if (!canManageWorkflow) {
      return;
    }
    addToast({
      title: "Workflow published",
      description: "Mock publish complete. Changes are ready for rollout simulation.",
    });
  };

  const handleReset = () => {
    if (!canManageWorkflow) {
      return;
    }
    setStages(defaultStages);
    addToast({
      title: "Workflow reset",
      description: "Restored to the default enterprise pipeline.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Workflow builder</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visual automation builder for enterprise-scale inbox operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
          <Badge variant={readOnly ? "warning" : "success"}>{roleProfile.scope}</Badge>
          {enterpriseMode ? <Badge variant="default">Enterprise UI</Badge> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Pipeline path
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                Inbox → AI → Human → Send
              </h3>
            </div>
            <Badge variant={canManageWorkflow ? "success" : "warning"}>
              {canManageWorkflow ? "Publish enabled" : "Limited controls"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {stages.map((stage, index) => {
              const Icon = stageIcon[stage.id] || SparklesIcon;
              return (
                <div
                  key={stage.id}
                  className={`rounded-xl border p-3 text-xs ${stage.color}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <p className="font-semibold">{index + 1}. {stage.title}</p>
                  </div>
                  <p className="mt-1 opacity-80">{stage.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={handleSave}>
              Save draft
            </Button>
            <Button onClick={handlePublish} disabled={!canManageWorkflow}>
              Publish workflow
            </Button>
            <Button variant="subtle" onClick={handleReset} disabled={!canManageWorkflow}>
              Reset default
            </Button>
            {!canManageWorkflow ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Owner/Admin can publish workflow changes.
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Workflow controls</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{roleProfile.description}</p>
          <div className="mt-4 grid gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold text-slate-900 dark:text-white">Automation blocks</p>
              <p>{workflowSummary.totalBlocks} active blocks</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold text-slate-900 dark:text-white">AI decision nodes</p>
              <p>{workflowSummary.aiNodes} scoring/drafting nodes</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold text-slate-900 dark:text-white">Human approval gates</p>
              <p>{workflowSummary.approvals} override checkpoints</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Auto-send low risk replies</p>
                <p className="text-slate-500 dark:text-slate-400">Mock control for enterprise rollout.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSendEnabled((prev) => !prev)}
                disabled={!canManageWorkflow}
                className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                  autoSendEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    autoSendEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Drag-and-drop workflow canvas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag blocks between stages to simulate enterprise process design.
              </p>
            </div>
            <Badge variant={canTuneWorkflow ? "info" : "warning"}>
              {canTuneWorkflow ? "Drag enabled" : "Read-only"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {stages.map((stage) => {
              const Icon = stageIcon[stage.id] || SparklesIcon;
              return (
                <div
                  key={stage.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (canTuneWorkflow) {
                      setActiveStage(stage.id);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(stage.id);
                  }}
                  onDragLeave={() => setActiveStage((prev) => (prev === stage.id ? null : prev))}
                  className={`rounded-xl border p-3 transition ${
                    activeStage === stage.id
                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        {stage.title}
                      </p>
                    </div>
                    <Badge variant="default">{stage.blocks.length}</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {stage.blocks.length ? (
                      stage.blocks.map((block) => (
                        <div
                          key={block.id}
                          draggable={canTuneWorkflow}
                          onDragStart={() => setDragState({ stageId: stage.id, blockId: block.id })}
                          onDragEnd={() => {
                            setDragState(null);
                            setActiveStage(null);
                          }}
                          className={`rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950/70 ${
                            canTuneWorkflow ? "cursor-grab" : "cursor-default"
                          } ${
                            dragState?.blockId === block.id
                              ? "opacity-40"
                              : "opacity-100"
                          }`}
                        >
                          <p className="font-medium text-slate-900 dark:text-white">{block.label}</p>
                          <p className="mt-1 text-slate-500 dark:text-slate-400">{block.detail}</p>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No blocks"
                        description="Drop an automation block here."
                        impact="Empty stages can delay SLA and conversion workflows."
                        icon={<SparklesIcon className="h-5 w-5" />}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Block library (mock)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add enterprise controls to the workflow.</p>
            </div>
            <Badge variant={canManageWorkflow ? "success" : "warning"}>
              {canManageWorkflow ? "Editable" : "Owner/Admin only"}
            </Badge>
          </div>

          <div className="mt-4 space-y-2">
            {blockLibrary.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{item.detail}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Target: {item.stageId}
                  </span>
                  <Button
                    variant="subtle"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => handleAddLibraryBlock(item)}
                    disabled={!canManageWorkflow}
                  >
                    Add block
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-white">Workflow name</p>
            <input
              value={workflowName}
              onChange={(event) => setWorkflowName(event.target.value)}
              disabled={!canManageWorkflow}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
