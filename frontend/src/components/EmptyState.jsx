import React from "react";

const EmptyState = ({ title, description, icon }) => {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default EmptyState;
