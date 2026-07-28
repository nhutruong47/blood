import { AlertTriangle, MapPin, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useGetPendingRequests } from '@/shared/api/generated/blood-request-controller/blood-request-controller';

const STATUS_COLORS: Record<string, string> = {
  MATCHING_DONOR: 'bg-orange-100 text-orange-700',
  RESERVED: 'bg-green-100 text-green-700',
  DISPATCHING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUBMITTED: 'bg-slate-100 text-slate-700',
  FULFILLED: 'bg-teal-100 text-teal-700',
};

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-slate-400 text-white',
};

export function EmergencyConsole() {
  const { data, isLoading, isError, refetch } = useGetPendingRequests({
    query: { refetchInterval: 15_000 },
  });

  const emergencies: any[] = (data?.data as any)?.data ?? [];
  const active = emergencies.filter(e => e.status !== 'DELIVERED' && e.status !== 'FULFILLED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Emergency Console</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {active.length} Active
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Loading active emergencies…
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          Failed to load emergency queue.
        </div>
      ) : emergencies.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No active emergencies!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emergencies.map((em: any) => (
            <div
              key={em.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                    {em.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '\n')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${URGENCY_COLORS[em.urgency] ?? 'bg-slate-300 text-slate-700'}`}
                      >
                        {em.urgency}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[em.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {em.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>{em.quantityUnits} units needed</span>
                      {em.medicalCenter && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {em.medicalCenterName ?? em.medicalCenter?.firstName ?? 'Medical center'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Clock className="w-3 h-3" />
                    {em.createdAt
                      ? new Date(em.createdAt).toLocaleTimeString()
                      : '—'}
                  </div>
                  <p className="text-xs text-slate-400">ID: #{em.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
