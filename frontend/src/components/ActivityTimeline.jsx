import React, { useMemo, useState } from "react";

import EmptyState from "./EmptyState";
import {
  BotIcon,
  ClockIcon,
  MessageSquareIcon,
  SendIcon,
  ToggleLeftIcon,
  UserPlusIcon,
} from "./Icons";

const eventMeta = {
  lead_created: {
    label: "Lead created",
    icon: UserPlusIcon,
    tone: "bg-sky-50 text-sky-700 border-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
  },
  ai_scored_lead: {
    label: "AI scored lead",
    icon: BotIcon,
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200",
  },
  ai_suggested_reply: {
    label: "AI suggested reply",
    icon: MessageSquareIcon,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  human_edited_reply: {
    label: "Human edited reply",
    icon: ToggleLeftIcon,
    tone: "bg-amber-50 text-amber-700 border-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  },
  message_sent: {
    label: "Message sent",
    icon: SendIcon,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  status_changed: {
    label: "Status changed",
    icon: ClockIcon,
    tone: "bg-slate-100 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
};

const relativeTime = (timestamp) => {
  const parsed = new Date(timestamp).getTime();
  if (Number.isNaN(parsed)) {
    return "just now";
  }
  const seconds = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const ActivityTimeline = ({ events = [] }) => {
  const [filter, setFilter] = useState("all");

  const eventTypes = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.type)));
    return ["all", ...unique];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const items =
      filter === "all" ? events : events.filter((event) => event.type === filter);
    return [...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [events, filter]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Activity timeline
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Every AI and human action is logged for transparency.
          </p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All events" : eventMeta[type]?.label || type}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length ? (
        <div className="mt-5 space-y-4">
          {filteredEvents.map((event, index) => {
            const meta = eventMeta[event.type] || eventMeta.status_changed;
            const Icon = meta.icon;
            return (
              <div key={`${event.type}-${event.timestamp}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${meta.tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {index !== filteredEvents.length - 1 ? (
                    <span className="mt-1 h-full w-px bg-slate-200 dark:bg-slate-700" />
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="font-semibold text-slate-900 dark:text-white">{meta.label}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{event.detail}</p>
                  <p className="mt-1 text-slate-400 dark:text-slate-500">
                    {relativeTime(event.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="No timeline events"
            description="AI and human actions will appear here once a lead enters the workflow."
            icon={<ClockIcon className="h-6 w-6" />}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
