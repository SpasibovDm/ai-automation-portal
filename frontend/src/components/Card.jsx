import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
