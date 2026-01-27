import React from "react";

const EmptyState = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default EmptyState;
