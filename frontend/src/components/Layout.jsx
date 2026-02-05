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
  LogOutIcon,
  MailIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "./Icons";
import { ToastProvider } from "./ToastContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Leads", path: "/leads", icon: UsersIcon },
  { label: "Emails", path: "/emails", icon: MailIcon },
  { label: "Templates", path: "/templates", icon: FileTextIcon },
  { label: "Analytics", path: "/analytics", icon: LineChartIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
  { label: "Logout", path: "/logout", icon: LogOutIcon, action: "logout" },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex app-shell">
        <div
          className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity md:hidden ${
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          role="presentation"
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white p-6 transition-transform duration-300 md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Automation Portal</p>
              <p>{companyName}</p>
            </div>
          </div>
          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.action === "logout") {
                return (
                  <button
                    key={`${item.label}-${item.path}`}
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              }
              return (
                <NavLink
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Open sidebar"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  AI Automation Portal
                </p>
                <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
                <p className="text-xs text-slate-500">{companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <SearchIcon className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search leads, emails, templates"
                  className="w-64 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <button
                type="button"
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                aria-label="View notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500" />
              </button>
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-lg focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={`w-full rounded-lg px-3 py-2 text-left ${
                            active ? "bg-slate-100" : ""
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
                            active ? "bg-slate-100" : ""
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
                          className={`w-full rounded-lg px-3 py-2 text-left text-rose-600 ${
                            active ? "bg-rose-50" : ""
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
