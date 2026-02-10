import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const getId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = "success" }) => {
      const id = getId();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex w-80 flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg animate-slide-up ${
              toast.variant === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
                : "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
            }`}
          >
            <p className="font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {toast.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
