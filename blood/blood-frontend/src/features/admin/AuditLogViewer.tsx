import { useState } from 'react';
import { Search, Download, Filter, AlertCircle } from 'lucide-react';

// NOTE: This page previously displayed hardcoded mock audit data. The backend
// does not yet expose a /api/admin/audit-logs endpoint (see the audit module's
// AuditEvent repository). Until the endpoint is implemented we render an empty
// state with a developer-facing banner so the page does not mislead users.

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [logs] = useState<any[]>([]);

  const filtered = logs.filter(
    log =>
      log.actor?.includes(search) ||
      log.action?.includes(search) ||
      log.entity?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm opacity-60 cursor-not-allowed"
          title="Export will be enabled once audit-log endpoint is live"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Audit log endpoint pending</p>
          <p>
            The backend exposes audit data via the internal AuditEvent repository
            but does not yet publish it over HTTP. This page will populate
            automatically once <code className="px-1 bg-amber-100 rounded">GET /api/admin/audit-logs</code> is added.
          </p>
        </div>
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
              disabled
            />
          </div>
          <button
            disabled
            className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-sm opacity-60 cursor-not-allowed"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No logs to display yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
