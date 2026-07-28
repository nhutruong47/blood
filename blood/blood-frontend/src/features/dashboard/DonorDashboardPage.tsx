import { Link } from "react-router-dom";
import {
  Droplet,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Bell,
  Settings,
} from "lucide-react";
import { useMe } from "@/shared/api/generated/auth-controller/auth-controller";
import { useStock } from "@/shared/api/generated/inventory-controller/inventory-controller";

// Realtime donor dashboard. Pulls the authenticated user from /api/me and the
// live stock summary from /api/inventory/stock. Donation history, badges and
// appointments endpoints are not yet exposed — those surfaces render an empty
// state with a clear "no data yet" message instead of fabricated numbers.

const formatBloodGroup = (group?: string) => {
  if (!group) return "—";
  return group.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
};

export function DonorDashboardPage() {
  const { data: meData, isLoading: isMeLoading } = useMe();
  const { data: stockData, isLoading: isStockLoading } = useStock({
    query: { refetchInterval: 60_000 },
  });

  const user = (meData?.data as any)?.data;
  const stock: any[] = (stockData?.data as any)?.data ?? [];

  if (isMeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500">Loading your dashboard…</p>
      </div>
    );
  }

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "Donor";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome back, {displayName}!</h1>
                <p className="text-red-100 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Blood Type: {formatBloodGroup(user?.bloodGroup)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
              </Link>
              <Link to="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Settings className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/eligibility"
                  className="flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Check Eligibility</p>
                    <p className="text-sm text-slate-600">Quick health check</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/centers"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Find Centers</p>
                    <p className="text-sm text-slate-600">Nearby locations</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/book"
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Book Appointment</p>
                    <p className="text-sm text-slate-600">Schedule donation</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">View History</p>
                    <p className="text-sm text-slate-600">Your donations</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
              </div>
            </section>

            {/* Upcoming Appointment placeholder */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Upcoming Appointment</h2>
              </div>
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No upcoming appointments</p>
                <Link
                  to="/centers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </section>

            {/* Blood Inventory Status — real /api/inventory/stock */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Blood Inventory Status</h2>
              <p className="text-sm text-slate-600 mb-4">
                Current supply levels. Your donations make a difference!
              </p>
              {isStockLoading ? (
                <p className="text-slate-500 text-sm">Loading inventory…</p>
              ) : stock.length === 0 ? (
                <p className="text-slate-500 text-sm">No inventory data yet.</p>
              ) : (
                <div className="space-y-3">
                  {stock.slice(0, 6).map((blood: any) => {
                    const bg = formatBloodGroup(blood.bloodGroup);
                    const units = blood.availableUnits ?? blood.units ?? 0;
                    const status = (units < 30 ? 'critical' : units < 60 ? 'low' : units < 100 ? 'moderate' : 'good');
                    return (
                      <div key={blood.bloodGroup} className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                            bg.endsWith('-') ? 'bg-red-600' : 'bg-red-500'
                          }`}
                        >
                          {bg}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900">{bg} Units</span>
                            <span className="text-sm text-slate-600">{units} units</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'critical'
                                  ? 'bg-red-600'
                                  : status === 'low'
                                  ? 'bg-orange-500'
                                  : status === 'moderate'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((units / 150) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3">Donation History</h3>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Clock className="w-5 h-5" />
                <span>Donation history endpoint not yet published.</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3">Your Badges</h3>
              <p className="text-slate-500 text-sm">No badges earned yet — your first donation will unlock them.</p>
            </div>

            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Emergency Alert</h3>
              </div>
              <p className="text-sm text-red-100 mb-4">
                Critical shortages change weekly. If your blood type is in high
                demand you will receive an emergency alert here.
              </p>
              <Link
                to="/emergency"
                className="block w-full text-center px-4 py-2 bg-white text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export unused icons so they remain available if the page is later extended.
export { Droplet, Heart, Award };
