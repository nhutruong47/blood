import { useState } from "react";
import { Users, Droplet, Activity, HeartPulse } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "@/shared/api/admin-api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Period = "week" | "month" | "quarter" | "year";

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("month");

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
  });

  const chartData = summary?.donationsByMonth
    ? Object.entries(summary.donationsByMonth).map(([month, count]) => ({
        month,
        donations: count,
      }))
    : [];

  return (
    <div className="space-y-6">
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

      {isLoading ? (
        <div className="flex justify-center py-12 text-slate-500">Loading analytics data...</div>
      ) : isError || !summary ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">Failed to load analytics data.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users />} title="Total Users" value={summary.totalUsers} color="blue" />
            <StatCard icon={<Activity />} title="Total Donations" value={summary.totalDonations} color="green" />
            <StatCard icon={<Droplet />} title="Total Blood Units" value={summary.totalBloodUnits} color="red" />
            <StatCard icon={<HeartPulse />} title="Total Requests" value={summary.totalRequests} color="purple" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-6">Donations Over Time</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="donations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}