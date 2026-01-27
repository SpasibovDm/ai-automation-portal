import React from "react";

import EmptyState from "../components/EmptyState";
import { LineChartIcon } from "../components/Icons";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">
          Deep insights into email performance and lead conversion.
        </p>
      </div>
      <EmptyState
        title="Analytics coming soon"
        description="Connect more data sources to unlock performance trends."
        icon={<LineChartIcon className="h-6 w-6" />}
      />
    </div>
  );
};

export default Analytics;
