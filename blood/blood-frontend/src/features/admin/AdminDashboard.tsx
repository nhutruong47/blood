import { Users, Building, Droplet, AlertTriangle } from 'lucide-react';
import { useMe } from '@/shared/api/generated/auth-controller/auth-controller';

export function AdminDashboard() {
  const { data } = useMe();
  const user = (data?.data as any)?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <span className="text-sm text-slate-500">
          Welcome, {user?.firstName} {user?.lastName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value="--"
          color="bg-blue-500"
        />
        <StatCard
          icon={<Building className="w-6 h-6" />}
          label="Organizations"
          value="--"
          color="bg-purple-500"
        />
        <StatCard
          icon={<Droplet className="w-6 h-6" />}
          label="Blood Units"
          value="--"
          color="bg-red-500"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Pending Requests"
          value="--"
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Organization Approval Queue</h2>
        <p className="text-slate-500">No pending organizations to review.</p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}