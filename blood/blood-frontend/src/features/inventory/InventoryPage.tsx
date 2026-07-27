import { useMemo } from "react";
import {
  Droplet,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useStock } from "@/shared/api/generated/inventory-controller/inventory-controller";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { BLOOD_GROUP_SHORT } from "@/shared/components/BloodTypeBadge";
import { formatDateTime } from "@/shared/utils/format";

const ALL_BLOOD_TYPES = [
  "O_POSITIVE",
  "O_NEGATIVE",
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
];

const ALL_COMPONENTS = [
  "WHOLE_BLOOD",
  "RBC",
  "PLASMA",
  "PLATELET",
  "FFP",
] as const;

const COMPONENT_LABEL: Record<string, string> = {
  WHOLE_BLOOD: "Whole Blood",
  RBC: "RBC",
  PLASMA: "Plasma",
  PLATELET: "Platelet",
  FFP: "FFP",
  CRYOPRECIPITATE: "Cryo",
};

// Ideal target per blood type (target stock level for "100%")
const TARGET_PER_BG: Record<string, number> = {
  O_POSITIVE: 100,
  O_NEGATIVE: 50,
  A_POSITIVE: 80,
  A_NEGATIVE: 40,
  B_POSITIVE: 60,
  B_NEGATIVE: 30,
  AB_POSITIVE: 40,
  AB_NEGATIVE: 20,
};

function stockStatusColor(pct: number): { bar: string; text: string; badge: string; label: string } {
  if (pct >= 50) {
    return {
      bar: "bg-green-500",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700 border-green-200",
      label: "Adequate",
    };
  }
  if (pct >= 20) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Low",
    };
  }
  return {
    bar: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border-red-200",
    label: "Critical",
  };
}

export function InventoryPage() {
  const { data: response, isLoading, isError, refetch, dataUpdatedAt } = useStock();
  const stocks = ((response?.data as any)?.data as Array<any>) || [];

  const inventoryByBloodGroup = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    ALL_BLOOD_TYPES.forEach((bg) => {
      result[bg] = {};
      ALL_COMPONENTS.forEach((c) => {
        result[bg][c] = 0;
      });
    });
    stocks.forEach((s) => {
      if (!s.bloodGroup || !s.componentType) return;
      const comp = (s.componentType as string).toUpperCase();
      const bg = (s.bloodGroup as string).toUpperCase();
      if (result[bg] && comp in result[bg]) {
        result[bg][comp] = (result[bg][comp] || 0) + (Number(s.quantity) || 0);
      }
    });
    return result;
  }, [stocks]);

  const summary = useMemo(() => {
    let totalUnits = 0;
    let critical = 0;
    let low = 0;
    let adequate = 0;
    ALL_BLOOD_TYPES.forEach((bg) => {
      const total = ALL_COMPONENTS.reduce((sum, c) => sum + (inventoryByBloodGroup[bg][c] || 0), 0);
      const target = TARGET_PER_BG[bg] || 50;
      const pct = (total / target) * 100;
      totalUnits += total;
      if (pct < 20) critical++;
      else if (pct < 50) low++;
      else adequate++;
    });
    return { totalUnits, critical, low, adequate };
  }, [inventoryByBloodGroup]);

  const handleRefresh = () => {
    refetch();
    toast.success("Refreshing inventory");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blood Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Last updated: {dataUpdatedAt ? formatDateTime(new Date(dataUpdatedAt)) : "Never"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Failed to load inventory. Please try again.
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Units"
          value={summary.totalUnits.toLocaleString()}
          icon={Droplet}
          color="red"
        />
        <SummaryCard
          label="Adequate"
          value={summary.adequate.toString()}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Low Stock"
          value={summary.low.toString()}
          icon={TrendingDown}
          color="amber"
        />
        <SummaryCard
          label="Critical"
          value={summary.critical.toString()}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Inventory cards */}
      {isLoading ? (
        <LoadingSkeleton variant="card" rows={8} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_BLOOD_TYPES.map((bg) => {
            const total = ALL_COMPONENTS.reduce(
              (sum, c) => sum + (inventoryByBloodGroup[bg][c] || 0),
              0
            );
            const target = TARGET_PER_BG[bg] || 50;
            const pct = Math.min(100, (total / target) * 100);
            const status = stockStatusColor((total / target) * 100);

            return (
              <article
                key={bg}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                aria-label={`${BLOOD_GROUP_SHORT[bg]} blood inventory`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-red-700 font-bold text-lg">
                        {BLOOD_GROUP_SHORT[bg]}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{total}</p>
                      <p className="text-xs text-slate-500">units available</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.badge}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Stock level</span>
                    <span className={`font-semibold ${status.text}`}>{Math.round(pct)}%</span>
                  </div>
                  <div
                    className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`${status.bar} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Target: {target} units</p>
                </div>

                {/* Component breakdown */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {ALL_COMPONENTS.map((c) => {
                    const qty = inventoryByBloodGroup[bg][c] || 0;
                    return (
                      <div key={c} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{COMPONENT_LABEL[c]}</span>
                        <span className={`font-semibold ${qty === 0 ? "text-slate-300" : "text-slate-700"}`}>
                          {qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Stock Level Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-slate-600">Adequate (≥ 50% of target)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="text-slate-600">Low (20–50% of target)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-slate-600">Critical (&lt; 20% of target)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: typeof Droplet;
  color: "red" | "green" | "amber";
}

function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    red: { bg: "bg-red-100", text: "text-red-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}