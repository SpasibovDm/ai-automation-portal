import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { MailIcon, MessageSquareIcon, UserPlusIcon } from "../components/Icons";
import { useToast } from "../components/ToastContext";
import {
  getEmailAnalysis,
  getLead,
  getLeadEmails,
  regenerateEmailReply,
  updateLeadStatus,
} from "../services/api";

const statusOptions = ["new", "contacted", "qualified", "closed"];

const LeadDetails = () => {
  const { leadId } = useParams();
  const { addToast } = useToast();
  const [lead, setLead] = useState(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [leadError, setLeadError] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const [leadEmails, setLeadEmails] = useState([]);
  const [emailLoading, setEmailLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [aiReplyOverride, setAiReplyOverride] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const loadLead = async () => {
      setLeadLoading(true);
      setLeadError("");
      try {
        const data = await getLead(leadId);
        setLead(data);
        setStatusValue(data.status || "new");
      } catch (err) {
        setLeadError("Unable to load lead details.");
      } finally {
        setLeadLoading(false);
      }
    };
    loadLead();
  }, [leadId]);

  useEffect(() => {
    const loadEmails = async () => {
      setEmailLoading(true);
      try {
        const emails = await getLeadEmails(leadId);
        setLeadEmails(emails);
        setSelectedEmailId(emails[0]?.id || null);
      } catch (err) {
        setLeadEmails([]);
        setSelectedEmailId(null);
      } finally {
        setEmailLoading(false);
      }
    };
    loadEmails();
  }, [leadId]);

  useEffect(() => {
    if (!selectedEmailId) {
      setAnalysis(null);
      setAiReplyOverride("");
      setAnalysisLoading(false);
      return;
    }
    const loadAnalysis = async () => {
      setAnalysisLoading(true);
      setAnalysis(null);
      setAiReplyOverride("");
      try {
        const data = await getEmailAnalysis(selectedEmailId);
        setAnalysis(data);
      } catch (err) {
        setAnalysis(null);
      } finally {
        setAnalysisLoading(false);
      }
    };
    loadAnalysis();
  }, [selectedEmailId]);

  const selectedEmail = useMemo(
    () => leadEmails.find((email) => email.id === selectedEmailId),
    [leadEmails, selectedEmailId]
  );

  const aiReplyPreview = useMemo(() => {
    if (aiReplyOverride) {
      return aiReplyOverride;
    }
    if (analysis?.ai_reply_suggestion) {
      return analysis.ai_reply_suggestion;
    }
    return "No AI reply generated yet. Use regenerate to draft one.";
  }, [aiReplyOverride, analysis]);

  const extractCompany = (leadItem) => {
    if (leadItem?.conversation_summary) {
      const match = leadItem.conversation_summary.match(/Company:\s*([^|]+)/i);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
    if (leadItem?.email) {
      const domain = leadItem.email.split("@")[1];
      if (domain) {
        return domain.split(".")[0].replace(/[-_]/g, " ");
      }
    }
    return "Unknown";
  };

  const handleStatusSave = async () => {
    if (!lead) {
      return;
    }
    setStatusSaving(true);
    try {
      const updated = await updateLeadStatus(lead.id, statusValue);
      setLead(updated);
      setStatusValue(updated.status || statusValue);
      addToast({
        title: "Lead status updated",
        description: `Status set to ${statusValue}.`,
      });
    } catch (err) {
      addToast({
        title: "Update failed",
        description: "We could not update the lead status.",
        variant: "error",
      });
    } finally {
      setStatusSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedEmailId) {
      return;
    }
    setRegenerating(true);
    try {
      const response = await regenerateEmailReply(selectedEmailId);
      setAiReplyOverride(response.reply?.body || "");
      addToast({
        title: "AI reply refreshed",
        description: "A new reply draft is ready.",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/app/leads"
            className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
          >
            Back to leads
          </Link>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Lead details
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Full context for every inbound conversation.
          </p>
        </div>
        {lead ? <StatusBadge status={lead.status} /> : null}
      </div>

      {leadLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : leadError ? (
        <EmptyState
          title="Unable to load lead"
          description={leadError}
          icon={<UserPlusIcon className="h-6 w-6" />}
        />
      ) : lead ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Contact info
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {lead.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{lead.email}</p>
                  {lead.phone ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {lead.phone}
                    </p>
                  ) : null}
                </div>
                <Badge variant="info">{extractCompany(lead)}</Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Source
                  </p>
                  <p className="mt-1">{lead.source || "Website"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Created
                  </p>
                  <p className="mt-1">{new Date(lead.created_at).toLocaleString()}</p>
                </div>
                {lead.preferred_language ? (
                  <div>
                    <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                      Language
                    </p>
                    <p className="mt-1">{lead.preferred_language}</p>
                  </div>
                ) : null}
                {Array.isArray(lead.tags) && lead.tags.length ? (
                  <div>
                    <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                      Tags
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lead.tags.map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {lead.message ? (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                  {lead.message}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Lead status
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Update the pipeline stage for this lead.
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Button onClick={handleStatusSave} disabled={statusSaving}>
                  {statusSaving ? "Saving..." : "Change status"}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Lead emails
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Review recent inbound messages.
                  </p>
                </div>
                <MailIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="mt-4 space-y-3">
                {emailLoading ? (
                  <Skeleton className="h-20" />
                ) : leadEmails.length ? (
                  leadEmails.map((email) => (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        selectedEmailId === email.id
                          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10"
                          : "border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {email.subject}
                        </p>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(email.received_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {email.preview}
                      </p>
                    </button>
                  ))
                ) : (
                  <EmptyState
                    title="No emails yet"
                    description="This lead hasn't replied by email yet."
                    icon={<MessageSquareIcon className="h-6 w-6" />}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Selected email
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedEmail ? selectedEmail.subject : "Choose an email"}
                  </p>
                </div>
                <Badge variant="default">
                  {analysisLoading ? "Analyzing..." : analysis?.category || "General"}
                </Badge>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {selectedEmail ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    {selectedEmail.preview}
                  </div>
                ) : (
                  "Select an email to view details."
                )}
              </div>
              {analysis?.summary ? (
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Summary: {analysis.summary}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    AI reply preview
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Draft response for the selected email.
                  </p>
                </div>
                <Button
                  variant="subtle"
                  onClick={handleRegenerate}
                  disabled={!selectedEmailId || regenerating}
                >
                  {regenerating ? "Regenerating..." : "Regenerate AI reply"}
                </Button>
              </div>
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                {analysisLoading ? <Skeleton className="h-20" /> : aiReplyPreview}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeadDetails;
