import React, { useEffect, useMemo, useState } from "react";

import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { MailIcon } from "../components/Icons";
import { useToast } from "../components/ToastContext";
import { getEmailAnalysis, getEmailThread, getEmails, regenerateEmailReply } from "../services/api";

const Emails = () => {
  const { addToast } = useToast();
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const emptyState = useMemo(
    () => ({
      title: "No emails yet",
      description: "Connect an inbox to start processing inbound conversations.",
    }),
    []
  );

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await getEmails();
        setEmails(data);
        setSelectedEmailId(data[0]?.id || null);
      } catch (err) {
        setError("Unable to load emails.");
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

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

  const handleRegenerate = async () => {
    if (!selectedEmailId) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Emails</h2>
        <p className="text-sm text-slate-500">Review inbound messages and AI responses.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : emails.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase text-slate-400">Inbox</p>
                <p className="text-sm text-slate-600">{emails.length} messages</p>
              </div>
              <MailIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {emails.map((email) => {
                const aiReplied = email.replies?.some((reply) => reply.generated_by_ai);
                const isActive = selectedEmailId === email.id;
                return (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`w-full border-b border-slate-100 px-5 py-4 text-left transition ${
                      isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
                        <p className="text-xs text-slate-500">{email.from_email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={email.status} />
                        <Badge variant={aiReplied ? "success" : "warning"}>
                          {aiReplied ? "AI replied" : "Awaiting"}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">{email.preview}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
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
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedEmail.subject}
                    </h3>
                    <p className="text-sm text-slate-500">From {selectedEmail.from_email}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedEmail.status} />
                    <Badge variant="info">{analysis?.category || "General"}</Badge>
                    {analysis?.priority ? (
                      <Badge variant={priorityVariant}>{analysis.priority} priority</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedEmail.body}
                </div>

                {analysis?.summary ? (
                  <div className="text-sm text-slate-600">
                    <p className="text-xs uppercase text-slate-400">Summary</p>
                    <p className="mt-2">{analysis.summary}</p>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase text-slate-400">AI response preview</p>
                    <Button
                      variant="subtle"
                      onClick={handleRegenerate}
                      disabled={regenerating}
                    >
                      {regenerating ? "Regenerating..." : "Regenerate AI reply"}
                    </Button>
                  </div>
                  <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-600">
                    {aiReplyPreview}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Select an email"
                description="Choose a message from the inbox to review details."
                icon={<MailIcon className="h-6 w-6" />}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            icon={<MailIcon className="h-6 w-6" />}
          />
        </div>
      )}
    </div>
  );
};

export default Emails;
