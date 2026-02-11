import React, { useMemo, useState } from "react";

import Badge from "./Badge";
import StatusBadge from "./StatusBadge";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const tonePreset = (tone) => {
  if (tone >= 70) {
    return "professional";
  }
  if (tone <= 35) {
    return "friendly";
  }
  return "balanced";
};

const DecisionSimulator = ({
  baseScore = 72,
  leadName = "Lead",
  company = "the company",
  onApply,
  disabled = false,
}) => {
  const [tone, setTone] = useState(68);
  const [strictness, setStrictness] = useState(58);
  const [urgency, setUrgency] = useState(64);

  const simulation = useMemo(() => {
    const score = clamp(
      Math.round(baseScore + (urgency - 50) * 0.28 + (strictness - 50) * 0.14 - (tone - 50) * 0.1),
      1,
      99
    );

    const priority = score >= 85 ? "high" : score >= 62 ? "medium" : "low";
    const toneMode = tonePreset(tone);

    const opener =
      toneMode === "professional"
        ? `Thanks for the detailed context, ${leadName}.`
        : toneMode === "friendly"
        ? `Great question, ${leadName}. Happy to help.`
        : `Thanks for reaching out, ${leadName}.`;

    const commitment =
      strictness >= 70
        ? "We can proceed once we confirm scope, timeline, and security requirements."
        : strictness <= 35
        ? "We can adapt quickly and iterate as we learn more."
        : "We can align on scope and next steps in a short call.";

    const urgencyLine =
      urgency >= 70
        ? "Given your timeline, we recommend a same-day onboarding plan."
        : urgency <= 35
        ? "We can schedule this for your next planning cycle."
        : "We can start this week with a focused rollout.";

    return {
      score,
      priority,
      reply: `${opener} ${commitment} ${urgencyLine} I can send a tailored proposal for ${company} today.`,
    };
  }, [baseScore, company, leadName, strictness, tone, urgency]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            What-if simulator
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            Control AI behavior before applying it
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Adjust tone, strictness, and urgency to preview lead score, priority, and reply output.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Frontend only</Badge>
          <StatusBadge status={simulation.priority} label={`${simulation.priority} priority`} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Tone ({tone})</span>
          <input
            type="range"
            min="0"
            max="100"
            value={tone}
            onChange={(event) => setTone(Number(event.target.value))}
            className="w-full accent-indigo-600"
          />
        </label>
        <label className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Strictness ({strictness})</span>
          <input
            type="range"
            min="0"
            max="100"
            value={strictness}
            onChange={(event) => setStrictness(Number(event.target.value))}
            className="w-full accent-indigo-600"
          />
        </label>
        <label className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Urgency ({urgency})</span>
          <input
            type="range"
            min="0"
            max="100"
            value={urgency}
            onChange={(event) => setUrgency(Number(event.target.value))}
            className="w-full accent-indigo-600"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-slate-500 dark:text-slate-400">Simulated lead score</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{simulation.score}</p>
          <p className="text-slate-500 dark:text-slate-400">Base score {baseScore}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
          <p className="font-semibold">Suggested reply preview</p>
          <p className="mt-1">{simulation.reply}</p>
        </div>
      </div>

      {onApply ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onApply(simulation)}
            disabled={disabled}
            title={disabled ? "Your role cannot apply simulator output." : "Apply simulator output"}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Apply to draft
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DecisionSimulator;
