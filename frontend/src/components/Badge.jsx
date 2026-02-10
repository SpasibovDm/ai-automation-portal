import React from "react";

const stylesByVariant = {
  default:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200",
  info:
    "border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning:
    "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  danger:
    "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const styles = stylesByVariant[variant] || stylesByVariant.default;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
