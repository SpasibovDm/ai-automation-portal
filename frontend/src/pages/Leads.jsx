import React, { useEffect, useMemo, useState } from "react";

import EmptyState from "../components/EmptyState";
import { SearchIcon, UsersIcon } from "../components/Icons";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ToastContext";
import { getLeadEmails, getLeads, updateLeadStatus } from "../services/api";

const statusOptions = ["new", "contacted", "qualified", "won", "lost"];
const dateOptions = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadEmails, setLeadEmails] = useState([]);
  const [emailLoading, setEmailLoading] = useState(false);
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
      });
    }
  };

  const handleViewLead = async (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
    setEmailLoading(true);
    try {
      const emails = await getLeadEmails(lead.id);
      setLeadEmails(emails);
    } catch (err) {
      setLeadEmails([]);
    } finally {
      setEmailLoading(false);
    }
  };

  const sourceOptions = useMemo(() => {
    const sources = leads
      .map((lead) => lead.source)
      .filter((source) => Boolean(source));
    return Array.from(new Set(sources));
  }, [leads]);

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const search = query.toLowerCase();
    const matchesQuery =
      !search ||
      lead.name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesDate =
      dateFilter === "all" ||
      new Date(lead.created_at) >=
        new Date(Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000);
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
                <th className="text-left px-6 py-3 font-medium">Source</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Created</th>
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
                    <td className="px-6 py-4 text-slate-600">
                      {lead.source || "Unknown"}
                    </td>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lead details"
      >
        {selectedLead ? (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Contact</p>
                <p className="mt-1 font-medium text-slate-900">{selectedLead.name}</p>
                <p className="text-sm">{selectedLead.email}</p>
                {selectedLead.phone ? (
                  <p className="text-sm text-slate-500">{selectedLead.phone}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Status</p>
                <div className="mt-2">
                  <StatusBadge status={selectedLead.status} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400">Source</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedLead.source || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Created</p>
                <p className="mt-1 font-medium text-slate-900">
                  {new Date(selectedLead.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Preferred language</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedLead.preferred_language || "Not specified"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">AI summary</p>
              <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                {selectedLead.conversation_summary ||
                  selectedLead.message ||
                  "No conversation summary available yet."}
              </p>
            </div>
            {selectedLead.message ? (
              <div>
                <p className="text-xs uppercase text-slate-400">Lead message</p>
                <p className="mt-2 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                  {selectedLead.message}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs uppercase text-slate-400">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedLead.tags?.length ? (
                  selectedLead.tags.map((tag) => (
                    <span
                      key={`${selectedLead.id}-${tag}`}
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No tags yet.</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Email history</p>
              <div className="mt-2 space-y-3">
                {emailLoading ? (
                  <Skeleton className="h-20" />
                ) : leadEmails.length ? (
                  leadEmails.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {email.subject}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(email.received_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{email.preview}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No related emails yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Notes</p>
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={4}
                placeholder="Add internal notes or next steps..."
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Leads;
