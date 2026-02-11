import React from "react";

const RoleSelector = ({ roles = [], value, onChange, className = "" }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-xs shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 ${className}`}
    >
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
            role === value
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
