import React from "react";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary: "border border-slate-200 text-slate-600 hover:bg-slate-100",
  subtle: "border border-indigo-200 text-indigo-600 hover:bg-indigo-50",
  danger: "border border-rose-200 text-rose-600 hover:bg-rose-50",
};

const Button = ({ children, variant = "primary", className = "", type = "button", ...props }) => {
  const styles = variants[variant] || variants.primary;
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
