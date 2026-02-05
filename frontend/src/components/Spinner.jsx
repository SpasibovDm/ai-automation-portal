import React from "react";

const Spinner = ({ className = "" }) => {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
