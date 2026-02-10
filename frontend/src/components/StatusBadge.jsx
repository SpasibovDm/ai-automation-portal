import React from "react";

const statusStyles = {
  new: "bg-blue-50 text-blue-700 border-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200",
  processed:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  replied:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  pending:
    "bg-amber-50 text-amber-700 border-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  contacted:
    "bg-indigo-50 text-indigo-700 border-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200",
  qualified:
    "bg-sky-50 text-sky-700 border-sky-100 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  lost: "bg-rose-50 text-rose-700 border-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  closed:
    "bg-slate-100 text-slate-600 border-slate-200 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  queued:
    "bg-amber-50 text-amber-700 border-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  medium:
    "bg-amber-50 text-amber-700 border-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
};

const StatusBadge = ({ status = "new", label, className = "" }) => {
  const normalized = status?.toLowerCase() || "new";
  const styles = statusStyles[normalized] || statusStyles.new;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles} ${className}`}
    >
      {label || normalized}
    </span>
  );
};

export default StatusBadge;
