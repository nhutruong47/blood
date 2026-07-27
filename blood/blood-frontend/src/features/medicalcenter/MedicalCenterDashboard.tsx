import { Users, Droplet, Activity, Calendar } from 'lucide-react';
import { useStock } from '@/shared/api/generated/inventory-controller/inventory-controller';
import { useGetPendingRequests } from '@/shared/api/generated/blood-request-controller/blood-request-controller';

export function MedicalCenterDashboard() {
  const { data: stockResponse, isLoading } = useStock();
  const { data: requestResponse } = useGetPendingRequests();
  const stocks = ((stockResponse?.data as any)?.data as any[]) || [];
  const requests = ((requestResponse?.data as any)?.data as any[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Medical Center Operations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Today's Appointments"
          value="--"
          color="bg-blue-500"
        />
        <StatCard
          icon={<Droplet className="w-6 h-6" />}
          label="Blood Units Collected"
          value={stocks.length.toString()}
          color="bg-red-500"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          label="Pending Lab Tests"
          value={requests.length.toString()}
          color="bg-yellow-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Upcoming Campaigns"
          value="--"
          color="bg-purple-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Donor Check-in Queue</h2>
          <p className="text-slate-500 text-center py-8">No donors checked in yet.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
          {isLoading ? (
            <p className="text-slate-500 text-center py-8">Loading inventory...</p>
          ) : stocks.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No inventory data.</p>
          ) : (
            <ul className="space-y-2">
              {stocks.slice(0, 6).map((s: any, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                >
                  <span className="font-medium">
                    {s.bloodGroup?.replace('_', ' ')}
                  </span>
                  <span className="text-slate-600">{s.quantity} units</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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