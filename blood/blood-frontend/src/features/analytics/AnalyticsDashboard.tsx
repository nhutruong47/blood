import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Droplet,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Award,
} from "lucide-react";

type Period = "week" | "month" | "quarter" | "year";

interface Metric {
  label: string;
  value: string;
  growth: number;
  icon: typeof Droplet;
  color: "red" | "blue" | "purple" | "orange";
}

const METRICS: Metric[] = [
  {
    label: "Total Donations",
    value: "1,247",
    growth: 12.5,
    icon: Droplet,
    color: "red",
  },
  {
    label: "Active Donors",
    value: "892",
    growth: 8.3,
    icon: Users,
    color: "blue",
  },
  {
    label: "Blood Collected",
    value: "498 L",
    growth: 15.2,
    icon: Activity,
    color: "purple",
  },
  {
    label: "Emergency Requests",
    value: "23",
    growth: -5.1,
    icon: TrendingUp,
    color: "orange",
  },
];

const DONATIONS_OVER_TIME = [
  { month: "Aug", donations: 85 },
  { month: "Sep", donations: 92 },
  { month: "Oct", donations: 110 },
  { month: "Nov", donations: 95 },
  { month: "Dec", donations: 78 },
  { month: "Jan", donations: 102 },
  { month: "Feb", donations: 125 },
  { month: "Mar", donations: 138 },
  { month: "Apr", donations: 156 },
  { month: "May", donations: 142 },
  { month: "Jun", donations: 168 },
  { month: "Jul", donations: 175 },
];

const BLOOD_TYPE_DISTRIBUTION = [
  { type: "O+", count: 320, fill: "#ef4444" },
  { type: "O-", count: 45, fill: "#dc2626" },
  { type: "A+", count: 280, fill: "#3b82f6" },
  { type: "A-", count: 38, fill: "#2563eb" },
  { type: "B+", count: 145, fill: "#a855f7" },
  { type: "B-", count: 22, fill: "#9333ea" },
  { type: "AB+", count: 75, fill: "#14b8a6" },
  { type: "AB-", count: 12, fill: "#0d9488" },
];

const DONATIONS_BY_LOCATION = [
  { location: "HCMC Central", donations: 312 },
  { location: "Hanoi Main", donations: 248 },
  { location: "Da Nang Hub", donations: 185 },
  { location: "Can Tho Center", donations: 142 },
  { location: "Hai Phong Branch", donations: 118 },
  { location: "Bien Hoa Site", donations: 95 },
];

const TOP_CENTERS = [
  { rank: 1, name: "HCMC Central Blood Bank", donations: 312, satisfaction: 98 },
  { rank: 2, name: "Hanoi National Center", donations: 248, satisfaction: 96 },
  { rank: 3, name: "Da Nang Medical Hub", donations: 185, satisfaction: 97 },
  { rank: 4, name: "Can Tho Regional Center", donations: 142, satisfaction: 94 },
  { rank: 5, name: "Hai Phong Branch", donations: 118, satisfaction: 95 },
];

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Track donation activity and performance metrics</p>
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

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donations over time */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Donations over time</h3>
          <p className="text-xs text-slate-500 mb-4">Last 12 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DONATIONS_OVER_TIME} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="donations"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood type distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Blood type distribution</h3>
          <p className="text-xs text-slate-500 mb-4">By units collected</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BLOOD_TYPE_DISTRIBUTION} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {BLOOD_TYPE_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.type} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donations by location (pie) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Donations by location</h3>
          <p className="text-xs text-slate-500 mb-4">Share of total donations</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DONATIONS_BY_LOCATION}
                  dataKey="donations"
                  nameKey="location"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.location.split(" ")[0]}`}
                  labelLine={false}
                >
                  {DONATIONS_BY_LOCATION.map((_, index) => {
                    const palette = ["#dc2626", "#ea580c", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
                    return <Cell key={index} fill={palette[index % palette.length]} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top donation centers (table) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Top donation centers</h3>
          <p className="text-xs text-slate-500 mb-4">By number of donations</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                  <th className="pb-2 font-semibold">Rank</th>
                  <th className="pb-2 font-semibold">Center</th>
                  <th className="pb-2 font-semibold text-right">Donations</th>
                  <th className="pb-2 font-semibold text-right">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {TOP_CENTERS.map((c) => (
                  <tr key={c.rank} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          c.rank === 1
                            ? "bg-yellow-100 text-yellow-700"
                            : c.rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : c.rank === 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {c.rank <= 3 ? <Award className="w-4 h-4" aria-hidden="true" /> : c.rank}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 text-right font-semibold text-slate-700">{c.donations}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {c.satisfaction}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const { icon: Icon, label, value, growth, color } = metric;
  const isPositive = growth >= 0;
  const colorMap: Record<Metric["color"], { bg: string; text: string }> = {
    red: { bg: "bg-red-100", text: "text-red-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} aria-hidden="true" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3" aria-hidden="true" />
          )}
          {isPositive ? "+" : ""}
          {growth}%
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}