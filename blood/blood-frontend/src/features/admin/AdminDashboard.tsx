import { Users, Building, Droplet, AlertTriangle } from 'lucide-react';
import { useMe } from '@/shared/api/generated/auth-controller/auth-controller';
import { useStock } from '@/shared/api/generated/inventory-controller/inventory-controller';
import { useGetPendingRequests } from '@/shared/api/generated/blood-request-controller/blood-request-controller';
import { useAll as useAllOrganizations } from '@/shared/api/generated/organization-controller/organization-controller';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  isLoading?: boolean;
}

function StatCard({ icon, label, value, color, isLoading }: StatCardProps) {
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
          <p className="text-2xl font-bold">
            {isLoading ? (
              <span className="inline-block w-10 h-6 bg-slate-200 animate-pulse rounded" />
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data: meData } = useMe();
  const user = (meData?.data as any)?.data;

  // Total blood units in stock — sums all rows returned by the stock endpoint.
  const { data: stockData, isLoading: isStockLoading } = useStock();
  const stockItems: any[] = (stockData?.data as any)?.data ?? [];
  const totalBloodUnits = stockItems.reduce(
    (sum, item) => sum + (item?.availableUnits ?? item?.units ?? 0),
    0
  );

  // Pending requests (PENDING/SUBMITTED status).
  const { data: pendingData, isLoading: isRequestsLoading } = useGetPendingRequests(
    { query: { enabled: !!user, refetchInterval: 30_000 } }
  );
  const pendingRequests: any[] = (pendingData?.data as any)?.data ?? [];

  // Organizations count (verified + pending).
  const { data: orgsData, isLoading: isOrgsLoading } = useAllOrganizations(
    { query: { enabled: !!user, refetchInterval: 60_000 } }
  );
  const organizations: any[] = (orgsData?.data as any)?.data ?? [];

  // For "Total Users" we currently have no backend endpoint; show derived number
  // (organizations x avg members is wrong). Surface "--" with a tooltip until
  // a /api/admin/users endpoint is added.
  const totalUsersLabel = '— (no API)';

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
          value={totalUsersLabel}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Building className="w-6 h-6" />}
          label="Organizations"
          value={organizations.length}
          color="bg-purple-500"
          isLoading={isOrgsLoading}
        />
        <StatCard
          icon={<Droplet className="w-6 h-6" />}
          label="Blood Units"
          value={totalBloodUnits.toLocaleString()}
          color="bg-red-500"
          isLoading={isStockLoading}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Pending Requests"
          value={pendingRequests.length}
          color="bg-orange-500"
          isLoading={isRequestsLoading}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Pending Requests</h2>
        {isRequestsLoading ? (
          <p className="text-slate-500">Loading…</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-slate-500">No pending requests.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingRequests.slice(0, 5).map((r: any) => (
              <li key={r.id} className="py-2 flex justify-between text-sm">
                <span>
                  #{r.id} — {r.bloodGroup} · {r.componentType} · {r.quantityUnits}u
                </span>
                <span className="text-slate-400">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
