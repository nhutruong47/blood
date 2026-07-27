import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';

const MOCK_LOGS = [
  {
    id: 1,
    actor: 'admin@blood.vn',
    action: 'ORGANIZATION_VERIFIED',
    entity: 'Organization #12',
    timestamp: '2026-07-27T10:15:00Z',
    ip: '10.0.0.1',
  },
  {
    id: 2,
    actor: 'staff@choray.vn',
    action: 'BLOOD_UNIT_DISPATCHED',
    entity: 'BloodUnit #445',
    timestamp: '2026-07-27T09:45:00Z',
    ip: '10.0.0.5',
  },
  {
    id: 3,
    actor: 'system',
    action: 'INVENTORY_RESERVED',
    entity: 'BloodRequest #89',
    timestamp: '2026-07-27T09:30:00Z',
    ip: 'internal',
  },
];

const ACTION_COLORS: Record<string, string> = {
  ORGANIZATION_VERIFIED: 'bg-green-100 text-green-700',
  BLOOD_UNIT_DISPATCHED: 'bg-blue-100 text-blue-700',
  INVENTORY_RESERVED: 'bg-purple-100 text-purple-700',
};

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [logs] = useState(MOCK_LOGS);

  const filtered = logs.filter(
    log =>
      log.actor.includes(search) ||
      log.action.includes(search) ||
      log.entity.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by actor, action, or entity..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map(log => (
            <div
              key={log.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-sm text-slate-600">{log.entity}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                  <span>By: {log.actor}</span>
                  <span>IP: {log.ip}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">No logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}