import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { SearchIcon, UsersIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ToastContext";
import { getLeads, updateLeadStatus } from "../services/api";

const statusOptions = ["new", "contacted", "qualified", "closed"];
const dateOptions = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const { addToast } = useToast();

  const emptyState = useMemo(
    () => ({
      title: "No leads yet",
      description: "Install the chat widget or connect a form to start receiving leads.",
    }),
    []
  );

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
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
      addToast({
        title: "Lead updated",
        description: `Status set to ${status}.`,
      });
    } catch (err) {
      addToast({
        title: "Update failed",
        description: "We could not update the lead status.",
        variant: "error",
      });
    }
  };

  const handleViewLead = (lead) => {
    navigate(`/leads/${lead.id}`);
  };

  const sourceOptions = useMemo(() => {
    const sources = leads.map((lead) => lead.source).filter((source) => Boolean(source));
    return Array.from(new Set(sources));
  }, [leads]);

  const extractCompany = (lead) => {
    if (lead?.conversation_summary) {
      const match = lead.conversation_summary.match(/Company:\s*([^|]+)/i);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
    if (lead?.email) {
      const domain = lead.email.split("@")[1];
      if (domain) {
        return domain.split(".")[0].replace(/[-_]/g, " ");
      }
    }
    return "Unknown";
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const search = query.toLowerCase();
    const matchesQuery =
      !search || lead.name.toLowerCase().includes(search) || lead.email.toLowerCase().includes(search);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesDate =
      dateFilter === "all" ||
      new Date(lead.created_at) >= new Date(Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000);
    return matchesStatus && matchesQuery && matchesSource && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-500">Track and triage inbound leads.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-44 bg-transparent text-sm text-slate-600 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
          >
            <option value="all">All sources</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`lead-skeleton-${index}`} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Company</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleViewLead(lead)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                    <td className="px-6 py-4 text-slate-600">{extractCompany(lead)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        <select
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
                          value={lead.status}
                          onChange={(event) => handleStatusChange(lead.id, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <EmptyState
                      title={emptyState.title}
                      description={emptyState.description}
                      icon={<UsersIcon className="h-6 w-6" />}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leads;
