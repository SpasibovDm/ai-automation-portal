import React, { useEffect, useState } from "react";

import { getEmails } from "../services/api";

const Emails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await getEmails();
        setEmails(data);
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Incoming emails</h2>
          <p className="text-sm text-slate-500">Monitor inquiries captured via email hooks.</p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-slate-500">Loading emails...</div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{email.subject}</h3>
                  <p className="text-sm text-slate-500">From: {email.from_email}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(email.received_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">{email.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Emails;
