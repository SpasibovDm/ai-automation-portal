import { useEffect, useState } from "react";

const roleStorageKey = "automation-role";
const defaultRoles = ["Sales", "Support", "Founder"];

export const useRolePreference = (storageKey = roleStorageKey) => {
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") {
      return defaultRoles[0];
    }
    return localStorage.getItem(storageKey) || defaultRoles[0];
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(storageKey, role);
    window.dispatchEvent(new Event("assistant-role-updated"));
  }, [role, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handler = () => {
      setRole(localStorage.getItem(storageKey) || defaultRoles[0]);
    };
    window.addEventListener("assistant-role-updated", handler);
    return () => window.removeEventListener("assistant-role-updated", handler);
  }, [storageKey]);

  return { role, setRole, roles: defaultRoles };
};
