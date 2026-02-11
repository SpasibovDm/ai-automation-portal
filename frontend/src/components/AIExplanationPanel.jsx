import React, { useState } from "react";

import Badge from "./Badge";
import { ChevronDownIcon, SparklesIcon } from "./Icons";

const levelVariant = {
  High: "success",
  Medium: "warning",
  Low: "danger",
};

const AIExplanationPanel = ({
  explanation,
  title = "Why AI chose this",
  defaultExpanded = false,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!explanation) {
    return null;
  }

  const confidenceVariant = levelVariant[explanation?.confidence?.level] || "warning";

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${className}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            AI explanation
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{explanation.reason}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={confidenceVariant}>
            {explanation.confidence.level} confidence {explanation.confidence.score}%
          </Badge>
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition dark:border-slate-700 dark:text-slate-300 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </div>
      </button>

      {expanded ? (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            <p className="flex items-center gap-2 font-semibold">
              <SparklesIcon className="h-4 w-4" />
              Human-readable explanation
            </p>
            <p className="mt-1">{explanation.summary}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {explanation.signals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{signal.label}</p>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
                      aria-label={`Explain ${signal.label}`}
                    >
                      ?
                      <span className="pointer-events-none absolute -top-2 right-6 z-20 hidden w-48 rounded-lg border border-slate-200 bg-white px-2 py-1 text-left text-[11px] text-slate-600 shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {signal.hint}
                      </span>
                    </button>
                  </span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{signal.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIExplanationPanel;
