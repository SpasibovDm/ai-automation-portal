import React from "react";

import { LineChartIcon, SparklesIcon } from "./Icons";

const PitchCallout = ({
  feature,
  problem,
  kpi,
  impact,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 text-xs text-indigo-900 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100 ${className}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-200/60 blur-2xl dark:bg-indigo-400/20" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
            <SparklesIcon className="h-3.5 w-3.5" />
            Pitch overlay
          </div>
          <LineChartIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <p>
            <span className="font-semibold">Why this exists:</span> {feature}
          </p>
          <p>
            <span className="font-semibold">Business problem:</span> {problem}
          </p>
          <p>
            <span className="font-semibold">KPI improved:</span> {kpi}
          </p>
          <p>
            <span className="font-semibold">Value signal:</span> {impact}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PitchCallout;
