import { useState } from 'react';
import {
  Droplet,
  Users,
  Activity,
  TrendingUp,
} from 'lucide-react';

const MOCK_METRICS = {
  totalDonations: 1247,
  donationsGrowth: 12.5,
  activeDonors: 892,
  donorsGrowth: 8.3,
  bloodCollected: 498800,
  unitsGrowth: 15.2,
  emergencyRequests: 23,
  emergencyGrowth: -5.1,
  avgResponseTime: 42,
};

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState('month');

  const metrics = [
    {
      label: 'Total Donations',
      value: MOCK_METRICS.totalDonations.toLocaleString(),
      growth: MOCK_METRICS.donationsGrowth,
      icon: Droplet,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: 'Active Donors',
      value: MOCK_METRICS.activeDonors.toLocaleString(),
      growth: MOCK_METRICS.donorsGrowth,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Blood Collected (ml)',
      value: (MOCK_METRICS.bloodCollected / 1000).toFixed(0) + 'L',
      growth: MOCK_METRICS.unitsGrowth,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Emergency Requests',
      value: MOCK_METRICS.emergencyRequests.toString(),
      growth: MOCK_METRICS.emergencyGrowth,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 3 months</option>
          <option value="year">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const isPositive = m.growth >= 0;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${m.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isPositive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {m.growth}%
                </span>
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-sm text-slate-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Blood Type Distribution</h3>
          <div className="space-y-3">
            {[
              { bg: 'O+', pct: 40, color: 'bg-red-500' },
              { bg: 'A+', pct: 32, color: 'bg-blue-500' },
              { bg: 'B+', pct: 15, color: 'bg-purple-500' },
              { bg: 'AB+', pct: 8, color: 'bg-teal-500' },
              { bg: 'O-', pct: 3, color: 'bg-red-400' },
              { bg: 'A-', pct: 2, color: 'bg-blue-400' },
            ].map(item => (
              <div key={item.bg} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium">{item.bg}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-10">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Donations Over Time</h3>
          <div className="flex items-end justify-between h-40 px-4">
            {[65, 72, 58, 80, 75, 88, 92].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-8 bg-red-500 rounded-t"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-slate-400">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}