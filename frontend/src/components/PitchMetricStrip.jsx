import React from "react";

const PitchMetricStrip = ({ metrics = [], className = "" }) => {
  if (!metrics.length) {
    return null;
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {metric.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
          {metric.detail ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default PitchMetricStrip;
