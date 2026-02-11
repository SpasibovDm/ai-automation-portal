import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const workspaceStorageKey = "automation-workspace-id";
const consentStoragePrefix = "automation-consent";
const pitchModeStoragePrefix = "automation-pitch-mode";
const enterpriseModeStoragePrefix = "automation-enterprise-mode";

const defaultConsent = {
  aiAssistanceEnabled: true,
  autoRepliesEnabled: true,
  manualOverrideEnabled: true,
};

const workspaceCatalog = [
  {
    id: "northwind",
    name: "Northwind Health",
    avatar: "NH",
    color: "from-indigo-500 to-cyan-500",
    userRole: "Owner",
    metricMultiplier: 1.16,
  },
  {
    id: "brightline",
    name: "Brightline Ops",
    avatar: "BO",
    color: "from-emerald-500 to-cyan-500",
    userRole: "Admin",
    metricMultiplier: 0.92,
  },
  {
    id: "atlas",
    name: "Atlas Ventures",
    avatar: "AV",
    color: "from-amber-500 to-orange-500",
    userRole: "Viewer",
    metricMultiplier: 1.34,
  },
  {
    id: "juniper",
    name: "Juniper Labs",
    avatar: "JL",
    color: "from-violet-500 to-indigo-500",
    userRole: "Agent",
    metricMultiplier: 1.04,
  },
];

const permissionMatrix = {
  Owner: [
    "update_lead_status",
    "regenerate_reply",
    "manage_templates",
    "manage_settings",
    "view_system_status",
    "run_simulator",
  ],
  Admin: [
    "update_lead_status",
    "regenerate_reply",
    "manage_templates",
    "manage_settings",
    "view_system_status",
    "run_simulator",
  ],
  Agent: ["update_lead_status", "regenerate_reply", "view_system_status", "run_simulator"],
  Viewer: ["view_system_status"],
};

const permissionHints = {
  update_lead_status: "Only Owner, Admin, and Agent can change lead stages.",
  regenerate_reply: "Only Owner, Admin, and Agent can regenerate AI replies.",
  manage_templates: "Only Owner and Admin can modify templates.",
  manage_settings: "Only Owner and Admin can edit workspace settings.",
  run_simulator: "Only Owner, Admin, and Agent can run simulation controls.",
  view_system_status: "Status visibility is available to every role.",
};

const roleProfiles = {
  Owner: {
    scope: "Full access",
    description: "Can manage settings, assignments, workflows, and all governance controls.",
  },
  Admin: {
    scope: "Administrative",
    description: "Can manage operations and settings, with broad control over workspace workflows.",
  },
  Agent: {
    scope: "Operational",
    description: "Can execute day-to-day lead and reply actions, without workspace governance changes.",
  },
  Viewer: {
    scope: "Read-only",
    description: "Can review activity and analytics, with no write actions.",
  },
};

const WorkspaceContext = createContext(null);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hashString = (value = "") =>
  value.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

const resolveInitialWorkspaceId = () => {
  if (typeof window === "undefined") {
    return workspaceCatalog[0].id;
  }
  const stored = localStorage.getItem(workspaceStorageKey);
  return workspaceCatalog.some((workspace) => workspace.id === stored)
    ? stored
    : workspaceCatalog[0].id;
};

const readConsent = (workspaceId) => {
  if (typeof window === "undefined") {
    return { ...defaultConsent };
  }
  try {
    const raw = localStorage.getItem(`${consentStoragePrefix}-${workspaceId}`);
    if (!raw) {
      return { ...defaultConsent };
    }
    const parsed = JSON.parse(raw);
    return { ...defaultConsent, ...parsed };
  } catch (err) {
    return { ...defaultConsent };
  }
};

const readPitchMode = (workspaceId) => {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(`${pitchModeStoragePrefix}-${workspaceId}`) === "1";
};

const readEnterpriseMode = (workspaceId) => {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(`${enterpriseModeStoragePrefix}-${workspaceId}`) === "1";
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState(resolveInitialWorkspaceId);
  const [consent, setConsent] = useState(() => readConsent(resolveInitialWorkspaceId()));
  const [pitchMode, setPitchMode] = useState(() => readPitchMode(resolveInitialWorkspaceId()));
  const [enterpriseMode, setEnterpriseMode] = useState(() =>
    readEnterpriseMode(resolveInitialWorkspaceId())
  );

  const workspace =
    workspaceCatalog.find((item) => item.id === workspaceId) || workspaceCatalog[0];

  const switchWorkspace = (nextId) => {
    const candidate = workspaceCatalog.find((item) => item.id === nextId);
    if (!candidate) {
      return;
    }
    setWorkspaceId(candidate.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(workspaceStorageKey, candidate.id);
      window.dispatchEvent(new Event("assistant-workspace-updated"));
    }
  };

  useEffect(() => {
    setConsent(readConsent(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    setPitchMode(readPitchMode(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    setEnterpriseMode(readEnterpriseMode(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(`${consentStoragePrefix}-${workspaceId}`, JSON.stringify(consent));
    window.dispatchEvent(new Event("assistant-consent-updated"));
  }, [consent, workspaceId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(`${pitchModeStoragePrefix}-${workspaceId}`, pitchMode ? "1" : "0");
    window.dispatchEvent(new Event("assistant-pitch-mode-updated"));
  }, [pitchMode, workspaceId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      `${enterpriseModeStoragePrefix}-${workspaceId}`,
      enterpriseMode ? "1" : "0"
    );
    window.dispatchEvent(new Event("assistant-enterprise-mode-updated"));
  }, [enterpriseMode, workspaceId]);

  const updateConsent = (key, value) => {
    setConsent((prev) => ({ ...prev, [key]: value }));
  };

  const setPitchModeEnabled = (enabled) => {
    setPitchMode(Boolean(enabled));
  };

  const setEnterpriseModeEnabled = (enabled) => {
    setEnterpriseMode(Boolean(enabled));
  };

  const roleProfile = roleProfiles[workspace.userRole] || roleProfiles.Viewer;

  const can = (permission) => {
    const rolePermissions = permissionMatrix[workspace.userRole] || [];
    return rolePermissions.includes(permission);
  };

  const getPermissionHint = (permission) =>
    permissionHints[permission] || "This action is limited by your current role.";

  const adjustMetric = (value, { min = 0, max = Number.POSITIVE_INFINITY, decimals = 0 } = {}) => {
    const numeric = Number(value) || 0;
    const adjusted = clamp(numeric * workspace.metricMultiplier, min, max);
    if (decimals > 0) {
      return Number(adjusted.toFixed(decimals));
    }
    return Math.round(adjusted);
  };

  const scopeCollection = (items, { min = 1 } = {}) => {
    if (!Array.isArray(items) || !items.length) {
      return [];
    }
    if (items.length <= 2) {
      return items;
    }
    const seed = hashString(workspace.id);
    const shift = seed % items.length;
    const trim = seed % Math.min(3, items.length - 1);
    const length = Math.max(min, items.length - trim);

    return Array.from({ length }).map((_, index) => {
      const item = items[(index + shift) % items.length];
      return { ...item };
    });
  };

  const value = useMemo(
    () => ({
      workspace,
      workspaceId,
      workspaces: workspaceCatalog,
      userRole: workspace.userRole,
      switchWorkspace,
      can,
      getPermissionHint,
      adjustMetric,
      scopeCollection,
      consent,
      updateConsent,
      pitchMode,
      setPitchModeEnabled,
      enterpriseMode,
      setEnterpriseModeEnabled,
      roleProfile,
    }),
    [consent, enterpriseMode, pitchMode, roleProfile, workspace, workspaceId]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};
