import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
