import { useState } from "react";
import { AlertTriangle, BarChart3 } from "lucide-react";

type Period = "week" | "month" | "quarter" | "year";

// Analytics aggregates are not yet exposed over HTTP. The chart and table
// scaffolding is preserved so the page can drop in real data as soon as
// GET /api/analytics/* is implemented.

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Analytics API pending</p>
          <p>
            The dashboard previously showed hardcoded numbers. It now renders
            an honest empty state until
            <code className="px-1 bg-amber-100 rounded ml-1">
              GET /api/analytics/summary
            </code>
            and the related aggregations are added to the backend.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track donation activity and performance metrics
          </p>
        </div>
        <div>
          <label htmlFor="period-select" className="sr-only">
            Time period
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No analytics data yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Charts and KPIs will populate automatically once the analytics
          endpoint goes live.
        </p>
      </div>
    </div>
  );
}