import { Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueueToday } from '@/shared/api/admin-api';

export function DailyOperationsBoard() {
  const { data: queueData, isLoading, isError } = useQuery({
    queryKey: ['medicalCenter', 'queueToday'],
    queryFn: () => getQueueToday(),
    refetchInterval: 30000,
  });

  const queue: any[] = queueData?.rows ?? [];

  const stats = {
    total: queueData?.total ?? 0,
    checkedIn: queueData?.checkedIn ?? 0,
    approved: queueData?.approved ?? 0,
    deferred: queueData?.deferred ?? 0,
    completed: queueData?.completed ?? 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Operations Board</h1>

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading today's queue...
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">Failed to load operations data.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Users className="w-4 h-4" /> <span className="text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Clock className="w-4 h-4" /> <span className="text-sm">Checked In</span>
              </div>
              <p className="text-2xl font-bold">{stats.checkedIn}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <CheckCircle className="w-4 h-4" /> <span className="text-sm">Approved</span>
              </div>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <XCircle className="w-4 h-4" /> <span className="text-sm">Deferred</span>
              </div>
              <p className="text-2xl font-bold">{stats.deferred}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-purple-500 mb-1">
                <CheckCircle className="w-4 h-4" /> <span className="text-sm">Completed</span>
              </div>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold">Donor Queue</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {queue.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No donors in queue today.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {queue.map((row: any) => (
                    <li key={row.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Donor #{row.donor?.id} ({row.bloodGroup})</p>
                        <p className="text-sm text-slate-500">Center: {row.medicalCenterName || 'Unknown'}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}