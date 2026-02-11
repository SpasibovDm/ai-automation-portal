import React, { useMemo, useState } from "react";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { ShieldIcon, SparklesIcon, ToggleLeftIcon } from "../components/Icons";
import { useToast } from "../components/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";

const storageZones = [
  {
    title: "What data is processed",
    detail:
      "Inbound message content, sender metadata, lead status, reply drafts, and action logs needed to run automation.",
  },
  {
    title: "Where data is stored",
    detail:
      "Operational data is stored in workspace-scoped application storage. Access is role-restricted and logged.",
  },
  {
    title: "How long data is kept",
    detail:
      "Default retention is 12 months for operational messages and 24 months for audit logs, unless your policy requires less.",
  },
  {
    title: "How to export or delete",
    detail:
      "Use the controls below to request export or deletion. The current UI is a safe mock flow for review and validation.",
  },
];

const PrivacyCenter = () => {
  const { addToast } = useToast();
  const { workspace, userRole, consent, updateConsent } = useWorkspace();
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const disclosure = useMemo(
    () => ({
      sees:
        "AI sees email text, subject, sender role, and workflow context needed for scoring, classification, and reply suggestions.",
      doesNotSee:
        "AI does not see payment data, private credentials, or hidden admin-only fields unless explicitly included in message text.",
    }),
    []
  );

  const handleExport = () => {
    setExportOpen(false);
    addToast({
      title: "Export request queued",
      description: "Mock export initiated. In production, a secure download link would be generated.",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setDeleteOpen(false);
      addToast({
        title: "Deletion request recorded",
        description: "Mock deletion request submitted for compliance review.",
      });
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Privacy center</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            GDPR/DSGVO transparency and user control in simple language.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant="info">Role: {userRole}</Badge>
          <Badge variant="success">GDPR mindset</Badge>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">GDPR transparency</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {storageZones.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI usage disclosure</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <p className="font-semibold">What AI sees</p>
            <p className="mt-1">{disclosure.sees}</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            <p className="font-semibold">What AI does not see</p>
            <p className="mt-1">{disclosure.doesNotSee}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <ToggleLeftIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Consent and control</h3>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          AI is assisting - human is in control. You can pause AI support at any time.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">AI assistance</p>
              <button
                type="button"
                onClick={() => updateConsent("aiAssistanceEnabled", !consent.aiAssistanceEnabled)}
                className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                  consent.aiAssistanceEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    consent.aiAssistanceEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {consent.aiAssistanceEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Auto-replies</p>
              <button
                type="button"
                onClick={() => updateConsent("autoRepliesEnabled", !consent.autoRepliesEnabled)}
                className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                  consent.autoRepliesEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    consent.autoRepliesEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {consent.autoRepliesEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Manual override</p>
              <button
                type="button"
                onClick={() => updateConsent("manualOverrideEnabled", !consent.manualOverrideEnabled)}
                className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                  consent.manualOverrideEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    consent.manualOverrideEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {consent.manualOverrideEnabled ? "Human can always override" : "Override requires approval"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Data rights</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Request data export or deletion from this workspace.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setExportOpen(true)}>
            Export my data
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete my data
          </Button>
        </div>
      </section>

      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="Export data request">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            This mock flow will package your workspace records (messages, leads, and audit logs) into a secure export file.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            In production, exports should be encrypted, signed, and delivered through time-limited links.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Confirm export</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete data request">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            Warning: deletion requests can remove lead history, inbox records, and AI audit traces.
          </p>
          <p>
            This is a mock confirmation. In production, deletion should require identity re-check and legal retention validation.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Submitting..." : "Confirm delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacyCenter;
