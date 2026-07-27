import { useStock } from "@/shared/api/generated/inventory-controller/inventory-controller";
import { Droplet, Activity, Users, AlertTriangle, Loader2 } from "lucide-react";

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

export function DashboardPage() {
  const { data: stockResponse, isLoading } = useStock();
  // orval wraps: response.data = ApiResponse { success, message, data: StockSummaryResponse[] }
  const stocks = ((stockResponse?.data as any)?.data as any[]) || [];

  const totalUnits = stocks.reduce(
    (acc: number, curr: any) => acc + (curr.quantity || 0),
    0
  );

  const criticalShortages = stocks.filter(
    (s: any) =>
      (s.quantity || 0) < 30 ||
      s.status === "EXPIRED" ||
      s.status === "QUARANTINED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Droplet className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Blood Units</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalUnits}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Stock Entries</p>
              <h3 className="text-2xl font-bold text-slate-900">{stocks.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Available Blood Types</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {new Set(stocks.map((s: any) => s.bloodGroup)).size}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Critical Shortages</p>
              <h3 className="text-2xl font-bold text-slate-900">{criticalShortages}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Inventory Status by Blood Group</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading inventory data...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stocks.map((item: any, idx: number) => (
                <div
                  key={`${item.bloodGroup}-${item.componentType}-${idx}`}
                  className="p-4 rounded-lg border border-slate-100 bg-slate-50 flex flex-col items-center justify-center"
                >
                  <span className="text-xl font-bold text-red-600 mb-1">
                    {BLOOD_GROUP_SHORT[item.bloodGroup] || item.bloodGroup}
                  </span>
                  <span className="text-sm text-slate-500">
                    {item.quantity} Units
                    {item.totalVolumeMl != null && ` (${item.totalVolumeMl} ml)`}
                  </span>
                  {item.componentType && (
                    <span className="text-xs text-slate-400 mt-1">
                      {item.componentType}
                    </span>
                  )}
                </div>
              ))}
              {stocks.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-8">
                  No inventory data available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}