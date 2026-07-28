import { useMemo, useState } from 'react';
import { Search, Download, Filter, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AdminAuditEvent } from '@/shared/api/admin-api';

const ACTION_COLORS: Record<string, string> = {
  ORGANIZATION_VERIFIED: 'bg-green-100 text-green-700',
  ORGANIZATION_REJECTED: 'bg-red-100 text-red-700',
  ORGANIZATION_SUSPENDED: 'bg-orange-100 text-orange-700',
  INVENTORY_RESERVED: 'bg-purple-100 text-purple-700',
  INVENTORY_RELEASED: 'bg-blue-100 text-blue-700',
  EMERGENCY_ALERT: 'bg-red-100 text-red-700',
  LOGIN: 'bg-slate-100 text-slate-700',
  LOGOUT: 'bg-slate-100 text-slate-700',
};

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => getAuditLogs(200),
    refetchInterval: 30_000,
  });
  const logs: AdminAuditEvent[] = data ?? [];

  const filtered = useMemo(
    () =>
      logs.filter(log => {
        const q = search.toLowerCase();
        return (
          (log.actorRole ?? '').toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.entityType.toLowerCase().includes(q) ||
          (log.entityId ?? '').toLowerCase().includes(q)
        );
      }),
    [logs, search]
  );

  const exportCsv = () => {
    const header = ['id', 'actor', 'action', 'entityType', 'entityId', 'reason', 'ipAddress', 'createdAt'];
    const rows = filtered.map(l => [
      l.id,
      l.actorId ?? '',
      l.action,
      l.entityType,
      l.entityId,
      (l.reason ?? '').replace(/"/g, '""'),
      l.ipAddress ?? '',
      l.createdAt,
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50"
        >
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
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading && (
            <div className="p-8 text-center text-slate-500 inline-flex gap-2 items-center justify-center w-full">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading audit logs…
            </div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-600">
              Could not load audit logs. Please retry.
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">No logs found.</div>
          )}
          {!isLoading && !isError && filtered.map(log => (
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
                  <span className="text-sm text-slate-600">
                    {log.entityType} #{log.entityId}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                  <span>By: {log.actorRole ?? 'system'} #{log.actorId ?? '—'}</span>
                  {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                {log.reason && (
                  <p className="text-xs text-slate-500 mt-1">“{log.reason}”</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}