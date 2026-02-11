import React from "react";
import { Link } from "react-router-dom";

const EmptyState = ({
  title,
  description,
  icon,
  impact,
  actionLabel,
  actionTo,
  onAction,
  actionDisabled = false,
  actionHint = "",
}) => {
  const actionClass =
    "mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sky-100/70 blur-2xl dark:bg-sky-500/20" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {impact ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{impact}</p> : null}

      {actionLabel && actionTo ? (
        <Link to={actionTo} className={actionClass}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className={actionClass}
          title={actionDisabled ? actionHint : undefined}
        >
          {actionLabel}
        </button>
      ) : null}
      {actionDisabled && actionHint ? (
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{actionHint}</p>
      ) : null}
    </div>
  );
};

export default EmptyState;
