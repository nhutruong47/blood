import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

// The daily-queue endpoint is not yet published by the backend. Until the
// medical-center controller exposes today's queue we render an honest empty
// state with a developer-facing banner so the page does not mislead users.

export function DailyOperationsBoard() {
  const queue: any[] = [];

  const stats = {
    total: queue.length,
    checkedIn: 0,
    approved: 0,
    deferred: 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Operations Board</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Today's queue endpoint pending</p>
          <p>
            The medical-center daily-queue API is not yet exposed. The check-in /
            approve / defer actions are stubbed and will activate once
            <code className="px-1 bg-amber-100 rounded ml-1">
              GET /api/medical-center/queue/today
            </code>
            is implemented.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold">Donor Queue</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {queue.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No donors in queue today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}