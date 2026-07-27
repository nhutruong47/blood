import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const MOCK_QUEUE = [
  { id: 1, name: 'Nguyen Van A', bloodType: 'O+', time: '09:00', status: 'pending' },
  { id: 2, name: 'Tran Thi B', bloodType: 'A+', time: '09:30', status: 'checked_in' },
  { id: 3, name: 'Le Van C', bloodType: 'B+', time: '10:00', status: 'pending' },
];

export function DailyOperationsBoard() {
  const [queue, setQueue] = useState(MOCK_QUEUE);

  const checkIn = (id: number) => {
    setQueue(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'checked_in' } : p))
    );
  };

  const approve = (id: number) => {
    setQueue(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'approved' } : p))
    );
  };

  const defer = (id: number) => {
    setQueue(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'deferred' } : p))
    );
  };

  const stats = {
    total: queue.length,
    checkedIn: queue.filter(q => q.status === 'checked_in').length,
    approved: queue.filter(q => q.status === 'approved').length,
    deferred: queue.filter(q => q.status === 'deferred').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Operations Board</h1>

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
          {queue.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No donors in queue.</div>
          ) : (
            queue.map(donor => (
              <div
                key={donor.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
                    {donor.bloodType}
                  </div>
                  <div>
                    <p className="font-medium">{donor.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {donor.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {donor.status === 'pending' && (
                    <button
                      onClick={() => checkIn(donor.id)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      Check In
                    </button>
                  )}
                  {donor.status === 'checked_in' && (
                    <>
                      <button
                        onClick={() => approve(donor.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => defer(donor.id)}
                        className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                      >
                        Defer
                      </button>
                    </>
                  )}
                  {donor.status === 'approved' && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Approved
                    </span>
                  )}
                  {donor.status === 'deferred' && (
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Deferred
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}