import React, { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import { getDashboardStats } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    new_leads: 0,
    emails_received: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
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
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Total leads" value={stats.total_leads} />
          <StatCard label="New leads" value={stats.new_leads} />
          <StatCard label="Emails received" value={stats.emails_received} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
