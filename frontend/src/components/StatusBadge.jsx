import React from "react";

const statusStyles = {
  new: "bg-blue-50 text-blue-700 border-blue-100",
  processed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  failed: "bg-rose-50 text-rose-700 border-rose-100",
  contacted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  qualified: "bg-sky-50 text-sky-700 border-sky-100",
  won: "bg-emerald-50 text-emerald-700 border-emerald-100",
  lost: "bg-rose-50 text-rose-700 border-rose-100",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-100",
  queued: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-rose-50 text-rose-700 border-rose-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
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
