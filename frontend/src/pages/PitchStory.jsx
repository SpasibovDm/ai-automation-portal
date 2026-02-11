import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import Badge from "../components/Badge";
import PitchCallout from "../components/PitchCallout";
import PitchMetricStrip from "../components/PitchMetricStrip";
import { BotIcon, LineChartIcon, MailIcon, SparklesIcon } from "../components/Icons";
import { useWorkspace } from "../context/WorkspaceContext";

const comparisonRows = [
  {
    dimension: "Lead response speed",
    before: "Hours of delay. High-intent leads cool down before first touch.",
    after: "AI triage and suggested replies in under 5 minutes.",
  },
  {
    dimension: "Pipeline visibility",
    before: "Manual spreadsheets and incomplete status updates.",
    after: "Live pipeline board with explainable scores and confidence.",
  },
  {
    dimension: "Team efficiency",
    before: "Repetitive writing and manual routing consumes top talent.",
    after: "Auto-routing and draft generation saves 3-5 minutes per conversation.",
  },
  {
    dimension: "Risk and trust",
    before: "Little traceability on who changed what and when.",
    after: "Audit trails, role visibility, and explicit AI-human control states.",
  },
];

const manualFlow = [
  "Inbox fills up",
  "Manager triages manually",
  "Agent drafts from scratch",
  "Follow-up gets delayed",
  "Revenue leaks from slow response",
];

const automatedFlow = [
  "Inbound message captured",
  "AI scores intent + urgency",
  "AI suggests policy-safe reply",
  "Human approves or edits",
  "Lead moves forward with faster conversion",
];

const PitchStory = () => {
  const { workspace, adjustMetric, pitchMode } = useWorkspace();

  const storyMetrics = useMemo(() => {
    const hoursSaved = adjustMetric(186, { min: 90 });
    const revenueInfluenced = adjustMetric(540000, { min: 180000 });
    const conversionUplift = Math.max(8, Math.min(29, adjustMetric(14, { min: 8, max: 29 })));
    const burnReduction = Math.max(5, Math.min(24, adjustMetric(11, { min: 5, max: 24 })));

    return [
      {
        label: "Hours saved",
        value: `${hoursSaved}h / month`,
        detail: "Operational time returned to sales and support teams.",
      },
      {
        label: "Revenue influenced",
        value: `$${revenueInfluenced.toLocaleString()}`,
        detail: "Qualified pipeline touched by AI triage and response workflows.",
      },
      {
        label: "Conversion uplift",
        value: `+${conversionUplift}%`,
        detail: "Improvement in lead-to-opportunity movement after automation.",
      },
      {
        label: "Burn reduction",
        value: `-${burnReduction}%`,
        detail: "Lower operational burn from reduced manual inbox processing.",
      },
    ];
  }, [adjustMetric]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            How this system makes companies money
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            One-page product story for buyers, operators, and leadership.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{workspace.name}</Badge>
          <Badge variant={pitchMode ? "success" : "warning"}>{pitchMode ? "Pitch Mode ON" : "Normal mode"}</Badge>
        </div>
      </div>

      <PitchCallout
        feature="Unified AI automation for inbound demand, reply quality, and team speed."
        problem="Leads and support conversations are lost when triage and response are manual."
        kpi="Response time, conversion rate, and operating burn."
        impact="Value compounds: faster first touch, cleaner funnel, lower cost-to-serve."
      />

      <PitchMetricStrip metrics={storyMetrics} />

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Before / After comparison</h3>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Dimension</th>
                <th className="px-4 py-3 text-left font-semibold">Before</th>
                <th className="px-4 py-3 text-left font-semibold">After</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.dimension} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{row.dimension}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.before}</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-6 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10">
          <div className="flex items-center gap-2">
            <MailIcon className="h-5 w-5 text-rose-600 dark:text-rose-200" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Manual workflow</h3>
          </div>
          <div className="mt-4 space-y-3">
            {manualFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-200 bg-white text-xs font-semibold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Automated workflow</h3>
          </div>
          <div className="mt-4 space-y-3">
            {automatedFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 bg-white text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Visual flow diagram</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Demand capture to revenue influence in one governed system.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">1. Capture</p>
            <p className="mt-1">Inbound emails, forms, and channel events enter one queue.</p>
          </div>
          <div className="hidden items-center justify-center text-xl text-slate-300 md:flex">→</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">2. Understand</p>
            <p className="mt-1">AI scores intent, urgency, and next best action with confidence labels.</p>
          </div>
          <div className="hidden items-center justify-center text-xl text-slate-300 md:flex">→</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">3. Act</p>
            <p className="mt-1">AI drafts replies; humans approve, edit, or override based on policy.</p>
          </div>
          <div className="hidden items-center justify-center text-xl text-slate-300 md:flex">→</div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
            <p className="font-semibold">4. Monetize</p>
            <p className="mt-1">Faster response and cleaner prioritization produce conversion and margin gains.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Take this into a live demo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Show buyers the same workflow with real-time inbox and explainability controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/dashboard"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open dashboard
            </Link>
            <Link
              to="/app/emails"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Show AI replies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PitchStory;
