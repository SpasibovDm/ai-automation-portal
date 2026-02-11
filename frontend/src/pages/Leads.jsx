import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AIExplanationPanel from "../components/AIExplanationPanel";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import EmptyState from "../components/EmptyState";
import { MailIcon, SearchIcon, UsersIcon } from "../components/Icons";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { getLeadEmails, getLeads, getTemplates, updateLeadStatus } from "../services/api";
import { buildAIExplanation } from "../utils/aiExplainability";

const statusOptions = ["new", "contacted", "qualified", "closed"];
const assignmentOptions = [
  "Unassigned",
  "Revenue Ops",
  "Enterprise AEs",
  "Regional Team",
  "Support Desk",
];
const dateOptions = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const Leads = () => {
  const {
    workspace,
    userRole,
    can,
    getPermissionHint,
    scopeCollection,
    enterpriseMode,
    roleProfile,
  } = useWorkspace();
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
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("contacted");
  const [bulkAssignee, setBulkAssignee] = useState("Revenue Ops");
  const [leadAssignments, setLeadAssignments] = useState({});
  const { addToast } = useToast();

  const canStatusManage = can("update_lead_status");
  const canBulkAssign = userRole === "Owner" || userRole === "Admin";
  const isReadOnly = userRole === "Viewer";

  const emptyState = useMemo(
    () => ({
      title: "No leads in this workspace",
      description: "Connect inbox channels to capture demand and auto-prioritize incoming opportunities.",
      impact: "Without lead capture, high-value prospects can disappear before your team responds.",
    }),
    []
  );

  const loadLeads = async () => {
    try {
      const data = await getLeads();
      const scoped = scopeCollection(data, { min: 1 });
      setLeads(scoped);
      setLeadAssignments((prev) => {
        const next = { ...prev };
        scoped.forEach((lead, index) => {
          if (!next[lead.id]) {
            next[lead.id] = assignmentOptions[(index + 1) % assignmentOptions.length];
          }
        });
        return next;
      });
      setSelectedLeadIds([]);
    } catch (err) {
      setError("Unable to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [scopeCollection, workspace.id]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(scopeCollection(data, { min: 1 }));
      } catch (err) {
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, [scopeCollection, workspace.id]);

  const handleStatusChange = async (leadId, status) => {
    if (!canStatusManage) {
      return;
    }
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

  const handleBulkStatusChange = async () => {
    if (!selectedLeadIds.length || !canStatusManage) {
      return;
    }
    const pendingIds = [...selectedLeadIds];
    const updates = await Promise.all(
      pendingIds.map(async (leadId) => {
        try {
          const updated = await updateLeadStatus(leadId, bulkStatus);
          return updated;
        } catch (err) {
          return null;
        }
      })
    );

    const successful = updates.filter(Boolean);
    if (!successful.length) {
      addToast({
        title: "Bulk status failed",
        description: "No selected leads were updated.",
        variant: "error",
      });
      return;
    }

    const updatesById = new Map(successful.map((item) => [item.id, item]));
    setLeads((prev) => prev.map((lead) => updatesById.get(lead.id) || lead));
    setSelectedLead((prev) => (prev && updatesById.get(prev.id) ? updatesById.get(prev.id) : prev));
    if (selectedLead && updatesById.get(selectedLead.id)) {
      setDrawerStatus(updatesById.get(selectedLead.id).status);
    }

    addToast({
      title: "Bulk status updated",
      description: `${successful.length} leads moved to ${bulkStatus}.`,
    });
  };

  const handleBulkAssign = () => {
    if (!selectedLeadIds.length || !canBulkAssign) {
      return;
    }
    setLeadAssignments((prev) => {
      const next = { ...prev };
      selectedLeadIds.forEach((leadId) => {
        next[leadId] = bulkAssignee;
      });
      return next;
    });
    addToast({
      title: "Bulk assignment applied",
      description: `${selectedLeadIds.length} leads assigned to ${bulkAssignee}.`,
    });
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

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        const search = query.toLowerCase();
        const matchesQuery =
          !search || lead.name.toLowerCase().includes(search) || lead.email.toLowerCase().includes(search);
        const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
        const matchesDate =
          dateFilter === "all" ||
          new Date(lead.created_at) >= new Date(Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000);
        return matchesStatus && matchesQuery && matchesSource && matchesDate;
      }),
    [dateFilter, leads, query, sourceFilter, statusFilter]
  );

  const visibleLeadIds = useMemo(() => filteredLeads.map((lead) => lead.id), [filteredLeads]);
  const selectedVisibleIds = useMemo(
    () => selectedLeadIds.filter((leadId) => visibleLeadIds.includes(leadId)),
    [selectedLeadIds, visibleLeadIds]
  );
  const allVisibleSelected = visibleLeadIds.length > 0 && selectedVisibleIds.length === visibleLeadIds.length;
  const hasSelection = selectedLeadIds.length > 0;

  const roleGuidance = useMemo(() => {
    const profiles = {
      Owner:
        "Owner mode: full control over bulk status updates, assignment, and operational workflow governance.",
      Admin:
        "Admin mode: operational control with bulk actions and assignment for team execution.",
      Agent:
        "Agent mode: can update lead statuses but assignment and governance controls are restricted.",
      Viewer: "Viewer mode: read-only lead visibility for audit and reporting use cases.",
    };
    return profiles[userRole] || profiles.Viewer;
  }, [userRole]);

  const toggleLeadSelection = (leadId) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !visibleLeadIds.includes(id)));
      return;
    }
    setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...visibleLeadIds])));
  };

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

  const selectedLeadExplanation = useMemo(
    () =>
      selectedLead
        ? buildAIExplanation({
            actionType: "lead score",
            subject: selectedLead.name,
            body: selectedLead.message || selectedLead.conversation_summary,
            category: selectedLead.source,
            priority: selectedLead.status === "qualified" ? "high" : "medium",
            baseScore: selectedLead.status === "qualified" ? 78 : 66,
          })
        : null,
    [selectedLead]
  );

  const headCellClass = enterpriseMode
    ? "text-left px-4 py-2 font-medium"
    : "text-left px-6 py-3 font-medium";
  const bodyCellClass = enterpriseMode ? "px-4 py-2.5" : "px-6 py-4";

  return (
    <div className={enterpriseMode ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Leads</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, prioritize, and route inbound opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
          <Badge variant={isReadOnly ? "warning" : "success"}>{roleProfile.scope}</Badge>
          {enterpriseMode ? <Badge variant="default">Enterprise density</Badge> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              placeholder="Search leads"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${enterpriseMode ? "w-36 text-xs" : "w-44 text-sm"} bg-transparent text-slate-600 focus:outline-none dark:text-slate-200`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`rounded-full border border-slate-200 bg-white ${
              enterpriseMode ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
            } text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
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
            className={`rounded-full border border-slate-200 bg-white ${
              enterpriseMode ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
            } text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
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
            className={`rounded-full border border-slate-200 bg-white ${
              enterpriseMode ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
            } text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
          >
            <option value="all">All sources</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{roleGuidance}</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={hasSelection ? "info" : "default"}>
              {hasSelection ? `${selectedLeadIds.length} selected` : "No selection"}
            </Badge>
            {hasSelection ? (
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                className="text-xs text-slate-500 underline underline-offset-2 dark:text-slate-400"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value)}
              disabled={!canStatusManage}
              className={`rounded-lg border border-slate-200 bg-white ${
                enterpriseMode ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
              } text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
              title={!canStatusManage ? getPermissionHint("update_lead_status") : undefined}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              className={enterpriseMode ? "px-3 py-1.5 text-xs" : ""}
              onClick={handleBulkStatusChange}
              disabled={!hasSelection || !canStatusManage}
              title={!canStatusManage ? getPermissionHint("update_lead_status") : undefined}
            >
              Bulk status
            </Button>
            <select
              value={bulkAssignee}
              onChange={(event) => setBulkAssignee(event.target.value)}
              disabled={!canBulkAssign}
              className={`rounded-lg border border-slate-200 bg-white ${
                enterpriseMode ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
              } text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
              title={!canBulkAssign ? "Only Owner/Admin can assign leads in bulk." : undefined}
            >
              {assignmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button
              variant="subtle"
              className={enterpriseMode ? "px-3 py-1.5 text-xs" : ""}
              onClick={handleBulkAssign}
              disabled={!hasSelection || !canBulkAssign}
              title={!canBulkAssign ? "Only Owner/Admin can assign leads in bulk." : undefined}
            >
              Bulk assign
            </Button>
          </div>
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
                <th className={headCellClass}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible leads"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                  />
                </th>
                <th className={headCellClass}>Lead</th>
                <th className={headCellClass}>Status</th>
                <th className={headCellClass}>Source</th>
                <th className={headCellClass}>Last contact</th>
                <th className={headCellClass}>AI template</th>
                <th className={headCellClass}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`border-t border-slate-100 transition hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                      selectedLeadIds.includes(lead.id) ? "bg-indigo-50/70 dark:bg-indigo-500/10" : ""
                    }`}
                    onClick={() => handleViewLead(lead)}
                  >
                    <td className={bodyCellClass}>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${lead.name}`}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                      />
                    </td>
                    <td className={bodyCellClass}>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-white">{lead.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                      </div>
                    </td>
                    <td className={bodyCellClass}>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        <select
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          value={lead.status}
                          disabled={!canStatusManage}
                          title={!canStatusManage ? getPermissionHint("update_lead_status") : undefined}
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
                    <td className={`${bodyCellClass} text-slate-600 dark:text-slate-300`}>
                      <Badge variant="default">{lead.source || "Website"}</Badge>
                    </td>
                    <td className={`${bodyCellClass} text-slate-600 dark:text-slate-300`}>
                      {formatLastContact(lead)}
                    </td>
                    <td className={bodyCellClass}>
                      <Badge variant={templatesLoading ? "warning" : "info"}>
                        {templatesLoading ? "Syncing..." : assignedTemplate(lead)}
                      </Badge>
                    </td>
                    <td className={bodyCellClass}>
                      <select
                        value={leadAssignments[lead.id] || "Unassigned"}
                        disabled={!canBulkAssign}
                        title={!canBulkAssign ? "Only Owner/Admin can assign lead owners." : undefined}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setLeadAssignments((prev) => ({
                            ...prev,
                            [lead.id]: event.target.value,
                          }))
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {assignmentOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8">
                    <EmptyState
                      title={emptyState.title}
                      description={emptyState.description}
                      impact={emptyState.impact}
                      icon={<UsersIcon className="h-6 w-6" />}
                      actionLabel="Open settings"
                      actionTo="/app/settings"
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
                  disabled={!can("update_lead_status")}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  disabled={!can("update_lead_status")}
                  title={
                    !can("update_lead_status")
                      ? getPermissionHint("update_lead_status")
                      : undefined
                  }
                  onClick={() => handleStatusChange(selectedLead.id, drawerStatus)}
                >
                  Save status
                </Button>
                <Link to={`/app/leads/${selectedLead.id}`} className="text-sm text-indigo-600">
                  View full profile
                </Link>
              </div>
              {!can("update_lead_status") ? (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {getPermissionHint("update_lead_status")}
                </p>
              ) : null}
            </div>

            <AIExplanationPanel
              explanation={selectedLeadExplanation}
              title="Why AI scored this lead"
              defaultExpanded
            />

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
                    title="No email history yet"
                    description="Connect inbox sync so every reply is tracked and scored automatically."
                    impact="Message history improves lead scoring and response quality."
                    icon={<MailIcon className="h-6 w-6" />}
                    actionLabel="Open settings"
                    actionTo="/app/settings"
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
