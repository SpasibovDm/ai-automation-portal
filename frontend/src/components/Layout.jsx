import React, { Fragment, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import ChatWidget from "./ChatWidget";
import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  MailIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
} from "./Icons";
import { ToastProvider } from "./ToastContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
      { label: "Analytics", path: "/analytics", icon: LineChartIcon },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Leads", path: "/leads", icon: UsersIcon },
      { label: "Emails", path: "/emails", icon: MailIcon },
      { label: "Templates", path: "/templates", icon: FileTextIcon },
    ],
  },
  {
    title: "Admin",
    items: [{ label: "Settings", path: "/settings", icon: SettingsIcon }],
  },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem("automation-company-name") || "Automation Portal"
  );

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  useEffect(() => {
    const handleUpdate = () => {
      setCompanyName(
        localStorage.getItem("automation-company-name") || "Automation Portal"
      );
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("assistant-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("assistant-settings-updated", handleUpdate);
    };
  }, []);

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
    if (path.startsWith("/leads/")) {
      return "Lead Details";
    }
    const titles = {
      "/dashboard": "Dashboard",
      "/leads": "Leads",
      "/emails": "Emails",
      "/templates": "Templates",
      "/analytics": "Analytics",
      "/settings": "Settings",
    };
    return titles[path] || "Dashboard";
  }, [location.pathname]);

  return (
    <ToastProvider>
      <div
        className={`min-h-screen bg-[var(--bg-app)] text-slate-900 dark:text-slate-100 flex app-shell ${
          theme === "dark" ? "dark-shell" : ""
        }`}
      >
        <div
          className={`fixed inset-0 z-40 bg-slate-900/50 transition-opacity md:hidden ${
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          role="presentation"
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white/90 p-6 backdrop-blur transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/80 md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Pipeline OS
              </p>
              <p className="text-base font-semibold">{companyName}</p>
            </div>
          </div>
          <nav className="mt-10 space-y-6 text-sm">
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
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <p className="font-semibold text-slate-700 dark:text-slate-100">
              Workspace status
            </p>
            <p className="mt-1">All systems operational · 99.98% uptime</p>
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
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
                  {companyName}
                </p>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {pageTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revenue automation workspace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
          <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">
            <div className="animate-fade-in">
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
