import { useStock } from '@/shared/api/generated/inventory-controller/inventory-controller';
import { Droplet, Loader2 } from 'lucide-react';

const SHORT_BG: Record<string, string> = {
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
};

export function HospitalInventoryView() {
  const { data: stockResponse, isLoading } = useStock();
  const stocks = ((stockResponse?.data as any)?.data as any[]) || [];

  const grouped = stocks.reduce((acc: Record<string, any[]>, item: any) => {
    const bg = SHORT_BG[item.bloodGroup] || item.bloodGroup;
    if (!acc[bg]) acc[bg] = [];
    acc[bg].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nearby Blood Inventory</h1>
        <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
          View All Centers
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : stocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No inventory data available.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([bg, items]) => {
            const total = items.reduce(
              (s: number, i: any) => s + (i.quantity || 0),
              0
            );
            return (
              <div
                key={bg}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-900">{bg}</span>
                    <p className="text-sm text-slate-500">{total} units total</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-500">
                        {item.componentType?.replace('_', ' ')}
                      </span>
                      <span className="font-medium">{item.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}