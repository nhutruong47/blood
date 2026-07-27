import { useStock } from "@/shared/api/generated/inventory-controller/inventory-controller";
import { Droplet, Activity, Users, AlertTriangle } from "lucide-react";

export function DashboardPage() {
  const { data: stockResponse, isLoading } = useStock();
  const stocks = stockResponse?.data || [];

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
              <h3 className="text-2xl font-bold text-slate-900">
                {stocks.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0)}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <h3 className="text-2xl font-bold text-slate-900">--</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Donors Today</p>
              <h3 className="text-2xl font-bold text-slate-900">--</h3>
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
              <h3 className="text-2xl font-bold text-slate-900">--</h3>
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
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stocks.map((item) => (
                <div key={item.bloodGroup} className="p-4 rounded-lg border border-slate-100 bg-slate-50 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-red-600 mb-1">{item.bloodGroup}</span>
                  <span className="text-sm text-slate-500">{item.totalUnits} Units ({item.totalVolumeMl} ml)</span>
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
