import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Leads", path: "/leads" },
  { label: "Emails", path: "/emails" },
  { label: "Templates", path: "/templates" },
  { label: "Settings", path: "/settings" },
];

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-900">
      <aside className="w-64 bg-slate-950 text-white p-6 flex flex-col border-r border-white/10">
        <div className="text-xl font-semibold mb-10">
          <span className="block text-sm uppercase tracking-widest text-slate-400">SaaS</span>
          Automation Portal
        </div>
        <nav className="flex-1 space-y-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
        >
          Sign out
        </button>
      </aside>
      <div className="flex-1 flex flex-col bg-slate-50">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Workspace overview</p>
            <h1 className="text-lg font-semibold text-slate-900">Automation Command Center</h1>
          </div>
          <div className="text-sm text-slate-500">Multi-tenant secure workspace</div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
