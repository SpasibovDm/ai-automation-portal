import React, { Fragment, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import ChatWidget from "./ChatWidget";
import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  MailIcon,
  MenuIcon,
  MoonIcon,
  SparklesIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SunIcon,
  ToggleLeftIcon,
  UsersIcon,
} from "./Icons";
import { ToastProvider } from "./ToastContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useWorkspace } from "../context/WorkspaceContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboardIcon },
      { label: "AI Agents", path: "/app/agents", icon: BotIcon },
      { label: "Analytics", path: "/app/analytics", icon: LineChartIcon },
      { label: "Workflow Builder", path: "/app/workflows", icon: ToggleLeftIcon },
      { label: "Value Story", path: "/app/pitch-story", icon: SparklesIcon },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Leads", path: "/app/leads", icon: UsersIcon },
      { label: "Emails", path: "/app/emails", icon: MailIcon },
      { label: "Templates", path: "/app/templates", icon: FileTextIcon },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Settings", path: "/app/settings", icon: SettingsIcon },
      { label: "Privacy Center", path: "/app/privacy", icon: ShieldIcon },
      { label: "Audit Logs", path: "/app/audit-logs", icon: ClockIcon },
      { label: "System Status", path: "/app/status", icon: ShieldIcon },
    ],
  },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    workspace,
    userRole,
    consent,
    pitchMode,
    setPitchModeEnabled,
    enterpriseMode,
    setEnterpriseModeEnabled,
    roleProfile,
  } = useWorkspace();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const initials = useMemo(() => {
    const email = user?.email || "JD";
    return email
      .split("@")[0]
      .split(/[.\s_-]+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.email]);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/app/leads/")) {
      return "Lead Details";
    }
    const titles = {
      "/app/dashboard": "Dashboard",
      "/app/agents": "AI Agents",
      "/app/leads": "Leads",
      "/app/emails": "Emails",
      "/app/templates": "Templates",
      "/app/analytics": "Analytics",
      "/app/workflows": "Workflow Builder",
      "/app/pitch-story": "Value Story",
      "/app/settings": "Settings",
      "/app/privacy": "Privacy Center",
      "/app/audit-logs": "Audit Logs",
      "/app/status": "System Status",
    };
    return titles[path] || "Dashboard";
  }, [location.pathname]);

  return (
    <ToastProvider>
      <div
        className={`min-h-screen bg-[var(--bg-app)] text-slate-900 dark:text-slate-100 flex app-shell ${
          theme === "dark" ? "dark-shell" : ""
        } ${enterpriseMode ? "enterprise-mode" : ""}`}
      >
        <div
          className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden ${
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          role="presentation"
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white/90 backdrop-blur transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/80 md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${enterpriseMode ? "p-4" : "p-6"}`}
        >
          <div className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Pipeline OS
              </p>
              <p className="text-base font-semibold">{workspace.name}</p>
            </div>
          </div>
          <nav className={`${enterpriseMode ? "mt-6" : "mt-10"} space-y-6 text-sm`}>
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={`${item.label}-${item.path}`}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-2xl px-4 py-2.5 transition ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-100"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className={`${enterpriseMode ? "mt-5" : "mt-8"} rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300`}>
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              Workspace status
            </p>
            <p className="mt-1">All systems operational | 99.98% uptime</p>
            <button
              type="button"
              onClick={() => navigate("/app/status")}
              className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open status page
            </button>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] dark:border-slate-700 dark:bg-slate-900/70">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Enterprise mode</p>
              <div className="mt-2 flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setEnterpriseModeEnabled(false)}
                  className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                    enterpriseMode
                      ? "text-slate-500 dark:text-slate-400"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setEnterpriseModeEnabled(true)}
                  className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                    enterpriseMode
                      ? "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Enterprise
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-[11px] dark:border-indigo-500/40 dark:bg-indigo-500/10">
              <p className="font-semibold text-indigo-700 dark:text-indigo-200">Pitch mode</p>
              <div className="mt-2 flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setPitchModeEnabled(false)}
                  className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                    pitchMode
                      ? "text-slate-500 dark:text-slate-400"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPitchModeEnabled(true)}
                  className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                    pitchMode
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Pitch
                </button>
              </div>
            </div>
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className={`sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-8 ${
            enterpriseMode ? "py-2.5" : "py-4"
          }`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
                aria-label="Open sidebar"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {workspace.name}
                </p>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {pageTitle}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Revenue automation workspace</span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {userRole}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {roleProfile.scope}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                      consent.aiAssistanceEnabled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {consent.aiAssistanceEnabled
                      ? "AI is assisting - human is in control"
                      : "AI assistance is OFF - manual mode active"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 dark:border-slate-700 dark:bg-slate-900">
                    {consent.manualOverrideEnabled
                      ? "Manual override enabled"
                      : "Manual override restricted"}
                  </span>
                  {pitchMode ? (
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                      Pitch Mode active
                    </span>
                  ) : null}
                  {enterpriseMode ? (
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      Enterprise Mode active
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setEnterpriseModeEnabled(false)}
                  className={`rounded-full px-3 py-1.5 font-semibold transition ${
                    enterpriseMode
                      ? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  }`}
                >
                  Standard UI
                </button>
                <button
                  type="button"
                  onClick={() => setEnterpriseModeEnabled(true)}
                  className={`rounded-full px-3 py-1.5 font-semibold transition ${
                    enterpriseMode
                      ? "bg-slate-700 text-white shadow-sm dark:bg-slate-200 dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Enterprise UI
                </button>
              </div>
              <div className="hidden lg:flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setPitchModeEnabled(false)}
                  className={`rounded-full px-3 py-1.5 font-semibold transition ${
                    pitchMode
                      ? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  }`}
                >
                  Normal Mode
                </button>
                <button
                  type="button"
                  onClick={() => setPitchModeEnabled(true)}
                  className={`rounded-full px-3 py-1.5 font-semibold transition ${
                    pitchMode
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Pitch Mode
                </button>
              </div>
              <WorkspaceSwitcher className="hidden md:block" />
              <div className="relative hidden md:flex items-center">
                <SearchIcon className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="search"
                  placeholder="Search leads, emails, templates"
                  className="w-64 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="View notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500" />
              </button>
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <span className="hidden sm:inline">{user?.email || "Workspace User"}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-2"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-lg focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          View profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/agents")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          AI agents
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/workflows")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          Workflow builder
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/pitch-story")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          Value story
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setEnterpriseModeEnabled(!enterpriseMode)}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          {enterpriseMode ? "Disable enterprise mode" : "Enable enterprise mode"}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setPitchModeEnabled(!pitchMode)}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          {pitchMode ? "Disable pitch mode" : "Enable pitch mode"}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/settings")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          Workspace settings
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/privacy")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          Privacy center
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/audit-logs")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          Audit logs
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => navigate("/app/status")}
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          System status
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={`w-full rounded-lg px-3 py-2 text-left text-rose-600 dark:text-rose-200 ${
                            active ? "bg-rose-50 dark:bg-rose-500/10" : ""
                          }`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </header>
          <main className={`flex-1 ${enterpriseMode ? "px-3 py-4 md:px-6 lg:px-8" : "px-4 py-6 md:px-8 lg:px-10"}`}>
            <div className="animate-fade-in">
              {pitchMode ? (
                <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-xs text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <span className="font-semibold">Pitch Mode:</span> overlays now explain why each feature exists, the problem it solves, and the KPI it improves.
                </div>
              ) : null}
              {enterpriseMode ? (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                  <span className="font-semibold">Enterprise Mode:</span> compact density, reduced motion, and operational layouts optimized for large teams.
                </div>
              ) : null}
              <Outlet />
            </div>
          </main>
        </div>
        <ChatWidget />
      </div>
    </ToastProvider>
  );
};

export default Layout;
