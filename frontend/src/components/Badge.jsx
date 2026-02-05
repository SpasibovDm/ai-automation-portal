import React from "react";

const stylesByVariant = {
  default: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-indigo-100 bg-indigo-50 text-indigo-600",
  success: "border-emerald-100 bg-emerald-50 text-emerald-600",
  warning: "border-amber-100 bg-amber-50 text-amber-600",
  danger: "border-rose-100 bg-rose-50 text-rose-600",
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const styles = stylesByVariant[variant] || stylesByVariant.default;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
