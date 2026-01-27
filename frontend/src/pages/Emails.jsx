import React, { useEffect, useState } from "react";

import { getEmails, getEmailThread } from "../services/api";

const Emails = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Incoming emails</h2>
          <p className="text-sm text-slate-500">Monitor inquiries captured via email hooks.</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Inbox</h3>
            <p className="text-xs text-slate-400">Latest inbound conversations</p>
          </div>
          {loading ? (
            <div className="p-4 text-slate-500">Loading emails...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {emails.length ? (
                emails.map((email) => (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => handleSelect(email.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                      selectedEmail?.id === email.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{email.subject}</p>
                    <p className="text-xs text-slate-500">{email.from_email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(email.received_at).toLocaleDateString()}
                    </p>
                  </button>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-400">No emails yet.</div>
              )}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {threadLoading ? (
            <div className="text-slate-500">Loading thread...</div>
          ) : selectedEmail ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedEmail.subject}</h3>
                <p className="text-sm text-slate-500">From: {selectedEmail.from_email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(selectedEmail.received_at).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {selectedEmail.body}
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
                        <span className="mt-2 inline-flex text-xs text-slate-400">
                          {reply.generated_by_ai ? "AI generated" : "Manual reply"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No replies yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">Select an email to view the thread.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emails;
