import { useGetPendingRequests } from "@/shared/api/generated/blood-request-controller/blood-request-controller";
import { Clock, Activity } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  FULFILLED: "bg-blue-100 text-blue-800",
};

const URGENCY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const BLOOD_GROUP_SHORT: Record<string, string> = {
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
};

export function BloodRequestsPage() {
  const { data: response, isLoading, isError } = useGetPendingRequests();
  // orval wraps as { data: ApiResponseListBloodRequestResponse, status }
  // backend returns ApiResponse<List<BloodRequestResponse>> -> response.data is unwrapped body
  // response.data = ApiResponse { success, message, data: BloodRequestResponse[] }
  const requests = ((response?.data as any)?.data as any[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Pending Blood Requests</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">
          New Request
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading requests...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load requests. Please try again.</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Activity className="w-12 h-12 text-slate-300 mb-4" />
            <p>No pending blood requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{req.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                      {BLOOD_GROUP_SHORT[req.bloodGroup] || req.bloodGroup}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          URGENCY_COLORS[req.urgency] || "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {req.quantityUnits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_COLORS[req.status] || "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-slate-400" />
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900 transition-colors">Process</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}