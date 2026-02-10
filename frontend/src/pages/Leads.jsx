import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import EmptyState from "../components/EmptyState";
import { MailIcon, SearchIcon, UsersIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ToastContext";
import { getLeadEmails, getLeads, getTemplates, updateLeadStatus } from "../services/api";

const statusOptions = ["new", "contacted", "qualified", "closed"];
const dateOptions = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEmails, setDrawerEmails] = useState([]);
  const [drawerEmailsLoading, setDrawerEmailsLoading] = useState(false);
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

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleStatusChange = async (leadId, status) => {
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)));
      setSelectedLead((prev) => (prev?.id === updated.id ? updated : prev));
      setDrawerStatus(updated.status);
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
    setSelectedLead(lead);
    setDrawerStatus(lead.status);
    setDrawerOpen(true);
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

  const formatLastContact = (lead) => {
    if (!lead?.created_at) {
      return "Unknown";
    }
    return new Date(lead.created_at).toLocaleDateString();
  };

  const assignedTemplate = (lead) => {
    if (!templates.length) {
      return "Not assigned";
    }
    const source = (lead?.source || "").toLowerCase();
    const matched = templates.find((template) =>
      (template.category || "").toLowerCase().includes(source)
    );
    return matched?.name || templates[0]?.name || "Default template";
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

  useEffect(() => {
    if (!selectedLead) {
      setDrawerEmails([]);
      return;
    }
    setDrawerStatus(selectedLead.status);
    const loadLeadEmails = async () => {
      setDrawerEmailsLoading(true);
      try {
        const emails = await getLeadEmails(selectedLead.id);
        setDrawerEmails(emails);
      } catch (err) {
        setDrawerEmails([]);
      } finally {
        setDrawerEmailsLoading(false);
      }
    };
    loadLeadEmails();
  }, [selectedLead]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Leads</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, prioritize, and route inbound opportunities.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              placeholder="Search leads"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-44 bg-transparent text-sm text-slate-600 focus:outline-none dark:text-slate-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
      <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden dark:border-slate-800 dark:bg-slate-900/80">
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
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Lead</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Source</th>
                <th className="text-left px-6 py-3 font-medium">Last contact</th>
                <th className="text-left px-6 py-3 font-medium">AI template</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800/60"
                    onClick={() => handleViewLead(lead)}
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lead.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        <select
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <Badge variant="default">{lead.source || "Website"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatLastContact(lead)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={templatesLoading ? "warning" : "info"}>
                        {templatesLoading ? "Syncing..." : assignedTemplate(lead)}
                      </Badge>
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
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedLead ? selectedLead.name : "Lead details"}
      >
        {selectedLead ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Contact
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedLead.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {selectedLead.email}
                  </p>
                  {selectedLead.phone ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedLead.phone}
                    </p>
                  ) : null}
                </div>
                <Badge variant="info">{extractCompany(selectedLead)}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Badge variant="default">{selectedLead.source || "Website"}</Badge>
                <Badge variant="default">{formatLastContact(selectedLead)}</Badge>
                <Badge variant="default">{assignedTemplate(selectedLead)}</Badge>
              </div>
              {selectedLead.message ? (
                <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                  {selectedLead.message}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Lead status
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Move this lead through the pipeline.
                  </p>
                </div>
                <StatusBadge status={selectedLead.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  value={drawerStatus}
                  onChange={(event) => setDrawerStatus(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange(selectedLead.id, drawerStatus)}
                >
                  Save status
                </Button>
                <Link to={`/app/leads/${selectedLead.id}`} className="text-sm text-indigo-600">
                  View full profile
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400 dark:text-slate-500">
                    Recent emails
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Latest communication with this lead.
                  </p>
                </div>
                <MailIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="mt-4 space-y-3">
                {drawerEmailsLoading ? (
                  <Skeleton className="h-16" />
                ) : drawerEmails.length ? (
                  drawerEmails.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {email.subject}
                        </p>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(email.received_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {email.preview}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No email history"
                    description="This lead has not replied by email yet."
                    icon={<MailIcon className="h-6 w-6" />}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default Leads;
