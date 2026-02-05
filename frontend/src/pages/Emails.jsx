import React, { useEffect, useMemo, useState } from "react";

import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { MailIcon } from "../components/Icons";
import { getEmailAnalysis, getEmailThread, getEmails } from "../services/api";

const Emails = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      } catch (err) {
        setError("Unable to load emails.");
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  const getCompanyLabel = (email) => {
    if (!email?.from_email) {
      return "Unknown";
    }
    const domain = email.from_email.split("@")[1];
    if (!domain) {
      return "Unknown";
    }
    return domain.split(".")[0].replace(/[-_]/g, " ");
  };

  const handleOpenEmail = async (emailId) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    setSelectedEmail(null);
    try {
      const thread = await getEmailThread(emailId);
      setSelectedEmail(thread.email);
      const analysisData = await getEmailAnalysis(emailId);
      setAnalysis(analysisData);
    } catch (err) {
      setSelectedEmail(null);
      setAnalysis(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const aiReplyPreview = useMemo(() => {
    if (analysis?.ai_reply_suggestion) {
      return analysis.ai_reply_suggestion;
    }
    if (selectedEmail?.replies?.length) {
      return selectedEmail.replies[0].body;
    }
    return "No AI reply has been generated yet.";
  }, [analysis, selectedEmail]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Emails</h2>
        <p className="text-sm text-slate-500">Review inbound messages and AI responses.</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`email-skeleton-${index}`} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : emails.length ? (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">From</th>
                <th className="text-left px-6 py-3 font-medium">Subject</th>
                <th className="text-left px-6 py-3 font-medium">Company</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-left px-6 py-3 font-medium">AI Replied?</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => {
                const aiReplied = email.replies?.some((reply) => reply.generated_by_ai);
                return (
                  <tr
                    key={email.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleOpenEmail(email.id)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{email.from_email}</td>
                    <td className="px-6 py-4 text-slate-600">{email.subject}</td>
                    <td className="px-6 py-4 text-slate-600">{getCompanyLabel(email)}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(email.received_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {aiReplied ? (
                        <StatusBadge status="sent" label="Yes" />
                      ) : (
                        <StatusBadge status="pending" label="No" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Email detail"
      >
        {detailLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5" />
            <Skeleton className="h-24" />
            <Skeleton className="h-16" />
          </div>
        ) : selectedEmail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedEmail.subject}</h3>
                <p className="text-sm text-slate-500">From {selectedEmail.from_email}</p>
              </div>
              <Badge variant="info">{analysis?.category || "General"}</Badge>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              {selectedEmail.body}
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">AI response preview</p>
              <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-600">
                {aiReplyPreview}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Select an email"
            description="Choose an email from the table to view details."
            icon={<MailIcon className="h-6 w-6" />}
          />
        )}
      </Modal>
    </div>
  );
};

export default Emails;
