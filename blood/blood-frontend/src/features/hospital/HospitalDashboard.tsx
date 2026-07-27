import { Activity, CheckCircle, Clock } from 'lucide-react';
import { useGetPendingRequests } from '@/shared/api/generated/blood-request-controller/blood-request-controller';

export function HospitalDashboard() {
  const { data: response } = useGetPendingRequests();
  const requests = ((response?.data as any)?.data as any[]) || [];
  const fulfilledToday = requests.filter(
    (r: any) => r.status === 'FULFILLED'
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hospital Blood Bank Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span className="font-semibold">Pending Requests</span>
          </div>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Fulfilled Today</span>
          </div>
          <p className="text-3xl font-bold">{fulfilledToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="font-semibold">Avg. Response Time</span>
          </div>
          <p className="text-3xl font-bold">--</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Blood Requests</h2>
          <a
            href="/hospital/request"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            New Request
          </a>
        </div>
        {requests.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No requests yet. Create your first blood request.
          </p>
        ) : (
          <ul className="space-y-2">
            {requests.slice(0, 5).map((r: any) => (
              <li
                key={r.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="font-medium">#{r.id}</span>
                <span>{r.bloodGroup?.replace('_', ' ')}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}