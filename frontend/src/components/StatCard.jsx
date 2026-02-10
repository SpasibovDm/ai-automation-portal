import React from "react";

const StatCard = ({ label, value, icon, helper, trend }) => {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
          {icon}
        </div>
      </div>
      {(helper || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{helper}</span>
          {trend && (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
