import React, { useEffect, useState } from "react";

import { getLeads, updateLead } from "../services/api";

const statusOptions = ["new", "contacted", "closed"];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError("Unable to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (leadId, status) => {
    const updated = await updateLead(leadId, { status });
    setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-500">Track and triage inbound leads.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading leads...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Tags</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                  <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                  <td className="px-6 py-4">
                    {lead.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag) => (
                          <span
                            key={`${lead.id}-${tag}`}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No tags</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
                      value={lead.status}
                      onChange={(event) => handleStatusChange(lead.id, event.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leads;
