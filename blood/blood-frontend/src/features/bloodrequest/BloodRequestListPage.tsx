import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useGetPendingRequests } from "@/shared/api/generated/blood-request-controller/blood-request-controller";
import { BloodTypeBadge, BLOOD_GROUP_SHORT } from "@/shared/components/BloodTypeBadge";
import { UrgencyBadge } from "@/shared/components/UrgencyBadge";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatDate } from "@/shared/utils/format";

type SortKey = "date" | "urgency";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  TRIAGED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  MATCHING_DONOR: "bg-purple-100 text-purple-800 border-purple-200",
  RESERVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  FULFILLED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

const URGENCY_RANK: Record<string, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  ROUTINE: 2,
};

const ALL_BLOOD_TYPES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const PAGE_SIZE = 10;

export function BloodRequestListPage() {
  const { data: response, isLoading, isError } = useGetPendingRequests();
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const requests = ((response?.data as any)?.data as Array<any>) || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (urgencyFilter !== "ALL" && r.urgency !== urgencyFilter) return false;
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (bloodTypeFilter !== "ALL" && r.bloodGroup !== bloodTypeFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        const created = r.createdAt ? new Date(r.createdAt) : null;
        if (created && created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        const created = r.createdAt ? new Date(r.createdAt) : null;
        if (created && created > to) return false;
      }
      if (q) {
        const recipient = (r.recipientInfo || "").toLowerCase();
        const id = String(r.id || "");
        if (!recipient.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [requests, search, urgencyFilter, statusFilter, bloodTypeFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortBy === "date") {
      copy.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
    } else {
      copy.sort((a, b) => {
        const ar = URGENCY_RANK[a.urgency] ?? 99;
        const br = URGENCY_RANK[b.urgency] ?? 99;
        return ar - br;
      });
    }
    return copy;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setUrgencyFilter("ALL");
    setStatusFilter("ALL");
    setBloodTypeFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  };

  if (isError) toast.error("Failed to load blood requests");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blood Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {sorted.length} of {requests.length} request{requests.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
            <label htmlFor="req-search" className="sr-only">
              Search requests
            </label>
            <input
              id="req-search"
              type="text"
              placeholder="Search by hospital or request ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="date">Sort: Newest</option>
            <option value="urgency">Sort: Urgency</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters ? "bg-red-50 border-red-200 text-red-700" : "border-slate-300 hover:bg-slate-50"
            }`}
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label htmlFor="urgency" className="block text-xs font-medium text-slate-700 mb-1">
                Urgency
              </label>
              <select
                id="urgency"
                value={urgencyFilter}
                onChange={(e) => {
                  setUrgencyFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="ALL">All</option>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="ALL">All</option>
                {Object.keys(STATUS_COLORS).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="blood-type" className="block text-xs font-medium text-slate-700 mb-1">
                Blood type
              </label>
              <select
                id="blood-type"
                value={bloodTypeFilter}
                onChange={(e) => {
                  setBloodTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="ALL">All</option>
                {ALL_BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {BLOOD_GROUP_SHORT[bt] || bt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date-from" className="block text-xs font-medium text-slate-700 mb-1">
                Date from
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label htmlFor="date-to" className="block text-xs font-medium text-slate-700 mb-1">
                Date to
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No blood requests found"
          description="Try adjusting your filters or search query."
          action={
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paged.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                        #{req.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <BloodTypeBadge bloodGroup={req.bloodGroup} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {(req.componentType || "").replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {req.quantityUnits}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <UrgencyBadge urgency={req.urgency} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            STATUS_COLORS[req.status] || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {(req.status || "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={req.recipientInfo}>
                        {req.recipientInfo || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                          aria-label={`View details for request ${req.id}`}
                          onClick={() => toast.info(`Viewing details for request #${req.id}`)}
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}