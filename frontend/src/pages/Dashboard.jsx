import React, { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import { getDashboardStats } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    leads_today: 0,
    emails_today: 0,
    replies_sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Snapshot of incoming business activity.</p>
        </div>
      </div>
      {loading ? (
        <div className="text-slate-500">Loading metrics...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={stats.total_leads} />
          <StatCard label="Leads today" value={stats.leads_today} />
          <StatCard label="Emails today" value={stats.emails_today} />
          <StatCard label="Replies sent" value={stats.replies_sent} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
