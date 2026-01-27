import React, { useEffect, useMemo, useState } from "react";

import EmptyState from "../components/EmptyState";
import { MailIcon, ReplyIcon, SendIcon, SparklesIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ToastContext";
import { getEmails, getEmailThread } from "../services/api";

const Emails = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

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
        if (data.length) {
          const thread = await getEmailThread(data[0].id);
          setSelectedEmail(thread.email);
        }
      } catch (err) {
        setError("Unable to load emails.");
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  const handleSelect = async (emailId) => {
    setThreadLoading(true);
    try {
      const thread = await getEmailThread(emailId);
      setSelectedEmail(thread.email);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleAction = (action) => {
    addToast({
      title: action,
      description: "Your request has been queued for processing.",
    });
  };

  const getStatus = (email) => {
    return (email.status || "new").toLowerCase();
  };

  const getCategory = (email) => {
    if (email.category) {
      return email.category;
    }
    if (email.tags?.length) {
      return email.tags[0];
    }
    return "Lead";
  };

  const aiSuggestedReply =
    selectedEmail?.ai_suggested_reply ||
    "Thanks for reaching out! I can help you schedule a quick demo and share pricing details. Let me know a good time this week and your company size.";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Incoming emails</h2>
          <p className="text-sm text-slate-500">Monitor inquiries captured via email hooks.</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Inbox</h3>
              <p className="text-xs text-slate-400">Latest inbound conversations</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              {emails.length} total
            </span>
          </div>
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`email-skeleton-${index}`} className="h-16" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : emails.length ? (
            <div className="divide-y divide-slate-100">
              {emails.map((email) => {
                const status = getStatus(email);
                const category = getCategory(email);
                const isUnread = status === "new" || status === "pending";
                return (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => handleSelect(email.id)}
                    className={`w-full text-left px-5 py-4 transition hover:bg-slate-50 ${
                      selectedEmail?.id === email.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${isUnread ? "font-semibold" : "font-medium"} text-slate-900`}>
                        {email.subject}
                      </p>
                      <span className="text-xs text-slate-400">
                        {new Date(email.received_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{email.from_email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        {category}
                      </span>
                      <StatusBadge status={status} />
                    </div>
                  </button>
                );
              })}
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
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          {threadLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-40" />
            </div>
          ) : selectedEmail ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedEmail.subject}</h3>
                  <p className="text-sm text-slate-500">From: {selectedEmail.from_email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(selectedEmail.received_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={getStatus(selectedEmail)} />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {selectedEmail.body}
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <SparklesIcon className="h-4 w-4" />
                  AI Suggested Reply
                </div>
                <p className="mt-2 text-sm text-slate-700">{aiSuggestedReply}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction("Reply approved")}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <SendIcon className="h-4 w-4" />
                    Approve & Send
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("Reply opened for editing")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <ReplyIcon className="h-4 w-4" />
                    Edit Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("Reply ignored")}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Ignore
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI & team replies</h4>
                <div className="mt-3 space-y-3">
                  {selectedEmail.replies?.length ? (
                    selectedEmail.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-2xl border border-slate-100 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{reply.subject}</p>
                          <span className="text-xs text-slate-400">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{reply.body}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span>{reply.generated_by_ai ? "AI generated" : "Manual reply"}</span>
                          {reply.send_status && (
                            <StatusBadge status={reply.send_status} label={reply.send_status} />
                          )}
                          {reply.provider && <span>via {reply.provider}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No replies yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Select a conversation"
              description="Choose an email from the inbox to view the details."
              icon={<MailIcon className="h-6 w-6" />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Emails;
