import React, { useEffect, useMemo, useState } from "react";

import AIExplanationPanel from "../components/AIExplanationPanel";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { MailIcon, SearchIcon } from "../components/Icons";
import { useToast } from "../components/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { getEmailAnalysis, getEmailThread, getEmails, regenerateEmailReply } from "../services/api";
import { buildAIExplanation } from "../utils/aiExplainability";

const Emails = () => {
  const { addToast } = useToast();
  const { workspace, userRole, can, getPermissionHint, scopeCollection } = useWorkspace();
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const emptyState = useMemo(
    () => ({
      title: "No inbox threads yet",
      description: "Connect an inbox to capture customer demand and trigger AI-powered triage.",
      impact: "Without inbox sync, high-intent opportunities remain invisible.",
    }),
    []
  );

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getEmails();
        const scoped = scopeCollection(data, { min: 1 });
        setEmails(scoped);
        setSelectedEmailId(scoped[0]?.id || null);
      } catch (err) {
        setError("Unable to load emails.");
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, [scopeCollection, workspace.id]);

  useEffect(() => {
    if (!selectedEmailId) {
      setSelectedEmail(null);
      setAnalysis(null);
      setGeneratedReply("");
      setDetailLoading(false);
      return;
    }
    const loadDetails = async () => {
      setDetailLoading(true);
      setGeneratedReply("");
      setSelectedEmail(null);
      setAnalysis(null);
      try {
        const [thread, analysisData] = await Promise.all([
          getEmailThread(selectedEmailId),
          getEmailAnalysis(selectedEmailId),
        ]);
        setSelectedEmail(thread.email);
        setAnalysis(analysisData);
      } catch (err) {
        setSelectedEmail(null);
        setAnalysis(null);
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetails();
  }, [selectedEmailId]);

  const aiReplyPreview = useMemo(() => {
    if (generatedReply) {
      return generatedReply;
    }
    if (analysis?.ai_reply_suggestion) {
      return analysis.ai_reply_suggestion;
    }
    if (selectedEmail?.replies?.length) {
      return selectedEmail.replies[0].body;
    }
    return "No AI reply has been generated yet.";
  }, [analysis, generatedReply, selectedEmail]);

  const explanation = useMemo(
    () =>
      buildAIExplanation({
        actionType: "AI reply",
        subject: selectedEmail?.subject,
        body: selectedEmail?.body,
        summary: analysis?.summary,
        category: analysis?.category,
        priority: analysis?.priority,
        aiSuggestion: aiReplyPreview,
        baseScore: analysis?.priority?.toLowerCase() === "high" ? 80 : 68,
      }),
    [aiReplyPreview, analysis?.category, analysis?.priority, analysis?.summary, selectedEmail?.body, selectedEmail?.subject]
  );

  const priorityVariant = useMemo(() => {
    const key = analysis?.priority?.toLowerCase();
    if (key === "high") {
      return "danger";
    }
    if (key === "low") {
      return "success";
    }
    return "warning";
  }, [analysis?.priority]);

  const emailState = (email) => {
    if (!email) {
      return "new";
    }
    const replies = email.replies || [];
    if (!replies.length) {
      return "new";
    }
    const hasPending = replies.some((reply) =>
      ["pending", "queued", "retry"].includes(reply.send_status)
    );
    if (hasPending) {
      return "pending";
    }
    const hasFailed = replies.some((reply) => reply.send_status === "failed");
    if (hasFailed) {
      return "pending";
    }
    return "replied";
  };

  const handleRegenerate = async () => {
    if (!selectedEmailId || !can("regenerate_reply")) {
      return;
    }
    setRegenerating(true);
    try {
      const response = await regenerateEmailReply(selectedEmailId);
      setGeneratedReply(response.reply?.body || "");
      addToast({
        title: "AI reply refreshed",
        description: "A new reply draft is ready for review.",
      });
    } catch (err) {
      addToast({
        title: "Generation failed",
        description: "We could not regenerate the AI reply.",
        variant: "error",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const filteredEmails = useMemo(() => {
    const search = query.toLowerCase();
    return emails.filter((email) => {
      const matchesQuery =
        !search ||
        email.subject.toLowerCase().includes(search) ||
        email.from_email.toLowerCase().includes(search);
      const state = emailState(email);
      const matchesStatus = statusFilter === "all" || state === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [emails, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Emails</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review inbound messages, AI drafts, and explainable decision signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <EmptyState
          title="Inbox unavailable"
          description={error}
          impact="Without inbox context, AI cannot prioritize messages accurately."
          icon={<MailIcon className="h-6 w-6" />}
          actionLabel="Open system status"
          actionTo="/app/status"
        />
      ) : emails.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden dark:border-slate-800 dark:bg-slate-900/80">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Inbox</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{emails.length} messages</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="search"
                    placeholder="Search email"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-40 bg-transparent text-sm text-slate-600 focus:outline-none dark:text-slate-200"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All status</option>
                  <option value="new">New</option>
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {filteredEmails.length ? (
                filteredEmails.map((email) => {
                  const aiReplied = email.replies?.some((reply) => reply.generated_by_ai);
                  const state = emailState(email);
                  const isActive = selectedEmailId === email.id;
                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`w-full border-b border-slate-100 px-5 py-4 text-left transition ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{email.subject}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{email.from_email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={state} />
                          <Badge variant={aiReplied ? "success" : "warning"}>
                            {aiReplied ? "AI drafted" : "Needs draft"}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{email.preview}</p>
                    </button>
                  );
                })
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No matching emails"
                    description="Refine filters to focus on high-impact conversations."
                    impact="Filtering helps teams act on the most valuable messages first."
                    icon={<MailIcon className="h-6 w-6" />}
                    actionLabel="Reset filters"
                    onAction={() => {
                      setQuery("");
                      setStatusFilter("all");
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6" />
                <Skeleton className="h-24" />
                <Skeleton className="h-16" />
              </div>
            ) : selectedEmail ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedEmail.subject}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">From {selectedEmail.from_email}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={emailState(selectedEmail)} />
                    <Badge variant="info">{analysis?.category || "General"}</Badge>
                    {analysis?.priority ? <Badge variant={priorityVariant}>{analysis.priority} priority</Badge> : null}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Original email</p>
                  <p className="mt-3 whitespace-pre-line">{selectedEmail.body}</p>
                </div>

                {analysis?.summary ? (
                  <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    <p className="text-xs uppercase text-slate-400 dark:text-slate-500">Summary</p>
                    <p className="mt-2">{analysis.summary}</p>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase text-slate-400 dark:text-slate-500">AI draft response</p>
                    <Button
                      variant="subtle"
                      onClick={handleRegenerate}
                      disabled={regenerating || !can("regenerate_reply")}
                      title={!can("regenerate_reply") ? getPermissionHint("regenerate_reply") : undefined}
                    >
                      {regenerating ? "Regenerating..." : "Regenerate AI reply"}
                    </Button>
                  </div>
                  <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                    {aiReplyPreview}
                  </div>
                  {!can("regenerate_reply") ? (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {getPermissionHint("regenerate_reply")}
                    </p>
                  ) : null}
                </div>

                <AIExplanationPanel explanation={explanation} title="Why AI chose this reply" defaultExpanded />
              </div>
            ) : (
              <EmptyState
                title="Select an email"
                description="Choose a message from the inbox to review AI reasoning and draft output."
                impact="Decision context appears here so teams can verify AI choices before sending."
                icon={<MailIcon className="h-6 w-6" />}
                actionLabel="Open first message"
                onAction={() => setSelectedEmailId(filteredEmails[0]?.id || emails[0]?.id || null)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            impact={emptyState.impact}
            icon={<MailIcon className="h-6 w-6" />}
            actionLabel="Open workspace settings"
            actionTo="/app/settings"
          />
        </div>
      )}
    </div>
  );
};

export default Emails;
