import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  SettingsIcon,
  UsersIcon,
} from "./Icons";
import { ToastProvider } from "./ToastContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Leads", path: "/leads", icon: UsersIcon },
  { label: "Emails", path: "/emails", icon: MailIcon },
  { label: "Templates", path: "/templates", icon: FileTextIcon },
  { label: "Analytics", path: "/analytics", icon: LineChartIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

const Layout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem("automation-company-name") || "Automation Portal"
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SaaS</p>
              <p>{companyName}</p>
            </div>
          </div>
          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={`${item.label}-${item.path}`}
                  to={item.path}
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
          <div className="mt-auto pt-10">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
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
                  {companyName}
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Automation Command Center
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                aria-label="View notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    JD
                  </span>
                  <span className="hidden sm:inline">Jordan Doe</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-lg">
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                    >
                      View profile
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                    >
                      Workspace settings
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
