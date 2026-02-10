import React from "react";

const variants = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
  secondary:
    "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60",
  subtle:
    "border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-200 dark:hover:bg-indigo-500/10",
  danger:
    "border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-500/10",
};

const Button = ({ children, variant = "primary", className = "", type = "button", ...props }) => {
  const styles = variants[variant] || variants.primary;
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
